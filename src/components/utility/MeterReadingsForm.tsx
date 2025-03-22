import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase, ensureTablesExist } from "@/integrations/supabase/client";
import { MeterReading, UtilityRate } from "@/types/consumption";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ensureMeterReadingsTableExists, ensureBillingsTableExists } from "@/utils/dbUtils";

interface Unit {
  id: number;
  block: string;
  number: string;
}

// Função para formatar valores monetários
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export default function MeterReadingsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [previousReading, setPreviousReading] = useState<MeterReading | null>(null);
  const [currentRate, setCurrentRate] = useState<UtilityRate | null>(null);
  const [meterReading, setMeterReading] = useState({
    unit_id: "",
    utility_type: "gas" as "gas" | "water",
    previous_reading: "",
    current_reading: "",
    reading_date: new Date().toISOString().split('T')[0],
    total_value: 0
  });
  
  // Estado para o dialog de confirmação
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState({
    unit: "",
    type: "",
    reading: "",
    consumption: "",
    totalValue: "",
    date: "",
    billId: "",
    description: ""
  });
  
  // Estado para indicar se as tabelas foram verificadas
  const [tablesVerified, setTablesVerified] = useState(false);

  useEffect(() => {
    // Verificar e criar tabelas necessárias ao iniciar o componente
    checkAndCreateTables();
  }, []);

  useEffect(() => {
    // Só carregar unidades após verificar tabelas
    if (tablesVerified) {
      loadUnits();
    }
  }, [tablesVerified]);

  useEffect(() => {
    if (meterReading.unit_id && meterReading.utility_type) {
      // Limpar leitura atual ao mudar de unidade ou tipo
      setMeterReading(prev => ({
        ...prev,
        current_reading: "",
        total_value: 0
      }));
      
      loadPreviousReading();
      loadCurrentRate();
    }
  }, [meterReading.unit_id, meterReading.utility_type]);

  useEffect(() => {
    calculateTotalValue();
  }, [meterReading.previous_reading, meterReading.current_reading, currentRate]);

  // Função para verificar e criar tabelas necessárias
  const checkAndCreateTables = async () => {
    try {
      console.log("Verificando tabelas necessárias...");
      
      // Garantir que a tabela meter_readings existe
      const meterReadingsExists = await ensureMeterReadingsTableExists();
      if (!meterReadingsExists) {
        toast({
          title: "Erro na estrutura de dados",
          description: "Não foi possível verificar ou criar a tabela de leituras de medidores.",
          variant: "destructive"
        });
        return false;
      }
      
      // Garantir que a tabela billings existe
      const billingsExists = await ensureBillingsTableExists();
      if (!billingsExists) {
        toast({
          title: "Aviso",
          description: "Funcionamento parcial: leituras serão salvas, mas cobranças podem não ser geradas automaticamente.",
          variant: "default"
        });
      }
      
      console.log("Tabelas verificadas e criadas com sucesso");
      setTablesVerified(true);
      return true;
    } catch (error) {
      console.error("Erro ao verificar tabelas:", error);
      toast({
        title: "Erro na estrutura de dados",
        description: "Ocorreu um erro ao verificar a estrutura do banco de dados.",
        variant: "destructive"
      });
      return false;
    }
  };

  const loadUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('id, block, number')
        .order('block')
        .order('number');

      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error("Error loading units:", error);
      toast({
        title: "Erro ao carregar unidades",
        description: "Não foi possível carregar a lista de unidades.",
        variant: "destructive"
      });
    }
  };

  const loadPreviousReading = async () => {
    if (!meterReading.unit_id) return;
    
    setLoading(true);
    try {
      console.log(`Buscando leitura anterior para unidade_id=${meterReading.unit_id} e tipo=${meterReading.utility_type}`);
      
      const { data, error } = await supabase
        .from('meter_readings')
        .select('*')
        .eq('unit_id', parseInt(meterReading.unit_id))
        .eq('utility_type', meterReading.utility_type)
        .order('reading_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error("Erro ao buscar leitura anterior:", error);
        throw error;
      }
      
      console.log("Dados de leitura anterior obtidos:", data);
      
      if (data && data.length > 0) {
        const readingData = {
          ...data[0],
          utility_type: data[0].utility_type as "gas" | "water"
        };
        setPreviousReading(readingData);
        
        // Atualizar a leitura anterior com o valor encontrado
        setMeterReading(prev => ({
          ...prev,
          previous_reading: readingData.reading_value.toString(),
          current_reading: "" // Limpar a leitura atual ao carregar nova leitura anterior
        }));
        
        console.log("Leitura anterior definida:", readingData.reading_value.toString());
      } else {
        console.log("Nenhuma leitura anterior encontrada, definindo como zero");
        setPreviousReading(null);
        setMeterReading(prev => ({
          ...prev,
          previous_reading: "0",
          current_reading: "" // Limpar a leitura atual ao não encontrar leitura anterior
        }));
      }
    } catch (error) {
      console.error("Error loading previous reading:", error);
      toast({
        title: "Erro ao carregar leitura anterior",
        description: "Não foi possível carregar a leitura anterior.",
        variant: "destructive"
      });
      
      // Definir como zero em caso de erro
      setPreviousReading(null);
      setMeterReading(prev => ({
        ...prev,
        previous_reading: "0"
      }));
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentRate = async () => {
    try {
      const { data, error } = await supabase
        .from('utility_rates')
        .select('*')
        .eq('utility_type', meterReading.utility_type)
        .order('effective_date', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data.length > 0) {
        setCurrentRate(data[0]);
      }
    } catch (error) {
      console.error("Error loading current rate:", error);
      toast({
        title: "Erro ao carregar taxa atual",
        description: "Não foi possível carregar a taxa atual.",
        variant: "destructive"
      });
    }
  };

  const calculateTotalValue = () => {
    const previous = parseFloat(meterReading.previous_reading) || 0;
    const current = parseFloat(meterReading.current_reading) || 0;
    const rate = currentRate?.rate_per_cubic_meter || 0;
    
    if (current > previous) {
      const consumption = current - previous;
      const total = consumption * rate;
      setMeterReading(prev => ({ ...prev, total_value: total }));
      return total;
    }
    return 0;
  };

  // Função para verificar a estrutura da tabela de cobranças
  const verifyBillingsTable = async () => {
    try {
      console.log("Verificando estrutura da tabela de cobranças");
      
      // Método alternativo: tentar acessar diretamente a tabela billings
      const { data: billingsData, error: billingsError } = await supabase
        .from('billings')
        .select('id')
        .limit(1);
      
      // Se não houver erro, a tabela billings existe
      if (!billingsError) {
        console.log("Tabela 'billings' encontrada");
        
        // Verificar colunas disponíveis buscando um registro completo
        const { data: columnsData, error: columnsError } = await supabase
          .from('billings')
          .select('*')
          .limit(1);
          
        if (!columnsError && columnsData && columnsData.length > 0) {
          const availableColumns = Object.keys(columnsData[0]);
          console.log("Colunas disponíveis na tabela billings:", availableColumns);
          
          return { 
            tableExists: true, 
            tableName: 'billings', 
            columns: availableColumns,
            error: null
          };
        }
        
        // Se não conseguiu obter as colunas mas a tabela existe
        return { 
          tableExists: true, 
          tableName: 'billings', 
          columns: ['unit', 'description', 'amount', 'due_date', 'status', 'resident', 'is_printed', 'is_sent'],
          error: null
        };
      }
      
      // Se houver erro, verificar se é porque a tabela não existe ou por outro motivo
      console.log("Erro ao verificar tabela 'billings':", billingsError);
      
      // Tentar tabela alternativa 'billing' (singular)
      const { data: billingData, error: billingError } = await supabase
        .from('billing')
        .select('id')
        .limit(1);
      
      if (!billingError) {
        console.log("Tabela 'billing' encontrada");
        
        // Verificar colunas disponíveis
        const { data: singularColumnsData, error: singularColumnsError } = await supabase
          .from('billing')
          .select('*')
          .limit(1);
          
        if (!singularColumnsError && singularColumnsData && singularColumnsData.length > 0) {
          const availableColumns = Object.keys(singularColumnsData[0]);
          console.log("Colunas disponíveis na tabela billing:", availableColumns);
          
          return { 
            tableExists: true, 
            tableName: 'billing', 
            columns: availableColumns,
            error: null
          };
        }
        
        // Se não conseguiu obter as colunas mas a tabela existe
        return { 
          tableExists: true, 
          tableName: 'billing', 
          columns: ['unit', 'description', 'amount', 'due_date', 'status', 'resident', 'is_printed', 'is_sent'],
          error: null
        };
      }
      
      // Se chegou aqui, nenhuma tabela de cobranças foi encontrada
      console.error("Nenhuma tabela de cobranças encontrada");
      return { 
        tableExists: false, 
        tableName: null, 
        columns: [], 
        error: "Nenhuma tabela de cobranças encontrada"
      };
    } catch (e) {
      console.error("Erro ao verificar tabela de cobranças:", e);
      return { tableExists: false, tableName: null, columns: [], error: e };
    }
  };

  // Verificar a estrutura da tabela meter_readings
  const verifyMeterReadingsTable = async () => {
    try {
      console.log("DIAGNÓSTICO - Verificando estrutura da tabela meter_readings...");
      
      // Usar a função do utilitário para verificar e criar a tabela se necessário
      const tableExists = await ensureMeterReadingsTableExists();
      
      if (tableExists) {
        console.log("ESTRUTURA - Tabela meter_readings verificada com sucesso");
        return true;
      } else {
        console.log("ESTRUTURA - Falha ao verificar tabela meter_readings");
        
        // Tentar obter metadados da tabela
        const { data, error } = await supabase
          .from('meter_readings')
          .select('*')
          .limit(1);
        
        if (error) {
          console.error("ERRO - Falha ao verificar tabela meter_readings:", error);
          return false;
        }
        
        // Verificar se conseguimos recuperar algum dado
        if (data && data.length > 0) {
          const firstRow = data[0];
          console.log("ESTRUTURA - Campos disponíveis na tabela meter_readings:", Object.keys(firstRow));
          return true;
        } else {
          console.log("ESTRUTURA - Tabela meter_readings existe mas está vazia");
          
          // Tentar inserir um registro de teste para verificar estrutura
          const testReading = {
            unit_id: 1,
            utility_type: "WATER",
            reading_value: 0,
            reading_date: new Date().toISOString().split('T')[0]
          };
          
          console.log("DIAGNÓSTICO - Tentando inserção de teste:", testReading);
          const { data: testData, error: testError } = await supabase
            .from('meter_readings')
            .insert([testReading])
            .select();
          
          if (testError) {
            console.error("ERRO - Falha na inserção de teste:", testError);
            return false;
          } else {
            console.log("SUCESSO - Inserção de teste bem-sucedida:", testData);
            
            // Remover o registro de teste
            const { error: deleteError } = await supabase
              .from('meter_readings')
              .delete()
              .eq('id', testData[0].id);
              
            if (deleteError) {
              console.warn("ALERTA - Não foi possível remover o registro de teste:", deleteError);
            } else {
              console.log("LIMPEZA - Registro de teste removido com sucesso");
            }
            
            return true;
          }
        }
      }
    } catch (err) {
      console.error("ERRO CRÍTICO - Erro ao verificar tabela meter_readings:", err);
      return false;
    }
  };

  useEffect(() => {
    const checkTablesAndStructure = async () => {
      try {
        await checkAndCreateTables();
        const tableStructureOk = await verifyMeterReadingsTable();
        if (tableStructureOk) {
          console.log("INICIALIZAÇÃO - Estrutura da tabela meter_readings verificada e OK");
        } else {
          toast({
            title: "Alerta",
            description: "Possível problema com a estrutura da tabela de leituras. Verifique o console para mais detalhes.",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error("Erro ao verificar tabelas:", err);
      }
    };
    
    checkTablesAndStructure();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const previous = parseFloat(meterReading.previous_reading);
    const current = parseFloat(meterReading.current_reading);
    
    if (!current || current < 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor de leitura válido.",
        variant: "destructive"
      });
      return;
    }
    
    if (current <= previous && previous > 0) {
      toast({
        title: "Valor inválido",
        description: "A leitura atual deve ser maior que a leitura anterior.",
        variant: "destructive"
      });
      return;
    }
    
    if (!meterReading.unit_id) {
      toast({
        title: "Unidade não selecionada",
        description: "Por favor, selecione uma unidade.",
        variant: "destructive"
      });
      return;
    }
    
    const unitId = parseInt(meterReading.unit_id);
    
    setLoading(true);
    
    // Mostrar toast de processamento
    const processingToast = toast({
      title: "Processando",
      description: "Salvando leitura e gerando cobrança...",
    });
    
    try {
      // PASSO 1: Salvar a nova leitura
      const readingToInsert = {
        unit_id: unitId,
        utility_type: meterReading.utility_type,
        reading_value: current,
        reading_date: meterReading.reading_date
      };
      
      console.log("DIAGNÓSTICO - Inserindo nova leitura na tabela meter_readings:", readingToInsert);
      
      const { data: readingData, error: readingError } = await supabase
        .from('meter_readings')
        .insert([readingToInsert])
        .select();
      
      if (readingError) {
        console.error("ERRO - Falha ao inserir na tabela meter_readings:", readingError);
        throw new Error(`Erro ao salvar leitura: ${readingError.message}`);
      }
      
      console.log("SUCESSO - Nova leitura salva na tabela meter_readings:", readingData);
      
      // Atualizar o estado com a nova leitura como leitura anterior
      if (readingData && readingData.length > 0) {
        console.log("DIAGNÓSTICO - Atualizando estado com a nova leitura:", readingData[0]);
        setPreviousReading(readingData[0] as MeterReading);
        setMeterReading(prev => ({
          ...prev,
          previous_reading: current.toString(),
          current_reading: ""
        }));
      } else {
        console.warn("ALERTA - A leitura foi inserida mas nenhum dado foi retornado");
      }
      
      // PASSO 2: Verificar existência da tabela de cobranças
      let billingSuccess = false;
      let billingId = "";
      let billingError = null;
      
      // Calcular o consumo (diferença entre leitura atual e anterior)
      const consumptionValue = current - previous;
      
      try {
        // Buscar informações da unidade
        const { data: unitData, error: unitError } = await supabase
          .from('units')
          .select('block, number, owner')
          .eq('id', unitId)
          .single();
          
        if (unitError) throw unitError;
        
        // Montar dados da cobrança
        const selectedUnit = units.find(u => u.id.toString() === meterReading.unit_id);
        const unitDisplay = selectedUnit ? `${selectedUnit.block}-${selectedUnit.number}` : "";
        const consumptionDescription = `Consumo de ${meterReading.utility_type === 'gas' ? 'gás' : 'água'} (${consumptionValue.toFixed(3)} m³)`;
        
        // Verificar estrutura da tabela de cobranças
        const tableInfo = await verifyBillingsTable();
        
        if (!tableInfo.tableExists || !tableInfo.tableName) {
          throw new Error(`Tabela de cobranças não encontrada: ${tableInfo.error}`);
        }
        
        // Usar o nome da tabela encontrada
        const tableName = tableInfo.tableName;
        const columns = tableInfo.columns || [];
        
        // Dados básicos que toda tabela billing deve ter
        const billingData = {
          unit: unitDisplay,
          description: consumptionDescription,
          amount: meterReading.total_value,
          due_date: meterReading.reading_date,
          status: 'pending',
        };
        
        // Adicionar campos opcionais se existirem na tabela
        const extendedBillingData = {
          ...billingData,
          ...(columns.includes('resident') && { resident: unitData.owner || "Morador" }),
          ...(columns.includes('is_printed') && { is_printed: false }),
          ...(columns.includes('is_sent') && { is_sent: false }),
          ...(columns.includes('unit_id') && { unit_id: unitId }),
        };
        
        console.log(`Inserindo cobrança na tabela ${tableName}:`, extendedBillingData);
        
        // Inserir cobrança
        const { data: billingResult, error: insertBillingError } = await supabase
          .from(tableName)
          .insert([extendedBillingData])
          .select();
          
        if (insertBillingError) {
          throw insertBillingError;
        }
        
        billingSuccess = true;
        billingId = billingResult?.[0]?.id?.toString() || "";
        console.log("Cobrança criada com sucesso:", billingResult);
      } catch (error) {
        billingError = error;
        console.error("Erro ao criar cobrança:", error);
      }
      
      // PASSO 3: Mostrar confirmação apropriada
      const selectedUnit = units.find(u => u.id.toString() === meterReading.unit_id);
      const unitDisplay = selectedUnit ? `${selectedUnit.block}-${selectedUnit.number}` : "";
      const consumptionDescription = `Consumo de ${meterReading.utility_type === 'gas' ? 'gás' : 'água'} (${consumptionValue.toFixed(3)} m³)`;
      
      setConfirmationDetails({
        unit: unitDisplay,
        type: meterReading.utility_type === 'gas' ? 'Gás' : 'Água',
        reading: `${current.toFixed(3)} m³`,
        consumption: `${consumptionValue.toFixed(3)} m³`,
        totalValue: formatCurrency(meterReading.total_value),
        date: new Date(meterReading.reading_date).toLocaleDateString('pt-BR'),
        billId: billingSuccess ? billingId : "Erro ao gerar cobrança",
        description: consumptionDescription
      });
      
      // Atualizar toast com resultado
      if (billingSuccess) {
        toast({
          title: "Leitura e cobrança registradas",
          description: `A leitura de ${meterReading.utility_type === 'gas' ? 'gás' : 'água'} foi registrada e a cobrança foi gerada.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Leitura registrada",
          description: "A leitura foi salva, mas houve um problema ao gerar a cobrança.",
          variant: "default"
        });
      }
      
      // Mostrar confirmação
      setShowConfirmation(true);

    } catch (error) {
      console.error("Erro ao salvar leitura ou cobrança:", error);
      toast({
        title: "Erro ao processar",
        description: error instanceof Error ? error.message : "Não foi possível salvar a leitura ou gerar cobrança.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para fechar o dialog e limpar o formulário
  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    
    // Reset form
    setMeterReading({
      unit_id: "",
      utility_type: "gas",
      previous_reading: "",
      current_reading: "",
      reading_date: new Date().toISOString().split('T')[0],
      total_value: 0
    });
    setPreviousReading(null);
    setCurrentRate(null);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Leituras de Medidores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="unit-id">Unidade</Label>
              <Select 
                value={meterReading.unit_id} 
                onValueChange={(value) => setMeterReading({...meterReading, unit_id: value})}
              >
                <SelectTrigger id="unit-id">
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={String(unit.id)}>
                      {unit.block}-{unit.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="utility-type">Tipo de Consumo</Label>
              <Select 
                value={meterReading.utility_type} 
                onValueChange={(value: "gas" | "water") => setMeterReading({...meterReading, utility_type: value})}
              >
                <SelectTrigger id="utility-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gas">Gás</SelectItem>
                  <SelectItem value="water">Água</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="previous-reading">Leitura Anterior (m³)</Label>
                <Input 
                  id="previous-reading" 
                  type="number" 
                  step="0.001" 
                  placeholder="0.000"
                  value={meterReading.previous_reading}
                  onChange={(e) => {
                    setMeterReading({...meterReading, previous_reading: e.target.value});
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="current-reading">Leitura Atual (m³)</Label>
                <Input 
                  id="current-reading" 
                  type="number" 
                  step="0.001" 
                  placeholder="0.000"
                  value={meterReading.current_reading}
                  onChange={(e) => {
                    setMeterReading({...meterReading, current_reading: e.target.value});
                  }}
                />
              </div>
            </div>
            
            {meterReading.unit_id && meterReading.utility_type && !currentRate && (
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>
                  Não há taxa definida para {meterReading.utility_type === 'gas' ? 'gás' : 'água'}. 
                  Por favor, defina uma taxa primeiro na aba "Taxas de Consumo".
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reading-date">Data da Leitura</Label>
                <Input 
                  id="reading-date" 
                  type="date" 
                  value={meterReading.reading_date}
                  onChange={(e) => setMeterReading({...meterReading, reading_date: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="total-value">Valor da Leitura (R$)</Label>
                <Input 
                  id="total-value" 
                  type="text" 
                  placeholder="R$ 0,00"
                  value={formatCurrency(meterReading.total_value)}
                  readOnly
                />
              </div>
            </div>
            
            {meterReading.current_reading && meterReading.previous_reading && currentRate && (
              <Card className="bg-muted/30">
                <CardContent className="pt-4 pb-2">
                  <div className="text-sm space-y-1">
                    <p><strong>Consumo:</strong> {(parseFloat(meterReading.current_reading) - parseFloat(meterReading.previous_reading)).toFixed(3)} m³</p>
                    <p><strong>Taxa atual:</strong> {formatCurrency(currentRate.rate_per_cubic_meter)} por m³</p>
                    <p><strong>Valor total:</strong> {formatCurrency(meterReading.total_value)}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Button type="submit" className="w-full" disabled={loading || !meterReading.unit_id}>
              {loading ? "Salvando..." : "Registrar Leitura"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Dialog de confirmação */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Leitura Registrada com Sucesso</DialogTitle>
            <DialogDescription>
              A leitura foi registrada e a cobrança foi gerada no sistema.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Processamento concluído</AlertTitle>
              <AlertDescription className="text-green-700">
                Todos os dados foram salvos com sucesso.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Unidade</Label>
                <p className="text-sm font-medium">{confirmationDetails.unit}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Tipo</Label>
                <p className="text-sm font-medium">{confirmationDetails.type}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Leitura Atual</Label>
                <p className="text-sm font-medium">{confirmationDetails.reading}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Consumo</Label>
                <p className="text-sm font-medium">{confirmationDetails.consumption}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Valor Total</Label>
                <p className="text-sm font-medium">{confirmationDetails.totalValue}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Data</Label>
                <p className="text-sm font-medium">{confirmationDetails.date}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs text-muted-foreground">Descrição</Label>
                <p className="text-sm font-medium">{confirmationDetails.description}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs text-muted-foreground">ID da Cobrança</Label>
                <p className="text-sm font-medium">{confirmationDetails.billId}</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleCloseConfirmation}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
