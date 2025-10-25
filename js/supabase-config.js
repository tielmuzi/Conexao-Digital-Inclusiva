/**
 * Supabase Configuration and Database Integration
 * Conexão Digital Inclusiva - Data Collection System
 */

// Supabase configuration
const SUPABASE_CONFIG = {
    url: 'https://kjranknaqdenlcozecpx.supabase.co', // Replace with your Supabase URL
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqcmFua25hcWRlbmxjb3plY3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDQ5NzcsImV4cCI6MjA3NjU4MDk3N30.kz0ftSCdPfzyFuLlP3hkNTi-ncvmHAWCGTOfw2rCiCE', // Replace with your Supabase anon key
    
    // Table names as specified in the document
    tables: {
        feedback: 'feedback',
        questionnaire: 'questionnaires'
    }
};

// Initialize Supabase client (when Supabase is properly configured)
let supabaseClient = null;

// Check if Supabase is available and configured
function initializeSupabase() {
    try {
        // Verificar se a biblioteca Supabase está carregada
        if (typeof window !== 'undefined' && !window.supabase) {
            console.log('⚠️ Biblioteca Supabase não encontrada. Certifique-se de incluir o script CDN.');
            return false;
        }

        if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.key) {
            console.log('🔄 Inicializando cliente Supabase...');
            
            // Usar a biblioteca global do Supabase
            const { createClient } = window.supabase || supabase;
            
            supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key, {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                },
                global: {
                    headers: {
                        'apikey': SUPABASE_CONFIG.key,
                        'Authorization': `Bearer ${SUPABASE_CONFIG.key}`
                    }
                },
                db: {
                    schema: 'public'
                }
            });
            
            console.log('✅ Cliente Supabase inicializado');
            console.log('URL:', SUPABASE_CONFIG.url);
            console.log('Key:', SUPABASE_CONFIG.key.substring(0, 20) + '...');
            
            return true;
        } else {
            console.log('⚠️ Configuração Supabase incompleta:', {
                hasUrl: !!SUPABASE_CONFIG.url,
                hasKey: !!SUPABASE_CONFIG.key
            });
            return false;
        }
    } catch (error) {
        console.error('❌ Erro ao inicializar Supabase:', error);
        return false;
    }
}

// Função utilitária para validar e limpar dados
function validateAndCleanData(data, type) {
    const cleaned = { ...data };
    
    // Garantir que campos obrigatórios tenham valores válidos
    if (type === 'feedback') {
        cleaned.name = cleaned.name || 'Anônimo';
        cleaned.type = cleaned.type || 'suggestion';
        cleaned.message = cleaned.message || 'Sem mensagem';
        
        // Garantir que name não seja string vazia
        if (typeof cleaned.name === 'string' && cleaned.name.trim() === '') {
            cleaned.name = 'Anônimo';
        }
        
        // Validar rating se fornecido
        if (cleaned.rating) {
            const rating = parseInt(cleaned.rating);
            if (isNaN(rating) || rating < 1 || rating > 5) {
                delete cleaned.rating;
            } else {
                cleaned.rating = rating;
            }
        }
        
    } else if (type === 'questionnaire') {
        cleaned.name = cleaned.name || 'Anônimo';
        
        // Garantir que name não seja string vazia
        if (typeof cleaned.name === 'string' && cleaned.name.trim() === '') {
            cleaned.name = 'Anônimo';
        }
        
        // Validar site_rating se fornecido
        if (cleaned.site_rating) {
            const rating = parseInt(cleaned.site_rating);
            if (isNaN(rating) || rating < 1 || rating > 5) {
                delete cleaned.site_rating;
            } else {
                cleaned.site_rating = rating;
            }
        }
        
        // Garantir que common_problems seja array
        if (cleaned.common_problems && !Array.isArray(cleaned.common_problems)) {
            cleaned.common_problems = [cleaned.common_problems].filter(Boolean);
        }
    }
    
    // Remover campos null, undefined ou strings vazias (exceto campos obrigatórios)
    const requiredFields = type === 'feedback' ? ['name', 'type', 'message'] : ['name'];
    
    Object.keys(cleaned).forEach(key => {
        if (!requiredFields.includes(key)) {
            if (cleaned[key] === null || cleaned[key] === undefined || cleaned[key] === '') {
                delete cleaned[key];
            }
        }
    });
    
    return cleaned;
}

// Database operations class
class DatabaseManager {
    constructor() {
        this.isSupabaseAvailable = initializeSupabase();
    }

    /**
     * Save feedback to database
     * @param {Object} feedbackData - Feedback form data
     * @returns {Promise<Object>} Result object with success status
     */
    async saveFeedback(feedbackData) {
        console.log('📥 Dados recebidos para feedback:', feedbackData);
        
        // Preparar e validar dados garantindo compatibilidade com a estrutura da tabela
        let data = {
            name: feedbackData.name || 'Anônimo',
            email: feedbackData.email || null,
            type: feedbackData.type || 'suggestion',
            rating: feedbackData.rating ? parseInt(feedbackData.rating) : null,
            message: feedbackData.message || 'Sem mensagem',
            page: feedbackData.page || window.location.pathname || null,
            created_at: new Date().toISOString()
        };

        // Aplicar validação e limpeza extra
        data = validateAndCleanData(data, 'feedback');
        
        // Verificação final para garantir que campos obrigatórios estão presentes
        if (!data.name || data.name.trim() === '') {
            console.warn('⚠️ Campo name estava vazio, usando "Anônimo"');
            data.name = 'Anônimo';
        }
        
        if (!data.type) {
            console.warn('⚠️ Campo type estava vazio, usando "suggestion"');
            data.type = 'suggestion';
        }
        
        if (!data.message) {
            console.warn('⚠️ Campo message estava vazio, usando "Sem mensagem"');
            data.message = 'Sem mensagem';
        }
        
        console.log('📊 Dados do feedback após validação:', data);

        if (this.isSupabaseAvailable && supabaseClient) {
            try {
                console.log('💾 Salvando feedback no Supabase:', data);
                
                const { data: result, error } = await supabaseClient
                    .from(SUPABASE_CONFIG.tables.feedback)
                    .insert([data])
                    .select(); // Adicionar select para retornar os dados inseridos

                if (error) {
                    console.error('❌ Erro Supabase ao salvar feedback:', error);
                    console.log('📱 Salvando no localStorage como fallback...');
                    return this.saveToLocalStorage('feedback', data);
                }

                console.log('✅ Feedback salvo no Supabase:', result);
                return { 
                    success: true, 
                    data: result?.[0] || data, 
                    source: 'supabase',
                    message: 'Feedback salvo com sucesso no banco de dados!'
                };
                
            } catch (error) {
                console.error('❌ Exceção ao salvar feedback no Supabase:', error);
                console.log('📱 Salvando no localStorage como fallback...');
                return this.saveToLocalStorage('feedback', data);
            }
        } else {
            console.log('📱 Salvando feedback no localStorage...');
            return this.saveToLocalStorage('feedback', data);
        }
    }

    /**
     * Save questionnaire responses to database
     * @param {Object} questionnaireData - Questionnaire form data
     * @returns {Promise<Object>} Result object with success status
     */
    async saveQuestionnaire(questionnaireData) {
        console.log('📥 Dados recebidos para questionário:', questionnaireData);
        
        // Preparar e validar dados garantindo compatibilidade com a estrutura da tabela
        let data = {
            name: questionnaireData.name || 'Anônimo',
            disability_type: questionnaireData.disability || questionnaireData.disability_type || null,
            common_problems: Array.isArray(questionnaireData.common_problems) 
                ? questionnaireData.common_problems 
                : [questionnaireData.common_problems].filter(Boolean),
            site_rating: questionnaireData.site_rating ? parseInt(questionnaireData.site_rating) : null,
            created_at: new Date().toISOString()
        };

        // Aplicar validação e limpeza
        data = validateAndCleanData(data, 'questionnaire');
        
        // Verificação final para garantir que campo obrigatório está presente
        if (!data.name || data.name.trim() === '') {
            console.warn('⚠️ Campo name estava vazio, usando "Anônimo"');
            data.name = 'Anônimo';
        }
        
        console.log('📊 Dados do questionário após validação:', data);

        if (this.isSupabaseAvailable && supabaseClient) {
            try {
                console.log('💾 Salvando questionário no Supabase:', data);
                
                const { data: result, error } = await supabaseClient
                    .from(SUPABASE_CONFIG.tables.questionnaire)
                    .insert([data])
                    .select(); // Adicionar select para retornar os dados inseridos

                if (error) {
                    console.error('❌ Erro Supabase ao salvar questionário:', error);
                    console.log('📱 Salvando no localStorage como fallback...');
                    return this.saveToLocalStorage('questionnaires', data);
                }

                console.log('✅ Questionário salvo no Supabase:', result);
                return { 
                    success: true, 
                    data: result?.[0] || data, 
                    source: 'supabase',
                    message: 'Questionário salvo com sucesso no banco de dados!'
                };
                
            } catch (error) {
                console.error('❌ Exceção ao salvar questionário no Supabase:', error);
                console.log('📱 Salvando no localStorage como fallback...');
                return this.saveToLocalStorage('questionnaires', data);
            }
        } else {
            console.log('📱 Salvando questionário no localStorage...');
            return this.saveToLocalStorage('questionnaires', data);
        }
    }

    /**
     * Get feedback statistics (for dashboard)
     * @returns {Promise<Object>} Statistics object
     */
    async getFeedbackStats() {
        if (this.isSupabaseAvailable) {
            try {
                // Get total count
                const { count: totalCount } = await supabaseClient
                    .from(SUPABASE_CONFIG.tables.feedback)
                    .select('*', { count: 'exact', head: true });

                // Get average rating
                const { data: ratingData } = await supabaseClient
                    .from(SUPABASE_CONFIG.tables.feedback)
                    .select('rating');

                const avgRating = ratingData && ratingData.length > 0
                    ? ratingData.reduce((sum, item) => sum + item.rating, 0) / ratingData.length
                    : 0;

                // Get feedback by type
                const { data: typeData } = await supabaseClient
                    .from(SUPABASE_CONFIG.tables.feedback)
                    .select('type');

                const typeStats = {};
                if (typeData) {
                    typeData.forEach(item => {
                        typeStats[item.type] = (typeStats[item.type] || 0) + 1;
                    });
                }

                return {
                    success: true,
                    data: {
                        totalFeedbacks: totalCount || 0,
                        averageRating: Math.round(avgRating * 10) / 10,
                        feedbackByType: typeStats
                    },
                    source: 'supabase'
                };
            } catch (error) {
                console.error('Error getting feedback stats:', error);
                return this.getLocalStorageStats('feedback');
            }
        } else {
            return this.getLocalStorageStats('feedback');
        }
    }

    /**
     * Get questionnaire statistics (for dashboard)
     * @returns {Promise<Object>} Statistics object
     */
    async getQuestionnaireStats() {
        if (this.isSupabaseAvailable) {
            try {
                // Get total responses
                const { count: totalCount } = await supabaseClient
                    .from(SUPABASE_CONFIG.tables.questionnaire)
                    .select('*', { count: 'exact', head: true });

                // Get disability distribution
                const { data: disabilityData } = await supabaseClient
                    .from(SUPABASE_CONFIG.tables.questionnaire)
                    .select('disability_type');

                const disabilityStats = {};
                if (disabilityData) {
                    disabilityData.forEach(item => {
                        if (item.disability_type) {
                            disabilityStats[item.disability_type] = (disabilityStats[item.disability_type] || 0) + 1;
                        }
                    });
                }

                // Get assistive technology usage
                const { data: techData } = await supabaseClient
                    .from(SUPABASE_CONFIG.tables.questionnaire)
                    .select('assistive_technologies');

                const techStats = {};
                if (techData) {
                    techData.forEach(item => {
                        if (item.assistive_technologies && Array.isArray(item.assistive_technologies)) {
                            item.assistive_technologies.forEach(tech => {
                                techStats[tech] = (techStats[tech] || 0) + 1;
                            });
                        }
                    });
                }

                return {
                    success: true,
                    data: {
                        totalResponses: totalCount || 0,
                        disabilityDistribution: disabilityStats,
                        assistiveTechUsage: techStats
                    },
                    source: 'supabase'
                };
            } catch (error) {
                console.error('Error getting questionnaire stats:', error);
                return this.getLocalStorageStats('questionnaires');
            }
        } else {
            return this.getLocalStorageStats('questionnaires');
        }
    }

    /**
     * Fallback: Save to localStorage when Supabase is not available
     * @param {string} type - Data type (feedback or questionnaire)
     * @param {Object} data - Data to save
     * @returns {Object} Result object
     */
    saveToLocalStorage(type, data) {
        try {
            const key = `conexao_digital_${type}`;
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            const newRecord = { 
                ...data, 
                id: Date.now(),
                saved_at: new Date().toISOString(),
                source: 'localStorage'
            };
            
            existing.push(newRecord);
            localStorage.setItem(key, JSON.stringify(existing));
            
            console.log(`✅ ${type} salvo no localStorage:`, newRecord);
            return { 
                success: true, 
                data: newRecord, 
                source: 'localStorage',
                message: `${type === 'feedback' ? 'Feedback' : 'Questionário'} salvo localmente (sem conexão com o banco de dados)`
            };
        } catch (error) {
            console.error(`❌ Erro ao salvar ${type} no localStorage:`, error);
            return { 
                success: false, 
                error: error.message, 
                source: 'localStorage',
                message: 'Erro ao salvar dados localmente'
            };
        }
    }

    /**
     * Get statistics from localStorage
     * @param {string} type - Data type
     * @returns {Object} Statistics object
     */
    getLocalStorageStats(type) {
        try {
            const key = `conexao_digital_${type}`;
            const data = JSON.parse(localStorage.getItem(key) || '[]');
            
            if (type === 'feedback') {
                const avgRating = data.length > 0
                    ? data.reduce((sum, item) => sum + (item.rating || 0), 0) / data.length
                    : 0;
                
                const typeStats = {};
                data.forEach(item => {
                    if (item.type) {
                        typeStats[item.type] = (typeStats[item.type] || 0) + 1;
                    }
                });
                
                return {
                    success: true,
                    data: {
                        totalFeedbacks: data.length,
                        averageRating: Math.round(avgRating * 10) / 10,
                        feedbackByType: typeStats
                    },
                    source: 'localStorage'
                };
            } else if (type === 'questionnaires') {
                const disabilityStats = {};
                const techStats = {};
                
                data.forEach(item => {
                    if (item.disability_type) {
                        disabilityStats[item.disability_type] = (disabilityStats[item.disability_type] || 0) + 1;
                    }
                    
                    if (item.assistive_technologies && Array.isArray(item.assistive_technologies)) {
                        item.assistive_technologies.forEach(tech => {
                            techStats[tech] = (techStats[tech] || 0) + 1;
                        });
                    }
                });
                
                return {
                    success: true,
                    data: {
                        totalResponses: data.length,
                        disabilityDistribution: disabilityStats,
                        assistiveTechUsage: techStats
                    },
                    source: 'localStorage'
                };
            }
        } catch (error) {
            console.error(`Error getting ${type} stats from localStorage:`, error);
            return { success: false, error: error.message, source: 'localStorage' };
        }
    }

    /**
     * Generate a unique session ID
     * @returns {string} Session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Test database connection
     * @returns {Promise<boolean>} Connection status
     */
    async testConnection() {
        if (!this.isSupabaseAvailable) {
            console.log('⚠️ Supabase não disponível - usando localStorage');
            return false;
        }

        try {
            console.log('🔄 Testando conexão com Supabase...');
            console.log('URL:', SUPABASE_CONFIG.url);
            console.log('Cliente disponível:', !!supabaseClient);
            
            if (!supabaseClient) {
                console.error('❌ Cliente Supabase não inicializado');
                return false;
            }
            
            // Teste simples: verificar se conseguimos fazer uma query
            const { data, error, count } = await supabaseClient
                .from(SUPABASE_CONFIG.tables.feedback)
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                console.error('❌ Erro na conexão Supabase:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
                
                // Verificar tipos específicos de erro
                if (error.code === 'PGRST116') {
                    console.error('❌ Tabela não encontrada. Verifique se a tabela "feedback" existe no Supabase.');
                } else if (error.code === '401' || error.message.includes('JWT')) {
                    console.error('❌ Erro de autenticação. Verifique suas credenciais do Supabase.');
                } else if (error.code === 'PGRST301') {
                    console.error('❌ Erro de permissão. Verifique as políticas RLS da tabela.');
                }
                
                return false;
            }
            
            console.log('✅ Conexão Supabase bem-sucedida');
            console.log('Contagem de registros:', count);
            return true;
            
        } catch (error) {
            console.error('❌ Exceção na conexão Supabase:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            // Verificar se é erro de rede
            if (error.message.includes('fetch') || error.message.includes('network')) {
                console.error('❌ Erro de conectividade. Verifique sua conexão com a internet.');
            }
            
            return false;
        }
    }
}

// Create global database manager instance
const dbManager = new DatabaseManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DatabaseManager, dbManager, SUPABASE_CONFIG };
} else {
    window.dbManager = dbManager;
    window.DatabaseManager = DatabaseManager;
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
}

// Initialize connection test on load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando sistema de banco de dados...');
    
    // Aguardar um pouco para garantir que as bibliotecas estejam carregadas
    setTimeout(async () => {
        const isConnected = await dbManager.testConnection();
        if (isConnected) {
            console.log('✅ Database connection successful');
            
            // Notificar outros scripts que a conexão está pronta
            window.dispatchEvent(new CustomEvent('supabaseReady', { 
                detail: { connected: true, source: 'supabase' } 
            }));
        } else {
            console.log('⚠️ Database not connected - using localStorage fallback');
            
            // Notificar que estamos usando fallback
            window.dispatchEvent(new CustomEvent('supabaseReady', { 
                detail: { connected: false, source: 'localStorage' } 
            }));
        }
    }, 100);
});

// Função para aguardar a biblioteca Supabase estar disponível
window.waitForSupabase = function(timeout = 5000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        const checkSupabase = () => {
            if (window.supabase || (typeof supabase !== 'undefined')) {
                resolve(true);
            } else if (Date.now() - startTime > timeout) {
                console.warn('⚠️ Timeout aguardando biblioteca Supabase');
                resolve(false);
            } else {
                setTimeout(checkSupabase, 100);
            }
        };
        
        checkSupabase();
    });
};