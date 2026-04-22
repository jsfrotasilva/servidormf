import React, { useState } from 'react';
import { Server, ATS, LicencaPremio, LicencaPremioUsage, LicencaTipoUso, EvolucaoFuncional, User as UserType } from '../types/server';
import { Card, Button, Input, Badge } from '../components/UI';
import { Search, Trash2, Calendar, FileText, User, ShieldCheck, History, TrendingUp } from 'lucide-react';
import { formatDisplayDate } from '../utils/formatters';

interface BenefitsProps {
  servers: Server[];
  user: UserType;
  onUpdateServer: (serverId: string, data: Partial<Server>) => void;
}

const MOTIVOS_ATS = [
  '1. QUINQUÊNIO',
  '2. QUINQUÊNIO',
  '3. QUINQUÊNIO',
  '4. QUINQUÊNIO',
  '5. QUINQUÊNIO',
  '6. QUINQUÊNIO',
  '7. QUINQUÊNIO',
  '8. QUINQUÊNIO',
  '9. QUINQUÊNIO',
  '10. QUINQUÊNIO'
];

const MOTIVOS_EVOLUCAO = [
  '1. EVOLUÇÃO',
  '2. EVOLUÇÃO',
  '3. EVOLUÇÃO',
  '4. EVOLUÇÃO',
  '5. EVOLUÇÃO',
  '6. EVOLUÇÃO',
  '7. EVOLUÇÃO',
  '8. EVOLUÇÃO',
  '9. EVOLUÇÃO',
  '10. EVOLUÇÃO'
];

const NIVEIS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

const EVOLUTION_CRITERIA: Record<string, { intersticio: string; minScore: number; weights: number[] }> = {
  'I para II': { intersticio: '4 anos', minScore: 35, weights: [4, 4, 2] },
  'II para III': { intersticio: '4 anos', minScore: 40, weights: [4, 4, 2] },
  'III para IV': { intersticio: '5 anos', minScore: 50, weights: [3, 3, 4] },
  'IV para V': { intersticio: '5 anos', minScore: 60, weights: [3, 3, 4] },
  'V para VI': { intersticio: '4 anos', minScore: 60, weights: [3, 3, 4] },
  'VI para VII': { intersticio: '4 anos', minScore: 60, weights: [3, 3, 4] },
  'VII para VIII': { intersticio: '4 anos', minScore: 60, weights: [3, 3, 4] },
  'VIII para IX': { intersticio: '4 anos', minScore: 60, weights: [3, 3, 4] },
  'IX para X': { intersticio: '4 anos', minScore: 60, weights: [3, 3, 4] },
};

export const Benefits: React.FC<BenefitsProps> = ({ servers, user, onUpdateServer }) => {
  const isAdmin = user.role === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServerId, setSelectedServerId] = useState<string | null>(isAdmin ? null : user.serverId || null);
  const selectedServer = servers.find(s => s.id === (isAdmin ? selectedServerId : user.serverId));

  const [requestStatus] = useState<string | null>(null);

  const [showAddATS, setShowAddATS] = useState(false);
  const [editingATSId, setEditingATSId] = useState<string | null>(null);
  const [showSextaParteForm, setShowSextaParteForm] = useState(false);
  const [showAddLicenca, setShowAddLicenca] = useState(false);
  const [showAddUsage, setShowAddUsage] = useState(false);
  const [showAddEvolucao, setShowAddEvolucao] = useState(false);
  const [editingEvolucaoId, setEditingEvolucaoId] = useState<string | null>(null);
  
  const [newATS, setNewATS] = useState<Omit<ATS, 'id'>>({
    motivo: MOTIVOS_ATS[0],
    vigencia: '',
    dataPublicacaoDOE: '',
    ultimoAts: false
  });

  const [newEvolucao, setNewEvolucao] = useState<Omit<EvolucaoFuncional, 'id'>>({
    motivo: MOTIVOS_EVOLUCAO[0],
    nivelDe: NIVEIS[0],
    nivelPara: NIVEIS[1],
    vigencia: '',
    dataPublicacaoDOE: '',
    isUltima: false
  });

  const [newSextaParte, setNewSextaParte] = useState({
    vigencia: '',
    dataPublicacaoDOE: ''
  });

  const [newLicenca, setNewLicenca] = useState<Omit<LicencaPremio, 'id'>>({
    numeroCertidao: '',
    periodoAquisitivo: '',
    saldoInicial: 90,
    dataDOE: '',
    ultimaCertidao: false,
    inicioVigenciaProxima: ''
  });

  const calculateFutureDate = (dateString: string, years: number) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    
    let targetYear = year + years;
    let targetMonth = month;
    let targetDay = day - 1;

    if (targetDay === 0) {
      targetMonth = month - 1;
      if (targetMonth === 0) {
        targetMonth = 12;
        targetYear = year + (years - 1);
      }
      
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      targetDay = daysInMonth[targetMonth - 1];
    }

    const y = targetYear;
    const m = String(targetMonth).padStart(2, '0');
    const d = String(targetDay).padStart(2, '0');
    
    return `${y}-${m}-${d}`;
  };

  const add1825Days = (dateString: string) => calculateFutureDate(dateString, 5);

  const getNextEvolucaoDate = (dateString: string, levelPara: string) => {
    if (!dateString) return '';
    const nextLevelIndex = NIVEIS.indexOf(levelPara);
    const nextLevel = NIVEIS[nextLevelIndex + 1];
    if (!nextLevel) return '';
    
    const nextKey = `${levelPara} para ${nextLevel}`;
    const criteria = EVOLUTION_CRITERIA[nextKey];
    if (!criteria) return '';
    
    const years = criteria.intersticio.includes('5') ? 5 : 4;
    return calculateFutureDate(dateString, years);
  };

  const [newUsage, setNewUsage] = useState<Omit<LicencaPremioUsage, 'id'>>({
    certidaoId: '',
    tipo: 'Gozo',
    quantidadeDias: 0,
    dataIncio: '',
    dataFim: '',
    dataAutorizacaoDOE: '',
    anoPecunia: ''
  });

  const eligibleCategories = ['A-EFETIVO', 'ACT-F'];
  
  // Rule: PEFM + A-EFETIVO shows only Licenses
  const isPEFM_A_Efetivo = selectedServer?.cargo?.toUpperCase().trim() === 'PEFM' && 
                           selectedServer?.categoria?.toUpperCase().trim() === 'A-EFETIVO';

  const filteredServers = servers.filter(s => {
    const matchesSearch = s.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.cpf.includes(searchTerm);
    // Filtrar apenas categorias específicas para concessão de vantagens
    const isEligible = s.categoria && eligibleCategories.includes(s.categoria.toUpperCase().trim());
    return matchesSearch && isEligible;
  });

  const calculateBalance = (certidaoId: string, server: Server) => {
    const certidao = server.licencasPremio?.find(l => l.id === certidaoId);
    if (!certidao) return 0;
    
    const usages = server.licencasPremioUsage?.filter(u => u.certidaoId === certidaoId) || [];
    const totalUsed = usages.reduce((sum, u) => sum + u.quantidadeDias, 0);
    
    return certidao.saldoInicial - totalUsed;
  };

  const handleAddATS = () => {
    if (!selectedServer) return;
    
    if (editingATSId) {
      onUpdateServer(selectedServer.id, {
        ats: (selectedServer.ats || []).map(a => 
          a.id === editingATSId ? { ...newATS, id: a.id } : a
        )
      });
      setEditingATSId(null);
    } else {
      const atsRecord: ATS = {
        ...newATS,
        id: Math.random().toString(36).substr(2, 9)
      };

      onUpdateServer(selectedServer.id, {
        ats: [...(selectedServer.ats || []), atsRecord]
      });
    }

    setShowAddATS(false);
    setNewATS({
      motivo: MOTIVOS_ATS[0],
      vigencia: '',
      dataPublicacaoDOE: '',
      ultimoAts: false
    });
  };

  const handleEditATS = (ats: ATS) => {
    setNewATS({
      motivo: ats.motivo,
      vigencia: ats.vigencia,
      dataPublicacaoDOE: ats.dataPublicacaoDOE,
      ultimoAts: ats.ultimoAts
    });
    setEditingATSId(ats.id);
    setShowAddATS(true);
  };

  const handleDeleteATS = (id: string) => {
    if (!selectedServer || !selectedServer.ats) return;
    onUpdateServer(selectedServer.id, {
      ats: selectedServer.ats.filter(a => a.id !== id)
    });
  };

  const handleSaveSextaParte = () => {
    if (!selectedServer) return;
    onUpdateServer(selectedServer.id, {
      sextaParte: { ...newSextaParte }
    });
    setShowSextaParteForm(false);
  };

  const handleDeleteSextaParte = () => {
    if (!selectedServer) return;
    if (!confirm('Deseja remover o registro da Sexta-Parte?')) return;
    onUpdateServer(selectedServer.id, {
      sextaParte: undefined
    });
  };

  const handleAddLicenca = () => {
    if (!selectedServer) return;
    const licencaRecord: LicencaPremio = {
      ...newLicenca,
      id: Math.random().toString(36).substr(2, 9)
    };
    onUpdateServer(selectedServer.id, {
      licencasPremio: [...(selectedServer.licencasPremio || []), licencaRecord]
    });
    setShowAddLicenca(false);
    setNewLicenca({
      numeroCertidao: '',
      periodoAquisitivo: '',
      saldoInicial: 90,
      dataDOE: '',
      ultimaCertidao: false,
      inicioVigenciaProxima: ''
    });
  };

  const handleDeleteLicenca = (id: string) => {
    if (!selectedServer || !selectedServer.licencasPremio) return;
    onUpdateServer(selectedServer.id, {
      licencasPremio: selectedServer.licencasPremio.filter(l => l.id !== id),
      licencasPremioUsage: (selectedServer.licencasPremioUsage || []).filter(u => u.certidaoId !== id)
    });
  };

  const handleAddUsage = () => {
    if (!selectedServer) return;
    const usageRecord: LicencaPremioUsage = {
      ...newUsage,
      id: Math.random().toString(36).substr(2, 9),
      quantidadeDias: newUsage.tipo === 'Pecúnia' ? 30 : Number(newUsage.quantidadeDias)
    };
    const currentBalance = calculateBalance(usageRecord.certidaoId, selectedServer);
    if (usageRecord.quantidadeDias > currentBalance) {
      alert(`Saldo insuficiente! Saldo atual: ${currentBalance} dias.`);
      return;
    }
    onUpdateServer(selectedServer.id, {
      licencasPremioUsage: [...(selectedServer.licencasPremioUsage || []), usageRecord]
    });
    setShowAddUsage(false);
    setNewUsage({
      certidaoId: '',
      tipo: 'Gozo',
      quantidadeDias: 0,
      dataIncio: '',
      dataFim: '',
      dataAutorizacaoDOE: '',
      anoPecunia: ''
    });
  };

  const handleDeleteUsage = (id: string) => {
    if (!selectedServer || !selectedServer.licencasPremioUsage) return;
    onUpdateServer(selectedServer.id, {
      licencasPremioUsage: selectedServer.licencasPremioUsage.filter(u => u.id !== id)
    });
  };

  const handleAddEvolucao = () => {
    if (!selectedServer) return;

    const key = `${newEvolucao.nivelDe} para ${newEvolucao.nivelPara}`;
    const criteria = newEvolucao.isUltima ? EVOLUTION_CRITERIA[key] : null;

    const evolucaoData = {
      ...newEvolucao,
      intersticio: criteria?.intersticio,
      pontuacaoMinima: criteria?.minScore,
      pesoAtualizacao: criteria?.weights[0],
      pesoAperfeicoamento: criteria?.weights[1],
      pesoProducao: criteria?.weights[2],
    };

    if (editingEvolucaoId) {
      onUpdateServer(selectedServer.id, {
        evolucoesFuncionais: (selectedServer.evolucoesFuncionais || []).map(e =>
          e.id === editingEvolucaoId ? { ...evolucaoData, id: e.id } : e
        )
      });
      setEditingEvolucaoId(null);
    } else {
      const evolucaoRecord: EvolucaoFuncional = {
        ...evolucaoData,
        id: Math.random().toString(36).substr(2, 9)
      };
      onUpdateServer(selectedServer.id, {
        evolucoesFuncionais: [...(selectedServer.evolucoesFuncionais || []), evolucaoRecord]
      });
    }

    setShowAddEvolucao(false);
    setNewEvolucao({
      motivo: MOTIVOS_EVOLUCAO[0],
      nivelDe: NIVEIS[0],
      nivelPara: NIVEIS[1],
      vigencia: '',
      dataPublicacaoDOE: '',
      isUltima: false
    });
  };

  const handleEditEvolucao = (e: EvolucaoFuncional) => {
    setNewEvolucao({
      motivo: e.motivo,
      nivelDe: e.nivelDe,
      nivelPara: e.nivelPara,
      vigencia: e.vigencia,
      dataPublicacaoDOE: e.dataPublicacaoDOE,
      isUltima: e.isUltima || false
    });
    setEditingEvolucaoId(e.id);
    setShowAddEvolucao(true);
  };

  const handleDeleteEvolucao = (id: string) => {
    if (!selectedServer || !selectedServer.evolucoesFuncionais) return;
    onUpdateServer(selectedServer.id, {
      evolucoesFuncionais: selectedServer.evolucoesFuncionais.filter(e => e.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      {requestStatus && (
        <div className="fixed top-20 right-4 z-50 rounded-lg bg-green-500 px-6 py-3 text-white shadow-lg shadow-green-200">
          {requestStatus}
        </div>
      )}
      <header>
        <h1 className="text-2xl font-bold text-gray-800">{isAdmin ? 'Vantagens e Benefícios' : 'Minhas Vantagens e Benefícios'}</h1>
        <p className="text-gray-500 text-sm">
          {isAdmin ? 'Gestão de ATS, Sexta-Parte e Licença-Prêmio' : 'Consulte seus blocos, certidões e próximos vencimentos'}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        {isAdmin && (
          <Card className="lg:col-span-1 flex flex-col h-[calc(100vh-250px)]">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar servidor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredServers.map(server => (
              <button
                key={server.id}
                onClick={() => setSelectedServerId(server.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  selectedServerId === server.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                }`}
              >
                <div className="p-2 bg-gray-100 rounded-full"><User className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{server.nome}</p>
                  <p className="text-xs text-gray-500">{server.cpf}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
        )}

        {/* Content */}
        <div className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6 overflow-y-auto h-[calc(100vh-250px)] pr-2`}>
          {selectedServer ? (
            <>
              {/* ATS Section */}
              {!isPEFM_A_Efetivo && (
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-500" /> ATS</h2>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        if (showAddATS) {
                          setShowAddATS(false);
                          setEditingATSId(null);
                          setNewATS({ motivo: MOTIVOS_ATS[0], vigencia: '', dataPublicacaoDOE: '', ultimoAts: false });
                        } else {
                          setShowAddATS(true);
                        }
                      }}
                    >
                      {showAddATS ? 'Cancelar' : 'Adicionar ATS'}
                    </Button>
                  </div>
                  {showAddATS && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Motivo</label>
                        <select className="w-full p-2 border rounded text-sm bg-white" value={newATS.motivo} onChange={e => setNewATS({...newATS, motivo: e.target.value})}>
                          {MOTIVOS_ATS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Vigência</label>
                        <Input type="date" value={newATS.vigencia} onChange={e => setNewATS({...newATS, vigencia: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Publicação em DOE</label>
                        <Input type="date" value={newATS.dataPublicacaoDOE} onChange={e => setNewATS({...newATS, dataPublicacaoDOE: e.target.value})} />
                      </div>
                      
                      <div className="col-span-2 flex items-center gap-2 py-2">
                        <input 
                          type="checkbox" 
                          id="ultimoAts" 
                          checked={newATS.ultimoAts} 
                          onChange={e => setNewATS({...newATS, ultimoAts: e.target.checked})}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="ultimoAts" className="text-sm font-medium text-gray-700">Último ATS</label>
                      </div>

                      {newATS.ultimoAts && newATS.vigencia && (
                        <div className="col-span-2 p-3 bg-blue-100 border border-blue-200 rounded-lg text-blue-800 text-xs font-bold animate-pulse">
                          Provavelmente vencimento do próximo ATS: {formatDisplayDate(add1825Days(newATS.vigencia))}
                        </div>
                      )}

                      <Button onClick={handleAddATS} className="col-span-2">Salvar</Button>
                    </div>
                  )}
                  <div className="space-y-2">
                    {selectedServer.ats?.map(ats => (
                      <div key={ats.id} className="flex justify-between items-center p-3 border rounded relative overflow-hidden">
                        {ats.ultimoAts && <div className="absolute top-0 right-0 px-2 py-0.5 bg-blue-600 text-[8px] text-white font-bold rounded-bl uppercase">Último</div>}
                        <div>
                          <p className="font-bold text-sm">{ats.motivo}</p>
                          <p className="text-xs text-gray-500">Vigência: {formatDisplayDate(ats.vigencia)} | DOE: {formatDisplayDate(ats.dataPublicacaoDOE)}</p>
                          {ats.ultimoAts && (
                            <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase">
                              Próximo: {formatDisplayDate(add1825Days(ats.vigencia))}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditATS(ats)} className="text-blue-500 hover:text-blue-700 p-1"><FileText className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteATS(ats.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                    {!selectedServer.ats?.length && (
                      <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">Nenhum registro de ATS.</div>
                    )}
                  </div>
                </Card>
              )}

              {/* Sexta-Parte Section */}
              {!isPEFM_A_Efetivo && (
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-purple-500" /> Sexta-Parte</h2>
                    <div className="flex gap-2">
                      {selectedServer.sextaParte && (
                        <Button size="sm" variant="outline" className="text-red-600 border-red-100 hover:bg-red-50" onClick={handleDeleteSextaParte}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        className="bg-purple-600" 
                        onClick={() => {
                          if (showSextaParteForm) {
                            setShowSextaParteForm(false);
                          } else {
                            setShowSextaParteForm(true);
                            setNewSextaParte({
                              vigencia: selectedServer.sextaParte?.vigencia || '',
                              dataPublicacaoDOE: selectedServer.sextaParte?.dataPublicacaoDOE || ''
                            });
                          }
                        }}
                      >
                        {showSextaParteForm ? 'Cancelar e Recolher' : (selectedServer.sextaParte ? 'Editar' : 'Cadastrar')}
                      </Button>
                    </div>
                  </div>
                  {showSextaParteForm && (
                    <div className="bg-purple-50 p-4 rounded-lg mb-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Vigência</label>
                          <Input type="date" value={newSextaParte.vigencia} onChange={e => setNewSextaParte({...newSextaParte, vigencia: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Publicação em DOE</label>
                          <Input type="date" value={newSextaParte.dataPublicacaoDOE} onChange={e => setNewSextaParte({...newSextaParte, dataPublicacaoDOE: e.target.value})} />
                        </div>
                      </div>
                      <Button onClick={handleSaveSextaParte} className="w-full bg-purple-600">Salvar Sexta-Parte</Button>
                    </div>
                  )}
                  {selectedServer.sextaParte ? (
                    <div className="p-3 border rounded bg-white shadow-sm flex justify-between items-center border-l-4 border-l-purple-500">
                      <div>
                        <p className="font-bold text-sm">6ª PARTE CONCEDIDA</p>
                        <p className="text-xs text-gray-500">Vigência: {formatDisplayDate(selectedServer.sextaParte.vigencia)} | DOE: {formatDisplayDate(selectedServer.sextaParte.dataPublicacaoDOE)}</p>
                      </div>
                      <Badge variant="info">Concedido</Badge>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">Não cadastrado.</div>
                  )}
                </Card>
              )}

              {/* Licença-Prêmio Section */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-500" /> Licença-Prêmio (Certidões)</h2>
                  <Button size="sm" className="bg-emerald-600" onClick={() => setShowAddLicenca(!showAddLicenca)}>{showAddLicenca ? 'Cancelar' : 'Nova Certidão'}</Button>
                </div>
                {showAddLicenca && (
                  <div className="bg-emerald-50 p-4 rounded-lg mb-4 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Nº Certidão (000/0000)</label>
                      <Input placeholder="000/0000" value={newLicenca.numeroCertidao} onChange={e => setNewLicenca({...newLicenca, numeroCertidao: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Período Aquisitivo</label>
                      <Input placeholder="Ex: 2015-2020" value={newLicenca.periodoAquisitivo} onChange={e => setNewLicenca({...newLicenca, periodoAquisitivo: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Saldo Inicial (Dias)</label>
                      <Input type="number" value={newLicenca.saldoInicial} onChange={e => setNewLicenca({...newLicenca, saldoInicial: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Publicação em DOE</label>
                      <Input type="date" value={newLicenca.dataDOE} onChange={e => setNewLicenca({...newLicenca, dataDOE: e.target.value})} />
                    </div>

                    <div className="col-span-2 flex items-center gap-2 py-2 border-t border-emerald-100">
                      <input 
                        type="checkbox" 
                        id="ultimaCertidao" 
                        checked={newLicenca.ultimaCertidao} 
                        onChange={e => setNewLicenca({...newLicenca, ultimaCertidao: e.target.checked})}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="ultimaCertidao" className="text-sm font-medium text-emerald-700">Última Certidão</label>
                    </div>

                    {newLicenca.ultimaCertidao && (
                      <div className="col-span-2 space-y-3 p-4 bg-white border border-emerald-100 rounded-lg shadow-sm">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Início da vigência da próxima certidão</label>
                          <Input 
                            type="date" 
                            value={newLicenca.inicioVigenciaProxima} 
                            onChange={e => setNewLicenca({...newLicenca, inicioVigenciaProxima: e.target.value})} 
                          />
                        </div>
                        {newLicenca.inicioVigenciaProxima && (
                          <div className="p-3 bg-emerald-100 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold animate-pulse">
                            Data calculada (término do próximo período): {formatDisplayDate(add1825Days(newLicenca.inicioVigenciaProxima))}
                          </div>
                        )}
                      </div>
                    )}

                    <Button onClick={handleAddLicenca} className="col-span-2 bg-emerald-600">Salvar Certidão</Button>
                  </div>
                )}
                <div className="space-y-3">
                  {selectedServer.licencasPremio?.map(l => {
                    const balance = calculateBalance(l.id, selectedServer);
                    return (
                      <div key={l.id} className="p-4 border border-emerald-100 rounded-lg bg-white shadow-sm relative overflow-hidden">
                        {l.ultimaCertidao && <div className="absolute top-0 right-0 px-2 py-0.5 bg-emerald-600 text-[8px] text-white font-bold rounded-bl uppercase">Última</div>}
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-emerald-900">Certidão {l.numeroCertidao}</p>
                            <p className="text-xs text-gray-500">{l.periodoAquisitivo} | DOE: {formatDisplayDate(l.dataDOE)}</p>
                            {l.ultimaCertidao && l.inicioVigenciaProxima && (
                              <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase">
                                Próxima vigência: {formatDisplayDate(l.inicioVigenciaProxima)} até {formatDisplayDate(add1825Days(l.inicioVigenciaProxima))}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400 uppercase">Saldo Atual</p>
                              <Badge className={balance > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                                {balance} DIAS
                              </Badge>
                            </div>
                            <button onClick={() => handleDeleteLicenca(l.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Licença-Prêmio Usage (Gozo/Pecúnia) */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2"><History className="w-5 h-5 text-orange-500" /> Utilização (Gozo / Pecúnia)</h2>
                  <Button size="sm" className="bg-orange-600" onClick={() => setShowAddUsage(!showAddUsage)} disabled={!selectedServer.licencasPremio?.length}>
                    {showAddUsage ? 'Cancelar' : 'Lançar Uso'}
                  </Button>
                </div>
                {showAddUsage && (
                  <div className="bg-orange-50 p-4 rounded-lg mb-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">Certidão</label>
                        <select className="w-full p-2 border rounded text-sm" value={newUsage.certidaoId} onChange={e => setNewUsage({...newUsage, certidaoId: e.target.value})}>
                          <option value="">Selecione a certidão...</option>
                          {selectedServer.licencasPremio?.map(l => (
                            <option key={l.id} value={l.id}>{l.numeroCertidao} (Saldo: {calculateBalance(l.id, selectedServer)} dias)</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">Tipo de Uso</label>
                        <select className="w-full p-2 border rounded text-sm" value={newUsage.tipo} onChange={e => setNewUsage({...newUsage, tipo: e.target.value as LicencaTipoUso})}>
                          <option value="Gozo">Gozo</option>
                          <option value="Pecúnia">Pecúnia</option>
                        </select>
                      </div>
                    </div>

                    {newUsage.tipo === 'Gozo' ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500">Qtd Dias</label>
                          <Input type="number" value={newUsage.quantidadeDias} onChange={e => setNewUsage({...newUsage, quantidadeDias: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500">Início</label>
                          <Input type="date" value={newUsage.dataIncio} onChange={e => setNewUsage({...newUsage, dataIncio: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500">Fim</label>
                          <Input type="date" value={newUsage.dataFim} onChange={e => setNewUsage({...newUsage, dataFim: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500">Autorização DOE</label>
                          <Input type="date" value={newUsage.dataAutorizacaoDOE} onChange={e => setNewUsage({...newUsage, dataAutorizacaoDOE: e.target.value})} />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500">Qtd Dias (Fixo)</label>
                          <Input value="30 DIAS" disabled className="bg-gray-100" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500">Ano da Pecúnia</label>
                          <Input placeholder="Ex: 2023" value={newUsage.anoPecunia} onChange={e => setNewUsage({...newUsage, anoPecunia: e.target.value})} />
                        </div>
                      </div>
                    )}
                    <Button onClick={handleAddUsage} className="w-full bg-orange-600">Registrar Utilização</Button>
                  </div>
                )}
                <div className="space-y-2">
                  {selectedServer.licencasPremioUsage?.map(u => {
                    const cert = selectedServer.licencasPremio?.find(l => l.id === u.certidaoId);
                    return (
                      <div key={u.id} className="flex items-center justify-between p-3 border-l-4 border-l-orange-400 bg-white border border-gray-100 rounded-r-lg shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${u.tipo === 'Gozo' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                            {u.tipo === 'Gozo' ? <Calendar className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{u.tipo} - {u.quantidadeDias} dias</p>
                            <p className="text-[10px] text-gray-500">
                              Certidão: {cert?.numeroCertidao || 'Excluída'} | 
                              {u.tipo === 'Gozo' ? ` Período: ${formatDisplayDate(u.dataIncio || '')} a ${formatDisplayDate(u.dataFim || '')}` : ` Ano: ${u.anoPecunia}`}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteUsage(u.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    );
                  })}
                  {!selectedServer.licencasPremioUsage?.length && (
                    <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">Nenhum uso registrado.</div>
                  )}
                </div>
              </Card>

              {/* Evolução Funcional Section */}
              {!isPEFM_A_Efetivo && ['PEB II', 'DIRETOR DE ESCOLA'].includes(selectedServer.cargo?.toUpperCase().trim() || '') && (
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-600" /> Evolução Funcional</h2>
                    <Button 
                      size="sm" 
                      className="bg-blue-600" 
                      onClick={() => {
                        if (showAddEvolucao) {
                          setShowAddEvolucao(false);
                          setEditingEvolucaoId(null);
                          setNewEvolucao({ motivo: MOTIVOS_EVOLUCAO[0], nivelDe: NIVEIS[0], nivelPara: NIVEIS[1], vigencia: '', dataPublicacaoDOE: '', isUltima: false });
                        } else {
                          setShowAddEvolucao(true);
                        }
                      }}
                    >
                      {showAddEvolucao ? 'Cancelar' : 'Nova Evolução'}
                    </Button>
                  </div>
                  {showAddEvolucao && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500">Motivo</label>
                          <select 
                            className="w-full p-2 border rounded text-sm bg-white" 
                            value={newEvolucao.motivo} 
                            onChange={e => setNewEvolucao({...newEvolucao, motivo: e.target.value})}
                          >
                            {MOTIVOS_EVOLUCAO.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500">Do Nível</label>
                          <select 
                            className="w-full p-2 border rounded text-sm bg-white" 
                            value={newEvolucao.nivelDe} 
                            onChange={e => setNewEvolucao({...newEvolucao, nivelDe: e.target.value})}
                          >
                            {NIVEIS.map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500">Para o Nível</label>
                          <select 
                            className="w-full p-2 border rounded text-sm bg-white" 
                            value={newEvolucao.nivelPara} 
                            onChange={e => setNewEvolucao({...newEvolucao, nivelPara: e.target.value})}
                          >
                            {NIVEIS.map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500">Vigência</label>
                          <Input type="date" value={newEvolucao.vigencia} onChange={e => setNewEvolucao({...newEvolucao, vigencia: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500">Publicação DOE</label>
                          <Input type="date" value={newEvolucao.dataPublicacaoDOE} onChange={e => setNewEvolucao({...newEvolucao, dataPublicacaoDOE: e.target.value})} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 py-2">
                        <input 
                          type="checkbox" 
                          id="isUltimaEvolucao" 
                          checked={newEvolucao.isUltima} 
                          onChange={e => setNewEvolucao({...newEvolucao, isUltima: e.target.checked})}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="isUltimaEvolucao" className="text-sm font-medium text-blue-700">Última Evolução (Exibir Critérios)</label>
                      </div>

                      {newEvolucao.isUltima && (
                        <div className="p-4 bg-white border border-blue-200 rounded-lg shadow-sm space-y-3">
                          <h4 className="text-xs font-bold text-blue-800 uppercase border-b pb-2">Critérios para {newEvolucao.nivelDe} para {newEvolucao.nivelPara}</h4>
                          {EVOLUTION_CRITERIA[`${newEvolucao.nivelDe} para ${newEvolucao.nivelPara}`] ? (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                              <div className="bg-gray-50 p-2 rounded">
                                <p className="text-[9px] text-gray-400 uppercase">Interstício</p>
                                <p className="text-xs font-bold">{EVOLUTION_CRITERIA[`${newEvolucao.nivelDe} para ${newEvolucao.nivelPara}`].intersticio}</p>
                              </div>
                              <div className="bg-gray-50 p-2 rounded">
                                <p className="text-[9px] text-gray-400 uppercase">Pontuação Mínima</p>
                                <p className="text-xs font-bold">{EVOLUTION_CRITERIA[`${newEvolucao.nivelDe} para ${newEvolucao.nivelPara}`].minScore}</p>
                              </div>
                              <div className="bg-blue-50 p-2 rounded">
                                <p className="text-[9px] text-blue-400 uppercase">Atualização</p>
                                <p className="text-xs font-bold text-blue-700">Peso {EVOLUTION_CRITERIA[`${newEvolucao.nivelDe} para ${newEvolucao.nivelPara}`].weights[0]}</p>
                              </div>
                              <div className="bg-blue-50 p-2 rounded">
                                <p className="text-[9px] text-blue-400 uppercase">Aperfeicoamento</p>
                                <p className="text-xs font-bold text-blue-700">Peso {EVOLUTION_CRITERIA[`${newEvolucao.nivelDe} para ${newEvolucao.nivelPara}`].weights[1]}</p>
                              </div>
                              <div className="bg-blue-50 p-2 rounded">
                                <p className="text-[9px] text-blue-400 uppercase">Produção Prof.</p>
                                <p className="text-xs font-bold text-blue-700">Peso {EVOLUTION_CRITERIA[`${newEvolucao.nivelDe} para ${newEvolucao.nivelPara}`].weights[2]}</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-red-500 italic">Critérios não definidos para esta transição.</p>
                          )}

                          {newEvolucao.vigencia && (
                            <div className="mt-2 p-2 bg-blue-100 border border-blue-200 rounded text-blue-800 text-[10px] font-bold uppercase text-center">
                              Previsão da Próxima Vigência: {formatDisplayDate(getNextEvolucaoDate(newEvolucao.vigencia, newEvolucao.nivelPara))}
                            </div>
                          )}
                        </div>
                      )}

                      <Button onClick={handleAddEvolucao} className="w-full bg-blue-600">
                        {editingEvolucaoId ? 'Atualizar Evolução' : 'Salvar Evolução'}
                      </Button>
                    </div>
                  )}
                  <div className="space-y-2">
                    {selectedServer.evolucoesFuncionais?.map(e => (
                      <div key={e.id} className="flex flex-col p-3 border-l-4 border-l-blue-400 bg-white border border-gray-100 rounded-r-lg shadow-sm relative overflow-hidden">
                        {e.isUltima && <div className="absolute top-0 right-0 px-2 py-0.5 bg-blue-600 text-[8px] text-white font-bold rounded-bl uppercase">Última</div>}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                              <TrendingUp className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{e.motivo}</p>
                              <p className="text-xs text-gray-700 font-medium">De Nível {e.nivelDe} para Nível {e.nivelPara}</p>
                              <p className="text-[10px] text-gray-500">
                                Vigência: {formatDisplayDate(e.vigencia)} | DOE: {formatDisplayDate(e.dataPublicacaoDOE)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditEvolucao(e)} className="text-blue-500 hover:text-blue-700 transition-colors">
                              <FileText className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteEvolucao(e.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {e.isUltima && e.intersticio && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <div className="text-center">
                                <p className="text-[8px] text-gray-400 uppercase">Interstício</p>
                                <p className="text-[10px] font-bold text-blue-800">{e.intersticio}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[8px] text-gray-400 uppercase">Min. Pontos</p>
                                <p className="text-[10px] font-bold text-blue-800">{e.pontuacaoMinima} pts</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[8px] text-gray-400 uppercase">Pesos</p>
                                <p className="text-[10px] font-bold text-blue-800">{e.pesoAtualizacao}/{e.pesoAperfeicoamento}/{e.pesoProducao}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[8px] text-gray-400 uppercase">Próxima Vigência</p>
                                <p className="text-[10px] font-bold text-blue-800">{formatDisplayDate(getNextEvolucaoDate(e.vigencia, e.nivelPara))}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {!selectedServer.evolucoesFuncionais?.length && (
                      <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">Nenhuma evolução registrada.</div>
                    )}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-2xl">
              <User className="w-16 h-16 mb-2 opacity-10" />
              <p>Selecione um servidor para gerenciar vantagens</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
