import React, { useEffect, useState } from 'react';
import { Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { di } from './src/Container/di';
import { useJuegoVM } from './src/UI/Viewmodel/JuegoVM';

export default function JuegoScreen() {
    const [nombre, setNombre] = useState('');
    const [conectado, setConectado] = useState(false);
    const vm = useJuegoVM(di.getJugarUseCase());

    // ✅ EFECTO DE NAVEGACIÓN AUTOMÁTICA
    // Si vm.miFicha se vacía (porque terminó la partida o hubo error), 
    // devolvemos al usuario al estado de "no conectado" (Login).
    useEffect(() => {
        if (conectado && vm.miFicha === "") {
            setConectado(false);
        }
    }, [vm.miFicha, conectado]);

    const handleConectar = () => {
        // Solo pasamos a 'conectado' si el servidor ejecuta el callback de éxito
        vm.conectarJuego(nombre, () => setConectado(true));
    };

    const intentarPulsar = (x: number, y: number) => {
        if (vm.mensajeFinal || vm.esperando) return;
        vm.pulsarCasilla(x, y);
    };

    return (
        <View style={styles.mainWrapper}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.container}>
                {!conectado ? (
                    <View style={styles.loginCard}>
                        {vm.errorConexion && (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorText}>🚫 {vm.errorConexion}</Text>
                            </View>
                        )}

                        <View style={styles.logoContainer}>
                            <Text style={styles.logoEmoji}>🎮</Text>
                            <Text style={styles.title}>TIC TAC TOE</Text>
                            <Text style={styles.subtitle}>NEON EDITION</Text>
                        </View>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Tu nombre de guerrero..."
                            placeholderTextColor="#666"
                            value={nombre}
                            onChangeText={setNombre}
                        />
                        
                        <TouchableOpacity 
                            style={[styles.button, !nombre && styles.buttonDisabled]} 
                            onPress={handleConectar}
                            disabled={!nombre}
                        >
                            <Text style={styles.buttonText}>ENTRAR A LA ARENA</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.gameArea}>
                        {/* HEADER DEL JUEGO */}
                        <View style={styles.topInfo}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {vm.miFicha === "" ? "CONECTANDO..." : `ESTÁS USANDO: ${vm.miFicha}`}
                                </Text>
                            </View>
                            <Text style={[styles.turnInfo, { color: vm.esperando ? '#555' : '#00d4ff' }]}>
                                {vm.esperando ? "BUSCANDO RIVAL..." : 
                                 vm.turnoActual === vm.miFicha ? "👉 TU TURNO" : `ESPERANDO A ${vm.turnoActual}`}
                            </Text>
                        </View>

                        {/* TABLERO */}
                        <View style={styles.boardWrapper}>
                            <View style={styles.board}>
                                {vm.tablero.map((fila, y) => (
                                    <View key={y} style={styles.row}>
                                        {fila.map((celda, x) => (
                                            <TouchableOpacity
                                                key={x}
                                                style={[styles.cell, celda !== "" && styles.cellOccupied]}
                                                onPress={() => intentarPulsar(x, y)}
                                                activeOpacity={0.7}
                                                disabled={!!vm.mensajeFinal || vm.esperando}
                                            >
                                                <Text style={[
                                                    styles.cellText,
                                                    celda === 'X' ? styles.glowX : styles.glowO
                                                ]}>
                                                    {celda}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* TARJETAS DE JUGADORES */}
                        <View style={styles.playerContainer}>
                            <View style={[styles.playerCard, vm.turnoActual === 'X' && styles.activePlayerX]}>
                                <Text style={styles.playerIcon}>❌</Text>
                                <Text style={styles.playerName} numberOfLines={1}>{vm.jugadores.X || '???'}</Text>
                            </View>
                            <View style={styles.vsBadge}><Text style={styles.vsText}>VS</Text></View>
                            <View style={[styles.playerCard, vm.turnoActual === 'O' && styles.activePlayerO]}>
                                <Text style={styles.playerIcon}>⭕</Text>
                                <Text style={styles.playerName} numberOfLines={1}>{vm.jugadores.O || '???'}</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* MODAL DE VICTORIA/DERROTA */}
            <Modal transparent visible={!!vm.mensajeFinal} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.winContainer}>
                        <Text style={styles.winTitle}>FIN DEL DUELO</Text>
                        <Text style={styles.winText}>{vm.mensajeFinal.toUpperCase()}</Text>
                        
                        <View style={styles.timerContainer}>
                            <Text style={styles.timerNumber}>{vm.contador}</Text>
                            <View style={styles.progressBarBg}>
                                {/* ✅ Barra de progreso animada según el contador */}
                                <View style={[styles.progressBarFill, { width: `${(vm.contador || 0) * 20}%` }]} />
                            </View>
                        </View>
                        
                        <Text style={styles.restartingText}>VOLVIENDO AL MENÚ...</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    mainWrapper: { flex: 1, backgroundColor: '#0f0e17' },
    container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
    
    // Login
    loginCard: { backgroundColor: '#16161a', padding: 40, borderRadius: 25, width: '100%', borderWidth: 1, borderColor: '#242629' },
    logoContainer: { alignItems: 'center', marginBottom: 30 },
    logoEmoji: { fontSize: 50, marginBottom: 10 },
    title: { fontSize: 32, fontWeight: '900', color: '#fffffe', letterSpacing: 2 },
    subtitle: { fontSize: 14, color: '#72757e', letterSpacing: 4, marginTop: 5 },
    input: { backgroundColor: '#242629', borderRadius: 12, padding: 18, fontSize: 16, color: '#fffffe', marginBottom: 20, borderWidth: 1, borderColor: '#444' },
    
    errorBanner: {
        backgroundColor: 'rgba(255, 46, 99, 0.15)',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ff2e63',
    },
    errorText: {
        color: '#ff2e63',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 14,
    },

    button: { 
        backgroundColor: '#7f5af0', 
        padding: 20, 
        borderRadius: 12, 
        alignItems: 'center', 
        ...Platform.select({
            web: {
                boxShadow: '0px 0px 10px rgba(127, 90, 240, 0.5)',
            },
            ios: {
                shadowColor: '#7f5af0',
                shadowOpacity: 0.5,
                shadowRadius: 10,
            },
            android: {
                elevation: 5,
            }
        })
    },
    
    buttonDisabled: { 
        backgroundColor: '#444', 
        ...Platform.select({
            web: { boxShadow: 'none' },
            default: { shadowOpacity: 0, elevation: 0 }
        })
    },
    
    buttonText: { color: '#fffffe', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

    // Game Area
    gameArea: { width: '100%', alignItems: 'center' },
    topInfo: { marginBottom: 30, alignItems: 'center' },
    badge: { backgroundColor: '#242629', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 8, marginBottom: 12 },
    badgeText: { color: '#94a1b2', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
    turnInfo: { fontSize: 24, fontWeight: '900', letterSpacing: 1 },

    // Board
    boardWrapper: { padding: 15, backgroundColor: '#16161a', borderRadius: 20, borderWidth: 1, borderColor: '#242629' },
    board: { backgroundColor: '#0f0e17', borderRadius: 10, overflow: 'hidden' },
    row: { flexDirection: 'row' },
    cell: { width: 90, height: 90, backgroundColor: '#16161a', margin: 3, alignItems: 'center', justifyContent: 'center', borderRadius: 5, borderWidth: 1, borderColor: '#242629' },
    cellOccupied: { backgroundColor: '#1f1f25' },
    cellText: { fontSize: 50, fontWeight: '900' },
    
    glowX: { 
        color: '#00d4ff',
        ...Platform.select({
            web: { textShadow: '0px 0px 15px #00d4ff' },
            default: { textShadowColor: '#00d4ff', textShadowRadius: 15 }
        })
    },
    
    glowO: { 
        color: '#ff2e63',
        ...Platform.select({
            web: { textShadow: '0px 0px 15px #ff2e63' },
            default: { textShadowColor: '#ff2e63', textShadowRadius: 15 }
        })
    },

    // Players
    playerContainer: { marginTop: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
    playerCard: { flex: 1, padding: 15, backgroundColor: '#16161a', borderRadius: 15, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
    activePlayerX: { borderColor: '#00d4ff', backgroundColor: '#003544' },
    activePlayerO: { borderColor: '#ff2e63', backgroundColor: '#440019' },
    playerIcon: { fontSize: 20, marginBottom: 5 },
    playerName: { color: '#fffffe', fontSize: 14, fontWeight: 'bold' },
    vsBadge: { marginHorizontal: 10, backgroundColor: '#242629', padding: 8, borderRadius: 20 },
    vsText: { color: '#72757e', fontSize: 10, fontWeight: 'bold' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
    winContainer: { backgroundColor: '#16161a', padding: 40, borderRadius: 30, alignItems: 'center', width: '85%', borderWidth: 2, borderColor: '#7f5af0' },
    winTitle: { fontSize: 14, color: '#72757e', letterSpacing: 5, marginBottom: 10 },
    winText: { fontSize: 32, fontWeight: '900', color: '#fffffe', marginBottom: 30, textAlign: 'center' },
    timerContainer: { alignItems: 'center', width: '100%' },
    timerNumber: { fontSize: 60, fontWeight: '900', color: '#7f5af0', marginBottom: 10 },
    progressBarBg: { width: '100%', height: 6, backgroundColor: '#242629', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#7f5af0' },
    restartingText: { color: '#72757e', marginTop: 20, fontSize: 12, letterSpacing: 1 }
});