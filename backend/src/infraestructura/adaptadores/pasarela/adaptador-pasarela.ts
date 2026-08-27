import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { ok, err, Result } from 'neverthrow';
import { 
  ServicioPasarelaPagoPuerto, 
  ParametrosTransaccionPasarela, 
  RespuestaPasarela 
} from '../../../dominio/puertos/servicio-pasarela-pago.puerto';

@Injectable()
export class AdaptadorPasarela implements ServicioPasarelaPagoPuerto {
  private readonly baseUrl = process.env.WOMPI_SANDBOX_URL || 'https://api-sandbox.co.uat.wompi.dev/v1';
  private readonly llavePrivada = process.env.WOMPI_PRV_KEY || 'prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg';
  private readonly secretoIntegridad = process.env.WOMPI_INTEGRITY_KEY || 'stagtest_integrity_nAlBuqayW70XpUqJS4qf4STYilSd89Fp';

  private generarFirmaIntegridad(referencia: string, montoEnCentavos: number, moneda: string): string {
    const cadena = `${referencia}${montoEnCentavos}${moneda}${this.secretoIntegridad}`;
    return crypto.createHash('sha256').update(cadena).digest('hex');
  }

  async procesarPago(datos: ParametrosTransaccionPasarela): Promise<Result<RespuestaPasarela, Error>> {
    try {
      const firma = this.generarFirmaIntegridad(datos.referencia, datos.montoEnCentavos, datos.moneda);

      const cuerpoPeticion = {
        acceptance_token: datos.tokenAceptacion,
        amount_in_cents: datos.montoEnCentavos,
        currency: datos.moneda,
        signature: firma,
        customer_email: datos.correoCliente,
        payment_method: {
          type: 'CARD',
          token: datos.tokenTarjeta,
          installments: datos.cuotas,
        },
        reference: datos.referencia,
      };

      const respuesta = await axios.post(`${this.baseUrl}/transactions`, cuerpoPeticion, {
        headers: {
          Authorization: `Bearer ${this.llavePrivada}`,
          'Content-Type': 'application/json',
        },
      });

      let transaccionData = respuesta.data.data;

      // Si Wompi Sandbox responde en estado PENDING, esperar 2 segundos y consultar el estado final
      if (transaccionData.status === 'PENDING') {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        try {
          const consulta = await axios.get(`${this.baseUrl}/transactions/${transaccionData.id}`, {
            headers: { Authorization: `Bearer ${this.llavePrivada}` },
          });
          if (consulta.data?.data) {
            transaccionData = consulta.data.data;
          }
        } catch {
          // Si falla la consulta adicional, continuar con la respuesta original
        }
      }

      let estadoMapeado: 'APROBADA' | 'RECHAZADA' | 'FALLIDA' = 'FALLIDA';
      if (transaccionData.status === 'APPROVED') {
        estadoMapeado = 'APROBADA';
      } else if (transaccionData.status === 'DECLINED') {
        estadoMapeado = 'RECHAZADA';
      }

      return ok({
        idTransaccion: transaccionData.id,
        estado: estadoMapeado,
        mensaje: transaccionData.status_message || (estadoMapeado === 'APROBADA' ? 'Pago aprobado exitosamente' : 'Transacción procesada'),
      });
    } catch (error: any) {
      const mensajeError = error.response?.data?.error?.reason || error.response?.data?.message || error.message || 'Error de conexión con la pasarela';
      return err(new Error(mensajeError));
    }
  }
}