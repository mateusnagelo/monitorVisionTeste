import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// --- Mapeamentos e Funções Utilitárias ---
const tPagMap: { [key: string]: string } = { '01': 'Dinheiro', '02': 'Cheque', '03': 'Cartão de Crédito', '04': 'Cartão de Débito', '05': 'Crédito Loja', '15': 'Boleto Bancário', '99': 'Outros' };
const modFreteMap: { [key: string]: string } = { '0': '0-Por conta do Remetente', '1': '1-Por conta do Destinatário', '2': '2-Por conta de Terceiros', '3': '3-Transporte Próprio por conta do Remetente', '4': '4-Transporte Próprio por conta do Destinatário', '9': '9-Sem Ocorrência de Transporte' };
const formatField = (value: any) => (value ? String(value) : '');
const formatDate = (date: string) => {
    if (!date) return '';
    const datePart = date.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
};
const formatTime = (date: string) => (date ? new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '');
const formatNumber = (num: any, decimals = 2) => {
    const cleanNum = (num === null || num === undefined || num === '') ? 0 : num;
    const value = Number(cleanNum);
    if (isNaN(value)) return (0).toFixed(decimals).replace('.', ',');
    return value.toFixed(decimals).replace('.', ',');
};
const formatChave = (chave: string) => {
    if (!chave) return '';
    return chave.replace(/(\d{4})/g, '$1 ').trim();
}

// --- Estilos ---
const styles = StyleSheet.create({
    page: {
        padding: 10,
        fontFamily: 'Helvetica',
        fontSize: 6,
        backgroundColor: 'white',
        flexDirection: 'column',
    },
    mainColumn: {
        flex: 1,
        border: '1px solid black',
    },
    // Estilos Gerais
    b: { fontWeight: 'bold' },
    center: { textAlign: 'center' },
    right: { textAlign: 'right' },
    row: { flexDirection: 'row' },
    flex: { flex: 1 },
    borderTop: { borderTop: '1px solid black' },
    noBorderRight: { borderRight: 'none' },
    fs_5: { fontSize: 5 },
    fs_7: { fontSize: 7 },
    fs_8: { fontSize: 8 },
    fs_9: { fontSize: 9 },
    fs_10: { fontSize: 10 },
    fs_12: { fontSize: 12 },

    // Estrutura de Célula
    cell: {
        padding: '1 2',
        justifyContent: 'flex-start',
    },
    cellTitle: {
        fontSize: 5,
        textTransform: 'uppercase',
        marginBottom: 1,
    },
    cellContent: {
        fontWeight: 'bold',
        fontSize: 8,
    },

    // Cabeçalho
    headerContainer: {
        flexDirection: 'row',
        height: 80,
    },
    headerIdent: {
        width: '50%',
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
    headerDanfe: {
        width: '50%',
        borderLeft: '1px solid black',
        flexDirection: 'column',
    },
    danfeTitleBox: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    danfeTitle: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    danfeSubTitle: {
        fontSize: 7,
        textAlign: 'center',
        paddingBottom: 2,
        borderTop: '1px solid black',
    },
    danfeNFInfo: {
        borderTop: '1px solid black',
        padding: 2,
        textAlign: 'center',
    },
    danfeEntSaiContainer: {
        flexDirection: 'column',
        border: '1px solid black',
        marginLeft: 10,
        padding: '0 2px',
    },
    danfeEntSai: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    danfeEntSaiBox: {
        border: '1px solid black',
        width: 12,
        height: 12,
        marginLeft: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Chave de Acesso
    chaveAcessoContainer: {
        borderTop: '1px solid black',
        padding: '2 0',
        alignItems: 'center',
    },
    chaveAcessoTitle: {
        fontSize: 5,
        textTransform: 'uppercase',
        textAlign: 'left',
        width: '100%',
        paddingLeft: 2,
    },
    barcode: {
        width: 280,
        height: 30,
        marginBottom: 1,
    },
    chaveAcessoText: {
        fontWeight: 'bold',
        fontSize: 9,
        letterSpacing: 2,
    },
    consultaNFe: {
        borderTop: '1px solid black',
        padding: 1,
        textAlign: 'center',
        fontSize: 6,
    },

    // Seções
    section: {
        borderTop: '1px solid black',
    },
    sectionTitle: {
        fontSize: 5,
        textTransform: 'uppercase',
        padding: '1 2',
        backgroundColor: '#E0E0E0',
        fontWeight: 'bold',
    },

    // Tabela de Produtos
    productTable: {
        borderTop: '1px solid black',
        flexDirection: 'column',
    },
    productHeader: {
        flexDirection: 'row',
        backgroundColor: '#E0E0E0',
        fontSize: 5,
        fontWeight: 'bold',
        borderBottom: '1px solid black',
        textAlign: 'center',
    },
    productRow: {
        flexDirection: 'row',
        fontSize: 6,
        borderBottom: '1px solid #c0c0c0',
    },
    productCell: {
        padding: '1 2',
        textAlign: 'center',
        borderRight: '1px solid #c0c0c0',
    },
});

// --- Componente Célula ---
const Cell: React.FC<{ title: string; content?: string | number; style?: any; titleStyle?: any; contentStyle?: any; flex?: number; align?: 'left' | 'center' | 'right' }> =
    ({ title, content, style = {}, titleStyle = {}, contentStyle = {}, flex = 1, align = 'left' }) => (
        <View style={[{ flex, borderRight: '1px solid black', padding: '1 2', justifyContent: 'flex-start' }, style]}>
            <Text style={[styles.cellTitle, titleStyle]}>{title}</Text>
            <Text style={[styles.cellContent, { textAlign: align }, contentStyle]}>{content || ''}</Text>
        </View>
    );

// --- Componente Principal ---
const DanfeReactPDF: React.FC<{ data: any }> = ({ data }) => {
    if (!data) return <Document><Page><Text>Carregando dados...</Text></Page></Document>;

    const { ide, emit, dest, total, transp, det, cobr, infAdic, protNFe, barcodeImage, chaveDeAcesso } = data;

    const renderCanhotoFooter = () => (
        <View style={{ border: '1px solid black', padding: 2, marginTop: 5, flexDirection: 'column' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 2 }}>
                <Text style={{ fontSize: 7, fontWeight: 'bold' }}>
                    {`NF-e Nº. ${formatField(ide.nNF)} Série ${formatField(ide.serie)}`}
                </Text>
                <Text style={{ fontSize: 6, width: '70%', textAlign: 'center' }}>
                    {`RECEBEMOS DE ${formatField(emit.xNome)} OS PRODUTOS E/OU SERVIÇOS CONSTANTES DA NOTA FISCAL ELETRÔNICA INDICADA AO LADO`}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', borderTop: '1px solid black', paddingTop: 2 }}>
                <View style={{ flex: 1.5, paddingRight: 2 }}>
                    <Text style={styles.cellTitle}>DATA DE RECEBIMENTO</Text>
                    <View style={{ height: 15 }} />
                </View>
                <View style={{ flex: 3, borderLeft: '1px solid black', paddingLeft: 2 }}>
                    <Text style={styles.cellTitle}>IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR</Text>
                    <View style={{ height: 15 }} />
                </View>
            </View>
        </View>
    );

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.mainColumn}>
                    {/* Cabeçalho */}
                    <View style={styles.headerContainer}>
                        <View style={styles.headerIdent}>
                            <Text style={[styles.b, styles.fs_12]}>{formatField(emit.xNome)}</Text>
                            <Text style={styles.fs_8}>{`${formatField(emit.enderEmit.xLgr)}, ${formatField(emit.enderEmit.nro)}`}</Text>
                            <Text style={styles.fs_8}>{`${formatField(emit.enderEmit.xBairro)} - ${formatField(emit.enderEmit.xMun)}/${formatField(emit.enderEmit.UF)}`}</Text>
                            <Text style={styles.fs_8}>{`Fone/Fax: ${formatField(emit.enderEmit.fone)}`}</Text>
                        </View>
                        <View style={styles.headerDanfe}>
                            <View style={styles.danfeTitleBox}>
                                <Text style={styles.danfeTitle}>DANFE</Text>
                                <View style={styles.danfeEntSaiContainer}>
                                    <View style={styles.danfeEntSai}>
                                        <Text style={styles.fs_5}>0-ENTRADA</Text>
                                        <View style={styles.danfeEntSaiBox}><Text style={styles.fs_8}>{ide.tpNF === '0' ? 'X' : ''}</Text></View>
                                    </View>
                                    <View style={styles.danfeEntSai}>
                                        <Text style={styles.fs_5}>1-SAÍDA</Text>
                                        <View style={styles.danfeEntSaiBox}><Text style={styles.fs_8}>{ide.tpNF === '1' ? 'X' : ''}</Text></View>
                                    </View>
                                </View>
                            </View>
                            <Text style={styles.danfeSubTitle}>Documento Auxiliar da Nota Fiscal Eletrônica</Text>
                            <View style={styles.danfeNFInfo}>
                                <Text style={styles.b}>{`Nº. ${formatField(ide.nNF)}`}</Text>
                                <Text>{`Série ${formatField(ide.serie)}`}</Text>
                                <Text>{`Folha 1/1`}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Chave de Acesso */}
                    <View>
                        <View style={styles.chaveAcessoContainer}>
                            <Text style={styles.chaveAcessoTitle}>CHAVE DE ACESSO</Text>
                            {barcodeImage && <Image src={barcodeImage} style={styles.barcode} />}
                            <Text style={styles.chaveAcessoText}>{formatChave(chaveDeAcesso)}</Text>
                        </View>
                        <View style={styles.consultaNFe}>
                            <Text>Consulta de autenticidade no portal nacional da NF-e</Text>
                            <Text>www.nfe.fazenda.gov.br/portal ou no site da Sefaz Autorizadora</Text>
                        </View>
                    </View>

                    {/* Natureza e Protocolo */}
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <Cell title="NATUREZA DA OPERAÇÃO" content={formatField(ide.natOp)} flex={5} />
                            <Cell title="PROTOCOLO DE AUTORIZAÇÃO DE USO" content={protNFe?.infProt?.nProt} flex={3} style={styles.noBorderRight} />
                        </View>
                    </View>
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <Cell title="INSCRIÇÃO ESTADUAL" content={formatField(emit.IE)} flex={2} />
                            <Cell title="INSCRIÇÃO ESTADUAL DO SUBST. TRIBUT." content={formatField(emit.IEST)} flex={2} />
                            <Cell title="CNPJ / CPF" content={formatField(emit.CNPJ)} flex={3} style={styles.noBorderRight} />
                        </View>
                    </View>

                    {/* Destinatário */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, {backgroundColor: 'white', fontWeight:'normal'}]}>DESTINATÁRIO / REMETENTE</Text>
                        <View style={[styles.row, styles.borderTop]}>
                            <Cell title="NOME / RAZÃO SOCIAL" content={formatField(dest.xNome)} flex={5} />
                            <Cell title="CNPJ / CPF" content={formatField(dest.CNPJ)} flex={2} />
                            <Cell title="DATA DA EMISSÃO" content={formatDate(ide.dhEmi)} flex={1.5} align="center" style={styles.noBorderRight} />
                        </View>
                        <View style={[styles.row, styles.borderTop]}>
                            <Cell title="ENDEREÇO" content={`${formatField(dest.enderDest.xLgr)}, ${formatField(dest.enderDest.nro)}`} flex={4} />
                            <Cell title="BAIRRO / DISTRITO" content={formatField(dest.enderDest.xBairro)} flex={2} />
                            <Cell title="CEP" content={formatField(dest.enderDest.CEP)} flex={1.5} align="center" style={styles.noBorderRight} />
                        </View>
                        <View style={[styles.row, styles.borderTop]}>
                            <Cell title="MUNICÍPIO" content={formatField(dest.enderDest.xMun)} flex={3} />
                            <Cell title="UF" content={formatField(dest.enderDest.UF)} flex={0.5} align="center" />
                            <Cell title="FONE / FAX" content={formatField(dest.enderDest.fone)} flex={1.5} align="center" />
                            <Cell title="INSCRIÇÃO ESTADUAL" content={formatField(dest.IE)} flex={2} />
                            <Cell title="DATA DA SAÍDA/ENTRADA" content={formatDate(ide.dhSaiEnt)} flex={1.5} align="center" />
                            <Cell title="HORA DA SAÍDA/ENTRADA" content={formatTime(ide.dhSaiEnt)} flex={1} align="center" style={styles.noBorderRight} />
                        </View>
                    </View>

                    {/* Faturas */}
                    {cobr && cobr.dup && cobr.dup.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, {backgroundColor: 'white', fontWeight:'normal'}]}>FATURA / DUPLICATA</Text>
                            <View style={[styles.row, styles.borderTop, styles.fs_7, { padding: 1 }]}>
                                {cobr.dup.map((dup: any, i: number) => (
                                    <Text key={i} style={{ flex: 1, textAlign: 'center' }}>
                                        {`Num. ${formatField(dup.nDup)} Venc. ${formatDate(dup.dVenc)} Valor R$ ${formatNumber(dup.vDup)}`}
                                    </Text>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Cálculo do Imposto */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, {backgroundColor: 'white', fontWeight:'normal'}]}>CÁLCULO DO IMPOSTO</Text>
                        <View style={[styles.row, styles.borderTop]}>
                            <Cell title="BASE DE CÁLC. DO ICMS" content={formatNumber(total.ICMSTot.vBC)} align="right" />
                            <Cell title="VALOR DO ICMS" content={formatNumber(total.ICMSTot.vICMS)} align="right" />
                            <Cell title="BASE DE CÁLC. ICMS S.T." content={formatNumber(total.ICMSTot.vBCST)} align="right" />
                            <Cell title="VALOR DO ICMS SUBST." content={formatNumber(total.ICMSTot.vST)} align="right" />
                            <Cell title="V. IMP. IMPORTAÇÃO" content={formatNumber(total.ICMSTot.vII)} align="right" />
                            <Cell title="V. ICMS UF REMET." content={formatNumber(total.ICMSTot.vICMSUFRemet)} align="right" />
                            <Cell title="V. FCP UF DEST." content={formatNumber(total.ICMSTot.vFCPUFDest)} align="right" />
                            <Cell title="V. TOTAL PRODUTOS" content={formatNumber(total.ICMSTot.vProd)} align="right" style={styles.noBorderRight} />
                        </View>
                        <View style={[styles.row, styles.borderTop]}>
                            <Cell title="VALOR DO FRETE" content={formatNumber(total.ICMSTot.vFrete)} align="right" />
                            <Cell title="VALOR DO SEGURO" content={formatNumber(total.ICMSTot.vSeg)} align="right" />
                            <Cell title="DESCONTO" content={formatNumber(total.ICMSTot.vDesc)} align="right" />
                            <Cell title="OUTRAS DESPESAS" content={formatNumber(total.ICMSTot.vOutro)} align="right" />
                            <Cell title="VALOR TOTAL IPI" content={formatNumber(total.ICMSTot.vIPI)} align="right" />
                            <Cell title="V. ICMS UF DEST." content={formatNumber(total.ICMSTot.vICMSUFDest)} align="right" />
                            <Cell title="V. TOT. TRIB." content={formatNumber(total.ICMSTot.vTotTrib)} align="right" />
                            <Cell title="V. TOTAL DA NOTA" content={formatNumber(total.ICMSTot.vNF)} align="right" style={styles.noBorderRight} />
                        </View>
                    </View>

                    {/* Transportador */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, {backgroundColor: 'white', fontWeight:'normal'}]}>TRANSPORTADOR / VOLUMES TRANSPORTADOS</Text>
                        <View style={[styles.row, styles.borderTop]}>
                            <Cell title="NOME / RAZÃO SOCIAL" content={formatField(transp.transporta?.xNome)} flex={2.5} />
                            <Cell title="FRETE POR CONTA" content={modFreteMap[formatField(transp.modFrete)] || ''} flex={1.5} align="center" />
                            <Cell title="CÓDIGO ANTT" content={formatField(transp.veicTransp?.RNTRC)} flex={1} align="center" />
                            <Cell title="PLACA DO VEÍCULO" content={formatField(transp.veicTransp?.placa)} flex={1} align="center" />
                            <Cell title="UF" content={formatField(transp.veicTransp?.UF)} flex={0.5} align="center" />
                            <Cell title="CNPJ / CPF" content={formatField(transp.transporta?.CNPJ)} flex={1.5} align="center" style={styles.noBorderRight} />
                        </View>
                        <View style={[styles.row, styles.borderTop]}>
                            <Cell title="ENDEREÇO" content={formatField(transp.transporta?.xEnder)} flex={3} />
                            <Cell title="MUNICÍPIO" content={formatField(transp.transporta?.xMun)} flex={1.5} />
                            <Cell title="UF" content={formatField(transp.transporta?.UF)} flex={0.5} align="center" />
                            <Cell title="INSCRIÇÃO ESTADUAL" content={formatField(transp.transporta?.IE)} flex={1.5} style={styles.noBorderRight} />
                        </View>
                        {transp.vol && transp.vol[0] &&
                            <View style={[styles.row, styles.borderTop]}>
                                <Cell title="QUANTIDADE" content={formatField(transp.vol[0].qVol)} flex={1} align="center" />
                                <Cell title="ESPÉCIE" content={formatField(transp.vol[0].esp)} flex={1} />
                                <Cell title="MARCA" content={formatField(transp.vol[0].marca)} flex={1} />
                                <Cell title="NUMERAÇÃO" content={formatField(transp.vol[0].nVol)} flex={1} />
                                <Cell title="PESO BRUTO" content={formatNumber(transp.vol[0].pesoB, 3)} flex={1} align="right" />
                                <Cell title="PESO LÍQUIDO" content={formatNumber(transp.vol[0].pesoL, 3)} flex={1} align="right" style={styles.noBorderRight} />
                            </View>
                        }
                    </View>

                    {/* Produtos */}
                    <View style={styles.productTable} wrap={false}>
                        <Text style={[styles.sectionTitle, styles.center, {backgroundColor: 'white', fontWeight:'normal'}]}>DADOS DOS PRODUTOS / SERVIÇOS</Text>
                        <View style={[styles.productHeader, {backgroundColor: 'white'}]}>
                            <Text style={[styles.productCell, { width: '8%', textAlign:'left' }]}>CÓDIGO</Text>
                            <Text style={[styles.productCell, { width: '26%', textAlign: 'left' }]}>DESCRIÇÃO DO PRODUTO / SERVIÇO</Text>
                            <Text style={[styles.productCell, { width: '7%' }]}>NCM/SH</Text>
                            <Text style={[styles.productCell, { width: '5%' }]}>CST</Text>
                            <Text style={[styles.productCell, { width: '5%' }]}>CFOP</Text>
                            <Text style={[styles.productCell, { width: '4%' }]}>UN</Text>
                            <Text style={[styles.productCell, { width: '7%', textAlign: 'right' }]}>QUANT.</Text>
                            <Text style={[styles.productCell, { width: '7%', textAlign: 'right' }]}>V. UNIT</Text>
                            <Text style={[styles.productCell, { width: '7%', textAlign: 'right' }]}>V. TOTAL</Text>
                            <Text style={[styles.productCell, { width: '6%', textAlign: 'right' }]}>B.CÁLC. ICMS</Text>
                            <Text style={[styles.productCell, { width: '6%', textAlign: 'right' }]}>V. ICMS</Text>
                            <Text style={[styles.productCell, { width: '5%', textAlign: 'right' }]}>V. IPI</Text>
                            <Text style={[styles.productCell, { width: '4%', textAlign: 'right' }]}>%ICMS</Text>
                            <Text style={[styles.productCell, { width: '3%', textAlign: 'right', borderRight: 'none' }]}>%IPI</Text>
                        </View>
                        {det.map((p: any, i: number) => (
                            <View key={i} style={styles.productRow}>
                                <Text style={[styles.productCell, { width: '8%', textAlign:'left' }]}>{formatField(p.prod.cProd)}</Text>
                                <Text style={[styles.productCell, { width: '26%', textAlign: 'left', fontSize: 5 }]}>{formatField(p.prod.xProd)}</Text>
                                <Text style={[styles.productCell, { width: '7%' }]}>{formatField(p.prod.NCM)}</Text>
                                <Text style={[styles.productCell, { width: '5%' }]}>{`${formatField(p.imposto.ICMS.orig)}${formatField(p.imposto.ICMS.CST || p.imposto.ICMS.CSOSN)}`}</Text>
                                <Text style={[styles.productCell, { width: '5%' }]}>{formatField(p.prod.CFOP)}</Text>
                                <Text style={[styles.productCell, { width: '4%' }]}>{formatField(p.prod.uCom)}</Text>
                                <Text style={[styles.productCell, { width: '7%', textAlign: 'right' }]}>{formatNumber(p.prod.qCom, 4)}</Text>
                                <Text style={[styles.productCell, { width: '7%', textAlign: 'right' }]}>{formatNumber(p.prod.vUnCom, 4)}</Text>
                                <Text style={[styles.productCell, { width: '7%', textAlign: 'right' }]}>{formatNumber(p.prod.vProd)}</Text>
                                <Text style={[styles.productCell, { width: '6%', textAlign: 'right' }]}>{formatNumber(p.imposto.ICMS.vBC)}</Text>
                                <Text style={[styles.productCell, { width: '6%', textAlign: 'right' }]}>{formatNumber(p.imposto.ICMS.vICMS)}</Text>
                                <Text style={[styles.productCell, { width: '5%', textAlign: 'right' }]}>{formatNumber(p.imposto.IPI?.vIPI)}</Text>
                                <Text style={[styles.productCell, { width: '4%', textAlign: 'right' }]}>{formatNumber(p.imposto.ICMS.pICMS, 0)}</Text>
                                <Text style={[styles.productCell, { width: '3%', textAlign: 'right', borderRight: 'none' }]}>{formatNumber(p.imposto.IPI?.pIPI, 0)}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Dados Adicionais */}
                    <View style={styles.section} wrap={false}>
                        <Text style={[styles.sectionTitle, {backgroundColor: 'white', fontWeight:'normal'}]}>DADOS ADICIONAIS</Text>
                        <View style={[styles.row, styles.borderTop]}>
                            <View style={{ flex: 3, borderRight: '1px solid black', padding: 2, minHeight: 80 }}>
                                <Text style={styles.cellTitle}>INFORMAÇÕES COMPLEMENTARES</Text>
                                <Text style={styles.fs_5}>{formatField(infAdic.infCpl)}</Text>
                            </View>
                            <View style={{ flex: 2, padding: 2, minHeight: 80 }}>
                                <Text style={styles.cellTitle}>RESERVADO AO FISCO</Text>
                                <Text style={styles.fs_7}>{formatField(infAdic.infAdFisco)}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                {renderCanhotoFooter()}
            </Page>
        </Document>
    );
};

export default DanfeReactPDF;