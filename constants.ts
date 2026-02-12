
import { DueDiligenceItem } from './types';

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
  tolerancia_risco: ['Baixa', 'Média', 'Alta']
};

// From "Score de Risco. Semáforo.pdf"
export const RISK_PARAMS = {
  capexAlto: 1000000,
  prazoCurto: 60,
  carenciaMinimaCapexAlto: 3,
  semaforoVerdeAte: 25,
  semaforoAmareloAte: 50
};

// Complete Checklist based on uploaded file
export const INITIAL_DUE_DILIGENCE: DueDiligenceItem[] = [
  { id: 'dd-01', description: 'Alvará de funcionamento municipal', category: 'REGULATÓRIO', isCritical: true, status: 'Pendente' },
  { id: 'dd-02', description: 'Autorizações especiais (se aplicável)', category: 'REGULATÓRIO', isCritical: false, status: 'Pendente' },
  { id: 'dd-03', description: 'AVCB - Auto de Vistoria do Corpo de Bombeiros', category: 'REGULATÓRIO', isCritical: true, status: 'Pendente' },
  { id: 'dd-04', description: 'Cadastro ANP - situação regular', category: 'REGULATÓRIO', isCritical: true, status: 'Pendente' },
  { id: 'dd-05', description: 'Certidão de ações reipersecutórias', category: 'IMÓVEL', isCritical: true, status: 'Pendente' },
  { id: 'dd-06', description: 'Certidão de ações trabalhistas', category: 'PROPRIETÁRIO', isCritical: true, status: 'Pendente' },
  { id: 'dd-07', description: 'Certidão de casamento (se PF)', category: 'FIADOR', isCritical: true, status: 'Pendente' },
  { id: 'dd-08', description: 'Certidão de distribuição cível - Justiça Estadual', category: 'PROPRIETÁRIO', isCritical: true, status: 'Pendente' },
  { id: 'dd-09', description: 'Certidão de distribuição cível - Justiça Federal', category: 'PROPRIETÁRIO', isCritical: true, status: 'Pendente' },
  { id: 'dd-10', description: 'Certidão de execuções fiscais - Estadual', category: 'PROPRIETÁRIO', isCritical: false, status: 'Pendente' },
  { id: 'dd-11', description: 'Certidão de execuções fiscais - Federal', category: 'PROPRIETÁRIO', isCritical: true, status: 'Pendente' },
  { id: 'dd-12', description: 'Certidão de execuções fiscais - Municipal', category: 'PROPRIETÁRIO', isCritical: false, status: 'Pendente' },
  { id: 'dd-13', description: 'Certidão de falência e recuperação judicial', category: 'PROPRIETÁRIO', isCritical: true, status: 'Pendente' },
  { id: 'dd-14', description: 'Certidão de ônus reais', category: 'IMÓVEL', isCritical: true, status: 'Pendente' },
  { id: 'dd-15', description: 'Certidão de protesto', category: 'PROPRIETÁRIO', isCritical: false, status: 'Pendente' },
  { id: 'dd-16', description: 'Certidão de zoneamento/uso do solo', category: 'IMÓVEL', isCritical: true, status: 'Pendente' },
  { id: 'dd-17', description: 'Certidão negativa de débitos ambientais', category: 'AMBIENTAL', isCritical: false, status: 'Pendente' },
  { id: 'dd-18', description: 'Certidão negativa de débitos de IPTU', category: 'FISCAL IMÓVEL', isCritical: true, status: 'Pendente' },
  { id: 'dd-19', description: 'Certidão negativa de IPTU e taxas municipais', category: 'IMÓVEL', isCritical: true, status: 'Pendente' },
  { id: 'dd-20', description: 'Certidão negativa de taxas municipais', category: 'FISCAL IMÓVEL', isCritical: false, status: 'Pendente' },
  { id: 'dd-21', description: 'Certidão Simplificada da Junta Comercial (se PJ)', category: 'PROPRIETÁRIO', isCritical: true, status: 'Pendente' },
  { id: 'dd-22', description: 'Certidões cíveis do fiador', category: 'FIADOR', isCritical: true, status: 'Pendente' },
  { id: 'dd-23', description: 'Certidões dos sócios/administradores', category: 'SÓCIOS/ADM', isCritical: false, status: 'Pendente' },
  { id: 'dd-24', description: 'Certidões trabalhistas do fiador', category: 'FIADOR', isCritical: false, status: 'Pendente' },
  { id: 'dd-25', description: 'Comprovação de poderes do signatário', category: 'IMÓVEL', isCritical: true, status: 'Pendente' },
  { id: 'dd-26', description: 'Comprovante de patrimônio', category: 'FIADOR', isCritical: false, status: 'Pendente' },
  { id: 'dd-27', description: 'Condicionantes da licença ambiental', category: 'AMBIENTAL', isCritical: true, status: 'Pendente' },
  { id: 'dd-28', description: 'Consulta CNPJ/CPF - Receita Federal', category: 'PROPRIETÁRIO', isCritical: true, status: 'Pendente' },
  { id: 'dd-29', description: 'Contratos anteriores de locação', category: 'IMÓVEL', isCritical: false, status: 'Pendente' },
  { id: 'dd-30', description: 'Contratos de terceiros no local', category: 'TERCEIROS', isCritical: true, status: 'Pendente' },
  { id: 'dd-31', description: 'Contratos vigentes com distribuidora', category: 'REGULATÓRIO', isCritical: true, status: 'Pendente' },
  { id: 'dd-32', description: 'Histórico de autuações ambientais', category: 'AMBIENTAL', isCritical: true, status: 'Pendente' },
  { id: 'dd-33', description: 'Histórico de autuações ANP', category: 'REGULATÓRIO', isCritical: false, status: 'Pendente' },
  { id: 'dd-34', description: 'Histórico de propriedade (últimos 20 anos)', category: 'IMÓVEL', isCritical: false, status: 'Pendente' },
  { id: 'dd-35', description: 'Inspeção de equipamentos', category: 'TÉCNICO', isCritical: false, status: 'Pendente' },
  { id: 'dd-36', description: 'Inventário de tanques e equipamentos', category: 'AMBIENTAL', isCritical: false, status: 'Pendente' },
  { id: 'dd-37', description: 'Investigação confirmatória de contaminação', category: 'AMBIENTAL', isCritical: true, status: 'Pendente' },
  { id: 'dd-38', description: 'Laudo de avaliação do imóvel', category: 'TÉCNICO', isCritical: false, status: 'Pendente' },
  { id: 'dd-39', description: 'Laudo de estanqueidade dos tanques', category: 'AMBIENTAL', isCritical: true, status: 'Pendente' },
  { id: 'dd-40', description: 'Licença ambiental de operação (LO)', category: 'AMBIENTAL', isCritical: true, status: 'Pendente' },
  { id: 'dd-41', description: 'Matrícula atualizada (30 dias)', category: 'IMÓVEL', isCritical: true, status: 'Pendente' },
  { id: 'dd-42', description: 'Plano de gerenciamento de resíduos', category: 'AMBIENTAL', isCritical: false, status: 'Pendente' },
  { id: 'dd-43', description: 'Plantas e regularidade de construção', category: 'IMÓVEL', isCritical: false, status: 'Pendente' },
  { id: 'dd-44', description: 'Situação de ocupação e posse', category: 'TERCEIROS', isCritical: true, status: 'Pendente' },
  { id: 'dd-45', description: 'Situação trabalhista dos terceiros', category: 'TERCEIROS', isCritical: false, status: 'Pendente' },
  { id: 'dd-46', description: 'Verificação de penhoras sobre o imóvel', category: 'FISCAL IMÓVEL', isCritical: true, status: 'Pendente' },
  { id: 'dd-47', description: 'Vistoria técnica/engenharia do imóvel', category: 'TÉCNICO', isCritical: false, status: 'Pendente' }
];
