export class Ficha {
    posX: number;
    posY: number;
    simbolo: string; // 'X' o 'O'

    constructor(posX: number, posY: number, simbolo: string) {
        this.posX = posX;
        this.posY = posY;
        this.simbolo = simbolo;
    }
}