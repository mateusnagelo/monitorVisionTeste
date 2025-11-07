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
exports.generateNfeData = void 0;
const jsdom_1 = require("jsdom");
const jsbarcode_1 = __importDefault(require("jsbarcode"));
const canvas_1 = require("canvas");
function parseXML(xmlContent) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7;
    console.log('[pdfGenerator] Iniciando parseXML.');
    const parser = new jsdom_1.JSDOM(xmlContent, { contentType: 'application/xml' });
    const xmlDoc = parser.window.document;
    console.log('[pdfGenerator] JSDOM parseou o XML.');
    const get = (tag) => { var _a; return ((_a = xmlDoc.querySelector(tag)) === null || _a === void 0 ? void 0 : _a.textContent) || ''; };
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
        xNome: ((_a = emit === null || emit === void 0 ? void 0 : emit.querySelector('xNome')) === null || _a === void 0 ? void 0 : _a.textContent) || '',
        CNPJ: ((_b = emit === null || emit === void 0 ? void 0 : emit.querySelector('CNPJ')) === null || _b === void 0 ? void 0 : _b.textContent) || ((_c = emit === null || emit === void 0 ? void 0 : emit.querySelector('CPF')) === null || _c === void 0 ? void 0 : _c.textContent) || '',
        IE: ((_d = emit === null || emit === void 0 ? void 0 : emit.querySelector('IE')) === null || _d === void 0 ? void 0 : _d.textContent) || '',
        IEST: ((_e = emit === null || emit === void 0 ? void 0 : emit.querySelector('IEST')) === null || _e === void 0 ? void 0 : _e.textContent) || '',
        IM: ((_f = emit === null || emit === void 0 ? void 0 : emit.querySelector('IM')) === null || _f === void 0 ? void 0 : _f.textContent) || '',
        enderEmit: {
            xLgr: ((_g = emit === null || emit === void 0 ? void 0 : emit.querySelector('xLgr')) === null || _g === void 0 ? void 0 : _g.textContent) || '',
            nro: ((_h = emit === null || emit === void 0 ? void 0 : emit.querySelector('nro')) === null || _h === void 0 ? void 0 : _h.textContent) || '',
            xBairro: ((_j = emit === null || emit === void 0 ? void 0 : emit.querySelector('xBairro')) === null || _j === void 0 ? void 0 : _j.textContent) || '',
            xMun: ((_k = emit === null || emit === void 0 ? void 0 : emit.querySelector('xMun')) === null || _k === void 0 ? void 0 : _k.textContent) || '',
            UF: ((_l = emit === null || emit === void 0 ? void 0 : emit.querySelector('UF')) === null || _l === void 0 ? void 0 : _l.textContent) || '',
            CEP: ((_m = emit === null || emit === void 0 ? void 0 : emit.querySelector('CEP')) === null || _m === void 0 ? void 0 : _m.textContent) || '',
            fone: ((_o = emit === null || emit === void 0 ? void 0 : emit.querySelector('fone')) === null || _o === void 0 ? void 0 : _o.textContent) || '',
        },
    };
    console.log('[pdfGenerator] Extraindo dados de dest.');
    const dest = xmlDoc.querySelector('dest');
    const destData = {
        xNome: ((_p = dest === null || dest === void 0 ? void 0 : dest.querySelector('xNome')) === null || _p === void 0 ? void 0 : _p.textContent) || '',
        CNPJ: ((_q = dest === null || dest === void 0 ? void 0 : dest.querySelector('CNPJ')) === null || _q === void 0 ? void 0 : _q.textContent) || ((_r = dest === null || dest === void 0 ? void 0 : dest.querySelector('CPF')) === null || _r === void 0 ? void 0 : _r.textContent) || '',
        enderDest: {
            xLgr: ((_s = dest === null || dest === void 0 ? void 0 : dest.querySelector('xLgr')) === null || _s === void 0 ? void 0 : _s.textContent) || '',
            nro: ((_t = dest === null || dest === void 0 ? void 0 : dest.querySelector('nro')) === null || _t === void 0 ? void 0 : _t.textContent) || '',
            xBairro: ((_u = dest === null || dest === void 0 ? void 0 : dest.querySelector('xBairro')) === null || _u === void 0 ? void 0 : _u.textContent) || '',
            xMun: ((_v = dest === null || dest === void 0 ? void 0 : dest.querySelector('xMun')) === null || _v === void 0 ? void 0 : _v.textContent) || '',
            UF: ((_w = dest === null || dest === void 0 ? void 0 : dest.querySelector('UF')) === null || _w === void 0 ? void 0 : _w.textContent) || '',
            CEP: ((_x = dest === null || dest === void 0 ? void 0 : dest.querySelector('CEP')) === null || _x === void 0 ? void 0 : _x.textContent) || '',
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
            CNPJ: ((_y = xmlDoc.querySelector('transporta CNPJ')) === null || _y === void 0 ? void 0 : _y.textContent) || '',
            xNome: ((_z = xmlDoc.querySelector('transporta xNome')) === null || _z === void 0 ? void 0 : _z.textContent) || '',
            xEnder: ((_0 = xmlDoc.querySelector('transporta xEnder')) === null || _0 === void 0 ? void 0 : _0.textContent) || '',
            xMun: ((_1 = xmlDoc.querySelector('transporta xMun')) === null || _1 === void 0 ? void 0 : _1.textContent) || '',
            UF: ((_2 = xmlDoc.querySelector('transporta UF')) === null || _2 === void 0 ? void 0 : _2.textContent) || '',
        },
        veicTransp: {
            placa: ((_3 = xmlDoc.querySelector('veicTransp placa')) === null || _3 === void 0 ? void 0 : _3.textContent) || '',
            UF: ((_4 = xmlDoc.querySelector('veicTransp UF')) === null || _4 === void 0 ? void 0 : _4.textContent) || '',
            RNTRC: ((_5 = xmlDoc.querySelector('veicTransp RNTRC')) === null || _5 === void 0 ? void 0 : _5.textContent) || '',
        },
        vol: Array.from(xmlDoc.querySelectorAll('vol')).map((v) => {
            var _a, _b, _c, _d, _e;
            return ({
                qVol: ((_a = v.querySelector('qVol')) === null || _a === void 0 ? void 0 : _a.textContent) || '',
                esp: ((_b = v.querySelector('esp')) === null || _b === void 0 ? void 0 : _b.textContent) || '',
                marca: ((_c = v.querySelector('marca')) === null || _c === void 0 ? void 0 : _c.textContent) || '',
                pesoL: ((_d = v.querySelector('pesoL')) === null || _d === void 0 ? void 0 : _d.textContent) || '',
                pesoB: ((_e = v.querySelector('pesoB')) === null || _e === void 0 ? void 0 : _e.textContent) || '',
            });
        }),
    };
    console.log('[pdfGenerator] Extraindo dados dos produtos (det).');
    const prods = Array.from(xmlDoc.querySelectorAll('det')).map((det) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        const prodNode = det.querySelector('prod');
        const impostoNode = det.querySelector('imposto');
        const icmsNode = (_a = impostoNode === null || impostoNode === void 0 ? void 0 : impostoNode.querySelector('ICMS')) === null || _a === void 0 ? void 0 : _a.firstElementChild;
        const ipiNode = impostoNode === null || impostoNode === void 0 ? void 0 : impostoNode.querySelector('IPI');
        const ipiTribNode = ipiNode === null || ipiNode === void 0 ? void 0 : ipiNode.querySelector('IPITrib');
        const ipiNTNode = ipiNode === null || ipiNode === void 0 ? void 0 : ipiNode.querySelector('IPINT');
        return {
            prod: {
                cProd: ((_b = prodNode === null || prodNode === void 0 ? void 0 : prodNode.querySelector('cProd')) === null || _b === void 0 ? void 0 : _b.textContent) || '',
                xProd: ((_c = prodNode === null || prodNode === void 0 ? void 0 : prodNode.querySelector('xProd')) === null || _c === void 0 ? void 0 : _c.textContent) || '',
                NCM: ((_d = prodNode === null || prodNode === void 0 ? void 0 : prodNode.querySelector('NCM')) === null || _d === void 0 ? void 0 : _d.textContent) || '',
                CFOP: ((_e = prodNode === null || prodNode === void 0 ? void 0 : prodNode.querySelector('CFOP')) === null || _e === void 0 ? void 0 : _e.textContent) || '',
                uCom: ((_f = prodNode === null || prodNode === void 0 ? void 0 : prodNode.querySelector('uCom')) === null || _f === void 0 ? void 0 : _f.textContent) || '',
                qCom: ((_g = prodNode === null || prodNode === void 0 ? void 0 : prodNode.querySelector('qCom')) === null || _g === void 0 ? void 0 : _g.textContent) || '',
                vUnCom: ((_h = prodNode === null || prodNode === void 0 ? void 0 : prodNode.querySelector('vUnCom')) === null || _h === void 0 ? void 0 : _h.textContent) || '',
                vProd: ((_j = prodNode === null || prodNode === void 0 ? void 0 : prodNode.querySelector('vProd')) === null || _j === void 0 ? void 0 : _j.textContent) || '',
            },
            imposto: {
                ICMS: {
                    CSOSN: ((_k = icmsNode === null || icmsNode === void 0 ? void 0 : icmsNode.querySelector('CSOSN')) === null || _k === void 0 ? void 0 : _k.textContent) || '',
                    CST: ((_l = icmsNode === null || icmsNode === void 0 ? void 0 : icmsNode.querySelector('CST')) === null || _l === void 0 ? void 0 : _l.textContent) || '',
                    vBC: ((_m = icmsNode === null || icmsNode === void 0 ? void 0 : icmsNode.querySelector('vBC')) === null || _m === void 0 ? void 0 : _m.textContent) || '',
                    vICMS: ((_o = icmsNode === null || icmsNode === void 0 ? void 0 : icmsNode.querySelector('vICMS')) === null || _o === void 0 ? void 0 : _o.textContent) || '',
                    pICMS: ((_p = icmsNode === null || icmsNode === void 0 ? void 0 : icmsNode.querySelector('pICMS')) === null || _p === void 0 ? void 0 : _p.textContent) || '',
                },
                IPI: {
                    CST: ((_q = ipiTribNode === null || ipiTribNode === void 0 ? void 0 : ipiTribNode.querySelector('CST')) === null || _q === void 0 ? void 0 : _q.textContent) || ((_r = ipiNTNode === null || ipiNTNode === void 0 ? void 0 : ipiNTNode.querySelector('CST')) === null || _r === void 0 ? void 0 : _r.textContent) || '',
                    vIPI: ((_s = ipiTribNode === null || ipiTribNode === void 0 ? void 0 : ipiTribNode.querySelector('vIPI')) === null || _s === void 0 ? void 0 : _s.textContent) || '',
                    pIPI: ((_t = ipiTribNode === null || ipiTribNode === void 0 ? void 0 : ipiTribNode.querySelector('pIPI')) === null || _t === void 0 ? void 0 : _t.textContent) || '',
                },
            },
        };
    });
    console.log(`[pdfGenerator] Encontrados ${prods.length} produtos.`);
    console.log('[pdfGenerator] Extraindo dados de cobr.');
    const cobr = {
        dup: Array.from(xmlDoc.querySelectorAll('dup')).map((d) => {
            var _a, _b, _c;
            return ({
                nDup: ((_a = d.querySelector('nDup')) === null || _a === void 0 ? void 0 : _a.textContent) || '',
                dVenc: ((_b = d.querySelector('dVenc')) === null || _b === void 0 ? void 0 : _b.textContent) || '',
                vDup: ((_c = d.querySelector('vDup')) === null || _c === void 0 ? void 0 : _c.textContent) || '',
            });
        }),
    };
    console.log('[pdfGenerator] Extraindo dados de infAdic.');
    const infAdic = {
        infCpl: get('infCpl'),
        infAdFisco: get('infAdFisco'),
    };
    console.log('[pdfGenerator] Extraindo dados de protNFe.');
    const protNFe = {
        infProt: {
            chNFe: ((_6 = xmlDoc.querySelector('protNFe infProt chNFe')) === null || _6 === void 0 ? void 0 : _6.textContent) || get('chNFe'),
            nProt: ((_7 = xmlDoc.querySelector('protNFe infProt nProt')) === null || _7 === void 0 ? void 0 : _7.textContent) || '',
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
function generateBarcode(chaveDeAcesso) {
    return __awaiter(this, void 0, void 0, function* () {
        const canvas = (0, canvas_1.createCanvas)(200, 50);
        (0, jsbarcode_1.default)(canvas, chaveDeAcesso, {
            format: 'CODE128',
            displayValue: false,
            width: 2,
            height: 50,
        });
        return canvas.toDataURL('image/png');
    });
}
const generateNfeData = (xmlString) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[pdfGenerator] Iniciando generateNfeData.');
    try {
        const nfeData = parseXML(xmlString);
        console.log('[pdfGenerator] Dados do XML parseados. Gerando código de barras.');
        const chaveDeAcesso = nfeData.protNFe.infProt.chNFe;
        if (!chaveDeAcesso) {
            console.error('[pdfGenerator] Erro: Chave de Acesso não encontrada no XML.');
            throw new Error('Chave de Acesso não encontrada no XML.');
        }
        const barcodeImage = yield generateBarcode(chaveDeAcesso);
        console.log('[pdfGenerator] Código de barras gerado.');
        return Object.assign(Object.assign({}, nfeData), { chaveDeAcesso, barcodeImage });
    }
    catch (error) {
        console.error('Erro ao processar XML no pdfGenerator:', error);
        throw new Error('Falha ao processar os dados do XML.');
    }
});
exports.generateNfeData = generateNfeData;
