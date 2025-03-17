
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  ChevronDown, 
  Home, 
  Loader2, 
  MoreHorizontal, 
  PencilIcon, 
  PlusCircle, 
  Search, 
  Trash2, 
  UserPlus, 
  Users 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Tipos para as unidades e moradores
interface Unit {
  id: number;
  number: string;
  block: string;
  owner: string;
  residents: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface Resident {
  id: number;
  name: string;
  email: string;
  phone: string;
  unit_id: number;
  role: string;
  unit_number?: string;
  unit_block?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// Mova o UnitSelect para fora do componente principal Units
const UnitSelect = React.memo(({ 
  units, 
  formData, 
  setFormData 
}: {
  units: Unit[];
  formData: any; // Idealmente, defina um tipo específico para formData
  setFormData: (data: any) => void;
}) => {
  const handleUnitSelect = useCallback((value: string) => {
    const [number, block] = value.split('|');
    setFormData(prev => ({
      ...prev,
      residentUnit: number,
      residentBlock: block
    }));
  }, [setFormData]);

  const currentValue = useMemo(() => {
    return formData.residentUnit && formData.residentBlock 
      ? `${formData.residentUnit}|${formData.residentBlock}`
      : "";
  }, [formData.residentUnit, formData.residentBlock]);

  return (
    <div className="space-y-2">
      <Label>Unidade</Label>
      <Select value={currentValue} onValueChange={handleUnitSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione a unidade" />
        </SelectTrigger>
        <SelectContent>
          {units.map((unit) => (
            <SelectItem 
              key={unit.id} 
              value={`${unit.number}|${unit.block}`}
            >
              Unidade {unit.number} - Bloco {unit.block}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

UnitSelect.displayName = 'UnitSelect';

export default function Units() {
  const [activeTab, setActiveTab] = useState("units");
  const [searchQuery, setSearchQuery] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isAddingUnit, setIsAddingUnit] = useState(true);
  const [isAddingResident, setIsAddingResident] = useState(true);
  const [formData, setFormData] = useState({
    unitNumber: "",
    unitBlock: "",
    unitOwner: "",
    unitOwnerEmail: "",
    unitOwnerPhone: "",
    unitStatus: "occupied",
    residentName: "",
    residentEmail: "",
    residentPhone: "",
    residentUnit: "",
    residentBlock: "",
    residentRole: "resident"
  });
  const [openUnitDialog, setOpenUnitDialog] = useState(false);
  const [openResidentDialog, setOpenResidentDialog] = useState(false);
  const [openUnitCombobox, setOpenUnitCombobox] = useState(false);
  const [openBlockCombobox, setOpenBlockCombobox] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<number | null>(null);
  const [residentToDelete, setResidentToDelete] = useState<Resident | null>(null);
  const [unitExists, setUnitExists] = useState(false);

  // Função para verificar se uma unidade existe
  const checkUnitExists = async (number: string, block: string): Promise<boolean> => {
    const { data: existingUnits } = await supabase
      .from('units')
      .select('id')
      .eq('number', number.trim())
      .eq('block', block.trim());

    return existingUnits ? existingUnits.length > 0 : false;
  };

  // Carregar dados do Supabase
  useEffect(() => {
    fetchUnits();
    fetchResidents();
  }, []);

  // Função para verificar unidade duplicada ao digitar
  const handleUnitNumberChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, unitNumber: value }));

    try {
      if (value && formData.unitBlock) {
        const exists = await checkUnitExists(value, formData.unitBlock);
        setUnitExists(exists);
        if (exists) {
          toast.warning(`Atenção: A unidade ${value} do bloco ${formData.unitBlock} já está cadastrada.`, {
            duration: 4000,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar unidade:', error);
    }
  };

  // Função para verificar unidade duplicada ao digitar o bloco
  const handleBlockChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, unitBlock: value }));

    try {
      if (value && formData.unitNumber) {
        const exists = await checkUnitExists(formData.unitNumber, value);
        setUnitExists(exists);
        if (exists) {
          toast.warning(`Atenção: A unidade ${formData.unitNumber} do bloco ${value} já está cadastrada.`, {
            duration: 4000,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar unidade:', error);
    }
  };

  // Buscar unidades
  async function fetchUnits() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('units')
        .select('*');
      
      if (error) throw error;
      
      setUnits(data || []);
    } catch (error) {
      console.error('Erro ao buscar unidades:', error);
      toast.error("Não foi possível carregar as unidades.");
    } finally {
      setLoading(false);
    }
  }

  // Buscar moradores com dados da unidade
  async function fetchResidents() {
    try {
      setLoading(true);
      const { data: unitsData } = await supabase
        .from('units')
        .select('id, number, block');
      
      const { data, error } = await supabase
        .from('residents')
        .select('*');
      
      if (error) throw error;
      
      // Mapear os moradores com os dados da unidade
      const residentsWithUnitInfo = data?.map(resident => {
        const residentUnit = unitsData?.find(unit => unit.id === resident.unit_id);
        return {
          ...resident,
          unit_number: residentUnit?.number || "",
          unit_block: residentUnit?.block || ""
        };
      }) || [];
      
      setResidents(residentsWithUnitInfo);
    } catch (error) {
      console.error('Erro ao buscar moradores:', error);
      toast.error("Não foi possível carregar os moradores.");
    } finally {
      setLoading(false);
    }
  }

  // Adicionar nova unidade
  async function handleAddUnit() {
    try {
      setLoading(true);
      
      // Validar campos obrigatórios
      if (!formData.unitNumber || !formData.unitBlock || !formData.unitOwner) {
        toast.error("Número, bloco e proprietário são campos obrigatórios.", {
          duration: 4000,
        });
        return;
      }

      // Verificar se a unidade já existe
      if (unitExists) {
        toast.error(`A unidade ${formData.unitNumber} do bloco ${formData.unitBlock} já está cadastrada.`, {
          duration: 4000,
        });
        return;
      }

      // 1. Criar a unidade com dados sanitizados
      const newUnit = {
        number: formData.unitNumber.trim(),
        block: formData.unitBlock.trim(),
        owner: formData.unitOwner.trim(),
        residents: 1,
        status: formData.unitStatus
      };

      const { data: unitData, error: unitError } = await supabase
        .from('units')
        .insert([newUnit])
        .select()
        .single();

      if (unitError) {
        // Verificar especificamente erro de violação única
        if (unitError.code === '23505') {
          toast.error(`A unidade ${formData.unitNumber} do bloco ${formData.unitBlock} já está cadastrada.`, {
            duration: 5000,
          });
          return;
        }
        throw unitError;
      }

      if (!unitData) {
        throw new Error('Nenhum dado retornado após criar unidade');
      }

      // 2. Cadastrar o proprietário como morador
      const newResident = {
        name: formData.unitOwner.trim(),
        email: formData.unitOwnerEmail?.trim() || null,
        phone: formData.unitOwnerPhone?.trim() || null,
        unit_id: unitData.id,
        role: "owner",
        status: "active"
      };

      const { error: residentError } = await supabase
        .from('residents')
        .insert([newResident]);

      if (residentError) {
        // Rollback - deletar a unidade se falhar ao criar o morador
        await supabase
          .from('units')
          .delete()
          .eq('id', unitData.id);
        
        throw residentError;
      }

      // Atualizar as listas locais
      setUnits(prev => [...prev, unitData]);
      await fetchResidents(); // Buscar lista atualizada de moradores
      
      resetUnitForm();
      setOpenUnitDialog(false);
      
      toast.success("Unidade e proprietário cadastrados com sucesso!");
      
    } catch (error: any) {
      console.error('Erro ao adicionar unidade e proprietário:', error);
      toast.error("Não foi possível cadastrar a unidade e o proprietário.", {
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  }

  // Atualizar unidade existente
  async function handleUpdateUnit() {
    if (!selectedUnit) return;
    
    try {
      setLoading(true);
      
      const updatedUnit = {
        number: formData.unitNumber,
        block: formData.unitBlock,
        owner: formData.unitOwner,
        status: formData.unitStatus
      };

      const { error } = await supabase
        .from('units')
        .update(updatedUnit)
        .eq('id', selectedUnit.id);

      if (error) throw error;
      
      // Atualizar a lista local
      setUnits(prev => 
        prev.map(unit => 
          unit.id === selectedUnit.id 
            ? { ...unit, ...updatedUnit } 
            : unit
        )
      );
      
      resetUnitForm();
      setSelectedUnit(null);
      setOpenUnitDialog(false);
      
      toast.success("Unidade atualizada com sucesso!");
      
    } catch (error) {
      console.error('Erro ao atualizar unidade:', error);
      toast.error("Não foi possível atualizar a unidade.");
    } finally {
      setLoading(false);
    }
  }

  // Preparar exclusão de unidade
  function prepareDeleteUnit(id: number) {
    setUnitToDelete(id);
    setAlertDialogOpen(true);
  }

  // Excluir unidade
  async function handleDeleteUnit() {
    if (!unitToDelete) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', unitToDelete);

      if (error) throw error;
      
      // Atualizar a lista local
      setUnits(prev => prev.filter(unit => unit.id !== unitToDelete));
      
      toast.success("Unidade excluída com sucesso!");
      
      // Atualizar a lista de moradores
      fetchResidents();
      
    } catch (error) {
      console.error('Erro ao excluir unidade:', error);
      toast.error("Não foi possível excluir a unidade.");
    } finally {
      setLoading(false);
      setUnitToDelete(null);
      setAlertDialogOpen(false);
    }
  }

  // Adicionar novo morador
  async function handleAddResident() {
    try {
      setLoading(true);
      
      // Encontrar o ID da unidade
      const targetUnit = units.find(
        unit => unit.number === formData.residentUnit && unit.block === formData.residentBlock
      );

      if (!targetUnit) {
        toast.error("Unidade não encontrada. Verifique o número e bloco.", {
          duration: 5000,
        });
        setLoading(false);
        return;
      }

      const newResident = {
        name: formData.residentName,
        email: formData.residentEmail,
        phone: formData.residentPhone,
        unit_id: targetUnit.id,
        role: formData.residentRole,
        status: "active"
      };

      const { data, error } = await supabase
        .from('residents')
        .insert(newResident)
        .select();

      if (error) throw error;
      
      // Atualizar contagem de moradores na unidade
      await supabase
        .from('units')
        .update({ residents: targetUnit.residents + 1 })
        .eq('id', targetUnit.id);
      
      // Atualizar listas locais
      fetchUnits();
      fetchResidents();
      
      resetResidentForm();
      setOpenResidentDialog(false);
      
      toast.success("Morador adicionado com sucesso!");
      
    } catch (error) {
      console.error('Erro ao adicionar morador:', error);
      toast.error("Não foi possível adicionar o morador.");
    } finally {
      setLoading(false);
    }
  }

  // Atualizar morador existente
  async function handleUpdateResident() {
    if (!selectedResident) return;
    
    try {
      setLoading(true);
      
      const targetUnit = units.find(
        unit => unit.number === formData.residentUnit && unit.block === formData.residentBlock
      );

      if (!targetUnit) {
        toast.error("Unidade não encontrada. Verifique o número e bloco.", {
          duration: 5000,
        });
        return;
      }

      const oldUnitId = selectedResident.unit_id;
      
      const updatedResident = {
        name: formData.residentName,
        email: formData.residentEmail,
        phone: formData.residentPhone,
        unit_id: targetUnit.id,
        role: formData.residentRole
      };

      // Agrupe todas as operações do banco de dados
      const updates = [];

      // Atualização do residente
      updates.push(
        supabase
          .from('residents')
          .update(updatedResident)
          .eq('id', selectedResident.id)
      );

      // Se a unidade mudou, atualize as contagens
      if (oldUnitId !== targetUnit.id) {
        // Reduzir contador na unidade antiga
        const oldUnit = units.find(unit => unit.id === oldUnitId);
        if (oldUnit) {
          updates.push(
            supabase
              .from('units')
              .update({ residents: Math.max(0, oldUnit.residents - 1) })
              .eq('id', oldUnitId)
          );
        }
        
        // Aumentar contador na nova unidade
        updates.push(
          supabase
            .from('units')
            .update({ residents: targetUnit.residents + 1 })
            .eq('id', targetUnit.id)
        );
      }

      // Execute todas as atualizações em paralelo
      await Promise.all(updates);
      
      // Atualize os estados locais de uma vez
      await Promise.all([
        fetchUnits(),
        fetchResidents()
      ]);
      
      resetResidentForm();
      setSelectedResident(null);
      setOpenResidentDialog(false);
      
      toast.success("Morador atualizado com sucesso!");
      
    } catch (error) {
      console.error('Erro ao atualizar morador:', error);
      toast.error("Não foi possível atualizar o morador.");
    } finally {
      setLoading(false);
    }
  }

  // Preparar exclusão de morador
  function prepareDeleteResident(resident: Resident) {
    setResidentToDelete(resident);
    setAlertDialogOpen(true);
  }

  // Excluir morador
  async function handleDeleteResident() {
    if (!residentToDelete) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('residents')
        .delete()
        .eq('id', residentToDelete.id);

      if (error) throw error;
      
      // Atualizar contador de moradores na unidade
      const unit = units.find(u => u.id === residentToDelete.unit_id);
      if (unit) {
        await supabase
          .from('units')
          .update({ residents: Math.max(0, unit.residents - 1) })
          .eq('id', unit.id);
      }
      
      // Atualizar listas locais
      fetchUnits();
      fetchResidents();
      
      toast.success("Morador excluído com sucesso!");
      
    } catch (error) {
      console.error('Erro ao excluir morador:', error);
      toast.error("Não foi possível excluir o morador.");
    } finally {
      setLoading(false);
      setResidentToDelete(null);
      setAlertDialogOpen(false);
    }
  }

  // Filtrar unidades
  const filteredUnits = units.filter((unit) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      unit.number.toLowerCase().includes(searchLower) ||
      unit.block.toLowerCase().includes(searchLower) ||
      unit.owner.toLowerCase().includes(searchLower)
    );
  });

  // Filtrar moradores
  const filteredResidents = residents.filter((resident) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      resident.name.toLowerCase().includes(searchLower) ||
      resident.email.toLowerCase().includes(searchLower) ||
      (resident.unit_number && resident.unit_number.toLowerCase().includes(searchLower)) ||
      (resident.unit_block && resident.unit_block.toLowerCase().includes(searchLower))
    );
  });

  // Resetar o formulário de unidade
  function resetUnitForm() {
    setFormData(prev => ({
      ...prev,
      unitNumber: "",
      unitBlock: "",
      unitOwner: "",
      unitOwnerEmail: "",
      unitOwnerPhone: "",
      unitStatus: "occupied"
    }));
  }

  // Resetar o formulário de morador
  function resetResidentForm() {
    setFormData(prev => ({
      ...prev,
      residentName: "",
      residentEmail: "",
      residentPhone: "",
      residentUnit: "",
      residentBlock: "",
      residentRole: "resident"
    }));
  }

  // Editar unidade
  function handleEditUnit(unit: Unit) {
    setSelectedUnit(unit);
    setIsAddingUnit(false);
    setFormData(prev => ({
      ...prev,
      unitNumber: unit.number,
      unitBlock: unit.block,
      unitOwner: unit.owner,
      unitStatus: unit.status
    }));
    setOpenUnitDialog(true);
  }

  // Editar morador
  function handleEditResident(resident: Resident) {
    setSelectedResident(resident);
    setIsAddingResident(false);
    setFormData(prev => ({
      ...prev,
      residentName: resident.name,
      residentEmail: resident.email,
      residentPhone: resident.phone,
      residentUnit: resident.unit_number || "",
      residentBlock: resident.unit_block || "",
      residentRole: resident.role
    }));
    setOpenResidentDialog(true);
  }

  // Adicionar morador a partir de uma unidade
  function handleAddResidentToUnit(unit: Unit) {
    setActiveTab("residents");
    setIsAddingResident(true);
    setSelectedResident(null);
    setFormData(prev => ({
      ...prev,
      residentUnit: unit.number,
      residentBlock: unit.block,
      residentName: "",
      residentEmail: "",
      residentPhone: "",
      residentRole: "resident"
    }));
    setOpenResidentDialog(true);
  }

  // Lidar com a abertura do diálogo de adicionar unidade
  function handleOpenAddUnitDialog() {
    setIsAddingUnit(true);
    setSelectedUnit(null);
    resetUnitForm();
    setOpenUnitDialog(true);
  }

  // Lidar com a abertura do diálogo de adicionar morador
  function handleOpenAddResidentDialog() {
    setIsAddingResident(true);
    setSelectedResident(null);
    resetResidentForm();
    setOpenResidentDialog(true);
  }

  // Obter lista única de números de unidades para o combobox
  const uniqueUnitNumbers = Array.from(new Set(units.map(unit => unit.number))).filter(Boolean);
  
  // Obter lista única de blocos para o combobox
  const uniqueBlocks = Array.from(new Set(units.map(unit => unit.block))).filter(Boolean);

  // Componente de seleção de unidade para o formulário de morador
  // UnitSelect foi movido para fora do componente principal Units

  // Formulário de Edição de Morador
  const ResidentDialog = () => {
    return (
      <Dialog open={openResidentDialog} onOpenChange={setOpenResidentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isAddingResident ? "Adicionar Novo Morador" : "Editar Morador"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do morador.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resident-name">Nome</Label>
              <Input
                id="resident-name"
                placeholder="Nome completo"
                value={formData.residentName}
                onChange={e => setFormData({...formData, residentName: e.target.value})}
              />
            </div>

            <UnitSelect 
              units={units} 
              formData={formData} 
              setFormData={setFormData} 
            />

            <div className="space-y-2">
              <Label htmlFor="resident-email">Email</Label>
              <Input
                id="resident-email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.residentEmail}
                onChange={e => setFormData({...formData, residentEmail: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resident-phone">Telefone</Label>
              <Input
                id="resident-phone"
                placeholder="(00) 00000-0000"
                value={formData.residentPhone}
                onChange={e => setFormData({...formData, residentPhone: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resident-role">Função</Label>
              <Select
                value={formData.residentRole}
                onValueChange={(value) => setFormData({...formData, residentRole: value})}
              >
                <SelectTrigger id="resident-role">
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Proprietário</SelectItem>
                  <SelectItem value="resident">Morador</SelectItem>
                  <SelectItem value="tenant">Inquilino</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenResidentDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={isAddingResident ? handleAddResident : handleUpdateResident}>
              {isAddingResident ? "Adicionar" : "Atualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight animate-slide-in-top">Unidades & Moradores</h1>
        <p className="text-muted-foreground animate-slide-in-top animation-delay-100">
          Gerencie as unidades do condomínio e seus respectivos moradores
        </p>
      </div>

      <Tabs defaultValue="units" className="animate-fade-in" onValueChange={setActiveTab}>
        {/* Barra de ações responsiva */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="units" className="flex-1 sm:flex-none flex items-center gap-2">
              <Building size={16} />
              <span>Unidades</span>
            </TabsTrigger>
            <TabsTrigger value="residents" className="flex-1 sm:flex-none flex items-center gap-2">
              <Users size={16} />
              <span>Moradores</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col w-full sm:flex-row sm:w-auto gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={activeTab === "units" ? "Buscar unidades..." : "Buscar moradores..."}
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button 
              className="flex items-center gap-2 w-full sm:w-auto"
              onClick={activeTab === "units" ? handleOpenAddUnitDialog : handleOpenAddResidentDialog}
            >
              <PlusCircle size={16} />
              <span>{activeTab === "units" ? "Nova Unidade" : "Novo Morador"}</span>
            </Button>
          </div>
        </div>

        <TabsContent value="units" className="space-y-4 animate-fade-in">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="hidden sm:table-cell">Bloco</TableHead>
                  <TableHead className="hidden md:table-cell">Proprietário</TableHead>
                  <TableHead className="hidden sm:table-cell">Moradores</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="w-[50px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredUnits.length > 0 ? (
                  filteredUnits.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell>
                        <div className="font-medium">
                          {unit.number}
                          {/* Informações extras para mobile */}
                          <div className="sm:hidden space-y-1 mt-1">
                            <div className="text-sm text-muted-foreground">
                              Bloco {unit.block}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {unit.owner}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Users size={14} className="text-gray-500" />
                              <span>{unit.residents}</span>
                            </div>
                            <Badge 
                              variant={unit.status === "occupied" ? "default" : "secondary"}
                              className={unit.status === "occupied" ? "bg-green-500" : ""}
                            >
                              {unit.status === "occupied" ? "Ocupado" : "Vago"}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{unit.block}</TableCell>
                      <TableCell className="hidden md:table-cell">{unit.owner}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <Users size={16} className="text-gray-500" />
                          <span>{unit.residents}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge 
                          variant={unit.status === "occupied" ? "default" : "secondary"}
                          className={unit.status === "occupied" ? "bg-green-500" : ""}
                        >
                          {unit.status === "occupied" ? "Ocupado" : "Vago"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => handleEditUnit(unit)}>
                              <PencilIcon size={16} />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => handleAddResidentToUnit(unit)}>
                              <UserPlus size={16} />
                              <span>Adicionar Morador</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center gap-2 text-red-600 cursor-pointer" 
                              onClick={() => prepareDeleteUnit(unit.id)}
                            >
                              <Trash2 size={16} />
                              <span>Excluir</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhuma unidade encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="residents" className="space-y-4 animate-fade-in">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Contato</TableHead>
                  <TableHead className="hidden sm:table-cell">Unidade</TableHead>
                  <TableHead className="hidden md:table-cell">Tipo</TableHead>
                  <TableHead className="w-[50px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredResidents.length > 0 ? (
                  filteredResidents.map((resident) => (
                    <TableRow key={resident.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src="" alt={resident.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                              {resident.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{resident.name}</p>
                            {/* Informações extras para mobile */}
                            <div className="sm:hidden space-y-1 mt-1">
                              <p className="text-sm text-muted-foreground">
                                {resident.email}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {resident.phone}
                              </p>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Home size={14} />
                                <span>{resident.unit_number}, Bloco {resident.unit_block}</span>
                              </div>
                              <Badge variant={resident.role === "owner" ? "default" : "secondary"}>
                                {resident.role === "owner" ? "Proprietário" : "Morador"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{resident.phone}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <Home size={16} className="text-gray-500" />
                          <span>{resident.unit_number}, Bloco {resident.unit_block}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={resident.role === "owner" ? "default" : "secondary"}>
                          {resident.role === "owner" ? "Proprietário" : "Morador"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => handleEditResident(resident)}>
                              <PencilIcon size={16} />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center gap-2 text-red-600 cursor-pointer" 
                              onClick={() => prepareDeleteResident(resident)}
                            >
                              <Trash2 size={16} />
                              <span>Excluir</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum morador encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Unidade */}
      <Dialog open={openUnitDialog} onOpenChange={setOpenUnitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isAddingUnit ? "Adicionar Nova Unidade" : "Editar Unidade"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da unidade do condomínio.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit-number">Número da Unidade</Label>
                <Input 
                  id="unit-number" 
                  placeholder="101" 
                  value={formData.unitNumber}
                  onChange={handleUnitNumberChange}
                  className={formData.unitNumber && formData.unitBlock && unitExists ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit-block">Bloco</Label>
                <Input 
                  id="unit-block" 
                  placeholder="A" 
                  value={formData.unitBlock}
                  onChange={handleBlockChange}
                  className={formData.unitNumber && formData.unitBlock && unitExists ? "border-red-500" : ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit-owner">Proprietário</Label>
              <Input 
                id="unit-owner" 
                placeholder="Nome do proprietário" 
                value={formData.unitOwner}
                onChange={e => setFormData({...formData, unitOwner: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit-owner-email">Email do Proprietário</Label>
              <Input 
                id="unit-owner-email" 
                type="email"
                placeholder="email@exemplo.com" 
                value={formData.unitOwnerEmail}
                onChange={e => setFormData({...formData, unitOwnerEmail: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit-owner-phone">Telefone</Label>
                <Input 
                  id="unit-owner-phone" 
                  placeholder="(00) 00000-0000" 
                  value={formData.unitOwnerPhone}
                  onChange={e => setFormData({...formData, unitOwnerPhone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit-status">Status</Label>
                <Select 
                  value={formData.unitStatus}
                  onValueChange={(value) => setFormData({...formData, unitStatus: value})}
                >
                  <SelectTrigger id="unit-status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="occupied">Ocupado</SelectItem>
                    <SelectItem value="vacant">Vago</SelectItem>
                    <SelectItem value="maintenance">Em Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenUnitDialog(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              onClick={() => isAddingUnit ? handleAddUnit() : handleUpdateUnit()}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isAddingUnit ? "Adicionar" : "Atualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Morador */}
      <ResidentDialog />

      {/* Diálogo de confirmação para exclusão */}
      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {unitToDelete 
                ? "Tem certeza que deseja excluir esta unidade? Esta ação não pode ser desfeita e também excluirá todos os moradores relacionados."
                : "Tem certeza que deseja excluir este morador? Esta ação não pode ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => unitToDelete ? handleDeleteUnit() : handleDeleteResident()}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Espaço adicional para evitar sobreposição do menu flutuante */}
      <div className="h-20" />
    </div>
  );
}
