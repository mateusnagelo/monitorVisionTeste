import { useNavigate } from 'react-router-dom';
import { addNFe } from '../services/nfe';
import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';

const AddNfePage = () => {
  const navigate = useNavigate();
  const [chave, setChave] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleChaveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    setChave(onlyNumbers.slice(0, 44));
  };

  const handleBuscar = async () => {
    setLoading(true);
    setError(null);
    setStatus('Adicionando e buscando...');

    try {
      await addNFe(chave);
      navigate('/minhas-nfs');
    } catch (err) {
      setError(
        'Falha ao buscar ou adicionar a NFe. Verifique a chave e tente novamente.'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Download XML
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <>
        <TextField
          fullWidth
          label="Chave da NFe ou CTe"
          value={chave}
          onChange={handleChaveChange}
          inputProps={{ maxLength: 44 }}
          helperText={`${chave.length}/44`}
          disabled={loading}
        />
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleBuscar}
          disabled={chave.length !== 44 || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Buscar e Adicionar'}
        </Button>
        {loading && <Typography sx={{ mt: 1 }}>Status: {status}</Typography>}
      </>
    </Box>
  );
};

export default AddNfePage;
