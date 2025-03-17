
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UtilityRatesForm from "@/components/utility/UtilityRatesForm";
import MeterReadingsForm from "@/components/utility/MeterReadingsForm";

export default function UtilityManagement() {
  const [activeTab, setActiveTab] = useState("rates");

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight animate-slide-in-top">
          Consumos
        </h1>
        <p className="text-muted-foreground animate-slide-in-top animation-delay-200">
          Configure taxas e registre leituras de consumo de gás e água.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="rates">Taxas de Consumo</TabsTrigger>
          <TabsTrigger value="readings">Leituras de Medidores</TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="mt-6">
          <UtilityRatesForm />
        </TabsContent>

        <TabsContent value="readings" className="mt-6">
          <MeterReadingsForm />
        </TabsContent>
      </Tabs>

      {/* Espaço adicional para evitar sobreposição do menu flutuante */}
      <div className="h-20" />
    </>
  );
}
