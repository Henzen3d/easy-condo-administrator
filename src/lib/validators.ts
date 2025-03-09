// Validação de CPF
export function validarCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais (CPF inválido, mas com formato correto)
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  
  let resto = soma % 11;
  let digitoVerificador1 = resto < 2 ? 0 : 11 - resto;
  
  if (digitoVerificador1 !== parseInt(cpf.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  
  resto = soma % 11;
  let digitoVerificador2 = resto < 2 ? 0 : 11 - resto;
  
  return digitoVerificador2 === parseInt(cpf.charAt(10));
}

// Validação de CNPJ
export function validarCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais (CNPJ inválido, mas com formato correto)
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Validação do primeiro dígito verificador
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  // Validação do segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  
  return resultado === parseInt(digitos.charAt(1));
}

// Validação de E-mail
export function validarEmail(email: string): boolean {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

// Validação de Telefone Celular
export function validarTelefone(telefone: string): boolean {
  // Remove caracteres não numéricos e o prefixo +55 se existir
  const telefoneNumerico = telefone.replace(/\D/g, '');
  
  // Verifica se é um celular brasileiro (com 11 dígitos, incluindo DDD)
  if (telefoneNumerico.length !== 11) return false;
  
  // Verifica se o nono dígito é 9 (padrão de celular brasileiro)
  if (telefoneNumerico.charAt(2) !== '9') return false;
  
  // Verifica se o DDD é válido (entre 11 e 99)
  const ddd = parseInt(telefoneNumerico.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  
  return true;
}

// Validação de Chave Aleatória (EVP)
export function validarChaveAleatoria(chave: string): boolean {
  // Chave aleatória do PIX tem 32 caracteres hexadecimais
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(chave);
}

// Função principal para validar chave PIX
export function validarChavePIX(chave: string, tipo: string): { valido: boolean; mensagem?: string } {
  if (!chave || chave.trim() === '') {
    return { valido: false, mensagem: 'Chave PIX não pode estar vazia.' };
  }
  
  switch (tipo) {
    case 'cpf':
      if (!validarCPF(chave)) {
        return { valido: false, mensagem: 'CPF inválido. Formato esperado: 000.000.000-00' };
      }
      break;
      
    case 'cnpj':
      if (!validarCNPJ(chave)) {
        return { valido: false, mensagem: 'CNPJ inválido. Formato esperado: 00.000.000/0000-00' };
      }
      break;
      
    case 'email':
      if (!validarEmail(chave)) {
        return { valido: false, mensagem: 'E-mail inválido. Formato esperado: exemplo@dominio.com' };
      }
      break;
      
    case 'phone':
      if (!validarTelefone(chave)) {
        return { valido: false, mensagem: 'Telefone inválido. Formato esperado: (00) 90000-0000' };
      }
      break;
      
    case 'random':
      if (!validarChaveAleatoria(chave)) {
        return { valido: false, mensagem: 'Chave aleatória inválida. Formato esperado: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' };
      }
      break;
      
    default:
      return { valido: false, mensagem: 'Tipo de chave PIX não reconhecido.' };
  }
  
  return { valido: true };
} 