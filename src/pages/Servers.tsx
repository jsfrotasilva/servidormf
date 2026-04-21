
import React, { useState, useRef } from 'react';
import { 
  Search, 
  FileUp, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  Download,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';

const WhatsAppIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    width="16" 
    height="16" 
    fill="currentColor" 
    className="text-emerald-500"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);
import { Button, Input, Card, Badge, Modal } from '../components/UI';
import { Server } from '../types/server';
import { processExcelFile, downloadExcelTemplate } from '../utils/excelProcessor';
import { formatDisplayDate, formatCPF, formatPhone } from '../utils/formatters';

// Helper to add days to a date string
const addDays = (dateStr: string, days: number): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

interface ServersProps {
  servers: Server[];
  onAddServer: (server: Server) => void;
  onUpdateServer: (server: Server) => void;
  onDeleteServer: (id: string) => void;
  onImportServers: (servers: Server[]) => void;
  onClearServers: () => void;
}

export const Servers = ({ 
  servers, 
  onAddServer, 
  onUpdateServer, 
  onDeleteServer,
  onImportServers,
  onClearServers
}: ServersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [viewingServer, setViewingServer] = useState<Server | null>(null);
  const [showBenefitDetails, setShowBenefitDetails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredServers = servers.filter(s => 
    s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cpf.includes(searchTerm) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isBirthdayToday = (birthdate: string) => {
    if (!birthdate) return false;
    const today = new Date();
    const birth = new Date(birthdate);
    if (isNaN(birth.getTime())) return false;
    
    // Adjusted for typical date input issues (timezone)
    const birthDay = birth.getDate() + 1;
    const birthMonth = birth.getMonth() + 1;
    
    return birthDay === today.getDate() && birthMonth === (today.getMonth() + 1);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await processExcelFile(file);
        onImportServers(imported);
      } catch (error) {
        console.error('Error importing excel:', error);
        alert('Erro ao importar o arquivo Excel. Verifique o formato das colunas.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const serverData: Server = {
      id: editingServer?.id || crypto.randomUUID(),
      nome: formData.get('nome') as string,
      cpf: formData.get('cpf') as string,
      rgcin: formData.get('rgcin') as string,
      datanascimento: formData.get('datanascimento') as string,
      telefone: formData.get('telefone') as string,
      email: formData.get('email') as string,
      endereco: formData.get('endereco') as string,
      cargo: formData.get('cargo') as string,
      disciplina: formData.get('disciplina') as string,
      disciplinanaoespecifica: formData.get('disciplinanaoespecifica') as string,
      categoria: formData.get('categoria') as string,
      datadecontrato: formData.get('datadecontrato') as string,
      datafimsontrato: formData.get('datafimsontrato') as string,
      ativo: (formData.get('ativo') as 'Sim' | 'Não') || 'Sim',
    };

    if (editingServer) {
      onUpdateServer(serverData);
    } else {
      onAddServer(serverData);
    }
    setIsModalOpen(false);
    setEditingServer(null);
  };

  const openEditModal = (server: Server) => {
    setEditingServer(server);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 text-left">Gerenciamento de Servidores</h1>
          <p className="text-sm text-slate-500">Visualize e gerencie todos os servidores cadastrados.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".xlsx, .xls"
          />
          <Button variant="outline" onClick={downloadExcelTemplate} title="Baixar modelo de planilha Excel">
            <Download className="mr-2 h-4 w-4" />
            Baixar Modelo
          </Button>
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={servers.length > 0}
            className={servers.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}
            title={servers.length > 0 ? 'Já existem dados importados. Limpe os dados para importar uma nova planilha.' : 'Importar planilha Excel'}
          >
            <FileUp className="mr-2 h-4 w-4" />
            Importar Excel
          </Button>
          {servers.length > 0 && (
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100" onClick={onClearServers}>
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar Dados
            </Button>
          )}
          <Button onClick={() => { setEditingServer(null); setIsModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Servidor
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Buscar por nome, CPF ou email..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Servidor</th>
                <th className="px-6 py-4">CPF / Contato</th>
                <th className="px-6 py-4">Cargo / Disciplina</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServers.map((server) => (
                <tr key={server.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-slate-900">{server.nome}</div>
                      <div className="text-xs text-slate-500">{server.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 font-medium">{formatCPF(server.cpf)}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{formatPhone(server.telefone)}</span>
                      {server.telefone && (
                        <a 
                          href={`https://wa.me/${server.telefone.replace(/\D/g, '')}${isBirthdayToday(server.datanascimento) ? `?text=${encodeURIComponent(
                            `Hoje é um dia especial — o seu dia! 🎉\n\nQueremos desejar um aniversário cheio de coisas boas: saúde, tranquilidade, conquistas e muitos momentos de alegria, dentro e fora do trabalho. Que você siga sendo essa pessoa dedicada, responsável e tão importante para o nosso dia a dia.\n\nSeu trabalho faz diferença, e sua presença também. Que este novo ciclo venha com reconhecimento, leveza e muitas realizações.\n\nFeliz aniversário! 🎂✨\nEquipe: EE PROFA. MARLENE FRATTINI.`
                          )}` : ''}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:scale-110 transition-transform"
                          title={isBirthdayToday(server.datanascimento) ? "Enviar parabéns no WhatsApp" : "Enviar mensagem no WhatsApp"}
                        >
                          <WhatsAppIcon />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">{server.cargo}</div>
                    <div className="text-xs text-slate-500">{server.disciplina}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{server.categoria}</td>
                  <td className="px-6 py-4">
                    <Badge variant={server.ativo === 'Sim' ? 'success' : 'danger'}>
                      <span className="flex items-center gap-1">
                        {server.ativo === 'Sim' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {server.ativo === 'Sim' ? 'Ativo' : 'Inativo'}
                      </span>
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setViewingServer(server)} title="Visualizar Detalhes">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(server)} title="Editar">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onDeleteServer(server.id)} title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredServers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nenhum servidor encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingServer ? 'Editar Servidor' : 'Cadastrar Novo Servidor'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nome Completo</label>
              <Input name="nome" defaultValue={editingServer?.nome} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">CPF</label>
              <Input name="cpf" defaultValue={editingServer?.cpf} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">RGCIN</label>
              <Input name="rgcin" defaultValue={editingServer?.rgcin} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Data de Nascimento</label>
              <Input name="datanascimento" type="date" defaultValue={editingServer?.datanascimento} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Telefone</label>
              <Input name="telefone" defaultValue={editingServer?.telefone} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input name="email" type="email" defaultValue={editingServer?.email} required />
            </div>
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700">Endereço</label>
              <Input name="endereco" defaultValue={editingServer?.endereco} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Cargo</label>
              <Input name="cargo" defaultValue={editingServer?.cargo} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Disciplina</label>
              <Input name="disciplina" defaultValue={editingServer?.disciplina} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Disciplina Não Específica</label>
              <Input name="disciplinanaoespecifica" defaultValue={editingServer?.disciplinanaoespecifica} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Categoria</label>
              <Input name="categoria" defaultValue={editingServer?.categoria} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Data de Contrato</label>
              <Input name="datadecontrato" type="date" defaultValue={editingServer?.datadecontrato} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Data Fim Contrato</label>
              <Input name="datafimsontrato" type="date" defaultValue={editingServer?.datafimsontrato} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select 
                name="ativo" 
                defaultValue={editingServer?.ativo || 'Sim'}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
              >
                <option value="Sim">Ativo</option>
                <option value="Não">Inativo</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingServer ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Visualização de Detalhes */}
      <Modal
        isOpen={!!viewingServer}
        onClose={() => { setViewingServer(null); setShowBenefitDetails(false); }}
        title="Detalhes do Servidor"
      >
        {viewingServer && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div className="col-span-2 pb-2 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Informações Pessoais</h3>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Nome</p>
                <p className="text-sm font-medium text-slate-900">{viewingServer.nome}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">CPF</p>
                <p className="text-sm font-medium text-slate-900">{formatCPF(viewingServer.cpf)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">RGCIN</p>
                <p className="text-sm font-medium text-slate-900">{viewingServer.rgcin || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Data de Nascimento</p>
                <p className="text-sm font-medium text-slate-900">{formatDisplayDate(viewingServer.datanascimento)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Telefone</p>
                <p className="text-sm font-medium text-slate-900">{formatPhone(viewingServer.telefone) || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Email</p>
                <p className="text-sm font-medium text-slate-900">{viewingServer.email || '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500 uppercase">Endereço</p>
                <p className="text-sm font-medium text-slate-900">{viewingServer.endereco || '-'}</p>
              </div>

              <div className="col-span-2 mt-4 pb-2 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Informações Profissionais</h3>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Cargo</p>
                <p className="text-sm font-medium text-slate-900">{viewingServer.cargo}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Categoria</p>
                <p className="text-sm font-medium text-slate-900">{viewingServer.categoria || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Disciplina</p>
                <p className="text-sm font-medium text-slate-900">{viewingServer.disciplina || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Disciplina Não Específica</p>
                <p className="text-sm font-medium text-slate-900">{viewingServer.disciplinanaoespecifica || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Data de Contrato</p>
                <p className="text-sm font-medium text-slate-900">{formatDisplayDate(viewingServer.datadecontrato)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Data Fim Contrato</p>
                <p className="text-sm font-medium text-slate-900">{formatDisplayDate(viewingServer.datafimsontrato)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Status</p>
                <Badge variant={viewingServer.ativo === 'Sim' ? 'success' : 'danger'}>
                  {viewingServer.ativo === 'Sim' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              {['A-EFETIVO', 'ACT-F'].includes(viewingServer.categoria?.toUpperCase().trim() || '') && (
                <>
                  <div className="col-span-2 mt-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Vantagens</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">DETALHAR</span>
                      <button 
                        onClick={() => setShowBenefitDetails(!showBenefitDetails)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500 ${showBenefitDetails ? 'bg-blue-600' : 'bg-slate-200'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${showBenefitDetails ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>

                  {!showBenefitDetails ? (
                    <>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">ATS (Quinquênios)</p>
                        <p className="text-sm font-medium text-slate-900">{viewingServer.ats?.length || 0} registrados</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">Sexta-Parte</p>
                        <Badge variant={viewingServer.sextaParte ? 'info' : 'outline'}>
                          {viewingServer.sextaParte ? 'Concedido' : 'Não cadastrado'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">Licenças-Prêmio</p>
                        <p className="text-sm font-medium text-slate-900">{viewingServer.licencasPremio?.length || 0} certidões</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">Evoluções Funcionais</p>
                        <p className="text-sm font-medium text-slate-900">{viewingServer.evolucoesFuncionais?.length || 0} registros</p>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      {/* Detalhes de ATS */}
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-blue-500" />
                          Histórico de ATS (Quinquênios)
                        </h4>
                        {viewingServer.ats && viewingServer.ats.length > 0 ? (
                          <div className="space-y-3">
                            {viewingServer.ats.map((item, idx) => (
                              <div key={idx} className="text-sm bg-white p-2 rounded shadow-sm border border-slate-100">
                                <div className="font-semibold text-slate-900">{item.motivo}</div>
                                <div className="grid grid-cols-2 gap-2 mt-1 text-xs text-slate-600">
                                  <span>Vigência: {formatDisplayDate(item.vigencia)}</span>
                                  <span>DOE: {formatDisplayDate(item.dataPublicacaoDOE)}</span>
                                </div>
                                {item.ultimoAts && (
                                  <div className="mt-1 text-[10px] font-bold text-orange-600 uppercase">
                                    Próximo Vencimento: {formatDisplayDate(addDays(item.vigencia, 1825))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-xs text-slate-400 italic">Nenhum ATS registrado.</p>}
                      </div>

                      {/* Detalhes da Sexta-Parte */}
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-purple-500" />
                          Sexta-Parte
                        </h4>
                        {viewingServer.sextaParte ? (
                          <div className="text-sm bg-white p-2 rounded shadow-sm border border-slate-100">
                            <div className="font-semibold text-slate-900">Benefício Concedido</div>
                            <div className="grid grid-cols-2 gap-2 mt-1 text-xs text-slate-600">
                              <span>Vigência: {formatDisplayDate(viewingServer.sextaParte.vigencia)}</span>
                              <span>DOE: {formatDisplayDate(viewingServer.sextaParte.dataPublicacaoDOE)}</span>
                            </div>
                          </div>
                        ) : <p className="text-xs text-slate-400 italic">Não concedido.</p>}
                      </div>

                      {/* Detalhes de Licença Prêmio */}
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-emerald-500" />
                          Certidões de Licença-Prêmio
                        </h4>
                        {viewingServer.licencasPremio && viewingServer.licencasPremio.length > 0 ? (
                          <div className="space-y-4">
                            {viewingServer.licencasPremio.map((cert) => {
                              const utilizacoes = viewingServer.licencasPremioUsage?.filter(u => u.certidaoId === cert.id) || [];
                              const totalUsado = utilizacoes.reduce((sum, u) => sum + u.quantidadeDias, 0);
                              const saldoAtual = cert.saldoInicial - totalUsado;
                              
                              return (
                                <div key={cert.id} className="bg-white p-2 rounded shadow-sm border border-slate-100">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="font-semibold text-slate-900">Certidão: {cert.numeroCertidao}</div>
                                      <div className="text-[10px] text-slate-500">Período Aquisitivo: {cert.periodoAquisitivo}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className={`text-xs font-bold ${saldoAtual > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        Saldo: {saldoAtual} dias
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-1">DOE: {formatDisplayDate(cert.dataDOE)}</div>
                                  
                                  {cert.ultimaCertidao && cert.inicioVigenciaProxima && (
                                    <div className="mt-1 text-[9px] font-bold text-blue-600 uppercase">
                                      Próxima Certidão: {formatDisplayDate(cert.inicioVigenciaProxima)} até {formatDisplayDate(addDays(cert.inicioVigenciaProxima, 1825))}
                                    </div>
                                  )}

                                  {/* Usos da Certidão */}
                                  {utilizacoes.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-slate-50 space-y-1">
                                      <p className="text-[9px] font-bold text-slate-400 uppercase">Histórico de Uso:</p>
                                      {utilizacoes.map((uso) => (
                                        <div key={uso.id} className="text-[10px] flex justify-between bg-slate-50 p-1 rounded">
                                          <span>
                                            {uso.tipo} 
                                            {uso.tipo === 'Gozo' && uso.dataIncio ? ` (${formatDisplayDate(uso.dataIncio)})` : ''}
                                            {uso.tipo === 'Pecúnia' && uso.anoPecunia ? ` (${uso.anoPecunia})` : ''}
                                          </span>
                                          <span className="font-medium text-red-500">-{uso.quantidadeDias} dias</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : <p className="text-xs text-slate-400 italic">Nenhuma certidão registrada.</p>}
                      </div>

                      {/* Detalhes de Evolução Funcional */}
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-indigo-500" />
                          Evolução Funcional
                        </h4>
                        {viewingServer.evolucoesFuncionais && viewingServer.evolucoesFuncionais.length > 0 ? (
                          <div className="space-y-2">
                            {viewingServer.evolucoesFuncionais.map((ev) => (
                              <div key={ev.id} className="text-sm bg-white p-2 rounded shadow-sm border border-slate-100">
                                <div className="font-semibold text-slate-900">{ev.motivo}</div>
                                <div className="text-xs text-slate-700 mt-1">
                                  Nível {ev.nivelDe} <span className="text-slate-400">→</span> Nível {ev.nivelPara}
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-1 text-[10px] text-slate-500">
                                  <span>Vigência: {formatDisplayDate(ev.vigencia)}</span>
                                  <span>DOE: {formatDisplayDate(ev.dataPublicacaoDOE)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-xs text-slate-400 italic">Nenhum registro de evolução.</p>}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button onClick={() => { setViewingServer(null); setShowBenefitDetails(false); }}>Fechar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
