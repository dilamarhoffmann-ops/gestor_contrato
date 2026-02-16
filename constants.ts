
import { DueDiligenceItem, User } from './types';

export const INITIAL_USERS: User[] = [
  { name: 'Dilamar Hoffmann', email: 'dilamar.hoffmann@empresa.com', role: 'Gestor', allowed: true, area: 'Diretoria', password: '123' },
  { name: 'Dilamar Hoffmann', email: 'dilamar.hoffmann@redesaoroque.com.br', role: 'Gestor', allowed: true, area: 'Diretoria', password: '92189713' },
  { name: 'Gestor Teste', email: 'gestor@teste.com', role: 'Gestor', allowed: true, area: 'TI', password: '123' },
  { name: 'Usuário Teste', email: 'usuario@teste.com', role: 'Usuario', allowed: true, area: 'Comercial', password: '123' },
];

// From "Listas de Validação (Dropdowns).pdf"
export const LISTS = {
  sim_nao: ['Sim', 'Não'],
  prioridade: ['Alta', 'Média', 'Baixa'],
  tipo_area: ['Urbano', 'Rodovia', 'Misto'],
  modelo_contrato: [
    'Locação típica (Lei 8.245/91)',
    'Built to suit (art. 54-A)',
    'Locação atípica',
    'Contrato híbrido',
    'Arrendamento (fundo de comércio)',
    'Locação + opção de compra',
    'Sale and leaseback'
  ],
  modelo_aluguel: [
    'Fixo',
    'Fixo + variável',
    'Variável',
    'Fixo com mínimo + variável'
  ],
  tipo_garantia: [
    'Caução em dinheiro',
    'Seguro fiança',
    'Fiança pessoa física',
    'Fiança pessoa jurídica',
    'Fiança bancária',
    'Cessão fiduciária de recebíveis',
    'Sem garantia'
  ],
  bandeira: [
    'Bandeira branca',
    'BR',
    'Ipiranga',
    'Shell',
    'Raízen',
    'Vibra',
    'Outra',
    'A definir'
  ],
  uf: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'],
  indexador: ['IPCA', 'IGP-M', 'Outro'],
  tipo_carencia: ['Total', 'Parcial'],
  responsavel_custos: ['Locador', 'Locatário'],
  responsavel_registro: ['Locador', 'Locatário', '50-50'],

  // New lists
  instrumento_poderes: ['Contrato Social', 'Procuração', 'Ata', 'Outro'],
  anuencia_status: ['Sim', 'Não', 'Em negociação'],

  // Section 8
  responsavel_obras: ['Grupo', 'Proprietário', 'Misto'],
  tratamento_investimento: ['Amortização', 'Indenização', 'Multa'],
  destino_benfeitorias: ['Todas', 'Parcial', 'Nenhuma'],

  // Section 9
  tipo_bandeira: ['Bandeirado', 'Branca', 'A definir'],
  distribuidoras: [
    'BR',
    'Ipiranga',
    'Shell',
    'Ale',
    'Outra'
  ],
  distribuidora_cessao: ['Sim', 'Não', 'A negociar'],

  // Section 10
  status_regularidade: ['Sim', 'Não', 'Em renovação'],
  situacao_anp: ['Regular', 'Irregular', 'Pendências'],
  tipo_licenca_ambiental: [
    'LO - Licença de Operação',
    'LP - Licença Prévia',
    'LI - Licença de Instalação',
    'Em renovação',
    'Vencida'
  ],

  // Section 11
  historico_contaminacao: ['Sim', 'Não', 'Desconhecido'],
  tipos_combustivel: [
    'Diesel S-10',
    'Diesel S-500',
    'Etanol Comum',
    'Etanol Aditivado',
    'Gasolina Comum',
    'Gasolina Aditivada'
  ],
  resultado_laudo: [
    'Aprovado',
    'Reprovado',
    'Com ressalvas'
  ],

  // Section 12
  regra_rescisao: ['Permitida', 'Somente por motivo'],
  tolerancia_risco: ['Baixa', 'Média', 'Alta'],

  // Dates
  meses_ano: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
};

// From "Score de Risco. Semáforo.pdf"
export const RISK_PARAMS = {
  capexAlto: 1000000,
  prazoCurto: 60,
  carenciaMinimaCapexAlto: 3,
  semaforoVerdeAte: 25,
  semaforoAmareloAte: 50
};

// Lista de campos obrigatórios (marcados com * no formulário)
// Usada para cálculo de completude obrigatória
export const REQUIRED_FIELDS: (keyof import('./types').NegotiationData)[] = [
  // Seção 1: Premissas
  'nomeProjeto',
  'dataPrevista',
  'responsavelComercial',
  'capexEstimado',
  'prazoContratualMeses',
  'carenciaMeses',

  // Seção 2: Proprietário
  'proprietarioCpfCnpj',
  'proprietarioNome',

  // Seção 3: Imóvel
  'endereco', // Changed from enderecoCompleto
  'tipoArea',

  // Seção 4: Modelo Contratual
  'modeloContrato',
  'modeloAluguel',

  // Seção 5: Valores
  'valorAluguelFixo', // Changed from aluguelMensal

  // Seção 6: Garantias
  'tipoGarantia',

  // Seção 7: Reajuste
  'indexadorReajuste', // Changed from indexador

  // Seção 8: Obras
  'responsavelObras',

  // Seção 9: Distribuidora
  'tipoBandeira', // Changed from bandeiraPretendida

  // Seção 10: Regularidade
  'alvaraMunicipalAtivo', // Changed from possuiAlvara
  'situacaoAnp',

  // Seção 11: Ambiental
  'licencaAmbientalValida', // Changed from possuiLicencaAmbiental
  'historicoContaminacao',

  // Seção 12: Rescisão
  'regraRescisaoImotivada' // Changed from regraRescisao
];

// Complete Checklist based on uploaded file
export const INITIAL_DUE_DILIGENCE: DueDiligenceItem[] = [
  { id: 'dd-01', description: 'Alvará de funcionamento municipal', category: 'REGULATÓRIO', isCritical: true, peso: 5, status: 'Pendente' },
  { id: 'dd-02', description: 'Autorizações especiais (se aplicável)', category: 'REGULATÓRIO', isCritical: false, peso: 2, status: 'Pendente' },
  { id: 'dd-03', description: 'AVCB - Auto de Vistoria do Corpo de Bombeiros', category: 'REGULATÓRIO', isCritical: true, peso: 5, status: 'Pendente' },
  { id: 'dd-04', description: 'Cadastro ANP - situação regular', category: 'REGULATÓRIO', isCritical: true, peso: 5, status: 'Pendente' },
  { id: 'dd-05', description: 'Certidão de ações reipersecutórias', category: 'IMÓVEL', isCritical: true, peso: 4, status: 'Pendente' },
  { id: 'dd-06', description: 'Certidão de ações trabalhistas', category: 'PROPRIETÁRIO', isCritical: true, peso: 3, status: 'Pendente' },
  { id: 'dd-07', description: 'Certidão de casamento (se PF)', category: 'FIADOR', isCritical: true, peso: 3, status: 'Pendente' },
  { id: 'dd-08', description: 'Certidão de distribuição cível - Justiça Estadual', category: 'PROPRIETÁRIO', isCritical: true, peso: 4, status: 'Pendente' },
  { id: 'dd-09', description: 'Certidão de distribuição cível - Justiça Federal', category: 'PROPRIETÁRIO', isCritical: true, peso: 4, status: 'Pendente' },
  { id: 'dd-10', description: 'Certidão de execuções fiscais - Estadual', category: 'PROPRIETÁRIO', isCritical: false, peso: 2, status: 'Pendente' },
  { id: 'dd-11', description: 'Certidão de execuções fiscais - Federal', category: 'PROPRIETÁRIO', isCritical: true, peso: 4, status: 'Pendente' },
  { id: 'dd-12', description: 'Certidão de execuções fiscais - Municipal', category: 'PROPRIETÁRIO', isCritical: false, peso: 2, status: 'Pendente' },
  { id: 'dd-13', description: 'Certidão de falência e recuperação judicial', category: 'PROPRIETÁRIO', isCritical: true, peso: 5, status: 'Pendente' },
  { id: 'dd-14', description: 'Certidão de ônus reais', category: 'IMÓVEL', isCritical: true, peso: 5, status: 'Pendente' },
  { id: 'dd-15', description: 'Certidão de protesto', category: 'PROPRIETÁRIO', isCritical: false, peso: 2, status: 'Pendente' },
  { id: 'dd-16', description: 'Certidão de zoneamento/uso do solo', category: 'IMÓVEL', isCritical: true, peso: 4, status: 'Pendente' },
  { id: 'dd-17', description: 'Certidão negativa de débitos ambientais', category: 'AMBIENTAL', isCritical: false, peso: 2, status: 'Pendente' },
  { id: 'dd-18', description: 'Certidão negativa de débitos de IPTU', category: 'FISCAL IMÓVEL', isCritical: true, peso: 3, status: 'Pendente' },
  { id: 'dd-19', description: 'Certidão negativa de IPTU e taxas municipais', category: 'IMÓVEL', isCritical: true, peso: 3, status: 'Pendente' },
  { id: 'dd-20', description: 'Certidão negativa de taxas municipais', category: 'FISCAL IMÓVEL', isCritical: false, peso: 1, status: 'Pendente' },
  { id: 'dd-21', description: 'Certidão Simplificada da Junta Comercial (se PJ)', category: 'PROPRIETÁRIO', isCritical: true, peso: 4, status: 'Pendente' },
  { id: 'dd-22', description: 'Certidões cíveis do fiador', category: 'FIADOR', isCritical: true, peso: 3, status: 'Pendente' },
  { id: 'dd-23', description: 'Certidões dos sócios/administradores', category: 'SÓCIOS/ADM', isCritical: false, peso: 2, status: 'Pendente' },
  { id: 'dd-24', description: 'Certidões trabalhistas do fiador', category: 'FIADOR', isCritical: false, peso: 2, status: 'Pendente' },
  { id: 'dd-25', description: 'Comprovação de poderes do signatário', category: 'IMÓVEL', isCritical: true, peso: 5, status: 'Pendente' },
  { id: 'dd-26', description: 'Comprovante de patrimônio', category: 'FIADOR', isCritical: false, peso: 2, status: 'Pendente' },
  { id: 'dd-27', description: 'Condicionantes da licença ambiental', category: 'AMBIENTAL', isCritical: true, peso: 4, status: 'Pendente' },
  { id: 'dd-28', description: 'Consulta CNPJ/CPF - Receita Federal', category: 'PROPRIETÁRIO', isCritical: true, peso: 4, status: 'Pendente' },
  { id: 'dd-29', description: 'Contratos anteriores de locação', category: 'IMÓVEL', isCritical: false, peso: 1, status: 'Pendente' },
  { id: 'dd-30', description: 'Contratos de terceiros no local', category: 'TERCEIROS', isCritical: true, peso: 4, status: 'Pendente' },
  { id: 'dd-31', description: 'Contratos vigentes com distribuidora', category: 'REGULATÓRIO', isCritical: true, peso: 4, status: 'Pendente' },
  { id: 'dd-32', description: 'Histórico de autuações ambientais', category: 'AMBIENTAL', isCritical: true, peso: 5, status: 'Pendente' },
  { id: 'dd-33', description: 'Histórico de autuações ANP', category: 'REGULATÓRIO', isCritical: false, peso: 2, status: 'Pendente' },
  { id: 'dd-34', description: 'Histórico de propriedade (últimos 20 anos)', category: 'IMÓVEL', isCritical: false, peso: 1, status: 'Pendente' },
  { id: 'dd-35', description: 'Inspeção de equipamentos', category: 'TÉCNICO', isCritical: false, peso: 2, status: 'Pendente' },
  { id: 'dd-36', description: 'Inventário de tanques e equipamentos', category: 'AMBIENTAL', isCritical: false, peso: 2, status: 'Pendente' },
  { id: 'dd-37', description: 'Investigação confirmatória de contaminação', category: 'AMBIENTAL', isCritical: true, peso: 5, status: 'Pendente' },
  { id: 'dd-38', description: 'Laudo de avaliação do imóvel', category: 'TÉCNICO', isCritical: false, peso: 1, status: 'Pendente' },
  { id: 'dd-39', description: 'Laudo de estanqueidade dos tanques', category: 'AMBIENTAL', isCritical: true, peso: 5, status: 'Pendente' },
  { id: 'dd-40', description: 'Licença ambiental de operação (LO)', category: 'AMBIENTAL', isCritical: true, peso: 5, status: 'Pendente' },
  { id: 'dd-41', description: 'Matrícula atualizada (30 dias)', category: 'IMÓVEL', isCritical: true, peso: 5, status: 'Pendente' },
  { id: 'dd-42', description: 'Plano de gerenciamento de resíduos', category: 'AMBIENTAL', isCritical: false, peso: 2, status: 'Pendente' },
  { id: 'dd-43', description: 'Plantas e regularidade de construção', category: 'IMÓVEL', isCritical: false, peso: 2, status: 'Pendente' },
  { id: 'dd-44', description: 'Situação de ocupação e posse', category: 'TERCEIROS', isCritical: true, peso: 4, status: 'Pendente' },
  { id: 'dd-45', description: 'Situação trabalhista dos terceiros', category: 'TERCEIROS', isCritical: false, peso: 2, status: 'Pendente' },
  { id: 'dd-46', description: 'Verificação de penhoras sobre o imóvel', category: 'FISCAL IMÓVEL', isCritical: true, peso: 5, status: 'Pendente' },
  { id: 'dd-47', description: 'Vistoria técnica/engenharia do imóvel', category: 'TÉCNICO', isCritical: false, peso: 2, status: 'Pendente' }
];

export const FIELD_TO_SECTION_MAP: Record<string, string> = {
  // Seção 1: Identificação
  'numeroProjeto': '1',
  'nomeProjeto': '1',
  'dataPrevista': '1',
  'responsavelComercial': '1',

  // Seção 2: Proprietário (Localização em termos de estrutura)
  'proprietarioCpfCnpj': '4',
  'proprietarioNome': '4',

  // Seção 3: Imóvel (Localização)
  'endereco': '2',
  'tipoArea': '2',

  // Seção 4: Modelo Contratual
  'modeloContrato': '6',

  // Seção 5: Valores
  'modeloAluguel': '7',
  'valorAluguelFixo': '7',

  // Seção 6: Garantias
  'tipoGarantia': '5',

  // Seção 7: Reajuste
  'indexadorReajuste': '7',
  'carenciaMeses': '7',

  // Seção 8: Obras
  'capexEstimado': '8',
  'responsavelObras': '8',

  // Seção 9: Bandeira
  'tipoBandeira': '9',

  // Seção 10: Regularidade
  'alvaraMunicipalAtivo': '10',
  'situacaoAnp': '10',
  'licencaAmbientalValida': '10', // Está na seção 10 no código

  // Seção 11: Ambiental
  'historicoContaminacao': '11',

  // Seção 12: Rescisão
  'prazoContratualMeses': '12',
  'regraRescisaoImotivada': '12'
};

export const FIELD_LABELS: Record<string, string> = {
  'numeroProjeto': 'Número do Projeto',
  'nomeProjeto': 'Nome do Projeto',
  'dataPrevista': 'Data Prevista',
  'responsavelComercial': 'Responsável Comercial',
  'proprietarioCpfCnpj': 'CPF/CNPJ do Proprietário',
  'proprietarioNome': 'Nome do Proprietário',
  'endereco': 'Endereço do Imóvel',
  'tipoArea': 'Tipo de Área',
  'modeloContrato': 'Modelo de Contrato',
  'modeloAluguel': 'Modelo do Aluguel',
  'valorAluguelFixo': 'Valor do Aluguel Fixo',
  'tipoGarantia': 'Tipo de Garantia',
  'indexadorReajuste': 'Indexador de Reajuste',
  'carenciaMeses': 'Meses de Carência',
  'capexEstimado': 'CAPEX Estimado',
  'responsavelObras': 'Responsável pelas Obras',
  'tipoBandeira': 'Bandeira do Posto',
  'alvaraMunicipalAtivo': 'Alvará Municipal',
  'situacaoAnp': 'Situação ANP',
  'licencaAmbientalValida': 'Licença Ambiental',
  'historicoContaminacao': 'Histórico de Contaminação',
  'prazoContratualMeses': 'Prazo Contratual',
  'regraRescisaoImotivada': 'Regra de Rescisão'
};
