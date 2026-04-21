
import React from 'react';
import { Cake, Calendar, Gift, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Input, Badge } from '../components/UI';
import { Server } from '../types/server';

interface BirthdaysProps {
  servers: Server[];
}

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

export const Birthdays = ({ servers }: BirthdaysProps) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;

  const activeServers = servers.filter(s => s.ativo === 'Sim');

  const parseBirthdate = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return {
      day: date.getDate() + 1, // Fix for timezones
      month: date.getMonth() + 1,
      year: date.getFullYear()
    };
  };

  const getBirthdays = (month: number, day?: number) => {
    return activeServers.filter(s => {
      const birth = parseBirthdate(s.datanascimento);
      if (!birth) return false;
      
      const matchesMonth = birth.month === month;
      const matchesDay = day ? birth.day === day : true;
      const matchesSearch = s.nome.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesMonth && matchesDay && matchesSearch;
    });
  };

  const birthdaysToday = getBirthdays(currentMonth, currentDay);
  const birthdaysThisMonth = getBirthdays(currentMonth).filter(s => {
    const birth = parseBirthdate(s.datanascimento);
    return birth?.day !== currentDay;
  });

  const BirthdayCard = ({ server, isToday }: { server: Server, isToday?: boolean }) => {
    const birth = parseBirthdate(server.datanascimento);
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
        className="w-full"
      >
        <Card className={`overflow-hidden border-none shadow-sm ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
          <div className={`p-4 ${isToday ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : 'bg-white'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isToday ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {isToday ? <Cake className="h-6 w-6 animate-bounce" /> : <Gift className="h-6 w-6" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 line-clamp-1">{server.nome}</h4>
                  <p className="text-xs text-slate-500">{server.cargo}</p>
                </div>
              </div>
              <Badge variant={isToday ? 'info' : 'outline'}>
                {birth?.day}/{birth?.month}
              </Badge>
            </div>
            
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Contato
              </div>
              {server.telefone && (
                <a 
                  href={`https://wa.me/${server.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Hoje é um dia especial — o seu dia! 🎉\n\nQueremos desejar um aniversário cheio de coisas boas: saúde, tranquilidade, conquistas e muitos momentos de alegria, dentro e fora do trabalho. Que você siga sendo essa pessoa dedicada, responsável e tão importante para o nosso dia a dia.\n\nSeu trabalho faz diferença, e sua presença também. Que este novo ciclo venha com reconhecimento, leveza e muitas realizações.\n\nFeliz aniversário! 🎂✨\nEquipe: EE PROFA. MARLENE FRATTINI.`
                  )}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                >
                  <WhatsAppIcon />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 text-left">Aniversariantes</h1>
          <p className="text-sm text-slate-500">Comemore as datas especiais com nossa equipe.</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Buscar por nome..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Hoje */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-blue-600">
          <Cake className="h-5 w-5" />
          <h2 className="text-lg font-bold">Hoje - {currentDay}/{currentMonth}</h2>
        </div>
        
        {birthdaysToday.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {birthdaysToday.map(server => (
                <BirthdayCard key={server.id} server={server} isToday />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <Card className="p-8 text-center text-slate-400 bg-slate-50 border-dashed border-2">
            Nenhum aniversariante hoje.
          </Card>
        )}
      </section>

      {/* Este Mês */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="h-5 w-5" />
          <h2 className="text-lg font-bold">Deste Mês</h2>
        </div>
        
        {birthdaysThisMonth.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {birthdaysThisMonth
                .sort((a, b) => {
                  const bA = parseBirthdate(a.datanascimento);
                  const bB = parseBirthdate(b.datanascimento);
                  return (bA?.day || 0) - (bB?.day || 0);
                })
                .map(server => (
                  <BirthdayCard key={server.id} server={server} />
                ))
              }
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-sm text-slate-400 italic">
            Nenhum outro aniversariante este mês.
          </div>
        )}
      </section>
    </div>
  );
};
