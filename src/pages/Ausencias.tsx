import React, { useState } from 'react';
import { Server, Ausencia, AusenciaTipo, User as UserType } from '../types/server';
import { Card, Button, Input } from '../components/UI';
import { Search, Trash2, Calendar, FileText, User } from 'lucide-react';
import { formatDisplayDate } from '../utils/formatters';
import { format } from 'date-fns';

interface AusenciasProps {
  servers: Server[];
  user: UserType;
  onUpdateServer: (serverId: string, data: Partial<Server>) => void;
}

export const Ausencias: React.FC<AusenciasProps> = ({ servers, user, onUpdateServer }) => {
  const isAdmin = user.role === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServerId, setSelectedServerId] = useState<string | null>(isAdmin ? null : user.serverId || null);
  const selectedServer = servers.find(s => s.id === (isAdmin ? selectedServerId : user.serverId));

  const [showAddAusencia, setShowAddAusencia] = useState(false);
  const [editingAusenciaId, setEditingAusenciaId] = useState<string | null>(null);
  
  const [newAusencia, setNewAusencia] = useState<Omit<Ausencia, 'id'>>({
    data: format(new Date(), 'yyyy-MM-dd'),
    tipo: 'Parcial',
    descricao: ''
  });

  const handleAddAusencia = () => {
    if (!selectedServer) return;
    
    if (editingAusenciaId) {
      onUpdateServer(selectedServer.id, {
        ausencias: (selectedServer.ausencias || []).map(a =>
          a.id === editingAusenciaId ? { ...newAusencia, id: a.id } : a
        )
      });
      setEditingAusenciaId(null);
    } else {
      const ausenciaRecord: Ausencia = {
        ...newAusencia,
        id: Math.random().toString(36).substr(2, 9)
      };
      onUpdateServer(selectedServer.id, {
        ausencias: [...(selectedServer.ausencias || []), ausenciaRecord]
      });
    }
    
    setShowAddAusencia(false);
    setNewAusencia({
      data: format(new Date(), 'yyyy-MM-dd'),
      tipo: 'Parcial',
      descricao: ''
    });
  };

  const handleEditAusencia = (ausencia: Ausencia) => {
    setNewAusencia({
      data: ausencia.data,
      tipo: ausencia.tipo,
      descricao: ausencia.descricao
    });
    setEditingAusenciaId(ausencia.id);
    setShowAddAusencia(true);
  };

  const handleDeleteAusencia = (id: string) => {
    if (!selectedServer || !selectedServer.ausencias) return;
    onUpdateServer(selectedServer.id, {
      ausencias: selectedServer.ausencias.filter(a => a.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">{isAdmin ? 'Gestão de Ausências' : 'Minhas Ausências'}</h1>
        <p className="text-gray-500 text-sm">
          {isAdmin ? 'Registre e gerencie ausências de todos os servidores' : 'Consulte e registre suas ausências'}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Lista de Servidores */}
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
              {servers.filter(s => 
                s.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                s.cpf.includes(searchTerm)
              ).map(server => (
                <button
                  key={server.id}
                  onClick={() => setSelectedServerId(server.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    selectedServerId === server.id ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="p-2 bg-gray-100 rounded-full"><User className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{server.nome}</p>
                    <p className="text-xs text-gray-500">{server.cargo}</p>
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
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2"><Calendar className="w-5 h-5 text-red-500" /> Ausências</h2>
                  <Button 
                    size="sm" 
                    className="bg-red-600" 
                    onClick={() => {
                      if (showAddAusencia) {
                        setShowAddAusencia(false);
                        setEditingAusenciaId(null);
                        setNewAusencia({ data: format(new Date(), 'yyyy-MM-dd'), tipo: 'Parcial', descricao: '' });
                      } else {
                        setShowAddAusencia(true);
                      }
                    }}
                  >
                    {showAddAusencia ? 'Cancelar' : 'Registrar Ausência'}
                  </Button>
                </div>
                {showAddAusencia && (
                  <div className="bg-red-50 p-4 rounded-lg mb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">Data</label>
                        <Input 
                          type="date" 
                          value={newAusencia.data} 
                          onChange={e => setNewAusencia({...newAusencia, data: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">Tipo de Ausência</label>
                        <select 
                          className="w-full p-2 border rounded text-sm bg-white" 
                          value={newAusencia.tipo} 
                          onChange={e => setNewAusencia({...newAusencia, tipo: e.target.value as AusenciaTipo})}
                        >
                          <option value="Parcial">Parcial</option>
                          <option value="Total">Total</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500">Descrição</label>
                        <Input 
                          placeholder="Ex: Falta médica, consulta médica..." 
                          value={newAusencia.descricao} 
                          onChange={e => setNewAusencia({...newAusencia, descricao: e.target.value})} 
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddAusencia} className="w-full bg-red-600">
                      {editingAusenciaId ? 'Atualizar Ausência' : 'Registrar Ausência'}
                    </Button>
                  </div>
                )}
                <div className="space-y-2">
                  {selectedServer.ausencias?.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-3 border-l-4 border-l-red-400 bg-white border border-gray-100 rounded-r-lg shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-red-50 text-red-600">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{a.tipo === 'Total' ? 'AUSENCIA TOTAL' : 'AUSENCIA PARCIAL'}</p>
                          <p className="text-xs text-gray-700">{a.descricao}</p>
                          <p className="text-[10px] text-gray-500">
                            Data: {formatDisplayDate(a.data)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditAusencia(a)} className="text-blue-500 hover:text-blue-700 transition-colors">
                          <FileText className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteAusencia(a.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {!selectedServer.ausencias?.length && (
                    <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">Nenhuma ausência registrada.</div>
                  )}
                </div>
              </Card>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-2xl">
              <User className="w-16 h-16 mb-2 opacity-10" />
              <p>Selecione um servidor para gerenciar ausências</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
