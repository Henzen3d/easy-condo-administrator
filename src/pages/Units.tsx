import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
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

export default function Units() {
  const { toast } = useToast();
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
    unitStatus: "occupied",
    residentName: "",
    residentEmail: "",
    residentPhone: "",
    residentUnit: "",
    residentBlock: "",
    residentRole: "resident"
  });

  // Carregar dados do Supabase
  useEffect(() => {
    fetchUnits();
    fetchResidents();
  }, []);

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
      toast({
        title: "Erro",
        description: "Não foi possível carregar as unidades.",
        variant: "destructive"
      });
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
      toast({
        title: "Erro",
        description: "Não foi possível carregar os moradores.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  // Adicionar nova unidade
  async function handleAddUnit() {
    try {
      setLoading(true);
      
      const newUnit = {
        number: formData.unitNumber,
        block: formData.unitBlock,
        owner: formData.unitOwner,
        residents: 0,
        status: formData.unitStatus
      };

      const { data, error } = await supabase
        .from('units')
        .insert(newUnit)
        .select();

      if (error) throw error;
      
      setUnits(prev => [...prev, data[0]]);
      
      resetUnitForm();
      
      toast({
        title: "Sucesso",
        description: "Unidade adicionada com sucesso!",
      });
      
    } catch (error) {
      console.error('Erro ao adicionar unidade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a unidade.",
        variant: "destructive"
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
      
      toast({
        title: "Sucesso",
        description: "Unidade atualizada com sucesso!",
      });
      
    } catch (error) {
      console.error('Erro ao atualizar unidade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a unidade.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  // Excluir unidade
  async function handleDeleteUnit(id: number) {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Atualizar a lista local
      setUnits(prev => prev.filter(unit => unit.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Unidade excluída com sucesso!",
      });
      
      // Atualizar a lista de moradores
      fetchResidents();
      
    } catch (error) {
      console.error('Erro ao excluir unidade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a unidade.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
        toast({
          title: "Erro",
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
      
      toast({
        title: "Sucesso",
        description: "Morador adicionado com sucesso!",
      });
      
    } catch (error) {
      console.error('Erro ao adicionar morador:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o morador.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  // Atualizar morador existente
  async function handleUpdateResident() {
    if (!selectedResident) return;
    
    try {
      setLoading(true);
      
      // Encontrar o ID da unidade
      const targetUnit = units.find(
        unit => unit.number === formData.residentUnit && unit.block === formData.residentBlock
      );

      if (!targetUnit) {
        toast({
          title: "Erro",
          description: "Unidade não encontrada. Verifique o número e bloco.",
          variant: "destructive"
        });
        setLoading(false);
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

      const { error } = await supabase
        .from('residents')
        .update(updatedResident)
        .eq('id', selectedResident.id);

      if (error) throw error;
      
      // Se a unidade mudou, atualizar contagens
      if (oldUnitId !== targetUnit.id) {
        // Reduzir contador na unidade antiga
        const oldUnit = units.find(unit => unit.id === oldUnitId);
        if (oldUnit) {
          await supabase
            .from('units')
            .update({ residents: Math.max(0, oldUnit.residents - 1) })
            .eq('id', oldUnitId);
        }
        
        // Aumentar contador na nova unidade
        await supabase
          .from('units')
          .update({ residents: targetUnit.residents + 1 })
          .eq('id', targetUnit.id);
      }
      
      // Atualizar listas locais
      fetchUnits();
      fetchResidents();
      
      resetResidentForm();
      setSelectedResident(null);
      
      toast({
        title: "Sucesso",
        description: "Morador atualizado com sucesso!",
      });
      
    } catch (error) {
      console.error('Erro ao atualizar morador:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o morador.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  // Excluir morador
  async function handleDeleteResident(resident: Resident) {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('residents')
        .delete()
        .eq('id', resident.id);

      if (error) throw error;
      
      // Atualizar contador de moradores na unidade
      const unit = units.find(u => u.id === resident.unit_id);
      if (unit) {
        await supabase
          .from('units')
          .update({ residents: Math.max(0, unit.residents - 1) })
          .eq('id', unit.id);
      }
      
      // Atualizar listas locais
      fetchUnits();
      fetchResidents();
      
      toast({
        title: "Sucesso",
        description: "Morador excluído com sucesso!",
      });
      
    } catch (error) {
      console.error('Erro ao excluir morador:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o morador.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
      resident.unit_number?.toLowerCase().includes(searchLower) ||
      resident.unit_block?.toLowerCase().includes(searchLower)
    );
  });

  // Resetar o formulário de unidade
  function resetUnitForm() {
    setFormData(prev => ({
      ...prev,
      unitNumber: "",
      unitBlock: "",
      unitOwner: "",
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
  }

  // Lidar com a abertura do diálogo de adicionar unidade
  function handleOpenAddUnitDialog() {
    setIsAddingUnit(true);
    setSelectedUnit(null);
    resetUnitForm();
  }

  // Lidar com a abertura do diálogo de adicionar morador
  function handleOpenAddResidentDialog() {
    setIsAddingResident(true);
    setSelectedResident(null);
    resetResidentForm();
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="units" className="flex items-center gap-2">
              <Building size={16} />
              <span>Unidades</span>
            </TabsTrigger>
            <TabsTrigger value="residents" className="flex items-center gap-2">
              <Users size={16} />
              <span>Moradores</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center w-full sm:w-auto gap-2">
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

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  className="flex items-center gap-2"
                  onClick={activeTab === "units" ? handleOpenAddUnitDialog : handleOpenAddResidentDialog}
                >
                  <PlusCircle size={16} />
                  <span>{activeTab === "units" ? "Nova Unidade" : "Novo Morador"}</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {activeTab === "units" 
                      ? (isAddingUnit ? "Adicionar Nova Unidade" : "Editar Unidade") 
                      : (isAddingResident ? "Adicionar Novo Morador" : "Editar Morador")}
                  </DialogTitle>
                  <DialogDescription>
                    {activeTab === "units" 
                      ? "Preencha os dados da unidade do condomínio." 
                      : "Preencha os dados do morador do condomínio."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {activeTab === "units" ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="unit-number">Número</Label>
                          <Input 
                            id="unit-number" 
                            placeholder="101" 
                            value={formData.unitNumber}
                            onChange={e => setFormData({...formData, unitNumber: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unit-block">Bloco</Label>
                          <Input 
                            id="unit-block" 
                            placeholder="A" 
                            value={formData.unitBlock}
                            onChange={e => setFormData({...formData, unitBlock: e.target.value})}
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
                        <Label htmlFor="unit-status">Status</Label>
                        <Select 
                          value={formData.unitStatus}
                          onValueChange={value => setFormData({...formData, unitStatus: value})}
                        >
                          <SelectTrigger id="unit-status">
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="occupied">Ocupado</SelectItem>
                            <SelectItem value="vacant">Vago</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="resident-name">Nome</Label>
                        <Input 
                          id="resident-name" 
                          placeholder="Nome completo" 
                          value={formData.residentName}
                          onChange={e => setFormData({...formData, residentName: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
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
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="resident-unit">Unidade</Label>
                          <Input 
                            id="resident-unit" 
                            placeholder="101" 
                            value={formData.residentUnit}
                            onChange={e => setFormData({...formData, residentUnit: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="resident-block">Bloco</Label>
                          <Input 
                            id="resident-block" 
                            placeholder="A" 
                            value={formData.residentBlock}
                            onChange={e => setFormData({...formData, residentBlock: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="resident-role">Tipo</Label>
                        <Select 
                          value={formData.residentRole}
                          onValueChange={value => setFormData({...formData, residentRole: value})}
                        >
                          <SelectTrigger id="resident-role">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Proprietário</SelectItem>
                            <SelectItem value="resident">Morador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    onClick={() => {
                      if (activeTab === "units") {
                        isAddingUnit ? handleAddUnit() : handleUpdateUnit();
                      } else {
                        isAddingResident ? handleAddResident() : handleUpdateResident();
                      }
                    }}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isAddingUnit || isAddingResident ? "Adicionar" : "Atualizar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="units" className="space-y-4 animate-fade-in">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Bloco</TableHead>
                  <TableHead>Proprietário</TableHead>
                  <TableHead>Moradores</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
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
                      <TableCell className="font-medium">{unit.number}</TableCell>
                      <TableCell>{unit.block}</TableCell>
                      <TableCell>{unit.owner}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users size={16} className="text-gray-500" />
                          <span>{unit.residents}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={unit.status === "occupied" ? "default" : "secondary"}
                          className={unit.status === "occupied" ? "bg-green-500" : ""}
                        >
                          {unit.status === "occupied" ? "Ocupado" : "Vago"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DialogTrigger asChild onClick={() => handleEditUnit(unit)}>
                              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                <PencilIcon size={16} />
                                <span>Editar</span>
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogTrigger asChild onClick={() => handleAddResidentToUnit(unit)}>
                              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                <UserPlus size={16} />
                                <span>Adicionar Morador</span>
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="flex items-center gap-2 text-red-600 cursor-pointer" onSelect={(e) => e.preventDefault()}>
                                  <Trash2 size={16} />
                                  <span>Excluir</span>
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir a unidade {unit.number}, Bloco {unit.block}?
                                    Essa ação não pode ser desfeita e também excluirá todos os moradores relacionados.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleDeleteUnit(unit.id)}
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
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
                            <p className="text-xs text-muted-foreground">{resident.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{resident.phone}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Home size={16} className="text-gray-500" />
                          <span>{resident.unit_number}, Bloco {resident.unit_block}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={resident.role === "owner" ? "default" : "secondary"}
                          className={resident.role === "owner" ? "bg-primary-600" : ""}
                        >
                          {resident.role === "owner" ? "Proprietário" : "Morador"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DialogTrigger asChild onClick={() => handleEditResident(resident)}>
                              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                <PencilIcon size={16} />
                                <span>Editar</span>
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="flex items-center gap-2 text-red-600 cursor-pointer" onSelect={(e) => e.preventDefault()}>
                                  <Trash2 size={16} />
                                  <span>Excluir</span>
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o morador {resident.name}?
                                    Essa ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleDeleteResident(resident)}
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
    </div>
  );
}
