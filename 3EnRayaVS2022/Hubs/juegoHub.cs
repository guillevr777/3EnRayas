using Microsoft.AspNetCore.SignalR;
using _3EnRaya.Domain.Interfaces;
using System.Threading.Tasks;

namespace _3EnRaya.Hubs
{
    public class JuegoHub : Hub
    {
        private readonly IGestionJuegoUseCase _useCase;

        public JuegoHub(IGestionJuegoUseCase useCase) => _useCase = useCase;

        public async Task UnirseAlJuego(string nombre)
        {
            // 1. Validar cupo antes de registrar
            if (_useCase.TotalJugadores() >= 2)
            {
                await Clients.Caller.SendAsync("SalaLlena", "SALA LLENA: ESPERA A QUE TERMINE LA PARTIDA");
                return;
            }

            string ficha = await _useCase.RegistrarJugador(Context.ConnectionId, nombre);
            if (ficha != null)
            {
                await Clients.Caller.SendAsync("RecibirFicha", ficha);
                var nombres = _useCase.ObtenerNombresJugadores();
                await Clients.All.SendAsync("ActualizarNombres", nombres);

                bool hayMenosDeDos = _useCase.TotalJugadores() < 2;
                await Clients.All.SendAsync("EstadoEspera", hayMenosDeDos);

                if (!hayMenosDeDos)
                {
                    await Clients.All.SendAsync("TurnoCambiado", _useCase.ObtenerTurnoActual());
                }
            }
        }

        public async Task EnviarAccion(MovimientoDto movimiento)
        {
            if (_useCase.EsTurnoDe(Context.ConnectionId))
            {
                int x = movimiento.CeldaIndex % 3;
                int y = movimiento.CeldaIndex / 3;
                await Clients.All.SendAsync("OnAccionRecibida", new { posX = x, posY = y, simbolo = movimiento.Ficha });

                string resultado = _useCase.RegistrarMovimientoYVerificarGanador(movimiento.CeldaIndex, movimiento.Ficha);

                if (resultado != null)
                {
                    await Clients.All.SendAsync("RecibirGanador", resultado);

                    _ = Task.Run(async () =>
                    {
                        // Esperamos 5.5 segundos (el contador visual del cliente dura 5)
                        await Task.Delay(5500);

                        // Mandamos la orden de recarga total
                        await Clients.All.SendAsync("ForzarSalida");

                        // Limpiamos el servidor DESPUÉS de avisar a los clientes
                        _useCase.ReiniciarPartidaCompleta();
                    });
                }
                else
                {
                    _useCase.AlternarTurno();
                    await Clients.All.SendAsync("TurnoCambiado", _useCase.ObtenerTurnoActual());
                }
            }
        }

        // NUEVO: Limpia la sala si alguien se desconecta accidentalmente
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _useCase.EliminarJugador(Context.ConnectionId);

            // Si la sala se queda vacía o con uno solo tras una desconexión, reseteamos
            if (_useCase.TotalJugadores() < 2)
            {
                _useCase.ReiniciarPartidaCompleta();
                await Clients.All.SendAsync("ForzarSalida");
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}