import { useState, useEffect } from "react";
import { Calendar, Plus, Trash2, Check, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { pt } from 'date-fns/locale';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { fetchBillings, createBilling, Billing } from "@/lib/billingService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BillingGeneratorStep3Props {
  billingData: any;
  updateBillingData: (data: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const BillingGeneratorStep3 = ({ 
  billingData, 
  updateBillingData,
  nextStep,
  prevStep 
}: BillingGeneratorStep3Props) => {
  const { toast } = useToast();
  const [existingBillings, setExistingBillings] = useState<Billing[]>([]);
  const [filteredBillings, setFilteredBillings] = useState<Billing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBillings, setSelectedBillings] = useState<string[]>(billingData.selectedBillings || []);
  const [showNewBillingDialog, setShowNewBillingDialog] = useState(false);
  const [units, setUnits] = useState<{id: number, block: string, number: string}[]>([]);
  const [residents, setResidents] = useState<{id: number, name: string, unit_id: number}[]>([]);
  const [newBilling, setNewBilling] = useState({
    unit: "",
    unit_id: 0,
    resident: "",
    resident_id: 0,
    description: "",
    amount: 0,
    dueDate: new Date().toISOString(),
    category: "taxa"
  });
  
  // Carregar cobranças existentes
  useEffect(() => {
    const loadExistingBillings = async () => {
      try {
        setIsLoading(true);
        console.log("Iniciando carregamento de cobranças existentes...");
        
        // Tentar usar a função fetchBillings
        try {
          console.log("Tentando usar fetchBillings...");
          const billings = await fetchBillings();
          console.log("Cobranças carregadas via fetchBillings:", billings);
          
          if (billings && billings.length > 0) {
            setExistingBillings(billings);
            
            // Filtrar apenas cobranças pendentes ou vencidas
            const filtered = billings.filter(
              billing => billing.status === 'pending' || billing.status === 'overdue'
            );
            setFilteredBillings(filtered);
            console.log("Cobranças filtradas:", filtered);
            setIsLoading(false);
            return;
          } else {
            console.log("Nenhuma cobrança retornada por fetchBillings, tentando buscar diretamente do Supabase...");
          }
        } catch (fetchError) {
          console.error("Erro ao usar fetchBillings:", fetchError);
          console.log("Tentando buscar cobranças diretamente do Supabase...");
        }
        
        // Se fetchBillings falhar ou não retornar dados, buscar diretamente do Supabase
        const { data, error } = await supabase
          .from('billings')
          .select('*')
          .or('status.eq.pending,status.eq.overdue');
          
        if (error) {
          throw error;
        }
        
        console.log("Cobranças carregadas diretamente do Supabase:", data);
        
        if (data) {
          // Mapear os dados para o formato esperado
          const formattedBillings = data.map(billing => ({
            id: billing.id,
            unit: billing.unit,
            unit_id: billing.unit_id,
            resident: billing.resident,
            description: billing.description,
            amount: billing.amount,
            dueDate: billing.due_date,
            status: billing.status,
            isPrinted: billing.is_printed,
            isSent: billing.is_sent
          }));
          
          setExistingBillings(formattedBillings);
          setFilteredBillings(formattedBillings);
          console.log("Cobranças formatadas:", formattedBillings);
        } else {
          setExistingBillings([]);
          setFilteredBillings([]);
          console.log("Nenhuma cobrança encontrada");
        }
      } catch (error) {
        console.error("Erro ao carregar cobranças existentes:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar cobranças existentes",
          variant: "destructive"
        });
        
        // Em caso de erro, definir listas vazias para evitar loading infinito
        setExistingBillings([]);
        setFilteredBillings([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExistingBillings();
  }, [toast]);
  
  // Carregar unidades e residentes
  useEffect(() => {
    const loadUnitsAndResidents = async () => {
      try {
        console.log("Carregando unidades e residentes...");
        
        // Carregar unidades
        const { data: unitsData, error: unitsError } = await supabase
          .from('units')
          .select('id, block, number')
          .order('block')
          .order('number');
          
        if (unitsError) {
          throw unitsError;
        }
        
        console.log("Unidades carregadas:", unitsData);
        setUnits(unitsData || []);
        
        // Carregar residentes
        const { data: residentsData, error: residentsError } = await supabase
          .from('residents')
          .select('id, name, unit_id')
          .order('name');
          
        if (residentsError) {
          throw residentsError;
        }
        
        console.log("Residentes carregados:", residentsData);
        setResidents(residentsData || []);
      } catch (error) {
        console.error("Erro ao carregar unidades e residentes:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar unidades e residentes",
          variant: "destructive"
        });
      }
    };
    
    loadUnitsAndResidents();
  }, [toast]);
  
  // Atualizar billingData quando selectedBillings mudar
  useEffect(() => {
    console.log("Atualizando billingData com selectedBillings:", selectedBillings);
    updateBillingData({
      selectedBillings: selectedBillings
    });
  }, [selectedBillings, updateBillingData]);
  
  // Função para lidar com a mudança de data
  const handleDateChange = (field: string, date: Date | undefined) => {
    if (date) {
      console.log(`Alterando ${field} para:`, date);
      if (field === 'startDate') {
        updateBillingData({
          statementPeriod: {
            ...billingData.statementPeriod,
            startDate: date,
          }
        });
      } else if (field === 'endDate') {
        updateBillingData({
          statementPeriod: {
            ...billingData.statementPeriod,
            endDate: date,
          }
        });
      }
    }
  };
  
  // Função para lidar com a seleção de cobrança
  const handleBillingSelection = (billingId: string) => {
    console.log("Selecionando/desselecionando cobrança:", billingId);
    setSelectedBillings(prev => {
      if (prev.includes(billingId)) {
        return prev.filter(id => id !== billingId);
      } else {
        return [...prev, billingId];
      }
    });
  };
  
  // Função para selecionar/desselecionar todas as cobranças
  const handleSelectAllBillings = () => {
    console.log("Selecionando/desselecionando todas as cobranças");
    if (selectedBillings.length === filteredBillings.length) {
      // Se todas já estão selecionadas, desmarcar todas
      setSelectedBillings([]);
    } else {
      // Senão, selecionar todas
      setSelectedBillings(filteredBillings.map(billing => billing.id));
    }
  };
  
  // Função para lidar com a mudança de unidade
  const handleUnitChange = (value: string) => {
    console.log("Unidade selecionada:", value);
    const unitId = parseInt(value);
    setNewBilling({
      ...newBilling,
      unit: value,
      unit_id: unitId
    });
    
    // Buscar o residente associado à unidade
    if (!isNaN(unitId)) {
      const unitObj = units.find(u => u.id === unitId);
      if (unitObj) {
        const unitResident = residents.find(r => r.unit_id === unitId);
        if (unitResident) {
          console.log("Residente encontrado para a unidade:", unitResident);
          setNewBilling(prev => ({
            ...prev,
            resident: unitResident.name,
            resident_id: unitResident.id
          }));
        } else {
          console.log("Nenhum residente encontrado para a unidade");
          setNewBilling(prev => ({
            ...prev,
            resident: `Proprietário ${unitObj.block}-${unitObj.number}`,
            resident_id: 0
          }));
        }
      }
    }
  };
  
  // Função para criar nova cobrança
  const handleCreateNewBilling = async () => {
    console.log("Criando nova cobrança:", newBilling);
    try {
      // Validar campos obrigatórios
      if (!newBilling.unit_id || !newBilling.description || !newBilling.dueDate) {
        toast({
          title: "Erro",
          description: "Por favor, preencha todos os campos obrigatórios",
          variant: "destructive"
        });
        return;
      }
      
      // Validar valor
      if (!newBilling.amount || newBilling.amount <= 0) {
        toast({
          title: "Erro",
          description: "Por favor, informe um valor válido",
          variant: "destructive"
        });
        return;
      }
      
      // Criar nova cobrança
      const billingData = {
        ...newBilling,
        status: 'pending'
      };
      
      console.log("Dados da cobrança a ser criada:", billingData);
      
      try {
        const createdBilling = await createBilling(billingData);
        console.log("Cobrança criada com sucesso:", createdBilling);
        
        // Atualizar lista de cobranças
        setExistingBillings(prev => [...prev, createdBilling]);
        setFilteredBillings(prev => [...prev, createdBilling]);
      } catch (createError) {
        console.error("Erro ao usar createBilling:", createError);
        console.log("Tentando criar cobrança diretamente no Supabase...");
        
        // Se createBilling falhar, tentar criar diretamente no Supabase
        const unitObj = units.find(u => u.id === newBilling.unit_id);
        const unitDisplay = unitObj ? `${unitObj.block}-${unitObj.number}` : newBilling.unit;
        
        const { data, error } = await supabase
          .from('billings')
          .insert([{
            unit: unitDisplay,
            unit_id: newBilling.unit_id,
            resident: newBilling.resident,
            description: newBilling.description,
            amount: newBilling.amount,
            due_date: newBilling.dueDate,
            status: 'pending',
            is_printed: false,
            is_sent: false,
            category: newBilling.category
          }])
          .select();
          
        if (error) throw error;
        
        console.log("Cobrança criada diretamente no Supabase:", data);
        
        if (data && data.length > 0) {
          const newBillingFormatted = {
            id: data[0].id,
            unit: data[0].unit,
            unit_id: data[0].unit_id,
            resident: data[0].resident,
            description: data[0].description,
            amount: data[0].amount,
            dueDate: data[0].due_date,
            status: data[0].status,
            isPrinted: data[0].is_printed,
            isSent: data[0].is_sent
          };
          
          // Atualizar lista de cobranças
          setExistingBillings(prev => [...prev, newBillingFormatted]);
          setFilteredBillings(prev => [...prev, newBillingFormatted]);
        }
      }
      
      // Limpar formulário
      setNewBilling({
        unit: '',
        unit_id: 0,
        resident: '',
        resident_id: 0,
        description: '',
        amount: 0,
        dueDate: new Date().toISOString(),
        category: 'taxa'
      });
      
      // Fechar modal
      setShowNewBillingDialog(false);
      
      toast({
        title: "Sucesso",
        description: "Cobrança criada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao criar nova cobrança:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar nova cobrança",
        variant: "destructive"
      });
    }
  };
  
  // Função para formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Função para formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "dd/MM/yyyy", { locale: pt });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Período de Exibição do Balancete</h3>
        <p className="text-sm text-muted-foreground">
          Define o período a ser considerado no balancete que acompanha o boleto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="statement-start-date">Data Inicial</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                id="statement-start-date"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {billingData.statementPeriod?.startDate ? (
                  format(new Date(billingData.statementPeriod.startDate), "dd 'de' MMMM 'de' yyyy", { locale: pt })
                ) : (
                  <span>Selecione a data inicial</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={billingData.statementPeriod?.startDate ? new Date(billingData.statementPeriod.startDate) : undefined}
                onSelect={(date) => handleDateChange('startDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="statement-end-date">Data Final</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                id="statement-end-date"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {billingData.statementPeriod?.endDate ? (
                  format(new Date(billingData.statementPeriod.endDate), "dd 'de' MMMM 'de' yyyy", { locale: pt })
                ) : (
                  <span>Selecione a data final</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={billingData.statementPeriod?.endDate ? new Date(billingData.statementPeriod.endDate) : undefined}
                onSelect={(date) => handleDateChange('endDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Itens de Cobrança</h3>
          <Dialog open={showNewBillingDialog} onOpenChange={setShowNewBillingDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                Adicionar Cobrança
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nova Cobrança</DialogTitle>
                <DialogDescription>
                  Adicione uma nova cobrança ao faturamento. Esta cobrança também será adicionada à página de Cobranças.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unidade</Label>
                    <Select 
                      value={newBilling.unit}
                      onValueChange={handleUnitChange}
                    >
                      <SelectTrigger id="unit">
                        <SelectValue placeholder="Selecione uma unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id.toString()}>
                            {`${unit.block}${unit.number}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="resident">Morador</Label>
                    <Input 
                      id="resident" 
                      value={newBilling.resident}
                      onChange={(e) => setNewBilling({...newBilling, resident: e.target.value})}
                      placeholder="Nome do morador" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input 
                    id="description" 
                    value={newBilling.description}
                    onChange={(e) => setNewBilling({...newBilling, description: e.target.value})}
                    placeholder="Ex: Taxa de Condomínio - Janeiro/2024" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <Input 
                      id="amount" 
                      type="text"
                      value={newBilling.amount}
                      onChange={(e) => setNewBilling({...newBilling, amount: e.target.value})}
                      placeholder="0,00" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Data de Vencimento</Label>
                    <Input 
                      id="dueDate" 
                      type="date"
                      value={newBilling.dueDate}
                      onChange={(e) => setNewBilling({...newBilling, dueDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewBillingDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateNewBilling}>
                  Adicionar Cobrança
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Cobranças Existentes</CardTitle>
            <CardDescription>
              Selecione as cobranças que deseja incluir no faturamento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredBillings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhuma cobrança pendente ou atrasada encontrada.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSelectAllBillings}
                  >
                    {selectedBillings.length === filteredBillings.length ? "Desmarcar Todas" : "Selecionar Todas"}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    {selectedBillings.length} de {filteredBillings.length} cobranças selecionadas
                  </p>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Morador</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBillings.map((billing) => (
                        <TableRow 
                          key={billing.id}
                          className={selectedBillings.includes(billing.id) ? "bg-muted/50" : ""}
                        >
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <button
                                className={`h-5 w-5 rounded border ${
                                  selectedBillings.includes(billing.id)
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-input"
                                }`}
                                onClick={() => handleBillingSelection(billing.id)}
                              >
                                {selectedBillings.includes(billing.id) && (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </TableCell>
                          <TableCell>{billing.unit}</TableCell>
                          <TableCell>{billing.resident}</TableCell>
                          <TableCell>{billing.description}</TableCell>
                          <TableCell>{formatDate(billing.dueDate)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(billing.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {selectedBillings.length > 0 && (
                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total selecionado:</span>
                      <span className="font-bold text-lg">
                        {formatCurrency(
                          filteredBillings
                            .filter(billing => selectedBillings.includes(billing.id))
                            .reduce((sum, billing) => sum + billing.amount, 0)
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Adicione observações que aparecerão no boleto..."
          value={billingData.notes || ""}
          onChange={(e) => updateBillingData({ notes: e.target.value })}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default BillingGeneratorStep3;
