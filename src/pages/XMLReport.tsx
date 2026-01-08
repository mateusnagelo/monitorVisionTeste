import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Pagination,
} from '@mui/material'
import { useDropzone } from 'react-dropzone'
import { UploadFile, Delete } from '@mui/icons-material'
import { useState, useCallback, useEffect } from 'react'
import ReportTable from '../components/ReportTable'
import { exportToExcel } from '../utils/exportToExcel'
import ColumnSelector from '../components/ColumnSelector'
import NfeDetailModal from '../components/NfeDetailModal'
import { Nfe } from '../types/Nfe'
import { parseXML } from '../services/xmlParser'

interface ReportData {
  key: string;
  emissionDate: string;
  emitterCnpjCpf: string;
  emitter: string;
  emitterStateRegistration: string;
  receiverCnpjCpf: string;
  receiver: string;
  receiverStateRegistration: string;
  number: string;
  value: number;
  // Campos de produto achatados
  productCode?: string;
  productName?: string;
  productQuantity?: number;
  productUnitValue?: number;
  // Campos de ICMS (exemplo)
  icmsOrig?: string;
  icmsCST?: string;
  icmsModBC?: string;
  icmsVBC?: number;
  icmsPICMS?: number;
  icmsVICMS?: number;
}

export default function XMLReport() {
  const [files, setFiles] = useState<File[]>([]);
  const [fullReportData, setFullReportData] = useState<ReportData[]>([]);
  const [reportData, setReportData] = useState<Partial<ReportData>[]>([]);
  const [model, setModel] = useState('NFe Emitente/Destinatário');
  const [resultsPerPage, setResultsPerPage] = useState(100);
  const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [accessKeys, setAccessKeys] = useState('');
  const [selectedNfe, setSelectedNfe] = useState<Nfe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nfeMap, setNfeMap] = useState<Map<string, Nfe>>(new Map());

  const modelConfig: { [key: string]: string[] } = {
    'NFe Emitente/Destinatário': ['key', 'emissionDate', 'emitterCnpjCpf', 'emitterStateRegistration', 'emitter', 'receiverCnpjCpf', 'receiverStateRegistration', 'receiver', 'number', 'value'],
    'NFe Emitente/Destinatário/Produtos': ['key', 'emissionDate', 'emitter', 'receiver', 'number', 'value', 'productCode', 'productName', 'productQuantity', 'productUnitValue'],
    'NFe Emitente/Destinatário/Produtos (ICMS)': ['key', 'number', 'productCode', 'productName', 'icmsOrig', 'icmsCST', 'icmsModBC', 'icmsVBC', 'icmsPICMS', 'icmsVICMS'],
    'NFe Modelo Sem Produtos': ['key', 'emissionDate', 'emitterCnpjCpf', 'emitterStateRegistration', 'emitter', 'receiverCnpjCpf', 'receiverStateRegistration', 'receiver', 'number', 'value'],
    'NFe Modelo Com Produtos': ['key', 'emissionDate', 'emitter', 'receiver', 'number', 'value', 'productCode', 'productName', 'productQuantity', 'productUnitValue'],
    'CTe Modelo Simples': ['key', 'emissionDate', 'emitterCnpjCpf', 'emitterStateRegistration', 'emitter', 'receiverCnpjCpf', 'receiverStateRegistration', 'receiver', 'number', 'value'],
    'CFe Modelo Sem Produtos (Teste)': ['key', 'emissionDate', 'emitterCnpjCpf', 'emitterStateRegistration', 'emitter', 'receiverCnpjCpf', 'receiverStateRegistration', 'receiver', 'number', 'value'],
    'CFe Modelo Com Produtos (Teste)': ['key', 'emissionDate', 'emitter', 'receiver', 'number', 'value', 'productCode', 'productName', 'productQuantity', 'productUnitValue'],
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles].slice(0, 100))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/xml': ['.xml'] },
    maxSize: 10 * 1024 * 1024, // 10 MB
  })

  const removeFile = (file: File) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
  };

  const handleProcessXMLs = useCallback(async () => {
    try {
      const newNfeMap = new Map<string, Nfe>();
      const parsedDataPromises = files.map(async (file) => {
        try {
          const xmlText = await file.text();

          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, "application/xml");

          const chNFe = xmlDoc.getElementsByTagName('chNFe')[0]?.textContent || 
                       xmlDoc.getElementsByTagName('infNFe')[0]?.getAttribute('Id')?.replace('NFe', '');

          if (!chNFe) {
            const errorMessage = `Não foi possível encontrar a chave de acesso no arquivo: ${file.name}.`;
            console.error(errorMessage);
            alert(errorMessage);
            return null;
          }

          const parsed = parseXML(xmlText) as any;
          if (!parsed || !parsed.ide) {
            const errorMessage = `XML não suportado ou inválido: ${file.name}.`;
            console.error(errorMessage);
            alert(errorMessage);
            return null;
          }

          const nfeData = parsed as Nfe;
          const key = (nfeData.chave || chNFe || '').trim();
          const normalized: Nfe = {
            ...nfeData,
            chave: key,
            protNFe: nfeData.protNFe ?? { infProt: { chNFe: key } },
          };
          if (key) {
            newNfeMap.set(key, normalized);
          }
          return normalized;

        } catch (error) {
          const errorMessage = `Erro ao processar o arquivo ${file.name}.`;
          console.error(errorMessage, error);
          alert(`${errorMessage} Verifique o console.`);
          return null;
        }
      });

      const parsedData = (await Promise.all(parsedDataPromises)).filter((nfe): nfe is Nfe => Boolean(nfe));

      setNfeMap(newNfeMap);

      const flattenedData: ReportData[] = parsedData.flatMap(nfe => {
        const baseData = {
          key: nfe.chave || '',
          emissionDate: nfe.ide?.dhEmi || '',
          emitterCnpjCpf: nfe.emit?.CNPJ || nfe.emit?.CPF || '',
          emitter: nfe.emit?.xNome || '',
          emitterStateRegistration: nfe.emit?.IE || '',
          receiverCnpjCpf: nfe.dest?.CNPJ || nfe.dest?.CPF || '',
          receiver: nfe.dest?.xNome || '',
          receiverStateRegistration: nfe.dest?.IE || '',
          number: nfe.ide?.nNF || '',
          value: nfe.total?.ICMSTot?.vNF ?? 0,
        };

        if (nfe.det && nfe.det.length > 0) {
          return nfe.det.map((product: any) => ({
            ...baseData,
            productCode: product.prod?.cProd,
            productName: product.prod?.xProd,
            productQuantity: product.prod?.qCom,
            productUnitValue: product.prod?.vUnCom,
            icmsOrig: product.imposto?.ICMS?.CSOSN || product.imposto?.ICMS?.CST,
            icmsCST: product.imposto?.ICMS?.CST || product.imposto?.ICMS?.CSOSN,
            icmsModBC: product.imposto?.ICMS?.modBC,
            icmsVBC: product.imposto?.ICMS?.vBC,
            icmsPICMS: product.imposto?.ICMS?.pICMS,
            icmsVICMS: product.imposto?.ICMS?.vICMS,
          }));
        } else {
          return [baseData];
        }
      });

      setFullReportData(flattenedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Erro ao processar arquivos XML:", error);
      alert("Ocorreu um erro ao processar os arquivos XML. Verifique o console para mais detalhes.");
    }
  }, [files]);

  useEffect(() => {
    if (fullReportData.length === 0) {
        setReportData([]);
        setAvailableColumns([]);
        setSelectedColumns([]);
        return;
    };

    const columns = modelConfig[model] || Object.keys(fullReportData[0] || {});
    let dataForTable = fullReportData;

    // Desduplicar se o modelo não for de produtos
    if (!model.includes('Produtos')) {
      const uniqueData = new Map<string, ReportData>();
      fullReportData.forEach(item => {
        if (item.key && !uniqueData.has(item.key)) {
          uniqueData.set(item.key, item);
        }
      });
      dataForTable = Array.from(uniqueData.values());
    }
    
    setReportData(dataForTable);
    setAvailableColumns(columns);
    setSelectedColumns(columns);
  }, [fullReportData, model]);

  const handleExport = () => {
    const dataToExport = reportData.map(row => {
      const newRow: { [key: string]: any } = {};
      selectedColumns.forEach(col => {
        newRow[col] = row[col as keyof ReportData];
      });
      return newRow;
    });
    exportToExcel(dataToExport, 'relatorio_nfe');
  };

  const handleColumnChange = (newColumns: string[]) => {
    setSelectedColumns(newColumns);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const handleRowClick = (row: any) => {
    const key = row?.key as string | undefined;
    if (!key) return;
    const nfe = nfeMap.get(key);
    if (nfe) {
      setSelectedNfe(nfe);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNfe(null);
  };

  const filteredData = reportData.filter(row => {
    if (!searchTerm) return true;
    return Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const paginatedData = filteredData.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Relatório de XMLs
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <div
              {...getRootProps()}
              style={{
                border: '2px dashed #ccc',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragActive ? '#f0f0f0' : 'transparent',
              }}
            >
              <input {...getInputProps()} />
              <UploadFile sx={{ fontSize: 40, mb: 1 }} />
              <Typography>Arraste e solte até 100 arquivos XML aqui, ou clique para selecionar.</Typography>
            </div>
          </Grid>
          <Grid item xs={12}>
            <List dense>
              {files.map((file, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => removeFile(file)}>
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemText primary={file.name} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Modelo de Relatório</InputLabel>
              <Select value={model} label="Modelo de Relatório" onChange={(e) => setModel(e.target.value)}>
                {Object.keys(modelConfig).map(key => (
                  <MenuItem key={key} value={key}>{key}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Resultados por Página</InputLabel>
              <Select value={resultsPerPage} label="Resultados por Página" onChange={(e) => setResultsPerPage(Number(e.target.value))}>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
                <MenuItem value={500}>500</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleProcessXMLs} disabled={files.length === 0}>
              Processar XMLs
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {reportData.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <TextField
              label="Pesquisar na tabela"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Box>
              <Button variant="outlined" sx={{ mr: 1 }} onClick={() => setColumnSelectorOpen(true)}>
                Selecionar Colunas
              </Button>
              <Button variant="contained" onClick={handleExport}>
                Exportar para Excel
              </Button>
            </Box>
          </Box>
          <ReportTable data={paginatedData} model={model} selectedColumns={selectedColumns} onRowClick={handleRowClick} />
          <Pagination
            count={Math.ceil(filteredData.length / resultsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
          />
        </Paper>
      )}
      <ColumnSelector
        open={columnSelectorOpen}
        onClose={() => setColumnSelectorOpen(false)}
        columns={availableColumns}
        selectedColumns={selectedColumns}
        onApply={handleColumnChange}
      />
      <NfeDetailModal
        open={isModalOpen}
        onClose={handleCloseModal}
        nfe={selectedNfe}
      />
    </Box>
  );
}
