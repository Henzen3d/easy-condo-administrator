import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const BillingGeneratorSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Pagamento</CardTitle>
        <CardDescription>
          Configure as opções de pagamento para as faturas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Conteúdo da aba de configurações de pagamento</p>
      </CardContent>
    </Card>
  );
};

export default BillingGeneratorSettings; 