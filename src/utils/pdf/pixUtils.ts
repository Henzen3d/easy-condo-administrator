
import QRCode from 'qrcode';

// Generate QR Code for PIX payment
export const generatePixQRCode = async (
  pixKey: string,
  value: number,
  transactionId: string,
  beneficiaryName: string
): Promise<string> => {
  try {
    // Format PIX data according to Brazilian Central Bank standards
    // This is a simplified version - in production this should follow the complete spec
    const pixData = `00020126330014BR.GOV.BCB.PIX0111${pixKey}5204000053039865802BR5913${beneficiaryName}6008BRASILIA62070503***6304${Math.floor(Math.random() * 10000)}`;
    
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(pixData, {
      width: 200,
      margin: 1,
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
