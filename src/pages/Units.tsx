import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { toast as sonnerToast } from "sonner";
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
import { useToast } from "@/components/ui/use-toast";

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

// Create memoized components for better performance
const UnitRow = React.memo(({ unit, onEdit, onDelete, onAddResident }: {
  unit: Unit,
  onEdit: (unit: Unit) => void,
  onDelete: (id: number) => void,
  onAddResident: (unit: Unit) => void
}) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{unit.number}</TableCell>
      <TableCell>{unit.block}</TableCell>
      <TableCell>{unit.owner || "Não atribuído"}</TableCell>
      <TableCell>{unit.residents}</TableCell>
      <TableCell>
        <span className={`px-2 py-1 rounded-full text-xs ${
          unit.status === 'occupied' ? 'bg-green-100 text-green-800' :
          unit.status === 'vacant' ? 'bg-amber-100 text-amber-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {unit.status === 'occupied' ? 'Ocupado' : 
           unit.status === 'vacant' ? 'Vago' : unit.status}
        </span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(unit)}>
              <PencilIcon className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddResident(unit)}>
              <UserPlus className="mr-2 h-4 w-4" />
              <span>Adicionar Morador</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(unit.id)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Excluir</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

const ResidentRow = React.memo(({ resident, onEdit, onDelete }: {
  resident: Resident,
  onEdit: (resident: Resident) => void,
  onDelete: (resident: Resident) => void
}) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{resident.name}</TableCell>
      <TableCell>{resident.email}</TableCell>
      <TableCell>{resident.phone}</TableCell>
      <TableCell>{`${resident.unit_block} - ${resident.unit_number}`}</TableCell>
      <TableCell>
        <span className={`px-2 py-1 rounded-full text-xs ${
          resident.role === 'owner' ? 'bg-blue-100 text-blue-800' :
          resident.role === 'tenant' ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {resident.role === 'owner' ? 'Proprietário' : 
           resident.role === 'tenant' ? 'Inquilino' : resident.role}
        </span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(resident)}>
              <PencilIcon className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(resident)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Excluir</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

// Create ResidentDialog component to fix the missing component error and flickering issues
const ResidentDialog = React.memo(({ 
  open, 
  onOpenChange, 
  units, 
  formData, 
  setFormData,
  isAddingResident,
  loading,
  handleAddResident,
  handleUpdateResident
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  units: Unit[];
  formData: any;
  setFormData: (data: any) => void;
  isAddingResident: boolean;
  loading: boolean;
  handleAddResident: () => void;
  handleUpdateResident: () => void;
}) => {
  // Create local handlers to update specific fields
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={e => updateField('residentName', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="resident-email">Email</Label>
            <Input 
              id="resident-email" 
              type="email"
              placeholder="email@exemplo.com" 
              value={formData.residentEmail}
              onChange={e => updateField('residentEmail', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="resident-phone">Telefone</Label>
            <Input 
              id="resident-phone" 
              placeholder="(00) 00000-0000" 
              value={formData.residentPhone}
              onChange={e => updateField('residentPhone', e.target.value)}
            />
          </div>
          
          <UnitSelect 
            units={units} 
            formData={formData} 
            setFormData={setFormData} 
          />
          
          <div className="space-y-2">
            <Label htmlFor="resident-role">Função</Label>
            <Select 
              value={formData.residentRole}
              onValueChange={(value) => updateField('residentRole', value)}
            >
              <SelectTrigger id="resident-role">
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Proprietário</SelectItem>
                <SelectItem value="tenant">Inquilino</SelectItem>
                <SelectItem value="resident">Morador</SelectItem>
                <SelectItem value="visitor">Visitante</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              if (isAddingResident) {
                handleAddResident();
              } else {
                handleUpdateResident();
              }
            }}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isAddingResident ? "Adicionar" : "Atualizar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

ResidentDialog.displayName = 'ResidentDialog';

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
  const [tablesVerified, setTablesVerified] = useState(false);
  const { toast: customToast } = useToast();

  // Define the reset functions early to avoid the "used before declaration" errors
  const resetUnitForm = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      unitNumber: "",
      unitBlock: "",
      unitOwner: "",
      unitOwnerEmail: "",
      unitOwnerPhone: "",
      unitStatus: "occupied"
    }));
  }, []);

  const resetResidentForm = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      residentName: "",
      residentEmail: "",
      residentPhone: "",
      residentUnit: "",
      residentBlock: "",
      residentRole: "resident"
    }));
  }, []);

  // Convert functions to useCallback to prevent unnecessary re-renders
  const checkUnitExists = useCallback(async (number: string, block: string): Promise<boolean> => {
    const { data: existingUnits } = await supabase
      .from('units')
      .select('id')
      .eq('number', number.trim())
      .eq('block', block.trim());

    return existingUnits ? existingUnits.length > 0 : false;
  }, []);

  const handleUnitNumberChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, unitNumber: value }));

    try {
      if (value) {
        const blockValue = formData.unitBlock.trim() || '';
        const exists = await checkUnitExists(value, blockValue);
        setUnitExists(exists);
        if (exists) {
          customToast({
            title: "Atenção",
            description: `A unidade ${value}${blockValue ? ` do bloco ${blockValue}` : ''} já está cadastrada.`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar unidade:', error);
    }
  }, [formData.unitBlock, checkUnitExists, customToast]);

  const handleBlockChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, unitBlock: value }));

    try {
      if (formData.unitNumber) {
        const blockValue = value.trim() || '';
        const exists = await checkUnitExists(formData.unitNumber, blockValue);
        setUnitExists(exists);
        if (exists) {
          customToast({
            title: "Atenção",
            description: `A unidade ${formData.unitNumber}${blockValue ? ` do bloco ${blockValue}` : ''} já está cadastrada.`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar unidade:', error);
    }
  }, [formData.unitNumber, checkUnitExists, customToast]);

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching units...');
      const { data, error } = await supabase
        .from('units')
        .select('*');
      
      console.log('Units query response:', { data, error });
      
      if (error) {
        console.error('Error details:', JSON.stringify(error));
        throw error;
      }
      
      // Set the units state with the fetched data (even if empty)
      setUnits(data || []);
      
    } catch (error) {
      console.error('Error fetching units:', error);
      customToast({
        title: "Não foi possível carregar as unidades.",
        description: "Ocorreu um erro ao carregar as unidades.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchResidents = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching units for residents...');
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select('id, number, block');
      
      console.log('Units for residents response:', { unitsData, unitsError });
      
      if (unitsError) {
        console.error('Error details (units):', JSON.stringify(unitsError));
        throw unitsError;
      }
      
      console.log('Fetching residents...');
      const { data, error } = await supabase
        .from('residents')
        .select('*');
      
      console.log('Residents query response:', { data, error });
      
      if (error) {
        console.error('Error details (residents):', JSON.stringify(error));
        throw error;
      }
      
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
      console.error('Error fetching residents:', error);
      customToast({
        title: "Não foi possível carregar os moradores.",
        description: "Ocorreu um erro ao carregar os moradores.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddUnit = useCallback(async () => {
    console.log('handleAddUnit chamado - iniciando processo de adição');
    
    try {
      setLoading(true);
      console.log('Loading definido como true');
      
      // Validar campos obrigatórios - bloco não é mais obrigatório
      console.log('Validando campos obrigatórios:', formData);
      if (!formData.unitNumber || !formData.unitOwner) {
        console.log('Campos obrigatórios não preenchidos');
        customToast({
          title: "Campos obrigatórios",
          description: "Número da unidade e proprietário são campos obrigatórios.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Verificar se a unidade já existe - usando bloco vazio se não for especificado
      const blockValue = formData.unitBlock.trim() || '';
      console.log('Verificando se a unidade já existe, blockValue:', blockValue);
      
      const exists = await checkUnitExists(formData.unitNumber, blockValue);
      console.log('Unidade existe?', exists);
      if (exists) {
        console.log('Unidade já existe no sistema');
        customToast({
          title: "Unidade já cadastrada",
          description: `A unidade ${formData.unitNumber}${blockValue ? ` do bloco ${blockValue}` : ''} já está cadastrada.`,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // 1. Criar a unidade com dados sanitizados
      const newUnit = {
        number: formData.unitNumber.trim(),
        block: blockValue,
        owner: formData.unitOwner.trim(),
        residents: 1,
        status: formData.unitStatus
      };
      console.log('Dados da nova unidade preparados:', newUnit);

      console.log('Enviando requisição para criar unidade no Supabase');
      const { data: unitData, error: unitError } = await supabase
        .from('units')
        .insert([newUnit])
        .select()
        .single();

      console.log('Resposta do Supabase:', { unitData, unitError });
      
      if (unitError) {
        // Verificar especificamente erro de violação única
        console.log('Erro ao inserir unidade:', unitError);
        if (unitError.code === '23505') {
          customToast({
            title: "Unidade já cadastrada",
            description: `A unidade ${formData.unitNumber} do bloco ${formData.unitBlock} já está cadastrada.`,
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        throw unitError;
      }

      if (!unitData) {
        console.log('Nenhum dado retornado após criar unidade');
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
      console.log('Dados do novo morador preparados:', newResident);

      console.log('Enviando requisição para criar morador no Supabase');
      const { error: residentError } = await supabase
        .from('residents')
        .insert([newResident]);

      console.log('Resposta para criação de morador:', { residentError });
      
      if (residentError) {
        // Rollback - deletar a unidade se falhar ao criar o morador
        console.log('Erro ao inserir morador, fazendo rollback da unidade');
        await supabase
          .from('units')
          .delete()
          .eq('id', unitData.id);
        
        throw residentError;
      }

      // Atualizar as listas locais
      console.log('Atualizando lista de unidades local');
      setUnits(prev => [...prev, unitData]);
      console.log('Buscando lista atualizada de moradores');
      await fetchResidents(); // Buscar lista atualizada de moradores
      
      console.log('Resetando formulário de unidades');
      resetUnitForm();
      console.log('Fechando dialog de unidade');
      setOpenUnitDialog(false);
      
      console.log('Exibindo mensagem de sucesso');
      customToast({
        title: "Unidade e proprietário cadastrados com sucesso!",
        description: "A unidade e o proprietário foram cadastrados com sucesso."
      });
      
    } catch (error: any) {
      console.error('Erro ao adicionar unidade e proprietário:', error);
      customToast({
        title: "Não foi possível cadastrar a unidade e o proprietário.",
        description: "Ocorreu um erro ao cadastrar a unidade e o proprietário.",
        variant: "destructive"
      });
    } finally {
      console.log('Finalizando função handleAddUnit - definindo loading como false');
      setLoading(false);
    }
  }, [formData, checkUnitExists, fetchResidents, resetUnitForm, customToast]);

  const handleUpdateUnit = useCallback(async () => {
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
      
      customToast({
        title: "Unidade atualizada com sucesso!",
        description: "A unidade foi atualizada com sucesso."
      });
      
    } catch (error) {
      console.error('Erro ao atualizar unidade:', error);
      customToast({
        title: "Não foi possível atualizar a unidade.",
        description: "Ocorreu um erro ao atualizar a unidade.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [formData, selectedUnit, resetUnitForm]);

  const prepareDeleteUnit = useCallback((id: number) => {
    setUnitToDelete(id);
    setAlertDialogOpen(true);
  }, []);

  const handleDeleteUnit = useCallback(async () => {
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
      
      customToast({
        title: "Unidade excluída com sucesso!",
        description: "A unidade foi excluída com sucesso."
      });
      
      // Atualizar a lista de moradores
      fetchResidents();
      
    } catch (error) {
      console.error('Erro ao excluir unidade:', error);
      customToast({
        title: "Não foi possível excluir a unidade.",
        description: "Ocorreu um erro ao excluir a unidade.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setUnitToDelete(null);
      setAlertDialogOpen(false);
    }
  }, [unitToDelete, fetchResidents]);

  const handleAddResident = useCallback(async () => {
    try {
      setLoading(true);
      
      // Encontrar o ID da unidade
      const targetUnit = units.find(
        unit => unit.number === formData.residentUnit && unit.block === formData.residentBlock
      );

      if (!targetUnit) {
        customToast({
          title: "Unidade não encontrada",
          description: "Unidade não encontrada. Verifique o número e bloco.",
          variant: "destructive"
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
      
      customToast({
        title: "Morador adicionado com sucesso!",
        description: "O morador foi adicionado com sucesso."
      });
      
    } catch (error) {
      console.error('Erro ao adicionar morador:', error);
      customToast({
        title: "Não foi possível adicionar o morador.",
        description: "Ocorreu um erro ao adicionar o morador.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [formData, units, fetchUnits, fetchResidents, resetResidentForm]);

  const handleUpdateResident = useCallback(async () => {
    if (!selectedResident) return;
    
    try {
      setLoading(true);
      
      const targetUnit = units.find(
        unit => unit.number === formData.residentUnit && unit.block === formData.residentBlock
      );

      if (!targetUnit) {
        customToast({
          title: "Unidade não encontrada",
          description: "Unidade não encontrada. Verifique o número e bloco.",
          variant: "destructive"
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
      
      customToast({
        title: "Morador atualizado com sucesso!",
        description: "O morador foi atualizado com sucesso."
      });
      
    } catch (error) {
      console.error('Erro ao atualizar morador:', error);
      customToast({
        title: "Não foi possível atualizar o morador.",
        description: "Ocorreu um erro ao atualizar o morador.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [formData, units, selectedResident, fetchUnits, fetchResidents, resetResidentForm]);

  const prepareDeleteResident = useCallback((resident: Resident) => {
    setResidentToDelete(resident);
    setAlertDialogOpen(true);
  }, []);

  const handleDeleteResident = useCallback(async () => {
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
      
      customToast({
        title: "Morador excluído com sucesso!",
        description: "O morador foi excluído com sucesso."
      });
      
    } catch (error) {
      console.error('Erro ao excluir morador:', error);
      customToast({
        title: "Não foi possível excluir o morador.",
        description: "Ocorreu um erro ao excluir o morador.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setResidentToDelete(null);
      setAlertDialogOpen(false);
    }
  }, [residentToDelete, fetchResidents]);

  const handleEditUnit = useCallback((unit: Unit) => {
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
  }, []);

  const handleEditResident = useCallback((resident: Resident) => {
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
  }, []);

  const handleAddResidentToUnit = useCallback((unit: Unit) => {
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
  }, []);

  const handleOpenAddUnitDialog = useCallback(() => {
    console.log('handleOpenAddUnitDialog chamado');
    setIsAddingUnit(true);
    setSelectedUnit(null);
    resetUnitForm();
    console.log('Antes de abrir o diálogo, openUnitDialog:', openUnitDialog);
    setOpenUnitDialog(true);
    console.log('Depois de abrir o diálogo, openUnitDialog:', true);
  }, [resetUnitForm]);

  const handleOpenAddResidentDialog = useCallback(() => {
    setIsAddingResident(true);
    setSelectedResident(null);
    resetResidentForm();
    setOpenResidentDialog(true);
  }, [resetResidentForm]);

  // Use useMemo for filtered lists to prevent recalculation on every render
  const filteredUnits = useMemo(() => {
    return units.filter(unit => 
      unit.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.owner.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [units, searchQuery]);

  const filteredResidents = useMemo(() => {
    return residents.filter(resident => 
      resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resident.unit_number && resident.unit_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (resident.unit_block && resident.unit_block.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [residents, searchQuery]);

  // Verificar e configurar tabelas e RLS
  useEffect(() => {
    const checkAndConfigureDatabase = async () => {
      try {
        setLoading(true);
        console.log("Verificando tabelas necessárias...");
        
        // Importar funções de verificação de tabela
        const { 
          ensureUnitsTableExists, 
          ensureResidentsTableExists, 
          configureRLS 
        } = await import('@/utils/dbUtils');
        
        // Garantir que a tabela units existe
        const unitsExists = await ensureUnitsTableExists();
        if (!unitsExists) {
          customToast({
            title: "Erro na estrutura de dados",
            description: "Não foi possível verificar ou criar a tabela de unidades.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        // Garantir que a tabela residents existe
        const residentsExists = await ensureResidentsTableExists();
        if (!residentsExists) {
          customToast({
            title: "Erro na estrutura de dados",
            description: "Não foi possível verificar ou criar a tabela de moradores.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        // Verificar RLS nas tabelas - não bloqueia a execução mesmo se falhar
        await configureRLS();
        
        // Se chegou até aqui, as tabelas existem e estão configuradas
        console.log("Tabelas verificadas e configuradas com sucesso");
        setTablesVerified(true);
      } catch (error) {
        console.error("Erro ao verificar tabelas:", error);
        customToast({
          title: "Erro na estrutura de dados",
          description: "Ocorreu um erro ao verificar a estrutura do banco de dados.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkAndConfigureDatabase();
  }, []);

  // Add useEffect to load data on component mount
  useEffect(() => {
    // Só carregar dados após verificar tabelas
    if (tablesVerified) {
      fetchUnits();
      fetchResidents();
    }
  }, [tablesVerified]);

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
                    <UnitRow 
                      key={unit.id}
                      unit={unit}
                      onEdit={handleEditUnit}
                      onDelete={prepareDeleteUnit}
                      onAddResident={handleAddResidentToUnit}
                    />
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
                    <ResidentRow 
                      key={resident.id}
                      resident={resident}
                      onEdit={handleEditResident}
                      onDelete={prepareDeleteResident}
                    />
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
      <Dialog open={openUnitDialog} onOpenChange={(open) => {
        console.log('Dialog onOpenChange chamado com valor:', open);
        setOpenUnitDialog(open);
      }}>
        <DialogContent onInteractOutside={(e) => {
          console.log('Dialog onInteractOutside chamado');
          e.preventDefault();
        }}>
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
                <Label htmlFor="unit-number">Número da Unidade *</Label>
                <Input 
                  id="unit-number" 
                  placeholder="101" 
                  value={formData.unitNumber}
                  onChange={handleUnitNumberChange}
                  className={unitExists ? "border-red-500" : ""}
                />
                <p className="text-xs text-muted-foreground">Campo obrigatório</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit-block">Bloco (opcional)</Label>
                <Input 
                  id="unit-block" 
                  placeholder="A" 
                  value={formData.unitBlock}
                  onChange={handleBlockChange}
                  className={formData.unitNumber && formData.unitBlock && unitExists ? "border-red-500" : ""}
                />
                <p className="text-xs text-muted-foreground">Deixe em branco se não houver blocos</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit-owner">Proprietário *</Label>
              <Input 
                id="unit-owner" 
                placeholder="Nome do proprietário" 
                value={formData.unitOwner}
                onChange={e => setFormData({...formData, unitOwner: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">Campo obrigatório</p>
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
            <Button 
              variant="outline" 
              onClick={(e) => {
                console.log('Botão Cancelar clicado');
                setOpenUnitDialog(false);
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              disabled={loading}
              onClick={(e) => {
                console.log('Botão Adicionar/Atualizar clicado manualmente');
                e.preventDefault();
                if (isAddingUnit) {
                  console.log('Chamando handleAddUnit diretamente');
                  handleAddUnit();
                } else {
                  console.log('Chamando handleUpdateUnit diretamente');
                  handleUpdateUnit();
                }
              }}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isAddingUnit ? "Adicionar" : "Atualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Morador */}
      <ResidentDialog 
        open={openResidentDialog}
        onOpenChange={setOpenResidentDialog}
        units={units}
        formData={formData}
        setFormData={setFormData}
        isAddingResident={isAddingResident}
        loading={loading}
        handleAddResident={handleAddResident}
        handleUpdateResident={handleUpdateResident}
      />

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
