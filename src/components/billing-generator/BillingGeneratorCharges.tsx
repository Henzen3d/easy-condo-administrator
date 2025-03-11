import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const BillingGeneratorCharges = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cobranças Lançadas</CardTitle>
        <CardDescription>
          Visualize todas as cobranças lançadas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Conteúdo da aba de cobranças lançadas</p>
      </CardContent>
    </Card>
  );
};

export default BillingGeneratorCharges; 