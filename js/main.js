// Utilities object
const Utils = {
    // Debounce function to limit function calls
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = function() {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function to limit function calls
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },

    // Check if element is in viewport
    isInViewport: function(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Smooth scroll to element
    scrollToElement: function(element, offset = 0) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    },

    // Format date
    formatDate: function(date) {
        return new Intl.DateTimeFormat('pt-BR').format(date);
    },

    // Generate unique ID
    generateId: function() {
        return Math.random().toString(36).substr(2, 9);
    }
};

// Main App object
const App = {
    // Configuration
    config: {
        animationDuration: 300,
        debounceDelay: 250,
        scrollOffset: 80
    },

    // Application state
    state: {
        isInitialized: false,
        currentPage: window.location.pathname,
        accessibility: {
            highContrast: false,
            largeFont: false,
            reducedMotion: false
        }
    },

    // Initialize the application
    init: function() {
        try {
            console.log('Inicializando Conexão Digital Inclusiva...');
            
            // Initialize all systems
            this.initializeSystems();
            
            // Mark as initialized
            this.state.isInitialized = true;
            
            console.log('Aplicação inicializada com sucesso');
            
        } catch (error) {
            console.error('Erro durante inicialização:', error);
            // Continue even with error to not break the page
        }
    },

    // Initialize all systems
    initializeSystems: function() {
        try {
            // Initialize navigation
            this.initNavigation();
            
            // Initialize accessibility toolbar
            this.initAccessibilityToolbar();
            
            // Initialize chatbot
            this.initChatbot();
            
            // Initialize demo functionality
            this.initDemo();
            
            // Initialize keyboard navigation
            this.initKeyboardNavigation();
            
            // Initialize smooth scrolling
            this.initSmoothScrolling();
            
            console.log('Todos os sistemas inicializados');
            
        } catch (error) {
            console.error('Erro ao inicializar sistemas:', error);
            throw new Error('Falha na inicialização dos sistemas');
        }
    },

    // Initialize navigation
    initNavigation: function() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', function() {
                const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
                
                navToggle.setAttribute('aria-expanded', !isExpanded);
                navMenu.classList.toggle('active');
                
                // Focus management
                if (!isExpanded) {
                    const firstLink = navMenu.querySelector('a');
                    if (firstLink) {
                        firstLink.focus();
                    }
                }
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navMenu && navToggle && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close menu on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.focus();
            }
        });
    },

    // Initialize accessibility toolbar
    initAccessibilityToolbar: function() {
        const toolbar = document.querySelector('.accessibility-toolbar');
        if (!toolbar) return;

        // Focus trap for toolbar
        const focusableElements = toolbar.querySelectorAll('button, [tabindex="0"]');
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];

        if (firstFocusableElement) {
            firstFocusableElement.addEventListener('focus', function() {
                toolbar.classList.add('focused');
            });
        }

        toolbar.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    },

    // Initialize chatbot
    initChatbot: function() {
        const chatbotButton = document.getElementById('ai-chatbot-btn');
        const chatbotModal = document.getElementById('ai-chatbot-modal');
        const closeChatbot = document.getElementById('close-chatbot');
        const sendButton = document.getElementById('send-message');
        const chatInput = document.getElementById('chatbot-input');

        if (chatbotButton && chatbotModal) {
            chatbotButton.addEventListener('click', function() {
                chatbotModal.style.display = 'flex';
                chatbotModal.setAttribute('aria-hidden', 'false');
                
                if (chatInput) {
                    chatInput.focus();
                }
            });

            if (closeChatbot) {
                closeChatbot.addEventListener('click', function() {
                    chatbotModal.style.display = 'none';
                    chatbotModal.setAttribute('aria-hidden', 'true');
                    chatbotButton.focus();
                });
            }

            // Close on Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && chatbotModal.style.display === 'flex') {
                    chatbotModal.style.display = 'none';
                    chatbotModal.setAttribute('aria-hidden', 'true');
                    chatbotButton.focus();
                }
            });

            // Close when clicking outside the modal
            chatbotModal.addEventListener('click', function(e) {
                if (e.target === chatbotModal) {
                    chatbotModal.style.display = 'none';
                    chatbotModal.setAttribute('aria-hidden', 'true');
                    chatbotButton.focus();
                }
            });

            if (sendButton && chatInput) {
                sendButton.addEventListener('click', function() {
                    const message = chatInput.value.trim();
                    
                    if (message) {
                        addChatMessage(message, 'user');
                        chatInput.value = '';
                        
                        // Simulate bot response
                        setTimeout(() => {
                            const response = generateBotResponse(message);
                            addChatMessage(response, 'bot');
                        }, 1000);
                    }
                });

                chatInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        sendButton.click();
                    }
                });
            }
        }
    },

    // Initialize demo functionality
    initDemo: function() {
        const demoButton = document.querySelector('.demo-button');
        if (demoButton) {
            demoButton.addEventListener('click', function() {
                announceToScreenReader('Demonstração de acessibilidade iniciada');
            });
        }
    },

    // Initialize keyboard navigation
    initKeyboardNavigation: function() {
        // Skip to main content
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab' && !e.shiftKey && document.activeElement === document.body) {
                const skipLink = document.querySelector('.skip-link');
                if (skipLink) {
                    skipLink.focus();
                }
            }
        });

        // Enhanced focus management
        const focusableElements = document.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex="0"]'
        );

        focusableElements.forEach(element => {
            element.addEventListener('focus', function() {
                this.classList.add('keyboard-focus');
            });

            element.addEventListener('blur', function() {
                this.classList.remove('keyboard-focus');
            });
        });

        // Smooth scrolling for anchor links
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    targetElement.focus();
                }
            });
        });
    },

    // Configure smooth scrolling for anchor links
    initSmoothScrolling: function() {
        document.addEventListener('click', function(e) {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Focus the target element for screen readers
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus();
                }
            }
        });
    }
};

// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    App.init();
    
    console.log('Conexão Digital Inclusiva - Sistema inicializado com sucesso');
});

// Legacy function wrappers for backward compatibility
function initializeNavigation() {
    App.initNavigation();
}

function initializeAccessibilityToolbar() {
    App.initAccessibilityToolbar();
}

function initializeChatbot() {
    App.initChatbot();
}

// Chat functionality
function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chatbot-messages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
            <span class="message-time">${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Announce new messages to screen readers
    if (sender === 'bot') {
        announceToScreenReader(`Nova mensagem do assistente: ${message}`);
    }
}

function generateBotResponse(message) {
    const responses = {
        'acessibilidade': 'A acessibilidade digital é fundamental para garantir que todas as pessoas possam usar a web. Posso explicar sobre leitores de tela, navegação por teclado ou outras tecnologias assistivas.',
        'leitor de tela': 'Leitores de tela são softwares que convertem texto em fala ou braille. Exemplos incluem NVDA, JAWS e VoiceOver. É importante usar textos alternativos em imagens e estrutura semântica no HTML.',
        'alto contraste': 'O modo de alto contraste ajuda pessoas com baixa visão ou daltonismo. Use nosso botão de alto contraste no inferior da página em cima do chatbot para experimentar.',
        'navegação': 'Para navegar pelo site, use as teclas Tab e Shift+Tab. Pressione Enter ou Espaço para ativar links e botões. Use as setas para navegar em menus.',
        'ajuda': 'Posso ajudar com informações sobre acessibilidade, navegação do site, tecnologias assistivas e muito mais. O que você gostaria de saber?'
    };
    
    const lowerMessage = message.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
            return response;
        }
    }
    
    return 'Olá! Para informações mais específicas sobre acessibilidade, recomendo explorar nossas seções sobre Tecnologias e Importância da Acessibilidade.';
}

function initializeDemo() {
    App.initDemo();
}

function initializeKeyboardNavigation() {
    App.initKeyboardNavigation();
}

// Trap focus within modal
function trapFocus(modal, event) {
    const focusableElements = modal.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            event.preventDefault();
        }
    } else {
        if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            event.preventDefault();
        }
    }
}

// Helper function for screen reader announcements
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        if (document.body.contains(announcement)) {
            document.body.removeChild(announcement);
        }
    }, 1000);
}

// Announce page changes to screen readers
function announcePageChange(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        if (document.body.contains(announcement)) {
            document.body.removeChild(announcement);
        }
    }, 2000);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Erro JavaScript:', e.error);
    
    // Don't break the page for non-critical errors
    if (e.error && e.error.message && !e.error.message.includes('Script error')) {
        announceToScreenReader('Ocorreu um erro. Por favor, recarregue a página se necessário.');
    }
    
    return true;
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', function() {
        // Aguarda um pouco para garantir que loadEventEnd esteja disponível
        setTimeout(() => {
            const navigation = performance.timing;
            if (navigation.loadEventEnd && navigation.navigationStart) {
                const loadTime = navigation.loadEventEnd - navigation.navigationStart;
                if (loadTime > 0) {
                    console.log(`Página carregada em ${loadTime}ms`);
                } else {
                    console.log('Tempo de carregamento ainda não disponível');
                }
            }
        }, 100);
    });
}

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('Service Worker registrado com sucesso:', registration.scope);
            })
            .catch(function(error) {
                console.log('Falha ao registrar Service Worker:', error);
            });
    });
}
