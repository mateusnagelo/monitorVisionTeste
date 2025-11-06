import { useState } from 'react'
import { Alert, Box, Button, Divider, InputAdornment, Paper, Stack, TextField, Typography, CircularProgress, Chip } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import QrCodeIcon from '@mui/icons-material/QrCode'
import TableChart from '@mui/icons-material/TableChart'
import { useConfig } from '../context/ConfigContext'
import { appendCosmosLog, fetchByEAN, searchProducts } from '../services/cosmos'
import { fetchNCM } from '../services/ncm'
import { FileText, Copy, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

function cleanDigits(input: string) {
  return input.replace(/\D/g, '')
}

// Removido tipo e estado de tipo de busca; teremos dois campos: nome e EAN
export default function CosmosLookup() {
  const { config } = useConfig()
  // estados ajustados para dois campos
  const [nameQuery, setNameQuery] = useState('')
  const [eanQuery, setEanQuery] = useState('')
  const [ncmQuery, setNcmQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [errorName, setErrorName] = useState<string | null>(null)
  const [errorEAN, setErrorEAN] = useState<string | null>(null)
  const [errorNCM, setErrorNCM] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)

  const handleSearch = async () => {
    const name = nameQuery.trim()
    const eanDigits = cleanDigits(eanQuery)
    const ncmDigits = cleanDigits(ncmQuery)
  
    setErrorGeneral(null)
    setErrorName(null)
    setErrorEAN(null)
    setErrorNCM(null)
    setResults(null)
  
    if (!name && !eanDigits && !ncmDigits) {
      setErrorGeneral('Informe Nome do Produto, Código EAN/GTIN ou Código NCM.')
      return
    }
  
    setLoading(true)
  
    let byName: any = null
    let byEAN: any = null
    let byNCM: any = null
  
    // Busca por nome se informado
    if (name) {
      try {
        byName = await searchProducts(config.cosmosApiBase, config.cosmosToken, name)
        setErrorName(null)
        appendCosmosLog({ timestamp: new Date().toISOString(), type: 'NOME', query: name, success: true, error: null })
      } catch (e: any) {
        setErrorName(e?.message || 'Falha ao pesquisar produtos')
        appendCosmosLog({ timestamp: new Date().toISOString(), type: 'NOME', query: name, success: false, error: String(e?.message || e) })
      }
    }
  
    // Busca por EAN se válido
    if (eanDigits) {
      if (eanDigits.length < 8) {
        setErrorEAN('Informe um EAN/GTIN válido (mín. 8 dígitos).')
      } else {
        try {
          byEAN = await fetchByEAN(config.cosmosApiBase, config.cosmosToken, eanDigits)
          setErrorEAN(null)
          appendCosmosLog({ timestamp: new Date().toISOString(), type: 'EAN', query: eanDigits, success: true, error: null })
        } catch (e: any) {
          setErrorEAN(e?.message || 'Falha ao consultar EAN/GTIN')
          appendCosmosLog({ timestamp: new Date().toISOString(), type: 'EAN', query: eanDigits, success: false, error: String(e?.message || e) })
        }
      }
    }
  
    // Busca por NCM se válido
    if (ncmDigits) {
      if (ncmDigits.length !== 8) {
        setErrorNCM('Informe um código NCM com 8 dígitos.')
      } else {
        try {
          byNCM = await fetchNCM(config.cosmosApiBase, config.cosmosToken, ncmDigits)
          setErrorNCM(null)
          appendCosmosLog({ timestamp: new Date().toISOString(), type: 'NCM', query: ncmDigits, success: true, error: null })
        } catch (e: any) {
          setErrorNCM(e?.message || 'Falha ao consultar NCM')
          appendCosmosLog({ timestamp: new Date().toISOString(), type: 'NCM', query: ncmDigits, success: false, error: String(e?.message || e) })
        }
      }
    }
  
    setResults({ byName, byEAN, byNCM })
    setLoading(false)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (e) {
      console.warn('Falha ao copiar', e)
    }
  }

  const exportJson = (obj: any, filename: string) => {
    const data = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // Helpers para extrair campos comuns do retorno por NCM
  const getNcmSummary = (ncmData: any) => {
    const total = ncmData?.total || ncmData?.count || (Array.isArray(ncmData) ? ncmData.length : 0)
    const produtos = ncmData?.products || ncmData?.items || (Array.isArray(ncmData) ? ncmData : [])
    const primeiraDescricao = produtos?.[0]?.name || produtos?.[0]?.description || ncmData?.description || 'NCM consultado'
    return { total, produtos, primeiraDescricao }
  }

  // Extração robusta das informações do NCM (código, descrição e classificação)
  const extractNcmInfo = (data: any) => {
    const n = data?.ncm || data
    const code = n?.code || n?.ncm || n?.id || null
    const description = n?.description || n?.name || data?.description || 'NCM'
    const chapter = n?.chapter || data?.chapter || null
    const position = n?.position || data?.position || null
    const subposition = n?.subposition || data?.subposition || null
    const category = n?.category || data?.category || null
    return { code, description, chapter, position, subposition, category }
  }

  const extractProducts = (data: any) => {
    return data?.products || data?.items || (Array.isArray(data) ? data : [])
  }

  const getGtins = (p: any): string[] => {
    if (Array.isArray(p?.gtins)) return p.gtins.map((g: any) => g?.gtin || g).filter(Boolean)
    if (p?.gtin) return [p.gtin]
    return []
  }
  
  // Variantes de animação sutis para dar toque premium
  const fadeSlideUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  }
  
  const listParent = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.06 } },
  }
  
  const listItem = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  }
  
  // Componentes Motion para MUI
  const MotionPaper = motion(Paper as any)
  const MotionButton = motion(Button as any)

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <TextField
            label="Nome do Produto"
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder="Digite nome do produto..."
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          />

          <TextField
            label="Código EAN/GTIN"
            value={eanQuery}
            onChange={(e) => setEanQuery(e.target.value)}
            placeholder="Digite código EAN/GTIN..."
            fullWidth
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            InputProps={{ startAdornment: <InputAdornment position="start"><QrCodeIcon /></InputAdornment> }}
          />

          <TextField
            label="Código NCM"
            value={ncmQuery}
            onChange={(e) => setNcmQuery(e.target.value)}
            placeholder="Digite código NCM (8 dígitos)..."
            fullWidth
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            InputProps={{ startAdornment: <InputAdornment position="start"><TableChart /></InputAdornment> }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="contained" onClick={handleSearch} disabled={loading} startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}>
              {loading ? 'Pesquisando...' : 'Buscar'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {errorGeneral && <Alert severity="error">{errorGeneral}</Alert>}
      {errorName && <Alert severity="error">Busca por Nome: {errorName}</Alert>}
      {errorEAN && <Alert severity="error">Consulta por EAN/GTIN: {errorEAN}</Alert>}
      {errorNCM && <Alert severity="error">Consulta por NCM: {errorNCM}</Alert>}

      {results && (
        <Stack spacing={2}>
          {results.byName && (
            <Card>
              <CardHeader>
                <CardTitle>Resultado por Nome</CardTitle>
                <CardDescription>
                  {`Encontrados ${results.byName.products?.length || 0} produtos para "${nameQuery}"`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2, alignItems: 'stretch' }}>
                  {results.byName.products?.map((p: any, idx: number) => (
                      <Card key={idx} className="flex flex-col h-full">
                        <img
                          src={p.thumbnail || 'https://via.placeholder.com/280x192'}
                          alt={p.description}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="text-lg font-semibold min-h-16 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.description}</h3>
                          <div className="mt-auto">
                              <p className="text-sm text-gray-600"><span className="font-bold">GTIN:</span> {p.gtin}</p>
                              {p.ncm && <p className="text-sm text-gray-600"><span className="font-bold">NCM:</span> {p.ncm.code}</p>}
                          </div>
                        </div>
                    </Card>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {results.byEAN && (
            <Card>
                <CardHeader>
                    <CardTitle>Resultado por EAN/GTIN</CardTitle>
                    <CardDescription>{results.byEAN.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Stack spacing={1}>
                        <div><Typography component="span" fontWeight="bold">GTIN:</Typography> {results.byEAN.gtin}</div>
                        {results.byEAN.ncm && <div><Typography component="span" fontWeight="bold">NCM:</Typography> {results.byEAN.ncm.code} - {results.byEAN.ncm.description}</div>}
                        {results.byEAN.gpc && <div><Typography component="span" fontWeight="bold">GPC:</Typography> {results.byEAN.gpc.code} - {results.byEAN.gpc.description}</div>}
                        {results.byEAN.cest && <div><Typography component="span" fontWeight="bold">CEST:</Typography> {results.byEAN.cest.code} - {results.byEAN.cest.description}</div>}
                        {results.byEAN.thumbnail && <img src={results.byEAN.thumbnail} alt={results.byEAN.description} style={{maxWidth: '150px', borderRadius: '8px', marginTop: '12px'}} />}
                    </Stack>
                </CardContent>
                 <CardFooter>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <Button
                            variant="outlined"
                            startIcon={<Copy size={16} />}
                            onClick={() => copyToClipboard(JSON.stringify(results.byEAN, null, 2))}
                        >
                            Copiar JSON
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<FileText size={16} />}
                            onClick={() => exportJson(results.byEAN, `ean-${cleanDigits(eanQuery)}.json`)}
                        >
                            Exportar JSON
                        </Button>
                    </Stack>
                </CardFooter>
            </Card>
          )}

          {results.byNCM && (
            <Card>
              <CardHeader>
                <CardTitle>Resultado por NCM</CardTitle>
                <CardDescription>
                  {(() => {
                    const info = extractNcmInfo(results.byNCM)
                    return info.code ? `NCM ${info.code} - ${info.description}` : 'Código NCM'
                  })()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const { total } = getNcmSummary(results.byNCM)
                  const info = extractNcmInfo(results.byNCM)
                  const produtos = extractProducts(results.byNCM)
                  return (
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {info.chapter && <Chip label={`Capítulo: ${info.chapter}`} size="small" />}
                        {info.position && <Chip label={`Posição: ${info.position}`} size="small" />}
                        {info.subposition && <Chip label={`Subposição: ${info.subposition}`} size="small" />}
                        {info.category && <Chip label={`Categoria: ${info.category}`} size="small" />}
                        <Chip label={`Total de itens: ${total}`} color="primary" variant="outlined" size="small" />
                      </Stack>

                      {Array.isArray(produtos) && produtos.length > 0 && (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Produto</TableHead>
                              <TableHead>Marca</TableHead>
                              <TableHead>GTINs</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {produtos.slice(0, 6).map((p: any, idx: number) => {
                              const title = p?.name || p?.description || p?.title || 'Produto'
                              const brand = p?.brand || p?.brands || p?.manufacturer || null
                              const gtins = getGtins(p)
                              return (
                                <TableRow key={idx}>
                                  <TableCell>{title}</TableCell>
                                  <TableCell>{brand}</TableCell>
                                  <TableCell>{gtins.join(', ')}</TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </Stack>
                  )
                })()}
              </CardContent>
              <CardFooter>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<Copy size={16} />}
                    onClick={() => copyToClipboard(JSON.stringify(results.byNCM, null, 2))}
                  >
                    Copiar JSON
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<FileText size={16} />}
                    onClick={() => exportJson(results.byNCM, `ncm-${cleanDigits(ncmQuery)}.json`)}
                  >
                    Exportar JSON
                  </Button>
                </Stack>
              </CardFooter>
            </Card>
          )}
        </Stack>
      )}
    </Stack>
  )
}