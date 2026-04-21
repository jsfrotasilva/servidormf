import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Search, User } from 'lucide-react';
import { Server, OrientacaoTecnica } from '../types/server';
import { Button, Card, Input } from '../components/UI';
import { cn } from '../components/UI';

interface GuidanceProps {
  servers: Server[];
  onUpdateServer: (serverId: string, data: Partial<Server>) => void;
}

export const Guidance: React.FC<GuidanceProps> = ({ servers, onUpdateServer }) => {
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<OrientacaoTecnica>>({
    data: new Date().toISOString().split('T')[0],
    assunto: '',
    local: '',
    inicio: '09:00',
    fim: '17:00',
    doeConvocacao: '',
    pagoDiaria: false
  });

  const filteredServers = servers.filter(s => 
    s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cpf.includes(searchTerm)
  );

  const selectedServer = servers.find(s => s.id === selectedServerId);

  const handleOpenForm = (record?: OrientacaoTecnica) => {
    if (record) {
      setEditingId(record.id);
      setFormData(record);
    } else {
      setEditingId(null);
      setFormData({
        data: new Date().toISOString().split('T')[0],
        assunto: '',
        local: '',
        inicio: '09:00',
        fim: '17:00',
        doeConvocacao: '',
        pagoDiaria: false
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!selectedServerId || !selectedServer) return;

    let updatedRecords = [...(selectedServer.orientacoesTecnicas || [])];

    if (editingId) {
      updatedRecords = updatedRecords.map(o => 
        o.id === editingId ? { ...o, ...formData } as OrientacaoTecnica : o
      );
    } else {
      const newRecord: OrientacaoTecnica = {
        id: crypto.randomUUID(),
        ...formData
      } as OrientacaoTecnica;
      updatedRecords.push(newRecord);
    }

    onUpdateServer(selectedServerId, { orientacoesTecnicas: updatedRecords });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleRemoveGuidance = (id: string) => {
    if (!selectedServerId || !selectedServer) return;
    onUpdateServer(selectedServerId, {
      orientacoesTecnicas: selectedServer.orientacoesTecnicas?.filter(o => o.id !== id)
    });
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6">
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
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                  : "bg-white text-slate-600 hover:bg-emerald-50 border border-slate-100"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                selectedServerId === server.id ? "bg-white/20" : "bg-emerald-50 text-emerald-600"
              )}>
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{server.nome}</p>
                <p className={cn(
                  "text-xs truncate",
                  selectedServerId === server.id ? "text-emerald-100" : "text-slate-400"
                )}>{server.cargo}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4">
        {selectedServer ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Orientações Técnicas</h2>
                <p className="text-slate-500">{selectedServer.nome}</p>
              </div>
              <Button onClick={() => handleOpenForm()} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="w-4 h-4" /> Nova Orientação
              </Button>
            </div>

            {isFormOpen && (
              <Card className="p-6 border-2 border-emerald-500 bg-emerald-50/30">
                <h3 className="text-lg font-bold mb-4 text-emerald-900">
                  {editingId ? 'Editar Orientação Técnica' : 'Nova Orientação Técnica'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Data</label>
                    <Input
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Assunto / Tópico</label>
                    <Input
                      placeholder="Ex: Novo Sistema de Gestão, Procedimentos RH..."
                      value={formData.assunto}
                      onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Local / Plataforma</label>
                    <Input
                      placeholder="Ex: Auditório Central, Microsoft Teams..."
                      value={formData.local}
                      onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Hora Início</label>
                    <Input
                      type="time"
                      value={formData.inicio}
                      onChange={(e) => setFormData({ ...formData, inicio: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Hora Fim</label>
                    <Input
                      type="time"
                      value={formData.fim}
                      onChange={(e) => setFormData({ ...formData, fim: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">DOE de Convocação</label>
                    <Input
                      type="date"
                      value={formData.doeConvocacao}
                      onChange={(e) => setFormData({ ...formData, doeConvocacao: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-xs font-medium text-slate-500 uppercase">Diária?</span>
                    <button
                      onClick={() => setFormData({ ...formData, pagoDiaria: !formData.pagoDiaria })}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all",
                        formData.pagoDiaria 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-slate-100 text-slate-400"
                      )}
                    >
                      {formData.pagoDiaria ? 'Sim' : 'Não'}
                    </button>
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">Salvar Orientação</Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid gap-6">
              {selectedServer.orientacoesTecnicas?.map((record) => (
                <Card key={record.id} className="p-6 border-l-4 border-l-emerald-500">
                  <div className="flex justify-between items-start">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Data e Assunto</span>
                        <p className="font-semibold text-slate-900">{new Date(record.data + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                        <p className="text-sm text-slate-600 mt-1">{record.assunto}</p>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Local e Horário</span>
                        <p className="text-sm font-medium text-slate-700">{record.local}</p>
                        <p className="text-xs text-slate-500 mt-1">{record.inicio} às {record.fim}</p>
                      </div>
                      <div className="flex gap-6">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">DOE</span>
                          <p className="text-sm font-medium text-slate-700">
                            {record.doeConvocacao ? new Date(record.doeConvocacao + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                          </p>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">Diária</span>
                          <span className={cn(
                            "inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1",
                            record.pagoDiaria ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                          )}>
                            {record.pagoDiaria ? 'Paga' : 'Não'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-emerald-600 hover:bg-emerald-50"
                        onClick={() => handleOpenForm(record)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => handleRemoveGuidance(record.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {(!selectedServer.orientacoesTecnicas || selectedServer.orientacoesTecnicas.length === 0) && (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                  <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhuma orientação técnica cadastrada.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 p-10 text-center">
            <BookOpen className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-medium mb-2">Orientações Técnicas</h3>
            <p className="max-w-xs">Selecione um servidor para gerenciar as orientações técnicas, convocações e diárias.</p>
          </div>
        )}
      </div>
    </div>
  );
};
