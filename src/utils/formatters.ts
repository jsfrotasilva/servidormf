
export const formatDisplayDate = (dateString: string | undefined): string => {
  if (!dateString || dateString.trim() === '') return '-';
  
  // Se for YYYY-MM-DD (formato interno)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [y, m, d] = dateString.split('-');
    return `${d}/${m}/${y}`;
  }

  // Se já estiver no formato DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }
  
  // Tentar converter de outros formatos comuns
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }
  
  return dateString;
};

export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return cpf;
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

export const getAvatarUrl = (name: string): string => {
  if (!name) return `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`;
  const firstName = name.split(' ')[0].toLowerCase().trim();
  
  // Nomes femininos comuns que terminam em 'e' ou outras letras
  const femaleList = [
    'maria', 'ana', 'alice', 'beatriz', 'vitoria', 'julia', 'carol', 'camila', 'rafaela', 
    'marlene', 'michele', 'elisabete', 'rose', 'denise', 'luciane', 'vivi', 'noemi', 'rute',
    'estela', 'isabel', 'raquel', 'iris', 'solange', 'irene', 'cleide', 'ivone', 'elaine'
  ];

  // Nomes masculinos comuns que terminam em 'a' ou 'e'
  const maleList = [
    'jose', 'alexandre', 'henrique', 'filipe', 'george', 'jorge', 'vicente', 'guilherme',
    'dante', 'andre', 'saulo', 'luca', 'noah'
  ];

  // Heurística aprimorada para português
  let isFemale = false;
  
  if (femaleList.includes(firstName)) {
    isFemale = true;
  } else if (maleList.includes(firstName)) {
    isFemale = false;
  } else if (firstName.endsWith('a') || firstName.endsWith('ia')) {
    isFemale = true;
  } else if (firstName.endsWith('o') || firstName.endsWith('io') || firstName.endsWith('os') || firstName.endsWith('u')) {
    isFemale = false;
  } else if (firstName.endsWith('e')) {
    // Maioria dos nomes em 'e' no ambiente escolar/admin costumam ser femininos (ex: Rose, Cleide, Ivone)
    // Mas temos Alexandre, Guilherme, Henrique...
    // Se não está na lista masculina, assumimos feminino pela frequência
    isFemale = true; 
  }

  // Seed para o avatar (DiceBear)
  const seed = isFemale ? 'Aria' : 'Felix';
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};
