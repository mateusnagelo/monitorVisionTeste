import { useEffect, useMemo, useState } from 'react';
import { Box, Grid, LinearProgress, Stack, Typography, Button, Card, CardContent, CardActions, CardHeader } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import BugReportIcon from '@mui/icons-material/BugReport';
import FactCheckIcon from '@mui/icons-material/FactCheck';

export default function Dashboard() {
  const navigate = useNavigate();
  const [downloads, setDownloads] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [validations, setValidations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem('monitorVision.downloads') || '[]');
      const l = JSON.parse(localStorage.getItem('monitorVision.logs') || '[]');
      const v = JSON.parse(localStorage.getItem('monitorVision.xmlValidations') || '[]');
      setDownloads(Array.isArray(d) ? d : []);
      setLogs(Array.isArray(l) ? l : []);
      setValidations(Array.isArray(v) ? v : []);
    } catch {
      setDownloads([]);
      setLogs([]);
      setValidations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const metrics = useMemo(() => {
    const totalDownloads = downloads.length;
    const successfulDownloads = downloads.filter(d => d.success).length;
    const downloadSuccessRate = totalDownloads > 0 ? (successfulDownloads / totalDownloads) * 100 : 0;
    const lastDownload = downloads[downloads.length - 1] || null;

    const totalQueries = logs.length;
    const successfulQueries = logs.filter(l => l.success).length;
    const querySuccessRate = totalQueries > 0 ? (successfulQueries / totalQueries) * 100 : 0;
    const lastQuery = logs[logs.length - 1] || null;

    const totalValidations = validations.length;
    const successfulValidations = validations.filter(v => v.success).length;
    const validationSuccessRate = totalValidations > 0 ? (successfulValidations / totalValidations) * 100 : 0;
    const lastValidation = validations[validations.length - 1] || null;

    return {
      totalDownloads,
      downloadSuccessRate,
      lastDownload,
      totalQueries,
      querySuccessRate,
      lastQuery,
      totalValidations,
      validationSuccessRate,
      lastValidation,
    };
  }, [downloads, logs, validations]);

  if (loading) {
    return (
      <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
        <LinearProgress sx={{ width: '50%' }} />
        <Typography variant="body2" color="text.secondary">Carregando dados do Dashboard...</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight="bold">Dashboard de Atividades</Typography>
        <Typography variant="body1" color="text.secondary">
          Visão geral das operações recentes no sistema.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              avatar={<CloudDownloadIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
              title="Downloads IBPT"
              subheader="Tabelas de impostos"
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h3" fontWeight="bold">{metrics.totalDownloads}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>downloads totais</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress variant="determinate" value={metrics.downloadSuccessRate} sx={{ height: 8, borderRadius: 5 }} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">{`${Math.round(metrics.downloadSuccessRate)}%`}</Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Último: {metrics.lastDownload ? `${metrics.lastDownload?.filename ?? 'arquivo.csv'} (${new Date(metrics.lastDownload.timestamp).toLocaleDateString()})` : 'N/A'}
              </Typography>
            </CardContent>
            <CardActions>
              <Button fullWidth variant="contained" onClick={() => navigate('/ibptax')}>Ver Detalhes</Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              avatar={<BugReportIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
              title="Consultas CNPJ"
              subheader="Buscas de clientes"
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h3" fontWeight="bold">{metrics.totalQueries}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>consultas totais</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress variant="determinate" value={metrics.querySuccessRate} sx={{ height: 8, borderRadius: 5 }} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">{`${Math.round(metrics.querySuccessRate)}%`}</Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Última: {metrics.lastQuery ? `${metrics.lastQuery.cnpj} (${new Date(metrics.lastQuery.timestamp).toLocaleDateString()})` : 'N/A'}
              </Typography>
            </CardContent>
            <CardActions>
              <Button fullWidth variant="contained" onClick={() => navigate('/cnpj')}>Nova Consulta</Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              avatar={<FactCheckIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
              title="Validações XML"
              subheader="Verificação de NF-e"
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h3" fontWeight="bold">{metrics.totalValidations}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>validações totais</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress variant="determinate" value={metrics.validationSuccessRate} sx={{ height: 8, borderRadius: 5 }} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">{`${Math.round(metrics.validationSuccessRate)}%`}</Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Última: {metrics.lastValidation ? `${metrics.lastValidation?.filename ?? 'XML'} (${new Date(metrics.lastValidation.timestamp).toLocaleDateString()})` : 'N/A'}
              </Typography>
            </CardContent>
            <CardActions>
              <Button fullWidth variant="contained" onClick={() => navigate('/xml')}>Validar XML</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}