
import { useState } from "react";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  ChevronDown, 
  Home, 
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

// Sample data for units
const units = [
  { id: 1, number: "101", block: "A", owner: "João Silva", residents: 2, status: "occupied" },
  { id: 2, number: "102", block: "A", owner: "Maria Santos", residents: 3, status: "occupied" },
  { id: 3, number: "201", block: "A", owner: "Carlos Oliveira", residents: 1, status: "occupied" },
  { id: 4, number: "202", block: "A", owner: "Ana Pereira", residents: 4, status: "occupied" },
  { id: 5, number: "301", block: "A", owner: "Pedro Costa", residents: 0, status: "vacant" },
  { id: 6, number: "302", block: "A", owner: "Lucia Ferreira", residents: 2, status: "occupied" },
  { id: 7, number: "101", block: "B", owner: "Marcos Almeida", residents: 3, status: "occupied" },
  { id: 8, number: "102", block: "B", owner: "Juliana Rodrigues", residents: 2, status: "occupied" },
  { id: 9, number: "201", block: "B", owner: "Roberto Santos", residents: 0, status: "vacant" },
  { id: 10, number: "202", block: "B", owner: "Fernanda Lima", residents: 1, status: "occupied" },
];

// Sample data for residents
const residents = [
  { id: 1, name: "João Silva", email: "joao.silva@email.com", phone: "(11) 98765-4321", unit: "101", block: "A", role: "owner" },
  { id: 2, name: "Mariana Silva", email: "mariana.silva@email.com", phone: "(11) 91234-5678", unit: "101", block: "A", role: "resident" },
  { id: 3, name: "Maria Santos", email: "maria.santos@email.com", phone: "(11) 99876-5432", unit: "102", block: "A", role: "owner" },
  { id: 4, name: "José Santos", email: "jose.santos@email.com", phone: "(11) 98765-1234", unit: "102", block: "A", role: "resident" },
  { id: 5, name: "Ana Santos", email: "ana.santos@email.com", phone: "(11) 91234-8765", unit: "102", block: "A", role: "resident" },
  { id: 6, name: "Carlos Oliveira", email: "carlos.oliveira@email.com", phone: "(11) 99876-1234", unit: "201", block: "A", role: "owner" },
  { id: 7, name: "Ana Pereira", email: "ana.pereira@email.com", phone: "(11) 98765-8765", unit: "202", block: "A", role: "owner" },
  { id: 8, name: "Paulo Pereira", email: "paulo.pereira@email.com", phone: "(11) 91234-1234", unit: "202", block: "A", role: "resident" },
  { id: 9, name: "Lucia Pereira", email: "lucia.pereira@email.com", phone: "(11) 99876-8765", unit: "202", block: "A", role: "resident" },
  { id: 10, name: "Pedro Costa", email: "pedro.costa@email.com", phone: "(11) 98765-9876", unit: "301", block: "A", role: "owner" },
];

export default function Units() {
  const [activeTab, setActiveTab] = useState("units");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUnits = units.filter((unit) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      unit.number.toLowerCase().includes(searchLower) ||
      unit.block.toLowerCase().includes(searchLower) ||
      unit.owner.toLowerCase().includes(searchLower)
    );
  });

  const filteredResidents = residents.filter((resident) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      resident.name.toLowerCase().includes(searchLower) ||
      resident.email.toLowerCase().includes(searchLower) ||
      resident.unit.toLowerCase().includes(searchLower) ||
      resident.block.toLowerCase().includes(searchLower)
    );
  });

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
                <Button className="flex items-center gap-2">
                  <PlusCircle size={16} />
                  <span>{activeTab === "units" ? "Nova Unidade" : "Novo Morador"}</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {activeTab === "units" ? "Adicionar Nova Unidade" : "Adicionar Novo Morador"}
                  </DialogTitle>
                  <DialogDescription>
                    {activeTab === "units" 
                      ? "Preencha os dados da nova unidade do condomínio." 
                      : "Preencha os dados do novo morador do condomínio."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {activeTab === "units" ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="unit-number">Número</Label>
                          <Input id="unit-number" placeholder="101" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unit-block">Bloco</Label>
                          <Input id="unit-block" placeholder="A" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit-owner">Proprietário</Label>
                        <Input id="unit-owner" placeholder="Nome do proprietário" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="resident-name">Nome</Label>
                        <Input id="resident-name" placeholder="Nome completo" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="resident-email">Email</Label>
                          <Input id="resident-email" type="email" placeholder="email@exemplo.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="resident-phone">Telefone</Label>
                          <Input id="resident-phone" placeholder="(00) 00000-0000" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="resident-unit">Unidade</Label>
                          <Input id="resident-unit" placeholder="101" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="resident-block">Bloco</Label>
                          <Input id="resident-block" placeholder="A" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit">Salvar</Button>
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
                {filteredUnits.length > 0 ? (
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
                            <DropdownMenuItem className="flex items-center gap-2">
                              <PencilIcon size={16} />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2">
                              <UserPlus size={16} />
                              <span>Adicionar Morador</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 text-red-600">
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
                {filteredResidents.length > 0 ? (
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
                          <span>{resident.unit}, Bloco {resident.block}</span>
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
                            <DropdownMenuItem className="flex items-center gap-2">
                              <PencilIcon size={16} />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 text-red-600">
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
    </div>
  );
}
