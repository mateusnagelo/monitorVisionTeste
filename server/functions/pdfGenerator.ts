import * as cheerio from 'cheerio';
import JsBarcode from 'jsbarcode';
import { createCanvas } from 'canvas';

function parseXML(xmlContent: string) {
  console.log('[pdfGenerator] Iniciando parseXML.');
  const $ = cheerio.load(xmlContent, { xmlMode: true });
  console.log('[pdfGenerator] Cheerio carregou o XML.');

  const get = (selector: string) => $(selector).first().text() || '';

  const nfeProc = $('nfeProc, NFe');
  if (nfeProc.length === 0) {
    console.error('[pdfGenerator] Erro: nfeProc ou NFe não encontrado.');
    throw new Error('Estrutura XML inválida: nfeProc ou NFe não encontrado.');
  }

  console.log('[pdfGenerator] Extraindo dados de ide.');
  const ide = {
    natOp: get('natOp'),
    nNF: get('nNF'),
    dhEmi: get('dhEmi'),
    serie: get('serie'),
    dhSaiEnt: get('dhSaiEnt'),
  };

  console.log('[pdfGenerator] Extraindo dados de emit.');
  const emit = $('emit');
  const emitData = {
    xNome: emit.find('xNome').text(),
    CNPJ: emit.find('CNPJ').text() || emit.find('CPF').text(),
    IE: emit.find('IE').text(),
    IEST: emit.find('IEST').text(),
    IM: emit.find('IM').text(),
    enderEmit: {
      xLgr: emit.find('xLgr').text(),
      nro: emit.find('nro').text(),
      xBairro: emit.find('xBairro').text(),
      xMun: emit.find('xMun').text(),
      UF: emit.find('UF').text(),
      CEP: emit.find('CEP').text(),
      fone: emit.find('fone').text(),
    },
  };

  console.log('[pdfGenerator] Extraindo dados de dest.');
  const dest = $('dest');
  const destData = {
    xNome: dest.find('xNome').text(),
    CNPJ: dest.find('CNPJ').text() || dest.find('CPF').text(),
    enderDest: {
      xLgr: dest.find('xLgr').text(),
      nro: dest.find('nro').text(),
      xBairro: dest.find('xBairro').text(),
      xMun: dest.find('xMun').text(),
      UF: dest.find('UF').text(),
      CEP: dest.find('CEP').text(),
    },
  };

  console.log('[pdfGenerator] Extraindo dados de total.');
  const total = {
    ICMSTot: {
      vBC: get('vBC'),
      vICMS: get('vICMS'),
      vBCST: get('vBCST'),
      vST: get('vST'),
      vProd: get('vProd'),
      vFrete: get('vFrete'),
      vSeg: get('vSeg'),
      vDesc: get('vDesc'),
      vII: get('vII'),
      vIPI: get('vIPI'),
      vPIS: get('vPIS'),
      vCOFINS: get('vCOFINS'),
      vOutro: get('vOutro'),
      vNF: get('vNF'),
    },
  };

  console.log('[pdfGenerator] Extraindo dados de transp.');
  const transp = {
    modFrete: get('modFrete'),
    transporta: {
      CNPJ: $('transporta CNPJ').text(),
      xNome: $('transporta xNome').text(),
      xEnder: $('transporta xEnder').text(),
      xMun: $('transporta xMun').text(),
      UF: $('transporta UF').text(),
    },
    veicTransp: {
      placa: $('veicTransp placa').text(),
      UF: $('veicTransp UF').text(),
      RNTRC: $('veicTransp RNTRC').text(),
    },
    vol: $('vol').map((i, v) => ({
      qVol: $(v).find('qVol').text(),
      esp: $(v).find('esp').text(),
      marca: $(v).find('marca').text(),
      pesoL: $(v).find('pesoL').text(),
      pesoB: $(v).find('pesoB').text(),
    })).get(),
  };

  console.log('[pdfGenerator] Extraindo dados dos produtos (det).');
  const prods = $('det').map((i, det) => {
    const prodNode = $(det).find('prod');
    const impostoNode = $(det).find('imposto');
    const icmsNode = impostoNode.find('ICMS').children().first();
    const ipiNode = impostoNode.find('IPI');
    const ipiTribNode = ipiNode.find('IPITrib');
    const ipiNTNode = ipiNode.find('IPINT');

    return {
      prod: {
        cProd: prodNode.find('cProd').text(),
        xProd: prodNode.find('xProd').text(),
        NCM: prodNode.find('NCM').text(),
        CFOP: prodNode.find('CFOP').text(),
        uCom: prodNode.find('uCom').text(),
        qCom: prodNode.find('qCom').text(),
        vUnCom: prodNode.find('vUnCom').text(),
        vProd: prodNode.find('vProd').text(),
      },
      imposto: {
        ICMS: {
          CSOSN: icmsNode.find('CSOSN').text(),
          CST: icmsNode.find('CST').text(),
          vBC: icmsNode.find('vBC').text(),
          vICMS: icmsNode.find('vICMS').text(),
          pICMS: icmsNode.find('pICMS').text(),
        },
        IPI: {
          CST: ipiTribNode.find('CST').text() || ipiNTNode.find('CST').text(),
          vIPI: ipiTribNode.find('vIPI').text(),
          pIPI: ipiTribNode.find('pIPI').text(),
        },
      },
    };
  }).get();
  console.log(`[pdfGenerator] Encontrados ${prods.length} produtos.`);

  console.log('[pdfGenerator] Extraindo dados de cobr.');
  const cobr = {
    dup: $('dup').map((i, d) => ({
      nDup: $(d).find('nDup').text(),
      dVenc: $(d).find('dVenc').text(),
      vDup: $(d).find('vDup').text(),
    })).get(),
  };

  console.log('[pdfGenerator] Extraindo dados de infAdic.');
  const infAdic = {
    infCpl: get('infCpl'),
    infAdFisco: get('infAdFisco'),
  };

  console.log('[pdfGenerator] Extraindo dados de protNFe.');
  const infNFe = $('infNFe');
  const chNFeFromProt = $('protNFe infProt chNFe').text();
  const chNFeFromId = infNFe.attr('Id')?.replace(/^NFe/, '');

  const protNFe = {
    infProt: {
      chNFe: chNFeFromProt || chNFeFromId || '',
      nProt: $('protNFe infProt nProt').text(),
    },
  };

  console.log('[pdfGenerator] parseXML concluído com sucesso.');
  return {
    ide,
    emit: emitData,
    dest: destData,
    det: prods,
    total,
    transp,
    cobr,
    infAdic,
    protNFe,
  };
}

async function generateBarcode(chaveDeAcesso: string) {
  const canvas = createCanvas(200, 50);
  JsBarcode(canvas as any, chaveDeAcesso, {
    format: 'CODE128',
    displayValue: false,
    width: 2,
    height: 50,
  });
  return canvas.toDataURL('image/png');
}

const generateNfeData = async (xmlString: string) => {
  console.log('[pdfGenerator] Iniciando generateNfeData.');
  try {
    const nfeData = parseXML(xmlString);
    console.log('[pdfGenerator] Dados do XML parseados. Gerando código de barras.');
    const chaveDeAcesso = nfeData.protNFe.infProt.chNFe;

    if (!chaveDeAcesso) {
        console.error('[pdfGenerator] Erro: Chave de Acesso não encontrada no XML.');
        throw new Error('Chave de Acesso não encontrada no XML.');
    }

    const barcodeImage = await generateBarcode(chaveDeAcesso);
    console.log('[pdfGenerator] Código de barras gerado.');

    return { ...nfeData, chave: chaveDeAcesso, barcodeImage };
  } catch (error) {
    console.error('Erro ao processar XML no pdfGenerator:', error);
    const message = (error as Error)?.message || String(error) || 'Erro desconhecido';
    throw new Error(`Falha ao processar os dados do XML: ${message}`);
  }
};

export { generateNfeData };