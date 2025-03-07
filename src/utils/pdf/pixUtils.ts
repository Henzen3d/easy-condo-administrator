
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
    
    // Build EMV QR Code payload
    // Starting with payload format indicator and merchant account info
    const payload = [];
    
    // Payload format indicator (ID: 00, version 01)
    payload.push('000201');
    
    // Merchant Account Information - GUI of the PIX domain in Brazil (ID: 26)
    payload.push('26');
    
    // Merchant account information template for PIX - Using Bacen specifications
    const merchantAccountInfo = [];
    
    // ID 00 = GUI; Value = br.gov.bcb.pix
    merchantAccountInfo.push('0014br.gov.bcb.pix');
    
    // ID 01 = PIX Key; Value = the key
    // Convert PIX key to a format that works best with the key type
    const formattedPixKey = formatPixKey(pixKey);
    merchantAccountInfo.push(`01${formattedPixKey.length.toString().padStart(2, '0')}${formattedPixKey}`);
    
    // Add transaction ID (not used for static QR, but required for dynamic)
    if (transactionId) {
      merchantAccountInfo.push(`05${transactionId.length.toString().padStart(2, '0')}${transactionId}`);
    }
    
    // Add the description if provided
    if (sanitizedDescription) {
      merchantAccountInfo.push(`02${sanitizedDescription.length.toString().padStart(2, '0')}${sanitizedDescription}`);
    }
    
    // Calculate length of merchant account information and add to payload
    const merchantAccountInfoStr = merchantAccountInfo.join('');
    payload.push(`${merchantAccountInfoStr.length.toString().padStart(2, '0')}${merchantAccountInfoStr}`);
    
    // Merchant Category Code (ID: 52, fixed at 0000 for PIX)
    payload.push('52040000');
    
    // Transaction Currency (ID: 53, 986 = BRL)
    payload.push('5303986');
    
    // Transaction amount (ID: 54)
    payload.push(`54${formattedValue.length.toString().padStart(2, '0')}${formattedValue}`);
    
    // Country code (ID: 58, BR)
    payload.push('5802BR');
    
    // Merchant Name (ID: 59)
    payload.push(`59${sanitizedBeneficiaryName.length.toString().padStart(2, '0')}${sanitizedBeneficiaryName}`);
    
    // Merchant City (ID: 60)
    payload.push(`60${city.length.toString().padStart(2, '0')}${city}`);
    
    // Additional Data Field Template (ID: 62)
    // For PIX transactions, we may include a reference label here
    if (sanitizedDescription) {
      const additionalDataField = `05${sanitizedDescription.length.toString().padStart(2, '0')}${sanitizedDescription}`;
      payload.push(`62${additionalDataField.length.toString().padStart(2, '0')}${additionalDataField}`);
    }
    
    // CRC16 (ID: 63, placeholder for now)
    payload.push('6304');
    
    // Combine all fields
    let pixQrCode = payload.join('');
    
    // Calculate CRC16 and replace placeholder
    const crc = calculateCRC16(pixQrCode);
    pixQrCode = pixQrCode.substring(0, pixQrCode.length - 4) + crc;
    
    console.log('Generated PIX payload:', pixQrCode);
    
    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(pixQrCode, {
      errorCorrectionLevel: 'L', // Use 'L' for better readability with banking apps
      margin: 1,
      scale: 4,
      width: 300,
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

/**
 * Format PIX key based on its type (email, phone, CPF, CNPJ, random)
 */
function formatPixKey(pixKey: string): string {
  // Format based on the key type
  if (isEmail(pixKey)) {
    return pixKey; // Email doesn't need special formatting
  } else if (isPhoneNumber(pixKey)) {
    return formatPhoneForPix(pixKey);
  } else if (isCPF(pixKey)) {
    return pixKey.replace(/\D/g, ''); // Remove non-digits
  } else if (isCNPJ(pixKey)) {
    return pixKey.replace(/\D/g, ''); // Remove non-digits
  } else {
    // Random key (EVP) or unknown type
    return pixKey;
  }
}

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
  // Match +55DDxxxxxxxxx format or just the numbers
  const phoneRegex = /^(\+55)?([0-9]{10,11})$/;
  return phoneRegex.test(text);
}

/**
 * Format phone number for PIX
 * Brazilian phone numbers in PIX should be formatted as +5511999999999
 */
function formatPhoneForPix(phone: string): string {
  // Remove non-digits and ensure it has the +55 prefix
  let cleaned = phone.replace(/\D/g, '');
  
  // If it doesn't start with 55 (country code), add it
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
 * Calculate CRC16 checksum for PIX QR code using CCITT-16/XMODEM algorithm
 * Implementation follows the standard required by Bacen for PIX
 */
function calculateCRC16(payload: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;
  
  // Process each character in the payload
  for (let i = 0; i < payload.length; i++) {
    const c = payload.charCodeAt(i);
    crc ^= (c << 8);
    
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ polynomial) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  
  // Convert to uppercase hexadecimal and ensure 4 characters
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
