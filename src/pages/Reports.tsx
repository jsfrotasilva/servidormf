import React, { useState } from 'react';
import { Printer, Users, ClipboardCheck, Truck, BookOpen, X, Search, Calendar } from 'lucide-react';
import { Server, Locomocao, OrientacaoTecnica, SchoolInfo } from '../types/server';
import { Card, Button, Input } from '../components/UI';
import { format } from 'date-fns';

interface ReportsProps {
  servers: Server[];
  school?: SchoolInfo;
}

const Reports: React.FC<ReportsProps> = ({ servers, school }) => {
  const [activeModal, setActiveModal] = useState<'general' | 'acknowledgement' | 'activity' | 'concessions' | null>(null);
  const [subject, setSubject] = useState('');
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const activeServers = servers.filter(s => s.ativo === 'Sim');
  
  const serversWithActivity = servers.filter(s => 
    (s.locomocoes && s.locomocoes.length > 0) || 
    (s.orientacoesTecnicas && s.orientacoesTecnicas.length > 0) ||
    (s.ausencias && s.ausencias.length > 0)
  );

  const handlePrint = () => {
    window.print();
  };

  const PrintHeader = ({ title }: { title: string }) => (
    <div className="hidden print:block mb-4">
      <div className="flex items-start justify-between border-b-2 border-black pb-2">
        <div className="w-24 h-24 flex items-center justify-center overflow-hidden">
          {school?.logo ? (
            <img src={school.logo} alt="Logo Escola" className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="w-full h-full border border-dashed border-gray-300 flex items-center justify-center text-[8pt] italic text-gray-400">
              Logo
            </div>
          )}
        </div>
        <div className="flex-1 text-center px-4">
          <h1 className="text-[12pt] font-bold uppercase leading-tight">Governo do Estado de São Paulo</h1>
          <h2 className="text-[10pt] font-bold uppercase leading-tight">Secretaria de Estado da Educação</h2>
          <h3 className="text-[9pt] font-bold uppercase leading-tight mb-2">Unidade Regional de Ensino de Araraquara</h3>
          
          <div className="text-[8.5pt] leading-snug">
            <p className="font-bold text-[9.5pt] uppercase mb-0.5">{school?.nome || 'EE PROFA. MARLENE FRATTINI'}</p>
            <p>
              {school?.endereco || 'Endereço não cadastrado'}{school?.bairro ? `, ${school.bairro}` : ''} 
              {school?.cep ? ` - CEP: ${school.cep}` : ''}
            </p>
            <p>
              {school?.municipio ? `${school.municipio} - ${school?.uf || 'SP'}` : ''}
              {school?.telefone ? ` | Tel: ${school.telefone}` : ''}
            </p>
            <p>{school?.email ? `E-mail: ${school.email}` : ''}</p>
          </div>
        </div>
        <div className="w-24 text-right text-[8pt] text-black pt-1">
          <p>Data: {format(new Date(), 'dd/MM/yyyy')}</p>
        </div>
      </div>
      <div className="mt-4 text-center">
        <h4 className="text-[11pt] font-bold uppercase">{title}</h4>
      </div>
    </div>
  );

  const renderGeneralReport = () => (
    <div className="p-8 print:p-0 bg-white font-sans">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-xl font-bold">Relatório Geral de Servidores Ativos</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActiveModal(null)}><X className="w-4 h-4 mr-2" /> Fechar</Button>
          <Button onClick={handlePrint}><Printer className="w-4 h-4 mr-2" /> Imprimir</Button>
        </div>
      </div>
      
      <PrintHeader title="Relatório Geral de Servidores Ativos" />

      <table className="w-full border-collapse border border-black text-[11px]">
        <thead>
          <tr className="bg-gray-100 print:bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Nome</th>
            <th className="border border-gray-300 p-2 text-left">RG/CIN</th>
            <th className="border border-gray-300 p-2 text-left">CPF</th>
            <th className="border border-gray-300 p-2 text-left">Cargo</th>
            <th className="border border-gray-300 p-2 text-left">Categoria</th>
          </tr>
        </thead>
        <tbody>
          {activeServers.map(server => (
            <tr key={server.id}>
              <td className="border border-gray-300 p-2">{server.nome}</td>
              <td className="border border-gray-300 p-2">{server.rgcin}</td>
              <td className="border border-gray-300 p-2">{server.cpf}</td>
              <td className="border border-gray-300 p-2">{server.cargo}</td>
              <td className="border border-gray-300 p-2">{server.categoria}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAcknowledgementList = () => (
    <div className="p-8 print:p-0 bg-white font-sans">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div className="flex-1 max-w-md mr-4">
          <label className="block text-sm font-medium mb-1">Assunto da Ciência</label>
          <Input 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            placeholder="Digite o assunto para a lista..."
          />
        </div>
        <div className="flex gap-2 self-end">
          <Button variant="outline" onClick={() => setActiveModal(null)}><X className="w-4 h-4 mr-2" /> Fechar</Button>
          <Button onClick={handlePrint} disabled={!subject}><Printer className="w-4 h-4 mr-2" /> Imprimir</Button>
        </div>
      </div>

      <PrintHeader title="Lista de Ciência" />

      <div className="mb-6 print:mt-4">
        <p className="font-bold text-sm mb-4 uppercase">ASSUNTO: <span className="font-normal underline decoration-dotted ml-2">{subject || '__________________________________________________________________'}</span></p>
      </div>

      <table className="w-full border-collapse border border-black text-[11px]">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-black p-2 text-left w-1/3">Nome do Servidor</th>
            <th className="border border-black p-2 text-left w-1/4">RG/CIN</th>
            <th className="border border-black p-2 text-center w-32">Data</th>
            <th className="border border-black p-2 text-center">Assinatura</th>
          </tr>
        </thead>
        <tbody>
          {activeServers.map(server => (
            <tr key={server.id} className="h-10">
              <td className="border border-black p-2 uppercase font-medium">{server.nome}</td>
              <td className="border border-black p-2">{server.rgcin}</td>
              <td className="border border-black p-2 text-center">____/____/____</td>
              <td className="border border-black p-2"></td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-8 text-right text-xs italic print:block hidden">
        Documento gerado em {format(new Date(), 'dd/MM/yyyy')} pelo sistema ServerMaster Pro
      </div>
    </div>
  );

  const renderActivityReport = () => {
    const server = servers.find(s => s.id === selectedServerId);
    const [year, month] = selectedMonth.split('-');
    
    const locomocoesInMonth = server?.locomocoes?.filter((m: Locomocao) => {
      // Handles both YYYY-MM-DD and DD/MM/YYYY
      const dateStr = m.data.includes('-') ? m.data : m.data.split('/').reverse().join('-');
      const [y, m_month] = dateStr.split('-');
      return m_month === month && y === year;
    }) || [];

    const orientacoesInMonth = server?.orientacoesTecnicas?.filter((g: OrientacaoTecnica) => {
      const dateStr = g.data.includes('-') ? g.data : g.data.split('/').reverse().join('-');
      const [y, m_month] = dateStr.split('-');
      return m_month === month && y === year;
    }) || [];

    const ausenciasInMonth = server?.ausencias?.filter((a) => {
      const dateStr = a.data.includes('-') ? a.data : a.data.split('/').reverse().join('-');
      const [y, m_month] = dateStr.split('-');
      return m_month === month && y === year;
    }) || [];

    return (
      <div className="p-8 print:p-0 bg-white font-sans">
        <div className="flex flex-col gap-4 mb-6 print:hidden">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Relatório de Locomoção e Orientações Técnicas</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setActiveModal(null)}><X className="w-4 h-4 mr-2" /> Fechar</Button>
              <Button onClick={handlePrint} disabled={!selectedServerId}><Printer className="w-4 h-4 mr-2" /> Imprimir</Button>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Selecionar Servidor (com registros)</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
                value={selectedServerId || ''}
                onChange={(e) => setSelectedServerId(e.target.value)}
              >
                <option value="">Selecione um servidor...</option>
                {serversWithActivity.map(s => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium mb-1">Mês/Ano</label>
              <Input 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)} 
              />
            </div>
          </div>
        </div>

        {server ? (
          <div className="animate-in fade-in duration-500">
            <PrintHeader title="Relatório Mensal de Atividades" />

            {/* Informações do Servidor e Diretor na mesma linha - Layout Sofisticado */}
            <div className="mt-4 mb-6 border-2 border-black print:border-black">
              <table className="w-full">
                <tbody>
                  <tr className="bg-gradient-to-r from-blue-50 to-blue-100 print:bg-gray-100">
                    <td className="border-r border-black p-2 w-1/3">
                      <p className="text-[9px] font-bold uppercase text-gray-600 print:text-black">SERVIDOR</p>
                      <p className="text-[11pt] font-bold uppercase">{server.nome}</p>
                    </td>
                    <td className="border-r border-black p-2 w-1/3">
                      <p className="text-[9px] font-bold uppercase text-gray-600 print:text-black">CARGO</p>
                      <p className="text-[11pt] font-bold uppercase">{server.cargo}</p>
                    </td>
                    <td className="border-r border-black p-2 w-1/4">
                      <p className="text-[9px] font-bold uppercase text-gray-600 print:text-black">RG/CIN</p>
                      <p className="text-[11pt] font-bold">{server.rgcin}</p>
                    </td>
                    <td className="p-2 w-1/6">
                      <p className="text-[9px] font-bold uppercase text-gray-600 print:text-black">REF.</p>
                      <p className="text-[11pt] font-bold">{month}/{year}</p>
                    </td>
                  </tr>
                  <tr className="bg-gradient-to-r from-purple-50 to-purple-100 print:bg-gray-50">
                    <td className="border-r border-black p-2">
                      <p className="text-[9px] font-bold uppercase text-gray-600 print:text-black">DIRETOR(A)</p>
                      <p className="text-[10pt] font-bold">{school?.diretor || 'Direção Escolar'}</p>
                    </td>
                    <td className="border-r border-black p-2">
                      <p className="text-[9px] font-bold uppercase text-gray-600 print:text-black">RG DIRETOR</p>
                      <p className="text-[10pt] font-bold">{school?.diretorRG || '_______-___'}</p>
                    </td>
                    <td className="border-r border-black p-2">
                      <p className="text-[9px] font-bold uppercase text-gray-600 print:text-black">UNIDADE</p>
                      <p className="text-[10pt] font-bold">{school?.nome || 'EE PROFA. MARLENE FRATTINI'}</p>
                    </td>
                    <td className="p-2 text-right">
                      <p className="text-[9px] font-bold uppercase text-gray-600 print:text-black">DATA EMISSÃO</p>
                      <p className="text-[10pt] font-bold">{format(new Date(), 'dd/MM/yyyy')}</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Seção I - Locomoções com design sofisticado */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 mb-0 print:bg-gray-800 print:text-white">
                <h3 className="text-[11pt] font-bold uppercase tracking-wide">I - LOCOMOÇÕES NO PERÍODO</h3>
              </div>
              {locomocoesInMonth.length > 0 ? (
                <table className="w-full border-collapse border-2 border-black text-[10pt]">
                  <thead>
                    <tr className="bg-gray-200 print:bg-gray-100">
                      <th className="border-2 border-black p-2 text-left w-28 font-bold">DATA</th>
                      <th className="border-2 border-black p-2 text-left font-bold">MOTIVO</th>
                      <th className="border-2 border-black p-2 text-center w-24 font-bold">SAÍDA</th>
                      <th className="border-2 border-black p-2 text-center w-24 font-bold">RETORNO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locomocoesInMonth.map((m: Locomocao, i: number) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border-2 border-black p-2 font-semibold">
                          {new Date(m.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="border-2 border-black p-2 font-medium">{m.motivo}</td>
                        <td className="border-2 border-black p-2 text-center font-semibold">{m.saida}</td>
                        <td className="border-2 border-black p-2 text-center font-semibold">{m.retorno}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="border-2 border-black p-4 text-center italic bg-gray-50">
                  <p className="text-[10pt]">Nenhuma locomoção registrada neste mês.</p>
                </div>
              )}
            </div>

            {/* Seção II - Orientações Técnicas com design sofisticado */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 mb-0 print:bg-gray-800 print:text-white">
                <h3 className="text-[11pt] font-bold uppercase tracking-wide">II - ORIENTAÇÕES TÉCNICAS NO PERÍODO</h3>
              </div>
              {orientacoesInMonth.length > 0 ? (
                <table className="w-full border-collapse border-2 border-black text-[10pt]">
                  <thead>
                    <tr className="bg-gray-200 print:bg-gray-100">
                      <th className="border-2 border-black p-2 text-left w-24 font-bold">DATA</th>
                      <th className="border-2 border-black p-2 text-left font-bold">ASSUNTO</th>
                      <th className="border-2 border-black p-2 text-left font-bold">LOCAL</th>
                      <th className="border-2 border-black p-2 text-center w-28 font-bold">HORÁRIO</th>
                      <th className="border-2 border-black p-2 text-center w-24 font-bold">DOE</th>
                      <th className="border-2 border-black p-2 text-center w-16 font-bold">DIÁRIA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orientacoesInMonth.map((g: OrientacaoTecnica, i: number) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border-2 border-black p-2 font-semibold">
                          {new Date(g.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="border-2 border-black p-2 font-medium">{g.assunto}</td>
                        <td className="border-2 border-black p-2 font-medium">{g.local}</td>
                        <td className="border-2 border-black p-2 text-center font-semibold">{g.inicio} - {g.fim}</td>
                        <td className="border-2 border-black p-2 text-center font-semibold">
                          {g.doeConvocacao ? new Date(g.doeConvocacao + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="border-2 border-black p-2 text-center font-semibold">
                          {g.pagoDiaria ? 'SIM' : 'NÃO'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="border-2 border-black p-4 text-center italic bg-gray-50">
                  <p className="text-[10pt]">Nenhuma orientação técnica registrada neste mês.</p>
                </div>
              )}
            </div>

            {/* Seção III - Ausências no Período */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 mb-0 print:bg-gray-800 print:text-white">
                <h3 className="text-[11pt] font-bold uppercase tracking-wide">III - AUSÊNCIAS NO PERÍODO</h3>
              </div>
              {ausenciasInMonth.length > 0 ? (
                <table className="w-full border-collapse border-2 border-black text-[10pt]">
                  <thead>
                    <tr className="bg-gray-200 print:bg-gray-100">
                      <th className="border-2 border-black p-2 text-left w-28 font-bold">DATA</th>
                      <th className="border-2 border-black p-2 text-left font-bold">TIPO</th>
                      <th className="border-2 border-black p-2 text-left font-bold">DESCRIÇÃO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ausenciasInMonth.map((a, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border-2 border-black p-2 font-semibold">
                          {new Date(a.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="border-2 border-black p-2 font-semibold">
                          {a.tipo === 'Total' ? 'TOTAL' : 'PARCIAL'}
                        </td>
                        <td className="border-2 border-black p-2 font-medium">{a.descricao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="border-2 border-black p-4 text-center italic bg-gray-50">
                  <p className="text-[10pt]">Nenhuma ausência registrada neste mês.</p>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
            <Search className="w-12 h-12 mb-2 opacity-20" />
            <p>Selecione um servidor e o mês para gerar o relatório detalhado.</p>
          </div>
        )}
      </div>
    );
  };

  const addYearsInclusive = (dateStr: string, years: number) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    
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

  const renderConcessionsReport = () => {
    const concessions: any[] = [];

    servers.forEach(server => {
      // ATS
      if (server.ats) {
        server.ats.forEach(ats => {
          if (ats.ultimoAts && ats.vigencia) {
            concessions.push({
              nome: server.nome,
              tipo: 'ATS (Quinquênio)',
              referencia: ats.motivo,
              vencimento: addYearsInclusive(ats.vigencia, 5)
            });
          }
        });
      }

      // Licença Prêmio
      if (server.licencasPremio) {
        server.licencasPremio.forEach(lp => {
          if (lp.ultimaCertidao && lp.inicioVigenciaProxima) {
            concessions.push({
              nome: server.nome,
              tipo: 'Licença-Prêmio',
              referencia: `Próx. de ${lp.numeroCertidao}`,
              vencimento: addYearsInclusive(lp.inicioVigenciaProxima, 5)
            });
          }
        });
      }

      // Evolução Funcional
      if (server.evolucoesFuncionais) {
        server.evolucoesFuncionais.forEach(ev => {
          if (ev.isUltima && ev.vigencia && ev.nivelPara) {
            // Determine the interval (interstício) based on the next transition
            // The logic from the image:
            // I para II, II para III, V para VI, VI para VII, VII para VIII = 4 anos
            // III para IV, IV para V = 5 anos
            let years = 4;
            const levelTo = ev.nivelPara;
            
            if (levelTo === 'III') years = 5; // Next is III to IV
            else if (levelTo === 'IV') years = 5; // Next is IV to V
            else if (levelTo === 'I') years = 4; // Next is I to II
            else if (levelTo === 'II') years = 4; // Next is II to III
            else if (levelTo === 'V') years = 4; // Next is V to VI
            else if (levelTo === 'VI') years = 4; // Next is VI to VII
            else if (levelTo === 'VII') years = 4; // Next is VII to VIII
            
            concessions.push({
              nome: server.nome,
              tipo: 'Evolução Funcional',
              referencia: `Nível ${ev.nivelPara} → Próximo`,
              vencimento: addYearsInclusive(ev.vigencia, years)
            });
          }
        });
      }
    });

    // Sort by expiration date
    concessions.sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime());

    return (
      <div className="p-8 print:p-0 bg-white font-sans">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600" />
            Próximas Concessões a Vencer
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveModal(null)}><X className="w-4 h-4 mr-2" /> Fechar</Button>
            <Button onClick={handlePrint}><Printer className="w-4 h-4 mr-2" /> Imprimir</Button>
          </div>
        </div>

        <PrintHeader title="Relatório de Próximas Concessões a Vencer" />

        <div className="mb-4 text-[10px] text-gray-600 print:block hidden italic">
          Relação de servidores com benefícios marcados como "Última Concessão", ordenados cronologicamente pela data de vencimento estimada.
        </div>

        <table className="w-full border-collapse border border-black text-[10px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left w-[40%]">Servidor</th>
              <th className="border border-black p-2 text-left w-[20%]">Tipo</th>
              <th className="border border-black p-2 text-left w-[20%]">Referência</th>
              <th className="border border-black p-2 text-center w-[20%]">Próximo Vencimento</th>
            </tr>
          </thead>
          <tbody>
            {concessions.length > 0 ? concessions.map((c, i) => (
              <tr key={i}>
                <td className="border border-black p-2 uppercase font-medium">{c.nome}</td>
                <td className="border border-black p-2">{c.tipo}</td>
                <td className="border border-black p-2">{c.referencia}</td>
                <td className="border border-black p-2 text-center font-bold">
                  {new Date(c.vencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="border border-black p-4 text-center italic text-gray-500">
                  Não há concessões futuras marcadas como "Última" no sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-32 text-center print:block hidden">
          <div className="w-full max-w-[300px] border-t border-black pt-2 mx-auto">
            <p className="text-[10px] font-bold uppercase">{school?.diretor || 'Direção Escolar'}</p>
            <p className="text-[9px]">RG: {school?.diretorRG || '_______-___'}</p>
            <p className="text-[9px]">Assinatura e Carimbo</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Relatórios e Documentos</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="cursor-pointer" onClick={() => setActiveModal('general')}>
            <Card className="hover:shadow-lg transition-shadow group h-full">
              <div className="flex flex-col items-center p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold mb-2">Servidores Ativos</h3>
                <p className="text-sm text-gray-500">Gera a relação geral de todos os servidores com status ativo no sistema.</p>
                <Button variant="outline" className="mt-4 w-full">Visualizar</Button>
              </div>
            </Card>
          </div>

          <div className="cursor-pointer" onClick={() => setActiveModal('acknowledgement')}>
            <Card className="hover:shadow-lg transition-shadow group h-full">
              <div className="flex flex-col items-center p-6 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <ClipboardCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold mb-2">Lista de Ciência</h3>
                <p className="text-sm text-gray-500">Gera folha de assinatura para tomada de ciência de assuntos específicos.</p>
                <Button variant="outline" className="mt-4 w-full">Configurar</Button>
              </div>
            </Card>
          </div>

          <div className="cursor-pointer" onClick={() => setActiveModal('activity')}>
            <Card className="hover:shadow-lg transition-shadow group h-full">
              <div className="flex flex-col items-center p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <div className="flex">
                    <Truck className="w-5 h-5 -mr-1" />
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">Atividades Mensais</h3>
                <p className="text-sm text-gray-500">Relatório detalhado de locomoções e orientações técnicas por servidor.</p>
                <Button variant="outline" className="mt-4 w-full">Selecionar</Button>
              </div>
            </Card>
          </div>

          <div className="cursor-pointer" onClick={() => setActiveModal('concessions')}>
            <Card className="hover:shadow-lg transition-shadow group h-full">
              <div className="flex flex-col items-center p-6 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold mb-2">Próximas Concessões</h3>
                <p className="text-sm text-gray-500">Gera a previsão das próximas concessões a vencer para planejamento.</p>
                <Button variant="outline" className="mt-4 w-full">Visualizar</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {activeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto print:bg-white print:static print:block print:z-0">
          <div className="min-h-screen flex items-center justify-center p-4 print:p-0 print:block print:min-h-0">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden print:shadow-none print:rounded-none print:w-full print:max-w-none">
              {activeModal === 'general' && renderGeneralReport()}
              {activeModal === 'acknowledgement' && renderAcknowledgementList()}
              {activeModal === 'activity' && renderActivityReport()}
              {activeModal === 'concessions' && renderConcessionsReport()}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            margin: 0;
            size: A4 portrait;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white;
            -webkit-print-color-adjust: exact;
          }
          body * {
            visibility: hidden;
          }
          /* Reset elements for print */
          .fixed.inset-0 {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            visibility: visible !important;
            display: block !important;
          }
          .fixed.inset-0 * {
            visibility: visible !important;
          }
          /* Container inside the modal */
          .min-h-screen {
            min-height: 0 !important;
            display: block !important;
            padding: 0 !important;
          }
          /* The content card */
          .max-w-5xl {
            max-width: none !important;
            width: 100% !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          /* Apply page margin at the content level */
          .p-8.print\\:p-0 {
            padding: 0.5cm 1.5cm 1.5cm 1.5cm !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}} />
    </div>
  );
};

export default Reports;
