import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TablePagination,
  CircularProgress,
} from '@mui/material';
import { Visibility, PictureAsPdf, Code } from '@mui/icons-material';
import { listNFes, NFe } from '../services/nfe';
import axios from 'axios';

const API_KEY = 'f5c6131e-2961-4b1d-a62f-1130445b03ea';

export default function MinhasNFs() {
  const [rows, setRows] = useState<NFe[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    const nfes = listNFes();
    setRows(nfes.reverse()); // Show most recent first
  }, []);

  const handleAction = async (chave: string, action: 'danfe' | 'pdf' | 'xml') => {
    setLoadingAction(`${action}-${chave}`);
    try {
      if (action === 'danfe') {
        const response = await axios.get(`/api/v2/fd/get/da/${chave}`, { headers: { 'API-KEY': API_KEY } });
        const pdfWindow = window.open('');
        if (pdfWindow) {
          pdfWindow.document.write(`<iframe width='100%' height='100%' src='data:application/pdf;base64,${response.data.data}'></iframe>`);
          pdfWindow.document.title = `Danfe ${chave}`;
        }
      } else if (action === 'pdf') {
        const response = await axios.get(`/api/v2/fd/get/da/${chave}`, { headers: { 'API-KEY': API_KEY } });
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${response.data.data}`;
        link.download = `${chave}.pdf`;
        link.click();
      } else if (action === 'xml') {
        const response = await axios.get(`/api/v2/fd/get/xml/${chave}`, { headers: { 'API-KEY': API_KEY } });
        const blob = new Blob([response.data.data], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${chave}.xml`);
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error(`Error during ${action} action:`, error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Minhas NFs
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>STATUS</TableCell>
              <TableCell>AÇÕES</TableCell>
              <TableCell>CHAVE ACESSO</TableCell>
              <TableCell>EMITENTE</TableCell>
              <TableCell>DOC. EMIT.</TableCell>
              <TableCell align="right">VALOR</TableCell>
              <TableCell>EMISSÃO</TableCell>
              <TableCell>NUMERO</TableCell>
              <TableCell>DESTINATÁRIO</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : rows
            ).map((row) => (
              <TableRow key={row.chaveAcesso}>
                <TableCell>
                  <Chip label={row.status} color="success" size="small" />
                </TableCell>
                <TableCell>
                  <IconButton size="small" color="primary" onClick={() => handleAction(row.chaveAcesso, 'danfe')} disabled={loadingAction === `danfe-${row.chaveAcesso}`}>
                    {loadingAction === `danfe-${row.chaveAcesso}` ? <CircularProgress size={20} /> : <Visibility />}
                  </IconButton>
                  <IconButton size="small" color="primary" onClick={() => handleAction(row.chaveAcesso, 'pdf')} disabled={loadingAction === `pdf-${row.chaveAcesso}`}>
                    {loadingAction === `pdf-${row.chaveAcesso}` ? <CircularProgress size={20} /> : <PictureAsPdf />}
                  </IconButton>
                  <IconButton size="small" color="warning" onClick={() => handleAction(row.chaveAcesso, 'xml')} disabled={loadingAction === `xml-${row.chaveAcesso}`}>
                    {loadingAction === `xml-${row.chaveAcesso}` ? <CircularProgress size={20} /> : <Code />}
                  </IconButton>
                </TableCell>
                <TableCell>{row.chaveAcesso}</TableCell>
                <TableCell>{row.emitente}</TableCell>
                <TableCell>{row.docEmit}</TableCell>
                <TableCell align="right">{row.valor}</TableCell>
                <TableCell>{new Date(row.emissao).toLocaleDateString()}</TableCell>
                <TableCell>{row.numero}</TableCell>
                <TableCell>{row.destinatario}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Linhas por página:"
      />
    </Box>
  );
}
