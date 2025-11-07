import { Paper, Stack, Typography, Box, Button, Alert, CircularProgress, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails, TextField, Tabs, Tab } from '@mui/material';
import { Delete, Visibility, ExpandMore } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useCallback, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pdf } from '@react-pdf/renderer';
import DanfeReactPDF from '@/components/DanfeReactPDF';

const MAX_FILES = 100;

interface ConvertedFile {
  fileName: string;
  data: any;
  pdfBlob: Blob;
}

const generatePdf = async (nfeData: any) => {
  try {
    const blob = await pdf(<DanfeReactPDF data={nfeData} />).toBlob();
    return blob;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return null;
  }
};

export default function XMLConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const formatCurrency = (value: number) => {
    if (typeof value !== 'number') return '';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(',', '');
  };

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError(null);
    if (fileRejections.length > 0) {
      setError(`Limite de 100 arquivos excedido ou tipo de arquivo inválido. Apenas arquivos .xml são permitidos.`);
      return;
    }
    setFiles(prev => [...prev, ...acceptedFiles].slice(0, 100));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/xml': ['.xml'] },
    maxFiles: 100,
  });

  const handleRemoveFile = (fileToRemove: File) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

  const handleConvert = async () => {
    setIsConverting(true);
    setError(null);
    setConvertedFiles([]);
    const processedFiles: ConvertedFile[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const xmlString = await file.text();
        const response = await fetch('http://localhost:3001/api/process-xml', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/xml',
          },
          body: xmlString,
        });

        if (response.ok) {
          const nfeData = await response.json();
          const pdfBlob = await generatePdf(nfeData);
          if (pdfBlob) {
            processedFiles.push({ fileName: file.name, data: nfeData, pdfBlob });
          } else {
            errors.push(`Falha ao gerar o PDF para o arquivo: ${file.name}.`);
          }
        } else {
          const errorText = await response.text();
          errors.push(`Falha ao processar o arquivo: ${file.name}. ${errorText}`);
        }
      } catch (e: any) {
        errors.push(`Erro ao processar o arquivo ${file.name}: ${e.message}`);
        console.error("Error processing file:", file.name, e);
      }
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    setConvertedFiles(processedFiles);
    setIsConverting(false);
  };

  const handlePreview = (pdfBlob: Blob) => {
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    convertedFiles.forEach(file => {
      zip.file(`${file.fileName.replace('.xml', '.pdf')}`, file.pdfBlob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'documentos.zip');
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" className="gradient-text">Conversor de XML (NFe/CTe) para PDF</Typography>
      
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Sobre a Ferramenta</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Alert severity="info" style={{ width: '100%' }}>
            <Typography variant="h6">Funcionalidades do Conversor de XML para PDF</Typography>
            <List dense>
              <ListItem><ListItemText primary="Upload Flexível: Arraste e solte ou selecione até 100 arquivos XML." /></ListItem>
              <ListItem><ListItemText primary="Gerenciamento de Arquivos: Remova arquivos da lista antes de converter." /></ListItem>
              <ListItem><ListItemText primary="Conversão Rápida: Gere DANFEs em formato PDF com um único clique." /></ListItem>
              <ListItem><ListItemText primary="Visualização Detalhada: Visualize cada DANFE individualmente." /></ListItem>
              <ListItem><ListItemText primary="Download em Massa: Baixe todos os PDFs gerados em um arquivo ZIP." /></ListItem>
            </List>
          </Alert>
        </AccordionDetails>
      </Accordion>

      <Paper sx={{ p: 2 }}>
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed grey',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragActive ? 'action.hover' : 'transparent',
          }}
        >
          <input {...getInputProps()} />
          {
            isDragActive ?
              <Typography>Solte os arquivos aqui ...</Typography> :
              <Typography>Arraste e solte até 100 arquivos XML aqui, ou clique para selecionar.</Typography>
          }
        </Box>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {files.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Arquivos Selecionados ({files.length}/{MAX_FILES}):</Typography>
            <List dense>
              {files.map((file, i) => (
                <ListItem key={i} sx={{ py: 0 }} secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => removeFile(i)}>
                    <Delete />
                  </IconButton>
                }>
                  <ListItemText
                    primary={file.name}
                    primaryTypographyProps={{ sx: { fontSize: '0.875rem' } }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        <Button variant="contained" sx={{ mt: 2 }} disabled={files.length === 0 || isConverting} onClick={handleConvert}>
          {isConverting ? <CircularProgress size={24} /> : "Converter para PDF"}
        </Button>

        {convertedFiles.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Arquivos Convertidos:</Typography>
            <Button variant="outlined" sx={{ my: 1 }} onClick={handleDownloadAll}>
              Baixar Todos (ZIP)
            </Button>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ p: 1 }}>Tipo</TableCell>
                    <TableCell sx={{ p: 1, minWidth: 320 }}>Chave</TableCell>
                    <TableCell sx={{ p: 1 }}>Emissão</TableCell>
                    <TableCell align="center" colSpan={3} sx={{ p: 1 }}>EMITENTE</TableCell>
                    <TableCell align="center" colSpan={3} sx={{ p: 1 }}>DESTINATÁRIO</TableCell>
                    <TableCell sx={{ p: 1 }}>Número</TableCell>
                    <TableCell sx={{ p: 1 }}>Valor</TableCell>
                    <TableCell sx={{ p: 1 }}>Ações</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ p: 1 }}></TableCell>
                    <TableCell sx={{ p: 1 }}></TableCell>
                    <TableCell sx={{ p: 1 }}></TableCell>
                    <TableCell sx={{ p: 1 }}>CNPJ/CPF</TableCell>
                    <TableCell sx={{ p: 1 }}>UF</TableCell>
                    <TableCell sx={{ p: 1 }}>Nome</TableCell>
                    <TableCell sx={{ p: 1 }}>CNPJ/CPF</TableCell>
                    <TableCell sx={{ p: 1 }}>UF</TableCell>
                    <TableCell sx={{ p: 1 }}>Nome</TableCell>
                    <TableCell sx={{ p: 1 }}></TableCell>
                    <TableCell sx={{ p: 1 }}></TableCell>
                    <TableCell sx={{ p: 1 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {convertedFiles.map((file) => (
                    <TableRow
                      key={file.data.chaveDeAcesso}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row" sx={{ p: 1 }}>
                        NFe
                      </TableCell>
                      <TableCell sx={{ p: 1 }}>{file.data.chaveDeAcesso}</TableCell>
                      <TableCell sx={{ p: 1 }}>{formatDate(file.data.ide.dhEmi)}</TableCell>
                      <TableCell sx={{ p: 1 }}>{file.data.emit.CNPJ}</TableCell>
                      <TableCell sx={{ p: 1 }}>{file.data.emit.enderEmit.UF}</TableCell>
                      <TableCell sx={{ p: 1 }}>{file.data.emit.xNome}</TableCell>
                      <TableCell sx={{ p: 1 }}>{file.data.dest.CNPJ}</TableCell>
                      <TableCell sx={{ p: 1 }}>{file.data.dest.enderDest.UF}</TableCell>
                      <TableCell sx={{ p: 1 }}>{file.data.dest.xNome}</TableCell>
                      <TableCell sx={{ p: 1 }}>{file.data.ide.nNF}</TableCell>
                      <TableCell sx={{ p: 1 }}>{formatCurrency(file.data.total.ICMSTot.vNF)}</TableCell>
                      <TableCell sx={{ p: 1 }}>
                        <IconButton edge="end" aria-label="preview" onClick={() => handlePreview(file.pdfBlob)}>
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>
    </Stack>
  );
}