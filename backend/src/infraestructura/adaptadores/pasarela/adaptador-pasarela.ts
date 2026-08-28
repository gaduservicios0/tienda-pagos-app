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
  private readonly secretoIntegridad = process.env.WOMPI_INTEGRITY_KEY || 'stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp';

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
          installments: datos.cuotas || 1,
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

      // Si Wompi Sandbox responde en estado PENDING, consultar hasta obtener estado final (máx 4 intentos)
      if (transaccionData.status === 'PENDING') {
        for (let intento = 0; intento < 4; intento++) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          try {
            const consulta = await axios.get(`${this.baseUrl}/transactions/${transaccionData.id}`, {
              headers: { Authorization: `Bearer ${this.llavePrivada}` },
            });
            if (consulta.data?.data?.status && consulta.data.data.status !== 'PENDING') {
              transaccionData = consulta.data.data;
              break;
            }
          } catch {
            // Continuar con el siguiente reintento si la consulta falla temporalmente
          }
        }
      }

      let estadoMapeado: 'APROBADA' | 'RECHAZADA' | 'FALLIDA' = 'FALLIDA';
      if (transaccionData.status === 'APPROVED') {
        estadoMapeado = 'APROBADA';
      } else if (transaccionData.status === 'DECLINED') {
        estadoMapeado = 'RECHAZADA';
      } else if (transaccionData.status === 'ERROR') {
        estadoMapeado = 'FALLIDA';
      }

      const mensaje = transaccionData.status_message || 
        (estadoMapeado === 'APROBADA' ? 'Transacción aprobada con éxito' : 
         estadoMapeado === 'RECHAZADA' ? 'Transacción rechazada por el banco emisor' : 'Error al procesar con la pasarela');

      return ok({
        idTransaccion: transaccionData.id,
        estado: estadoMapeado,
        mensaje,
      });
    } catch (error: any) {
      let mensajeError = 'Error de conexión con la pasarela';
      if (error.response?.data?.error?.reason) {
        mensajeError = error.response.data.error.reason;
      } else if (error.response?.data?.error?.messages) {
        const mensajes = Object.entries(error.response.data.error.messages)
          .map(([campo, msg]) => `${campo}: ${Array.isArray(msg) ? msg.join(', ') : msg}`)
          .join('; ');
        mensajeError = mensajes;
      } else if (error.response?.data?.message) {
        mensajeError = error.response.data.message;
      } else if (error.message) {
        mensajeError = error.message;
      }
      return err(new Error(mensajeError));
    }
  }
}