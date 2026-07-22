import { useEffect, useState } from "react";
import { IJugarUseCase } from "../../Domain/Interfaces/IJugarUseCase";

export const useJuegoVM = (juegoUseCase: IJugarUseCase) => {
    const [tablero, setTablero] = useState(Array(3).fill(null).map(() => Array(3).fill("")));
    const [esperando, setEsperando] = useState(true);
    const [miFicha, setMiFicha] = useState(""); 
    const [turnoActual, setTurnoActual] = useState("X");
    const [mensajeFinal, setMensajeFinal] = useState("");
    const [jugadores, setJugadores] = useState({ X: "Esperando...", O: "Esperando..." });
    const [contador, setContador] = useState<number | null>(null);
    const [errorConexion, setErrorConexion] = useState<string | null>(null);

    // ✅ CORRECCIÓN 1: Usar setTimeout estándar (sin window.) para que funcione en móvil
    // JuegoVM.ts
    useEffect(() => {
        // Usamos ReturnType para que TypeScript detecte automáticamente 
        // si es un número (Web/RN) o un objeto (Node)
        let timer: ReturnType<typeof setTimeout> | undefined;

        if (contador !== null) {
            if (contador > 0) {
                timer = setTimeout(() => setContador(contador - 1), 1000);
            } else if (contador === 0) {
                handleSalidaEfectiva();
            }
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [contador]);

    const conectarJuego = (nombre: string, onLoginConfirm: () => void) => {
        setErrorConexion(null); 

        const subs = {
            onTablero: (m: any) => actualizarTableroLocal(m),
            onEspera: (e: boolean) => setEsperando(e),
            onAsignar: (f: string) => {
                setMiFicha(f);
                onLoginConfirm(); 
            },
            onSalaLlena: (msg: string) => {
                setErrorConexion(msg); 
            },
            onTurno: (t: string) => setTurnoActual(t),
            onActualizarNombres: (n: any) => setJugadores(n),
            onFin: (resultado: string) => {
                const texto = resultado === "Empate" ? "¡Es un empate!" : `¡Ganador: ${resultado}!`;
                setMensajeFinal(texto);
                setContador(5);
            },
            onReiniciarUI: () => {
                setTablero(Array(3).fill(null).map(() => Array(3).fill("")));
                setMensajeFinal("");
                setContador(null);
            },
            onForzarSalida: () => handleSalidaEfectiva()
        };
        juegoUseCase.suscribirseAEventos(subs, nombre);
    };

    // ✅ CORRECCIÓN 2: Eliminar window.location.replace
    const handleSalidaEfectiva = async () => {
        try { 
            await juegoUseCase.salirDelJuego(); 
        } 
        catch (e) { 
            console.log("Ya desconectado"); 
        } 
        finally {
            // En React Native no existe location.replace. 
            // Para resetear el juego, simplemente limpiamos los estados locales:
            setTablero(Array(3).fill(null).map(() => Array(3).fill("")));
            setMensajeFinal("");
            setContador(null);
            setMiFicha("");
            setEsperando(true);
            setTurnoActual("X");
            
            // Si quieres que el usuario vuelva a la pantalla de login, 
            // deberías llamar a una función que cambie la pantalla, por ejemplo:
            // onVolverAlInicio(); 
        }
    };

    const actualizarTableroLocal = (movimiento: any) => {
        const { posX, posY, simbolo } = movimiento;
        setTablero(prev => {
            const nuevo = prev.map(fila => [...fila]);
            if (nuevo[posY]) nuevo[posY][posX] = simbolo; 
            return nuevo;
        });
    };

    const pulsarCasilla = (x: number, y: number) => {
        if (esperando || miFicha !== turnoActual || mensajeFinal) return;
        if (tablero[y][x] !== "") return; 
        juegoUseCase.moverFicha(x, y, miFicha);
    };

    return { 
        tablero, esperando, miFicha, turnoActual, pulsarCasilla, 
        mensajeFinal, jugadores, conectarJuego, contador, errorConexion 
    };
};