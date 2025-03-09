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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BillingGeneratorStep3Props {
  billingData: any;
  updateBillingData: (data: any) => void;
}

const BillingGeneratorStep3 = ({ 
  billingData, 
  updateBillingData 
}: BillingGeneratorStep3Props) => {
  const [existingBillings, setExistingBillings] = useState<Billing[]>([]);
  const [filteredBillings, setFilteredBillings] = useState<Billing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBillings, setSelectedBillings] = useState<string[]>([]);
  const [showNewBillingDialog, setShowNewBillingDialog] = useState(false);
  const [units, setUnits] = useState<{id: number, block: string, number: string}[]>([]);
  const [residents, setResidents] = useState<{id: number, name: string, unit_id: number}[]>([]);
  
  // Estados para o formulário de nova cobrança
  const [newBilling, setNewBilling] = useState({
    unit: "",
    unit_id: null as number | null,
    resident: "",
    description: "",
    amount: "",
    dueDate: new Date().toISOString().split('T')[0],
    status: "pending" as const
  });
  
  // Carregar cobranças existentes
  useEffect(() => {
    async function loadBillings() {
      setIsLoading(true);
      try {
        const billings = await fetchBillings();
        
        // Filtrar apenas cobranças pendentes e atrasadas
        const relevantBillings = billings.filter(
          billing => billing.status === 'pending' || billing.status === 'overdue'
        );
        
        setExistingBillings(relevantBillings);
        setFilteredBillings(relevantBillings);
        
        // Atualizar o billingData com as cobranças existentes
        updateBillingData({
          existingBillings: relevantBillings,
          selectedBillings: selectedBillings
        });
      } catch (error) {
        console.error("Erro ao carregar cobranças:", error);
        toast.error("Erro ao carregar cobranças existentes");
      } finally {
        setIsLoading(false);
      }
    }
    
    async function loadUnitsAndResidents() {
      try {
        // Carregar unidades
        const { data: unitsData, error: unitsError } = await supabase
          .from('units')
          .select('id, block, number')
          .order('block')
          .order('number');
          
        if (unitsError) throw unitsError;
        setUnits(unitsData || []);
        
        // Carregar residentes
        const { data: residentsData, error: residentsError } = await supabase
          .from('residents')
          .select('id, name, unit_id');
          
        if (residentsError) throw residentsError;
        setResidents(residentsData || []);
      } catch (error) {
        console.error("Erro ao carregar unidades e residentes:", error);
      }
    }
    
    loadBillings();
    loadUnitsAndResidents();
  }, []);
  
  // Atualizar billingData quando selectedBillings mudar
  useEffect(() => {
    updateBillingData({
      selectedBillings: selectedBillings
    });
  }, [selectedBillings]);
  
  const handleDateChange = (field: string, date: Date | undefined) => {
    if (date) {
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
  
  const handleBillingSelection = (billingId: string) => {
    setSelectedBillings(prev => {
      if (prev.includes(billingId)) {
        return prev.filter(id => id !== billingId);
      } else {
        return [...prev, billingId];
      }
    });
  };
  
  const handleSelectAllBillings = () => {
    if (selectedBillings.length === filteredBillings.length) {
      // Se todas já estão selecionadas, desmarcar todas
      setSelectedBillings([]);
    } else {
      // Senão, selecionar todas
      setSelectedBillings(filteredBillings.map(billing => billing.id));
    }
  };
  
  const handleUnitChange = (value: string) => {
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
          setNewBilling(prev => ({
            ...prev,
            resident: unitResident.name
          }));
        }
      }
    }
  };
  
  const handleCreateNewBilling = async () => {
    try {
      // Validação básica
      if (!newBilling.unit || !newBilling.resident || !newBilling.description || 
          !newBilling.amount || !newBilling.dueDate) {
        toast.error("Por favor, preencha todos os campos obrigatórios");
        return;
      }
      
      const amount = parseFloat(newBilling.amount.toString().replace(',', '.'));
      if (isNaN(amount) || amount <= 0) {
        toast.error("Por favor, informe um valor válido");
        return;
      }
      
      // Preparar dados para salvar
      const unitObj = units.find(u => u.id === newBilling.unit_id);
      const unitDisplay = unitObj ? `${unitObj.block}${unitObj.number}` : newBilling.unit;
      
      const billingToCreate = {
        unit: unitDisplay,
        unit_id: newBilling.unit_id,
        resident: newBilling.resident,
        description: newBilling.description,
        amount: amount,
        dueDate: newBilling.dueDate,
        status: newBilling.status,
        isPrinted: false,
        isSent: false
      };
      
      // Salvar no banco de dados
      const { error } = await supabase
        .from('billings')
        .insert([{
          unit: unitDisplay,
          unit_id: newBilling.unit_id,
          resident: newBilling.resident,
          description: newBilling.description,
          amount: amount,
          due_date: newBilling.dueDate,
          status: newBilling.status,
          is_printed: false,
          is_sent: false
        }]);
        
      if (error) throw error;
      
      toast.success("Cobrança criada com sucesso!");
      
      // Recarregar cobranças
      const billings = await fetchBillings();
      const relevantBillings = billings.filter(
        billing => billing.status === 'pending' || billing.status === 'overdue'
      );
      setExistingBillings(relevantBillings);
      setFilteredBillings(relevantBillings);
      
      // Fechar o diálogo
      setShowNewBillingDialog(false);
      
      // Resetar o formulário
      setNewBilling({
        unit: "",
        unit_id: null,
        resident: "",
        description: "",
        amount: "",
        dueDate: new Date().toISOString().split('T')[0],
        status: "pending"
      });
    } catch (error) {
      console.error("Erro ao criar cobrança:", error);
      toast.error("Erro ao criar nova cobrança");
    }
  };
  
  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
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
