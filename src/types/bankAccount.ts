export const ACCOUNT_TYPES = {
  CHECKING: 'Corrente',
  SAVINGS: 'Poupança'
} as const;

export type AccountType = typeof ACCOUNT_TYPES[keyof typeof ACCOUNT_TYPES];

export interface BankAccount {
  id: string;
  nome: string;
  banco: string;
  agencia: string;
  conta: string;
  tipo: AccountType;
  saldo: number;
  cor: string;
  chave_pix?: string | null;
  tipo_chave_pix?: string | null;
}