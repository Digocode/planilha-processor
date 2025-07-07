const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração de diretórios
const uploadDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');

// Criar diretórios se não existirem
[uploadDir, outputDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Diretório criado: ${dir}`);
    }
});

// Configuração do Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const originalName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${timestamp}_${originalName}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos Excel (.xlsx, .xls) são permitidos!'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

// Variável para armazenar dados da última planilha processada
let ultimaPlanilha = null;

// Rota de teste
app.get('/', (req, res) => {
    res.json({
        message: '🚀 Backend do Processador de Planilhas está rodando!',
        endpoints: {
            upload: 'POST /upload',
            info: 'GET /info',
            extrair: 'GET /extrair',
            colunas: 'GET /colunas'
        }
    });
});

// Rota para upload de planilha
app.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Nenhum arquivo foi enviado'
            });
        }

        console.log(`📄 Processando arquivo: ${req.file.originalname}`);

        // Ler a planilha
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet || !worksheet['!ref']) {
            return res.status(400).json({
                success: false,
                error: 'Planilha vazia ou inválida'
            });
        }

        // Extrair dados
        const range = xlsx.utils.decode_range(worksheet['!ref']);
        const headers = [];
        
        // Ler cabeçalhos
        for (let C = range.s.c; C <= range.e.c; C++) {
            const addr = xlsx.utils.encode_cell({ c: C, r: 0 });
            const cell = worksheet[addr];
            headers.push(cell ? String(cell.v).trim() : `Coluna_${C + 1}`);
        }

        // Ler dados
        const dados = [];
        for (let R = range.s.r + 1; R <= range.e.r; R++) {
            const linha = {};
            for (let C = range.s.c; C <= range.e.c; C++) {
                const addr = xlsx.utils.encode_cell({ c: C, r: R });
                const cell = worksheet[addr];
                const header = headers[C];
                linha[header] = cell ? String(cell.v).trim() : '';
            }
            dados.push(linha);
        }

        // Armazenar dados processados
        ultimaPlanilha = {
            nomeArquivo: req.file.originalname,
            dataUpload: new Date().toISOString(),
            headers,
            dados,
            totalLinhas: dados.length,
            caminhoArquivo: req.file.path
        };

        console.log(`✅ Planilha processada: ${dados.length} linhas, ${headers.length} colunas`);

        res.json({
            success: true,
            message: 'Planilha processada com sucesso!',
            info: {
                nomeArquivo: ultimaPlanilha.nomeArquivo,
                totalLinhas: ultimaPlanilha.totalLinhas,
                totalColunas: headers.length,
                headers: headers.slice(0, 10) // Primeiras 10 colunas para preview
            }
        });

    } catch (error) {
        console.error('❌ Erro ao processar planilha:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao processar planilha: ' + error.message
        });
    }
});

// Rota para obter informações da planilha carregada
app.get('/info', (req, res) => {
    if (!ultimaPlanilha) {
        return res.status(404).json({
            success: false,
            error: 'Nenhuma planilha foi carregada ainda'
        });
    }

    res.json({
        success: true,
        info: {
            nomeArquivo: ultimaPlanilha.nomeArquivo,
            dataUpload: ultimaPlanilha.dataUpload,
            totalLinhas: ultimaPlanilha.totalLinhas,
            totalColunas: ultimaPlanilha.headers.length,
            headers: ultimaPlanilha.headers
        }
    });
});

// Rota para obter todas as colunas disponíveis
app.get('/colunas', (req, res) => {
    if (!ultimaPlanilha) {
        return res.status(404).json({
            success: false,
            error: 'Nenhuma planilha foi carregada ainda'
        });
    }

    res.json({
        success: true,
        colunas: ultimaPlanilha.headers
    });
});

// Rota para extrair dados e gerar PDF
app.post('/extrair', (req, res) => {
    if (!ultimaPlanilha) {
        return res.status(404).json({
            success: false,
            error: 'Nenhuma planilha foi carregada. Faça o upload primeiro.'
        });
    }

    try {
        const { colunasDesejadas } = req.body;
        
        // Se não especificadas, usar colunas padrão
        const colunas = colunasDesejadas || [
            'PARTICIPANTE', 'SEXO', '1', '1 CONTATO', '2', '2 CONTATO', 
            '3', '3 CONTATO', 'Pedido de Carta', 'Central de Cartas'
        ];

        console.log(`📊 Extraindo dados das colunas: ${colunas.join(', ')}`);

        // Filtrar dados pelas colunas desejadas
        const dadosFiltrados = ultimaPlanilha.dados.map(linha => {
            const linheFiltrada = {};
            colunas.forEach(coluna => {
                linheFiltrada[coluna] = linha[coluna] || '---';
            });
            return linheFiltrada;
        });

        // Gerar PDF
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(chunks);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="relatorio-participantes.pdf"');
            res.send(pdfBuffer);
            console.log('📄 PDF gerado e enviado com sucesso');
        });

        // Cabeçalho do PDF
        doc.fontSize(20)
           .text('Relatório de Participantes', { align: 'center' })
           .moveDown();

        doc.fontSize(12)
           .text(`Arquivo: ${ultimaPlanilha.nomeArquivo}`)
           .text(`Data de processamento: ${new Date().toLocaleString('pt-BR')}`)
           .text(`Total de registros: ${dadosFiltrados.length}`)
           .moveDown();

        // Dados
        if (dadosFiltrados.length === 0) {
            doc.text('Nenhum dado encontrado para as colunas especificadas.', { align: 'center' });
        } else {
            dadosFiltrados.forEach((registro, index) => {
                // Verificar se precisa de nova página
                if (doc.y > 700) {
                    doc.addPage();
                }

                doc.fontSize(14)
                   .text(`Registro ${index + 1}`, { underline: true })
                   .moveDown(0.3);

                Object.entries(registro).forEach(([coluna, valor]) => {
                    doc.fontSize(10)
                       .text(`${coluna}: `, { continued: true, width: 100 })
                       .text(valor || '---');
                });

                doc.moveDown(0.5);
            });
        }

        doc.end();

    } catch (error) {
        console.error('❌ Erro ao gerar PDF:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao gerar PDF: ' + error.message
        });
    }
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'Arquivo muito grande. Tamanho máximo: 10MB'
            });
        }
    }
    
    console.error('❌ Erro não tratado:', error);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
    });
});

// Iniciar servidor
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
    console.log(`📁 Uploads: ${uploadDir}`);
    console.log(`📁 Output: ${outputDir}`);
});

module.exports = app;

