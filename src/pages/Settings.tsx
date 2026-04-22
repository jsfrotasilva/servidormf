
import React, { useState } from 'react';
import { 
  Building2, 
  Upload, 
  Save, 
  X, 
  Image as ImageIcon,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { Button, Input, Card } from '../components/UI';
import { SchoolInfo } from '../types/server';

interface SettingsProps {
  schoolInfo: SchoolInfo;
  onUpdateSchool: (info: SchoolInfo) => void;
}

export const Settings = ({ schoolInfo, onUpdateSchool }: SettingsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [formData, setFormData] = useState<SchoolInfo>(schoolInfo);

  const handleSave = () => {
    onUpdateSchool(formData);
    setIsModalOpen(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateSchool({
          ...schoolInfo,
          logo: reader.result as string
        });
        setIsLogoModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configurações do Sistema</h1>
          <p className="text-slate-500">Gerencie as informações da escola e identidade visual.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Escola Card */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Dados da Unidade</h3>
                <p className="text-sm text-slate-500">Informações institucionais da escola</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              setFormData(schoolInfo);
              setIsModalOpen(true);
            }}>
              Editar Dados
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase">Nome da Escola</label>
                <p className="text-sm font-semibold text-slate-700">{schoolInfo.nome || 'Não informado'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase">CIE / UA</label>
                <p className="text-sm font-semibold text-slate-700">{schoolInfo.cie} / {schoolInfo.ua}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 uppercase">Diretor(a)</label>
              <p className="text-sm font-semibold text-slate-700">{schoolInfo.diretor || 'Não informado'}</p>
              <p className="text-xs text-slate-500">RG: {schoolInfo.diretorRG || 'N/A'}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Phone className="h-3 w-3" />
                  <span className="text-xs">Telefone</span>
                </div>
                <p className="text-sm text-slate-700">{schoolInfo.telefone || 'N/A'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Mail className="h-3 w-3" />
                  <span className="text-xs">E-mail</span>
                </div>
                <p className="text-sm text-slate-700 truncate">{schoolInfo.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Logo Card */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <ImageIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Identidade Visual</h3>
                <p className="text-sm text-slate-500">Logotipo oficial da escola</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsLogoModalOpen(true)}>
              Alterar Logo
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
            {schoolInfo.logo ? (
              <img src={schoolInfo.logo} alt="School Logo" className="max-h-full object-contain p-4" />
            ) : (
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Nenhuma imagem carregada</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* School Data Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Cadastro da Unidade Escolar</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-700 mb-1 block">Nome da Escola</label>
                <Input 
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Ex: Escola Estadual..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Código CIE</label>
                <Input 
                  value={formData.cie}
                  onChange={(e) => setFormData({...formData, cie: e.target.value})}
                  placeholder="CIE"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Código UA</label>
                <Input 
                  value={formData.ua}
                  onChange={(e) => setFormData({...formData, ua: e.target.value})}
                  placeholder="UA"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Código INEP</label>
                <Input 
                  value={formData.inep}
                  onChange={(e) => setFormData({...formData, inep: e.target.value})}
                  placeholder="INEP"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-700 mb-1 block">Endereço Completo</label>
                <Input 
                  value={formData.endereco}
                  onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                  placeholder="Rua, número..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Bairro</label>
                <Input 
                  value={formData.bairro}
                  onChange={(e) => setFormData({...formData, bairro: e.target.value})}
                  placeholder="Bairro"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">CEP</label>
                <Input 
                  value={formData.cep}
                  onChange={(e) => setFormData({...formData, cep: e.target.value})}
                  placeholder="00000-000"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Município</label>
                <Input 
                  value={formData.municipio}
                  onChange={(e) => setFormData({...formData, municipio: e.target.value})}
                  placeholder="Cidade"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">UF</label>
                <Input 
                  value={formData.uf}
                  onChange={(e) => setFormData({...formData, uf: e.target.value})}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Telefone</label>
                <Input 
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  placeholder="(00) 0000-0000"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">E-mail</label>
                <Input 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="escola@email.com"
                />
              </div>
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" /> Gestão Escolar
                </h4>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Diretor(a) de Escola</label>
                <Input 
                  value={formData.diretor}
                  onChange={(e) => setFormData({...formData, diretor: e.target.value})}
                  placeholder="Nome do Diretor"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">RG do Diretor</label>
                <Input 
                  value={formData.diretorRG}
                  onChange={(e) => setFormData({...formData, diretorRG: e.target.value})}
                  placeholder="RG"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" /> Salvar Configurações
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Logo Upload Modal */}
      {isLogoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Atualizar Logotipo</h2>
              <button onClick={() => setIsLogoModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50">
                <Upload className="h-10 w-10 text-slate-400 mb-4" />
                <p className="text-sm font-medium text-slate-900">Clique para fazer upload</p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG ou SVG (Máx. 2MB)</p>
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsLogoModalOpen(false)}>Voltar</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
