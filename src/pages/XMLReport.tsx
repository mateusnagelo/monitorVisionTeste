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
import { Nfe } from '../types/Nfe';

interface ReportData {
  key: string;
  emissionDate: string;
  emitterCnpjCpf: string;
  emitter: string;
  receiverCnpjCpf: string;
  receiver: string;
  number: string;
  value: string;
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
    'NFe Emitente/Destinatário': ['key', 'emissionDate', 'emitterCnpjCpf', 'emitter', 'receiverCnpjCpf', 'receiver', 'number', 'value'],
    'NFe Emitente/Destinatário/Produtos': ['key', 'emissionDate', 'emitter', 'receiver', 'number', 'value', 'productCode', 'productName', 'productQuantity', 'productUnitValue'],
    'NFe Emitente/Destinatário/Produtos (ICMS)': ['key', 'number', 'productCode', 'productName', 'icmsOrig', 'icmsCST', 'icmsModBC', 'icmsVBC', 'icmsPICMS', 'icmsVICMS'],
    'NFe Modelo Sem Produtos': ['key', 'emissionDate', 'emitterCnpjCpf', 'emitter', 'receiverCnpjCpf', 'receiver', 'number', 'value'],
    'NFe Modelo Com Produtos': ['key', 'emissionDate', 'emitter', 'receiver', 'number', 'value', 'productCode', 'productName', 'productQuantity', 'productUnitValue'],
    'CTe Modelo Simples': ['key', 'emissionDate', 'emitterCnpjCpf', 'emitter', 'receiverCnpjCpf', 'receiver', 'number', 'value'],
    'CFe Modelo Sem Produtos (Teste)': ['key', 'emissionDate', 'emitterCnpjCpf', 'emitter', 'receiverCnpjCpf', 'receiver', 'number', 'value'],
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
          const response = await fetch('http://localhost:3001/api/process-xml', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/xml',
            },
            body: xmlText,
          });

          if (!response.ok) {
            const errorBody = await response.text();
            const errorMessage = `Falha ao processar o arquivo: ${file.name}. ${errorBody}`;
            console.error(errorMessage);
            alert(errorMessage);
            return null;
          }

          const nfeData = await response.json();
          const key = nfeData.chaveDeAcesso;
          if (key) {
            newNfeMap.set(key, nfeData as Nfe);
          }
          return nfeData;

        } catch (error) {
          const errorMessage = `Erro ao processar o arquivo ${file.name}.`;
          console.error(errorMessage, error);
          alert(`${errorMessage} Verifique o console.`);
          return null;
        }
      });

      const parsedData = (await Promise.all(parsedDataPromises)).filter(Boolean);

      setNfeMap(newNfeMap);

      const flattenedData: ReportData[] = parsedData.flatMap(nfeData => {
        const baseData = {
          key: nfeData.chaveDeAcesso,
          emissionDate: nfeData.ide?.dhEmi,
          emitterCnpjCpf: nfeData.emit?.CNPJ,
          emitter: nfeData.emit?.xNome,
          receiverCnpjCpf: nfeData.dest?.CNPJ,
          receiver: nfeData.dest?.xNome,
          number: nfeData.ide?.nNF,
          value: nfeData.total?.ICMSTot?.vNF,
        };

        if (nfeData.det && nfeData.det.length > 0) {
          return nfeData.det.map((item: any) => ({
            ...baseData,
            productCode: item.prod?.cProd,
            productName: item.prod?.xProd,
            productQuantity: item.prod?.qCom,
            productUnitValue: item.prod?.vUnCom,
            icmsOrig: item.imposto?.ICMS?.CSOSN || item.imposto?.ICMS?.CST,
            icmsCST: item.imposto?.ICMS?.CST || item.imposto?.ICMS?.CSOSN,
            icmsModBC: item.imposto?.ICMS?.modBC,
            icmsVBC: item.imposto?.ICMS?.vBC,
            icmsPICMS: item.imposto?.ICMS?.pICMS,
            icmsVICMS: item.imposto?.ICMS?.vICMS,
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
        if (!uniqueData.has(item.key)) {
          uniqueData.set(item.key, item);
        }
      });
      dataForTable = Array.from(uniqueData.values());
    }
    
    setReportData(dataForTable);
    setAvailableColumns(columns);
    setSelectedColumns(columns);
    setCurrentPage(1);
  }, [model, fullReportData]);

  const handleRowClick = (row: ReportData) => {
    const foundNfe = nfeMap.get(row.key);
    if (foundNfe) {
      setSelectedNfe(foundNfe);
      setIsModalOpen(true);
    } else {
      console.error("NFe não encontrada no mapa para a chave:", row.key);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNfe(null);
  };

  const handleExport = () => {
    const dataToExport = reportData.map(row => {
      const newRow: { [key: string]: any } = {};
      selectedColumns.forEach(col => {
        newRow[col] = row[col as keyof typeof row];
      });
      return newRow;
    });
    exportToExcel(dataToExport, 'relatorio_nfe', 'Relatório NFe');
  };

  const handleProcessAccessKeys = async () => {
    const keys = accessKeys.split(/\n|\s/)
      .map(key => key.trim())
      .filter(key => key.length === 44 && /^[0-9]+$/.test(key));

    if (keys.length === 0) {
      alert('Nenhuma chave de acesso válida encontrada.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/nfe-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessKeys: keys }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const flattenedData: ReportData[] = data.flatMap((nfeData: any) => {
        if (!nfeData) return [];

        const baseData = {
          key: nfeData.protNFe?.infProt?.chNFe,
          emissionDate: nfeData.ide?.dhEmi,
          emitterCnpjCpf: nfeData.emit?.CNPJ || nfeData.emit?.CPF,
          emitter: nfeData.emit?.xNome,
          receiverCnpjCpf: nfeData.dest?.CNPJ || nfeData.dest?.CPF,
          receiver: nfeData.dest?.xNome,
          number: nfeData.ide?.nNF,
          value: nfeData.total?.ICMSTot?.vNF,
        };

        if (nfeData.det && nfeData.det.length > 0) {
          return nfeData.det.map((item: any) => ({
            ...baseData,
            productCode: item.prod?.cProd,
            productName: item.prod?.xProd,
            productQuantity: item.prod?.qCom,
            productUnitValue: item.prod?.vUnCom,
            icmsOrig: item.imposto?.ICMS?.ICMS00?.orig || item.imposto?.ICMS?.ICMS10?.orig || item.imposto?.ICMS?.ICMS20?.orig,
            icmsCST: item.imposto?.ICMS?.ICMS00?.CST || item.imposto?.ICMS?.ICMS10?.CST || item.imposto?.ICMS?.ICMS20?.CST,
            icmsModBC: item.imposto?.ICMS?.ICMS00?.modBC || item.imposto?.ICMS?.ICMS10?.modBC || item.imposto?.ICMS?.ICMS20?.modBC,
            icmsVBC: item.imposto?.ICMS?.ICMS00?.vBC || item.imposto?.ICMS?.ICMS10?.vBC || item.imposto?.ICMS?.ICMS20?.vBC,
            icmsPICMS: item.imposto?.ICMS?.ICMS00?.pICMS || item.imposto?.ICMS?.ICMS10?.pICMS || item.imposto?.ICMS?.ICMS20?.pICMS,
            icmsVICMS: item.imposto?.ICMS?.ICMS00?.vICMS || item.imposto?.ICMS?.ICMS10?.vICMS || item.imposto?.ICMS?.ICMS20?.vICMS,
          }));
        } else {
          return baseData;
        }
      });

      setFullReportData(flattenedData);
      setCurrentPage(1);

    } catch (error) {
      console.error("Erro ao processar chaves de acesso:", error);
      alert('Falha ao buscar dados da NFe. Verifique o console para mais detalhes.');
    }
  };

  const handleExportExcel = () => {
    const headerMap: { [key: string]: string } = {
      key: 'Chave',
      emissionDate: 'Emissão',
      emitterCnpjCpf: 'Emitente CNPJ/CPF',
      emitter: 'Emitente',
      receiverCnpjCpf: 'Destinatário CNPJ/CPF',
      receiver: 'Destinatário',
      number: 'Número',
      value: 'Valor',
      productCode: 'Cód. Produto',
      productName: 'Produto',
      productQuantity: 'Qtd.',
      productUnitValue: 'Vl. Unit.',
      icmsOrig: 'Origem ICMS',
      icmsCST: 'CST ICMS',
      icmsModBC: 'Mod. BC ICMS',
      icmsVBC: 'VBC ICMS',
      icmsPICMS: 'Alíq. ICMS',
      icmsVICMS: 'Valor ICMS',
    };

    const dataToExport = filteredData.map(item => {
      const row: { [key: string]: any } = {};
      selectedColumns.forEach(col => {
        const header = headerMap[col] || col;
        row[header] = item[col as keyof ReportData] ?? '';
      });
      return row;
    });

    exportToExcel(dataToExport, `relatorio_${model.replace(/\s|\//g, '_')}`);
  };

  const filteredData = reportData.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const paginatedData = filteredData.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Relatório de XMLs
      </Typography>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item>
          <Button variant="contained" color="success">Customizar Modelo</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="success">Importar Modelo</Button>
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
                <InputLabel>Modelo</InputLabel>
                <Select value={model} label="Modelo" onChange={(e) => setModel(e.target.value)}>
                    {Object.keys(modelConfig).map(modelName => (
                      <MenuItem key={modelName} value={modelName}>{modelName}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={() => setColumnSelectorOpen(true)}>Colunas</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={handleExportExcel}>Exportar Excel</Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
             <TextField fullWidth label="Pesquisar" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
         </Grid>
       </Grid>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item>
            <FormControl size="small">
                <Select value={resultsPerPage} onChange={(e) => setResultsPerPage(e.target.value as number)}>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                </Select>
            </FormControl>
        </Grid>
        <Grid item>
            <Typography variant="body2">resultados por página</Typography>
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Colar Chaves de Acesso (uma por linha)"
            multiline
            rows={4}
            value={accessKeys}
            onChange={(e) => setAccessKeys(e.target.value)}
            variant="outlined"
          />
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={handleProcessAccessKeys}>
            Processar Chaves
          </Button>
        </Grid>
      </Grid>

      <Paper
        {
...getRootProps()
        }
        sx={{
          border: `2px dashed ${isDragActive ? '#1976d2' : '#cccccc'}`,
          padding: 4,
          textAlign: 'center',
          cursor: 'pointer',
          mb: 3,
        }}
      >
        <input {...getInputProps()} />
        <UploadFile sx={{ fontSize: 48, color: '#cccccc' }} />
        <Typography>
          Arraste e solte até 100 arquivos XML aqui, ou clique para selecionar
        </Typography>
      </Paper>
      <List>
        {files.map((file, i) => (
          <ListItem
            key={i}
            secondaryAction={
              <IconButton edge="end" onClick={() => removeFile(file)}>
                <Delete />
              </IconButton>
            }
          >
            <ListItemText primary={file.name} />
          </ListItem>
        ))}</List>

      {files.length > 0 && (
        <Box sx={{ my: 2 }}>
          <Button variant="contained" onClick={handleProcessXMLs}>
            Processar XMLs
          </Button>
        </Box>
      )}

      {reportData.length > 0 && (
        <>
          <ReportTable 
            data={paginatedData}
            model={model} 
            selectedColumns={selectedColumns} 
            onRowClick={handleRowClick}
          />
          <Pagination 
            count={Math.ceil(filteredData.length / resultsPerPage)}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
          />
        </>
      )}

      <ColumnSelector
        open={columnSelectorOpen}
        columns={availableColumns}
        selectedColumns={selectedColumns}
        onClose={() => setColumnSelectorOpen(false)}
        onApply={setSelectedColumns}
      />

      <NfeDetailModal
        nfe={selectedNfe}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </Box>
  );
}