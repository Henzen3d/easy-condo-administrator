
import QRCode from 'qrcode';
import { format } from 'date-fns';

/**
 * Generate a valid PIX QR Code following the Brazilian Central Bank standards (EMV QR Code)
 * @param pixKey The PIX key (CPF, CNPJ, email, phone or random key)
 * @param value Transaction amount in BRL
 * @param transactionId Unique transaction identifier
 * @param beneficiaryName Name of the beneficiary (limited to 25 characters)
 * @param description Optional description for the payment
 * @returns Promise resolving to the QR code data URL
 */
export const generatePixQRCode = async (
  pixKey: string,
  value: number,
  transactionId: string,
  beneficiaryName: string,
  description?: string
): Promise<string> => {
  try {
    // Sanitize inputs
    const sanitizedBeneficiaryName = sanitizeText(beneficiaryName.substring(0, 25)).toUpperCase();
    const city = 'BRASIL'; // Default city, can be replaced with actual city
    const sanitizedDescription = description ? sanitizeText(description.substring(0, 50)) : '';
    
    // Format amount with 2 decimal places and no thousands separator
    const formattedValue = value.toFixed(2);
    
    // Create basic payload elements
    const payload = [
      '00020126', // Payload Format Indicator and Merchant Account Information template
      `0014BR.GOV.BCB.PIX`, // PIX GUI domain
    ];
    
    // Add PIX key (depends on key type)
    if (isEmail(pixKey)) {
      payload.push(`01${pixKey.length.toString().padStart(2, '0')}${pixKey}`);
    } else if (isPhoneNumber(pixKey)) {
      // Format phone number properly for PIX (+5511999999999)
      const formattedPhone = formatPhoneForPix(pixKey);
      payload.push(`01${formattedPhone.length.toString().padStart(2, '0')}${formattedPhone}`);
    } else if (isCPF(pixKey)) {
      payload.push(`01${pixKey.length.toString().padStart(2, '0')}${pixKey}`);
    } else if (isCNPJ(pixKey)) {
      payload.push(`01${pixKey.length.toString().padStart(2, '0')}${pixKey}`);
    } else {
      // Random key or EVP
      payload.push(`01${pixKey.length.toString().padStart(2, '0')}${pixKey}`);
    }
    
    // Transaction amount
    payload.push(`5204000053039865${formattedValue.length.toString().padStart(2, '0')}${formattedValue}`);
    
    // Country code
    payload.push('5802BR');
    
    // Beneficiary name
    payload.push(`59${sanitizedBeneficiaryName.length.toString().padStart(2, '0')}${sanitizedBeneficiaryName}`);
    
    // City
    payload.push(`60${city.length.toString().padStart(2, '0')}${city}`);
    
    // Additional info - txid for tracking
    const txidField = `05${transactionId.substring(0, 25)}`;
    payload.push(`62${(txidField.length + 4).toString().padStart(2, '0')}${txidField}`);
    
    // Add description if provided (in reference label field)
    if (sanitizedDescription) {
      const referenceLabel = `05${sanitizedDescription}`;
      if (!payload[payload.length - 1].startsWith('62')) {
        // Create additional data field if not exists
        payload.push(`62${(referenceLabel.length + 4).toString().padStart(2, '0')}${referenceLabel}`);
      } else {
        // Add to existing additional data field
        const currentAdditionalData = payload[payload.length - 1];
        const currentLength = parseInt(currentAdditionalData.substring(2, 4));
        const newAdditionalData = currentAdditionalData.substring(0, 2) + 
          (currentLength + referenceLabel.length).toString().padStart(2, '0') + 
          currentAdditionalData.substring(4) + referenceLabel;
        payload[payload.length - 1] = newAdditionalData;
      }
    }
    
    // Add CRC (calculated later)
    payload.push('6304');
    
    // Join all fields into raw payload
    let rawPayload = payload.join('');
    
    // Calculate CRC16 and replace placeholder
    const crc = calculateCRC16(rawPayload);
    rawPayload = rawPayload.substring(0, rawPayload.length - 4) + crc;
    
    console.log('Generated PIX payload:', rawPayload);
    
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(rawPayload, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating PIX QR code:', error);
    return '';
  }
};

// Utility functions for PIX QR code generation

/**
 * Sanitize text for PIX QR code by removing special characters and accents
 */
function sanitizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '');
}

/**
 * Check if the string is a valid email address
 */
function isEmail(text: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(text);
}

/**
 * Check if the string is a valid phone number 
 */
function isPhoneNumber(text: string): boolean {
  // Simplified check for Brazilian phone numbers
  const phoneRegex = /^(\+55)?([0-9]{10,11})$/;
  return phoneRegex.test(text);
}

/**
 * Format phone number for PIX
 */
function formatPhoneForPix(phone: string): string {
  // Remove non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // Add +55 prefix if not present
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }
  
  return '+' + cleaned;
}

/**
 * Check if the string is a valid CPF (Brazilian individual taxpayer registry)
 */
function isCPF(text: string): boolean {
  // Remove non-digits
  const cpf = text.replace(/\D/g, '');
  return cpf.length === 11;
}

/**
 * Check if the string is a valid CNPJ (Brazilian company taxpayer registry)
 */
function isCNPJ(text: string): boolean {
  // Remove non-digits
  const cnpj = text.replace(/\D/g, '');
  return cnpj.length === 14;
}

/**
 * Calculate CRC16 checksum for PIX QR code
 * Implementation follows the CCITT-16/XMODEM algorithm required by PIX
 */
function calculateCRC16(payload: string): string {
  // CRC16 CCITT-16/XMODEM implementation
  const polynomial = 0x1021;
  let crc = 0xFFFF;
  
  // Add CRC16 padding
  const buffer = payload + '0000';
  
  for (let i = 0; i < buffer.length; i++) {
    const character = buffer.charCodeAt(i);
    crc ^= (character << 8);
    
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ polynomial) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  
  // Convert to hexadecimal representation and ensure 4 characters
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
