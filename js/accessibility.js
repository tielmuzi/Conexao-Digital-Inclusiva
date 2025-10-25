// Accessibility Features JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando recursos de acessibilidade...');
    
    // Initialize all accessibility features
    initializeAccessibilityFloatButton();
    initializeHighContrast();
    initializeFontSize();
    initializeVoiceReader();
    initializeVoiceCommandsButton(); // Apenas configura o botão, não inicia os comandos
    initializeKeyboardShortcuts();
    loadAccessibilityPreferences();
    
    // Export functions to global scope
    console.log('📤 Exportando funções de acessibilidade para window.accessibilityFeatures...');
    window.accessibilityFeatures = {
        toggleHighContrast,
        toggleFontSize,
        toggleVoiceReader,
        readText,
        stopReading,
        announceToScreenReader,
        showKeyboardShortcuts,
        toggleVoiceCommands,
        runAccessibilityCheck
    };
    
    console.log('✅ window.accessibilityFeatures exportado:', window.accessibilityFeatures);
    console.log('🔍 toggleHighContrast disponível:', typeof window.accessibilityFeatures.toggleHighContrast);
    
    // Initialize voice commands if available
    if (typeof setupVoiceCommands === 'function') {
        console.log('🎤 Configurando comandos de voz...');
        setupVoiceCommands();
    }
    
    console.log('Recursos de acessibilidade inicializados');
});

// Accessibility Floating Button
function initializeAccessibilityFloatButton() {
    const floatBtn = document.getElementById('accessibility-float-btn');
    const toolbar = document.getElementById('accessibility-toolbar');
    
    if (floatBtn && toolbar) {
        floatBtn.addEventListener('click', function() {
            toggleAccessibilityToolbar();
        });
        
        // Close toolbar when clicking outside
        document.addEventListener('click', function(event) {
            if (!floatBtn.contains(event.target) && !toolbar.contains(event.target)) {
                closeAccessibilityToolbar();
            }
        });
        
        // Close toolbar on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && toolbar.classList.contains('active')) {
                closeAccessibilityToolbar();
                floatBtn.focus();
            }
        });
    }
}

function toggleAccessibilityToolbar() {
    const toolbar = document.getElementById('accessibility-toolbar');
    const floatBtn = document.getElementById('accessibility-float-btn');
    
    if (toolbar && floatBtn) {
        const isActive = toolbar.classList.contains('active');
        
        if (isActive) {
            closeAccessibilityToolbar();
        } else {
            openAccessibilityToolbar();
        }
    }
}

function openAccessibilityToolbar() {
    const toolbar = document.getElementById('accessibility-toolbar');
    const floatBtn = document.getElementById('accessibility-float-btn');
    
    if (toolbar && floatBtn) {
        toolbar.classList.add('active');
        floatBtn.classList.add('active');
        floatBtn.setAttribute('aria-expanded', 'true');
        announceToScreenReader('Menu de acessibilidade aberto');
        
        // Focus first button in toolbar
        const firstBtn = toolbar.querySelector('.accessibility-btn');
        if (firstBtn) {
            setTimeout(() => firstBtn.focus(), 100);
        }
    }
}

function closeAccessibilityToolbar() {
    const toolbar = document.getElementById('accessibility-toolbar');
    const floatBtn = document.getElementById('accessibility-float-btn');
    
    if (toolbar && floatBtn) {
        toolbar.classList.remove('active');
        floatBtn.classList.remove('active');
        floatBtn.setAttribute('aria-expanded', 'false');
        announceToScreenReader('Menu de acessibilidade fechado');
    }
}

// High Contrast Mode
function initializeHighContrast() {
    const highContrastBtn = document.getElementById('high-contrast-btn');
    
    if (highContrastBtn) {
        highContrastBtn.addEventListener('click', function() {
            toggleHighContrast();
        });
    }
}

function toggleHighContrast() {
    console.log('🎨 toggleHighContrast chamada!');
    
    const body = document.body;
    const isActive = body.classList.contains('high-contrast');
    const btn = document.getElementById('high-contrast-btn');
    
    console.log('🔍 Estado atual do alto contraste:', isActive);
    console.log('🔍 Botão encontrado:', !!btn);
    
    if (isActive) {
        console.log('🔄 Desativando alto contraste...');
        body.classList.remove('high-contrast');
        if (btn) {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        }
        localStorage.setItem('high-contrast', 'false');
        announceToScreenReader('Alto contraste desativado');
        console.log('✅ Alto contraste desativado');
    } else {
        console.log('🔄 Ativando alto contraste...');
        body.classList.add('high-contrast');
        if (btn) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        }
        localStorage.setItem('high-contrast', 'true');
        announceToScreenReader('Alto contraste ativado');
        console.log('✅ Alto contraste ativado');
    }
}

// Font Size Adjustment
function initializeFontSize() {
    const fontSizeBtn = document.getElementById('font-size-btn');
    
    if (fontSizeBtn) {
        fontSizeBtn.addEventListener('click', function() {
            toggleFontSize();
        });
    }
}

function toggleFontSize() {
    const body = document.body;
    const isActive = body.classList.contains('large-font');
    const btn = document.getElementById('font-size-btn');
    
    if (isActive) {
        body.classList.remove('large-font');
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
        localStorage.setItem('large-font', 'false');
        announceToScreenReader('Fonte normal restaurada');
    } else {
        body.classList.add('large-font');
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        localStorage.setItem('large-font', 'true');
        announceToScreenReader('Fonte aumentada');
    }
}

// Voice Reader (Text-to-Speech)
let speechSynthesis = window.speechSynthesis;
let isReading = false;
let currentUtterance = null;

function initializeVoiceReader() {
    const voiceReaderBtn = document.getElementById('voice-reader-btn');
    
    if (voiceReaderBtn) {
        voiceReaderBtn.addEventListener('click', function() {
            toggleVoiceReader();
        });
        
        // Add click listeners to readable elements
        addReadingListeners();
    }
}

function toggleVoiceReader() {
    const btn = document.getElementById('voice-reader-btn');
    const isActive = btn.classList.contains('active');
    
    if (isActive) {
        stopReading();
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
        removeReadingListeners();
        announceToScreenReader('Leitor de tela desativado');
    } else {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        addReadingListeners();
        announceToScreenReader('Leitor de tela ativado. Clique em qualquer texto para ouvir.');
    }
}

function addReadingListeners() {
    const readableElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, a, button, label');
    
    readableElements.forEach(element => {
        element.addEventListener('click', handleReadingClick);
        element.style.cursor = 'pointer';
        element.setAttribute('title', 'Clique para ouvir este texto');
    });
}

function removeReadingListeners() {
    const readableElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, a, button, label');
    
    readableElements.forEach(element => {
        element.removeEventListener('click', handleReadingClick);
        element.style.cursor = '';
        element.removeAttribute('title');
    });
}

function handleReadingClick(event) {
    const voiceReaderBtn = document.getElementById('voice-reader-btn');
    
    if (voiceReaderBtn && voiceReaderBtn.classList.contains('active')) {
        event.preventDefault();
        const text = getTextContent(event.target);
        if (text) {
            readText(text);
            highlightElement(event.target);
        }
    }
}

function getTextContent(element) {
    // Get clean text content, excluding hidden elements
    let text = '';
    
    if (element.tagName === 'IMG') {
        text = element.alt || 'Imagem sem descrição';
    } else {
        text = element.textContent || element.innerText;
    }
    
    return text.trim();
}

function readText(text) {
    if (speechSynthesis) {
        // Stop any current reading
        stopReading();
        
        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.lang = 'pt-BR';
        currentUtterance.rate = 0.8;
        currentUtterance.pitch = 1;
        currentUtterance.volume = 1;
        
        currentUtterance.onstart = function() {
            isReading = true;
        };
        
        currentUtterance.onend = function() {
            isReading = false;
            removeHighlight();
        };
        
        currentUtterance.onerror = function(event) {
            console.error('Erro na síntese de voz:', event.error);
            isReading = false;
            removeHighlight();
        };
        
        speechSynthesis.speak(currentUtterance);
    }
}

function stopReading() {
    if (speechSynthesis && isReading) {
        speechSynthesis.cancel();
        isReading = false;
        removeHighlight();
    }
}

function highlightElement(element) {
    removeHighlight();
    element.classList.add('reading-highlight');
}

function removeHighlight() {
    const highlighted = document.querySelector('.reading-highlight');
    if (highlighted) {
        highlighted.classList.remove('reading-highlight');
    }
}

// Keyboard Shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Alt + C: Toggle High Contrast
        if (event.altKey && event.key === 'c') {
            event.preventDefault();
            toggleHighContrast();
        }
        
        // Alt + F: Toggle Font Size
        if (event.altKey && event.key === 'f') {
            event.preventDefault();
            toggleFontSize();
        }
        
        // Alt + R: Toggle Voice Reader
        if (event.altKey && event.key === 'r') {
            event.preventDefault();
            toggleVoiceReader();
        }
        
        // Alt + V: Toggle Voice Commands
        if (event.altKey && event.key === 'v') {
            event.preventDefault();
            toggleVoiceCommands();
        }
        
        // Escape: Stop reading
        if (event.key === 'Escape' && isReading) {
            event.preventDefault();
            stopReading();
        }
        
        // Alt + H: Show keyboard shortcuts help
        if (event.altKey && event.key === 'h') {
            event.preventDefault();
            showKeyboardShortcuts();
        }
    });
}

function showKeyboardShortcuts() {
    const shortcuts = `
Atalhos de Teclado Disponíveis:

Alt + C: Alternar Alto Contraste
Alt + F: Alternar Tamanho da Fonte
Alt + R: Alternar Leitor de Tela
Alt + V: Alternar Comandos de Voz
Alt + H: Mostrar esta ajuda
Escape: Parar leitura atual
Tab: Navegar pelos elementos
Enter/Espaço: Ativar links e botões
    `;
    
    alert(shortcuts);
    announceToScreenReader('Atalhos de teclado exibidos');
}

// Voice Commands Integration - Only setup button, don't start recognition
function initializeVoiceCommandsButton() {
    const voiceCommandsBtn = document.getElementById('voice-commands-btn') || document.getElementById('voice-commands-toggle');
    
    if (voiceCommandsBtn) {
        voiceCommandsBtn.addEventListener('click', function() {
            toggleVoiceCommands();
        });
        
        // Only setup voice commands configuration, don't start recognition
        if (typeof setupVoiceCommands === 'function') {
            setupVoiceCommands();
        }
    }
}

async function toggleVoiceCommands() {
    const btn = document.getElementById('voice-commands-btn') || document.getElementById('voice-commands-toggle');
    const isActive = btn.classList.contains('active');
    
    if (isActive) {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
        stopVoiceCommands();
        announceToScreenReader('Comandos de voz desativados');
    } else {
        // Solicitar permissão de microfone apenas quando ativar
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            startVoiceCommands();
            announceToScreenReader('Comandos de voz ativados. Diga "ajuda" para ver os comandos disponíveis.');
        } catch (error) {
            console.error('Permissão de microfone negada:', error);
            
            let errorMessage = 'Permissão de microfone necessária para comandos de voz.';
            
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Permissão de microfone negada. Clique no ícone de microfone na barra de endereços e permita o acesso.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'Microfone não encontrado. Verifique se há um microfone conectado.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage = 'Comandos de voz não são suportados neste navegador.';
            }
            
            announceToScreenReader(errorMessage);
            
            // Mostrar mensagem visual de erro
            if (typeof showVoiceCommandsError === 'function') {
                showVoiceCommandsError(errorMessage);
            } else {
                alert(errorMessage);
            }
        }
    }
}

function startVoiceCommands() {
    // This will be implemented in voice-commands.js
    if (typeof initializeVoiceCommands === 'function') {
        initializeVoiceCommands();
    }
}

function stopVoiceCommands() {
    // This will be implemented in voice-commands.js
    if (typeof stopVoiceRecognition === 'function') {
        stopVoiceRecognition();
    }
}

// Screen Reader Announcements
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        if (document.body.contains(announcement)) {
            document.body.removeChild(announcement);
        }
    }, 1000);
}

// Load Accessibility Preferences
function loadAccessibilityPreferences() {
    // Load High Contrast preference - only if explicitly set by user
    if (localStorage.getItem('high-contrast') === 'true') {
        document.body.classList.add('high-contrast');
        const btn = document.getElementById('high-contrast-btn');
        if (btn) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        }
    }
    
    // Load Font Size preference
    if (localStorage.getItem('large-font') === 'true') {
        document.body.classList.add('large-font');
        const btn = document.getElementById('font-size-btn');
        if (btn) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        }
    }
    
    // Check for system preferences (but don't auto-apply high contrast)
    checkSystemPreferences();
}

function checkSystemPreferences() {
    // Check for prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
        announceToScreenReader('Movimento reduzido detectado e aplicado');
    }
    
    // Note: We don't auto-apply high contrast based on system preferences
    // Users must explicitly enable it via the button
    
    // Check for prefers-color-scheme (dark mode)
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
    }
}

// Focus Management
function manageFocus() {
    let lastFocusedElement = null;
    
    document.addEventListener('focusin', function(event) {
        lastFocusedElement = event.target;
    });
    
    // Return focus to last focused element when modal closes
    window.returnFocus = function() {
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    };
}

// Initialize focus management
manageFocus();

// Accessibility Testing Helper
function runAccessibilityCheck() {
    const issues = [];
    
    // Check for images without alt text
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
        issues.push(`${images.length} imagens sem texto alternativo encontradas`);
    }
    
    // Check for links without accessible names
    const links = document.querySelectorAll('a:not([aria-label]):not([title])');
    links.forEach(link => {
        if (!link.textContent.trim()) {
            issues.push('Link sem texto acessível encontrado');
        }
    });
    
    // Check for buttons without accessible names
    const buttons = document.querySelectorAll('button:not([aria-label]):not([title])');
    buttons.forEach(button => {
        if (!button.textContent.trim()) {
            issues.push('Botão sem texto acessível encontrado');
        }
    });
    
    // Check for form inputs without labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputs.forEach(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (!label && input.type !== 'hidden' && input.type !== 'submit') {
            issues.push('Campo de formulário sem rótulo encontrado');
        }
    });
    
    if (issues.length > 0) {
        console.warn('Problemas de acessibilidade encontrados:', issues);
    } else {
        console.log('Nenhum problema óbvio de acessibilidade encontrado');
    }
    
    return issues;
}

// Export functions for use in other scripts
window.accessibilityFeatures = {
    toggleHighContrast,
    toggleFontSize,
    toggleVoiceReader,
    readText,
    stopReading,
    announceToScreenReader,
    runAccessibilityCheck
};