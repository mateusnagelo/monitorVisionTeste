interface NFeData {
  ide: {
    cUF: string | null;
    cNF: string | null;
    natOp: string | null;
    mod: string | null;
    serie: string | null;
    nNF: string | null;
    dhEmi: string | null;
    dhSaiEnt: string | null;
    tpNF: string | null;
    idDest: string | null;
    cMunFG: string | null;
    tpImp: string | null;
    tpEmis: string | null;
    cDV: string | null;
    tpAmb: string | null;
    finNFe: string | null;
    indFinal: string | null;
    indPres: string | null;
    procEmi: string | null;
    verProc: string | null;
  };
  emit: {
    CNPJ: string | null;
    xNome: string | null;
    xFant: string | null;
    enderEmit: {
      xLgr: string | null;
      nro: string | null;
      xBairro: string | null;
      cMun: string | null;
      xMun: string | null;
      UF: string | null;
      CEP: string | null;
      cPais: string | null;
      xPais: string | null;
      fone: string | null;
    };
    IE: string | null;
    CRT: string | null;
  };
  dest: {
    CNPJ: string | null;
    xNome: string | null;
    enderDest: {
      xLgr: string | null;
      nro: string | null;
      xBairro: string | null;
      cMun: string | null;
      xMun: string | null;
      UF: string | null;
      CEP: string | null;
      cPais: string | null;
      xPais: string | null;
      fone: string | null;
    };
    indIEDest: string | null;
    IE: string | null;
  };
  cobr?: {
    fat?: {
      nFat: string | null;
      vOrig: string | null;
      vDesc: string | null;
      vLiq: string | null;
    };
    dup?: {
      nDup: string | null;
      dVenc: string | null;
      vDup: string | null;
    }[];
  };
  pag: {
    detPag: {
      tPag: string | null;
      vPag: string | null;
    }[];
    vTroco: string | null;
  };
  det: any[];
  total: {
    ICMSTot: {
      vBC: string | null;
      vICMS: string | null;
      vICMSDeson: string | null;
      vFCPUFDest: string | null;
      vICMSUFDest: string | null;
      vICMSUFRemet: string | null;
      vFCP: string | null;
      vBCST: string | null;
      vST: string | null;
      vFCPST: string | null;
      vFCPSTRet: string | null;
      vProd: string | null;
      vFrete: string | null;
      vSeg: string | null;
      vDesc: string | null;
      vII: string | null;
      vIPI: string | null;
      vIPIDevol: string | null;
      vPIS: string | null;
      vCOFINS: string | null;
      vOutro: string | null;
      vNF: string | null;
    };
  };
  transp: {
    modFrete: string | null;
    transporta: {
      CNPJ: string | null;
      xNome: string | null;
      IE: string | null;
      xEnder: string | null;
      xMun: string | null;
      UF: string | null;
    };
    veicTransp: {
      placa: string | null;
      UF: string | null;
      RNTC: string | null;
    };
    vol: {
      qVol: string | null;
      esp: string | null;
      marca: string | null;
      nVol: string | null;
      pesoL: string | null;
      pesoB: string | null;
    }[];
  };
  infAdic: {
    infCpl: string | null;
  };
  protNFe: {
    infProt: {
      tpAmb: string | null;
      verAplic: string | null;
      chNFe: string | null;
      dhRecbto: string | null;
      nProt: string | null;
      digVal: string | null;
      cStat: string | null;
      xMotivo: string | null;
    };
  };
  tipo: string;
}

const getValue = (element: Element | null, tagName: string): string | null => {
  if (!element) return null;
  const node = element.getElementsByTagName(tagName)[0];
  return node ? node.textContent : null;
};

const getNumber = (element: Element | null, tagName: string): number => {
  const value = getValue(element, tagName);
  return value ? parseFloat(value) : 0;
};

const getElement = (element: Element | Document | null, tagName: string): Element | null => {
  if (!element) return null;
  return element.getElementsByTagName(tagName)[0] || null;
};

const getAddress = (element: Element | null) => {
  return {
    xLgr: getValue(element, 'xLgr'),
    nro: getValue(element, 'nro'),
    xBairro: getValue(element, 'xBairro'),
    cMun: getValue(element, 'cMun'),
    xMun: getValue(element, 'xMun'),
    UF: getValue(element, 'UF'),
    CEP: getValue(element, 'CEP'),
    cPais: getValue(element, 'cPais'),
    xPais: getValue(element, 'xPais'),
    fone: getValue(element, 'fone'),
  };
};

import { Nfe } from '../types/Nfe';

export const parseNFe = (xmlDoc: XMLDocument): Nfe | null => {
  const rootElement = xmlDoc.documentElement;
  const nfe = getElement(rootElement, 'NFe');
  if (!nfe) return null;

  const infNFe = getElement(nfe, 'infNFe');
  if (!infNFe) return null;

  const ide = getElement(infNFe, 'ide');
  const emit = getElement(infNFe, 'emit');
  const dest = getElement(infNFe, 'dest');
  const total = getElement(infNFe, 'total');
  const ICMSTot = getElement(total, 'ICMSTot');
  const protNFe = getElement(nfe, 'protNFe');
  const infProt = getElement(protNFe, 'infProt');

  return {
    chave: getValue(infProt, 'chNFe') || '',
    versao: nfe.getAttribute('versao') || '',
    ide: {
      cUF: getValue(ide, 'cUF') || '',
      cNF: getValue(ide, 'cNF') || '',
      natOp: getValue(ide, 'natOp') || '',
      mod: getValue(ide, 'mod') || '',
      serie: getValue(ide, 'serie') || '',
      nNF: getValue(ide, 'nNF') || '',
      dhEmi: getValue(ide, 'dhEmi') || '',
      dhSaiEnt: getValue(ide, 'dhSaiEnt') || '',
      tpNF: getValue(ide, 'tpNF') || '',
      idDest: getValue(ide, 'idDest') || '',
      cMunFG: getValue(ide, 'cMunFG') || '',
      tpImp: getValue(ide, 'tpImp') || '',
      tpEmis: getValue(ide, 'tpEmis') || '',
      cDV: getValue(ide, 'cDV') || '',
      tpAmb: getValue(ide, 'tpAmb') || '',
      finNFe: getValue(ide, 'finNFe') || '',
      indFinal: getValue(ide, 'indFinal') || '',
      indPres: getValue(ide, 'indPres') || '',
      procEmi: getValue(ide, 'procEmi') || '',
      verProc: getValue(ide, 'verProc') || '',
    },
    emit: {
      CNPJ: getValue(emit, 'CNPJ') || '',
      xNome: getValue(emit, 'xNome') || '',
      xFant: getValue(emit, 'xFant') || '',
      enderEmit: {
        xLgr: getValue(getElement(emit, 'enderEmit'), 'xLgr') || '',
        nro: getValue(getElement(emit, 'enderEmit'), 'nro') || '',
        xBairro: getValue(getElement(emit, 'enderEmit'), 'xBairro') || '',
        cMun: getValue(getElement(emit, 'enderEmit'), 'cMun') || '',
        xMun: getValue(getElement(emit, 'enderEmit'), 'xMun') || '',
        UF: getValue(getElement(emit, 'enderEmit'), 'UF') || '',
        CEP: getValue(getElement(emit, 'enderEmit'), 'CEP') || '',
        cPais: getValue(getElement(emit, 'enderEmit'), 'cPais') || '',
        xPais: getValue(getElement(emit, 'enderEmit'), 'xPais') || '',
      },
      IE: getValue(emit, 'IE') || '',
      CRT: getValue(emit, 'CRT') || '',
    },
    dest: {
      CNPJ: getValue(dest, 'CNPJ') || '',
      xNome: getValue(dest, 'xNome') || '',
      enderDest: {
        xLgr: getValue(getElement(dest, 'enderDest'), 'xLgr') || '',
        nro: getValue(getElement(dest, 'enderDest'), 'nro') || '',
        xBairro: getValue(getElement(dest, 'enderDest'), 'xBairro') || '',
        cMun: getValue(getElement(dest, 'enderDest'), 'cMun') || '',
        xMun: getValue(getElement(dest, 'enderDest'), 'xMun') || '',
        UF: getValue(getElement(dest, 'enderDest'), 'UF') || '',
        CEP: getValue(getElement(dest, 'enderDest'), 'CEP') || '',
        cPais: getValue(getElement(dest, 'enderDest'), 'cPais') || '',
        xPais: getValue(getElement(dest, 'enderDest'), 'xPais') || '',
      },
      indIEDest: getValue(dest, 'indIEDest') || '',
      IE: getValue(dest, 'IE') || '',
    },
    total: {
      ICMSTot: {
        vBC: getNumber(ICMSTot, 'vBC'),
        vICMS: getNumber(ICMSTot, 'vICMS'),
        vICMSDeson: getNumber(ICMSTot, 'vICMSDeson'),
        vFCP: getNumber(ICMSTot, 'vFCP'),
        vBCST: getNumber(ICMSTot, 'vBCST'),
        vST: getNumber(ICMSTot, 'vST'),
        vFCPST: getNumber(ICMSTot, 'vFCPST'),
        vFCPSTRet: getNumber(ICMSTot, 'vFCPSTRet'),
        vProd: getNumber(ICMSTot, 'vProd'),
        vFrete: getNumber(ICMSTot, 'vFrete'),
        vSeg: getNumber(ICMSTot, 'vSeg'),
        vDesc: getNumber(ICMSTot, 'vDesc'),
        vII: getNumber(ICMSTot, 'vII'),
        vIPI: getNumber(ICMSTot, 'vIPI'),
        vIPIDevol: getNumber(ICMSTot, 'vIPIDevol'),
        vPIS: getNumber(ICMSTot, 'vPIS'),
        vCOFINS: getNumber(ICMSTot, 'vCOFINS'),
        vOutro: getNumber(ICMSTot, 'vOutro'),
        vNF: getNumber(ICMSTot, 'vNF'),
      },
    },
    det: [],
  };
};

export const parseCTe = (xmlDoc: XMLDocument) => {
  const emit = getElement(xmlDoc, 'emit');
  const dest = getElement(xmlDoc, 'dest');
  const emitente = {
    nome: getValue(emit, "xNome"),
    cnpj: getValue(emit, "CNPJ"),
  };
  const destinatario = {
    nome: getValue(dest, "xNome"),
    cnpj: getValue(dest, "CNPJ"),
  };
  return { emitente, destinatario, tipo: "CTe" };
};


export const parseXML = (xmlString: string) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("Erro de parsing no XML.");
  }

  if (xmlDoc.getElementsByTagName("infNFe").length > 0) {
    return parseNFe(xmlDoc);
  }

  if (xmlDoc.getElementsByTagName("infCte").length > 0) {
    return parseCTe(xmlDoc);
  }

  return null;
};