
import * as React from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkIsMobile = () => {
      // Verifica se é um dispositivo móvel usando user agent
      const userAgent = 
        typeof window.navigator === "undefined" ? "" : navigator.userAgent;
      const mobileRegex = 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      
      // Verifica apenas pelo user agent, removendo a verificação de largura
      const isMobileDevice = mobileRegex.test(userAgent);
      
      setIsMobile(isMobileDevice);
    };

    // Verificação inicial
    checkIsMobile();

    // Adiciona listener para mudanças de orientação do dispositivo
    window.addEventListener("orientationchange", checkIsMobile);

    // Cleanup
    return () => window.removeEventListener("orientationchange", checkIsMobile);
  }, []);

  return isMobile;
}
