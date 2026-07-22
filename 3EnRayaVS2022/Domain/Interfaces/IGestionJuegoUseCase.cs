using System.Collections.Generic;
using System.Threading.Tasks;

namespace _3EnRaya.Domain.Interfaces
{
    public interface IGestionJuegoUseCase
    {
        // Registro y control de jugadores
        Task<string> RegistrarJugador(string connectionId, string nombre);
        int TotalJugadores();
        void EliminarJugador(string connectionId);
        Dictionary<string, string> ObtenerNombresJugadores();

        // Lógica de turnos
        bool EsTurnoDe(string connectionId);
        void AlternarTurno();
        string ObtenerTurnoActual();

        // Lógica de juego
        /// <summary>
        /// Registra el movimiento en el tablero del servidor y comprueba si hay ganador.
        /// </summary>
        /// <returns>Retorna el nombre del ganador, "Empate" o null si el juego continúa.</returns>
        string RegistrarMovimientoYVerificarGanador(int celda, string ficha);

        /// <summary>
        /// Limpia el tablero y resetea el turno a "X" para una nueva partida.
        /// </summary>
        void ReiniciarTablero();

        /// <summary>
        /// Limpia el tablero, resetea el turno y elimina a todos los jugadores de la sala.
        /// </summary>
        void ReiniciarPartidaCompleta(); // <--- NUEVO MÉTODO
    }
}