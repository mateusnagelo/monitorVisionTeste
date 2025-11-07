import React, { useState } from 'react';
import { Nfe } from '../types/Nfe';
import { Modal, Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab, Grid, Card, CardContent, IconButton, Collapse } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface NfeDetailModalProps {
  open: boolean;
  onClose: () => void;
  nfe: Nfe | null;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '1000px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
  maxHeight: '95vh',
  display: 'flex',
  flexDirection: 'column',
};

const NfeDetailModal: React.FC<NfeDetailModalProps> = ({ open, onClose, nfe }) => {
  const [tabIndex, setTabIndex] = useState(0);

  if (!nfe) {
    return null;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const formatCurrency = (value: string | number | undefined) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === undefined || isNaN(numValue)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
  };

  const ProductRow: React.FC<{ item: any }> = ({ item }) => {
    const [open, setOpen] = useState(false);

    return (
      <React.Fragment>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} hover>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
            {item.prod.xProd}
          </TableCell>
          <TableCell align="right">{item.prod.qCom}</TableCell>
          <TableCell align="right">{formatCurrency(item.prod.vUnCom)}</TableCell>
          <TableCell align="right">{formatCurrency(item.prod.vProd)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Impostos do Produto
                </Typography>
                <Grid container spacing={2}>
                  {item.imposto && item.imposto.ICMS && (
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1">ICMS</Typography>
                          <Typography><strong>CST:</strong> {item.imposto.ICMS[Object.keys(item.imposto.ICMS)[0]]?.CST}</Typography>
                          <Typography><strong>Origem:</strong> {item.imposto.ICMS[Object.keys(item.imposto.ICMS)[0]]?.orig}</Typography>
                          <Typography><strong>Modalidade BC:</strong> {item.imposto.ICMS[Object.keys(item.imposto.ICMS)[0]]?.modBC}</Typography>
                          <Typography><strong>Alíquota:</strong> {item.imposto.ICMS[Object.keys(item.imposto.ICMS)[0]]?.pICMS}%</Typography>
                          <Typography><strong>Base de Cálculo:</strong> {formatCurrency(item.imposto.ICMS[Object.keys(item.imposto.ICMS)[0]]?.vBC)}</Typography>
                          <Typography><strong>Valor:</strong> {formatCurrency(item.imposto.ICMS[Object.keys(item.imposto.ICMS)[0]]?.vICMS)}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  {item.imposto && item.imposto.PIS && (
                     <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1">PIS</Typography>
                           <Typography><strong>CST:</strong> {item.imposto.PIS.CST}</Typography>
                           <Typography><strong>Base de Cálculo:</strong> {formatCurrency(item.imposto.PIS.vBC)}</Typography>
                           <Typography><strong>Alíquota:</strong> {item.imposto.PIS.pPIS}%</Typography>
                           <Typography><strong>Valor:</strong> {formatCurrency(item.imposto.PIS.vPIS)}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  {item.imposto && item.imposto.COFINS && (
                     <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1">COFINS</Typography>
                           <Typography><strong>CST:</strong> {item.imposto.COFINS.CST}</Typography>
                           <Typography><strong>Base de Cálculo:</strong> {formatCurrency(item.imposto.COFINS.vBC)}</Typography>
                           <Typography><strong>Alíquota:</strong> {item.imposto.COFINS.pCOFINS}%</Typography>
                           <Typography><strong>Valor:</strong> {formatCurrency(item.imposto.COFINS.vCOFINS)}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="nfe-detail-modal-title"
      aria-describedby="nfe-detail-modal-description"
    >
      <Box sx={style}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography id="nfe-detail-modal-title" variant="h5" component="h2">
            Detalhes da NFe: {nfe.number}
          </Typography>
          <Button onClick={onClose} variant="outlined" color="secondary">Fechar</Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label="NFe details tabs">
            <Tab label="Informações Gerais" />
            <Tab label="Produtos" />
            <Tab label="Totais de Impostos" />
          </Tabs>
        </Box>

        <Box sx={{ overflowY: 'auto', flexGrow: 1, p: 1, mt: 2 }}>
          {tabIndex === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Chave de Acesso</Typography>
                    <Typography color="text.secondary" sx={{ wordBreak: 'break-all' }}>{nfe.key}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Emitente</Typography>
                    <Typography><strong>Nome:</strong> {nfe.emitter.xNome}</Typography>
                    <Typography><strong>CNPJ/CPF:</strong> {nfe.emitter.CNPJ}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Destinatário</Typography>
                    <Typography><strong>Nome:</strong> {nfe.receiver.xNome}</Typography>
                    <Typography><strong>CNPJ/CPF:</strong> {nfe.receiver.CNPJ}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Data de Emissão</Typography>
                    <Typography>{nfe.emissionDate ? new Date(nfe.emissionDate).toLocaleString() : 'N/A'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Valor Total da Nota</Typography>
                    <Typography variant="h5" color="primary">{formatCurrency(nfe.value)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {tabIndex === 1 && (
            <TableContainer component={Paper} sx={{ maxHeight: 'calc(95vh - 250px)' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Produto</TableCell>
                    <TableCell align="right">Qtd.</TableCell>
                    <TableCell align="right">Valor Unit.</TableCell>
                    <TableCell align="right">Valor Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {nfe.produtos && nfe.produtos.length > 0 ? (
                    nfe.produtos.map((produto: any, index: number) => (
                      <ProductRow key={index} item={produto} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">Nenhum produto encontrado.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tabIndex === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Totais de Impostos</Typography>
                {nfe.total?.ICMSTot && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography><strong>Base de Cálculo ICMS:</strong> {formatCurrency(nfe.total.ICMSTot.vBC)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography><strong>Valor do ICMS:</strong> {formatCurrency(nfe.total.ICMSTot.vICMS)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography><strong>ICMS Desonerado:</strong> {formatCurrency(nfe.total.ICMSTot.vICMSDeson)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography><strong>Fundo de Combate à Pobreza (FCP):</strong> {formatCurrency(nfe.total.ICMSTot.vFCP)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography><strong>Base de Cálculo ICMS ST:</strong> {formatCurrency(nfe.total.ICMSTot.vBCST)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography><strong>Valor do ICMS ST:</strong> {formatCurrency(nfe.total.ICMSTot.vST)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography><strong>FCP ST:</strong> {formatCurrency(nfe.total.ICMSTot.vFCPST)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography><strong>FCP ST Retido:</strong> {formatCurrency(nfe.total.ICMSTot.vFCPSTRet)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography><strong>Valor Total dos Produtos:</strong> {formatCurrency(nfe.total.ICMSTot.vProd)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography><strong>Valor do Frete:</strong> {formatCurrency(nfe.total.ICMSTot.vFrete)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography><strong>Valor do Seguro:</strong> {formatCurrency(nfe.total.ICMSTot.vSeg)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography><strong>Valor do Desconto:</strong> {formatCurrency(nfe.total.ICMSTot.vDesc)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography><strong>Valor do II:</strong> {formatCurrency(nfe.total.ICMSTot.vII)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography><strong>Valor do IPI:</strong> {formatCurrency(nfe.total.ICMSTot.vIPI)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography><strong>IPI Devolvido:</strong> {formatCurrency(nfe.total.ICMSTot.vIPIDevol)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography><strong>Valor do PIS:</strong> {formatCurrency(nfe.total.ICMSTot.vPIS)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography><strong>Valor da COFINS:</strong> {formatCurrency(nfe.total.ICMSTot.vCOFINS)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography><strong>Outras Despesas:</strong> {formatCurrency(nfe.total.ICMSTot.vOutro)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography><strong>Valor Total da Nota:</strong> {formatCurrency(nfe.total.ICMSTot.vNF)}</Typography>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default NfeDetailModal;