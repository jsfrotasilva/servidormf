

import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Briefcase,
  TrendingUp,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, cn } from '../components/UI';
import { Server, DashboardStats } from '../types/server';

interface DashboardProps {
  servers: Server[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Dashboard = ({ servers }: DashboardProps) => {
  const stats: DashboardStats = {
    totalServers: servers.length,
    activeServers: servers.filter(s => s.ativo === 'Sim').length,
    inactiveServers: servers.filter(s => s.ativo === 'Não').length,
    byCategory: Object.entries(
      servers
        .filter(s => s.ativo === 'Sim')
        .reduce((acc: any, s) => {
          acc[s.categoria] = (acc[s.categoria] || 0) + 1;
          return acc;
        }, {})
    ).map(([name, value]) => ({ name: name || 'Não Definido', value: value as number })),
    byPosition: Object.entries(
      servers.reduce((acc: any, s) => {
        acc[s.cargo] = (acc[s.cargo] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name: name || 'Não Definido', value: value as number })).slice(0, 5),
  };

  const StatCard = ({ icon: Icon, label, value, color, trend }: any) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className={cn('rounded-xl p-3', color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            <span>+{trend}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 text-left">Dashboard</h1>
        <div className="text-sm text-slate-500">Última atualização: {new Date().toLocaleDateString()}</div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={Users} 
          label="Total de Servidores" 
          value={stats.totalServers} 
          color="bg-blue-600"
          trend="12"
        />
        <StatCard 
          icon={UserCheck} 
          label="Servidores Ativos" 
          value={stats.activeServers} 
          color="bg-emerald-600"
        />
        <StatCard 
          icon={UserMinus} 
          label="Inativos" 
          value={stats.inactiveServers} 
          color="bg-rose-600"
        />
        <StatCard 
          icon={Briefcase} 
          label="Cargos Únicos" 
          value={stats.byPosition.length} 
          color="bg-amber-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Distribuição por Categoria</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.byCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.byCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {stats.byCategory.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs text-slate-600 truncate">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Top 5 Cargos</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byPosition} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={150}
                  style={{ fontSize: '12px', fill: '#64748b' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

