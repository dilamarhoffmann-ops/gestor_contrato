import React, { useState } from 'react';
import { NegotiationData, TankItem, AddressData, ThirdPartyItem } from '../types';
import { LISTS } from '../constants';
import { SectionCard } from '../components/SectionCard';
import { SectionFAQ } from '../components/SectionFAQ';
import { Building2, Calculator, MapPin, User, FileText, ShieldCheck, Flag, Plus, Trash2, HardHat, Hourglass, Fuel, ScrollText, Leaf, Ban, Scale, MessageSquare, UploadCloud, Eye, Download, Search, Loader2 } from 'lucide-react';
import { uploadFileToS3 } from '../services/s3';

interface NegotiationFormProps {
   data: NegotiationData;
   onChange: (field: keyof NegotiationData, value: any) => void;
}

export const NegotiationForm: React.FC<NegotiationFormProps> = ({ data, onChange }) => {
   const [activeSection, setActiveSection] = useState('1');
   const [companyInput, setCompanyInput] = React.useState('');
   const [selectedTankType, setSelectedTankType] = useState('');
   const [loadingCep, setLoadingCep] = useState<{ [key: string]: boolean }>({});
   const [loadingCnpj, setLoadingCnpj] = useState<{ [key: string]: boolean }>({});
   const [isUploadingFiles, setIsUploadingFiles] = useState(false);

   // Third Party temp state
   const [tpName, setTpName] = useState('');
   const [tpActivity, setTpActivity] = useState('');
   const [tpTerm, setTpTerm] = useState('');

   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      let finalValue: any = value;
      if (type === 'number') finalValue = parseFloat(value);
      if (type === 'checkbox') finalValue = (e.target as HTMLInputElement).checked;

      onChange(name as keyof NegotiationData, finalValue);
   };

   const handleBooleanSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { name, value } = e.target;
      onChange(name as keyof NegotiationData, value === 'true');
   };

   const handleAddressChange = (prefix: keyof NegotiationData, field: keyof AddressData, value: string) => {
      const currentAddress = data[prefix] as AddressData;
      onChange(prefix, { ...currentAddress, [field]: value });
   };

   const handleCepFetch = async (prefix: keyof NegotiationData, cepValue: string) => {
      const cep = cepValue.replace(/\D/g, '');
      if (cep.length === 8) {
         setLoadingCep(prev => ({ ...prev, [prefix]: true }));
         try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const addressData = await response.json();
            if (!addressData.erro) {
               if (prefix === 'cep') {
                  // Special case for root level address fields (Property Location)
                  onChange('endereco', addressData.logradouro);
                  onChange('bairro', addressData.bairro);
                  onChange('cidade', addressData.localidade);
                  onChange('uf', addressData.uf);
               } else {
                  // Nested address objects
                  const current = data[prefix] as AddressData;
                  onChange(prefix, {
                     ...current,
                     cep: cepValue,
                     logradouro: addressData.logradouro,
                     bairro: addressData.bairro,
                     cidade: addressData.localidade,
                     uf: addressData.uf
                  });
               }
            }
         } catch (error) {
            console.error('Erro ao buscar CEP', error);
         } finally {
            setLoadingCep(prev => ({ ...prev, [prefix]: false }));
         }
      }
   };

   const handleCnpjFetch = async (cnpjValue: string, targetField: keyof NegotiationData, isListToAdd: boolean = false) => {
      const cnpj = cnpjValue.replace(/\D/g, '');
      if (cnpj.length === 14) {
         setLoadingCnpj(prev => ({ ...prev, [targetField]: true }));
         try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
            if (response.ok) {
               const data = await response.json();
               if (isListToAdd) {
                  // For list additions (Cessão)
                  setCompanyInput(`${data.razao_social} (${formatCNPJ(cnpj)})`);
               } else {
                  // For direct field updates
                  onChange(targetField, data.razao_social);
               }
            }
         } catch (error) {
            console.error("Error fetching CNPJ", error);
         } finally {
            setLoadingCnpj(prev => ({ ...prev, [targetField]: false }));
         }
      }
   };

   // Third Party Management
   const handleAddThirdParty = () => {
      if (tpName && tpActivity) {
         const newItem: ThirdPartyItem = { nome: tpName, atividade: tpActivity, prazo: tpTerm };
         onChange('terceiros', [...(data.terceiros || []), newItem]);
         setTpName('');
         setTpActivity('');
         setTpTerm('');
      }
   };

   const handleRemoveThirdParty = (index: number) => {
      const list = [...(data.terceiros || [])];
      list.splice(index, 1);
      onChange('terceiros', list);
   };

   // Tank Management
   const handleAddTank = () => {
      if (selectedTankType) {
         const newTank: TankItem = { tipo: selectedTankType, quantidade: 1, idade: 0 };
         const currentTanks = data.tanques || [];
         onChange('tanques', [...currentTanks, newTank]);
         setSelectedTankType('');
      }
   };

   const handleRemoveTank = (index: number) => {
      const currentTanks = [...(data.tanques || [])];
      currentTanks.splice(index, 1);
      onChange('tanques', currentTanks);
   };

   const handleUpdateTank = (index: number, field: keyof TankItem, value: number) => {
      const currentTanks = [...(data.tanques || [])];
      currentTanks[index] = { ...currentTanks[index], [field]: value };
      onChange('tanques', currentTanks);
   };

   const SECTION_FAQS: Record<string, { question: string, answer: string }[]> = {
      '1': [
         { question: 'Por que o número do projeto é obrigatório?', answer: 'Este número é a chave de identificação única no sistema e no SAP. Caso não tenha, use o padrão provisório sugerido pelo coordenador.' },
         { question: 'Qual a diferença entre Responsável Comercial e Técnico?', answer: 'O comercial lidera a negociação de valores, enquanto o técnico avalia a viabilidade física e operacional do terreno.' }
      ],
      '4': [
         { question: 'O que é um Terceiro Envolvido?', answer: 'São advogados, corretores ou representantes que participam da negociação mas não são os assinantes principais do contrato.' },
         { question: 'Como funciona a busca por CNPJ?', answer: 'Ao digitar o CNPJ, o sistema consulta a API da Receita Federal para preencher automaticamente a Razão Social.' }
      ],
      '7': [
         { question: 'Aluguel Fixo vs Variável?', answer: 'Fixo é um valor imutável mensal. Variável depende de performance (ex: litros vendidos). "Built to Suit" é o modelo onde o grupo constrói e paga aluguel amortizado.' },
         { question: 'O que é o Indexador?', answer: 'É o índice usado para o reajuste anual. Geralmente IPCA ou IGPM. A data-base é o mês de aniversário da assinatura.' }
      ],
      '12': [
         { question: 'Direito de Preferência?', answer: 'Garante que o Grupo tenha prioridade de compra caso o proprietário decida vender o imóvel durante a vigência do contrato.' },
         { question: 'Denúncia Vazia?', answer: 'É a possibilidade de encerrar o contrato sem motivo específico, geralmente mediante aviso prévio de 6 a 12 meses.' }
      ],
      '15': [
         { question: 'Onde ficam salvos os anexos?', answer: 'Os arquivos são enviados com segurança para o Amazon S3 e vinculados permanentemente a este projeto.' }
      ]
   };

   // File Upload Management
   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
         setIsUploadingFiles(true);
         const filesArray = Array.from(e.target.files) as File[];

         try {
            const uploadedFiles = await Promise.all(
               filesArray.map(async (file) => {
                  const url = await uploadFileToS3(file, 'documents');
                  return {
                     name: file.name,
                     url: url,
                     type: file.type
                  };
               })
            );

            onChange('documentos', [...(data.documentos || []), ...uploadedFiles]);
         } catch (error) {
            console.error("Upload failed", error);
            alert("Erro ao fazer upload de um ou mais arquivos.");
         } finally {
            setIsUploadingFiles(false);
            e.target.value = ''; // Reset input
         }
      }
   };

   const handleRemoveFile = (index: number) => {
      const currentFiles = [...(data.documentos || [])];
      currentFiles.splice(index, 1);
      onChange('documentos', currentFiles);
   };

   // Masking Helpers
   const formatCPF = (value: string) => {
      return value
         .replace(/\D/g, '')
         .slice(0, 11)
         .replace(/(\d{3})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d{1,2})/, '$1-$2');
   };

   const formatCNPJ = (value: string) => {
      return value
         .replace(/\D/g, '')
         .slice(0, 14)
         .replace(/^(\d{2})(\d)/, '$1.$2')
         .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
         .replace(/\.(\d{3})(\d)/, '.$1/$2')
         .replace(/(\d{4})(\d)/, '$1-$2');
   };

   const formatCpfCnpj = (value: string) => {
      const numeric = value.replace(/\D/g, '');
      if (numeric.length > 11) {
         return formatCNPJ(value);
      }
      return formatCPF(value);
   };

   const formatPhone = (value: string) => {
      const numeric = value.replace(/\D/g, '').slice(0, 11);
      if (numeric.length > 10) {
         return numeric.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (numeric.length > 5) {
         return numeric.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else if (numeric.length > 2) {
         return numeric.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
      }
      return numeric;
   };

   const formatCurrency = (value: number | undefined) => {
      if (value === undefined || value === null) return '';
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
   };

   const formatDateMask = (value: string) => {
      return value
         .replace(/\D/g, '')
         .slice(0, 8)
         .replace(/(\d{2})(\d)/, '$1/$2')
         .replace(/(\d{2})(\d)/, '$1/$2');
   };

   const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.name as keyof NegotiationData, formatCPF(e.target.value));
   };

   const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.name as keyof NegotiationData, formatCNPJ(e.target.value));
   };

   const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.name as keyof NegotiationData, formatPhone(e.target.value));
   };

   const handleHybridChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.name as keyof NegotiationData, formatCpfCnpj(e.target.value));
   };

   const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, '');
      const numericValue = rawValue ? parseInt(rawValue, 10) / 100 : 0;
      onChange(e.target.name as keyof NegotiationData, numericValue);
   };

   // Handlers for specific fields that trigger API lookups
   const handleOwnerCpfCnpjBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, '');
      if (val.length === 14) {
         handleCnpjFetch(val, 'proprietarioNome');
      }
   };

   const handleOperatorCnpjBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, '');
      if (val.length === 14) {
         handleCnpjFetch(val, 'locatarioRazaoSocial');
      }
   };

   const handleGuarantorCnpjBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, '');
      if (val.length === 14) {
         handleCnpjFetch(val, 'garantiaFiadorNome');
      }
   };

   const handleAddCompany = () => {
      if (companyInput.trim()) {
         // Check if input looks like a CNPJ to fetch name, otherwise just add
         const clean = companyInput.replace(/\D/g, '');
         if (clean.length === 14 && !companyInput.includes('(')) { // Avoid double fetch if already formatted
            setLoadingCnpj(prev => ({ ...prev, 'cessao': true }));
            fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`)
               .then(res => res.json())
               .then(data => {
                  const formatted = `${data.razao_social} (${formatCNPJ(clean)})`;
                  const currentList = data.empresasEnvolvidasCessao || [];
                  onChange('empresasEnvolvidasCessao', [...currentList, formatted]);
                  setCompanyInput('');
               })
               .catch(() => {
                  // Fallback if fetch fails
                  const currentList = data.empresasEnvolvidasCessao || [];
                  onChange('empresasEnvolvidasCessao', [...currentList, companyInput.trim()]);
                  setCompanyInput('');
               })
               .finally(() => setLoadingCnpj(prev => ({ ...prev, 'cessao': false })));
         } else {
            const currentList = data.empresasEnvolvidasCessao || [];
            onChange('empresasEnvolvidasCessao', [...currentList, companyInput.trim()]);
            setCompanyInput('');
         }
      }
   };

   const handleRemoveCompany = (index: number) => {
      const currentList = data.empresasEnvolvidasCessao || [];
      const updated = [...currentList];
      updated.splice(index, 1);
      onChange('empresasEnvolvidasCessao', updated);
   };

   const isVariableRent = data.modeloAluguel.toLowerCase().includes('variável');

   // Helper Component for Address Fields
   const renderAddressFields = (prefix: keyof NegotiationData, title: string) => {
      const address = data[prefix] as AddressData;
      const isLoading = loadingCep[prefix];

      return (
         <div className="bg-gray-50 p-4 rounded-md border border-gray-100 mt-2">
            <h5 className="text-sm font-semibold text-gray-700 mb-3">{title}</h5>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
               <div className="md:col-span-3 relative">
                  <label className="block text-xs font-medium text-gray-500 mb-1">CEP</label>
                  <div className="relative">
                     <input
                        type="text"
                        value={address.cep || ''}
                        onChange={(e) => handleAddressChange(prefix, 'cep', e.target.value)}
                        onBlur={(e) => handleCepFetch(prefix, e.target.value)}
                        placeholder="00000-000"
                        className="w-full border-gray-300 rounded-md shadow-sm border p-2 pl-8 bg-white text-black text-sm"
                     />
                     <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        {isLoading ? <Loader2 size={14} className="animate-spin text-blue-600" /> : <Search size={14} className="text-gray-400" />}
                     </div>
                  </div>
               </div>
               <div className="md:col-span-7">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Endereço (Rua/Av.)</label>
                  <input type="text" value={address.logradouro || ''} onChange={(e) => handleAddressChange(prefix, 'logradouro', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black text-sm" />
               </div>
               <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Número</label>
                  <input type="text" value={address.numero || ''} onChange={(e) => handleAddressChange(prefix, 'numero', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black text-sm" />
               </div>
               <div className="md:col-span-5">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Bairro</label>
                  <input type="text" value={address.bairro || ''} onChange={(e) => handleAddressChange(prefix, 'bairro', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black text-sm" />
               </div>
               <div className="md:col-span-5">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Cidade</label>
                  <input type="text" value={address.cidade || ''} onChange={(e) => handleAddressChange(prefix, 'cidade', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black text-sm" />
               </div>
               <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">UF</label>
                  <select value={address.uf || ''} onChange={(e) => handleAddressChange(prefix, 'uf', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black text-sm">
                     <option value="">UF</option>
                     {LISTS.uf.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
               </div>
            </div>
         </div>
      );
   };

   const tabs = [
      { id: '1', label: '1. Identificação', icon: <FileText size={16} /> },
      { id: '2', label: '2. Localização', icon: <MapPin size={16} /> },
      { id: '3', label: '3. Operacional', icon: <Flag size={16} /> },
      { id: '4', label: '4. Partes', icon: <User size={16} /> },
      { id: '5', label: '5. Garantias', icon: <ShieldCheck size={16} /> },
      { id: '6', label: '6. Contrato', icon: <Building2 size={16} /> },
      { id: '7', label: '7. Econômico', icon: <Calculator size={16} /> },
      { id: '8', label: '8. Investimentos', icon: <HardHat size={16} /> },
      { id: '9', label: '9. Bandeira/Op', icon: <Fuel size={16} /> },
      { id: '10', label: '10. Regulatório', icon: <ScrollText size={16} /> },
      { id: '11', label: '11. Ambiental', icon: <Leaf size={16} /> },
      { id: '12', label: '12. Prazo/Saída', icon: <Hourglass size={16} /> },
      { id: '13', label: '13. Não Concorrência', icon: <Ban size={16} /> },
      { id: '14', label: '14. Jurídico', icon: <Scale size={16} /> },
      { id: '15', label: '15. Obs/Anexos', icon: <MessageSquare size={16} /> },
   ];

   return (
      <div className="space-y-6">

         {/* Tabs Navigation */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
            <div className="overflow-x-auto">
               <nav className="flex min-w-max border-b border-gray-100">
                  {tabs.map((tab) => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveSection(tab.id)}
                        className={`
                   flex items-center gap-2 px-4 py-4 text-sm font-medium transition-all border-b-2 whitespace-nowrap
                   ${activeSection === tab.id
                              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                              : 'border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-100/50 hover:scale-[1.02]'
                           }
                `}
                     >
                        {tab.icon}
                        {tab.label}
                     </button>
                  ))}
               </nav>
            </div>
         </div>

         {/* SECTION 1: IDENTIFICAÇÃO */}
         {activeSection === '1' && (
            <SectionCard title="1. Identificação do Negócio" icon={<FileText size={20} />}>
               <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Interno do Projeto *</label>
                        <input
                           type="text" name="nomeProjeto" value={data.nomeProjeto} onChange={handleChange}
                           className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black focus:ring-blue-500 focus:border-blue-500"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                        <select name="prioridade" value={data.prioridade} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                           {LISTS.prioridade.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Prevista de Início *</label>
                        <input
                           type="date" name="dataPrevista" value={data.dataPrevista} onChange={handleChange}
                           className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsável Comercial *</label>
                        <input
                           type="text" name="responsavelComercial" value={data.responsavelComercial} onChange={handleChange}
                           className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail do Responsável Comercial</label>
                        <input
                           type="email" name="responsavelComercialEmail" value={data.responsavelComercialEmail || ''} onChange={handleChange}
                           className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black"
                        />
                     </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                     <h4 className="font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2">Contato do Proprietário (Rápido)</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                           <input
                              type="text" name="proprietarioNome" value={data.proprietarioNome} onChange={handleChange}
                              className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                           <input
                              type="tel" name="proprietarioTelefone" value={data.proprietarioTelefone || ''} onChange={handlePhoneChange}
                              className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="(XX) XXXXX-XXXX"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                           <input
                              type="email" name="proprietarioEmail" value={data.proprietarioEmail || ''} onChange={handleChange}
                              className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black"
                           />
                        </div>
                     </div>
                     <p className="text-xs text-gray-500 mt-2">Preencha a qualificação completa na Seção 4 (Partes Envolvidas).</p>
                  </div>
               </div>
               <SectionFAQ sectionId="1" items={SECTION_FAQS['1'] || []} />
            </SectionCard>
         )}

         {/* SECTION 2: LOCALIZAÇÃO */}
         {activeSection === '2' && (
            <SectionCard title="2. Localização e Características do Imóvel" icon={<MapPin size={20} />}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                     <div className="relative">
                        <input
                           type="text"
                           name="cep"
                           value={data.cep || ''}
                           onChange={handleChange}
                           onBlur={(e) => handleCepFetch('cep', e.target.value)}
                           placeholder="00000-000"
                           className="w-full md:w-1/3 border-gray-300 rounded-md shadow-sm border p-2 pl-9 bg-white text-black"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           {loadingCep['cep'] ? (
                              <Loader2 size={16} className="animate-spin text-blue-500" />
                           ) : (
                              <Search size={16} className="text-gray-400" />
                           )}
                        </div>
                        {loadingCep['cep'] && <span className="text-xs text-blue-600 ml-2">Buscando endereço...</span>}
                     </div>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço (Rua/Av.)</label>
                        <input type="text" name="endereco" value={data.endereco} onChange={handleChange} placeholder="Rua..." className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                        <input type="text" name="numero" value={data.numero} onChange={handleChange} placeholder="123" className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                     <input type="text" name="bairro" value={data.bairro} onChange={handleChange} placeholder="Bairro" className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Cidade / UF</label>
                     <div className="flex gap-2">
                        <input type="text" name="cidade" placeholder="Cidade" value={data.cidade} onChange={handleChange} className="flex-1 border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                        <select name="uf" value={data.uf} onChange={handleChange} className="w-24 border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                           <option value="">UF</option>
                           {LISTS.uf.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                        </select>
                     </div>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Área do terreno (m²)</label>
                        <input type="number" name="areaTerreno" value={data.areaTerreno || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Área construída (m²)</label>
                        <input type="number" name="areaConstruida" value={data.areaConstruida || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Área</label>
                     <select name="tipoArea" value={data.tipoArea} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                        {LISTS.tipo_area.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                     </select>
                  </div>

                  {data.tipoArea === 'Rodovia' && (
                     <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Detalhes da Rodovia</label>
                        <input type="text" name="detalhesRodovia" value={data.detalhesRodovia || ''} onChange={handleChange} placeholder="Ex: BR-116, Km 45" className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                     </div>
                  )}

                  <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Informações de zoneamento/uso do solo *</label>
                     <input type="text" name="zoneamento" value={data.zoneamento || ''} onChange={handleChange} placeholder="Ex: ZC-2 (Zona Comercial 2)" className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                  </div>
               </div>
            </SectionCard>
         )}

         {/* SECTION 3: DADOS OPERACIONAIS */}
         {activeSection === '3' && (
            <SectionCard title="3. Dados Operacionais" icon={<Flag size={20} />}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 flex items-center gap-2 mb-2">
                     <input type="checkbox" name="emOperacao" checked={data.emOperacao} onChange={handleChange} id="emOperacao" className="h-5 w-5 text-blue-600 rounded" />
                     <label htmlFor="emOperacao" className="text-sm font-medium text-gray-700">O posto está em operação atualmente?</label>
                  </div>

                  {data.emOperacao && (
                     <>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Volume mensal (litros)</label>
                           <input type="number" name="volumeMensal" value={data.volumeMensal} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                        </div>
                        <div className="md:col-span-2">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Atividades além de abastecimento</label>
                           <input type="text" name="atividadesAdicionais" value={data.atividadesAdicionais || ''} onChange={handleChange} placeholder="Ex: Loja de conveniência, troca de óleo..." className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                        </div>
                     </>
                  )}
               </div>
            </SectionCard>
         )}

         {/* SECTION 4: PARTES ENVOLVIDAS */}
         {activeSection === '4' && (
            <SectionCard title="4. Partes Envolvidas" icon={<User size={20} />}>
               <div className="space-y-6">

                  {/* LOCADOR SECTION */}
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                     <h4 className="font-semibold text-gray-700 mb-4 border-b pb-2">Qualificação do Proprietário (Locador)</h4>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">CPF ou CNPJ *</label>
                           <div className="relative">
                              <input
                                 type="text"
                                 name="proprietarioCpfCnpj"
                                 value={data.proprietarioCpfCnpj || ''}
                                 onChange={handleHybridChange}
                                 onBlur={handleOwnerCpfCnpjBlur}
                                 className="w-full border-gray-300 rounded-md shadow-sm border p-2 pr-8 bg-white text-black"
                                 placeholder="000.000.000-00 ou 00.000.000/0000-00"
                              />
                              {loadingCnpj['proprietarioNome'] && (
                                 <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                    <Loader2 size={16} className="animate-spin text-blue-500" />
                                 </div>
                              )}
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Nome ou Razão Social *</label>
                           <input type="text" name="proprietarioNome" value={data.proprietarioNome} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Preenchimento automático p/ CNPJ" />
                        </div>

                        {/* Structured Address */}
                        <div className="md:col-span-2">
                           {renderAddressFields('proprietarioEndereco', 'Endereço Completo do Proprietário')}
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Estadual (se PJ)</label>
                           <input type="text" name="proprietarioInscricaoEstadual" value={data.proprietarioInscricaoEstadual || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Municipal (se PJ)</label>
                           <input type="text" name="proprietarioInscricaoMunicipal" value={data.proprietarioInscricaoMunicipal || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                        </div>
                     </div>

                     {/* Legal Representative */}
                     <div className="border-t border-gray-200 pt-4 mb-4">
                        <h5 className="font-medium text-gray-700 mb-3">Representante Legal</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                              <input type="text" name="proprietarioRepresentanteNome" value={data.proprietarioRepresentanteNome || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                              <input type="text" name="proprietarioRepresentanteCpf" value={data.proprietarioRepresentanteCpf || ''} onChange={handleCpfChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="00.000.000-00" />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">RG e órgão emissor</label>
                              <input type="text" name="proprietarioRepresentanteRg" value={data.proprietarioRepresentanteRg || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo/Função *</label>
                              <input type="text" name="proprietarioRepresentanteCargo" value={data.proprietarioRepresentanteCargo || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                           </div>
                        </div>
                     </div>

                     {/* Governance */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Instrumento de poderes *</label>
                           <select name="proprietarioInstrumentoPoderes" value={data.proprietarioInstrumentoPoderes} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                              {LISTS.instrumento_poderes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Data do instrumento</label>
                           <input type="date" name="proprietarioDataInstrumento" value={data.proprietarioDataInstrumento || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                        </div>
                     </div>

                     {/* Structure */}
                     <div className="space-y-4 pt-2">
                        <div className="flex flex-col">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Existem coproprietários? *</label>
                           <select
                              name="proprietarioTemCoproprietarios"
                              value={data.proprietarioTemCoproprietarios ? 'true' : 'false'}
                              onChange={handleBooleanSelectChange}
                              className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black"
                           >
                              <option value="false">Não</option>
                              <option value="true">Sim</option>
                           </select>

                           {data.proprietarioTemCoproprietarios && (
                              <div className="mt-2">
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Listar coproprietários</label>
                                 <textarea
                                    name="proprietarioCoproprietariosLista"
                                    value={data.proprietarioCoproprietariosLista || ''}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-md shadow-sm border p-2 text-sm bg-white text-black"
                                    placeholder="Nome, CPF/CNPJ, % propriedade..."
                                    rows={2}
                                 />
                              </div>
                           )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Existe usufrutuário? *</label>
                              <select name="proprietarioTemUsufructuario" value={data.proprietarioTemUsufructuario ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                                 <option value="false">Não</option>
                                 <option value="true">Sim</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Existe espólio? *</label>
                              <select name="proprietarioTemEspolio" value={data.proprietarioTemEspolio ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                                 <option value="false">Não</option>
                                 <option value="true">Sim</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Anuência de todos os intervenientes obtida? *</label>
                              <select name="proprietarioAnuenciaIntervenientes" value={data.proprietarioAnuenciaIntervenientes} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                                 {LISTS.anuencia_status.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* LOCATÁRIO SECTION */}
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                     <h4 className="font-semibold text-gray-700 mb-4 border-b pb-2">Qualificação do Locatário (Grupo)</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ do operador *</label>
                           <div className="relative">
                              <input
                                 type="text"
                                 name="locatarioCnpj"
                                 value={data.locatarioCnpj}
                                 onChange={handleCnpjChange}
                                 onBlur={handleOperatorCnpjBlur}
                                 className="w-full border-gray-300 rounded-md shadow-sm border p-2 pr-8 bg-white text-black"
                                 placeholder="00.000.000/0000-00"
                              />
                              {loadingCnpj['locatarioRazaoSocial'] && (
                                 <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                    <Loader2 size={16} className="animate-spin text-blue-500" />
                                 </div>
                              )}
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social *(Empresa do Grupo que vai operar)</label>
                           <input type="text" name="locatarioRazaoSocial" value={data.locatarioRazaoSocial} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                        </div>

                        {/* Structured Address */}
                        <div className="md:col-span-2">
                           {renderAddressFields('locatarioEndereco', 'Endereço da Sede do Locatário')}
                        </div>
                     </div>

                     <div className="border-t border-gray-200 pt-4">
                        <h5 className="font-medium text-gray-700 mb-3">Representante Legal</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                              <input type="text" name="locatarioRepresentanteNome" value={data.locatarioRepresentanteNome} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                              <input type="text" name="locatarioRepresentanteCpf" value={data.locatarioRepresentanteCpf} onChange={handleCpfChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="00.000.000-00" />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
                              <input type="text" name="locatarioRepresentanteCargo" value={data.locatarioRepresentanteCargo} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </SectionCard>
         )}

         {/* SECTION 5: GARANTIAS E FIADOR */}
         {activeSection === '5' && (
            <SectionCard title="5. Garantias e Fiador" icon={<ShieldCheck size={20} />}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-1">O proprietário exige garantidor? *</label>
                     <select name="exigeGarantidor" value={data.exigeGarantidor ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                        <option value="false">Não</option>
                        <option value="true">Sim</option>
                     </select>
                  </div>

                  <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de garantia pretendida *</label>
                     <select name="tipoGarantia" value={data.tipoGarantia} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                        {LISTS.tipo_garantia.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                     </select>
                  </div>

                  {/* CAUÇÃO FIELDS */}
                  {data.tipoGarantia === 'Caução em dinheiro' && (
                     <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Valor em R$</label>
                           <input type="text" name="garantiaCaucaoValor" value={formatCurrency(data.garantiaCaucaoValor)} onChange={handleCurrencyChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Geralmente 3 aluguéis" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Conta para depósito</label>
                           <input type="text" name="garantiaCaucaoConta" value={data.garantiaCaucaoConta || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Dados bancários" />
                        </div>
                     </div>
                  )}

                  {/* FIANÇA FIELDS (PF, PJ, BANCÁRIA) */}
                  {(data.tipoGarantia.includes('Fiança') || data.tipoGarantia.includes('fianç')) && data.tipoGarantia !== 'Seguro fiança' && (
                     <div className="md:col-span-2 bg-gray-50 p-4 rounded-md border border-gray-200 space-y-4">
                        <h4 className="font-semibold text-gray-700 border-b pb-2">Dados do Fiador</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ do fiador</label>
                              <div className="relative">
                                 <input
                                    type="text"
                                    name="garantiaFiadorCpfCnpj"
                                    value={data.garantiaFiadorCpfCnpj || ''}
                                    onChange={handleHybridChange}
                                    onBlur={handleGuarantorCnpjBlur}
                                    className="w-full border-gray-300 rounded-md shadow-sm border p-2 pr-8 bg-white text-black"
                                    placeholder="CPF ou CNPJ"
                                 />
                                 {loadingCnpj['garantiaFiadorNome'] && (
                                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                       <Loader2 size={16} className="animate-spin text-blue-500" />
                                    </div>
                                 )}
                              </div>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do fiador</label>
                              <input type="text" name="garantiaFiadorNome" value={data.garantiaFiadorNome || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                           </div>

                           <div className="md:col-span-2">
                              {renderAddressFields('garantiaFiadorEndereco', 'Endereço Completo do Fiador')}
                           </div>

                           {/* Specific for Person */}
                           {data.tipoGarantia === 'Fiança pessoa física' && (
                              <div className="md:col-span-2">
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Estado civil e cônjuge (se PF)</label>
                                 <input type="text" name="garantiaFiadorEstadoCivil" value={data.garantiaFiadorEstadoCivil || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Outorga uxória necessária se casado" />
                              </div>
                           )}

                           <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Patrimônio declarado</label>
                              <input type="text" name="garantiaFiadorPatrimonio" value={data.garantiaFiadorPatrimonio || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Para análise de solvência" />
                           </div>

                           <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Renúncia ao benefício de ordem? *</label>
                              <select name="garantiaFiadorRenunciaBeneficio" value={data.garantiaFiadorRenunciaBeneficio ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                                 <option value="false">Não</option>
                                 <option value="true">Sim</option>
                              </select>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* SEGURO FIANÇA FIELDS */}
                  {data.tipoGarantia === 'Seguro fiança' && (
                     <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Seguradora pretendida</label>
                           <input type="text" name="garantiaSeguroSeguradora" value={data.garantiaSeguroSeguradora || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Valor da apólice</label>
                           <input type="text" name="garantiaSeguroValor" value={formatCurrency(data.garantiaSeguroValor)} onChange={handleCurrencyChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                        </div>
                     </div>
                  )}
               </div>
            </SectionCard>
         )}

         {/* SECTION 6: ESTRUTURA CONTRATUAL */}
         {activeSection === '6' && (
            <SectionCard title="6. Estrutura Contratual" icon={<Building2 size={20} />}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Modelo de contrato *</label>
                     <select name="modeloContrato" value={data.modeloContrato} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                        {LISTS.modelo_contrato.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                     </select>
                     <p className="text-xs text-gray-500 mt-1 italic">Ver aba Matriz de Decisão</p>
                  </div>

                  <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Justificativa do modelo escolhido</label>
                     <textarea name="justificativaModelo" value={data.justificativaModelo} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 h-20 resize-y bg-white text-black" placeholder="Fundamentar a escolha..."></textarea>
                  </div>

                  <div className="md:col-span-2"><hr className="border-gray-100" /></div>

                  {/* Opção de Compra */}
                  <div className="md:col-span-2 space-y-3">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Há intenção de opção de compra? *</label>
                        <select name="intencaoCompra" value={data.intencaoCompra ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                           <option value="false">Não</option>
                           <option value="true">Sim</option>
                        </select>
                     </div>

                     {data.intencaoCompra && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded border border-gray-200">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo para exercício da opção</label>
                              <input type="text" name="prazoExercicioOpcao" value={data.prazoExercicioOpcao || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Meses" />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Critério de preço</label>
                              <input type="text" name="criterioPrecoOpcao" value={data.criterioPrecoOpcao || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Fórmula ou valor fixo" />
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="md:col-span-2"><hr className="border-gray-100" /></div>

                  <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Existe direito de preferência reforçado?</label>
                     <select name="direitoPreferenciaReforcado" value={data.direitoPreferenciaReforcado ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                        <option value="false">Não</option>
                        <option value="true">Sim</option>
                     </select>
                  </div>

                  <div className="md:col-span-2"><hr className="border-gray-100" /></div>

                  <div className="md:col-span-2 space-y-3">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cessão intra-grupo será necessária? *</label>
                        <select name="cessaoIntraGrupo" value={data.cessaoIntraGrupo ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                           <option value="false">Não</option>
                           <option value="true">Sim</option>
                        </select>
                     </div>
                     {data.cessaoIntraGrupo && (
                        <div className="bg-gray-50 p-4 rounded border border-gray-200">
                           <label className="block text-sm font-medium text-gray-700 mb-2">Empresas envolvidas</label>

                           {/* List */}
                           {(data.empresasEnvolvidasCessao || []).length > 0 && (
                              <div className="mb-3 space-y-2">
                                 {(data.empresasEnvolvidasCessao || []).map((empresa, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 text-sm">
                                       <span className="text-black">{empresa}</span>
                                       <button onClick={() => handleRemoveCompany(idx)} className="text-red-500 hover:text-red-700 p-1">
                                          <Trash2 size={16} />
                                       </button>
                                    </div>
                                 ))}
                              </div>
                           )}

                           {/* Add Input */}
                           <div className="flex gap-2 relative">
                              <input
                                 type="text"
                                 value={companyInput}
                                 onChange={(e) => setCompanyInput(e.target.value)}
                                 className="flex-1 border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black"
                                 placeholder="CNPJ (Auto-preenchimento) ou Razão Social"
                                 onKeyDown={(e) => { if (e.key === 'Enter') handleAddCompany(); }}
                              />
                              {loadingCnpj['cessao'] && (
                                 <div className="absolute inset-y-0 right-14 pr-2 flex items-center pointer-events-none">
                                    <Loader2 size={16} className="animate-spin text-blue-500" />
                                 </div>
                              )}
                              <button
                                 type="button"
                                 onClick={handleAddCompany}
                                 className="bg-blue-600 text-white p-2 rounded-md btn-premium btn-hover-lift flex items-center justify-center"
                              >
                                 <Plus size={20} />
                              </button>
                           </div>
                           <p className="text-xs text-gray-500 mt-1">Digite um CNPJ para buscar automaticamente a Razão Social.</p>
                        </div>
                     )}
                  </div>
               </div>
            </SectionCard>
         )}

         {/* SECTION 7: CONDIÇÕES ECONÔMICAS */}
         {activeSection === '7' && (
            <SectionCard title="7. Condições Econômicas" icon={<Calculator size={20} />}>
               <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100 space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Modelo do aluguel *</label>
                           <select name="modeloAluguel" value={data.modeloAluguel} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                              {LISTS.modelo_aluguel.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Valor do aluguel fixo mensal (R$) *</label>
                           <input type="text" name="valorAluguelFixo" value={formatCurrency(data.valorAluguelFixo)} onChange={handleCurrencyChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                        </div>
                     </div>

                     <div>
                        <label className={`block text-sm font-medium mb-1 ${isVariableRent ? 'text-gray-700' : 'text-gray-400'}`}>
                           Aluguel variável: critério
                        </label>
                        <input type="text" name="aluguelVariavelCriterio" value={data.aluguelVariavelCriterio || ''} onChange={handleChange} disabled={!isVariableRent} className={`w-full border-gray-300 rounded-md shadow-sm border p-2 ${!isVariableRent ? 'bg-gray-100 text-gray-400' : 'bg-white text-black'}`} placeholder="% do faturamento, litros vendidos, etc." />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Existe aluguel mínimo garantido?</label>
                           <select name="aluguelMinimoGarantido" value={data.aluguelMinimoGarantido ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                              <option value="false">Não</option>
                              <option value="true">Sim</option>
                           </select>
                        </div>
                        {data.aluguelMinimoGarantido && (
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                              <input type="text" name="valorAluguelMinimo" value={formatCurrency(data.valorAluguelMinimo)} onChange={handleCurrencyChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Valor Mínimo" />
                           </div>
                        )}
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Indexador de reajuste *</label>
                           <select name="indexadorReajuste" value={data.indexadorReajuste} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                              {LISTS.indexador.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Data-base do reajuste *</label>
                           <input type="text" name="dataBaseReajuste" value={data.dataBaseReajuste} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Ex: Mês de aniversário" />
                        </div>
                     </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100 space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Carência de aluguel? *</label>
                           <select name="temCarencia" value={data.temCarencia ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                              <option value="false">Não</option>
                              <option value="true">Sim</option>
                           </select>
                        </div>

                        {data.temCarencia && (
                           <>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Meses de carência</label>
                                 <input type="number" name="carenciaMeses" value={data.carenciaMeses} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de carência</label>
                                 <select name="tipoCarencia" value={data.tipoCarencia || 'Total'} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                                    {LISTS.tipo_carencia.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                 </select>
                              </div>
                           </>
                        )}
                     </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100 space-y-4">
                     <div className="grid grid-cols-1 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Pagamento inicial (luvas/prêmio)? *</label>
                           <select name="temPagamentoInicial" value={data.temPagamentoInicial ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                              <option value="false">Não</option>
                              <option value="true">Sim</option>
                           </select>
                        </div>

                        {data.temPagamentoInicial && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-l-2 border-blue-200 pl-4">
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                                 <input type="text" name="valorPagamentoInicial" value={formatCurrency(data.valorPagamentoInicial)} onChange={handleCurrencyChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Data de pagamento</label>
                                 <input type="date" name="dataPagamentoInicial" value={data.dataPagamentoInicial || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                              </div>
                              <div className="md:col-span-2">
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Condições</label>
                                 <input type="text" name="condicoesPagamentoInicial" value={data.condicoesPagamentoInicial || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Parcelamento, marcos de obra, etc." />
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100 space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Quem paga IPTU e taxas municipais? *</label>
                           <select name="responsavelIptu" value={data.responsavelIptu} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                              {LISTS.responsavel_custos.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Quem paga seguro patrimonial? *</label>
                           <select name="responsavelSeguro" value={data.responsavelSeguro} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                              {LISTS.responsavel_custos.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Custos de registro do contrato *</label>
                           <select name="responsavelRegistro" value={data.responsavelRegistro} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                              {LISTS.responsavel_registro.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                        </div>
                     </div>
                  </div>
               </div>
            </SectionCard>
         )}

         {/* SECTION 8: INVESTIMENTOS E BENFEITORIAS */}
         {activeSection === '8' && (
            <SectionCard title="8. Investimentos e Benfeitorias" icon={<HardHat size={20} />}>
               <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CAPEX inicial estimado do Grupo (R$) *</label>
                        <input type="text" name="capexEstimado" value={formatCurrency(data.capexEstimado)} onChange={handleCurrencyChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prazo estimado para obras (dias)</label>
                        <input type="number" name="prazoObrasDias" value={data.prazoObrasDias || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Até operação plena" />
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Itens principais do CAPEX *</label>
                     <textarea name="itensPrincipaisCapex" value={data.itensPrincipaisCapex || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Pista, canopy, loja, tanques, etc." rows={2} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quem executa e contrata obras? *</label>
                        <select name="responsavelObras" value={data.responsavelObras} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                           {LISTS.responsavel_obras.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Autorização prévia do proprietário para obras? *</label>
                        <select name="autorizacaoObras" value={data.autorizacaoObras ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                           <option value="false">Não</option>
                           <option value="true">Sim</option>
                        </select>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tratamento do investimento em saída antecipada *</label>
                        <select name="tratamentoInvestimentoSaida" value={data.tratamentoInvestimentoSaida} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                           {LISTS.tratamento_investimento.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fórmula de amortização</label>
                        <input type="text" name="formulaAmortizacao" value={data.formulaAmortizacao || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Linear, prazo, etc." />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Benfeitorias ficam no imóvel ao término? *</label>
                        <select name="destinoBenfeitorias" value={data.destinoBenfeitorias} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                           {LISTS.destino_benfeitorias.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                     </div>
                  </div>

                  {data.destinoBenfeitorias !== 'Todas' && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lista de benfeitorias removíveis</label>
                        <textarea name="listaBenfeitoriasRemoviveis" value={data.listaBenfeitoriasRemoviveis || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Detalhar" rows={2} />
                     </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">O proprietário participa dos investimentos?</label>
                           <select name="proprietarioParticipaInvestimento" value={data.proprietarioParticipaInvestimento ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                              <option value="false">Não</option>
                              <option value="true">Sim</option>
                           </select>
                        </div>
                        {data.proprietarioParticipaInvestimento && (
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                              <input type="text" name="valorInvestimentoProprietario" value={formatCurrency(data.valorInvestimentoProprietario)} onChange={handleCurrencyChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </SectionCard>
         )}

         {/* SECTION 9: OPERAÇÃO, BANDEIRA E DISTRIBUIDORA */}
         {activeSection === '9' && (
            <SectionCard title="9. Operação, Bandeira e Distribuidora" icon={<Fuel size={20} />}>
               <div className="space-y-6">
                  {/* ... (Kept until Third Parties) ... */}
                  <datalist id="distribuidoras">
                     {LISTS.distribuidoras.map(opt => <option key={opt} value={opt} />)}
                  </datalist>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bandeira do posto *</label>
                        <select name="tipoBandeira" value={data.tipoBandeira} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                           {LISTS.tipo_bandeira.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                     </div>

                     {data.tipoBandeira === 'Bandeirado' && (
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Distribuidora pretendida</label>
                           <input list="distribuidoras" name="distribuidoraPretendida" value={data.distribuidoraPretendida || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Digite ou selecione..." />
                        </div>
                     )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Existe contrato vigente com distribuidora? *</label>
                           <select name="temContratoVigenteDistribuidora" value={data.temContratoVigenteDistribuidora ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                              <option value="false">Não</option>
                              <option value="true">Sim</option>
                           </select>
                        </div>

                        {data.temContratoVigenteDistribuidora && (
                           <>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Distribuidora atual</label>
                                 <input list="distribuidoras" type="text" name="distribuidoraAtual" value={data.distribuidoraAtual || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Digite ou selecione..." />
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Prazo remanescente (meses)</label>
                                 <input type="number" name="prazoRemanescenteContrato" value={data.prazoRemanescenteContrato || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Multa ou saldo de galonagem</label>
                                 <input type="text" name="multaSaldoGalonagem" value={data.multaSaldoGalonagem || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Valor ou volume" />
                              </div>
                           </>
                        )}
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Há obrigação de galonagem mínima?</label>
                        <select name="temObrigacaoGalonagemMinima" value={data.temObrigacaoGalonagemMinima ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                           <option value="false">Não</option>
                           <option value="true">Sim</option>
                        </select>
                     </div>
                     {data.temObrigacaoGalonagemMinima && (
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Volume mensal (litros)</label>
                           <input type="number" name="volumeGalonagemMensal" value={data.volumeGalonagemMensal || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                        </div>
                     )}
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Distribuidora permite cessão/troca sem penalidade?</label>
                     <select name="distribuidoraPermiteCessao" value={data.distribuidoraPermiteCessao} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                        {LISTS.distribuidora_cessao.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                     </select>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Terceiros explorando áreas do posto? *</label>
                           <select name="temTerceirosExplorando" value={data.temTerceirosExplorando ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                              <option value="false">Não</option>
                              <option value="true">Sim</option>
                           </select>
                        </div>
                     </div>
                     {data.temTerceirosExplorando && (
                        <div className="mt-4 bg-gray-50 p-4 rounded border border-gray-200">
                           <label className="block text-sm font-medium text-gray-700 mb-2">Lista de Terceiros e Contratos</label>

                           {/* List of Third Parties */}
                           {(data.terceiros || []).length > 0 && (
                              <div className="space-y-2 mb-3">
                                 <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 uppercase px-2">
                                    <div className="col-span-5">Nome</div>
                                    <div className="col-span-4">Atividade</div>
                                    <div className="col-span-2">Prazo</div>
                                 </div>
                                 {(data.terceiros || []).map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded border border-gray-200 text-sm">
                                       <div className="col-span-5 truncate text-black font-medium">{item.nome}</div>
                                       <div className="col-span-4 truncate text-gray-600">{item.atividade}</div>
                                       <div className="col-span-2 truncate text-gray-600">{item.prazo}</div>
                                       <div className="col-span-1 text-right">
                                          <button onClick={() => handleRemoveThirdParty(idx)} className="text-red-500 hover:text-red-700 p-1">
                                             <Trash2 size={16} />
                                          </button>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           )}

                           {/* Add Input */}
                           <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                              <div className="md:col-span-5">
                                 <label className="block text-xs text-gray-500 mb-1">Nome</label>
                                 <input type="text" value={tpName} onChange={(e) => setTpName(e.target.value)} className="w-full border-gray-300 rounded p-1 text-sm bg-white text-black" placeholder="Nome" />
                              </div>
                              <div className="md:col-span-4">
                                 <label className="block text-xs text-gray-500 mb-1">Atividade</label>
                                 <input type="text" value={tpActivity} onChange={(e) => setTpActivity(e.target.value)} className="w-full border-gray-300 rounded p-1 text-sm bg-white text-black" placeholder="Ex: Borracharia" />
                              </div>
                              <div className="md:col-span-2">
                                 <label className="block text-xs text-gray-500 mb-1">Prazo</label>
                                 <input type="text" value={tpTerm} onChange={(e) => setTpTerm(formatDateMask(e.target.value))} className="w-full border-gray-300 rounded p-1 text-sm bg-white text-black placeholder-gray-400" placeholder="DD/MM/AAAA" />
                              </div>
                              <div className="md:col-span-1">
                                 <button
                                    type="button"
                                    onClick={handleAddThirdParty}
                                    disabled={!tpName || !tpActivity}
                                    className="bg-blue-600 text-white w-full p-1.5 rounded hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
                                 >
                                    <Plus size={18} />
                                 </button>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </SectionCard>
         )}

         {/* SECTION 10: LICENÇAS E REGULATÓRIO */}
         {activeSection === '10' && (
            <SectionCard title="10. Licenças e Regulatório" icon={<ScrollText size={20} />}>
               {/* ... (Kept as is) ... */}
               <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alvará municipal está ativo? *</label>
                        <select name="alvaraMunicipalAtivo" value={data.alvaraMunicipalAtivo} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                           {LISTS.status_regularidade.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Validade do alvará</label>
                        <input type="date" name="validadeAlvara" value={data.validadeAlvara || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">AVCB está válido? *</label>
                        <select name="avcbValido" value={data.avcbValido} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                           {LISTS.status_regularidade.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Validade do AVCB</label>
                        <input type="date" name="validadeAvcb" value={data.validadeAvcb || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                     </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Situação ANP - cadastro e pendências *</label>
                           <select name="situacaoAnp" value={data.situacaoAnp} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                              {LISTS.situacao_anp.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                        </div>
                        {(data.situacaoAnp === 'Irregular' || data.situacaoAnp === 'Pendências') && (
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Detalhar</label>
                              <textarea name="detalhePendenciasAnp" value={data.detalhePendenciasAnp || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" rows={2} />
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Licença ambiental está válida? *</label>
                           <select name="licencaAmbientalValida" value={data.licencaAmbientalValida ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                              <option value="false">Não</option>
                              <option value="true">Sim</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de licença ambiental</label>
                           <select name="tipoLicencaAmbiental" value={data.tipoLicencaAmbiental || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                              <option value="">Selecione...</option>
                              {LISTS.tipo_licenca_ambiental.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Validade da licença ambiental</label>
                           <input type="date" name="validadeLicencaAmbiental" value={data.validadeLicencaAmbiental || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Condicionantes da licença</label>
                           <textarea name="condicionantesLicencaAmbiental" value={data.condicionantesLicencaAmbiental || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Detalhar obrigações" rows={2} />
                        </div>
                     </div>
                  </div>
               </div>
            </SectionCard>
         )}

         {/* SECTION 11: AMBIENTAL E PASSIVOS */}
         {activeSection === '11' && (
            <SectionCard title="11. Ambiental e Passivos" icon={<Leaf size={20} />}>
               <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Histórico de vazamento ou contaminação? *</label>
                        <select name="historicoContaminacao" value={data.historicoContaminacao} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                           {LISTS.historico_contaminacao.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                     </div>
                     {data.historicoContaminacao === 'Sim' && (
                        <div className="md:col-span-2">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Resumo e documentos</label>
                           <textarea name="resumoContaminacao" value={data.resumoContaminacao || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" rows={2} />
                        </div>
                     )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Existem laudos de estanqueidade recentes? *</label>
                           <select name="temLaudosEstanqueidade" value={data.temLaudosEstanqueidade ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                              <option value="false">Não</option>
                              <option value="true">Sim</option>
                           </select>
                        </div>
                        {data.temLaudosEstanqueidade && (
                           <>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Data dos Laudos</label>
                                 <input type="date" name="laudoData" value={data.laudoData || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Resultado (Sintético)</label>
                                 <select name="laudoResultado" value={data.laudoResultado || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                                    <option value="">Selecione...</option>
                                    {LISTS.resultado_laudo.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                 </select>
                              </div>
                           </>
                        )}
                     </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                     <h4 className="font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2">Tanques</h4>

                     {/* List of Added Tanks */}
                     <div className="space-y-3 mb-4">
                        {(!data.tanques || data.tanques.length === 0) && (
                           <p className="text-sm text-gray-500 italic">Nenhum tanque adicionado.</p>
                        )}
                        {(data.tanques || []).map((tank, index) => (
                           <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white p-3 border rounded-md shadow-sm">
                              <div className="md:col-span-4">
                                 <label className="block text-xs font-semibold text-gray-500 uppercase">Tipo</label>
                                 <span className="text-sm font-medium text-gray-800">{tank.tipo}</span>
                              </div>
                              <div className="md:col-span-3">
                                 <label className="block text-xs font-medium text-gray-500 mb-1">Quantidade</label>
                                 <input
                                    type="number"
                                    value={tank.quantidade}
                                    onChange={(e) => handleUpdateTank(index, 'quantidade', parseFloat(e.target.value))}
                                    className="w-full border-gray-300 rounded shadow-sm border p-1 text-sm bg-white text-black"
                                 />
                              </div>
                              <div className="md:col-span-4">
                                 <label className="block text-xs font-medium text-gray-500 mb-1">Idade (anos)</label>
                                 <input
                                    type="number"
                                    value={tank.idade}
                                    onChange={(e) => handleUpdateTank(index, 'idade', parseFloat(e.target.value))}
                                    className="w-full border-gray-300 rounded shadow-sm border p-1 text-sm bg-white text-black"
                                 />
                              </div>
                              <div className="md:col-span-1 flex justify-end">
                                 <button onClick={() => handleRemoveTank(index)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded">
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>

                     {/* Add New Tank */}
                     <div className="flex gap-2 items-end bg-blue-50 p-3 rounded-md border border-blue-100">
                        <div className="flex-1">
                           <label className="block text-sm font-medium text-blue-800 mb-1">Adicionar Tanque</label>
                           <select
                              value={selectedTankType}
                              onChange={(e) => setSelectedTankType(e.target.value)}
                              className="w-full border-blue-300 rounded-md shadow-sm border p-2 bg-white text-black"
                           >
                              <option value="">Selecione o tipo...</option>
                              {LISTS.tipos_combustivel.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                        </div>
                        <button
                           type="button"
                           onClick={handleAddTank}
                           disabled={!selectedTankType}
                           className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <Plus size={20} />
                        </button>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Seguro ambiental será contratado?</label>
                        <select name="seguroAmbiental" value={data.seguroAmbiental ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                           <option value="false">Não</option>
                           <option value="true">Sim</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cláusula de indenização por passivo ambiental?</label>
                        <select name="clausulaIndenizacao" value={data.clausulaIndenizacao ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                           <option value="false">Não</option>
                           <option value="true">Sim</option>
                        </select>
                     </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsabilidade por passivo pré-existente *</label>
                        <input type="text" name="responsabilidadePassivo" value={data.responsabilidadePassivo || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Premissa negociada" />
                     </div>
                  </div>
               </div>
            </SectionCard>
         )}

         {/* SECTION 12, 13, 14, 15 */}
         {/* Keeping these sections rendering for completeness, logic is same as before just context pass through */}
         {activeSection === '12' && (
            <SectionCard title="12. Prazo, Renovação e Saída" icon={<Hourglass size={20} />}>
               {/* ... (Content same as previous, just kept the structure) ... */}
               <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prazo contratual total (meses) *</label>
                        <input type="number" name="prazoContratualMeses" value={data.prazoContratualMeses} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Renovação: existe opção automática? *</label>
                        <select name="renovacaoAutomatica" value={data.renovacaoAutomatica ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                           <option value="false">Não</option>
                           <option value="true">Sim</option>
                        </select>
                     </div>
                  </div>
                  {data.renovacaoAutomatica && (
                     <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo da renovação (meses)</label>
                              <input type="number" name="prazoRenovacaoMeses" value={data.prazoRenovacaoMeses || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Condições de renovação</label>
                              <input type="text" name="condicoesRenovacao" value={data.condicoesRenovacao || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Mesmo aluguel, reajustado, renegociado" />
                           </div>
                        </div>
                     </div>
                  )}
                  <div className="border-t border-gray-200 pt-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Regra de rescisão imotivada *</label>
                           <select name="regraRescisaoImotivada" value={data.regraRescisaoImotivada} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                              {LISTS.regra_rescisao.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Aviso prévio para rescisão (dias)</label>
                           <input type="number" name="avisoPrevioDias" value={data.avisoPrevioDias || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                        </div>
                     </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Multa de rescisão - premissa *</label>
                           <input type="text" name="multaRescisao" value={data.multaRescisao || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="X aluguéis, % do investimento, etc." />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Fórmula da multa</label>
                           <input type="text" name="formulaMulta" value={data.formulaMulta || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Detalhar cálculo" />
                        </div>
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Tolerância a risco de saída precoce *</label>
                     <select name="toleranciaRiscoSaida" value={data.toleranciaRiscoSaida} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                        {LISTS.tolerancia_risco.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                     </select>
                  </div>
               </div>
               <SectionFAQ sectionId="12" items={SECTION_FAQS['12'] || []} />
            </SectionCard>
         )}

         {activeSection === '13' && (
            <SectionCard title="13. Não Concorrência e Exclusividade" icon={<Ban size={20} />}>
               {/* ... Same content structure ... */}
               <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deseja cláusula de não concorrência do proprietário? *</label>
                        <select name="clauseNaoConcorrencia" value={data.clauseNaoConcorrencia ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                           <option value="false">Não</option>
                           <option value="true">Sim</option>
                        </select>
                     </div>
                     {data.clauseNaoConcorrencia && (
                        <>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Raio de não concorrência (km)</label>
                              <input type="text" name="raioNaoConcorrencia" value={data.raioNaoConcorrencia || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Ajustar à praça" />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo de não concorrência após término (meses)</label>
                              <input type="number" name="prazoNaoConcorrenciaMeses" value={data.prazoNaoConcorrenciaMeses || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                           </div>
                        </>
                     )}
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Exclusividade de uso do imóvel para posto? *</label>
                           <select name="exclusividadeUsoImovel" value={data.exclusividadeUsoImovel ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                              <option value="false">Não</option>
                              <option value="true">Sim</option>
                           </select>
                        </div>
                        <div className="md:col-span-2">
                           <label className="block text-sm font-medium text-gray-700 mb-1">Outras restrições de uso pretendidas</label>
                           <textarea name="outrasRestricoesUso" value={data.outrasRestricoesUso || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Detalhar" rows={3} />
                        </div>
                     </div>
                  </div>
               </div>
            </SectionCard>
         )}

         {activeSection === '14' && (
            <SectionCard title="14. Disposições Jurídicas" icon={<Scale size={20} />}>
               {/* ... Same content structure ... */}
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Foro de eleição *</label>
                     <input type="text" name="foroEleicao" value={data.foroEleicao} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Comarca" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Exigência de confidencialidade? *</label>
                        <select name="exigenciaConfidencialidade" value={data.exigenciaConfidencialidade ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                           <option value="false">Não</option>
                           <option value="true">Sim</option>
                        </select>
                     </div>
                     {data.exigenciaConfidencialidade && (
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Prazo de confidencialidade (meses)</label>
                           <input type="number" name="prazoConfidencialidadeMeses" value={data.prazoConfidencialidadeMeses || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" placeholder="Após término" />
                        </div>
                     )}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Cláusula arbitral?</label>
                           <select name="clausulaArbitral" value={data.clausulaArbitral ? 'true' : 'false'} onChange={handleBooleanSelectChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black">
                              <option value="false">Não</option>
                              <option value="true">Sim</option>
                           </select>
                        </div>
                        {data.clausulaArbitral && (
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Câmara de arbitragem</label>
                              <input type="text" name="camaraArbitragem" value={data.camaraArbitragem || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                           </div>
                        )}
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Prazo de validade das condições do Term Sheet (Dias)</label>
                     <input type="number" name="prazoValidadeTermSheetDias" value={data.prazoValidadeTermSheetDias || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" />
                  </div>
               </div>
            </SectionCard>
         )}

         {activeSection === '15' && (
            <SectionCard title="15. Observações e Anexos" icon={<MessageSquare size={20} />}>
               {/* ... Same content structure ... */}
               <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pontos inegociáveis do proprietário</label>
                        <textarea name="pontosInegociaveisProprietario" value={data.pontosInegociaveisProprietario || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" rows={3} placeholder="Texto livre" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pontos inegociáveis do Grupo</label>
                        <textarea name="pontosInegociaveisGrupo" value={data.pontosInegociaveisGrupo || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" rows={3} placeholder="Texto livre" />
                     </div>

                     <div className={`mt-2 ${isUploadingFiles ? 'opacity-70 pointer-events-none' : ''}`}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Adicionar documentos (Upload para AWS S3)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors relative cursor-pointer">
                           <input
                              type="file"
                              multiple
                              disabled={isUploadingFiles}
                              onChange={handleFileUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                           />
                           {isUploadingFiles ? (
                              <Loader2 className="text-blue-600 mb-2 animate-spin" size={32} />
                           ) : (
                              <UploadCloud className="text-gray-400 mb-2" size={32} />
                           )}
                           <p className="text-sm text-gray-600 font-medium">
                              {isUploadingFiles ? 'Enviando arquivos para o S3...' : 'Clique para selecionar ou arraste arquivos'}
                           </p>
                           <p className="text-xs text-gray-400 mt-1">PDF, Imagens, Excel, Word</p>
                        </div>
                        {data.documentos && data.documentos.length > 0 && (
                           <div className="mt-4 space-y-2">
                              {data.documentos.map((file, idx) => (
                                 <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                       <div className="bg-blue-100 p-2 rounded text-blue-600">
                                          <FileText size={18} />
                                       </div>
                                       <span className="text-sm font-medium text-gray-700 truncate max-w-[200px] md:max-w-xs" title={file.name}>
                                          {file.name}
                                       </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <a
                                          href={file.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                          title="Visualizar"
                                       >
                                          <Eye size={18} />
                                       </a>
                                       <a
                                          href={file.url}
                                          download={file.name}
                                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                          title="Download"
                                       >
                                          <Download size={18} />
                                       </a>
                                       <button
                                          onClick={() => handleRemoveFile(idx)}
                                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                          title="Remover"
                                       >
                                          <Trash2 size={18} />
                                       </button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Resumo final da negociação *</label>
                        <textarea name="resumoFinalNegociacao" value={data.resumoFinalNegociacao} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white text-black" rows={5} placeholder="Contexto, sensibilidade, próximos passos..." />
                     </div>
                  </div>
               </div>
               <SectionFAQ sectionId="15" items={SECTION_FAQS['15'] || []} />
            </SectionCard>
         )}

      </div>
   );
};