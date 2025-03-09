// Máscara para CPF: 000.000.000-00
export function maskCPF(value: string): string {
  // Remove caracteres não numéricos
  value = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  value = value.slice(0, 11);
  
  // Aplica a máscara
  return value
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// Máscara para CNPJ: 00.000.000/0000-00
export function maskCNPJ(value: string): string {
  // Remove caracteres não numéricos
  value = value.replace(/\D/g, '');
  
  // Limita a 14 dígitos
  value = value.slice(0, 14);
  
  // Aplica a máscara
  return value
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

// Máscara para telefone: (00) 90000-0000
export function maskPhone(value: string): string {
  // Remove caracteres não numéricos
  value = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos (com DDD)
  value = value.slice(0, 11);
  
  // Aplica a máscara
  return value
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{4})$/, '$1-$2');
}

// Função para aplicar máscara de acordo com o tipo de chave PIX
export function applyPixKeyMask(value: string, type: string): string {
  switch (type) {
    case 'cpf':
      return maskCPF(value);
    case 'cnpj':
      return maskCNPJ(value);
    case 'phone':
      return maskPhone(value);
    default:
      return value; // Para email e chave aleatória, não aplicamos máscara
  }
} 