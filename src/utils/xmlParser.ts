import { XMLParser } from 'fast-xml-parser';
import { Nfe } from '../types/Nfe';

// Função auxiliar para buscar valores em objetos aninhados
const getValue = (obj: any, path: string, defaultValue: any = '') => {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    return value !== undefined && value !== null ? value : defaultValue;
};

export const parseXML = (xmlString: string): Promise<Nfe> => {
  return new Promise((resolve, reject) => {
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
      });
      const jsonObj = parser.parse(xmlString);

      const nfeProc = getValue(jsonObj, 'nfeProc');
      const nfe = getValue(nfeProc, 'NFe.infNFe') || getValue(jsonObj, 'CFe.infCFe');
      const protNFe = getValue(nfeProc, 'protNFe.infProt');
      const ide = getValue(nfe, 'ide');
      const emit = getValue(nfe, 'emit');
      const dest = getValue(nfe, 'dest');
      const total = getValue(nfe, 'total.ICMSTot');
      const det = getValue(nfe, 'det');

      if (!nfe) {
        throw new Error('Estrutura de NFe/CFe inválida.');
      }

      const products = (Array.isArray(det) ? det : [det]).filter(d => d).map((item: any) => {
        const prod = getValue(item, 'prod');
        const imposto = getValue(item, 'imposto');
        const icms = getValue(imposto, 'ICMS');
        // Pega o primeiro tipo de ICMS que encontrar
        const icmsDetails = icms ? Object.values(icms)[0] as any : {};

        return {
          code: getValue(prod, 'cProd'),
          name: getValue(prod, 'xProd'),
          ncm: getValue(prod, 'NCM'),
          cfop: getValue(prod, 'CFOP'),
          quantity: parseFloat(getValue(prod, 'qCom', 0)),
          unitValue: parseFloat(getValue(prod, 'vUnCom', 0)),
          totalValue: parseFloat(getValue(prod, 'vProd', 0)),
          icms: {
            orig: getValue(icmsDetails, 'orig'),
            CST: getValue(icmsDetails, 'CST'),
            modBC: getValue(icmsDetails, 'modBC'),
            vBC: parseFloat(getValue(icmsDetails, 'vBC', 0)),
            pICMS: parseFloat(getValue(icmsDetails, 'pICMS', 0)),
            vICMS: parseFloat(getValue(icmsDetails, 'vICMS', 0)),
          }
        };
      });

      const nfeData: Nfe = {
        key: getValue(protNFe, 'chNFe') || getValue(nfe, '@_Id', '').replace('NFe', ''),
        emissionDate: getValue(ide, 'dhEmi'),
        number: getValue(ide, 'nNF'),
        value: getValue(total, 'vNF'),
        emitter: {
          name: getValue(emit, 'xNome'),
          cnpjCpf: getValue(emit, 'CNPJ') || getValue(emit, 'CPF'),
          address: `${getValue(emit, 'enderEmit.xLgr', '')}, ${getValue(emit, 'enderEmit.nro', '')}`,
          city: getValue(emit, 'enderEmit.xMun'),
          uf: getValue(emit, 'enderEmit.UF'),
        },
        receiver: {
          name: getValue(dest, 'xNome'),
          cnpjCpf: getValue(dest, 'CNPJ') || getValue(dest, 'CPF'),
          address: `${getValue(dest, 'enderDest.xLgr', '')}, ${getValue(dest, 'enderDest.nro', '')}`,
          city: getValue(dest, 'enderDest.xMun'),
          uf: getValue(dest, 'enderDest.UF'),
        },
        products: products,
      };

      resolve(nfeData);
    } catch (error) {
      console.error("Erro ao analisar XML:", error);
      reject(error);
    }
  });
};