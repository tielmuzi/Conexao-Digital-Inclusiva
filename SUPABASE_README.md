# 🗄️ Configuração do Supabase - Conexão Digital Inclusiva

Este documento explica como configurar e usar a integração com o Supabase para armazenar dados de feedback e questionários, incluindo sistema de validação robusta e fallback automático para localStorage.

## 📋 Pré-requisitos

1. **Conta no Supabase**: Crie uma conta gratuita em [supabase.com](https://supabase.com)
2. **Projeto criado**: Crie um novo projeto no dashboard do Supabase
3. **Credenciais**: Tenha em mãos a URL do projeto e a chave anônima (anon key)
4. **Navegador moderno**: Suporte a ES6+ e WebGL para funcionalidades avançadas

## 🔧 Configuração Inicial

### 1. Criar as Tabelas no Supabase (Atualizado)

Execute o script SQL atualizado no SQL Editor do Supabase:

1. Acesse o Dashboard do Supabase
2. Vá para **SQL Editor**
3. Cole o script abaixo e execute:

```sql
-- Tabela para feedback geral (estrutura atualizada)
CREATE TABLE feedback (
    id BIGSERIAL PRIMARY KEY,
    name TEXT DEFAULT 'Anônimo',
    email TEXT,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    page TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para questionários de acessibilidade (estrutura atualizada)
CREATE TABLE questionnaires (
    id BIGSERIAL PRIMARY KEY,
    name TEXT DEFAULT 'Anônimo',
    disability_type TEXT,
    assistive_technologies TEXT[],
    common_problems TEXT[],
    site_rating INTEGER CHECK (site_rating >= 1 AND site_rating <= 5),
    suggestions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;

-- Políticas atualizadas para operações públicas
CREATE POLICY "Allow public insert" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON feedback FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON questionnaires FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON questionnaires FOR SELECT USING (true);

-- Índices para performance
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_questionnaires_created_at ON questionnaires(created_at DESC);
CREATE INDEX idx_feedback_type ON feedback(type);
CREATE INDEX idx_questionnaires_disability ON questionnaires(disability_type);
```

### 2. Configurar as Credenciais

Edite o arquivo `js/supabase-config.js` e atualize as seguintes informações:

```javascript
const SUPABASE_CONFIG = {
    url: 'SUA_URL_DO_SUPABASE_AQUI',
    key: 'SUA_CHAVE_ANONIMA_AQUI',
    // ...
};
```

**Como encontrar suas credenciais:**
1. No Dashboard do Supabase, vá para **Settings** > **API**
2. Copie a **URL** do projeto
3. Copie a **anon key** (chave pública)

### 3. Verificar a Integração

Use os arquivos de teste atualizados para verificar a configuração:

1. **Teste Básico**: Abra `test-supabase.html`
   - Testa conexão básica
   - Verifica se as tabelas existem
   - Testa inserção de dados

2. **Teste de Validação**: Use os formulários principais
   - Teste com campos vazios (validação)
   - Teste com dados válidos
   - Verifique fallback para localStorage

3. **Verificar Dashboard**: Abra `dashboard.html`
   - Confirme se dados aparecem formatados em PT-BR
   - Teste visualizações 3D e mapas de calor
   - Verifique se estatísticas são calculadas corretamente

4. **Teste Admin**: Abra `admin.html`
   - Visualize dados nas tabelas
   - Teste filtros e busca
   - Exporte dados em CSV

## 🏗️ Estrutura das Tabelas

### Tabela `feedback`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGSERIAL | ID único (chave primária) |
| `name` | TEXT | Nome do usuário (padrão: "Anônimo") |
| `email` | TEXT | Email do usuário (opcional) |
| `type` | TEXT | Tipo: bug, suggestion, compliment, complaint, accessibility |
| `rating` | INTEGER | Avaliação de 1 a 5 estrelas |
| `message` | TEXT | Mensagem do feedback |
| `page` | TEXT | Página onde foi enviado |
| `created_at` | TIMESTAMPTZ | Data/hora de criação |

### Tabela `questionnaires` (Atualizada)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGSERIAL | ID único (chave primária) |
| `name` | TEXT | Nome do respondente (padrão: "Anônimo") |
| `disability_type` | TEXT | Tipo de deficiência/dificuldade |
| `assistive_technologies` | TEXT[] | Array de tecnologias assistivas utilizadas |
| `common_problems` | TEXT[] | Array de problemas comuns encontrados |
| `site_rating` | INTEGER | Avaliação do site de 1 a 5 estrelas |
| `suggestions` | TEXT | Sugestões e comentários (opcional) |
| `created_at` | TIMESTAMPTZ | Data/hora de criação |

### Principais Mudanças na Estrutura

- ✅ **Campo `name` opcional**: Padrão "Anônimo" se não fornecido
- ✅ **Campo `email` opcional**: Removido como obrigatório
- ✅ **Campo `assistive_technologies`**: Renomeado e melhorado
- ✅ **Campo `suggestions`**: Adicionado para comentários
- ✅ **Índices de performance**: Para consultas mais rápidas
- ✅ **Validação robusta**: Sistema de sanitização no frontend

## 🔒 Segurança e Políticas RLS

O sistema usa **Row Level Security (RLS)** para controlar o acesso aos dados:

- ✅ **Inserção anônima permitida**: Usuários podem enviar feedback sem autenticação
- ✅ **Leitura anônima permitida**: Para gerar estatísticas
- ❌ **Edição/exclusão negada**: Apenas administradores podem modificar dados

## 🔄 Sistema de Fallback Inteligente

O sistema possui um fallback automático e inteligente para **localStorage** quando:

- O Supabase não está disponível ou configurado
- Há problemas de conectividade de rede
- As credenciais estão incorretas ou expiradas
- As tabelas não existem ou estão mal configuradas
- A API do Supabase está temporariamente indisponível

**Vantagens do sistema atualizado:**
- ✅ **Fallback automático**: Detecção inteligente de falhas
- ✅ **Validação robusta**: Dados são sempre validados antes do armazenamento
- ✅ **Formatação consistente**: PT-BR tanto online quanto offline
- ✅ **Experiência contínua**: Usuário não percebe problemas de conectividade
- ✅ **Sincronização futura**: Preparado para sync quando conexão voltar

## 🛡️ Sistema de Validação Avançado

### Validação de Dados
```javascript
// Exemplo da função de validação
function validateAndCleanData(data) {
    const cleaned = {};
    
    // Nome: opcional, padrão "Anônimo"
    cleaned.name = (data.name?.trim() || 'Anônimo');
    
    // Email: opcional, validação de formato
    if (data.email?.trim()) {
        cleaned.email = data.email.trim();
    }
    
    // Campos obrigatórios com validação
    if (!data.type?.trim()) {
        throw new Error('Tipo é obrigatório');
    }
    cleaned.type = data.type.trim();
    
    // Arrays com sanitização
    if (Array.isArray(data.common_problems)) {
        cleaned.common_problems = data.common_problems
            .filter(p => p?.trim())
            .map(p => p.trim());
    }
    
    return cleaned;
}
```

## 🧪 Testando a Integração

## 🧪 Testando a Integração Atualizada

### Testes Disponíveis

1. **Teste Básico de Conexão**: `test-supabase.html`
   - Verifica conectividade
   - Testa operações CRUD básicas
   - Valida estrutura das tabelas

2. **Teste de Integração**: `test-integration.html`
   - Testa formulários completos
   - Verifica validação de dados
   - Confirma fallback para localStorage

### Diagnóstico Automatizado

Execute o seguinte no console do navegador para diagnóstico completo:

```javascript
// Verificar configuração
console.log('Supabase URL:', SUPABASE_URL);
console.log('Cliente inicializado:', !!supabaseClient);

// Testar conexão
async function diagnosticoCompleto() {
    try {
        // Teste de conectividade
        const { data: feedbackTest } = await supabaseClient
            .from('feedback').select('count').limit(1);
        console.log('✅ Tabela feedback acessível');
        
        const { data: questionnaireTest } = await supabaseClient
            .from('questionnaires').select('count').limit(1);
        console.log('✅ Tabela questionnaires acessível');
        
        // Teste de inserção
        const testData = {
            name: 'Teste Diagnóstico',
            type: 'suggestion',
            message: 'Teste de conectividade',
            rating: 5
        };
        
        const { data, error } = await supabaseClient
            .from('feedback').insert([testData]).select();
        
        if (error) throw error;
        console.log('✅ Inserção funcionando:', data);
        
        // Limpar teste
        await supabaseClient
            .from('feedback')
            .delete()
            .eq('id', data[0].id);
        console.log('✅ Diagnóstico completo - tudo funcionando!');
        
    } catch (error) {
        console.log('❌ Erro no diagnóstico:', error);
        console.log('🔄 Sistema usará localStorage como fallback');
    }
}

diagnosticoCompleto();
```

1. **Console do Navegador**: Verifique mensagens de log
2. **Dashboard Supabase**: Confirme se os dados estão sendo salvos
3. **Rede**: Use as ferramentas de desenvolvedor para monitorar requests

### Indicadores de Status

| Emoji | Status | Descrição |
|-------|--------|-----------|
| ✅ | Sucesso | Conexão funcionando, dados no Supabase |
| ⚠️ | Fallback | Usando localStorage, sem conexão |
| ❌ | Erro | Problema que precisa ser resolvido |

## 🔧 Solução de Problemas

### Erro: "Tabela não encontrada"

**Causa**: Tabelas não foram criadas no Supabase
**Solução**: Execute o script `supabase-tables.sql`

### Erro: "401 Unauthorized"

**Causa**: Credenciais incorretas
**Solução**: Verifique URL e chave anônima no arquivo de configuração

### Erro: "PGRST301"

**Causa**: Políticas RLS muito restritivas
**Solução**: Verifique as políticas de segurança no Supabase

### Biblioteca não carregada

**Causa**: CDN do Supabase não acessível
**Solução**: Verifique conexão com internet e CDN

## 📊 Monitoramento

### Logs Importantes Atualizados

```javascript
// Inicialização bem-sucedida
'✅ Cliente Supabase inicializado com sucesso'
'✅ Conexão Supabase estabelecida'
'✅ Validação de dados aprovada'

// Sistema de fallback
'⚠️ Supabase indisponível - ativando fallback para localStorage'
'📱 Dados salvos no localStorage como backup'
'🔄 Tentativa de reconexão agendada'

// Validação de dados
'✅ Dados validados e sanitizados'
'⚠️ Campo obrigatório preenchido automaticamente'
'❌ Erro de validação: campo obrigatório ausente'

// Formatação PT-BR
'🇧🇷 Dados formatados para português brasileiro'
'📊 Dashboard atualizado com dados traduzidos'
```

### Performance e Otimização

```javascript
// Métricas de performance
'⚡ Query executada em 150ms'
'💾 Cache atualizado: 50 registros'
'🎯 Índice utilizado: idx_feedback_created_at'
'📈 Taxa de sucesso: 99.5%'
```

### Eventos Customizados

O sistema dispara eventos que você pode escutar:

```javascript
window.addEventListener('supabaseReady', function(event) {
    const { connected, source } = event.detail;
    console.log(`Supabase ready: ${connected ? 'connected' : 'fallback'}`);
});
```

## 🚀 Próximos Passos e Melhorias

### ✅ **Implementado**
- [x] Sistema de validação robusta com sanitização
- [x] Fallback inteligente para localStorage 
- [x] Formatação completa em português brasileiro
- [x] Dashboard com computação gráfica (Three.js, D3.js)
- [x] Painel administrativo com dados reais
- [x] Exportação de dados em CSV formatado
- [x] Índices de performance no banco de dados

### 🔄 **Em Desenvolvimento**
1. **Sincronização offline/online**: Sync automática quando conexão voltar
2. **Cache inteligente**: Sistema de cache com TTL configurável
3. **Compressão de dados**: Otimização de payload para mobile
4. **Rate limiting**: Proteção contra spam e abuso

### 🎯 **Próximas Funcionalidades**
1. **Notificações em tempo real**: WebSockets para updates instantâneos
2. **Backup automático**: Exportação programada para múltiplos formatos
3. **Analytics avançadas**: Machine learning para insights automáticos
4. **API pública**: Endpoints REST para integração externa

### 🔧 **Configurações Avançadas**

#### Otimização de Performance
```javascript
// Configurações recomendadas em js/supabase-config.js
const SUPABASE_CONFIG = {
    url: 'sua-url',
    key: 'sua-chave',
    options: {
        db: {
            schema: 'public',
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false
        },
        global: {
            headers: {
                'x-client-info': 'conexao-digital-v2'
            }
        }
    }
};
```

#### Monitoramento Avançado
```javascript
// Sistema de métricas personalizado
window.addEventListener('supabaseMetrics', function(event) {
    const { operation, duration, success, fallback } = event.detail;
    console.log(`📊 ${operation}: ${duration}ms - ${success ? '✅' : '❌'} ${fallback ? '(fallback)' : ''}`);
});
```

---