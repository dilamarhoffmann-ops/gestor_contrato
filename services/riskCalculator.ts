import { NegotiationData, RiskScore, DueDiligenceItem } from '../types';
import { RISK_PARAMS } from '../constants';

export const calculateRisk = (data: NegotiationData, dueDiligence: DueDiligenceItem[] = []): RiskScore => {
  let dominialScore = 0;
  let ambientalScore = 0;
  let regulatorioScore = 0;
  let economicoScore = 0;
  const triggers: string[] = [];

  // Logic derived from "Score de Risco. Semáforo.pdf"

  // 1. Economic Risk Triggers (CONDICOES ECONOMICAS)

  // "Investimento alto com prazo curto" -> Impact 10
  if (data.capexEstimado >= RISK_PARAMS.capexAlto && data.prazoContratualMeses < RISK_PARAMS.prazoCurto) {
    economicoScore += 10;
    triggers.push("Investimento alto com prazo curto");
  }

  // "Carência insuficiente para CAPEX alto" -> Impact 8
  if (data.capexEstimado >= RISK_PARAMS.capexAlto && data.carenciaMeses < RISK_PARAMS.carenciaMinimaCapexAlto) {
    economicoScore += 8;
    triggers.push("Carência insuficiente para CAPEX alto");
  }

  // "Indexador Volátil" -> Impact 5
  if (data.indexadorReajuste === 'IGP-M') {
    economicoScore += 5;
    triggers.push("Indexador IGP-M (Volatilidade)");
  }

  // "Pagamento Inicial (Luvas)" -> Impact 5
  if (data.temPagamentoInicial) {
    economicoScore += 5;
    triggers.push("Exigência de Luvas / Pagamento Inicial");
  }

  // "Aluguel Mínimo Garantido" -> Impact 3
  if (data.aluguelMinimoGarantido) {
    economicoScore += 3;
    triggers.push("Aluguel Mínimo Garantido");
  }

  // "Prazo de Obras Extenso" -> Impact 5 (Delayed revenue)
  if ((data.prazoObrasDias || 0) > 180) {
    economicoScore += 5;
    triggers.push("Prazo de obras > 6 meses");
  }

  // 2. Regulatory/Contractual Risk
  // "Distribuidora incompatível" (Simplified logic: if taking over a flagged station) -> Impact 7
  if (data.emOperacao && data.temContratoVigenteDistribuidora) {
    // Assuming risk if taking over a station with existing contracts
    regulatorioScore += 7;
    triggers.push("Contrato vigente com Distribuidora");
  }

  // 3. Dominial/Legal Risk
  // If "Locação típica" with short term -> higher risk
  if (data.modeloContrato === 'Locação típica (Lei 8.245/91)' && data.prazoContratualMeses < 60) {
    dominialScore += 5;
    triggers.push("Locação típica com prazo curto");
  }

  if (data.proprietarioTemCoproprietarios || data.proprietarioTemEspolio) {
    dominialScore += 5;
    triggers.push("Complexidade Proprietária (Espólio/Coproprietários)");
  }

  // 4. Environmental (Simulated based on context)
  // If Rodovia -> typically higher environmental scrutiny
  if (data.tipoArea === 'Rodovia') {
    ambientalScore += 10;
    triggers.push("Localização Rodovia (Alto risco ambiental)");
  }

  if (data.historicoContaminacao === 'Sim' || data.historicoContaminacao === 'Desconhecido') {
    ambientalScore += 5;
    triggers.push("Histórico de Contaminação");
  }

  // --- DUE DILIGENCE INTEGRATION ---
  // Iterate through DD items and add weight if status is 'Pendente'
  let ddPendingCount = 0;

  if (dueDiligence) {
    dueDiligence.forEach(item => {
      if (item.status === 'Pendente') {
        ddPendingCount++;
        const weight = item.peso || 1;

        switch (item.category) {
          case 'IMÓVEL':
          case 'PROPRIETÁRIO':
          case 'FIADOR':
          case 'SÓCIOS/ADM':
          case 'FISCAL IMÓVEL':
            dominialScore += weight * 0.5;
            break;
          case 'AMBIENTAL':
            ambientalScore += weight * 0.5;
            break;
          case 'REGULATÓRIO':
          case 'TERCEIROS':
            regulatorioScore += weight * 0.5;
            break;
          case 'TÉCNICO':
            economicoScore += weight * 0.5;
            break;
          default:
            regulatorioScore += weight * 0.5;
        }
      }
    });
  }

  if (ddPendingCount > 5) {
    triggers.push(`${ddPendingCount} itens de Due Diligence pendentes`);
  }

  // Base Scores (Simulated baseline based on completion)
  // In a real app, this would be more granular based on the 100+ fields
  dominialScore = Math.max(dominialScore, 5); // Base complexity

  // Cap scores at 25 per dimension as per PDF
  dominialScore = Math.min(Math.round(dominialScore), 25);
  ambientalScore = Math.min(Math.round(ambientalScore), 25);
  regulatorioScore = Math.min(Math.round(regulatorioScore), 25);
  economicoScore = Math.min(Math.round(economicoScore), 25);

  const total = dominialScore + ambientalScore + regulatorioScore + economicoScore;

  let level: 'Verde' | 'Amarelo' | 'Vermelho' = 'Verde';
  if (total > RISK_PARAMS.semaforoAmareloAte) {
    level = 'Vermelho';
  } else if (total > RISK_PARAMS.semaforoVerdeAte) {
    level = 'Amarelo';
  }

  return {
    total,
    level,
    breakdown: {
      dominial: dominialScore,
      ambiental: ambientalScore,
      regulatorio: regulatorioScore,
      economico: economicoScore
    },
    triggers
  };
};

/**
 * Determines if the Term Sheet can be generated based on the Risk Score.
 * - Verde: Auto-approved
 * - Amarelo: Needs Approval (but generated)
 * - Vermelho: Blocked until mitigation
 */
export const gerarTermSheet = (risk: RiskScore): { allowed: boolean; message: string } => {
  if (risk.level === 'Vermelho') {
    return {
      allowed: false,
      message: "Risco Crítico (Vermelho). Necessário plano de mitigação ou aprovação da diretoria antes de gerar o Term Sheet."
    };
  }
  if (risk.level === 'Amarelo') {
    return {
      allowed: true,
      message: "Risco Médio (Amarelo). Term Sheet gerado com alerta de revisão."
    };
  }
  return {
    allowed: true,
    message: "Risco Baixo (Verde). Term Sheet liberado."
  };
};