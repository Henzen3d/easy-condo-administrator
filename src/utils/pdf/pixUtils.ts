import QRCode from 'qrcode';
import { payload } from 'pix-payload';
import { format, addDays } from 'date-fns';

/**
 * Identifica o tipo de chave PIX baseado no formato
 * @param pixKey Chave PIX (CPF, CNPJ, email, telefone ou chave aleatória)
 * @returns Tipo de chave identificado
 */
function identifyPixKeyType(pixKey: string): string {
  // Remove caracteres especiais para facilitar a validação
  const cleanKey = pixKey.replace(/[^a-zA-Z0-9@.]/g, '');
  
  // Verifica o tipo de chave
  if (cleanKey.includes('@')) {
    return 'email';
  } else if (/^\d{11}$/.test(cleanKey)) {
    return 'cpf';
  } else if (/^\d{14}$/.test(cleanKey)) {
    return 'cnpj';
  } else if (/^\d{10,11}$/.test(cleanKey)) {
    return 'phone';
  } else if (/^[a-zA-Z0-9]{32,36}$/.test(cleanKey)) {
    return 'random';
  }
  
  // Se não for possível identificar, assume chave aleatória
  return 'random';
}

/**
 * Formata a chave PIX para exibição
 * @param pixKey Chave PIX a ser formatada
 * @returns Chave PIX formatada
 */
function formatPixKey(pixKey: string): string {
  // Para e-mails, manter formato original com pontos
  if (pixKey.includes('@')) {
    return pixKey;
  }
  
  const cleanKey = pixKey.replace(/[^a-zA-Z0-9@]/g, '');
  const keyType = identifyPixKeyType(cleanKey);
  
  switch (keyType) {
    case 'cpf':
      return cleanKey.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    case 'cnpj':
      return cleanKey.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    case 'phone':
      if (cleanKey.length === 11) {
        return cleanKey.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else {
        return cleanKey.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
    default:
      return cleanKey;
  }
}

/**
 * Formata uma chave PIX para o formato esperado pelo Banco Central
 * @param pixKey Chave PIX
 * @param pixKeyType Tipo de chave (cpf, cnpj, email, phone, random)
 * @returns Chave PIX formatada para o BR Code
 */
function formatPixKeyForBRCode(pixKey: string, pixKeyType: string): string {
  // Primeiro limpa a chave de qualquer formatação
  let cleanKey = pixKey.replace(/\D/g, '');
  
  // Para cada tipo de chave, aplica a formatação específica exigida pelo BC
  switch (pixKeyType.toLowerCase()) {
    case 'cpf':
      // Remove tudo exceto números para CPF
      break;
    case 'cnpj':
      // Remove tudo exceto números para CNPJ
      break;
    case 'email':
      // Para email, mantém o formato original mas converte para minúsculas
      cleanKey = pixKey.toLowerCase();
      break;
    case 'phone':
      // Para telefone, remove qualquer formatação e adiciona +55 se necessário
      cleanKey = pixKey.replace(/\D/g, '');
      // Adiciona +55 apenas se não começar com + (significa que já tem código de país)
      if (!pixKey.startsWith('+')) {
        cleanKey = `+55${cleanKey}`;
      }
      break;
    case 'random':
      // Para chave aleatória, remove caracteres especiais
      cleanKey = pixKey.replace(/[^a-zA-Z0-9]/g, '');
      break;
    default:
      // Para qualquer outro tipo, simplesmente limpa caracteres especiais
      cleanKey = pixKey.replace(/[^a-zA-Z0-9]/g, '');
  }
  
  return cleanKey;
}

/**
 * Generate a valid PIX QR Code using pix-payload library
 * @param pixKey The PIX key (CPF, CNPJ, email, phone or random key)
 * @param value Transaction amount in BRL
 * @param transactionId Unique transaction identifier
 * @param beneficiaryName Name of the beneficiary
 * @param city City of the beneficiary (default: SAO PAULO)
 * @param description Optional description for the payment
 * @param expirationDate Optional expiration date in ISO format (YYYY-MM-DD)
 * @returns Promise resolving to the QR code data URL
 */
export const generatePixQRCode = async (
  pixKey: string,
  value: number,
  transactionId: string,
  beneficiaryName: string,
  city: string = 'SAO PAULO',
  description?: string,
  expirationDate?: string
): Promise<string> => {
  try {
    console.log('Gerando QR code PIX com os seguintes dados:');
    console.log('Chave PIX:', pixKey);
    console.log('Valor:', value);
    console.log('ID da transação:', transactionId);
    console.log('Nome do beneficiário:', beneficiaryName);
    console.log('Cidade:', city);
    console.log('Descrição:', description);
    console.log('Data de expiração:', expirationDate || 'Não definida');
    
    // Determinar o tipo de chave PIX
    const pixKeyType = identifyPixKeyType(pixKey);
    console.log('Tipo de chave identificado:', pixKeyType);
    
    // Limpar a chave PIX de qualquer formatação
    const formattedKey = formatPixKeyForBRCode(pixKey, pixKeyType);
    console.log('Chave PIX formatada para BR Code:', formattedKey);
    
    // Normalizar nome e cidade conforme regras do Banco Central
    // 1. Remover acentos
    // 2. Converter para maiúsculas
    // 3. Remover caracteres especiais
    // 4. Limite de 25 caracteres para o nome
    const normalizedName = beneficiaryName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')  // Remove acentos
      .replace(/[^\w\s]/gi, '')         // Remove caracteres especiais
      .toUpperCase()                    // Converte para maiúsculas
      .substring(0, 25);                // Limita a 25 caracteres
    
    // Normalizar a cidade (limite de 15 caracteres)
    const normalizedCity = city
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')  // Remove acentos
      .replace(/[^\w\s]/gi, '')         // Remove caracteres especiais
      .toUpperCase()                    // Converte para maiúsculas
      .substring(0, 15);                // Limita a 15 caracteres
    
    // Simplificar ID da transação (máximo 7 caracteres para o campo 05 no BR Code)
    const shortTxId = String(transactionId)
      .replace(/\D/g, '')               // Remove não-numéricos
      .substring(0, 7);                 // Limita a 7 caracteres
    
    // Formatar valor em centavos (sem ponto decimal)
    // Multiplicar por 100 e arredondar para garantir precisão
    const valueInCents = Math.round(value * 100);
    const formattedValue = valueInCents.toString();
    
    // Usar a biblioteca pix-payload para gerar o BR Code
    const pixData = {
      key: formattedKey,
      name: normalizedName,
      city: normalizedCity,
      amount: value,
      transactionId: shortTxId,
    };
    
    try {
      // Gerar o BR Code usando a biblioteca
      const brCode = payload(pixData);
      console.log('BR Code gerado pela biblioteca pix-payload:', brCode);
      
      // Gerar QR code a partir do BR Code
      const qrCodeDataURL = await QRCode.toDataURL(brCode, {
        errorCorrectionLevel: 'M', // Nível de correção de erro médio para melhor equilíbrio
        margin: 1,                 // Margem mínima para melhor aproveitamento do espaço
        scale: 5,                  // Escala adequada para leitura
        width: 300,                // Largura fixa para garantir consistência
        color: {
          dark: '#000000',         // Cor preta para os módulos
          light: '#FFFFFF'         // Fundo branco
        }
      });
      
      return qrCodeDataURL;
    } catch (pixError) {
      console.error('Erro ao usar biblioteca pix-payload:', pixError);
      throw pixError; // Lançar o erro para usar o método alternativo
    }
  } catch (error) {
    console.error('Erro ao gerar QR code PIX:', error);
    
    // Fallback para implementação manual se a biblioteca falhar
    try {
      console.log('Tentando método alternativo para gerar QR code PIX...');
      return generatePixQRCodeManual(
        pixKey, 
        value, 
        transactionId, 
        beneficiaryName, 
        city, 
        description, 
        expirationDate
      );
    } catch (fallbackError) {
      console.error('Erro também no método alternativo:', fallbackError);
      throw error; // Lançar o erro original
    }
  }
};

/**
 * Método alternativo para gerar QR Code PIX manualmente
 * Usado como fallback se a biblioteca pix-payload falhar
 */
async function generatePixQRCodeManual(
  pixKey: string,
  value: number,
  transactionId: string,
  beneficiaryName: string,
  city: string = 'SAO PAULO',
  description?: string,
  expirationDate?: string
): Promise<string> {
  // Determinar o tipo de chave PIX
  const pixKeyType = identifyPixKeyType(pixKey);
  
  // Limpar a chave PIX de qualquer formatação
  const formattedKey = formatPixKeyForBRCode(pixKey, pixKeyType);
  
  // Normalizar nome e cidade conforme regras do Banco Central
  // 1. Remover acentos
  // 2. Converter para maiúsculas
  // 3. Remover caracteres especiais
  // 4. Limite de 25 caracteres para o nome
  const normalizedName = beneficiaryName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove acentos
    .replace(/[^\w\s]/gi, '')         // Remove caracteres especiais
    .toUpperCase()                    // Converte para maiúsculas
    .substring(0, 25);                // Limita a 25 caracteres
  
  // Normalizar a cidade (limite de 15 caracteres)
  const normalizedCity = city
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove acentos
    .replace(/[^\w\s]/gi, '')         // Remove caracteres especiais
    .toUpperCase()                    // Converte para maiúsculas
    .substring(0, 15);                // Limita a 15 caracteres
  
  // Determinar a data de expiração (máximo 30 dias a partir de hoje)
  let expirationSeconds = '';
  if (expirationDate) {
    const expDate = new Date(expirationDate);
    const today = new Date();
    const maxAllowedDate = addDays(today, 30);
    
    // Se a data especificada for maior que 30 dias a partir de hoje, usa o limite de 30 dias
    if (expDate > maxAllowedDate) {
      expDate.setTime(maxAllowedDate.getTime());
    }
    
    // Calcular segundos desde 01/01/2000 para o formato esperado pelo campo 80
    const baseDate = new Date('2000-01-01T00:00:00Z');
    const diffTime = Math.abs(expDate.getTime() - baseDate.getTime());
    expirationSeconds = Math.floor(diffTime / 1000).toString();
  } else {
    // Quando não especificada, define para 30 dias a partir de hoje
    const defaultExpiration = addDays(new Date(), 30);
    const baseDate = new Date('2000-01-01T00:00:00Z');
    const diffTime = Math.abs(defaultExpiration.getTime() - baseDate.getTime());
    expirationSeconds = Math.floor(diffTime / 1000).toString();
  }
  
  // Formatar valor em centavos (sem ponto decimal)
  // Multiplicar por 100 e arredondar para garantir precisão 
  const valueInCents = Math.round(value * 100);
  const valueFormatted = valueInCents.toString();
  
  // Simplificar ID da transação (máximo 7 caracteres para o campo 05 no BR Code)
  const shortTxId = String(transactionId)
    .replace(/\D/g, '')               // Remove não-numéricos
    .substring(0, 7);                 // Limita a 7 caracteres
  
  // Construir o BR Code conforme especificação do BC
  // Começando com os campos obrigatórios e na ordem correta
  
  // 1. Payload Format Indicator (ID: 00) - Valor fixo "01"
  let brCode = '00020101';  // ID(00) + Tamanho(02) + Valor(01) + Point of Initiation Method(01) Static QR
  
  // 2. Merchant Account Information para PIX (ID: 26)
  // - Incluindo GUI do PIX (ID: 00) com valor "br.gov.bcb.pix"
  let merchantAccountInfo = '0014br.gov.bcb.pix';
  
  // - Incluindo a chave PIX no campo 01
  merchantAccountInfo += `01${formattedKey.length.toString().padStart(2, '0')}${formattedKey}`;
  
  // - Incluindo descrição no campo 02 (se fornecida)
  if (description && description.trim().length > 0) {
    const truncatedDesc = description.substring(0, 50);
    merchantAccountInfo += `02${truncatedDesc.length.toString().padStart(2, '0')}${truncatedDesc}`;
  }
  
  // Adicionar a seção Merchant Account Information com seu tamanho
  brCode += `26${merchantAccountInfo.length.toString().padStart(2, '0')}${merchantAccountInfo}`;
  
  // 3. Merchant Category Code (ID: 52) - Valor fixo "0000" para PIX
  brCode += '52040000';
  
  // 4. Transaction Currency (ID: 53) - Valor fixo "986" para BRL
  brCode += '5303986';
  
  // 5. Transaction Amount (ID: 54) - Valor da transação em centavos (sem ponto decimal)
  brCode += `54${valueFormatted.length.toString().padStart(2, '0')}${valueFormatted}`;
  
  // 6. Country Code (ID: 58) - Valor fixo "BR" para Brasil
  brCode += '5802BR';
  
  // 7. Merchant Name (ID: 59) - Nome do beneficiário normalizado
  brCode += `59${normalizedName.length.toString().padStart(2, '0')}${normalizedName}`;
  
  // 8. Merchant City (ID: 60) - Cidade do beneficiário normalizada
  brCode += `60${normalizedCity.length.toString().padStart(2, '0')}${normalizedCity}`;
  
  // 9. Additional Data Field (ID: 62) - Para o Reference Label (TxID)
  let additionalDataField = `05${shortTxId.length.toString().padStart(2, '0')}${shortTxId}`;
  
  // Adicionar o campo Additional Data Field com seu tamanho
  brCode += `62${additionalDataField.length.toString().padStart(2, '0')}${additionalDataField}`;
  
  // 10. Campo de expiração (ID: 80), se fornecido
  if (expirationSeconds) {
    brCode += `80${expirationSeconds.length.toString().padStart(2, '0')}${expirationSeconds}`;
  }
  
  // 11. CRC16 (ID: 63) - Será calculado e adicionado a seguir
  brCode += '6304';
  
  // Calcular CRC16 sobre todo o payload (incluindo o '6304')
  const crcValue = calculateCRC16(brCode);
  
  // Substituir os últimos 4 caracteres (placeholder) pelo valor real do CRC16
  brCode = brCode.substring(0, brCode.length - 4) + crcValue;
  
  console.log('BR Code gerado manualmente (método alternativo):', brCode);
  
  // Gerar QR code a partir do BR Code
  return await QRCode.toDataURL(brCode, {
    errorCorrectionLevel: 'M',
    margin: 1,
    scale: 5,
    width: 300,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
}

/**
 * Calculate CRC16-CCITT for PIX BR Code
 * Implementation based on Banco Central do Brasil's specifications
 * @param str String to calculate CRC16 for
 * @returns Hexadecimal CRC16 value as a string
 */
function calculateCRC16(str: string): string {
  // CRC16-CCITT with polynomial 0x1021 and initial value 0xFFFF
  let crc = 0xFFFF;
  
  // Process each character
  for (let i = 0; i < str.length; i++) {
    crc ^= (str.charCodeAt(i) << 8);
    
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  
  // Convert to uppercase hexadecimal with 4 digits
  const hexCRC = crc.toString(16).toUpperCase().padStart(4, '0');
  return hexCRC;
}

// Exportar funções auxiliares para uso em outros lugares
export { identifyPixKeyType, formatPixKey, calculateCRC16, formatPixKeyForBRCode };
