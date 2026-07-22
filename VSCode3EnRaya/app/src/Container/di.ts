import { JuegoRepository } from "../Data/Repositories/JuegoRepository";
import { JugarUseCase } from "../Domain/UseCases/JugarUseCase";

class DIContainer {
    private _juegoRepository?: JuegoRepository;
    private _jugarUseCase?: JugarUseCase;

    // Solo creamos la instancia cuando alguien la pide por primera vez
    public getJugarUseCase() {
        if (!this._jugarUseCase) {
            this._juegoRepository = new JuegoRepository();
            this._jugarUseCase = new JugarUseCase(this._juegoRepository);
        }
        return this._jugarUseCase;
    }
}

export const di = new DIContainer();