
export type ServerStatus = 'Sim' | 'Não';

export interface ATS {
  id: string;
  motivo: string;
  vigencia: string;
  dataPublicacaoDOE: string;
  ultimoAts?: boolean;
}

export interface SextaParte {
  vigencia: string;
  dataPublicacaoDOE: string;
}

export type LicencaTipoUso = 'Gozo' | 'Pecúnia';

export interface LicencaPremioUsage {
  id: string;
  certidaoId: string;
  tipo: LicencaTipoUso;
  quantidadeDias: number;
  dataIncio?: string;
  dataFim?: string;
  dataAutorizacaoDOE?: string;
  anoPecunia?: string;
}

export interface LicencaPremio {
  id: string;
  numeroCertidao: string; // Formato 000/0000
  periodoAquisitivo: string;
  saldoInicial: number; // Em dias, padrão 90
  dataDOE: string;
  ultimaCertidao?: boolean;
  inicioVigenciaProxima?: string;
}

export interface EvolucaoFuncional {
  id: string;
  motivo: string;
  nivelDe: string;
  nivelPara: string;
  vigencia: string;
  dataPublicacaoDOE: string;
  isUltima?: boolean;
  intersticio?: string;
  pontuacaoMinima?: number;
  pesoAtualizacao?: number;
  pesoAperfeicoamento?: number;
  pesoProducao?: number;
}

export interface Locomocao {
  id: string;
  data: string;
  motivo: string;
  saida: string;
  retorno: string;
}

export interface OrientacaoTecnica {
  id: string;
  data: string;
  assunto: string;
  local: string;
  inicio: string;
  fim: string;
  doeConvocacao: string;
  pagoDiaria: boolean;
}

export interface SchoolInfo {
  nome: string;
  cie: string;
  ua: string;
  endereco: string;
  bairro: string;
  cep: string;
  municipio: string;
  uf: string;
  telefone: string;
  email: string;
  diretor: string;
  diretorRG: string;
  logo?: string;
}

export interface Server {
  id: string;
  nome: string;
  cpf: string;
  rgcin: string;
  datanascimento: string;
  telefone: string;
  email: string;
  endereco: string;
  cargo: string;
  disciplina: string;
  disciplinanaoespecifica: string;
  categoria: string;
  datadecontrato: string;
  datafimsontrato: string;
  ativo: ServerStatus;
  ats?: ATS[];
  sextaParte?: SextaParte;
  licencasPremio?: LicencaPremio[];
  licencasPremioUsage?: LicencaPremioUsage[];
  evolucoesFuncionais?: EvolucaoFuncional[];
  locomocoes?: Locomocao[];
  orientacoesTecnicas?: OrientacaoTecnica[];
}

export interface DashboardStats {
  totalServers: number;
  activeServers: number;
  inactiveServers: number;
  byCategory: { name: string; value: number }[];
  byPosition: { name: string; value: number }[];
}
