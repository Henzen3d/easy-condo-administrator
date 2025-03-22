import React, { useState, useEffect, useMemo } from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ChevronsUpDown } from "lucide-react"
import { useBankAccounts } from "@/contexts/BankAccountContext"

interface BankSelectProps {
  selectedBank: string
  onBankChange: (bankCode: string) => void
  placeholder?: string
  className?: string
}

export function BankSelect({
  selectedBank,
  onBankChange,
  placeholder = "Selecione o banco",
  className = "",
}: BankSelectProps) {
  const [open, setOpen] = useState(false)
  const [banks, setBanks] = useState<{ code: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const { fetchBanks } = useBankAccounts()

  // Fetch banks on component mount
  useEffect(() => {
    async function loadBanks() {
      try {
        setLoading(true)
        const banksList = await fetchBanks()
        setBanks(banksList)
      } catch (error) {
        console.error('Erro ao carregar bancos:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadBanks()
  }, [fetchBanks])

  // Filter banks based on search input
  const filteredBanks = useMemo(() => {
    if (!searchValue) return banks
    
    return banks.filter((bank) => {
      const searchLower = searchValue.toLowerCase()
      return (
        bank.code.toLowerCase().includes(searchLower) ||
        bank.name.toLowerCase().includes(searchLower)
      )
    })
  }, [banks, searchValue])

  // Format bank option for display
  const formatBankOption = (bank: { code: string; name: string } | string): string => {
    if (typeof bank === 'object') {
      return `${bank.code} - ${bank.name}`
    }
    return bank
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${className}`}
        >
          {selectedBank
            ? formatBankOption(banks.find(b => b.code === selectedBank) || selectedBank)
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar banco..."
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-9"
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>Nenhum banco encontrado.</CommandEmpty>
            <CommandGroup>
              {loading ? (
                <CommandItem disabled>Carregando bancos...</CommandItem>
              ) : (
                filteredBanks.map((bank) => (
                  <CommandItem
                    key={bank.code}
                    value={bank.code}
                    onSelect={(value) => {
                      onBankChange(value)
                      setOpen(false)
                      setSearchValue("")
                    }}
                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  >
                    {formatBankOption(bank)}
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 