import { Ficha } from "./Ficha";

export class Tablero {
    // Matriz de 3x3 inicializada vacía
    casillas: string[][] = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ];

    colocarFicha(ficha: Ficha): boolean {
        if (this.casillas[ficha.posX][ficha.posY] === "") {
            this.casillas[ficha.posX][ficha.posY] = ficha.simbolo;
            return true;
        }
        return false;
    }
}