import * as signalR from "@microsoft/signalr";

export class SignalRConnection {
    private static instance: signalR.HubConnection | null = null;

    // Cambiamos la URL a la de tu Azure (usando HTTPS)
    private static readonly URL = "https://3enrayaserver-a4htbpf7e3b0d6cy.spaincentral-01.azurewebsites.net/juegoHub";

    public static async conectar(): Promise<signalR.HubConnection> {
        if (!this.instance) {
            this.instance = new signalR.HubConnectionBuilder()
                .withUrl(this.URL) 
                .withAutomaticReconnect()
                .build();

            try {
                await this.instance.start();
                console.log("Conectado con éxito a Azure SignalR");
            } catch (err) {
                console.error("Error al conectar con el servidor de Azure:", err);
                throw err;
            }
        }
        return this.instance;
    }
}