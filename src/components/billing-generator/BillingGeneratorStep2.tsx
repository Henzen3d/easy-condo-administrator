
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";

interface BillingGeneratorStep2Props {
  billingData: any;
  updateBillingData: (data: any) => void;
}

// Mock data for charge items
const mockChargeItems = [
  { 
    id: 1, 
    description: "Taxa de Condomínio", 
    value: 350, 
    unit: "all", 
    category: "taxa" 
  },
  { 
    id: 2, 
    description: "Fundo de Reserva", 
    value: 70, 
    unit: "all", 
    category: "taxa" 
  },
];

// Mock data for units
const mockUnits = [
  { id: 1, number: "101", block: "A" },
  { id: 2, number: "102", block: "A" },
  { id: 3, number: "201", block: "A" },
  { id: 4, number: "202", block: "A" },
  { id: 5, number: "101", block: "B" },
  { id: 6, number: "102", block: "B" },
];

// Mock categories for charges
const chargeCategories = [
  { id: "taxa", name: "Taxa Regular" },
  { id: "extra", name: "Taxa Extra" },
  { id: "multa", name: "Multa" },
  { id: "consumo", name: "Consumo" },
  { id: "outros", name: "Outros" },
];

const BillingGeneratorStep2 = ({ 
  billingData, 
  updateBillingData 
}: BillingGeneratorStep2Props) => {
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [existingCharges] = useState(mockChargeItems);
  const [selectedUnit, setSelectedUnit] = useState("all");
  
  // Initialize state based on billingData or empty array
  const [chargeItems, setChargeItems] = useState(
    billingData.chargeItems.length > 0 ? billingData.chargeItems : existingCharges
  );
  
  // New charge item form state
  const [newItem, setNewItem] = useState({
    description: "",
    value: "",
    unit: "all",
    category: "taxa"
  });

  // Handle adding a new charge item
  const handleAddItem = () => {
    const newItemWithId = {
      ...newItem,
      id: Date.now(), // Simple ID generation
      value: parseFloat(newItem.value)
    };
    
    const updatedItems = [...chargeItems, newItemWithId];
    setChargeItems(updatedItems);
    updateBillingData({ chargeItems: updatedItems });
    
    // Reset form
    setNewItem({
      description: "",
      value: "",
      unit: "all",
      category: "taxa"
    });
    
    setIsAddItemDialogOpen(false);
  };

  // Handle removing a charge item
  const handleRemoveItem = (itemId: number) => {
    const updatedItems = chargeItems.filter(item => item.id !== itemId);
    setChargeItems(updatedItems);
    updateBillingData({ chargeItems: updatedItems });
  };

  // Handle unit selection change
  const handleUnitChange = (value: string) => {
    setSelectedUnit(value);
    updateBillingData({ targetUnits: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Grupo de Unidades</h3>
        
        <div>
          <Label htmlFor="target-units">Selecione a unidade para este faturamento</Label>
          <Select 
            value={selectedUnit} 
            onValueChange={handleUnitChange}
          >
            <SelectTrigger id="target-units">
              <SelectValue placeholder="Selecione uma unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Unidades</SelectItem>
              {mockUnits.map(unit => (
                <SelectItem key={unit.id} value={String(unit.id)}>
                  {`${unit.block}-${unit.number}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Itens de Cobrança</h3>
          
          <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                Incluir Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Item de Cobrança</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="item-description">Descrição</Label>
                  <Input 
                    id="item-description" 
                    placeholder="Ex: Taxa de Condomínio"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="item-value">Valor (R$)</Label>
                  <Input 
                    id="item-value" 
                    type="number"
                    placeholder="0.00"
                    value={newItem.value}
                    onChange={(e) => setNewItem({...newItem, value: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="item-category">Categoria</Label>
                  <Select 
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({...newItem, category: value})}
                  >
                    <SelectTrigger id="item-category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {chargeCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="item-unit">Aplicar para</Label>
                  <Select 
                    value={newItem.unit}
                    onValueChange={(value) => setNewItem({...newItem, unit: value})}
                  >
                    <SelectTrigger id="item-unit">
                      <SelectValue placeholder="Selecione uma unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Unidades</SelectItem>
                      {mockUnits.map(unit => (
                        <SelectItem key={unit.id} value={String(unit.id)}>
                          {`${unit.block}-${unit.number}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddItem}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {chargeItems.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Aplicação</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chargeItems.map((item) => {
                    const category = chargeCategories.find(cat => cat.id === item.category)?.name || item.category;
                    const unitDisplay = item.unit === "all" 
                      ? "Todas as Unidades" 
                      : mockUnits.find(u => String(u.id) === String(item.unit))
                        ? `${mockUnits.find(u => String(u.id) === String(item.unit))?.block}-${mockUnits.find(u => String(u.id) === String(item.unit))?.number}`
                        : "Unidade não encontrada";
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{category}</TableCell>
                        <TableCell>{unitDisplay}</TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(item.value)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center p-8 border rounded-lg bg-muted/10">
            <p className="text-muted-foreground">
              Nenhum item de cobrança adicionado. Clique em "Incluir Item" para adicionar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingGeneratorStep2;
