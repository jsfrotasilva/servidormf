
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
import { Login } from './pages/Login';
import { Server, SchoolInfo } from './types/server';

const initialSchoolInfo: SchoolInfo = {
  nome: '',
  cie: '',
  ua: '',
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

function App() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [servers, setServers] = useState<Server[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(initialSchoolInfo);

  // Gerenciar Sessão de Autenticação
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    if (!session) return;

    try {
      // Buscar Servidores do Supabase
      const { data: serversData, error: serversError } = await supabase
        .from('servers')
        .select('*')
        .order('nome', { ascending: true });

      if (serversData && !serversError) {
        // Mapear do formato do banco para o formato do App
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
      } else {
        const savedServers = localStorage.getItem('server_master_data');
        if (savedServers) setServers(JSON.parse(savedServers));
      }

      // Buscar Escola do Supabase
      const { data: schoolData, error: schoolError } = await supabase
        .from('school_settings')
        .select('*')
        .single();
      
      if (schoolData && !schoolError) {
        setSchoolInfo({
          nome: schoolData.name || '',
          cie: schoolData.cie || '',
          ua: schoolData.ua || '',
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
      } else {
        const savedSchool = localStorage.getItem('server_master_school');
        if (savedSchool) setSchoolInfo(JSON.parse(savedSchool));
      }
    } catch (err) {
      console.error('Erro na conexão inicial:', err);
    }
  }, [session]);

  // Carregar dados sempre que a sessão mudar
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
    // Filtra servidores válidos (precisa ter nome e CPF) para o banco de dados
    const validServers = updatedServers.filter(s => s.nome?.trim() && s.cpf?.trim());
    
    setServers(updatedServers);
    localStorage.setItem('server_master_data', JSON.stringify(updatedServers));

    try {
      for (const server of validServers) {
        const mapped = mapServerToSupabase(server);
        const { error } = await supabase.from('servers').upsert(mapped, { onConflict: 'cpf' });
        if (error) {
          if (error.code === '23505') {
            console.warn(`CPF duplicado ignorado: ${server.cpf}`);
          } else {
            console.error('Erro no upsert do servidor:', error);
          }
        }
      }
    } catch (err) {
      console.error('Erro ao sincronizar com Supabase:', err);
    }
  };

  const handleUpdateSchool = async (info: SchoolInfo) => {
    // Garantir que não estamos salvando um nome vazio se já houver um nome definido
    if (!info.nome && schoolInfo.nome) {
      console.warn('Tentativa de salvar nome da escola vazio bloqueada.');
      return;
    }

    setSchoolInfo(info);
    localStorage.setItem('server_master_school', JSON.stringify(info));

    try {
      const mappedSchool = {
        name: info.nome,
        cie: info.cie,
        ua: info.ua,
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
        const { error } = await supabase.from('school_settings').update(mappedSchool).eq('id', existingSchool[0].id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('school_settings').insert(mappedSchool);
        if (error) throw error;
      }
    } catch (err) {
      console.error('Erro ao salvar escola no Supabase:', err);
    }
  };

  const handleAddServer = (server: Server) => {
    if (!server.nome?.trim() || !server.cpf?.trim()) {
      alert('Nome e CPF são campos obrigatórios.');
      return;
    }
    saveServersToSupabase([...servers, server]);
  };

  const handleUpdateServer = async (serverId: string, data: Partial<Server>) => {
    const serverToUpdate = servers.find(s => s.id === serverId);
    if (!serverToUpdate) return;

    const updatedServer = { ...serverToUpdate, ...data };
    const updatedServers = servers.map(s => s.id === serverId ? updatedServer : s);
    
    setServers(updatedServers);
    localStorage.setItem('server_master_data', JSON.stringify(updatedServers));

    try {
      const mapped = mapServerToSupabase(updatedServer);
      const { error } = await supabase.from('servers').upsert(mapped);
      if (error) console.error('Erro ao atualizar servidor no Supabase:', error);
    } catch (err) {
      console.error('Erro ao atualizar servidor no Supabase:', err);
    }
  };

  const handleDeleteServer = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este servidor?')) {
      const updatedServers = servers.filter(s => s.id !== id);
      setServers(updatedServers);
      localStorage.setItem('server_master_data', JSON.stringify(updatedServers));

      try {
        await supabase.from('servers').delete().eq('id', id);
      } catch (err) {
        console.error('Erro ao excluir servidor no Supabase:', err);
      }
    }
  };

  const handleImportServers = async (newServers: Server[]) => {
    // Filtra apenas servidores com dados essenciais
    const filtered = newServers.filter(s => s.nome?.trim() && s.cpf?.trim());
    
    if (filtered.length === 0) {
      alert('Nenhum servidor válido encontrado na planilha. Verifique se as colunas Nome e CPF estão preenchidas.');
      return;
    }

    // Mescla com os servidores existentes evitando duplicados por CPF
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
    alert(`${filtered.length} servidores processados e sincronizados com sucesso!`);
  };

  const handleClearServers = async () => {
    if (confirm('Tem certeza que deseja apagar TODOS os servidores importados? Esta ação não pode ser desfeita.')) {
      setServers([]);
      localStorage.setItem('server_master_data', JSON.stringify([]));
      
      try {
        // No Supabase, deletamos todos (cuidado em produção!)
        const { error } = await supabase.from('servers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) throw error;
      } catch (err) {
        console.error('Erro ao limpar Supabase:', err);
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard servers={servers} />;
      case 'servers':
        return (
          <Servers 
            servers={servers}
            onAddServer={handleAddServer}
            onUpdateServer={(updatedServer) => handleUpdateServer(updatedServer.id, updatedServer)}
            onDeleteServer={handleDeleteServer}
            onImportServers={handleImportServers}
            onClearServers={handleClearServers}
          />
        );
      case 'benefits':
        return (
          <Benefits 
            servers={servers}
            onUpdateServer={handleUpdateServer}
          />
        );
      case 'mobility':
        return (
          <Mobility 
            servers={servers}
            onUpdateServer={handleUpdateServer}
          />
        );
      case 'guidance':
        return (
          <Guidance 
            servers={servers}
            onUpdateServer={handleUpdateServer}
          />
        );
      case 'birthdays':
        return (
          <Birthdays servers={servers} />
        );
      case 'reports':
        return (
          <Reports servers={servers} school={schoolInfo} />
        );
      case 'settings':
        return (
          <Settings 
            schoolInfo={schoolInfo}
            onUpdateSchool={handleUpdateSchool}
          />
        );
      default:
        return <Dashboard servers={servers} />;
    }
  };

  if (!session) {
    return <Login />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;
