export class Producto {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly descripcion: string,
    public readonly precioEnCentavos: number,
    public unidadesDisponibles: number,
    public readonly urlImagen: string,
    public readonly creadoEn?: Date,
    public readonly actualizadoEn?: Date,
  ) {}

  tieneStock(): boolean {
    return this.unidadesDisponibles > 0;
  }
}