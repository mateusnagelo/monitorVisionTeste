import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';

const API_KEY = 'f5c6131e-2961-4b1d-a62f-1130445b03ea';

export interface NFe {
  chaveAcesso: string;
  status: string;
  emitente: string;
  docEmit: string;
  valor: string;
  emissao: string;
  numero: string;
  destinatario: string;
}

const getNFesFromStorage = (): NFe[] => {
  const nfeData = localStorage.getItem('minhasNFs');
  return nfeData ? JSON.parse(nfeData) : [];
};

const saveNFesToStorage = (nfes: NFe[]) => {
  localStorage.setItem('minhasNFs', JSON.stringify(nfes));
};

export const listNFes = (): NFe[] => {
  return getNFesFromStorage();
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const addNFe = async (chaveAcesso: string): Promise<NFe> => {
  const nfes = getNFesFromStorage();
  const existingNFe = nfes.find(nfe => nfe.chaveAcesso === chaveAcesso);
  if (existingNFe) {
    return existingNFe;
  }

  // 1. Add NFe to the processing queue
  await axios.put(`/api/v2/fd/add/${chaveAcesso}`, {}, {
    headers: { 
      'API-KEY': API_KEY,
      'Content-Type': 'application/json'
    },
  });

  // Wait for the server to process the request
  await sleep(2000);

  // 2. Fetch the XML
  const xmlResponse = await axios.get(`/api/v2/fd/get/xml/${chaveAcesso}`, {
    headers: { 'API-KEY': API_KEY },
  });

  if (!xmlResponse.data || !xmlResponse.data.data) {
    throw new Error('XML data not found in API response');
  }

  // 3. Parse the XML
  const parser = new XMLParser({ ignoreAttributes: false });
  const jsonObj = parser.parse(xmlResponse.data.data);

  const nfeProc = jsonObj['nfeProc'] || jsonObj['cteProc'];
  const nfeData = nfeProc['NFe'] || nfeProc['CTe'];
  const infNFe = nfeData['infNFe'] || nfeData['infCte'];
  
  const newNFe: NFe = {
    chaveAcesso: infNFe['@_Id'].replace('NFe', ''),
    status: 'Ok',
    emitente: infNFe['emit']['xNome'],
    docEmit: infNFe['emit']['CNPJ'] || infNFe['emit']['CPF'],
    valor: infNFe['total']['ICMSTot']['vNF'] || infNFe['vTPrest']['vTPrest'],
    emissao: infNFe['ide']['dhEmi'],
    numero: infNFe['ide']['nNF'] || infNFe['ide']['nCT'],
    destinatario: infNFe['dest']['xNome'],
  };

  // 4. Save to storage
  nfes.push(newNFe);
  saveNFesToStorage(nfes);

  return newNFe;
};
