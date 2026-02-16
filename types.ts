

export type RiskLevel = 'Verde' | 'Amarelo' | 'Vermelho';

export type UserRole = 'Gestor' | 'Usuario';

export interface User {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  allowed: boolean;
  area?: string;
  requiresPasswordChange?: boolean;
}

export interface DropdownOption {
  value: string;
  label: string;
}

export interface TankItem {
  tipo: string;
  quantidade: number;
  idade: number;
}

export interface AddressData {
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface ThirdPartyItem {
  nome: string;
  atividade: string;
  prazo: string;
}

export interface CoOwnerItem {
  nome: string;
  cpfCnpj: string;
  percentual: number;
}

export interface UploadedFile {
  name: string;
  url: string;
  supabaseKey?: string;
  s3Key?: string;
  type: string;
}

export interface DueDiligenceItem {
  id: string;
  category: string;
  description: string;
  isCritical: boolean;
  peso: number; // Peso do item no cálculo de risco (0-5)
  status: 'Pendente' | 'Recebido' | 'Não Aplicável';
  dateReceived?: string;
  validity?: string;
  observation?: string;
  fileName?: string;
  fileUrl?: string;
  fileKey?: string;
}

export interface RiskScore {
  total: number;
  level: RiskLevel;
  breakdown: {
    dominial: number;
    ambiental: number;
    regulatorio: number;
    economico: number;
  };
  triggers: string[];
}

// Based on "Premissas da Negociação" PDF
export interface NegotiationData {
  // 1. Identificação
  numeroProjeto?: string; // New field for Control Panel
  nomeProjeto: string;
  dataPrevista: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
  responsavelComercial: string;
  responsavelComercialEmail?: string;

  // 2. Localização e Características
  cep?: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  areaTerreno?: number;
  areaConstruida?: number;
  tipoArea: 'Urbano' | 'Rodovia' | 'Misto';
  detalhesRodovia?: string;
  zoneamento?: string;
  emOperacao: boolean;
  volumeMensal?: number; // Litros
  atividadesAdicionais?: string;

  // 3. Proprietário (Qualification)
  proprietarioNome: string; // Nome ou Razão Social
  proprietarioCpfCnpj: string;
  proprietarioEndereco: AddressData; // Changed to structured address
  proprietarioInscricaoEstadual?: string;
  proprietarioInscricaoMunicipal?: string;
  proprietarioTelefone?: string;
  proprietarioEmail?: string;
  tipoPessoa: 'Física' | 'Jurídica';

  // Representatives (Proprietário)
  proprietarioRepresentanteNome: string;
  proprietarioRepresentanteCpf: string;
  proprietarioRepresentanteRg?: string;
  proprietarioRepresentanteCargo: string;

  // Powers & Governance (Proprietário)
  proprietarioInstrumentoPoderes: 'Contrato Social' | 'Procuração' | 'Ata' | 'Outro';
  proprietarioDataInstrumento?: string;

  // Ownership Structure (Proprietário)
  proprietarioTemCoproprietarios: boolean;
  proprietarioCoproprietarios: CoOwnerItem[];
  proprietarioTemUsufructuario: boolean;
  proprietarioTemEspolio: boolean;
  proprietarioAnuenciaIntervenientes: 'Sim' | 'Não' | 'Em negociação';

  // 4. Locatário (Grupo)
  locatarioRazaoSocial: string;
  locatarioCnpj: string;
  locatarioEndereco: AddressData; // Changed to structured address
  locatarioRepresentanteNome: string;
  locatarioRepresentanteCpf: string;
  locatarioRepresentanteCargo: string;

  // 5. Garantias e Fiador (Detailed)
  exigeGarantidor: boolean;
  tipoGarantia: 'Caução em dinheiro' | 'Seguro fiança' | 'Fiança pessoa física' | 'Fiança pessoa jurídica' | 'Fiança bancária' | 'Cessão fiduciária de recebíveis' | 'Sem garantia';

  // Caução
  garantiaCaucaoValor?: number;
  garantiaCaucaoConta?: string;

  // Fiança (PF/PJ/Bancária)
  garantiaFiadorNome?: string;
  garantiaFiadorCpfCnpj?: string;
  garantiaFiadorEndereco: AddressData; // Changed to structured address
  garantiaFiadorEstadoCivil?: string;
  garantiaFiadorPatrimonio?: string;
  garantiaFiadorRenunciaBeneficio?: boolean;

  // Seguro Fiança
  garantiaSeguroSeguradora?: string;
  garantiaSeguroValor?: number;

  // 6. Estrutura Contratual
  modeloContrato: 'Locação típica (Lei 8.245/91)' | 'Built to suit (art. 54-A)' | 'Locação atípica' | 'Contrato híbrido' | 'Arrendamento (fundo de comércio)' | 'Locação + opção de compra' | 'Sale and leaseback';
  justificativaModelo: string;
  intencaoCompra: boolean;
  prazoExercicioOpcao?: string;
  criterioPrecoOpcao?: string;
  direitoPreferenciaReforcado: boolean;
  cessaoIntraGrupo: boolean;
  empresasEnvolvidasCessao?: string[];

  // 7. Condições Econômicas
  modeloAluguel: 'Fixo' | 'Fixo + variável' | 'Variável' | 'Fixo com mínimo + variável';
  valorAluguelFixo: number;
  aluguelVariavelCriterio?: string;

  aluguelMinimoGarantido: boolean;
  valorAluguelMinimo?: number;

  indexadorReajuste: 'IPCA' | 'IGP-M' | 'Outro';
  dataBaseReajuste: string;

  temCarencia: boolean;
  carenciaMeses: number;
  tipoCarencia?: 'Total' | 'Parcial';

  temPagamentoInicial: boolean;
  valorPagamentoInicial?: number;
  dataPagamentoInicial?: string;
  condicoesPagamentoInicial?: string;

  responsavelIptu: 'Locador' | 'Locatário';
  responsavelSeguro: 'Locador' | 'Locatário';
  responsavelRegistro: 'Locador' | 'Locatário' | '50-50';

  // 8. Investimentos e Benfeitorias
  capexEstimado: number;
  itensPrincipaisCapex?: string;
  prazoObrasDias?: number;
  responsavelObras?: 'Grupo' | 'Proprietário' | 'Misto';
  autorizacaoObras?: boolean;
  tratamentoInvestimentoSaida?: 'Amortização' | 'Indenização' | 'Multa';
  formulaAmortizacao?: string;
  destinoBenfeitorias?: 'Todas' | 'Parcial' | 'Nenhuma';
  listaBenfeitoriasRemoviveis?: string;
  proprietarioParticipaInvestimento?: boolean;
  valorInvestimentoProprietario?: number;

  // 9. Operação, Bandeira e Distribuidora
  tipoBandeira: 'Bandeirado' | 'Branca' | 'A definir';
  distribuidoraPretendida?: string;
  temContratoVigenteDistribuidora: boolean;
  distribuidoraAtual?: string;
  prazoRemanescenteContrato?: number;
  multaSaldoGalonagem?: string;
  temObrigacaoGalonagemMinima: boolean;
  volumeGalonagemMensal?: number;
  distribuidoraPermiteCessao: 'Sim' | 'Não' | 'A negociar';
  temTerceirosExplorando: boolean;
  terceiros?: ThirdPartyItem[]; // Changed to structured list

  // 10. Licenças e Regulatório
  alvaraMunicipalAtivo: 'Sim' | 'Não' | 'Em renovação';
  validadeAlvara?: string;
  avcbValido: 'Sim' | 'Não' | 'Em renovação';
  validadeAvcb?: string;
  situacaoAnp: 'Regular' | 'Irregular' | 'Pendências';
  detalhePendenciasAnp?: string;
  licencaAmbientalValida: boolean;
  tipoLicencaAmbiental?: 'LO' | 'LP' | 'LI';
  validadeLicencaAmbiental?: string;
  condicionantesLicencaAmbiental?: string;

  // 11. Ambiental e Passivos
  historicoContaminacao: 'Sim' | 'Não' | 'Desconhecido';
  resumoContaminacao?: string;
  temLaudosEstanqueidade: boolean;
  laudoData?: string; // Split field
  laudoResultado?: string; // Split field
  tanques: TankItem[];
  seguroAmbiental: boolean;
  responsabilidadePassivo: string;
  clausulaIndenizacao: boolean;

  // 12. Prazo e Saída
  prazoContratualMeses: number;
  renovacaoAutomatica: boolean;
  prazoRenovacaoMeses?: number;
  condicoesRenovacao?: string;
  regraRescisaoImotivada: 'Permitida' | 'Somente por motivo';
  avisoPrevioDias?: number;
  multaRescisao: string;
  formulaMulta?: string;
  toleranciaRiscoSaida: 'Baixa' | 'Média' | 'Alta';

  // 13. Não Concorrência e Exclusividade
  clauseNaoConcorrencia: boolean;
  raioNaoConcorrencia?: string;
  prazoNaoConcorrenciaMeses?: number;
  exclusividadeUsoImovel: boolean;
  outrasRestricoesUso?: string;

  // 14. Disposições Jurídicas
  foroEleicao: string;
  exigenciaConfidencialidade: boolean;
  prazoConfidencialidadeMeses?: number;
  clausulaArbitral: boolean;
  camaraArbitragem?: string;
  prazoValidadeTermSheetDias?: number;

  // 15. Observações e Anexos
  pontosInegociaveisProprietario?: string;
  pontosInegociaveisGrupo?: string;
  documentos?: UploadedFile[];
  resumoFinalNegociacao: string;
}

const emptyAddress: AddressData = {
  cep: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  uf: ''
};

export const INITIAL_DATA: NegotiationData = {
  numeroProjeto: '001/2025',
  nomeProjeto: '',
  dataPrevista: '',
  prioridade: 'Média',
  responsavelComercial: '',
  responsavelComercialEmail: '',
  cep: '',
  endereco: '',
  numero: '',
  bairro: '',
  cidade: '',
  uf: '',
  areaTerreno: 0,
  areaConstruida: 0,
  tipoArea: 'Urbano',
  zoneamento: '',
  emOperacao: false,
  atividadesAdicionais: '',

  // Owner
  proprietarioNome: '',
  proprietarioCpfCnpj: '',
  proprietarioEndereco: { ...emptyAddress },
  proprietarioTelefone: '',
  proprietarioEmail: '',
  tipoPessoa: 'Jurídica',
  proprietarioRepresentanteNome: '',
  proprietarioRepresentanteCpf: '',
  proprietarioRepresentanteCargo: '',
  proprietarioInstrumentoPoderes: 'Contrato Social',
  proprietarioTemCoproprietarios: false,
  proprietarioCoproprietarios: [],
  proprietarioTemUsufructuario: false,
  proprietarioTemEspolio: false,
  proprietarioAnuenciaIntervenientes: 'Em negociação',

  // Locatário
  locatarioRazaoSocial: '',
  locatarioCnpj: '',
  locatarioEndereco: { ...emptyAddress },
  locatarioRepresentanteNome: '',
  locatarioRepresentanteCpf: '',
  locatarioRepresentanteCargo: '',

  // Garantias
  exigeGarantidor: false,
  tipoGarantia: 'Sem garantia',
  garantiaFiadorRenunciaBeneficio: false,
  garantiaFiadorEndereco: { ...emptyAddress },

  modeloContrato: 'Locação típica (Lei 8.245/91)',
  justificativaModelo: '',
  intencaoCompra: false,
  direitoPreferenciaReforcado: false,
  cessaoIntraGrupo: false,
  empresasEnvolvidasCessao: [],

  // Economic defaults
  modeloAluguel: 'Fixo',
  valorAluguelFixo: 0,
  aluguelMinimoGarantido: false,
  indexadorReajuste: 'IPCA',
  dataBaseReajuste: '',
  temCarencia: false,
  carenciaMeses: 0,
  temPagamentoInicial: false,
  responsavelIptu: 'Locatário',
  responsavelSeguro: 'Locatário',
  responsavelRegistro: 'Locatário',

  // Investimentos
  capexEstimado: 0,
  prazoObrasDias: 0,
  responsavelObras: 'Grupo',
  autorizacaoObras: false,
  tratamentoInvestimentoSaida: 'Amortização',
  destinoBenfeitorias: 'Todas',
  proprietarioParticipaInvestimento: false,

  // Operação defaults
  tipoBandeira: 'Branca',
  temContratoVigenteDistribuidora: false,
  temObrigacaoGalonagemMinima: false,
  distribuidoraPermiteCessao: 'A negociar',
  temTerceirosExplorando: false,
  terceiros: [],

  // Licenças e Regulatório defaults
  alvaraMunicipalAtivo: 'Sim',
  avcbValido: 'Sim',
  situacaoAnp: 'Regular',
  licencaAmbientalValida: false,

  // Ambiental defaults
  historicoContaminacao: 'Desconhecido',
  temLaudosEstanqueidade: false,
  seguroAmbiental: false,
  responsabilidadePassivo: '',
  clausulaIndenizacao: false,
  tanques: [],

  // Prazo defaults
  prazoContratualMeses: 60,
  renovacaoAutomatica: false,
  regraRescisaoImotivada: 'Somente por motivo',
  multaRescisao: '',
  toleranciaRiscoSaida: 'Média',

  // Section 13 defaults
  clauseNaoConcorrencia: false,
  exclusividadeUsoImovel: false,

  // Section 14 defaults
  foroEleicao: '',
  exigenciaConfidencialidade: false,
  clausulaArbitral: false,

  // Section 15 defaults
  pontosInegociaveisProprietario: '',
  pontosInegociaveisGrupo: '',
  documentos: [],
  resumoFinalNegociacao: '',
};