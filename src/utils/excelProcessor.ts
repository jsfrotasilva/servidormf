
import * as XLSX from 'xlsx';
import { Server } from '../types/server';

// Função auxiliar para converter datas do Excel ou strings para YYYY-MM-DD
const formatDateForInput = (value: any): string => {
  if (value === undefined || value === null || value === '') return '';
  
  // Se for um objeto Date do JS (o SheetJS retorna isso se cellDates for true)
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString().split('T')[0];
  }

  // Se for um número (provável data serial do Excel)
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
  }

  const strValue = String(value).trim();
  if (!strValue) return '';

  // Se já for uma data no formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(strValue)) {
    return strValue;
  }

  // Se for uma data no formato DD/MM/YYYY
  const dmYRegex = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
  const match = strValue.match(dmYRegex);
  if (match) {
    const [_, d, m, y] = match;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Tentativa final com Date.parse
  const parsed = new Date(strValue);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return strValue;
};

export const downloadExcelTemplate = () => {
  const headers = [
    'nome', 'cpf', 'rgcin', 'di', 'rs', 'pvatual', 'datanascimento', 'telefone', 'email', 'endereco',
    'cargo', 'disciplina', 'disciplinanaoespecifica', 'categoria', 
    'datadecontrato', 'datafimsontrato', 'ativo'
  ];
  
  const exampleData = [
    {
      nome: 'João Silva',
      cpf: '123.456.789-00',
      rgcin: '1234567-8',
      di: '1',
      rs: '001',
      pvatual: '01',
      datanascimento: '1980-01-01',
      telefone: '(11) 98888-7777',
      email: 'joao@email.com',
      endereco: 'Rua Exemplo, 123',
      cargo: 'Professor',
      disciplina: 'Matemática',
      disciplinanaoespecifica: '',
      categoria: 'Efetivo',
      datadecontrato: '2010-02-01',
      datafimsontrato: '',
      ativo: 'Sim'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(exampleData, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Servidores");
  
  XLSX.writeFile(workbook, "modelo_importacao_servidores.xlsx");
};

export const processExcelFile = (file: File): Promise<Server[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Usamos raw: true com cellDates: true (definido no XLSX.read) para obter objetos Date reais
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true });

        const mappedData: Server[] = jsonData.map((row: any) => {
          // Normaliza as chaves: remove acentos, espaços e converte para minúsculo
          const normalizedRow: any = {};
          Object.keys(row).forEach(key => {
            const cleanKey = key.toLowerCase()
              .trim()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/\s+/g, '');
            normalizedRow[cleanKey] = row[key];
          });

          return {
            id: crypto.randomUUID(),
            nome: String(normalizedRow.nome || ''),
            cpf: String(normalizedRow.cpf || ''),
            rgcin: String(normalizedRow.rgcin || ''),
            di: String(normalizedRow.di || ''),
            rs: String(normalizedRow.rs || ''),
            pv_atual: String(normalizedRow.pvatual || normalizedRow.pv_atual || ''),
            datanascimento: formatDateForInput(normalizedRow.datanascimento),
            telefone: String(normalizedRow.telefone || ''),
            email: String(normalizedRow.email || ''),
            endereco: String(normalizedRow.endereco || ''),
            cargo: String(normalizedRow.cargo || ''),
            disciplina: String(normalizedRow.disciplina || ''),
            disciplinanaoespecifica: String(normalizedRow.disciplinanaoespecifica || ''),
            categoria: String(normalizedRow.categoria || ''),
            datadecontrato: formatDateForInput(normalizedRow.datadecontrato),
            datafimsontrato: formatDateForInput(normalizedRow.datafimsontrato),
            ativo: (String(normalizedRow.ativo || '').toLowerCase().trim() === 'sim' ? 'Sim' : 'Não') as 'Sim' | 'Não',
          };
        });

        resolve(mappedData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
