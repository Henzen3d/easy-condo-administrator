export default async function MoradoresPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const moradores = await getMoradores(searchParams);
  
  return (
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Unidades e Moradores</h1>
        <p className="text-muted-foreground">
          Gerencie os moradores e unidades do condomínio
        </p>
      </div>

      {/* Barra de ações responsiva */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Busca */}
          <div className="relative flex-1 sm:max-w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar morador..."
              className="pl-9"
            />
          </div>
          
          {/* Filtros compactos */}
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Bloco" />
              </SelectTrigger>
              <SelectContent>
                {/* Itens do select */}
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {/* Itens do select */}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Morador
          </Button>
        </div>
      </div>

      {/* Tabela responsiva */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Morador</TableHead>
              <TableHead className="hidden sm:table-cell">Unidade</TableHead>
              <TableHead className="hidden md:table-cell">Contato</TableHead>
              <TableHead className="hidden lg:table-cell">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {moradores.map((morador) => (
              <TableRow key={morador.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={morador.avatar} alt={morador.nome} />
                      <AvatarFallback>
                        {morador.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{morador.nome}</span>
                      {/* Informações extras para mobile */}
                      <div className="sm:hidden space-y-1">
                        <span className="text-sm text-muted-foreground">
                          Bloco {morador.unidade.bloco} - Apto {morador.unidade.numero}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {morador.telefone}
                        </span>
                        <Badge variant="outline" className="w-fit">
                          {morador.tipo}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex flex-col">
                    <span>Bloco {morador.unidade.bloco}</span>
                    <span className="text-sm text-muted-foreground">
                      Apto {morador.unidade.numero}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-col">
                    <span>{morador.telefone}</span>
                    <span className="text-sm text-muted-foreground">{morador.email}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Badge variant="outline">
                    {morador.tipo}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <PencilIcon className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}