using _3EnRaya.Domain.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace _3EnRaya.UseCases
{
    public class GestionJuegoUseCase : IGestionJuegoUseCase
    {
        private static readonly Dictionary<string, (string Ficha, string Nombre)> _jugadores = new();
        private static string[] _tablero = new string[9];
        private static string _turnoActual = "X";

        public Task<string> RegistrarJugador(string connectionId, string nombre)
        {
            if (_jugadores.Count >= 2 && !_jugadores.ContainsKey(connectionId))
                return Task.FromResult<string>(null);

            if (!_jugadores.ContainsKey(connectionId))
            {
                string ficha = _jugadores.Count == 0 ? "X" : "O";
                _jugadores[connectionId] = (ficha, string.IsNullOrWhiteSpace(nombre) ? "Anónimo" : nombre);
            }
            return Task.FromResult(_jugadores[connectionId].Ficha);
        }

        public string RegistrarMovimientoYVerificarGanador(int celda, string ficha)
        {
            if (celda < 0 || celda > 8 || _tablero[celda] != null) return null;

            _tablero[celda] = ficha;

            // Combinaciones ganadoras
            int[][] combinaciones = {
                new[] {0,1,2}, new[] {3,4,5}, new[] {6,7,8}, // Horizontales
                new[] {0,3,6}, new[] {1,4,7}, new[] {2,5,8}, // Verticales
                new[] {0,4,8}, new[] {2,4,6}               // Diagonales
            };

            foreach (var c in combinaciones)
            {
                if (_tablero[c[0]] != null && _tablero[c[0]] == _tablero[c[1]] && _tablero[c[0]] == _tablero[c[2]])
                {
                    return _jugadores.Values.First(j => j.Ficha == ficha).Nombre;
                }
            }

            if (!_tablero.Contains(null)) return "Empate";

            return null;
        }

        // 1. LIMPIA SOLO EL TABLERO (Para cuando quieres seguir jugando sin echar a nadie)
        public void ReiniciarTablero()
        {
            _tablero = new string[9];
            _turnoActual = "X";
        }

        // 2. LIMPIA TODO (Para cerrar la sala tras los 5 segundos)
        public void ReiniciarPartidaCompleta()
        {
            ReiniciarTablero(); // Aprovechamos el método anterior
            _jugadores.Clear(); // Y vaciamos la lista de jugadores
        }

        public int TotalJugadores() => _jugadores.Count;

        public Dictionary<string, string> ObtenerNombresJugadores() =>
            _jugadores.Values.ToDictionary(x => x.Ficha, x => x.Nombre);

        public bool EsTurnoDe(string connectionId) =>
            _jugadores.ContainsKey(connectionId) && _jugadores[connectionId].Ficha == _turnoActual;

        public void AlternarTurno() => _turnoActual = (_turnoActual == "X") ? "O" : "X";

        public string ObtenerTurnoActual() => _turnoActual;

        public void EliminarJugador(string connectionId)
        {
            _jugadores.Remove(connectionId);
            if (_jugadores.Count == 0) ReiniciarTablero();
        }
    }
}