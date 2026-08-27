"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdaptadorPasarela = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const neverthrow_1 = require("neverthrow");
let AdaptadorPasarela = class AdaptadorPasarela {
    baseUrl = 'https://api-sandbox.co.uat.wompi.dev/v1';
    llavePrivada = 'prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg';
    secretoIntegridad = 'stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp';
    generarFirmaIntegridad(referencia, montoEnCentavos, moneda) {
        const cadena = `${referencia}${montoEnCentavos}${moneda}${this.secretoIntegridad}`;
        return crypto.createHash('sha256').update(cadena).digest('hex');
    }
    async procesarPago(datos) {
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
            const respuesta = await axios_1.default.post(`${this.baseUrl}/transactions`, cuerpoPeticion, {
                headers: {
                    Authorization: `Bearer ${this.llavePrivada}`,
                    'Content-Type': 'application/json',
                },
            });
            const { id, status, status_message } = respuesta.data.data;
            return (0, neverthrow_1.ok)({
                idTransaccion: id,
                estado: status === 'APPROVED' ? 'APROBADA' : status === 'DECLINED' ? 'RECHAZADA' : 'FALLIDA',
                mensaje: status_message || 'Transacción procesada',
            });
        }
        catch (error) {
            const mensajeError = error.response?.data?.error?.reason || error.message || 'Error de conexión con la pasarela';
            return (0, neverthrow_1.err)(new Error(mensajeError));
        }
    }
};
exports.AdaptadorPasarela = AdaptadorPasarela;
exports.AdaptadorPasarela = AdaptadorPasarela = __decorate([
    (0, common_1.Injectable)()
], AdaptadorPasarela);
//# sourceMappingURL=adaptador-pasarela.js.map