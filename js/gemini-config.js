// Configuração da API do Gemini
// INSTRUÇÕES:
// 1. Substitua 'SUA_API_KEY_AQUI' pela sua chave API real do Google Gemini
// 2. Obtenha sua API key em: https://makersuite.google.com/app/apikey
// 3. Mantenha este arquivo seguro e não o compartilhe publicamente

const GEMINI_CONFIG = {
    apiKey: 'AIzaSyCK_C2FmrfRG4aEB1fRjnmBF4NkDkGIz9M', // ⚠️ SUBSTITUA PELA SUA API KEY REAL
    model: 'gemini-pro',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    
    // Configurações de geração
    generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
    },
    
    // Configurações de segurança
    safetySettings: [
        {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
    ]
};

// Função para verificar se a API key foi configurada
function isApiKeyConfigured() {
    return GEMINI_CONFIG.apiKey && 
           GEMINI_CONFIG.apiKey !== 'SUA_API_KEY_AQUI' && 
           GEMINI_CONFIG.apiKey.length > 20;
}

// Exportar configuração
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GEMINI_CONFIG, isApiKeyConfigured };
}