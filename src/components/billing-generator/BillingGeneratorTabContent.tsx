
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

interface BillingGeneratorTabContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BillingGeneratorTabContent = ({ activeTab, setActiveTab }: BillingGeneratorTabContentProps) => {
  if (activeTab !== "history" && activeTab !== "charges" && activeTab !== "settings") {
    return null;
  }

  return (
    <div className="grid gap-4">
      {activeTab === "history" && (
        <>
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Histórico de Faturamentos</h2>
            <Button variant="outline" className="gap-2">
              <Download size={16} />
              Exportar
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4" />
                <p>Nenhum faturamento encontrado</p>
                <Button className="mt-4" onClick={() => setActiveTab("generator")}>
                  Gerar Novo Faturamento
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "charges" && (
        <>
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Cobranças Lançadas</h2>
            <Button variant="outline" className="gap-2">
              <Download size={16} />
              Exportar
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4" />
                <p>Nenhuma cobrança lançada encontrada</p>
                <Button className="mt-4" onClick={() => setActiveTab("generator")}>
                  Gerar Novo Faturamento
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "settings" && (
        <>
          <h2 className="text-2xl font-bold">Configurações de Pagamento</h2>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <p>As configurações de pagamento serão implementadas em breve.</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
