export interface IJuegoRepository {
    /**
     * Envía el movimiento al servidor.
     */
    enviarMovimiento(ficha: any): Promise<boolean>;

    /**
     * Cierra la conexión física de SignalR para que el servidor olvide al jugador.
     */
    desconectar(): Promise<void>;

    /**
     * Establece la conexión y configura todos los escuchadores de eventos.
     */
    suscribirTodo(
        callbacks: {
            onTablero: (movimiento: any) => void;
            onEspera: (esperando: boolean) => void;
            onAsignar: (simbolo: string) => void;
            onTurno: (turnoDe: string) => void;
            onActualizarNombres: (jugadores: any) => void;
            onFin: (resultado: string) => void;
            onReiniciarUI: () => void;
            onForzarSalida: () => void;
        }, 
        nombreUsuario: string
    ): void;
}