# 🎵 Harmony Play-Along v1.0

Aplicativo web responsivo (mobile-first) para prática de harmonia e improvisação musical.

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

A aplicação estará disponível em `http://localhost:3000`

## 📱 Fase 1 ✅ + Fase 2 ✅ + Fase 3 ✅ + Fase 4 ✅ + Fase 5 ✅ - Implementadas

### ✨ Funcionalidades Fase 1

#### 🎼 Dados Mock (Mock Data)
- **3 Acordes**: Am (La menor), D7 (Ré dominante 7), G (Sol maior)
- **1 Progressão**: "Turnaround Clássico" (Am → D7 → G → D7)
- Dados completos incluindo notas, intervalos, escalas e informações tonais

#### 🎯 Interface de Usuário
- **Design Mobile-First**: Interface responsiva e otimizada para mobile
- **Tela Principal (Screen_PlayAlong)**: Interface dedicada para prática musical
- **Gerenciamento de Telas**: Sistema básico de navegação

### ✨ Funcionalidades Fase 2 (NOVO!)

#### 🧠 SessionContext - Gerenciamento de Estado Global
```javascript
// Estado da sessão gerenciado globalmente
{
  isPlaying: false,
  bpm: 120,
  currentProgression: {...},
  currentChordIndex: 0
}
```

#### 🎛️ Painel de Controle (Screen_Control)
**3 Abas Funcionais:**
- **Presets**: Seleção de progressões predefinidas
- **Gerador**: Controle de BPM (60-200)
- **Condutor**: Controles de reprodução (Iniciar/Parar, Navegação)

#### ⏱️ MetronomeEngine (useMetronome Hook)
- **Sincronização Automática**: Avança acordes baseado no BPM
- **Loop de Progressões**: Reinicia automaticamente quando habilitado
- **Controle de Tempo**: Intervalos calculados dinamicamente

#### 🎮 Navegação Intuitiva
- **Botão Flutuante**: Alterna entre Tela de Prática e Painel de Controle
- **Interface Responsiva**: Design consistente em ambas as telas
- **Feedback Visual**: Indicadores de estado (tocando/pausado)

#### 📊 Progressões Expandidas
**3 Progressões Disponíveis:**
- **Turnaround Clássico**: Am → D7 → G → D7 (120 BPM)
- **II-V-I**: Dm7 → G7 → Cmaj7 (140 BPM)  
- **Blues Básico**: C7 → C7 → F7 → F7 → C7 → C7 → G7 → F7 → C7 → G7 (100 BPM)

### 🎨 Melhorias de Design
- **Barra de Progresso Dinâmica**: Mostra progresso real na progressão
- **Indicadores de Estado**: Feedback visual para reprodução (verde/vermelho)
- **Controles Interativos**: Sliders, botões e navegação responsivos
- **Cores Temáticas**: Diferentes cores para diferentes estados

### 📊 Arquitetura Atualizada
```javascript
// Estrutura de Componentes
App
├── SessionProvider (Context Global)
├── App
│   ├── useMetronome (Hook Customizado)
│   └── currentScreen
│       ├── Screen_PlayAlong (Tela de Prática)
│       └── Screen_Control (Painel de Controle)
```

### 🎯 Funcionalidades de Sessão
- **Execução Automática**: Progressões tocam automaticamente
- **Controle Manual**: Botões para avançar/retroceder acordes
- **Reset de Sessão**: Volta ao início da progressão
- **Informações Dinâmicas**: BPM atual, progresso, estado da sessão

### ✨ Funcionalidades Fase 4 (NOVO!)

#### 🎛️ Sincronização em Tempo Real (Condutor ↔ Participante)

##### **Modo Condutor (Controlador da Sessão)**
**Screen_Control Refatorado:**
- **Detecção Automática**: Identifica se está em modo solo ou condutor (multiplayer)
- **Sincronização Firestore**: Qualquer mudança (BPM, play/pause, progressão, acorde) é salva no `/sessions/{sessionID}`
- **MetronomeEngine Integrado**: A cada batida, atualiza `currentChordIndex` no Firestore
- **Estado Compartilhado**: BPM, isPlaying, currentProgression sincronizados em tempo real

##### **Modo Participante (Escutador da Sessão)**
**Screen_PlayAlong Refatorado:**
- **onSnapshot Listener**: Escuta mudanças em `/sessions/{sessionID}` via Firestore
- **Parada do Contexto Local**: Não usa mais o SessionContext para estado
- **Dados Remotos**: currentChord, nextChord, progressPercentage vindos do Firestore
- **UI Reativa**: Interface atualiza automaticamente com as mudanças do condutor

#### 🔗 Estados de Aplicação Aprimorados
**3 Modos Distintos:**
- **Solo**: Modo tradicional (Fases 1-2)
- **Condutor**: Controla sessão multiplayer + sincroniza via Firestore
- **Participante**: Segue sessão remota via onSnapshot

**SessionContext Expandido:**
```javascript
{
  // Estados existentes
  isPlaying, bpm, currentProgression, currentChordIndex,
  
  // Novos estados para multiplayer
  sessionId: string,           // ID da sessão atual
  isConductor: boolean,        // true se está controlando sessão
  isParticipantMode: boolean,  // true se está seguindo sessão
  syncError: string,           // Erros de sincronização
  
  // Setters sincronizados
  setBpm: handleBpmChange,     // Auto-save se condutor
  setIsPlaying: handlePlayChange, // Auto-save se condutor
  setCurrentProgression: handleProgressionChange, // Auto-save se condutor
  setCurrentChordIndex: handleChordChange // Called pelo metronome
}
```

#### 🎨 Indicadores Visuais Aprimorados
**Header com Status de Modo:**
- **Condutor**: `🎤 Condutor • Sessão ABCD` (azul)
- **Participante**: `🤝 Participante • Sessão ABCD` (roxo)
- **Solo**: Sem indicador (modo tradicional)

**Status de Conexão (Participantes):**
- **🟢 Conectado**: Sincronização ativa
- **🟡 Conectando...**: Tentativa de conexão
- **⚠️ Erro**: Falha na sincronização

#### 🔄 Sincronização Automática
**MetronomeEngine Condutor:**
- Calcula intervalos baseado no BPM (60000/bpm)
- A cada batida: chama `handleChordChange()`
- `handleChordChange()` salva automaticamente no Firestore se `isConductor = true`
- Participantes recebem atualizações via onSnapshot

#### 🎯 **Fase 3 Funcionalidades (Continuação)**
- **Firestore Setup**: Configuração com fallback inteligente
- **Screen_Lobby**: 3 opções (Solo, Criar Jam, Entrar em Jam)
- **Sessão Multiplayer**: Códigos de 4 letras + validação
- **Estados de Carregamento**: Indicadores visuais para operações

### ✨ Funcionalidades Fase 5 (NOVO!) - Opcional

#### 🧭 Navegador Harmônico

##### **Novo Componente: Screen_Navigator**
**Funcionalidades Exploratórias:**
- **Interface de Navegação Harmônica**: Dropdowns para seleção de acordes origem/destino
- **Sugestões Inteligentes**: Análise automática de progressões baseada em teoria harmônica
- **Progressões Personalizadas**: Campo livre para acordes intermediários (separados por vírgula)
- **Visualização Dinâmica**: Preview visual das progressões antes de praticar

##### **Integração com Screen_Control**
**Botão de Acesso Rápido:**
- **Posicionamento**: Adicionado abaixo das abas principais no Painel de Controle
- **Design Temático**: Gradiente roxo-índigo com ícone de bússola (🧭)
- **Navegação Seamless**: Volta automaticamente ao Screen_Control após salvar progressão

##### **Sugestões Baseadas em Teoria Harmônica**
**Algoritmo de Sugestões:**
- **Cromatismo**: A → B → C → D (diatônico), D7 (dominante), F (subdominante), C (tônica)
- **Progressões Comuns**: 
  - Am ↔ G → D7, F, C, Em
  - Dm7 → G7 → C → Cmaj7, Am
  - Variações ii-V simples para qualquer tonalidade
- **Variações Inteligentes**: Até 3 sugestões diferentes para cada par de acordes

##### **Sistema de Progressões Personalizadas**
**Campo de Input Flexível:**
- **Separação por Vírgulas**: Aceita formatos como "D7, G7, C" 
- **Validação Visual**: Preview imediato da progressão antes de salvar
- **Salvamento Automático**: Cria progressão customizada e retorna ao Screen_Control

##### **Integração com SessionContext**
**Nova Função Global:**
```javascript
// Função para definir progressão customizada
const setCustomProgression = (customProgression) => {
  console.log('🎯 [NAVEGADOR] Nova progressão customizada:', customProgression);
  setCurrentProgression(customProgression);
};
```

##### **Estados de Interface**
**Tratamento de Estados:**
- **Loading State**: "Analisando..." durante processamento
- **Validação**: Dropdowns obrigatórios para habilitar sugestões
- **Feedback Visual**: Transições suaves e indicadores de estado
- **Responsividade**: Interface adaptada para mobile-first

##### **Integração de Navegação**
**Gerenciamento de Telas:**
- **4 Totas Principais**: lobby → control → navigator → playAlong
- **Navegação Contextual**: Cada tela tem botões de volta específicos
- **Estado Persistente**: Progressões customizadas mantêm ID e configurações
- **Integração Firestore**: Progressões personalizadas sincronizadas em sessões multiplayer

## 📁 Estrutura do Projeto
```
harmony-play-along/
├── public/
│   └── music-icon.svg
├── src/
│   ├── App.jsx          # Componentes + Context (Fase 1 & 2)
│   └── main.jsx         # Entry point
├── index.html           # HTML template
├── package.json         # Dependências
├── vite.config.js       # Configuração Vite
└── README.md           # Este arquivo
```

## 🏗️ Próximas Fases
- **Fase 6**: Reprodução de áudio e sons reais
- **Fase 7**: Funcionalidades colaborativas avançadas (chat, usuários)
- **Fase 8**: Editor de progressões personalizadas
- **Fase 9**: Sistema de saving e sessões salvas

---
**Desenvolvido com ❤️ para músicos!** 🎸🎹🥁