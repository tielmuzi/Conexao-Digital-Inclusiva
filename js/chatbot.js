// Chatbot integration with Gemini AI
class AccessibilityChatbot {
    constructor() {
        // Usa configuração externa se disponível, senão usa fallback
        this.apiKey = (typeof GEMINI_CONFIG !== 'undefined' && GEMINI_CONFIG.apiKey) ? 
                      GEMINI_CONFIG.apiKey : 'AIzaSyCK_C2FmrfRG4aEB1fRjnmBF4NkDkGIz9M';
        
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        this.conversationHistory = [];
        this.isInitialized = false;
        this.useSimulatedResponses = false;
        
        this.init();
    }
    
    init() {
        this.loadApiKey();
        this.setupEventListeners();
        this.loadConversationHistory();
        this.isInitialized = true;
        
        console.log('Chatbot de Acessibilidade inicializado');
    }
    
    loadApiKey() {
        // Verifica se tem função de verificação de config disponível
        const isConfigured = (typeof isApiKeyConfigured !== 'undefined') ? 
                            isApiKeyConfigured() : 
                            (this.apiKey && this.apiKey !== 'AIzaSyCK_C2FmrfRG4aEB1fRjnmBF4NkDkGIz9M');
        
        if (!isConfigured) {
            console.warn('⚠️ API Key não configurada. Usando respostas simuladas.');
            console.info('💡 Para ativar IA: configure sua API key em js/gemini-config.js');
            this.useSimulatedResponses = true;
        } else {
            console.log('✅ API Key configurada - IA Gemini ativa');
            this.useSimulatedResponses = false;
        }
    }
    
    setupEventListeners() {
        const sendButton = document.getElementById('send-message');
        const inputField = document.getElementById('chatbot-input');
        
        if (sendButton) {
            sendButton.addEventListener('click', () => this.handleSendMessage());
        }
        
        if (inputField) {
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSendMessage();
                }
            });
        }
    }
    
    async handleSendMessage() {
        const inputField = document.getElementById('chatbot-input');
        const message = inputField.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        this.addMessageToChat(message, 'user');
        inputField.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Get bot response
            const response = await this.getBotResponse(message);
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add bot response to chat
            this.addMessageToChat(response, 'bot');
            
            // Save conversation
            this.saveConversationHistory();
            
        } catch (error) {
            console.error('Erro ao obter resposta do chatbot:', error);
            this.hideTypingIndicator();
            this.addMessageToChat('Desculpe, ocorreu um erro. Tente novamente.', 'bot');
        }
    }
    
    async getBotResponse(message) {
        // Verifica se tem uma API key válida configurada
        const isConfigured = (typeof isApiKeyConfigured !== 'undefined') ? 
                            isApiKeyConfigured() : 
                            (this.apiKey && this.apiKey !== 'AIzaSyCK_C2FmrfRG4aEB1fRjnmBF4NkDkGIz9M');
        
        if (!isConfigured) {
            return this.getSimulatedResponse(message);
        }
        
        try {
            // Usa configuração avançada se disponível
            const requestBody = {
                contents: [{
                    parts: [{
                        text: this.buildPrompt(message)
                    }]
                }]
            };
            
            // Adiciona configurações avançadas se disponíveis
            if (typeof GEMINI_CONFIG !== 'undefined') {
                if (GEMINI_CONFIG.generationConfig) {
                    requestBody.generationConfig = GEMINI_CONFIG.generationConfig;
                }
                if (GEMINI_CONFIG.safetySettings) {
                    requestBody.safetySettings = GEMINI_CONFIG.safetySettings;
                }
            }
            
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                console.error(`Erro HTTP: ${response.status}`);
                return this.getSimulatedResponse(message);
            }
            
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
            
        } catch (error) {
            console.error('Erro na API do Gemini:', error);
            return this.getSimulatedResponse(message);
        }
    }
    
    buildPrompt(userMessage) {
        const context = `
Você é um assistente especializado em acessibilidade digital. Seu papel é ajudar usuários com questões sobre:

1. Acessibilidade web (WCAG, ARIA, etc.)
2. Tecnologias assistivas (leitores de tela, navegação por teclado, etc.)
3. Neurodiversidade e suas necessidades digitais
4. Pessoas com deficiência e barreiras digitais
5. Navegação neste site de acessibilidade
6. ODS 10 - Redução das Desigualdades

Responda de forma clara, concisa e acessível. Use linguagem simples e forneça exemplos práticos quando possível.

Histórico da conversa:
${this.conversationHistory.map(msg => `${msg.sender}: ${msg.text}`).join('\n')}

Pergunta do usuário: ${userMessage}

Resposta:`;

        return context;
    }
    
    getSimulatedResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Comando para mostrar status da API
        if (message === '/status') {
            const status = this.useSimulatedResponses ? 
                '🤖 Usando respostas simuladas (API key não configurada)' : 
                '🧠 IA Gemini ativa e funcionando';
            return `📊 **Status do Chatbot:** ${status}`;
        }
        
        // Accessibility-focused responses
        const responses = {
            'acessibilidade': 'A acessibilidade digital garante que pessoas com deficiência possam usar tecnologias. Isso inclui leitores de tela, navegação por teclado, alto contraste e muito mais. Posso explicar alguma tecnologia específica?',
            
            'leitor de tela': 'Leitores de tela são softwares que convertem texto em fala ou braille. Exemplos populares incluem NVDA (gratuito), JAWS e VoiceOver (Mac/iOS). Para tornar seu conteúdo compatível, use textos alternativos em imagens e estrutura HTML semântica.',
            
            'alto contraste': 'O modo de alto contraste ajuda pessoas com baixa visão ou daltonismo. Use nosso botão de alto contraste no canto inferior direito da página para experimentar.',
            
            'navegação teclado': 'A navegação por teclado permite usar o site sem mouse. Use Tab para avançar, Shift+Tab para voltar, Enter/Espaço para ativar elementos. Todos os elementos interativos devem ser acessíveis por teclado.',
            
            'wcag': 'As WCAG (Web Content Accessibility Guidelines) são diretrizes internacionais para acessibilidade web. Elas se baseiam em 4 princípios: Perceptível, Operável, Compreensível e Robusto. Recomenda-se seguir o nível AA.',
            
            'neurodiversidade': 'Neurodiversidade refere-se à variação natural no funcionamento cerebral, incluindo autismo, TDAH, dislexia. Para sites acessíveis, considere: linguagem clara, navegação consistente, evitar elementos que piscam e oferecer múltiplas formas de interação.',

            'deficiência': 'Pessoas com deficiência enfrentam barreiras digitais como falta de textos alternativos, navegação difícil, conteúdo inacessível. Acessibilidade digital visa eliminar essas barreiras para garantir igualdade de acesso à informação e serviços online.',

            'pcd': 'Pessoas com deficiência (PCD) incluem indivíduos com deficiências visuais, auditivas, motoras e cognitivas. A acessibilidade digital é crucial para garantir que PCDs possam acessar informações, serviços e oportunidades online de forma igualitária.',
            
            'comandos de voz': 'Nosso site suporta comandos de voz! Ative clicando no botão do microfone. Você pode dizer "ir para sobre", "ativar alto contraste", "ler página" e muito mais. Diga "ajuda" para ver todos os comandos.',
            
            'ods 10': 'O ODS 10 visa reduzir desigualdades. A acessibilidade digital é fundamental para isso, garantindo que pessoas com deficiência tenham as mesmas oportunidades de acesso à informação, educação e emprego online.',
            
            'como navegar': 'Para navegar no site: use Tab para mover entre elementos, Enter para ativar links, setas para menus. Temos comandos de voz e um leitor de tela integrado. Experimente os botões de acessibilidade no topo!',
            
            'tecnologias assistivas': 'Tecnologias assistivas incluem: leitores de tela, magnificadores, teclados especiais, dispositivos de entrada por movimento ocular, software de reconhecimento de voz. Cada pessoa tem necessidades únicas.',
            
            'simulador': 'Nosso simulador na página "Importância" mostra como pessoas com diferentes deficiências experimentam sites inacessíveis vs. acessíveis. É uma ferramenta educativa poderosa!',
            
            'feedback': 'Adoramos receber feedback! Use nossa página de Feedback para reportar problemas ou sugerir melhorias. Seus comentários nos ajudam a tornar o site mais acessível para todos.',
            
            'questionário': 'Nosso questionário na seção Feedback coleta dados sobre necessidades de acessibilidade. As respostas são anônimas e ajudam a identificar as principais barreiras digitais enfrentadas pelos usuários.'
        };
        
        // Find matching response
        for (const [keyword, response] of Object.entries(responses)) {
            if (lowerMessage.includes(keyword)) {
                return response;
            }
        }
        
        // Default responses based on message type
        if (lowerMessage.includes('como') || lowerMessage.includes('?')) {
            return 'Ótima pergunta! Estou aqui para ajudar com questões de acessibilidade digital. Posso explicar sobre leitores de tela, navegação por teclado, alto contraste, comandos de voz, ou qualquer outro aspecto da acessibilidade. O que você gostaria de saber?';
        }
        
        if (lowerMessage.includes('obrigado') || lowerMessage.includes('valeu')) {
            return 'De nada! Fico feliz em ajudar. Se tiver mais dúvidas sobre acessibilidade digital, estarei aqui. Lembre-se: a acessibilidade beneficia a todos!';
        }
        
        if (lowerMessage.includes('olá') || lowerMessage.includes('oi')) {
            return 'Olá! Sou seu assistente de acessibilidade digital. Posso ajudar com informações sobre tecnologias assistivas, navegação acessível, WCAG, neurodiversidade e muito mais. Como posso ajudá-lo hoje?';
        }
        
        // Generic helpful response
        return 'Entendo sua pergunta sobre acessibilidade. Posso ajudar com: leitores de tela, navegação por teclado, alto contraste, comandos de voz, WCAG, neurodiversidade, ODS 10, e navegação neste site. Pode ser mais específico sobre o que gostaria de saber?';
    }
    
    addMessageToChat(message, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = message;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add to conversation history
        this.conversationHistory.push({
            text: message,
            sender: sender,
            timestamp: new Date().toISOString()
        });
        
        // Announce to screen readers
        this.announceMessage(message, sender);
    }
    
    announceMessage(message, sender) {
        if (typeof announceToScreenReader === 'function') {
            const announcement = sender === 'bot' ? 
                `Assistente respondeu: ${message}` : 
                `Você disse: ${message}`;
            announceToScreenReader(announcement);
        }
    }
    
    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'chat-message bot typing';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span class="sr-only">Assistente está digitando</span>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    saveConversationHistory() {
        try {
            localStorage.setItem('chatbot-history', JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.warn('Não foi possível salvar o histórico da conversa:', error);
        }
    }
    
    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('chatbot-history');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
                
                // Restore messages in chat (limit to last 10 for performance)
                const recentMessages = this.conversationHistory.slice(-10);
                recentMessages.forEach(msg => {
                    this.addMessageToUI(msg.text, msg.sender);
                });
            }
        } catch (error) {
            console.warn('Não foi possível carregar o histórico da conversa:', error);
            this.conversationHistory = [];
        }
    }
    
    addMessageToUI(message, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = message;
        
        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);
    }
    
    clearHistory() {
        this.conversationHistory = [];
        localStorage.removeItem('chatbot-history');
        
        const messagesContainer = document.getElementById('chatbot-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        
        // Add welcome message
        this.addMessageToChat('Histórico limpo! Como posso ajudá-lo com acessibilidade digital?', 'bot');
    }
    
    exportConversation() {
        const conversation = this.conversationHistory.map(msg => 
            `[${new Date(msg.timestamp).toLocaleString('pt-BR')}] ${msg.sender}: ${msg.text}`
        ).join('\n');
        
        const blob = new Blob([conversation], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversa-acessibilidade-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.accessibilityChatbot = new AccessibilityChatbot();
});

// Add CSS for typing indicator
const typingCSS = `
.typing-dots {
    display: flex;
    gap: 4px;
    align-items: center;
}

.typing-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--primary-color);
    animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
    0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
}

.chat-message {
    margin-bottom: var(--spacing-md);
    display: flex;
    flex-direction: column;
}

.chat-message.user {
    align-items: flex-end;
}

.chat-message.bot {
    align-items: flex-start;
}

.message-content {
    background: var(--background-gray);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-lg);
    max-width: 80%;
    word-wrap: break-word;
}

.chat-message.user .message-content {
    background: var(--primary-color);
    color: white;
}

.message-time {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    margin-top: var(--spacing-xs);
    padding: 0 var(--spacing-sm);
}
`;

// Inject CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = typingCSS;
document.head.appendChild(styleSheet);