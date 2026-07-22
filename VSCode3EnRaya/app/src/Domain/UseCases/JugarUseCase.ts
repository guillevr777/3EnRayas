import { IJugarUseCase } from "../Interfaces/IJugarUseCase";
import { IJuegoRepository } from "../Repositories/IJuegoRepository";

export class JugarUseCase implements IJugarUseCase {
    constructor(private repository: IJuegoRepository) {}

    suscribirseAEventos(callbacks: any, nombre: string) {
        this.repository.suscribirTodo(callbacks, nombre);
    }

    moverFicha(x: number, y: number, simbolo: string) {
        this.repository.enviarMovimiento({ posX: x, posY: y, simbolo: simbolo });
    }

    // NUEVO: Ordena al repositorio cerrar el socket
    async salirDelJuego(): Promise<void> {
        await this.repository.desconectar();
    }
}