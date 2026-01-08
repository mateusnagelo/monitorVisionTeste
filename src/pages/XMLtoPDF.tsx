import { useState, useRef } from 'react';
import {
  Button,
  Container,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
} from '@mui/material';
import { convertXMLtoPDF } from '../services/conversion';
import { UploadFile, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { Buffer } from 'buffer';

interface FileStatus {
  status: 'pending' | 'converting' | 'success' | 'error';
  message: string;
}

export default function XMLtoPDF() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [conversionStatus, setConversionStatus] = useState<Record<string, FileStatus>>({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setSelectedFiles(newFiles);
      
      const initialStatus: Record<string, FileStatus> = {};
      newFiles.forEach(file => {
        initialStatus[file.name] = { status: 'pending', message: 'Pronto para converter' };
      });
      setConversionStatus(initialStatus);
    }
  };

  const handleSelectFilesClick = () => {
    fileInputRef.current?.click();
  };

  const handleConvert = async () => {
    setLoading(true);

    for (const file of selectedFiles) {
      setConversionStatus(prev => ({
        ...prev,
        [file.name]: { status: 'converting', message: 'Convertendo...' },
      }));

      try {
        const xmlContent = await file.text();
        const result = await convertXMLtoPDF(xmlContent);

        if (result.success && result.pdf) {
          const pdfBlob = new Blob([Buffer.from(result.pdf, 'base64')], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = pdfUrl;
          
          const originalName = file.name.replace(/\.[^/.]+$/, "");
          link.download = `${originalName}.pdf`;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pdfUrl);

          setConversionStatus(prev => ({
            ...prev,
            [file.name]: { status: 'success', message: 'PDF baixado com sucesso!' },
          }));
        } else {
          throw new Error(result.message || 'A resposta da API não continha um PDF.');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setConversionStatus(prev => ({
          ...prev,
          [file.name]: { status: 'error', message: `Falha: ${errorMessage}` },
        }));
        console.error(`Erro ao converter ${file.name}:`, err);
      }
    }

    setLoading(false);
  };

  const getStatusIcon = (status: FileStatus['status']) => {
    switch (status) {
      case 'converting':
        return <CircularProgress size={20} />;
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <UploadFile />;
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Converter XML para PDF
      </Typography>
      <Typography variant="body1" paragraph>
        Selecione um ou mais arquivos XML (NF-e ou CT-e) do seu computador para convertê-los em PDF.
      </Typography>
      
      <input
        type="file"
        multiple
        accept=".xml"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
        <Button
          variant="outlined"
          onClick={handleSelectFilesClick}
        >
          Selecionar Arquivos
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConvert}
          disabled={loading || selectedFiles.length === 0}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Convertendo...' : `Converter ${selectedFiles.length} Arquivo(s)`}
        </Button>
      </Box>

      {selectedFiles.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Arquivos Selecionados</Typography>
          <List>
            {selectedFiles.map((file) => (
              <ListItem key={file.name} divider>
                <ListItemIcon>
                  {getStatusIcon(conversionStatus[file.name]?.status)}
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={conversionStatus[file.name]?.message}
                  secondaryTypographyProps={{
                    color: conversionStatus[file.name]?.status === 'error' ? 'error' : 'textSecondary'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {Object.values(conversionStatus).some(s => s.status === 'error') && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Alguns arquivos não puderam ser convertidos. Verifique os detalhes na lista acima.
        </Alert>
      )}
    </Container>
  );
}
