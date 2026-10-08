# 3EnRayas

Juego de tres en raya para dos personas con partidas en tiempo real. El repositorio incluye una aplicación móvil/web con Expo y un servidor ASP.NET Core que coordina las salas y los turnos mediante SignalR.

## Versiones

| Carpeta | Función | Tecnologías |
| --- | --- | --- |
| `VSCode3EnRaya/` | Cliente del juego | React Native, Expo, TypeScript y SignalR |
| `3EnRayaVS2022/` | Servidor y lógica de partida | ASP.NET Core 8, C# y SignalR |

## Cómo se juega

- Dos personas se conectan a una sala y reciben las fichas `X` y `O`.
- El servidor valida los turnos y difunde cada movimiento en tiempo real.
- La partida detecta victoria o empate y prepara la sala para volver a jugar.
- Si un jugador se desconecta, el servidor limpia la partida.

## Requisitos

- .NET 8 SDK.
- Node.js y npm.
- Expo Go para probar en un dispositivo, o un emulador compatible.

## Ejecutar el servidor

Desde la raíz del repositorio:

```bash
dotnet run --project 3EnRayaVS2022/3EnRayaVS2022.csproj
```

El servidor publica el hub SignalR en la ruta `/juegoHub`. La dirección local concreta aparece en la salida de `dotnet run` y en `3EnRayaVS2022/Properties/launchSettings.json`.

## Ejecutar el cliente

```bash
cd VSCode3EnRaya
npm ci
npx expo start
```

El cliente tiene configurada la dirección del servidor en `app/src/Data/Connections/SignalRConnection.ts`. Para una ejecución local, actualízala con la dirección del servidor y la ruta `/juegoHub`. En un móvil físico, usa una dirección accesible desde la red del dispositivo.

## Arquitectura

El cliente mantiene la interfaz y el estado visual del tablero. El servidor administra las conexiones, la asignación de fichas, las reglas de turno y el resultado de la partida; ambos intercambian eventos a través de SignalR.
