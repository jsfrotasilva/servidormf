
import { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Servers } from './pages/Servers';
import { Benefits } from './pages/Benefits';
import { Mobility } from './pages/Mobility';
import { Guidance } from './pages/Guidance';
import { Settings } from './pages/Settings';
import { Birthdays } from './pages/Birthdays';
import Reports from './pages/Reports';
import { Server, SchoolInfo, User } from './types/server';

const initialSchoolInfo: SchoolInfo = {
  nome: '',
  cie: '',
  ua: '',
  inep: '',
  endereco: '',
  bairro: '',
  cep: '',
  municipio: '',
  uf: '',
  telefone: '',
  email: '',
  diretor: '',
  diretorRG: ''
};

// Usuário padrão com acesso total
const defaultAdminUser: User = {
  id: 'admin-master',
  email: 'josecarlosfrota@gmail.com',
  name: 'José Carlos Frota da Silva',
  role: 'admin'
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [servers, setServers] = useState<Server[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(initialSchoolInfo);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      console.log('Iniciando busca global de dados (Modo Aberto)...');

      const { data: serversData, error: serversError } = await supabase
        .from('servers')
        .select('*')
        .order('nome', { ascending: true });

      if (serversData && !serversError) {
        const mappedServers: Server[] = serversData.map((s: any) => ({
          id: s.id,
          nome: s.nome,
          cpf: s.cpf,
          rgcin: s.rgcin,
          datanascimento: s.datanascimento,
          telefone: s.telefone,
          email: s.email,
          endereco: s.endereco,
          cargo: s.cargo,
          disciplina: s.disciplina,
          disciplinanaoespecifica: s.disciplinanaoespecifica,
          categoria: s.categoria,
          datadecontrato: s.datadecontrato,
          datafimsontrato: s.datafimsontrato,
          ativo: s.ativo ? 'Sim' : 'Não',
          ats: s.ats || [],
          sextaParte: s.sexta_parte || undefined,
          licencasPremio: s.licenca_premio || [],
          licencasPremioUsage: s.licenca_uso || [],
          evolucoesFuncionais: s.evolucao || [],
          locomocoes: s.mobility || [],
          orientacoesTecnicas: s.guidance || []
        }));
        setServers(mappedServers);
      }

      const { data: schoolData, error: schoolError } = await supabase
        .from('school_settings')
        .select('*')
        .maybeSingle();
      
      if (schoolData && !schoolError) {
        setSchoolInfo({
          nome: schoolData.name || '',
          cie: schoolData.cie || '',
          ua: schoolData.ua || '',
          inep: schoolData.inep || '',
          endereco: schoolData.address || '',
          bairro: schoolData.neighborhood || '',
          cep: schoolData.zip_code || '',
          municipio: schoolData.city || '',
          uf: schoolData.state || '',
          telefone: schoolData.phone || '',
          email: schoolData.email || '',
          diretor: schoolData.director_name || '',
          diretorRG: schoolData.director_rg || '',
          logo: schoolData.logo_url || undefined
        });
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const mapServerToSupabase = (server: Server) => {
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return null;
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      return dateStr;
    };

    return {
      id: server.id,
      nome: server.nome,
      cpf: server.cpf,
      rgcin: server.rgcin,
      datanascimento: formatDate(server.datanascimento),
      telefone: server.telefone,
      email: server.email,
      endereco: server.endereco,
      cargo: server.cargo,
      disciplina: server.disciplina,
      disciplinanaoespecifica: server.disciplinanaoespecifica,
      categoria: server.categoria,
      datadecontrato: formatDate(server.datadecontrato),
      datafimsontrato: formatDate(server.datafimsontrato),
      ativo: server.ativo === 'Sim',
      ats: server.ats || [],
      sexta_parte: server.sextaParte || null,
      licenca_premio: server.licencasPremio || [],
      licenca_uso: server.licencasPremioUsage || [],
      evolucao: server.evolucoesFuncionais || [],
      mobility: server.locomocoes || [],
      guidance: server.orientacoesTecnicas || [],
      updated_at: new Date().toISOString()
    };
  };

  const saveServersToSupabase = async (updatedServers: Server[]) => {
    const validServers = updatedServers.filter(s => s.nome?.trim() && s.cpf?.trim());
    setServers(updatedServers);
    localStorage.setItem('server_master_data', JSON.stringify(updatedServers));

    try {
      for (const server of validServers) {
        const mapped = mapServerToSupabase(server);
        await supabase.from('servers').upsert(mapped, { onConflict: 'cpf' });
      }
    } catch (err) {
      console.error('Erro ao sincronizar:', err);
    }
  };

  const handleUpdateSchool = async (info: SchoolInfo) => {
    setSchoolInfo(info);
    try {
      const mappedSchool = {
        name: info.nome,
        cie: info.cie,
        ua: info.ua,
        inep: info.inep,
        address: info.endereco,
        neighborhood: info.bairro,
        zip_code: info.cep,
        city: info.municipio,
        state: info.uf,
        phone: info.telefone,
        email: info.email,
        director_name: info.diretor,
        director_rg: info.diretorRG,
        logo_url: info.logo,
        updated_at: new Date().toISOString()
      };

      const { data: existingSchool } = await supabase.from('school_settings').select('id').limit(1);
      
      if (existingSchool && existingSchool.length > 0) {
        await supabase.from('school_settings').update(mappedSchool).eq('id', existingSchool[0].id);
      } else {
        await supabase.from('school_settings').insert(mappedSchool);
      }
    } catch (err) {
      console.error('Erro ao salvar escola:', err);
    }
  };

  const handleAddServer = (server: Server) => {
    saveServersToSupabase([...servers, server]);
  };

  const handleUpdateServer = async (serverId: string, data: Partial<Server>) => {
    const serverToUpdate = servers.find(s => s.id === serverId);
    if (!serverToUpdate) return;
    const updatedServer = { ...serverToUpdate, ...data };
    const updatedServers = servers.map(s => s.id === serverId ? updatedServer : s);
    setServers(updatedServers);
    try {
      const mapped = mapServerToSupabase(updatedServer);
      await supabase.from('servers').upsert(mapped);
    } catch (err) {
      console.error('Erro ao atualizar servidor:', err);
    }
  };

  const handleDeleteServer = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este servidor?')) {
      const updatedServers = servers.filter(s => s.id !== id);
      setServers(updatedServers);
      try {
        await supabase.from('servers').delete().eq('id', id);
      } catch (err) {
        console.error('Erro ao excluir:', err);
      }
    }
  };

  const handleImportServers = async (newServers: Server[]) => {
    const filtered = newServers.filter(s => s.nome?.trim() && s.cpf?.trim());
    if (filtered.length === 0) return;
    const updated = [...servers];
    filtered.forEach(news => {
      const idx = updated.findIndex(s => s.cpf === news.cpf);
      if (idx >= 0) {
        updated[idx] = { ...news, id: updated[idx].id };
      } else {
        updated.push(news);
      }
    });
    await saveServersToSupabase(updated);
  };

  const handleClearServers = async () => {
    if (confirm('Deseja apagar TODOS os dados?')) {
      setServers([]);
      try {
        await supabase.from('servers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.error('Erro ao limpar:', err);
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard servers={servers} />;
      case 'servers': return (
        <Servers 
          servers={servers}
          onAddServer={handleAddServer}
          onUpdateServer={(u) => handleUpdateServer(u.id, u)}
          onDeleteServer={handleDeleteServer}
          onImportServers={handleImportServers}
          onClearServers={handleClearServers}
        />
      );
      case 'benefits': return <Benefits servers={servers} user={defaultAdminUser} onUpdateServer={handleUpdateServer} />;
      case 'mobility': return <Mobility servers={servers} onUpdateServer={handleUpdateServer} />;
      case 'guidance': return <Guidance servers={servers} onUpdateServer={handleUpdateServer} />;
      case 'birthdays': return <Birthdays servers={servers} />;
      case 'reports': return <Reports servers={servers} school={schoolInfo} />;
      case 'settings': return <Settings schoolInfo={schoolInfo} onUpdateSchool={handleUpdateSchool} />;
      default: return <Dashboard servers={servers} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={defaultAdminUser}>
      {renderContent()}
    </Layout>
  );
}

export default App;
