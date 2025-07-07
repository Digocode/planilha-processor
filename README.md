# Processador de Planilhas

Um sistema completo para upload e processamento de planilhas Excel (.xlsx) com geração de relatórios em PDF. Desenvolvido com Node.js, Express e React.

## 🚀 Funcionalidades

- **Upload de Planilhas**: Interface drag-and-drop para arquivos Excel (.xlsx)
- **Processamento Inteligente**: Leitura automática de cabeçalhos e dados
- **Visualização de Dados**: Preview das informações da planilha carregada
- **Geração de PDF**: Relatórios personalizados com colunas específicas
- **Interface Moderna**: UI limpa e responsiva com Tailwind CSS
- **Validação de Arquivos**: Verificação de tipo e tamanho dos arquivos
- **Feedback Visual**: Indicadores de progresso e mensagens de status

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou pnpm

## 🛠️ Instalação

### 1. Clone ou baixe o projeto

```bash
# Se usando git
git clone <url-do-repositorio>
cd planilha-processor

# Ou extraia o arquivo ZIP baixado
```

### 2. Instalar dependências do Backend

```bash
cd backend
npm install
```

### 3. Instalar dependências do Frontend

```bash
cd ../frontend
npm install
```

## 🚀 Como Usar

### 1. Iniciar o Backend

```bash
cd backend
npm start
```

O servidor backend estará rodando em: `http://localhost:3001`

### 2. Iniciar o Frontend (em outro terminal)

```bash
cd frontend
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

### 3. Usar a Aplicação

1. **Upload da Planilha**:
   - Clique em "Clique para selecionar arquivo"
   - Escolha um arquivo Excel (.xlsx)
   - Clique em "Fazer Upload"

2. **Visualizar Informações**:
   - Após o upload, veja as informações da planilha
   - Número de linhas, colunas e preview dos cabeçalhos

3. **Gerar Relatório**:
   - Clique em "Gerar e Baixar PDF"
   - O arquivo será baixado automaticamente

## 📊 Colunas Extraídas

O sistema extrai automaticamente as seguintes colunas (quando disponíveis):

- PARTICIPANTE
- SEXO
- 1, 1 CONTATO
- 2, 2 CONTATO
- 3, 3 CONTATO
- Pedido de Carta
- Central de Cartas

## 🏗️ Estrutura do Projeto

```
planilha-processor/
├── backend/                 # Servidor Node.js/Express
│   ├── uploads/            # Arquivos enviados
│   ├── output/             # Arquivos gerados
│   ├── server.js           # Servidor principal
│   └── package.json        # Dependências do backend
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes UI
│   │   ├── App.jsx         # Componente principal
│   │   └── App.css         # Estilos
│   ├── index.html          # HTML principal
│   └── package.json        # Dependências do frontend
└── README.md               # Este arquivo
```

## 🔧 Tecnologias Utilizadas

### Backend
- **Node.js**: Runtime JavaScript
- **Express**: Framework web
- **Multer**: Upload de arquivos
- **XLSX**: Processamento de planilhas Excel
- **PDFKit**: Geração de PDFs
- **CORS**: Controle de acesso

### Frontend
- **React**: Biblioteca de interface
- **Vite**: Build tool e dev server
- **Tailwind CSS**: Framework de estilos
- **shadcn/ui**: Componentes de interface
- **Lucide React**: Ícones

## 📝 API Endpoints

### `POST /upload`
Upload de arquivo Excel
- **Body**: FormData com arquivo
- **Response**: Informações da planilha processada

### `GET /info`
Informações da última planilha carregada
- **Response**: Detalhes da planilha

### `POST /extrair`
Gerar e baixar PDF
- **Body**: JSON com colunas desejadas (opcional)
- **Response**: Arquivo PDF

### `GET /colunas`
Listar colunas disponíveis
- **Response**: Array com nomes das colunas

## 🚨 Solução de Problemas

### Erro de Conexão
- Verifique se o backend está rodando na porta 3001
- Confirme se não há firewall bloqueando as portas

### Erro de Upload
- Verifique se o arquivo é .xlsx válido
- Confirme se o arquivo não excede 10MB

### Erro de PDF
- Certifique-se de que uma planilha foi carregada primeiro
- Verifique se as colunas especificadas existem na planilha

## 🔄 Melhorias Futuras

- [ ] Seleção personalizada de colunas
- [ ] Múltiplos formatos de saída (CSV, JSON)
- [ ] Histórico de processamentos
- [ ] Autenticação de usuários
- [ ] Deploy em produção
- [ ] Testes automatizados

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 👨‍💻 Desenvolvedor

Projeto desenvolvido como uma versão melhorada do processador de planilhas original, com interface moderna e funcionalidades aprimoradas.

---

**Nota**: Este projeto foi criado para fins educacionais e pode ser adaptado conforme suas necessidades específicas.

