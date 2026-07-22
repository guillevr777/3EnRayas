import { HttpTransportType, HubConnection, HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import { IJuegoRepository } from "../../Domain/Repositories/IJuegoRepository";

export class JuegoRepository implements IJuegoRepository {
    private connection: HubConnection;
    private isInitialized: boolean = false;

    constructor() {
        this.connection = new HubConnectionBuilder()
            // 1. CAMBIAMOS localhost POR TU URL DE AZURE (HTTPS)
            .withUrl("https://3enrayaserver-a4htbpf7e3b0d6cy.spaincentral-01.azurewebsites.net/juegoHub", {
                // 2. IMPORTANTE: En Azure, quita 'skipNegotiation: true' y deja que 
                // SignalR decida el mejor transporte automáticamente.
                transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling
            })
            .withAutomaticReconnect()
            .build();
    }

    async desconectar(): Promise<void> {
        try {
            if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
                this.connection.off("OnAccionRecibida");
                this.connection.off("ForzarSalida");
                
                await this.connection.stop();
                console.log("🔌 SignalR: Conexión destruida con éxito.");
            }
        } catch (err) {
            console.warn("⚠️ Error al cerrar socket:", err);
        } finally {
            this.isInitialized = false;
        }
    }

    async suscribirTodo(callbacks: any, nombreUsuario: string) {
        if (this.isInitialized) return;

        // Limpieza de escuchadores
        this.connection.off("OnAccionRecibida");
        this.connection.off("RecibirFicha");
        this.connection.off("EstadoEspera");
        this.connection.off("TurnoCambiado");
        this.connection.off("ActualizarNombres");
        this.connection.off("RecibirGanador");
        this.connection.off("ForzarSalida");
        this.connection.off("LimpiarTableroUI");
        this.connection.off("SalaLlena");

        // Configuración de escuchadores
        this.connection.on("OnAccionRecibida", (m) => callbacks.onTablero(m));
        this.connection.on("RecibirFicha", (s) => callbacks.onAsignar(s));
        this.connection.on("EstadoEspera", (e) => callbacks.onEspera(e));
        this.connection.on("TurnoCambiado", (t) => callbacks.onTurno(t));
        this.connection.on("ActualizarNombres", (n) => callbacks.onActualizarNombres(n));
        this.connection.on("RecibirGanador", (r) => callbacks.onFin(r));
        this.connection.on("ForzarSalida", () => {
            if (callbacks.onForzarSalida) callbacks.onForzarSalida();
        });
        this.connection.on("LimpiarTableroUI", () => {
            if (callbacks.onReiniciarUI) callbacks.onReiniciarUI();
        });
        this.connection.on("SalaLlena", (mensaje: string) => {
            console.log("Servidor dice que la sala está llena:", mensaje);
            callbacks.onSalaLlena(mensaje);
        });

        this.isInitialized = true;

        try {
            if (this.connection.state === HubConnectionState.Disconnected) {
                await this.connection.start();
                console.log("✅ Conexión establecida con Azure. ID:", this.connection.connectionId);
                await this.connection.invoke("UnirseAlJuego", nombreUsuario);
            }
        } catch (err) {
            console.error("❌ Error SignalR en Azure:", err);
            this.isInitialized = false; 
        }
    }

    async enviarMovimiento(ficha: any): Promise<boolean> {
        if (this.connection.state === HubConnectionState.Connected) {
            try {
                const celdaIndex = (ficha.posY * 3) + ficha.posX;
                await this.connection.invoke("EnviarAccion", {
                    CeldaIndex: celdaIndex,
                    Ficha: ficha.simbolo
                });
                return true;
            } catch (err) {
                console.error("Error al enviar movimiento:", err);
            }
        }
        return false;
    }
}