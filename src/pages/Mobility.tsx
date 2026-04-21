import React, { useState } from 'react';
import { Truck, Plus, Trash2, Search, User } from 'lucide-react';
import { Server, Locomocao } from '../types/server';
import { Button, Card, Input } from '../components/UI';
import { cn } from '../components/UI';

interface MobilityProps {
  servers: Server[];
  onUpdateServer: (serverId: string, data: Partial<Server>) => void;
}

export const Mobility: React.FC<MobilityProps> = ({ servers, onUpdateServer }) => {
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Locomocao>>({
    data: new Date().toISOString().split('T')[0],
    motivo: '',
    saida: '08:00',
    retorno: '18:00'
  });

  const filteredServers = servers.filter(s => 
    s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cpf.includes(searchTerm)
  );

  const selectedServer = servers.find(s => s.id === selectedServerId);

  const handleOpenForm = (loc?: Locomocao) => {
    if (loc) {
      setEditingId(loc.id);
      setFormData(loc);
    } else {
      setEditingId(null);
      setFormData({
        data: new Date().toISOString().split('T')[0],
        motivo: '',
        saida: '08:00',
        retorno: '18:00'
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!selectedServerId || !selectedServer) return;

    let updatedLocomocoes = [...(selectedServer.locomocoes || [])];

    if (editingId) {
      updatedLocomocoes = updatedLocomocoes.map(l => 
        l.id === editingId ? { ...l, ...formData } as Locomocao : l
      );
    } else {
      const newLoc: Locomocao = {
        id: crypto.randomUUID(),
        ...formData
      } as Locomocao;
      updatedLocomocoes.push(newLoc);
    }

    onUpdateServer(selectedServerId, { locomocoes: updatedLocomocoes });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleRemoveLocomocao = (id: string) => {
    if (!selectedServerId || !selectedServer) return;
    onUpdateServer(selectedServerId, {
      locomocoes: selectedServer.locomocoes?.filter(l => l.id !== id)
    });
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6">
      {/* Sidebar: Seleção de Servidor */}
      <div className="w-80 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar servidor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2">
          {filteredServers.map(server => (
            <button
              key={server.id}
              onClick={() => setSelectedServerId(server.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                selectedServerId === server.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                  : "bg-white text-slate-600 hover:bg-blue-50 border border-slate-100"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                selectedServerId === server.id ? "bg-white/20" : "bg-blue-50 text-blue-600"
              )}>
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{server.nome}</p>
                <p className={cn(
                  "text-xs truncate",
                  selectedServerId === server.id ? "text-blue-100" : "text-slate-400"
                )}>{server.cargo}</p>
              </div>
            </button>
          ))}
          {filteredServers.length === 0 && (
            <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-dashed">
              Nenhum servidor encontrado
            </div>
          )}
        </div>
      </div>

      {/* Main: Gerenciamento de Locomoção */}
      <div className="flex-1 overflow-y-auto pr-4">
        {selectedServer ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Locomoção do Servidor</h2>
                <p className="text-slate-500">{selectedServer.nome}</p>
              </div>
              <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Novo Registro
              </Button>
            </div>

            {isFormOpen && (
              <Card className="p-6 border-2 border-blue-500 bg-blue-50/30">
                <h3 className="text-lg font-bold mb-4 text-blue-900">
                  {editingId ? 'Editar Registro' : 'Novo Registro de Locomoção'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Data</label>
                    <Input
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Motivo do Deslocamento</label>
                    <Input
                      placeholder="Ex: Visita Técnica, Entrega de Documentos..."
                      value={formData.motivo}
                      onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Horário Saída</label>
                    <Input
                      type="time"
                      value={formData.saida}
                      onChange={(e) => setFormData({ ...formData, saida: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Horário Retorno</label>
                    <Input
                      type="time"
                      value={formData.retorno}
                      onChange={(e) => setFormData({ ...formData, retorno: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar Registro</Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid gap-4">
              {selectedServer.locomocoes?.map((loc) => (
                <Card key={loc.id} className="p-6 border-l-4 border-l-blue-500">
                  <div className="flex justify-between items-start">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-4 flex-1">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Data</span>
                        <p className="font-semibold">{new Date(loc.data + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Motivo</span>
                        <p className="font-medium text-slate-700">{loc.motivo}</p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">Saída</span>
                          <p className="font-medium text-slate-600">{loc.saida}</p>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">Retorno</span>
                          <p className="font-medium text-slate-600">{loc.retorno}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:bg-blue-50"
                        onClick={() => handleOpenForm(loc)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => handleRemoveLocomocao(loc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {(!selectedServer.locomocoes || selectedServer.locomocoes.length === 0) && (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                  <Truck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhum registro de locomoção cadastrado para este servidor.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 p-10 text-center">
            <Truck className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-medium mb-2">Selecione um Servidor</h3>
            <p className="max-w-xs">Escolha um servidor na lista lateral para gerenciar os registros de locomoção durante o expediente.</p>
          </div>
        )}
      </div>
    </div>
  );
};
