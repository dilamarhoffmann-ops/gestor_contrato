import React from 'react';
import { NegotiationData, RiskScore, AddressData } from '../types';

interface TermSheetViewProps {
  data: NegotiationData;
  risk: RiskScore;
}

export const TermSheetView: React.FC<TermSheetViewProps> = ({ data, risk }) => {

  const formatAddress = (addr: AddressData) => {
    if (!addr || !addr.logradouro) return '-';
    return (
      <>
        {addr.logradouro}, {addr.numero} {addr.bairro ? `- ${addr.bairro}` : ''}
        <br />
        {addr.cidade} - {addr.uf} {addr.cep ? `(CEP: ${addr.cep})` : ''}
      </>
    );
  };

  return (
    <div className="bg-white p-12 shadow-2xl max-w-5xl mx-auto rounded-[2.5rem] border border-slate-100 print:shadow-none print:border-none print:p-0 my-10 relative overflow-hidden">
      {/* Decorative Brand Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-3xl -mr-32 -mt-32"></div>

      {/* Header - Premium Legal Style */}
      <div className="flex justify-between items-start mb-12 border-b-2 border-slate-900 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Term Sheet</h1>
          <p className="text-sm font-bold text-blue-600 tracking-[0.2em] uppercase">Exploração de Posto de Combustíveis</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Status do Documento</p>
          <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black tracking-widest uppercase">Draft / Commercial Only</span>
        </div>
      </div>

      <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-500 text-xs text-center">
        Este documento reflete as premissas comerciais negociadas e NÃO SUBSTITUI o contrato definitivo.
      </div>

      <div className="grid grid-cols-1 gap-6 text-sm">

        {/* Section 1 */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">01</span>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Identificação do Negócio</h2>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projeto</p>
              <p className="text-sm font-bold text-slate-800">{data.nomeProjeto || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zoneamento</p>
              <p className="text-sm font-bold text-slate-800">{data.zoneamento || '-'}</p>
            </div>
            <div className="col-span-2 space-y-1 border-t border-slate-100 pt-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização Técnica</p>
              <p className="text-sm font-bold text-slate-800 leading-relaxed">
                {data.endereco ? `${data.endereco}, ${data.numero}` : 'Endereço não informado'}
                {data.bairro ? ` - ${data.bairro}` : ''} | {data.cidade} - {data.uf} {data.cep ? `(CEP: ${data.cep})` : ''}
              </p>
            </div>
            <div className="space-y-1 border-t border-slate-100 pt-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Área Terreno</p>
              <p className="text-sm font-bold text-slate-800">{data.areaTerreno ? `${data.areaTerreno} m²` : '-'}</p>
            </div>
            <div className="space-y-1 border-t border-slate-100 pt-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Área Construída</p>
              <p className="text-sm font-bold text-slate-800">{data.areaConstruida ? `${data.areaConstruida} m²` : '-'}</p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="bg-blue-100 text-blue-900 px-3 py-1 font-bold mb-2 border-l-4 border-blue-600">2. Partes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Locador */}
            <div>
              <p className="font-bold text-xs uppercase text-gray-500 mb-1">Locador (Proprietário)</p>
              <div className="space-y-1">
                <p className="font-bold text-lg">{data.proprietarioNome || 'A definir'}</p>
                <p>CPF/CNPJ: {data.proprietarioCpfCnpj || '-'}</p>
                <p>Endereço: <span className="text-gray-600 text-xs block pl-2 border-l-2 border-gray-200 mt-1">{formatAddress(data.proprietarioEndereco)}</span></p>
                {(data.proprietarioInscricaoEstadual || data.proprietarioInscricaoMunicipal) && (
                  <p className="text-xs text-gray-600">IE: {data.proprietarioInscricaoEstadual || '-'} | IM: {data.proprietarioInscricaoMunicipal || '-'}</p>
                )}

                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="font-semibold text-xs text-gray-600">Representante Legal:</p>
                  <p>{data.proprietarioRepresentanteNome} {data.proprietarioRepresentanteCargo && `(${data.proprietarioRepresentanteCargo})`}</p>
                  {data.proprietarioRepresentanteCpf && <p className="text-xs text-gray-500">CPF: {data.proprietarioRepresentanteCpf}</p>}
                </div>

                {/* Structure Flags */}
                <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-700">
                  <p><span className="font-semibold">Coproprietários:</span> {data.proprietarioTemCoproprietarios ? 'Sim (Ver Anexo)' : 'Não'}</p>
                  <p><span className="font-semibold">Usufruto:</span> {data.proprietarioTemUsufructuario ? 'Sim' : 'Não'}</p>
                  <p><span className="font-semibold">Espólio:</span> {data.proprietarioTemEspolio ? 'Sim' : 'Não'}</p>
                  <p><span className="font-semibold">Anuência Intervenientes:</span> {data.proprietarioAnuenciaIntervenientes}</p>
                </div>
              </div>
            </div>

            {/* Locatário */}
            <div>
              <p className="font-bold text-xs uppercase text-gray-500 mb-1">Locatário (Grupo)</p>
              <div className="space-y-1">
                <p className="font-bold text-lg">{data.locatarioRazaoSocial || 'A definir'}</p>
                <p>CNPJ: {data.locatarioCnpj || '-'}</p>
                <p>Endereço: <span className="text-gray-600 text-xs block pl-2 border-l-2 border-gray-200 mt-1">{formatAddress(data.locatarioEndereco)}</span></p>

                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="font-semibold text-xs text-gray-600">Representante Legal:</p>
                  <p>{data.locatarioRepresentanteNome} {data.locatarioRepresentanteCargo && `(${data.locatarioRepresentanteCargo})`}</p>
                  {data.locatarioRepresentanteCpf && <p className="text-xs text-gray-500">CPF: {data.locatarioRepresentanteCpf}</p>}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 & 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section>
            <h2 className="bg-blue-100 text-blue-900 px-3 py-1 font-bold mb-2 border-l-4 border-blue-600">3. Estrutura Contratual</h2>
            <table className="w-full">
              <tbody>
                <tr><td className="font-semibold py-1">Modelo:</td><td>{data.modeloContrato}</td></tr>
                {data.justificativaModelo && (
                  <tr><td colSpan={2} className="text-xs italic text-gray-600 py-1">{data.justificativaModelo}</td></tr>
                )}
                <tr><td className="font-semibold py-1 border-t border-gray-100 mt-2">Opção de Compra:</td><td className="border-t border-gray-100 mt-2">{data.intencaoCompra ? 'Sim' : 'Não'}</td></tr>
                {data.intencaoCompra && (
                  <>
                    <tr><td className="pl-2 text-xs text-gray-500">Prazo Ex:</td><td className="text-xs">{data.prazoExercicioOpcao}</td></tr>
                    <tr><td className="pl-2 text-xs text-gray-500">Critério:</td><td className="text-xs">{data.criterioPrecoOpcao}</td></tr>
                  </>
                )}
                <tr><td className="font-semibold py-1">Dir. Preferência:</td><td>{data.direitoPreferenciaReforcado ? 'Sim (Reforçado)' : 'Padrão'}</td></tr>
                <tr><td className="font-semibold py-1">Cessão Intra-grupo:</td><td>{data.cessaoIntraGrupo ? 'Permitida' : 'Não especificado'}</td></tr>
                {data.cessaoIntraGrupo && data.empresasEnvolvidasCessao && data.empresasEnvolvidasCessao.length > 0 && (
                  <tr>
                    <td className="align-top py-1 text-xs text-gray-500 pl-4">Empresas:</td>
                    <td className="py-1 text-xs">
                      <ul className="list-disc pl-4">
                        {data.empresasEnvolvidasCessao.map((emp, i) => (
                          <li key={i}>{emp}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
          <section>
            <h2 className="bg-blue-100 text-blue-900 px-3 py-1 font-bold mb-2 border-l-4 border-blue-600">4. Condições Econômicas</h2>
            <table className="w-full">
              <tbody>
                <tr><td className="font-semibold py-1">Modelo:</td><td>{data.modeloAluguel}</td></tr>
                <tr><td className="font-semibold py-1">Valor Fixo:</td><td>R$ {data.valorAluguelFixo.toLocaleString('pt-BR')}</td></tr>
                {data.aluguelVariavelCriterio && (
                  <tr><td className="font-semibold py-1">Critério Var.:</td><td className="text-xs">{data.aluguelVariavelCriterio}</td></tr>
                )}
                <tr><td className="font-semibold py-1">Mínimo Garantido:</td><td>{data.aluguelMinimoGarantido ? `Sim (R$ ${data.valorAluguelMinimo})` : 'Não'}</td></tr>
                <tr><td className="font-semibold py-1">Reajuste:</td><td>{data.indexadorReajuste} ({data.dataBaseReajuste})</td></tr>
              </tbody>
            </table>
          </section>
        </div>

        {/* Section 6 & 7 */}
        <section>
          <h2 className="bg-blue-100 text-blue-900 px-3 py-1 font-bold mb-2 border-l-4 border-blue-600">Investimentos & Custos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="bg-gray-50"><td className="p-2 font-semibold">CAPEX Estimado:</td><td className="p-2">R$ {data.capexEstimado.toLocaleString('pt-BR')}</td></tr>
                <tr><td className="p-2 font-semibold">Prazo Contratual:</td><td className="p-2">{data.prazoContratualMeses} meses</td></tr>
                <tr className="bg-gray-50"><td className="p-2 font-semibold">Carência:</td><td className="p-2">{data.temCarencia ? `${data.carenciaMeses} meses (${data.tipoCarencia})` : 'Não'}</td></tr>
                <tr><td className="p-2 font-semibold">Luvas:</td><td className="p-2">{data.temPagamentoInicial ? `R$ ${data.valorPagamentoInicial}` : 'Não'}</td></tr>
              </tbody>
            </table>
            <table className="w-full border-collapse">
              <tbody>
                <tr className="bg-gray-50"><td className="p-2 font-semibold">IPTU:</td><td className="p-2">{data.responsavelIptu}</td></tr>
                <tr><td className="p-2 font-semibold">Seguro:</td><td className="p-2">{data.responsavelSeguro}</td></tr>
                <tr className="bg-gray-50"><td className="p-2 font-semibold">Registro:</td><td className="p-2">{data.responsavelRegistro}</td></tr>
                <tr><td className="p-2 font-semibold">Garantia:</td><td className="p-2 text-xs">{data.tipoGarantia}</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Garantias Detailed Section */}
        <section>
          <h2 className="bg-blue-100 text-blue-900 px-3 py-1 font-bold mb-2 border-l-4 border-blue-600">Garantias e Fiador</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-700">Tipo de Garantia:</p>
              <p>{data.tipoGarantia}</p>
              <p className="text-xs text-gray-500 mt-1">Exige Garantidor? {data.exigeGarantidor ? 'Sim' : 'Não'}</p>
            </div>

            {data.tipoGarantia === 'Caução em dinheiro' && (
              <div>
                <p className="font-semibold text-gray-700">Detalhes da Caução:</p>
                <p>Valor: R$ {data.garantiaCaucaoValor}</p>
                <p>Conta: {data.garantiaCaucaoConta}</p>
              </div>
            )}

            {data.tipoGarantia === 'Seguro fiança' && (
              <div>
                <p className="font-semibold text-gray-700">Detalhes do Seguro:</p>
                <p>Seguradora: {data.garantiaSeguroSeguradora}</p>
                <p>Valor: R$ {data.garantiaSeguroValor}</p>
              </div>
            )}

            {(data.tipoGarantia.includes('Fiança') || data.tipoGarantia.includes('fianç')) && data.tipoGarantia !== 'Seguro fiança' && (
              <div className="md:col-span-2 bg-gray-50 p-3 rounded">
                <p className="font-semibold text-gray-700 mb-1">Dados do Fiador:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p><strong>Nome:</strong> {data.garantiaFiadorNome}</p>
                  <p><strong>CPF/CNPJ:</strong> {data.garantiaFiadorCpfCnpj}</p>
                  <div className="col-span-2"><strong>Endereço:</strong> {formatAddress(data.garantiaFiadorEndereco)}</div>
                  <p><strong>Patrimônio:</strong> {data.garantiaFiadorPatrimonio}</p>
                  {data.tipoGarantia === 'Fiança pessoa física' && <p><strong>Estado Civil:</strong> {data.garantiaFiadorEstadoCivil}</p>}
                  <p><strong>Renúncia Benef. Ordem:</strong> {data.garantiaFiadorRenunciaBeneficio ? 'Sim' : 'Não'}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Third Parties (New) */}
        {data.temTerceirosExplorando && (
          <section className="mt-4">
            <h2 className="bg-blue-100 text-blue-900 px-3 py-1 font-bold mb-2 border-l-4 border-blue-600">Terceiros no Imóvel</h2>
            {data.terceiros && data.terceiros.length > 0 ? (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-2">Nome</th>
                    <th className="p-2">Atividade</th>
                    <th className="p-2">Prazo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.terceiros.map((t, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{t.nome}</td>
                      <td className="p-2">{t.atividade}</td>
                      <td className="p-2">{t.prazo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs italic text-gray-500">Sem terceiros listados, apesar da indicação positiva.</p>
            )}
          </section>
        )}

        {/* Risk Breakdown Section */}
        <section className="mt-4 border-t pt-4">
          <h3 className="font-bold text-gray-700 mb-2">Análise de Risco Automática</h3>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 bg-gray-50 rounded">
              <span className="block text-gray-500">Dominial</span>
              <span className="font-bold text-lg">{risk.breakdown.dominial}/25</span>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <span className="block text-gray-500">Ambiental</span>
              <span className="font-bold text-lg">{risk.breakdown.ambiental}/25</span>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <span className="block text-gray-500">Regulatório</span>
              <span className="font-bold text-lg">{risk.breakdown.regulatorio}/25</span>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <span className="block text-gray-500">Econômico</span>
              <span className="font-bold text-lg">{risk.breakdown.economico}/25</span>
            </div>
          </div>
          {risk.triggers.length > 0 && (
            <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded text-red-700 text-xs">
              <strong>Gatilhos de Risco Ativados:</strong>
              <ul className="list-disc pl-4 mt-1">
                {risk.triggers.map((t, idx) => <li key={idx}>{t}</li>)}
              </ul>
            </div>
          )}
        </section>

        {/* Signatures */}
        <section className="mt-12 pt-8 border-t border-gray-300">
          <div className="flex justify-between gap-12">
            <div className="flex-1 text-center">
              <div className="border-t border-black pt-2">LOCADOR</div>
            </div>
            <div className="flex-1 text-center">
              <div className="border-t border-black pt-2">LOCATÁRIO</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};