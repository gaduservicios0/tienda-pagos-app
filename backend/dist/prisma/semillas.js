"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.producto.deleteMany();
    await prisma.producto.create({
        data: {
            id: 'prod-001',
            nombre: 'Chaqueta Impermeable Urbana',
            descripcion: 'Chaqueta ligera de alta resistencia con protección contra lluvia y viento.',
            precioEnCentavos: 15000000,
            unidadesDisponibles: 12,
            urlImagen: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
        },
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=semillas.js.map