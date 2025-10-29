// Voice Commands functionality using Web Speech API
let recognition = null;
let isListening = false;
let voiceCommandsActive = false;
let recognitionState = 'stopped'; // 'stopped', 'starting', 'running', 'stopping'

// Sistema de controle mais rigoroso
let operationInProgress = false;
let lastOperationTime = 0;
let operationQueue = [];
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;
const OPERATION_DEBOUNCE_TIME = 1000; // 1 segundo entre operações

// Função para executar operações de forma segura
function safeExecuteOperation(operation, operationType) {
    const now = Date.now();
    
    // Debounce - evitar operações muito próximas
    if (now - lastOperationTime < OPERATION_DEBOUNCE_TIME) {
        console.log(`⏳ Operação ${operationType} ignorada - muito próxima da anterior`);
        return false;
    }
    
    // Verificar se já há operação em andamento
    if (operationInProgress) {
        console.log(`⏳ Operação ${operationType} adicionada à fila - operação em andamento`);
        operationQueue.push({ operation, operationType });
        return false;
    }
    
    operationInProgress = true;
    lastOperationTime = now;
    
    console.log(`🔄 Executando operação: ${operationType}`);
    
    try {
        const result = operation();
        operationInProgress = false;
        
        // Processar próxima operação na fila
        if (operationQueue.length > 0) {
            const next = operationQueue.shift();
            setTimeout(() => safeExecuteOperation(next.operation, next.operationType), 100);
        }
        
        return result;
    } catch (error) {
        console.error(`❌ Erro na operação ${operationType}:`, error);
        operationInProgress = false;
        return false;
    }
}

// Função para reinicializar completamente o sistema
function reinitializeRecognitionSystem() {
    console.log('🔄 Reinicializando sistema de reconhecimento completamente...');
    
    return safeExecuteOperation(() => {
        // Limpar estado atual
        if (recognition) {
            try {
                recognition.abort();
            } catch (e) {
                console.log('ℹ️ Erro ao abortar reconhecimento anterior (esperado):', e.message);
            }
        }
        
        recognitionState = 'stopped';
        isListening = false;
        recognition = null;
        reconnectAttempts = 0;
        
        // Aguardar um pouco antes de recriar
        setTimeout(() => {
            console.log('🔧 Recriando sistema de reconhecimento...');
            if (setupVoiceCommands()) {
                setTimeout(() => {
                    if (voiceCommandsActive) {
                        startRecognitionSafely();
                    }
                }, 500);
            }
        }, 1000);
        
        return true;
    }, 'reinitialize');
}

// Função segura para iniciar reconhecimento
function startRecognitionSafely() {
    return safeExecuteOperation(() => {
        console.log('🎤 Tentativa segura de iniciar reconhecimento...');
        console.log('📊 Estado atual:', recognitionState);
        
        // Verificações rigorosas
        if (!recognition) {
            console.log('❌ Objeto recognition não existe');
            return false;
        }
        
        if (recognitionState !== 'stopped') {
            console.log(`⚠️ Estado inválido para iniciar: ${recognitionState}`);
            return false;
        }
        
        if (!navigator.onLine) {
            console.log('❌ Sem conexão com internet');
            showVoiceCommandsError('Sem conexão com a internet.');
            return false;
        }
        
        recognitionState = 'starting';
        recognition.start();
        console.log('✅ Comando start() executado com sucesso');
        return true;
    }, 'start');
}

// Função segura para parar reconhecimento
function stopRecognitionSafely() {
    return safeExecuteOperation(() => {
        console.log('🛑 Tentativa segura de parar reconhecimento...');
        console.log('📊 Estado atual:', recognitionState);
        
        if (!recognition) {
            console.log('ℹ️ Reconhecimento já foi destruído');
            recognitionState = 'stopped';
            return true;
        }
        
        if (recognitionState === 'stopped') {
            console.log('ℹ️ Reconhecimento já estava parado');
            return true;
        }
        
        recognitionState = 'stopping';
        recognition.stop();
        console.log('✅ Comando stop() executado com sucesso');
        return true;
    }, 'stop');
}

// Initialize Voice Commands (setup only, doesn't start recognition)
function setupVoiceCommands() {
    console.log('🔧 Configurando comandos de voz...');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('❌ Speech Recognition não suportado neste navegador');
        showVoiceCommandsError('Comandos de voz não são suportados neste navegador. Recomendamos usar Chrome ou Edge.');
        return false;
    }
    
    // Check if running on HTTPS or localhost (required for microphone access)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        console.warn('⚠️ Aviso: Reconhecimento de voz funciona melhor em HTTPS');
    }
    
    // Check internet connection
    if (!navigator.onLine) {
        console.warn('⚠️ Aviso: Sem conexão com a internet. O reconhecimento de voz pode não funcionar.');
        showVoiceCommandsError('Sem conexão com a internet. O reconhecimento de voz precisa de internet para funcionar.');
        return false;
    }
    
    console.log('✅ Speech Recognition suportado');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    console.log('🎯 Objeto SpeechRecognition criado:', recognition);
    
    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';
    recognition.maxAlternatives = 3;
    
    console.log('⚙️ Configurações aplicadas:');
    console.log('   - continuous:', recognition.continuous);
    console.log('   - interimResults:', recognition.interimResults);
    console.log('   - lang:', recognition.lang);
    console.log('   - maxAlternatives:', recognition.maxAlternatives);
    
    // Event listeners
    recognition.onstart = function() {
        console.log('✅ Reconhecimento de voz iniciado com sucesso');
        console.log('🎤 Microfone ativo - aguardando comandos...');
        isListening = true;
        recognitionState = 'running';
        reconnectAttempts = 0; // Reset contador de tentativas
        showVoiceListening();
    };
    
    recognition.onresult = function(event) {
        console.log('🎯 Resultado do reconhecimento recebido');
        
        const lastResult = event.results[event.results.length - 1];
        const command = lastResult[0].transcript.toLowerCase().trim();
        
        console.log('🗣️ Comando capturado:', `"${command}"`);
        console.log('🔍 Comando exato recebido:', JSON.stringify(command));
        console.log('📊 É final?', lastResult.isFinal);
        console.log('🎯 Confiança:', lastResult[0].confidence);
        
        if (lastResult.isFinal) {
            console.log('🔍 Processando comando final...');
            processVoiceCommand(command);
        } else if (command.length > 3) {
            console.log('🔄 Processando comando intermediário...');
            processVoiceCommand(command);
        }
    };
    
    recognition.onerror = function(event) {
        console.log('🚨 Erro no reconhecimento de voz:', event.error);
        console.log('📊 Estado atual:', recognitionState);
        recognitionState = 'stopped';
        handleVoiceError(event.error);
    };
    
    recognition.onend = function() {
        console.log('🔚 Reconhecimento de voz finalizado');
        console.log('📊 Estado anterior:', recognitionState);
        isListening = false;
        recognitionState = 'stopped';
        hideVoiceListening();
        
        // Restart recognition if still active
        if (voiceCommandsActive && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            console.log('🔄 Tentando reiniciar reconhecimento automaticamente...');
            setTimeout(() => {
                if (voiceCommandsActive && recognitionState === 'stopped') {
                    if (!navigator.onLine) {
                        console.warn('⚠️ Sem conexão - não é possível reiniciar o reconhecimento');
                        showVoiceCommandsError('Conexão perdida. Verifique sua internet e tente novamente.');
                        return;
                    }
                    
                    reconnectAttempts++;
                    console.log(`🔄 Tentativa de reconexão ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
                    startRecognitionSafely();
                }
            }, 1000);
        } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.warn('⚠️ Máximo de tentativas de reconexão atingido');
            showVoiceCommandsError('Muitas tentativas de reconexão. Clique no botão de voz para tentar novamente.');
        }
    };
    
    return true;
}

// Start Voice Commands (actually starts recognition)
function initializeVoiceCommands() {
    console.log('🎤 Tentando inicializar comandos de voz...');
    console.log('📊 Estado atual do reconhecimento:', recognitionState);
    
    // Verificar se já está rodando ou tentando iniciar
    if (recognitionState === 'running' || recognitionState === 'starting') {
        console.log('⚠️ Reconhecimento já está ativo ou iniciando. Estado:', recognitionState);
        return true;
    }
    
    // Setup recognition if not already done
    if (!recognition && !setupVoiceCommands()) {
        console.log('❌ Falha ao configurar reconhecimento de voz');
        return false;
    }
    
    console.log('🔧 Reconhecimento configurado, iniciando...');
    
    // Start recognition only when called
    voiceCommandsActive = true;
    reconnectAttempts = 0;
    
    return startRecognitionSafely();
}

// Stop Voice Recognition
function stopVoiceRecognition() {
    console.log('🛑 Parando reconhecimento de voz...');
    voiceCommandsActive = false;
    reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // Impedir reconexões automáticas
    
    const result = stopRecognitionSafely();
    hideVoiceListening();
    console.log('✅ Reconhecimento de voz parado');
    return result;
}

// Error handling com timeout e controle de loops
function handleVoiceError(error) {
    console.log('🚨 Erro de reconhecimento de voz detectado:', error);
    let errorMessage = 'Erro no reconhecimento de voz';
    let shouldRetry = false;
    
    switch (error) {
        case 'no-speech':
            errorMessage = 'Nenhuma fala detectada. Tente falar mais alto.';
            shouldRetry = reconnectAttempts < MAX_RECONNECT_ATTEMPTS;
            break;
        case 'audio-capture':
            errorMessage = 'Microfone não encontrado. Verifique as permissões.';
            break;
        case 'not-allowed':
            errorMessage = 'Permissão de microfone negada. Clique no ícone de microfone na barra de endereços e permita o acesso para usar comandos de voz.';
            const btn = document.getElementById('voice-commands-btn') || document.getElementById('voice-commands-toggle');
            if (btn) {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            }
            voiceCommandsActive = false;
            break;
        case 'network':
            errorMessage = 'Erro de conexão com o serviço de reconhecimento de voz. Verifique sua conexão com a internet e tente novamente.';
            shouldRetry = reconnectAttempts < MAX_RECONNECT_ATTEMPTS;
            console.log('💡 Dica: O reconhecimento de voz precisa de conexão com a internet para funcionar.');
            break;
        case 'service-not-allowed':
            errorMessage = 'Serviço de reconhecimento de voz não permitido neste contexto.';
            break;
        case 'aborted':
            errorMessage = 'Reconhecimento de voz foi interrompido.';
            shouldRetry = reconnectAttempts < MAX_RECONNECT_ATTEMPTS;
            break;
        case 'InvalidStateError':
        case 'restart-failed':
            errorMessage = 'Erro interno do reconhecimento de voz. Tentando reinicializar...';
            shouldRetry = false;
            console.log('🔄 Reinicializando sistema de reconhecimento...');
            setTimeout(() => {
                if (voiceCommandsActive && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    reinitializeRecognitionSystem();
                }
            }, 2000);
            break;
        default:
            errorMessage = `Erro desconhecido no reconhecimento de voz: ${error}`;
            console.log('🔍 Erro não mapeado:', error);
            break;
    }
    
    console.error('❌ Erro de voz:', errorMessage);
    
    if (window.accessibilityFeatures && typeof window.accessibilityFeatures.announceToScreenReader === 'function') {
        window.accessibilityFeatures.announceToScreenReader(errorMessage);
    }
    
    showVoiceCommandsError(errorMessage);
    
    // Tentar reconectar automaticamente apenas se permitido
    if (shouldRetry && voiceCommandsActive) {
        console.log(`🔄 Tentando reconectar em 3 segundos... (${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
        setTimeout(() => {
            if (voiceCommandsActive && recognitionState === 'stopped') {
                reconnectAttempts++;
                startRecognitionSafely();
            }
        }, 3000);
    }
}

// Process Voice Commands
function processVoiceCommand(command) {
    console.log('🚀 Iniciando processamento do comando:', `"${command}"`);
    console.log('🔍 Tipo do comando:', typeof command);
    console.log('📏 Tamanho do comando:', command.length);
    
    const commands = {
        // Navigation commands
       
        'ir para início': () => navigateTo('index.html'),
        'ir para sobre': () => navigateTo('sobre.html'),
        'ir para importância': () => navigateTo('importancia.html'),
        'ir para tecnologias': () => navigateTo('tecnologias.html'),
        'ir para ods': () => navigateTo('ods10.html'),
        'ir para comunidade': () => navigateTo('comunidade.html'),
        'ir para feedback': () => navigateTo('feedback.html'),
        'ir para dashboard': () => navigateTo('dashboard.html'),
        
        // Simple navigation
        'home': () => navigateTo('index.html'),
        'início': () => navigateTo('index.html'),
        'sobre': () => navigateTo('sobre.html'),
        'importância': () => navigateTo('importancia.html'),
        'tecnologias': () => navigateTo('tecnologias.html'),
        'ods': () => navigateTo('ods10.html'),
        'comunidade': () => navigateTo('comunidade.html'),
        'feedback': () => navigateTo('feedback.html'),
        'dashboard': () => navigateTo('dashboard.html'),
        
        // Accessibility commands - with variations for better voice recognition
        'ativar alto contraste': () => {
            console.log('🎤 Comando recebido: ativar alto contraste');
            console.log('🔍 window.accessibilityFeatures:', window.accessibilityFeatures);
            if (window.accessibilityFeatures && typeof window.accessibilityFeatures.toggleHighContrast === 'function') {
                console.log('✅ Chamando toggleHighContrast()');
                window.accessibilityFeatures.toggleHighContrast();
            } else {
                console.error('❌ toggleHighContrast não está disponível');
                console.log('window.accessibilityFeatures:', window.accessibilityFeatures);
            }
        },
        'ativar autocontraste': () => {
            console.log('🎤 Comando recebido: ativar autocontraste (variação)');
            if (window.accessibilityFeatures && typeof window.accessibilityFeatures.toggleHighContrast === 'function') {
                window.accessibilityFeatures.toggleHighContrast();
            }
        },
        'ativar autocontroleste': () => {
            console.log('🎤 Comando recebido: ativar autocontroleste (variação)');
            if (window.accessibilityFeatures && typeof window.accessibilityFeatures.toggleHighContrast === 'function') {
                window.accessibilityFeatures.toggleHighContrast();
            }
        },
        'ativar auto contraste': () => {
            console.log('🎤 Comando recebido: ativar auto contraste (variação)');
            if (window.accessibilityFeatures && typeof window.accessibilityFeatures.toggleHighContrast === 'function') {
                window.accessibilityFeatures.toggleHighContrast();
            }
        },
        'ativar contraste': () => {
            console.log('🎤 Comando recebido: ativar contraste (variação)');
            if (window.accessibilityFeatures && typeof window.accessibilityFeatures.toggleHighContrast === 'function') {
                window.accessibilityFeatures.toggleHighContrast();
            }
        },
        'desativar alto contraste': () => {
            console.log('🎤 Comando recebido: desativar alto contraste');
            console.log('🔍 window.accessibilityFeatures:', window.accessibilityFeatures);
            if (window.accessibilityFeatures && typeof window.accessibilityFeatures.toggleHighContrast === 'function') {
                console.log('✅ Chamando toggleHighContrast()');
                window.accessibilityFeatures.toggleHighContrast();
            } else {
                console.error('❌ toggleHighContrast não está disponível');
                console.log('window.accessibilityFeatures:', window.accessibilityFeatures);
            }
        },
        'desativar autocontraste': () => {
            console.log('🎤 Comando recebido: desativar autocontraste (variação)');
            if (window.accessibilityFeatures && typeof window.accessibilityFeatures.toggleHighContrast === 'function') {
                window.accessibilityFeatures.toggleHighContrast();
            }
        },
        'desativar autocontroleste': () => {
            console.log('🎤 Comando recebido: desativar autocontroleste (variação)');
            if (window.accessibilityFeatures && typeof window.accessibilityFeatures.toggleHighContrast === 'function') {
                window.accessibilityFeatures.toggleHighContrast();
            }
        },
        'desativar auto contraste': () => {
            console.log('🎤 Comando recebido: desativar auto contraste (variação)');
            if (window.accessibilityFeatures && typeof window.accessibilityFeatures.toggleHighContrast === 'function') {
                window.accessibilityFeatures.toggleHighContrast();
            }
        },
        'desativar contraste': () => {
            console.log('🎤 Comando recebido: desativar contraste (variação)');
            if (window.accessibilityFeatures && typeof window.accessibilityFeatures.toggleHighContrast === 'function') {
                window.accessibilityFeatures.toggleHighContrast();
            }
        },
        'aumentar fonte': () => {
            if (window.accessibilityFeatures && typeof window.accessibilityFeatures.toggleFontSize === 'function') {
                window.accessibilityFeatures.toggleFontSize();
            }
        },
        'fonte normal': () => {
            if (window.accessibilityFeatures && typeof window.accessibilityFeatures.toggleFontSize === 'function') {
                window.accessibilityFeatures.toggleFontSize();
            }
        },
        'ativar leitor': () => {
            if (window.accessibilityFeatures && typeof window.accessibilityFeatures.toggleVoiceReader === 'function') {
                window.accessibilityFeatures.toggleVoiceReader();
            }
        },
        'desativar leitor': () => {
            if (window.accessibilityFeatures && typeof window.accessibilityFeatures.toggleVoiceReader === 'function') {
                window.accessibilityFeatures.toggleVoiceReader();
            }
        },
        
        // Chatbot commands
        'abrir assistente': () => openChatbot(),
        'abrir chatbot': () => openChatbot(),
        'fechar assistente': () => closeChatbot(),
        'fechar chatbot': () => closeChatbot(),
        
        // Scroll commands
        'rolar para cima': () => scrollPage('up'),
        'rolar para baixo': () => scrollPage('down'),
        'ir para o topo': () => scrollToTop(),
        'ir para o final': () => scrollToBottom(),
        
        // Help commands
        'ajuda': () => showVoiceHelp(),
        'comandos': () => showVoiceHelp(),
        'o que posso dizer': () => showVoiceHelp(),
        
        // Reading commands
        'ler página': () => readCurrentPage(),
        'parar leitura': () => {
            if (window.accessibilityFeatures && typeof window.accessibilityFeatures.stopReading === 'function') {
                window.accessibilityFeatures.stopReading();
            }
        },
        
        // Form commands
        'focar no campo': () => focusFirstInput(),
        'enviar formulário': () => submitCurrentForm(),
        
        // Menu commands
        'abrir menu': () => openMobileMenu(),
        'fechar menu': () => closeMobileMenu()
    };
    
    // Find matching command
    let commandExecuted = false;
    
    console.log('🔍 Procurando comando correspondente...');
    console.log('📋 Comandos disponíveis:', Object.keys(commands));
    
    for (const [commandText, action] of Object.entries(commands)) {
        console.log(`🔍 Verificando se "${command}" inclui "${commandText}"`);
        if (command.includes(commandText)) {
            console.log(`✅ Comando encontrado: "${commandText}"`);
            try {
                action();
                commandExecuted = true;
                announceCommandSuccess(commandText);
                console.log(`✅ Comando executado com sucesso: "${commandText}"`);
                break;
            } catch (error) {
                console.error('❌ Erro ao executar comando:', error);
                announceCommandError();
            }
        }
    }
    
    if (!commandExecuted) {
        console.log(`❌ Nenhum comando correspondente encontrado para: "${command}"`);
        announceCommandNotRecognized(command);
    }
}

// Execute Voice Command (alternative function for direct command execution)
function executeVoiceCommand(command) {
    console.log('🎤 Executando comando via executeVoiceCommand:', command);
    
    const normalizedCommand = command.toLowerCase().trim();
    console.log('🔄 Comando normalizado:', normalizedCommand);
    
    // Use the existing processVoiceCommand function
    processVoiceCommand(normalizedCommand);
}

// Navigation functions
function navigateTo(page) {
    window.location.href = page;
}

function scrollPage(direction) {
    const scrollAmount = window.innerHeight * 0.8;
    
    if (direction === 'up') {
        window.scrollBy(0, -scrollAmount);
    } else if (direction === 'down') {
        window.scrollBy(0, scrollAmount);
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

// Chatbot functions
function openChatbot() {
    const chatbotBtn = document.getElementById('ai-chatbot-btn');
    if (chatbotBtn) {
        chatbotBtn.click();
    }
}

function closeChatbot() {
    const closeChatbotBtn = document.getElementById('close-chatbot');
    if (closeChatbotBtn) {
        closeChatbotBtn.click();
    }
}

// Menu functions
function openMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu && !navMenu.classList.contains('active')) {
        navToggle.click();
    }
}

function closeMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu && navMenu.classList.contains('active')) {
        navToggle.click();
    }
}

// Form functions
function focusFirstInput() {
    const firstInput = document.querySelector('input, textarea, select');
    if (firstInput) {
        firstInput.focus();
    }
}

function submitCurrentForm() {
    const focusedElement = document.activeElement;
    const form = focusedElement.closest('form');
    
    if (form) {
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitBtn) {
            submitBtn.click();
        } else {
            form.submit();
        }
    }
}

// Reading functions
function readCurrentPage() {
    const mainContent = document.querySelector('main, .main-content');
    if (mainContent && window.accessibilityFeatures && typeof window.accessibilityFeatures.readText === 'function') {
        const text = mainContent.textContent || mainContent.innerText;
        window.accessibilityFeatures.readText(text);
    }
}

// Help function
function showVoiceHelp() {
    const helpText = `
Comandos de voz disponíveis:

NAVEGAÇÃO:
- "Ir para home" ou "Ir para início"
- "Ir para sobre"
- "Ir para importância"
- "Ir para tecnologias"
- "Ir para ODS"
- "Ir para comunidade"
- "Ir para feedback"

ACESSIBILIDADE:
- "Ativar alto contraste" / "Desativar alto contraste"
- "Aumentar fonte" / "Fonte normal"
- "Ativar leitor" / "Desativar leitor"
- "Desativar comando de voz"

ASSISTENTE:
- "Abrir assistente" / "Abrir chatbot"
- "Fechar assistente" / "Fechar chatbot"

NAVEGAÇÃO NA PÁGINA:
- "Rolar para cima" / "Rolar para baixo"
- "Ir para o topo" / "Ir para o final"

LEITURA:
- "Ler página"
- "Parar leitura"

MENU:
- "Abrir menu" / "Fechar menu"

FORMULÁRIOS:
- "Focar no campo"
- "Enviar formulário"

AJUDA:
- "Ajuda" / "Comandos" / "O que posso dizer"
    `;
    
    if (window.accessibilityFeatures && typeof window.accessibilityFeatures.readText === 'function') {
        window.accessibilityFeatures.readText('Comandos de voz disponíveis. Navegação: ir para home, sobre, importância, tecnologias, ODS, comunidade, feedback. Acessibilidade: ativar ou desativar alto contraste, aumentar fonte, ativar leitor. Assistente: abrir ou fechar chatbot. Navegação: rolar para cima ou baixo, ir para o topo ou final. Leitura: ler página, parar leitura. Menu: abrir ou fechar menu. Formulários: focar no campo, enviar formulário.');
    } else {
        alert(helpText);
    }
}

// UI feedback functions
function showVoiceListening() {
    let listeningIndicator = document.getElementById('voice-listening-indicator');
    
    if (!listeningIndicator) {
        listeningIndicator = document.createElement('div');
        listeningIndicator.id = 'voice-listening-indicator';
        listeningIndicator.className = 'voice-listening active';
        listeningIndicator.innerHTML = `
            <div class="pulse"></div>
            <p>Ouvindo... Diga um comando</p>
        `;
        document.body.appendChild(listeningIndicator);
    } else {
        listeningIndicator.classList.add('active');
    }
}

function hideVoiceListening() {
    const listeningIndicator = document.getElementById('voice-listening-indicator');
    if (listeningIndicator) {
        listeningIndicator.classList.remove('active');
    }
}

function showVoiceCommandsError(message) {
    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.voice-error');
    existingErrors.forEach(error => error.remove());
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'voice-error';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    errorDiv.setAttribute('aria-live', 'assertive');
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Announcement functions
function announceCommandSuccess(command) {
    if (window.accessibilityFeatures && typeof window.accessibilityFeatures.announceToScreenReader === 'function') {
        window.accessibilityFeatures.announceToScreenReader(`Comando executado: ${command}`);
    }
}

function announceCommandError() {
    if (window.accessibilityFeatures && typeof window.accessibilityFeatures.announceToScreenReader === 'function') {
        window.accessibilityFeatures.announceToScreenReader('Erro ao executar comando');
    }
}

function announceCommandNotRecognized(command) {
    if (window.accessibilityFeatures && typeof window.accessibilityFeatures.announceToScreenReader === 'function') {
        window.accessibilityFeatures.announceToScreenReader(`Comando não reconhecido: ${command}. Diga "ajuda" para ver os comandos disponíveis.`);
    }
}

// Keyboard shortcut to toggle voice commands
document.addEventListener('keydown', function(event) {
    // Ctrl + Shift + V: Toggle voice commands
    if (event.ctrlKey && event.shiftKey && event.key === 'V') {
        event.preventDefault();
        const btn = document.getElementById('voice-commands-btn') || document.getElementById('voice-commands-toggle');
        if (btn) {
            btn.click();
        }
    }
});

// Export functions for global use
window.voiceCommands = {
    setupVoiceCommands,
    initializeVoiceCommands,
    stopVoiceRecognition,
    processVoiceCommand,
    showVoiceHelp
};