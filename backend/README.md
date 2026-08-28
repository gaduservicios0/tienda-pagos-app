# ⚙️ Pasarela E-Commerce Wompi - Backend (NestJS Hexagonal + ROP)

Servicio Backend de alta resiliencia y seguridad desarrollado con **NestJS**, **TypeScript**, **PostgreSQL / Repositorios en Memoria**, **Neverthrow** y **Swagger**, estructurado bajo **Arquitectura Hexagonal (Puertos y Adaptadores)** y **Programación Orientada a Ferrocarriles (Railway Oriented Programming - ROP)**.

---

## 📑 Tabla de Contenido
1. [Descripción General](#-descripción-general)
2. [Arquitectura Hexagonal (Puertos y Adaptadores)](#-arquitectura-hexagonal-puertos-y-adaptadores)
3. [Railway Oriented Programming (ROP) con Neverthrow](#-railway-oriented-programming-rop-con-neverthrow)
4. [Modelo de Datos y Entidades](#-modelo-de-datos-y-entidades)
5. [Seguridad, Criptografía y Alineaciones OWASP](#-seguridad-criptografía-y-alineaciones-owasp)
6. [Documentación de la API y Endpoints](#-documentación-de-la-api-y-endpoints)
7. [Reporte de Cobertura de Pruebas Unitarias (> 80%)](#-reporte-de-cobertura-de-pruebas-unitarias--80)
8. [Instalación, Configuración y Ejecución](#-instalación-configuración-y-ejecución)
9. [Despliegue en la Nube y Swagger](#-despliegue-en-la-nube-y-swagger)

---

## 🌟 Descripción General

Este servicio backend orquesta de forma segura el procesamiento de pagos con tarjeta de crédito mediante **Wompi Sandbox**. Garantiza el aislamiento de datos sensibles del tarjetahabiente (PCI-DSS), valida la existencia de inventario, calcula y sella la **firma criptográfica SHA-256** requerida por Wompi, y persiste el estado de cada transacción con trazabilidad completa.


---

## 🏛️ Arquitectura Hexagonal (Puertos y Adaptadores)

El backend aísla por completo las reglas de negocio del framework y de los servicios externos:

```text
backend/src/
├── dominio/                    # NÚCLEO PURO (Sin dependencias externas ni frameworks)
│   ├── modelos/
│   │   ├── producto.modelo.ts       # Entidad Producto con validación de stock
│   │   └── transaccion.modelo.ts    # Entidad Transacción y estados (PENDIENTE, APROBADA, etc.)
│   └── puertos/                # CONTRATOS (Interfaces abstractas)
│       ├── pasarela.puerto.ts       # Puerto para pasarelas de pago (Wompi)
│       ├── repositorio-producto.puerto.ts
│       └── repositorio-transaccion.puerto.ts
│
├── aplicacion/                 # CASOS DE USO (Orquestación de la lógica de negocio)
│   └── casos-de-uso/
│       ├── procesar-pago.caso-de-uso.ts # Flujo ROP de procesamiento de pagos
│       └── procesar-pago.caso-de-uso.spec.ts
│
└── infraestructura/            # ADAPTADORES (Implementaciones técnicas y frameworks)
    ├── adaptadores/
    │   ├── pasarela/
    │   │   ├── adaptador-pasarela.ts        # Adaptador Wompi API con firma SHA-256
    │   │   └── adaptador-pasarela.spec.ts
    │   └── persistencia/
    │       ├── repositorio-producto.postgres.ts
    │       └── repositorio-transaccion.postgres.ts
    └── controladores/
        ├── productos.controlador.ts         # Endpoints GET /api/productos
        └── transacciones.controlador.ts     # Endpoints POST /api/transacciones
```

---

## 🚂 Railway Oriented Programming (ROP) con Neverthrow

Para evitar el uso de bloques `try/catch` dispersos y excepciones inesperadas en tiempo de ejecución, el procesamiento de pagos utiliza **Neverthrow** para canalizar el flujo mediante vías de dos vías (*Success* / *Failure*):

```typescript
// aplicacion/casos-de-uso/procesar-pago.caso-de-uso.ts
export class ProcesarPagoCasoDeUso {
  ejecutar(comando: ComandoProcesarPago): ResultAsync<Transaccion, ErrorDominio> {
    return this.repositorioProducto
      .buscarPorId(comando.productoId)
      .andThen((producto) => this.validarStock(producto))
      .andThen((producto) => this.calcularFirmaSHA256(producto, comando))
      .andThen((firma) => this.adaptadorPasarela.crearTransaccion(comando, firma))
      .andThen((transaccion) => this.guardarYDescontarStock(transaccion));
  }
}
```

---

## 🗄️ Modelo de Datos y Entidades

```text
  +----------------------+        1:N        +----------------------+        1:N        +-------------------------+
  |       CLIENTE        | ----------------> |       ENTREGA        | ----------------> |       TRANSACCION       |
  +----------------------+                   +----------------------+                   +-------------------------+
  | id: UUID (PK)        |                   | id: UUID (PK)        |                   | id: UUID (PK)           |
  | nombreCompleto       |                   | direccion            |                   | referencia: String (UQ) |
  | correoElectronico    |                   | ciudad               |                   | montoEnCentavos: Int    |
  | numeroTelefono       |                   | departamento         |                   | cuotas: Int             |
  | numeroDocumento      |                   | pais: "CO"           |                   | estado: EstadoTx        |
  +----------------------+                   +----------------------+                   | firmaIntegridad: String |
                                                                                        +-------------------------+
                                                                                                     | N:1
  +----------------------+                                                                           |
  |       PRODUCTO       | <-------------------------------------------------------------------------+
  +----------------------+
  | id: String (PK)      |
  | nombre: String       |
  | precioEnCentavos     |
  | unidadesDisponibles  |
  +----------------------+
```

---

## 🔒 Seguridad, Criptografía y Alineaciones OWASP

1. **Firma Criptográfica SHA-256 de Integridad Wompi:**
   - La pasarela Wompi exige validar la integridad de cada transacción antes de su aprobación mediante la fórmula:
     $$\text{Firma} = \text{SHA256}(\text{referencia} + \text{montoEnCentavos} + \text{"COP"} + \text{WOMPI\_INTEGRITY\_KEY})$$
   - El backend genera de forma segura el hash hexadecimal SHA-256 garantizando que el monto no pueda ser alterado por intermediarios.
2. **Aislamiento Total de Datos de Tarjeta (PCI-DSS Compliance):**
   - El backend **nunca recibe ni almacena** el número primario de cuenta (PAN) ni el código de seguridad (CVC).
   - Únicamente recibe el `tokenTarjeta` (`tok_stagtest_...`) emitido directamente por los servidores seguros de Wompi.
3. **Cabeceras HTTP Seguras (Helmet):**
   - Protección contra Clickjacking (`X-Frame-Options: SAMEORIGIN`), XSS (`X-XSS-Protection`) y Content Security Policy (CSP).
4. **Validación Estricta de DTOs:**
   - Implementación de `class-validator` y `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`.

---

## 📖 Documentación de la API y Endpoints

### 1. `GET /api/productos`
Obtiene el catálogo de productos disponibles en la tienda con su stock y precio.
```json
[
  {
    "id": "prod-001",
    "nombre": "Chaqueta Impermeable Urbana",
    "precioEnCentavos": 15000000,
    "unidadesDisponibles": 12
  }
]
```

---

### 2. `POST /api/transacciones`
Procesa la compra con tarjeta tokenizada en Wompi y firma de integridad.

**Payload:**
```json
{
  "productoId": "prod-001",
  "tokenAceptacion": "eyJhbGciOiJIUzI1NiIsIn...",
  "tokenTarjeta": "tok_stagtest_5113_d5E4c6857Fd5b3cA4382C519B1410856",
  "cuotas": 1,
  "cliente": {
    "nombreCompleto": "Cliente Prueba",
    "correoElectronico": "gerson.mercado@outlook.com",
    "numeroTelefono": "3001234567",
    "tipoDocumento": "CC",
    "numeroDocumento": "1020304050"
  },
  "entrega": {
    "direccion": "Carrera 14A # 16-42",
    "ciudad": "Bogotá",
    "departamento": "Cundinamarca",
    "pais": "CO"
  }
}
```

**Respuesta Exitosa (201 Created):**
```json
{
  "idTransaccion": "c8a1b2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "referencia": "ECOM-1787882000-A1B2",
  "montoEnCentavos": 16700000,
  "estado": "APROBADA",
  "mensaje": "Transacción aprobada con éxito por Wompi"
}
```

---

### 3. `GET /api/transacciones/:id`
Consulta el estado actualizado de una transacción por su ID único.

---

## 📊 Reporte de Cobertura de Pruebas Unitarias (> 80%)

El backend cuenta con una cobertura integral de pruebas unitarias implementadas en **Jest**, alcanzando **100% de Sentencias, Líneas y Funciones**:

```
----------------------------------------------|---------|----------|---------|---------|-------------------
File                                          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------------------------------------------|---------|----------|---------|---------|-------------------
All files                                     |     100 |    91.46 |     100 |     100 |                   
 src                                          |     100 |       75 |     100 |     100 |                   
  app.controller.ts                           |     100 |       75 |     100 |     100 | 6                 
  app.service.ts                              |     100 |      100 |     100 |     100 |                   
 src/aplicacion/casos-de-uso                  |     100 |      100 |     100 |     100 |                   
  procesar-pago.caso-de-uso.ts                |     100 |      100 |     100 |     100 |                   
 src/dominio/modelos                          |     100 |      100 |     100 |     100 |                   
  producto.modelo.ts                          |     100 |      100 |     100 |     100 |                   
  transaccion.modelo.ts                       |     100 |      100 |     100 |     100 |                   
 src/infraestructura/adaptadores/pasarela     |     100 |    86.11 |     100 |     100 |                   
  adaptador-pasarela.ts                       |     100 |    86.11 |     100 |     100 | 35,57,72,77,96    
 src/infraestructura/adaptadores/persistencia |     100 |      100 |     100 |     100 |                   
  repositorio-producto.postgres.ts            |     100 |      100 |     100 |     100 |                   
  repositorio-transaccion.postgres.ts         |     100 |      100 |     100 |     100 |                   
 src/infraestructura/controladores            |     100 |    96.42 |     100 |     100 |                   
  productos.controlador.ts                    |     100 |      100 |     100 |     100 |                   
  transacciones.controlador.ts                |     100 |    96.15 |     100 |     100 | 71                
----------------------------------------------|---------|----------|---------|---------|-------------------

Test Suites: 8 passed, 8 total
Tests:       33 passed, 33 total
```

### Comandos de Pruebas:
```bash
# Ejecutar todas las pruebas unitarias
npm run test

# Ejecutar pruebas con reporte de cobertura
npm run test:cov

# Abrir reporte interactivo en el navegador (macOS)
open coverage/lcov-report/index.html
```

---

## ⚡ Instalación, Configuración y Ejecución

### 1. Variables de Entorno (`backend/.env`)
```env
PORT=3000
WOMPI_PUBLIC_KEY=pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7
WOMPI_PRIVATE_KEY=prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg
WOMPI_INTEGRITY_KEY=stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp
WOMPI_API_URL=https://api-sandbox.co.uat.wompi.dev/v1
```

### 2. Comandos de Ejecución
```bash
# Instalar dependencias
npm install

# Modo desarrollo con recarga en vivo
npm run start:dev

# Compilar para producción
npm run build

# Iniciar en modo producción
npm run start:prod
```

---

## 🌐 Despliegue en la Nube y Swagger

- **API REST Producción:** `https://tienda-pagos-app.onrender.com/api`
- **Documentación Swagger UI Producción:** `https://tienda-pagos-app.onrender.com/api/docs`
- **Documentación Swagger UI Local:** `http://localhost:3000/api/docs`
