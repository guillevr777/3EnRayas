"use strict";
var connection = new signalR.HubConnectionBuilder()
    .withUrl("/juegoHub") 
    .build();

connection.on("SalaLlena", function (mensaje) {
    alert(mensaje);
});

connection.start().catch(function (err) {
    return console.error(err.toString());
});