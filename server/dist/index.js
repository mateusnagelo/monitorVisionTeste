"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const pdfGenerator_1 = require("./pdfGenerator");
const app = (0, express_1.default)();
const port = 3001;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.text({ type: 'application/xml' }));
app.post('/api/process-xml', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[server] Request received for /api/process-xml');
    console.log('[server] Raw request body:', req.body);
    console.log('[server] Recebida requisição para /api/process-xml');
    const xmlContent = req.body;
    if (typeof xmlContent !== 'string' || !xmlContent) {
        console.log('[server] Erro: Conteúdo XML não fornecido ou em formato incorreto.');
        return res.status(400).json({ error: 'Conteúdo XML não fornecido ou em formato incorreto.' });
    }
    try {
        console.log('[server] Chamando generateNfeData.');
        const nfeData = yield (0, pdfGenerator_1.generateNfeData)(xmlContent);
        console.log('[server] Dados da NFe gerados com sucesso.');
        res.json(nfeData);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro interno ao processar o XML.';
        console.error('[server] Erro ao processar XML:', JSON.stringify(error, null, 2));
        res.status(500).json({ error: errorMessage });
    }
}));
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
const serverless_http_1 = __importDefault(require("serverless-http"));
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
module.exports.handler = (0, serverless_http_1.default)(app);
