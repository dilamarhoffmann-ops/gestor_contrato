import { NegotiationData, RiskScore } from '../types';
import { RISK_PARAMS } from '../constants';

export const calculateRisk = (data: NegotiationData): RiskScore => {
  let dominialScore = 0;
  let ambientalScore = 0;
  let regulatorioScore = 0;
  let economicoScore = 0;
  const triggers: string[] = [];

  // Logic derived from "Score de Risco. Semáforo.pdf"
  
  // 1. Economic Risk Triggers
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

  // 4. Environmental (Simulated based on context)
  // If Rodovia -> typically higher environmental scrutiny
  if (data.tipoArea === 'Rodovia') {
    ambientalScore += 10;
    triggers.push("Localização Rodovia (Alto risco ambiental)");
  }

  // Base Scores (Simulated baseline based on completion)
  // In a real app, this would be more granular based on the 100+ fields
  dominialScore += 5; 
  if (data.capexEstimado > 500000) economicoScore += 5;

  // Cap scores at 25 per dimension as per PDF
  dominialScore = Math.min(dominialScore, 25);
  ambientalScore = Math.min(ambientalScore, 25);
  regulatorioScore = Math.min(regulatorioScore, 25);
  economicoScore = Math.min(economicoScore, 25);

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