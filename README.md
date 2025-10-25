# Conexão Digital Inclusiva

Um projeto educativo sobre acessibilidade digital, desenvolvido para promover a inclusão e conscientização sobre a importância da acessibilidade na web, com dashboard avançado e coleta de dados reais.

## 🎯 Objetivo

Este projeto visa educar e sensibilizar sobre a importância da acessibilidade digital, demonstrando como criar experiências web inclusivas que atendam a todos os usuários, independentemente de suas habilidades ou limitações. Inclui coleta e análise de dados reais sobre acessibilidade digital.

## 🚀 Funcionalidades

### Páginas Principais
- **Home**: Apresentação do projeto e navegação principal
- **Sobre**: Informações sobre o projeto e sua missão
- **Importância**: Demonstração da importância da acessibilidade com simulador de dificuldades
- **Tecnologias**: Guia de tecnologias assistivas e ferramentas de desenvolvimento
- **ODS 10**: Conexão com os Objetivos de Desenvolvimento Sustentável da ONU
- **Comunidade**: Espaço para interação e discussão
- **Feedback**: Formulários para coleta de feedback e questionários de acessibilidade
- **Dashboard**: Visualizações avançadas de dados com gráficos 3D e analytics
- **Admin**: Painel administrativo para gerenciamento de dados

### Recursos de Acessibilidade
- **Toolbar de Acessibilidade**: Alto contraste, aumento de fonte, leitor de tela
- **Navegação por Teclado**: Suporte completo para navegação sem mouse
- **Comandos de Voz**: Integração com Web Speech API
- **Leitores de Tela**: Compatibilidade com NVDA, JAWS, VoiceOver
- **Simulador de Dificuldades**: Demonstração de barreiras de acessibilidade
- **Validação de Formulários**: Sistema robusto com fallback para localStorage

### Tecnologias Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Acessibilidade**: ARIA, Web Speech API, Service Workers
- **Backend**: Supabase com sistema de fallback para localStorage
- **IA**: Integração com Gemini AI para chatbot
- **Gráficos**: Chart.js, Three.js (WebGL), D3.js para visualizações avançadas
- **Validação**: Sistema robusto de validação de dados client-side

## 📋 Configuração

### Pré-requisitos
- Navegador web moderno
- Servidor HTTP local (Python, Node.js, ou similar)

### Instalação Básica
1. Clone ou baixe o projeto
2. Navegue até a pasta do projeto
3. Inicie um servidor HTTP local:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (com http-server)
   npx http-server -p 8000
   ```
4. Acesse `http://localhost:8000`

### Configuração do Supabase (Recomendado)

Para habilitar a coleta de dados de feedback e questionários com fallback automático:

1. **Criar Projeto no Supabase**
   - Acesse [supabase.com](https://supabase.com)
   - Crie uma nova conta ou faça login
   - Crie um novo projeto

2. **Configurar Tabelas**
   Execute os seguintes comandos SQL no editor do Supabase:

   ```sql
   -- Tabela para feedback geral
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

   -- Tabela para questionários de acessibilidade
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

   -- Políticas para permitir operações públicas
   CREATE POLICY "Allow public insert" ON feedback FOR INSERT WITH CHECK (true);
   CREATE POLICY "Allow public select" ON feedback FOR SELECT USING (true);
   CREATE POLICY "Allow public insert" ON questionnaires FOR INSERT WITH CHECK (true);
   CREATE POLICY "Allow public select" ON questionnaires FOR SELECT USING (true);
   ```

3. **Configurar Chaves de API**
   - Copie a URL do projeto e a chave anônima (anon key)
   - Edite o arquivo `js/supabase-config.js`:
   ```javascript
   const SUPABASE_URL = 'sua-url-do-supabase';
   const SUPABASE_ANON_KEY = 'sua-chave-anonima';
   ```

4. **Sistema de Fallback**
   - O sistema automaticamente usa localStorage quando Supabase não está disponível
   - Todos os dados são preservados localmente como backup
   - Não há interrupção na experiência do usuário

### Configuração do Gemini AI (Opcional)

Para habilitar o chatbot com IA:

1. **Obter Chave da API**
   - Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Crie uma chave de API para o Gemini

2. **Configurar Chave**
   - Edite o arquivo `js/chatbot.js`
   - Substitua `'SUA_CHAVE_API_AQUI'` pela sua chave real

## 🎨 Personalização

### Cores e Temas
As cores principais podem ser alteradas no arquivo `styles/main.css`:
```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #7c3aed;
    --accent-color: #059669;
    /* ... outras variáveis */
}
```

### Conteúdo
- Textos e conteúdos podem ser editados diretamente nos arquivos HTML
- Imagens devem ser adicionadas em formato SVG para melhor acessibilidade
- Novos idiomas podem ser adicionados criando arquivos de tradução

## 📊 Dashboards e Analytics

### Dashboard Público (`dashboard.html`)
- **Visualizações Avançadas**: Gráficos 3D com Three.js e WebGL
- **Mapas de Calor**: Correlação entre deficiências e problemas (D3.js)
- **Timeline Interativo**: Evolução temporal dos dados (Chart.js)
- **Nuvem de Palavras**: Análise de texto dos feedbacks
- **Estatísticas em Tempo Real**: Dados atualizados do Supabase
- **Formatação PT-BR**: Todos os dados exibidos em português brasileiro

### Painel Administrativo (`admin.html`)
- **Gerenciamento Completo**: Visualização, edição e exclusão de dados
- **Filtros Avançados**: Por tipo, data, rating e outros critérios
- **Exportação de Dados**: CSV com formatação em português brasileiro
- **Tabelas Interativas**: Paginação, ordenação e busca
- **Modais Detalhados**: Visualização completa de cada registro
- **Sistema de Validação**: Proteção contra dados inválidos

### Tecnologias de Computação Gráfica
- **Three.js**: Renderização 3D com WebGL para distribuição de ratings
- **D3.js**: Visualizações complexas incluindo mapas de calor
- **Chart.js**: Gráficos responsivos com interatividade
- **Canvas API**: Renderização 2D otimizada
- **WebGL**: Aceleração de hardware para gráficos 3D

## 🧪 Testes e Validação

### Testes de Acessibilidade Automatizados
- **Validação de Formulários**: Sistema robusto com sanitização de dados
- **Fallback para localStorage**: Funcionamento offline garantido
- **Formatação PT-BR**: Tradução automática de todos os campos
- **Navegação por Teclado**: Testado em todos os componentes

### Ferramentas Recomendadas
- **axe DevTools**: Extensão do navegador para testes automatizados
- **WAVE**: Ferramenta online de avaliação de acessibilidade
- **Lighthouse**: Auditoria integrada no Chrome DevTools
- **Colour Contrast Analyser**: Verificação de contraste de cores

### Testes Manuais
1. **Navegação por Teclado**: Use apenas Tab, Shift+Tab, Enter, Espaço
2. **Leitores de Tela**: Teste com NVDA (gratuito) ou VoiceOver (Mac)
3. **Zoom**: Teste com zoom de até 200%
4. **Alto Contraste**: Use o modo de alto contraste do sistema
5. **Conectividade**: Teste funcionamento offline/online

## 🔧 Funcionalidades Técnicas Avançadas

### Sistema de Validação Robusto
- **Sanitização de Dados**: Limpeza automática de campos obrigatórios
- **Fallback Inteligente**: localStorage quando Supabase indisponível
- **Tratamento de Erros**: Mensagens em português e logs detalhados
- **Campos Opcionais**: Sistema flexível para campos não obrigatórios

### Formatação em Português Brasileiro
- **Tipos de Feedback**: Bug/Erro, Sugestão, Elogio, Reclamação, Acessibilidade
- **Tipos de Deficiência**: Deficiência Visual, Auditiva, Motora, Cognitiva, Múltipla
- **Tecnologias Assistivas**: Leitor de Tela, Lupa/Ampliador, Navegação por Teclado
- **Problemas Comuns**: Navegação, Tamanho do Texto, Contraste de Cores

### Performance e Otimização
- **Lazy Loading**: Carregamento sob demanda de bibliotecas
- **Cache Inteligente**: Sistema de cache para melhor performance
- **Compressão de Dados**: Otimização de payload para mobile
- **CDN**: Uso de CDNs para bibliotecas externas
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Diretrizes
- Mantenha a acessibilidade como prioridade
- Teste todas as funcionalidades com tecnologias assistivas
- Documente mudanças significativas
- Siga os padrões WCAG 2.1 AA

## 📝 Licença

Este projeto é licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

## 🆘 Suporte

Para dúvidas, sugestões ou problemas:
- Use o formulário de feedback no site

## 🌟 Reconhecimentos

- Baseado nas diretrizes WCAG 2.1
- Inspirado nos Objetivos de Desenvolvimento Sustentável da ONU
- Comunidade de desenvolvedores de acessibilidade

---

**Conexão Digital Inclusiva** - Promovendo um mundo digital mais acessível para todos.