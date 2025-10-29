# 🔑 Configuração da API do Google Gemini

## 📋 Passo a Passo para Ativar a IA

### 1. **Obter API Key do Google Gemini**
   1. Acesse: https://makersuite.google.com/app/apikey
   2. Faça login com sua conta Google
   3. Clique em "Create API key"
   4. Copie a chave gerada

### 2. **Configurar no Projeto**
   1. Abra o arquivo: `js/gemini-config.js`
   2. Encontre a linha: `apiKey: 'SUA_API_KEY_AQUI'`
   3. Substitua `'SUA_API_KEY_AQUI'` pela sua chave real
   4. Salve o arquivo

### 3. **Exemplo de Configuração**
```javascript
const GEMINI_CONFIG = {
    apiKey: 'AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Sua chave aqui
    // ... resto da configuração
};
```

### 4. **Verificar se Funcionou**
   1. Abra o site no navegador
   2. Abra o chatbot
   3. Digite `/status` para verificar
   4. Deve mostrar: "🧠 IA Gemini ativa e funcionando"

## 🔒 **Segurança Importante**

⚠️ **NUNCA compartilhe sua API key publicamente**
- Não faça commit da chave em repositórios públicos
- Use variáveis de ambiente em produção
- Mantenha backups da configuração

## 🎯 **Resultado**

✅ **Com API configurada:**
- Chatbot responde qualquer pergunta sobre acessibilidade
- Respostas inteligentes e contextuais
- Suporte a perguntas complexas

❌ **Sem API configurada:**
- Chatbot usa respostas pré-definidas
- Limitado a palavras-chave específicas
- Ainda funcional, mas menos inteligente

## 🆘 **Problemas Comuns**

### Erro: "API Key não configurada"
- Verifique se substituiu 'SUA_API_KEY_AQUI'
- Confirme que a chave tem mais de 20 caracteres
- Teste a chave em https://makersuite.google.com

### Erro: "HTTP 403" ou "API key invalid"
- API key pode estar incorreta ou expirada
- Gere uma nova chave no Google AI Studio
- Verifique permissões da API

### Chatbot não responde
- Abra o Console do navegador (F12)
- Verifique se há erros JavaScript
- Digite `/status` no chat para diagnosticar

## 📞 **Suporte**

Se precisar de ajuda:
1. Verifique o console do navegador
2. Teste com `/status` no chatbot
3. Confirme que o arquivo gemini-config.js foi salvo corretamente