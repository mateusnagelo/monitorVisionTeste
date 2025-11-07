import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { generateNfeData } from './pdfGenerator';
import { DistribuicaoDFe } from 'node-mde';
import fs from 'fs';

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'application/xml' }));

app.post('/api/process-xml', async (req, res) => {
  console.log('[server] Recebida requisição para /api/process-xml');
  const xmlContent = req.body;

  if (typeof xmlContent !== 'string' || !xmlContent) {
    console.log('[server] Erro: Conteúdo XML não fornecido ou em formato incorreto.');
    return res.status(400).json({ error: 'Conteúdo XML não fornecido ou em formato incorreto.' });
  }

  try {
    console.log('[server] Chamando generateNfeData.');
    const nfeData = await generateNfeData(xmlContent);
    console.log('[server] Dados da NFe gerados com sucesso.');
    res.json(nfeData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno ao processar o XML.';
    console.error('[server] Erro ao processar XML:', error);
    res.status(500).json({ error: errorMessage });
  }
});

/*
// TODO: Endpoint para consulta de NFe desabilitado temporariamente.
// Esta funcionalidade requer um certificado digital válido e configuração de CNPJ.
// O código abaixo é um exemplo e irá falhar sem um certificado real.
app.post('/api/nfe-data', async (req, res) => {
  const { accessKeys } = req.body;

  if (!accessKeys || !Array.isArray(accessKeys)) {
    return res.status(400).json({ error: 'Nenhuma chave de acesso fornecida.' });
  }

  try {
    // TODO: Substitua com o caminho real para o seu certificado .pfx e a senha
    const pfx = fs.readFileSync('./caminho/para/seu/certificado.pfx');
    const passphrase = 'sua_senha';

    const distribuicao = new DistribuicaoDFe({
      pfx,
      passphrase,
      cnpj: 'SEU_CNPJ_AQUI', // TODO: Substitua pelo CNPJ do titular do certificado
      cUFAutor: '41', // TODO: Ajuste para a UF correta
      tpAmb: '2', // 1 para Produção, 2 para Homologação
    });

    const nfeDataPromises = accessKeys.map(async (key) => {
      try {
        const consulta = await distribuicao.consultaChNFe(key);

        if (consulta.error) {
          console.error(`Erro ao consultar a chave ${key}:`, consulta.error);
          return null;
        }

        if (consulta.data?.docZip?.[0]?.xml) {
          const xml = consulta.data.docZip[0].xml;
          const nfeData = await generateNfeData(xml);
          return nfeData;
        }
        return null;
      } catch (error) {
        console.error(`Erro no processamento da chave ${key}:`, error);
        return null;
      }
    });

    const results = (await Promise.all(nfeDataPromises)).filter(Boolean);
    res.json(results);

  } catch (error) {
    console.error('Erro ao processar as chaves de acesso:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});
*/

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});