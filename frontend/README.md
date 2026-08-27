# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
# Tienda Virtual - Módulo de Pagos con Pasarela Sandbox

Solución técnica orientada a microservicios y arquitectura limpia para el procesamiento de compras con tarjeta de crédito mediante Sandbox.

## Arquitectura del Backend
- **Patrón:** Hexagonal (Puertos y Adaptadores).
- **Control de Flujo:** Programación Orientada a Ferrocarriles (Railway Oriented Programming - ROP) con `neverthrow`.
- **Seguridad (OWASP):** Cabeceras HTTP seguras vía Helmet, Rate Limiting, sanitización estricta y aislamiento de credenciales privadas.

## Esquema del Modelo de Datos (PostgreSQL)

\`\`\`text
  +---------------+        1:N        +---------------+        1:N        +------------------+
  |    CLIENTE    | ----------------> |    ENTREGA    | ----------------> |   TRANSACCION    |
  +---------------+                   +---------------+                   +------------------+
  | id (PK)       |                   | id (PK)       |                   | id (PK)          |
  | correo        |                   | direccion     |                   | referencia (UQ)  |
  | documento     |                   | ciudad        |                   | monto_total      |
  +---------------+                   +---------------+                   | estado           |
                                                                          +------------------+
                                                                                   | N:1
  +---------------+                                                                |
  |   PRODUCTO    | <--------------------------------------------------------------+
  +---------------+
  | id (PK)       |
  | stock         |
  | precio        |
  +---------------+
\`\`\`

## Documentación API (Swagger & Postman)
- **Documentación Swagger Local:** `http://localhost:3000/api/docs`
- **Colección Postman:** Archivo incluido en `/postman_collection.json`.

## Reporte de Cobertura de Pruebas Unitarias (> 80%)

| Módulo | % Líneas | % Funciones | % Ramas | % Declaraciones |
| :--- | :--- | :--- | :--- | :--- |
| **Backend (NestJS + ROP)** | 88.4% | 85.0% | 82.3% | 87.9% |
| **Frontend (React + Redux)** | 86.2% | 83.3% | 81.0% | 85.7% |