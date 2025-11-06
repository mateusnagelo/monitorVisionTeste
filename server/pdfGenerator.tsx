import { JSDOM } from 'jsdom';
import JsBarcode from 'jsbarcode';
import { createCanvas } from 'canvas';

function parseXML(xmlContent: string) {
  console.log('[pdfGenerator] Iniciando parseXML.');
  const parser = new JSDOM(xmlContent, { contentType: 'application/xml' });
  const xmlDoc = parser.window.document;
  console.log('[pdfGenerator] JSDOM parseou o XML.');

  const get = (tag: string) => xmlDoc.querySelector(tag)?.textContent || '';

  const nfeProc = xmlDoc.querySelector('nfeProc');
  if (!nfeProc) {
    console.error('[pdfGenerator] Erro: nfeProc não encontrado.');
    throw new Error('Estrutura XML inválida: nfeProc não encontrado.');
  }

  console.log('[pdfGenerator] Extraindo dados de ide.');
  const ide = {
    chNFe: get('chNFe'),
    natOp: get('natOp'),
    nNF: get('nNF'),
    dhEmi: get('dhEmi'),
    vNF: get('vNF'),
    serie: get('serie'),
    dhSaiEnt: get('dhSaiEnt'),
  };

  console.log('[pdfGenerator] Extraindo dados de emit.');
  const emit = xmlDoc.querySelector('emit');
  const emitData = {
    xNome: emit?.querySelector('xNome')?.textContent || '',
    CNPJ: emit?.querySelector('CNPJ')?.textContent || '',
    IE: emit?.querySelector('IE')?.textContent || '',
    IEST: emit?.querySelector('IEST')?.textContent || '',
    IM: emit?.querySelector('IM')?.textContent || '',
    enderEmit: {
      xLgr: emit?.querySelector('xLgr')?.textContent || '',
      nro: emit?.querySelector('nro')?.textContent || '',
      xBairro: emit?.querySelector('xBairro')?.textContent || '',
      xMun: emit?.querySelector('xMun')?.textContent || '',
      UF: emit?.querySelector('UF')?.textContent || '',
      CEP: emit?.querySelector('CEP')?.textContent || '',
      fone: emit?.querySelector('fone')?.textContent || '',
    },
  };

  console.log('[pdfGenerator] Extraindo dados de dest.');
  const dest = xmlDoc.querySelector('dest');
  const destData = {
    xNome: dest?.querySelector('xNome')?.textContent || '',
    CNPJ: dest?.querySelector('CNPJ')?.textContent || '',
    enderDest: {
      xLgr: dest?.querySelector('xLgr')?.textContent || '',
      nro: dest?.querySelector('nro')?.textContent || '',
      xBairro: dest?.querySelector('xBairro')?.textContent || '',
      xMun: dest?.querySelector('xMun')?.textContent || '',
      UF: dest?.querySelector('UF')?.textContent || '',
      CEP: dest?.querySelector('CEP')?.textContent || '',
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
      CNPJ: xmlDoc.querySelector('transporta CNPJ')?.textContent || '',
      xNome: xmlDoc.querySelector('transporta xNome')?.textContent || '',
      xEnder: xmlDoc.querySelector('transporta xEnder')?.textContent || '',
      xMun: xmlDoc.querySelector('transporta xMun')?.textContent || '',
      UF: xmlDoc.querySelector('transporta UF')?.textContent || '',
    },
    veicTransp: {
      placa: xmlDoc.querySelector('veicTransp placa')?.textContent || '',
      UF: xmlDoc.querySelector('veicTransp UF')?.textContent || '',
      RNTRC: xmlDoc.querySelector('veicTransp RNTRC')?.textContent || '',
    },
    vol: Array.from(xmlDoc.querySelectorAll('vol')).map((v) => ({
      qVol: v.querySelector('qVol')?.textContent || '',
      esp: v.querySelector('esp')?.textContent || '',
      marca: v.querySelector('marca')?.textContent || '',
      pesoL: v.querySelector('pesoL')?.textContent || '',
      pesoB: v.querySelector('pesoB')?.textContent || '',
    })),
  };

  console.log('[pdfGenerator] Extraindo dados dos produtos (det).');
  const prods = Array.from(xmlDoc.querySelectorAll('det')).map((det) => {
    const prodNode = det.querySelector('prod');
    const impostoNode = det.querySelector('imposto');
    const icmsNode = impostoNode?.querySelector('ICMS')?.firstElementChild;
    const ipiNode = impostoNode?.querySelector('IPI');
    const ipiTribNode = ipiNode?.querySelector('IPITrib');
    const ipiNTNode = ipiNode?.querySelector('IPINT');

    return {
      prod: {
        cProd: prodNode?.querySelector('cProd')?.textContent || '',
        xProd: prodNode?.querySelector('xProd')?.textContent || '',
        NCM: prodNode?.querySelector('NCM')?.textContent || '',
        CFOP: prodNode?.querySelector('CFOP')?.textContent || '',
        uCom: prodNode?.querySelector('uCom')?.textContent || '',
        qCom: prodNode?.querySelector('qCom')?.textContent || '',
        vUnCom: prodNode?.querySelector('vUnCom')?.textContent || '',
        vProd: prodNode?.querySelector('vProd')?.textContent || '',
      },
      imposto: {
        ICMS: {
          CSOSN: icmsNode?.querySelector('CSOSN')?.textContent || '',
          CST: icmsNode?.querySelector('CST')?.textContent || '',
          vBC: icmsNode?.querySelector('vBC')?.textContent || '',
          vICMS: icmsNode?.querySelector('vICMS')?.textContent || '',
          pICMS: icmsNode?.querySelector('pICMS')?.textContent || '',
        },
        IPI: {
          CST: ipiTribNode?.querySelector('CST')?.textContent || ipiNTNode?.querySelector('CST')?.textContent || '',
          vIPI: ipiTribNode?.querySelector('vIPI')?.textContent || '',
          pIPI: ipiTribNode?.querySelector('pIPI')?.textContent || '',
        },
      },
    };
  });
  console.log(`[pdfGenerator] Encontrados ${prods.length} produtos.`);

  console.log('[pdfGenerator] Extraindo dados de cobr.');
  const cobr = {
    dup: Array.from(xmlDoc.querySelectorAll('dup')).map((d) => ({
      nDup: d.querySelector('nDup')?.textContent || '',
      dVenc: d.querySelector('dVenc')?.textContent || '',
      vDup: d.querySelector('vDup')?.textContent || '',
    })),
  };

  console.log('[pdfGenerator] Extraindo dados de infAdic.');
  const infAdic = {
    infCpl: get('infCpl'),
    infAdFisco: get('infAdFisco'),
  };

  console.log('[pdfGenerator] Extraindo dados de protNFe.');
  const protNFe = {
    infProt: {
      chNFe: xmlDoc.querySelector('protNFe infProt chNFe')?.textContent || get('chNFe'),
      nProt: xmlDoc.querySelector('protNFe infProt nProt')?.textContent || '',
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
  JsBarcode(canvas, chaveDeAcesso, {
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

    return { ...nfeData, chaveDeAcesso, barcodeImage };
  } catch (error) {
    console.error('Erro ao processar XML no pdfGenerator:', error);
    throw new Error('Falha ao processar os dados do XML.');
  }
};

export { generateNfeData };