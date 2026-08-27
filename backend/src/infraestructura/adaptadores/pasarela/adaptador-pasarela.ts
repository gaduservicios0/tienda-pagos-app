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
  private readonly baseUrl = 'https://api-sandbox.co.uat.wompi.dev/v1';
  private readonly llavePrivada = 'prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg';
  private readonly secretoIntegridad = 'stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp';

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

      const { id, status, status_message } = respuesta.data.data;
      return ok({
        idTransaccion: id,
        estado: status === 'APPROVED' ? 'APROBADA' : status === 'DECLINED' ? 'RECHAZADA' : 'FALLIDA',
        mensaje: status_message || 'Transacción procesada',
      });
    } catch (error: any) {
      const mensajeError = error.response?.data?.error?.reason || error.message || 'Error de conexión con la pasarela';
      return err(new Error(mensajeError));
    }
  }
}