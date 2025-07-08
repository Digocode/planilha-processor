import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle, Info } from 'lucide-react'
import './App.css'
import api from './api'

console.log('🔍 API URL:', import.meta.env.VITE_API_URL)

api.get('/info')
  .then(response => console.log(response.data))
  .catch(error => console.error('Erro na API:', error))


function App() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [planilhaInfo, setPlanilhaInfo] = useState(null)
  const [message, setMessage] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setMessage(null)
      setPlanilhaInfo(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Por favor, selecione um arquivo primeiro.' })
      return
    }

    setUploading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const data = response.data

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setPlanilhaInfo(data.info)
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor. Verifique se o backend está rodando.' })
    } finally {
      setUploading(false)
    }
  }

  const handleExtract = async () => {
    setExtracting(true)
    setMessage(null)

    try {
      const response = await api.post('/extrair', {
        colunasDesejadas: [
          'PARTICIPANTE', 'SEXO', '1', '1 CONTATO', '2', '2 CONTATO',
          '3', '3 CONTATO', 'Pedido de Carta', 'Central de Cartas'
        ]
      }, {
        responseType: 'blob'
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'relatorio-participantes.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      setMessage({ type: 'success', text: 'PDF gerado e baixado com sucesso!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao gerar PDF ou conectar com o servidor' })
    }
  }
}

const resetForm = () => {
  setFile(null)
  setPlanilhaInfo(null)
  setMessage(null)
  if (fileInputRef.current) {
    fileInputRef.current.value = ''
  }
}

return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Extrator de dados para Cartas
        </h1>
        <p className="text-gray-600">
          Faça upload de arquivos Excel (.xlsx) e gere relatórios customizado em PDF
        </p>
      </div>

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Planilha
          </CardTitle>
          <CardDescription>
            Selecione um arquivo Excel (.xlsx) para processar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
            >
              <FileSpreadsheet className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">
                {file ? file.name : 'Clique para selecionar arquivo'}
              </span>
            </label>
            {file && (
              <Badge variant="secondary" className="ml-2">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Fazer Upload
                </>
              )}
            </Button>
            {(file || planilhaInfo) && (
              <Button variant="outline" onClick={resetForm}>
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      {message && (
        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
          {message.type === 'error' ? (
            <AlertCircle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Planilha Info */}
      {planilhaInfo && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Informações da Planilha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Arquivo</div>
                <div className="text-lg font-semibold text-blue-900">
                  {planilhaInfo.nomeArquivo}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Total de Linhas</div>
                <div className="text-lg font-semibold text-green-900">
                  {planilhaInfo.totalLinhas}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Total de Colunas</div>
                <div className="text-lg font-semibold text-purple-900">
                  {planilhaInfo.totalColunas}
                </div>
              </div>
            </div>

            {planilhaInfo.headers && planilhaInfo.headers.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Primeiras colunas encontradas:
                </div>
                <div className="flex flex-wrap gap-2">
                  {planilhaInfo.headers.map((header, index) => (
                    <Badge key={index} variant="outline">
                      {header}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Extract Section */}
      {planilhaInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Gerar Relatório
            </CardTitle>
            <CardDescription>
              Extrair dados específicos e gerar PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Colunas que serão extraídas:
                </div>
                <div className="flex flex-wrap gap-2">
                  {['PARTICIPANTE', 'SEXO', '1', '1 CONTATO', '2', '2 CONTATO', '3', '3 CONTATO', 'Pedido de Carta', 'Central de Cartas'].map((col, index) => (
                    <Badge key={index} variant="secondary">
                      {col}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleExtract}
                disabled={extracting}
                className="w-full flex items-center justify-center gap-2"
                size="lg"
              >
                {extracting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Gerar e Baixar PDF
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center mt-8 text-gray-500 text-sm">
        <p>Processador de Planilhas - Privado copywirite</p>
      </div>
    </div>
  </div>
)

export default App

