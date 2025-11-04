import React, { useState, createContext, useContext, useEffect } from 'react';

// Firebase setup with fallback - Using mock for demonstration
let db = null;
let firebaseReady = false;

// Firebase mock for demonstration when library is not available
function initializeFirebaseMock() {
  console.log('🔧 Firebase mock inicializado para demonstração');
  
  const mockCollections = {};
  
  return {
    async setDoc(docRef, data) {
      const sessionId = docRef.id || docRef.path?.split('/')?.pop() || 'unknown';
      mockCollections[sessionId] = {
        ...data,
        id: sessionId
      };
      console.log(`✅ [MOCK] Sessão criada: ${sessionId}`, data);
      return Promise.resolve();
    },
    async getDoc(docRef) {
      const sessionId = docRef.id || docRef.path?.split('/')?.pop() || 'unknown';
      const exists = sessionId in mockCollections;
      return {
        exists: () => exists,
        data: () => exists ? mockCollections[sessionId] : null
      };
    },
    doc: (collection, id) => ({ id, path: `${collection}/${id}` })
  };
}

// Initialize mock Firebase immediately
function initializeMockFirebase() {
  db = initializeFirebaseMock();
  firebaseReady = true;
  console.log('✅ Firebase/Mock pronto para uso');
}

// Initialize immediately
initializeMockFirebase();

// Mock Data - Acordes (Chord)
const CHORDS_DATA = [
  {
    id: 'am',
    name: 'Am',
    fullName: 'La menor',
    notes: ['A', 'C', 'E'],
    root: 'A',
    quality: 'minor',
    intervals: ['1', 'b3', '5'],
    scaleNotes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'A'],
    scaleType: 'Natural Minor'
  },
  {
    id: 'd7',
    name: 'D7',
    fullName: 'Ré dominante 7',
    notes: ['D', 'F#', 'A', 'C'],
    root: 'D',
    quality: 'dominant7',
    intervals: ['1', '3', '5', 'b7'],
    scaleNotes: ['D', 'E', 'F#', 'G', 'A', 'B', 'C', 'D'],
    scaleType: 'Major'
  },
  {
    id: 'g',
    name: 'G',
    fullName: 'Sol maior',
    notes: ['G', 'B', 'D'],
    root: 'G',
    quality: 'major',
    intervals: ['1', '3', '5'],
    scaleNotes: ['G', 'A', 'B', 'C', 'D', 'E', 'F#', 'G'],
    scaleType: 'Major'
  },
  {
    id: 'dm7',
    name: 'Dm7',
    fullName: 'Ré menor 7',
    notes: ['D', 'F', 'A', 'C'],
    root: 'D',
    quality: 'minor7',
    intervals: ['1', 'b3', '5', 'b7'],
    scaleNotes: ['D', 'E', 'F', 'G', 'A', 'B', 'C', 'D'],
    scaleType: 'Natural Minor'
  },
  {
    id: 'g7',
    name: 'G7',
    fullName: 'Sol dominante 7',
    notes: ['G', 'B', 'D', 'F'],
    root: 'G',
    quality: 'dominant7',
    intervals: ['1', '3', '5', 'b7'],
    scaleNotes: ['G', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
    scaleType: 'Major'
  },
  {
    id: 'cmaj7',
    name: 'Cmaj7',
    fullName: 'Dó maior 7',
    notes: ['C', 'E', 'G', 'B'],
    root: 'C',
    quality: 'major7',
    intervals: ['1', '3', '5', '7'],
    scaleNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'],
    scaleType: 'Major'
  },
  {
    id: 'c7',
    name: 'C7',
    fullName: 'Dó dominante 7',
    notes: ['C', 'E', 'G', 'Bb'],
    root: 'C',
    quality: 'dominant7',
    intervals: ['1', '3', '5', 'b7'],
    scaleNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'C'],
    scaleType: 'Major'
  },
  {
    id: 'f7',
    name: 'F7',
    fullName: 'Fá dominante 7',
    notes: ['F', 'A', 'C', 'Eb'],
    root: 'F',
    quality: 'dominant7',
    intervals: ['1', '3', '5', 'b7'],
    scaleNotes: ['F', 'G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'],
    scaleType: 'Major'
  }
];

// Mock Data - Progressões (Progression)
const PROGRESSIONS_DATA = [
  {
    id: 'turnaround',
    name: 'Turnaround Clássico',
    chords: ['am', 'd7', 'g', 'd7'],
    key: 'G major',
    tempo: 120,
    loop: true
  },
  {
    id: 'ii-v-i',
    name: 'II-V-I',
    chords: ['dm7', 'g7', 'cmaj7'],
    key: 'C major',
    tempo: 140,
    loop: true
  },
  {
    id: 'blues-basic',
    name: 'Blues Básico',
    chords: ['c7', 'c7', 'f7', 'f7', 'c7', 'c7', 'g7', 'f7', 'c7', 'g7'],
    key: 'C major',
    tempo: 100,
    loop: true
  }
];

// Session Context
const SessionContext = createContext();

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

// Hook personalizado para participantes (modo escuta)
function useParticipantSession(sessionId) {
  const [remoteSession, setRemoteSession] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  useEffect(() => {
    if (!sessionId || !db) return;

    setConnectionError('');
    
    // Configurar onSnapshot para escutar mudanças na sessão
    const sessionDocRef = db.doc('sessions', sessionId);
    
    console.log(`🔗 [PARTICIPANTE] Conectando à sessão ${sessionId}...`);
    
    // Usar onSnapshot para escutar mudanças em tempo real
    if (db.onSnapshot) {
      const unsubscribe = db.onSnapshot(sessionDocRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setRemoteSession(data);
          setIsConnected(true);
          setConnectionError('');
          console.log(`✅ [PARTICIPANTE] Sessão atualizada:`, data);
        } else {
          setConnectionError('Sessão não encontrada');
          setIsConnected(false);
        }
      }, (error) => {
        console.error('❌ [PARTICIPANTE] Erro na conexão:', error);
        setConnectionError('Erro ao conectar com a sessão');
        setIsConnected(false);
      });

      // Cleanup function
      return () => {
        console.log(`🔌 [PARTICIPANTE] Desconectando da sessão ${sessionId}`);
        unsubscribe();
      };
    } else {
      // Fallback para modo mock - simular atualizações
      console.log(`🎭 [PARTICIPANTE] Usando modo mock para sessão ${sessionId}`);
      
      let mockUpdateInterval;
      const checkMockUpdates = () => {
        // Simular estado inicial da sessão
        setRemoteSession({
          bpm: 120,
          isPlaying: false,
          currentProgression: PROGRESSIONS_DATA[0],
          currentChordIndex: 0,
          createdAt: new Date().toISOString(),
          participants: ['mock-participant']
        });
        setIsConnected(true);
        
        // Simular desconexão periódica para demonstrar
        mockUpdateInterval = setInterval(() => {
          setConnectionError('Simulando falha de rede...');
          setTimeout(() => setConnectionError(''), 2000);
        }, 30000);
      };
      
      checkMockUpdates();
      
      return () => {
        if (mockUpdateInterval) {
          clearInterval(mockUpdateInterval);
        }
      };
    }
  }, [sessionId, db]);

  return {
    remoteSession,
    isConnected,
    connectionError,
    
    // Converte dados remotos para formato compatível com UI
    getSessionData() {
      if (!remoteSession) return null;
      
      return {
        ...remoteSession,
        currentChord: remoteSession.currentProgression ? 
          remoteSession.currentProgression.chords[remoteSession.currentChordIndex] : null,
        nextChord: remoteSession.currentProgression ? 
          (remoteSession.currentProgression.chords[remoteSession.currentChordIndex + 1] ||
           (remoteSession.currentProgression.loop ? remoteSession.currentProgression.chords[0] : null)) : null,
        progressPercentage: remoteSession.currentProgression ? 
          ((remoteSession.currentChordIndex + 1) / remoteSession.currentProgression.chords.length) * 100 : 0
      };
    }
  };
}

// Hook useMetronome
function useMetronome() {
  const { 
    currentProgression, 
    currentChordIndex, 
    setCurrentChordIndex: handleChordChange, 
    isPlaying, 
    bpm,
    isConductor,
    sessionId
  } = useSession();

  useEffect(() => {
    if (!isPlaying || !currentProgression || (isConductor && !sessionId)) return;

    const interval = Math.floor(60000 / bpm); // Calcula intervalo baseado no BPM
    const timer = setInterval(() => {
      handleChordChange((prevIndex) => {
        const nextIndex = prevIndex + 1;
        // Se chegou ao final da progressão e não é loop, para a execução
        if (nextIndex >= currentProgression.chords.length) {
          if (currentProgression.loop) {
            return 0;
          } else {
            return prevIndex; // Para no último acorde
          }
        }
        return nextIndex;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, bpm, currentProgression, handleChordChange, isConductor, sessionId]);
}

// Session Provider
function SessionProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentProgression, setCurrentProgression] = useState(PROGRESSIONS_DATA[0]);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [isParticipantMode, setIsParticipantMode] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isConductor, setIsConductor] = useState(false); // true se está controlando uma sessão
  const [syncError, setSyncError] = useState('');

  // Função para salvar estado no Firestore (condutor)
  const saveToFirestore = async (updates) => {
    if (!isConductor || !sessionId || !db) return;
    
    try {
      const sessionDocRef = db.doc('sessions', sessionId);
      await db.setDoc(sessionDocRef, {
        ...updates,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      
      console.log(`💾 [CONDUTOR] Estado salvo:`, updates);
    } catch (error) {
      console.error('❌ [CONDUTOR] Erro ao salvar no Firestore:', error);
      setSyncError('Erro ao sincronizar com a sessão');
    }
  };

  // Função para lidar com mudanças de acorde (usada pelo useMetronome)
  const handleChordChange = async (newIndex) => {
    setCurrentChordIndex(newIndex);
    
    // Se for condutor, salvar a mudança no Firestore
    if (isConductor && isPlaying) {
      await saveToFirestore({
        currentChordIndex: newIndex,
        isPlaying: isPlaying
      });
    }
  };

  // Função para lidar com mudanças de BPM
  const handleBpmChange = async (newBpm) => {
    setBpm(newBpm);
    
    // Se for condutor, salvar a mudança no Firestore
    if (isConductor) {
      await saveToFirestore({
        bpm: newBpm
      });
    }
  };

  // Função para lidar com mudanças de reprodução
  const handlePlayChange = async (newIsPlaying) => {
    setIsPlaying(newIsPlaying);
    
    // Se for condutor, salvar a mudança no Firestore
    if (isConductor) {
      await saveToFirestore({
        isPlaying: newIsPlaying,
        currentChordIndex: newIsPlaying ? currentChordIndex : currentChordIndex
      });
    }
  };

  // Função para lidar com mudanças de progressão
  const handleProgressionChange = async (newProgression) => {
    setCurrentProgression(newProgression);
    setCurrentChordIndex(0); // Reset para o início
    
    // Se for condutor, salvar a mudança no Firestore
    if (isConductor) {
      await saveToFirestore({
        currentProgression: newProgression,
        currentChordIndex: 0
      });
    }
  };

  const value = {
    // Estado
    isPlaying,
    bpm,
    currentProgression,
    currentChordIndex,
    isParticipantMode,
    sessionId,
    isConductor,
    syncError,
    
    // Setters
    setIsPlaying: handlePlayChange,
    setBpm: handleBpmChange,
    setCurrentProgression: handleProgressionChange,
    setCurrentChordIndex: handleChordChange,
    setIsParticipantMode,
    setSessionId,
    setIsConductor,
    
    // Computed values
    currentChord: currentProgression ? currentProgression.chords[currentChordIndex] : null,
    nextChord: currentProgression ? 
      (currentProgression.chords[currentChordIndex + 1] || 
       (currentProgression.loop ? currentProgression.chords[0] : null)) : null,
    progressPercentage: currentProgression ? 
      ((currentChordIndex + 1) / currentProgression.chords.length) * 100 : 0
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

// Componente Tela do Músico (Screen_PlayAlong)
function Screen_PlayAlong() {
  const { 
    isParticipantMode,
    sessionId,
    isConductor
  } = useSession();
  
  // Se for participante, usar o hook de escuta
  const participantSession = useParticipantSession(sessionId);
  
  // Estados locais apenas para participantes
  const [activeTab, setActiveTab] = useState('harmony');
  
  // Dados da sessão (local para solo/condutor, remoto para participante)
  let sessionData;
  
  if (isParticipantMode) {
    // Modo participante - usar dados remotos
    sessionData = participantSession.getSessionData();
    
    if (!sessionData) {
      return (
        <div className="max-w-md mx-auto bg-white min-h-screen p-4 flex items-center justify-center">
          <div className="text-center">
            {participantSession.connectionError ? (
              <div>
                <p className="text-red-500 mb-2">⚠️ {participantSession.connectionError}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Tentar Novamente
                </button>
              </div>
            ) : (
              <p className="text-gray-500">Conectando à sessão...</p>
            )}
          </div>
        </div>
      );
    }
  } else {
    // Modo solo/condutor - usar contexto local
    const { 
      currentChord, 
      nextChord, 
      currentProgression, 
      progressPercentage,
      isPlaying,
      bpm 
    } = useSession();
    
    sessionData = {
      currentChord,
      nextChord,
      currentProgression,
      progressPercentage,
      isPlaying,
      bpm
    };
  }
  
  const currentChordData = CHORDS_DATA.find(chord => chord.id === sessionData.currentChord);
  const nextChordData = CHORDS_DATA.find(chord => chord.id === sessionData.nextChord);

  // Verificar se os dados estão disponíveis
  if (!sessionData.currentChord || !sessionData.currentProgression) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen p-4 flex items-center justify-center">
        <p className="text-gray-500">Configurando sessão...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Harmony Play-Along</h1>
        
        {/* Indicador de Modo */}
        {isParticipantMode && (
          <div className="mb-2">
            <span className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              <span>🤝</span>
              <span>Participante • Sessão {sessionId}</span>
            </span>
          </div>
        )}
        
        {isConductor && sessionId && (
          <div className="mb-2">
            <span className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <span>🎤</span>
              <span>Condutor • Sessão {sessionId}</span>
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <span>🎵</span>
          <span>{sessionData.currentProgression.name}</span>
        </div>
      </div>

      {/* Acorde Atual */}
      <div className="text-center mb-6">
        <div className="mb-4">
          <div className="text-6xl font-bold text-gray-900 mb-2">
            {currentChordData.name}
          </div>
          <div className="text-lg text-gray-600">
            {currentChordData.fullName}
          </div>
        </div>

        {/* Próximo Acorde */}
        <div className="border-t pt-4">
          <div className="text-sm text-gray-500 mb-2">Próximo:</div>
          <div className="text-2xl font-semibold text-gray-700">
            {nextChordData.name}
          </div>
        </div>
      </div>

      {/* Barra de Progresso Visual (Dinâmica) */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Início</span>
          <span>Fim</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              sessionData.isPlaying ? 'bg-green-500' : 'bg-blue-600'
            }`}
            style={{width: `${sessionData.progressPercentage}%`}}
          ></div>
        </div>
      </div>

      {/* Componentes de Abas */}
      {(() => {
        const TabButton = ({ id, children, isActive, onClick }) => (
          <button
            onClick={() => onClick(id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              isActive 
                ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {children}
          </button>
        );

        const renderHarmonyTab = () => (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Notas do Acorde</h3>
              <div className="flex flex-wrap gap-2">
                {currentChordData.notes.map((note, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-lg font-medium"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Intervalos</h3>
              <div className="flex flex-wrap gap-2">
                {currentChordData.intervals.map((interval, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {interval}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

        const renderMelodyTab = () => (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Escala de {currentChordData.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{currentChordData.scaleType}</p>
              <div className="flex flex-wrap gap-2">
                {currentChordData.scaleNotes.map((note, index) => (
                  <span 
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentChordData.notes.includes(note) 
                        ? 'bg-red-100 text-red-800 border-2 border-red-300' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {note}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Notas em vermelho são as notas do acorde atual
              </p>
            </div>
          </div>
        );

        return (
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <TabButton 
                id="harmony" 
                isActive={activeTab === 'harmony'} 
                onClick={setActiveTab}
              >
                Harmonia
              </TabButton>
              <TabButton 
                id="melody" 
                isActive={activeTab === 'melody'} 
                onClick={setActiveTab}
              >
                Melodia
              </TabButton>
            </div>
            
            <div className="mt-4">
              {activeTab === 'harmony' && renderHarmonyTab()}
              {activeTab === 'melody' && renderMelodyTab()}
            </div>
          </div>
        );
      })()}

      {/* Informações Adicionais */}
      <div className="text-center text-xs text-gray-500">
        <p>Chave: {sessionData.currentProgression.key} | BPM: {sessionData.bpm}</p>
        <p className={`mt-1 ${sessionData.isPlaying ? 'text-green-600' : 'text-gray-500'}`}>
          {sessionData.isPlaying ? '▶️ Tocando...' : '⏸️ Pausado'}
        </p>
        
        {/* Status de Conexão para Participantes */}
        {isParticipantMode && (
          <div className="mt-2">
            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs ${
              participantSession.isConnected 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              <span>{participantSession.isConnected ? '🔗' : '⚠️'}</span>
              <span>{participantSession.isConnected ? 'Conectado' : 'Conectando...'}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente Screen_Control (Quartel-General)
function Screen_Control({ onNavigateToNavigator }) {
  const [activeTab, setActiveTab] = useState('presets');
  const { 
    isPlaying, 
    setIsPlaying, 
    bpm, 
    setBpm, 
    currentProgression, 
    setCurrentProgression,
    currentChordIndex,
    setCurrentChordIndex
  } = useSession();

  const TabButton = ({ id, children, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {children}
    </button>
  );

  const PresetsTab = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Selecionar Progressão</h3>
        <div className="space-y-2">
          {PROGRESSIONS_DATA.map((progression) => (
            <button
              key={progression.id}
              onClick={() => setCurrentProgression(progression)}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                currentProgression.id === progression.id
                  ? 'bg-blue-100 border-2 border-blue-500 text-blue-900'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{progression.name}</div>
              <div className="text-sm text-gray-500">
                {progression.key} • {progression.tempo} BPM • {progression.chords.length} acordes
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {progression.chords.map((chordId, index) => {
                  const chord = CHORDS_DATA.find(c => c.id === chordId);
                  return (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                    >
                      {chord?.name || chordId}
                    </span>
                  );
                })}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const GeradorTab = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Configurações de BPM</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              BPM: {bpm}
            </label>
            <input
              type="range"
              min="60"
              max="200"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>60</span>
              <span>200</span>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setBpm(60)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
            >
              Lento
            </button>
            <button
              onClick={() => setBpm(120)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
            >
              Moderado
            </button>
            <button
              onClick={() => setBpm(180)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
            >
              Rápido
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const CondutorTab = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Controles de Sessão</h3>
        
        {/* Informações da Sessão */}
        <div className="bg-white p-3 rounded border mb-4">
          <div className="text-sm text-gray-600 mb-2">Progressão Atual:</div>
          <div className="font-medium text-gray-900">{currentProgression.name}</div>
          <div className="text-xs text-gray-500">
            {currentProgression.key} • {bpm} BPM
          </div>
        </div>

        {/* Controles de Reprodução */}
        <div className="space-y-3">
          <button
            onClick={() => {
              if (isPlaying) {
                setIsPlaying(false);
              } else {
                setCurrentChordIndex(0); // Reinicia a progressão
                setIsPlaying(true);
              }
            }}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              isPlaying 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isPlaying ? '⏹️ Parar' : '▶️ Iniciar Jam'}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCurrentChordIndex(Math.max(0, currentChordIndex - 1))}
              disabled={currentChordIndex === 0}
              className="py-2 px-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setCurrentChordIndex(currentChordIndex + 1)}
              disabled={!currentProgression || currentChordIndex >= currentProgression.chords.length - 1}
              className="py-2 px-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo →
            </button>
          </div>

          <button
            onClick={() => {
              setCurrentChordIndex(0);
              setIsPlaying(false);
            }}
            className="w-full py-2 px-3 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            🔄 Resetar Progressão
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Painel de Controle</h1>
        <div className="text-sm text-gray-600">
          Configurações e controles da sessão
        </div>
      </div>

      {/* Abas */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <TabButton 
            id="presets" 
            isActive={activeTab === 'presets'} 
            onClick={setActiveTab}
          >
            Presets
          </TabButton>
          <TabButton 
            id="gerador" 
            isActive={activeTab === 'gerador'} 
            onClick={setActiveTab}
          >
            Gerador
          </TabButton>
          <TabButton 
            id="condutor" 
            isActive={activeTab === 'condutor'} 
            onClick={setActiveTab}
          >
            Condutor
          </TabButton>
        </div>
        
        <div className="mt-4">
          {activeTab === 'presets' && <PresetsTab />}
          {activeTab === 'gerador' && <GeradorTab />}
          {activeTab === 'condutor' && <CondutorTab />}
        </div>
      </div>

      {/* Navegador Harmônico - Botão de acesso rápido */}
      <div className="mt-6 mb-4">
        <button
          onClick={onNavigateToNavigator}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg"
        >
          <div className="flex items-center justify-center space-x-3">
            <span className="text-2xl">🧭</span>
            <div className="text-left">
              <div>Navegador Harmônico</div>
              <div className="text-sm opacity-90">Explore progressões entre acordes</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

// Screen_Lobby (Tela de Entrada)
function Screen_Lobby({ onNavigateToControl, onNavigateToPlayAlong }) {
  const [joinSessionId, setJoinSessionId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [isDbReady, setIsDbReady] = useState(false);

  // Wait for Firebase to be ready
  useEffect(() => {
    const checkDbReady = () => {
      if (db && firebaseReady) {
        setIsDbReady(true);
      } else {
        setTimeout(checkDbReady, 100);
      }
    };
    checkDbReady();
  }, []);

  // Função para gerar código de sessão de 4 letras
  const generateSessionId = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return result;
  };

  // Função para criar nova sessão
  const handleCreateSession = async () => {
    if (!isDbReady) {
      setError('Aguardando conexão com o banco de dados...');
      return;
    }

    setIsCreating(true);
    setError('');
    
    try {
      // Gerar ID único para a sessão
      const sessionId = generateSessionId();
      
      // Criar documento da sessão no Firestore
      const sessionData = {
        bpm: 120,
        isPlaying: false,
        currentProgression: PROGRESSIONS_DATA[0], // Progressão padrão
        currentChordIndex: 0,
        createdAt: new Date().toISOString(),
        participants: []
      };
      
      await db.setDoc(db.doc('sessions', sessionId), sessionData);
      
      console.log(`✅ Sessão criada com ID: ${sessionId}`);
      
      // Navegar para o painel de controle (modo criador/condutor)
      onNavigateToControl(sessionId, true); // true = é condutor
    } catch (error) {
      console.error('❌ Erro ao criar sessão:', error);
      setError('Erro ao criar sessão. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  // Função para entrar em sessão existente
  const handleJoinSession = async () => {
    if (!joinSessionId.trim()) {
      setError('Por favor, digite um código de sessão.');
      return;
    }

    if (!isDbReady) {
      setError('Aguardando conexão com o banco de dados...');
      return;
    }

    setIsJoining(true);
    setError('');
    
    try {
      const sessionId = joinSessionId.toUpperCase().trim();
      
      // Verificar se a sessão existe
      const sessionDoc = await db.getDoc(db.doc('sessions', sessionId));
      
      if (sessionDoc.exists()) {
        console.log(`✅ Entrando na sessão: ${sessionId}`);
        
        // Navegar para tela de prática (modo participante)
        onNavigateToPlayAlong(sessionId, true); // true = é participante
      } else {
        setError('Sessão não encontrada. Verifique o código e tente novamente.');
      }
    } catch (error) {
      console.error('❌ Erro ao entrar na sessão:', error);
      setError('Erro ao conectar com a sessão. Tente novamente.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">🎵</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Harmony Play-Along</h1>
        <p className="text-gray-600">Sua sessão musical digital</p>
      </div>

      {/* Status do Banco de Dados */}
      <div className="text-center mb-4">
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
          isDbReady 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          <span>{isDbReady ? '🟢' : '🟡'}</span>
          <span>
            {isDbReady 
              ? 'Conectado ao Firebase' 
              : 'Conectando ao Firebase...'}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Opções */}
      <div className="space-y-4">
        {/* Praticar Sozinho */}
        <button
          onClick={onNavigateToControl}
          className="w-full p-6 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-lg transition-colors"
        >
          <div className="flex items-center justify-center space-x-3">
            <span>🎸</span>
            <div className="text-left">
              <div>Praticar Sozinho</div>
              <div className="text-sm opacity-90">Modo solo sem limitações</div>
            </div>
          </div>
        </button>

        {/* Criar Jam em Grupo */}
        <button
          onClick={handleCreateSession}
          disabled={isCreating}
          className="w-full p-6 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg font-semibold text-lg transition-colors"
        >
          <div className="flex items-center justify-center space-x-3">
            <span>🎤</span>
            <div className="text-left">
              <div>{isCreating ? 'Criando...' : 'Criar Jam em Grupo'}</div>
              <div className="text-sm opacity-90">Criar sessão e convidar outros</div>
            </div>
          </div>
        </button>

        {/* Entrar em Jam */}
        <div className="w-full p-6 bg-gray-50 border-2 border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-4">
            <span>🤝</span>
            <div>
              <div className="font-semibold text-gray-900">Entrar em Jam</div>
              <div className="text-sm text-gray-600">Entrar em sessão existente</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <input
              type="text"
              value={joinSessionId}
              onChange={(e) => setJoinSessionId(e.target.value.toUpperCase())}
              placeholder="Digite o código (ex: ABCD)"
              maxLength={4}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono text-lg uppercase"
            />
            <button
              onClick={handleJoinSession}
              disabled={isJoining || !joinSessionId.trim()}
              className="w-full p-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded font-medium transition-colors"
            >
              {isJoining ? 'Conectando...' : 'Entrar'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-sm text-gray-500">
        <p>Aplicativo para prática de harmonia e improvisação</p>
        <p className="mt-1">Versão 1.0</p>
      </div>
    </div>
  );
}

// Screen_Navigator (Navegador Harmônico)
function Screen_Navigator({ onNavigateToControl, onSetCustomProgression }) {
  const [fromChord, setFromChord] = useState('');
  const [toChord, setToChord] = useState('');
  const [middleChords, setMiddleChords] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Função para sugerir progressões entre dois acordes
  const suggestProgressions = () => {
    if (!fromChord || !toChord) return;
    
    setIsLoading(true);
    
    // Simular processamento
    setTimeout(() => {
      const suggestions = [];
      
      // Baseado na teoria harmônica, sugerir progressões comuns
      const chordTransitions = {
        'Am-G': ['D7', 'F', 'C', 'Em'],
        'G-Am': ['D7', 'F', 'C', 'Em'],
        'Dm7-G7': ['C', 'Cmaj7', 'Am'],
        'G7-C': ['F', 'Dm7', 'Am'],
        'Am-C': ['G', 'F', 'Dm7'],
        'G-D7': ['Am', 'C', 'Em'],
        'F-G7': ['C', 'Am', 'Dm7']
      };
      
      const key = `${fromChord}-${toChord}`;
      const reverseKey = `${toChord}-${fromChord}`;
      
      const suggestedMiddle = chordTransitions[key] || chordTransitions[reverseKey] || [
        'D7', 'F', 'C', 'G7', 'Am'
      ];
      
      suggestions.push({
        id: 'suggested1',
        name: `${fromChord} → ${toChord}`,
        chords: [fromChord, ...suggestedMiddle.slice(0, 2), toChord],
        description: 'Progressão harmônica sugerida'
      });
      
      // Adicionar variações
      suggestions.push({
        id: 'variation1',
        name: `${fromChord} → ${toChord} (Var. 1)`,
        chords: [fromChord, 'G7', 'C', toChord],
        description: 'Com dominant secondary'
      });
      
      suggestions.push({
        id: 'variation2',
        name: `${fromChord} → ${toChord} (Var. 2)`,
        chords: [fromChord, 'Dm7', 'G7', toChord],
        description: 'Com ii-V simples'
      });
      
      setSuggestions(suggestions);
      setIsLoading(false);
    }, 800);
  };

  // Função para criar progressão customizada
  const handleCreateCustomProgression = (chords, name) => {
    const customProgression = {
      id: 'custom',
      name: name || `${fromChord} → ${toChord}`,
      chords: chords,
      key: 'Custom',
      tempo: 120,
      loop: true
    };
    
    onSetCustomProgression(customProgression);
    onNavigateToControl();
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Navegador Harmônico</h1>
        <div className="text-sm text-gray-600">
          Explore progressões entre acordes
        </div>
      </div>

      {/* Formulário */}
      <div className="space-y-4 mb-6">
        {/* De */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            De:
          </label>
          <select
            value={fromChord}
            onChange={(e) => setFromChord(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione um acorde</option>
            {CHORDS_DATA.map((chord) => (
              <option key={chord.id} value={chord.id}>
                {chord.name} ({chord.fullName})
              </option>
            ))}
          </select>
        </div>

        {/* Para */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Para:
          </label>
          <select
            value={toChord}
            onChange={(e) => setToChord(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione um acorde</option>
            {CHORDS_DATA.map((chord) => (
              <option key={chord.id} value={chord.id}>
                {chord.name} ({chord.fullName})
              </option>
            ))}
          </select>
        </div>

        {/* Acordes no meio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Acordes no meio (opcional):
          </label>
          <input
            type="text"
            value={middleChords}
            onChange={(e) => setMiddleChords(e.target.value)}
            placeholder="Ex: D7, G7, C (separados por vírgula)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Botão Sugerir */}
        <button
          onClick={suggestProgressions}
          disabled={!fromChord || !toChord || isLoading}
          className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
        >
          {isLoading ? 'Analisando...' : '🎯 Sugerir Progressões'}
        </button>
      </div>

      {/* Resultados */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Progressões Sugeridas
          </h3>
          
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{suggestion.name}</h4>
                  <p className="text-sm text-gray-600">{suggestion.description}</p>
                </div>
              </div>
              
              {/* Visualização dos acordes */}
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestion.chords.map((chordId, index) => {
                  const chord = CHORDS_DATA.find(c => c.id === chordId);
                  return (
                    <div key={index} className="flex items-center">
                      <span className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-medium">
                        {chord?.name || chordId}
                      </span>
                      {index < suggestion.chords.length - 1 && (
                        <span className="mx-2 text-gray-400">→</span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Botão Praticar */}
              <button
                onClick={() => handleCreateCustomProgression(suggestion.chords, suggestion.name)}
                className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors"
              >
                🎵 Praticar Esta Progressão
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Progressão customizada manual */}
      {middleChords && fromChord && toChord && (
        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Sua Progressão Personalizada</h4>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-medium">
              {fromChord}
            </span>
            <span className="text-gray-400">→</span>
            {middleChords.split(',').map((chord, index) => (
              <React.Fragment key={index}>
                <span className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-medium">
                  {chord.trim()}
                </span>
                {index < middleChords.split(',').length - 1 && (
                  <span className="text-gray-400">→</span>
                )}
              </React.Fragment>
            ))}
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-medium">
              {toChord}
            </span>
          </div>
          
          <button
            onClick={() => {
              const allChords = [fromChord, ...middleChords.split(',').map(c => c.trim()), toChord];
              handleCreateCustomProgression(allChords, `${fromChord} → ${toChord} (Personalizada)`);
            }}
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors"
          >
            🎵 Praticar Minha Progressão
          </button>
        </div>
      )}

      {/* Botão Voltar */}
      <div className="mt-6">
        <button
          onClick={onNavigateToControl}
          className="w-full py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          ← Voltar ao Painel de Controle
        </button>
      </div>
    </div>
  );
}

// Componente App Principal
function App() {
  const [currentScreen, setCurrentScreen] = useState('lobby');
  const { 
    currentProgression, 
    setSessionId, 
    setIsConductor, 
    setIsParticipantMode,
    setCurrentProgression,
    isParticipantMode,
    sessionId
  } = useSession();
  
  // Hook do metronome (executa toda vez que o componente renderiza)
  useMetronome();

  // Função para definir progressão customizada
  const setCustomProgression = (customProgression) => {
    console.log('🎯 [NAVEGADOR] Nova progressão customizada:', customProgression);
    setCurrentProgression(customProgression);
  };

  // Navegação
  const navigateToLobby = () => {
    setCurrentScreen('lobby');
    // Reset estados quando voltar ao lobby
    setSessionId(null);
    setIsConductor(false);
    setIsParticipantMode(false);
  };

  const navigateToControl = (newSessionId = null, isConductorMode = false) => {
    console.log(`🎛️ [NAVEGAÇÃO] Para controle - SessionID: ${newSessionId}, Condutor: ${isConductorMode}`);
    
    if (newSessionId) {
      setSessionId(newSessionId);
      setIsConductor(isConductorMode);
      setIsParticipantMode(false); // Não é participante
    }
    
    setCurrentScreen('control');
  };

  const navigateToPlayAlong = (newSessionId = null, isParticipant = false) => {
    console.log(`🎵 [NAVEGAÇÃO] Para play along - SessionID: ${newSessionId}, Participante: ${isParticipant}`);
    
    if (newSessionId) {
      setSessionId(newSessionId);
      setIsParticipantMode(isParticipant);
      setIsConductor(false); // Não é condutor
    }
    
    setCurrentScreen('playAlong');
  };

  const navigateToNavigator = () => {
    console.log('🧭 [NAVEGAÇÃO] Para navegador harmônico');
    setCurrentScreen('navigator');
  };

  // Renderização condicional das telas
  if (currentScreen === 'lobby') {
    return (
      <Screen_Lobby 
        onNavigateToControl={navigateToControl}
        onNavigateToPlayAlong={navigateToPlayAlong}
      />
    );
  }

  if (currentScreen === 'playAlong') {
    return (
      <div className="relative">
        <Screen_PlayAlong />
        
        {/* Botão Flutuante para Navegação */}
        <button
          onClick={navigateToControl}
          className="fixed top-4 right-4 z-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-colors"
          title="Ir para Painel de Controle"
        >
          ⚙️
        </button>
      </div>
    );
  }

  if (currentScreen === 'control') {
    return (
      <div className="relative">
        <Screen_Control onNavigateToNavigator={navigateToNavigator} />
        
        {/* Botão Flutuante para Navegação */}
        <button
          onClick={navigateToPlayAlong}
          className="fixed top-4 right-4 z-10 bg-green-600 hover:bg-green-700 text-white rounded-full p-3 shadow-lg transition-colors"
          title="Ir para Tela de Prática"
        >
          🎵
        </button>
        
        {/* Botão para voltar ao Lobby */}
        <button
          onClick={navigateToLobby}
          className="fixed top-4 left-4 z-10 bg-gray-600 hover:bg-gray-700 text-white rounded-full p-3 shadow-lg transition-colors"
          title="Voltar ao Lobby"
        >
          🏠
        </button>
      </div>
    );
  }

  if (currentScreen === 'navigator') {
    return (
      <div className="relative">
        <Screen_Navigator 
          onNavigateToControl={navigateToControl}
          onSetCustomProgression={setCustomProgression}
        />
        
        {/* Botão Flutuante para voltar */}
        <button
          onClick={navigateToControl}
          className="fixed top-4 left-4 z-10 bg-gray-600 hover:bg-gray-700 text-white rounded-full p-3 shadow-lg transition-colors"
          title="Voltar ao Painel de Controle"
        >
          ←
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Tela não encontrada</p>
    </div>
  );
}

function AppWrapper() {
  return (
    <SessionProvider>
      <App />
    </SessionProvider>
  );
}

export default AppWrapper;