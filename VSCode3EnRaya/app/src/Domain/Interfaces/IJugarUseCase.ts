export interface IJugarUseCase {
    suscribirseAEventos(callbacks: {
        onTablero: (movimiento: any) => void;
        onEspera: (esperando: boolean) => void;
        onAsignar: (ficha: string) => void;
        onTurno: (turno: string) => void;
        onActualizarNombres: (nombres: any) => void;
        onFin: (resultado: string) => void;
        onReiniciarUI: () => void;
        onForzarSalida: () => void;
        onSalaLlena: (mensaje: string) => void; // <--- AÑADIR ESTA LÍNEA
    }, nombre: string): void;
    
    moverFicha(x: number, y: number, ficha: string): void;
    salirDelJuego(): Promise<void>;
}