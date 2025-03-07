import QRCode from 'qrcode';
import { payload as pixPayload } from 'pix-payload';
import { format } from 'date-fns';

/**
 * Generate a valid PIX QR Code using the pix-payload library
 * @param pixKey The PIX key (CPF, CNPJ, email, phone or random key)
 * @param value Transaction amount in BRL
 * @param transactionId Unique transaction identifier
 * @param beneficiaryName Name of the beneficiary
 * @param city City of the beneficiary (default: BRASIL)
 * @param description Optional description for the payment
 * @returns Promise resolving to the QR code data URL
 */
export const generatePixQRCode = async (
  pixKey: string,
  value: number,
  transactionId: string,
  beneficiaryName: string,
  city: string = 'BRASIL',
  description?: string
): Promise<string> => {
  try {
    console.log('Gerando QR code PIX com os seguintes dados:');
    console.log('Chave PIX:', pixKey);
    console.log('Valor:', value);
    console.log('ID da transação:', transactionId);
    console.log('Nome do beneficiário:', beneficiaryName);
    console.log('Cidade:', city);
    console.log('Descrição:', description);
    
    // Limpar a chave PIX (remover formatação)
    const cleanPixKey = pixKey.replace(/[^a-zA-Z0-9@]/g, '');
    console.log('Chave PIX limpa:', cleanPixKey);
    
    // Prepare data for pix-payload
    const pixData = {
      key: cleanPixKey,
      name: beneficiaryName,
      city: city,
      amount: value,
      transactionId: transactionId || undefined,
      description: description || undefined
    };

    // Generate PIX payload using the library
    const pixCode = pixPayload(pixData);
    
    console.log('Generated PIX payload:', pixCode);
    
    // Generate QR code from the payload
    const qrCodeDataURL = await QRCode.toDataURL(pixCode, {
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
