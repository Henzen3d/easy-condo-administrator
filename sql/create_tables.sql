-- Tabela de contas bancárias
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    bank TEXT NOT NULL,
    account_number TEXT NOT NULL,
    agency TEXT NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'investment', 'cash')),
    color TEXT NOT NULL DEFAULT 'blue',
    pix_key TEXT,
    pix_key_type TEXT CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random', NULL)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar e remover o gatilho se ele já existir para bank_accounts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bank_accounts_updated_at') THEN
        DROP TRIGGER update_bank_accounts_updated_at ON public.bank_accounts;
    END IF;
END $$;

-- Criar o gatilho para atualizar o timestamp de updated_at
CREATE TRIGGER update_bank_accounts_updated_at
BEFORE UPDATE ON public.bank_accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Tabela de transações
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    category TEXT NOT NULL,
    account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
    account TEXT NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    unit TEXT,
    payee TEXT,
    to_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
    to_account TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar e remover o gatilho se ele já existir para transactions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_transactions_updated_at') THEN
        DROP TRIGGER update_transactions_updated_at ON public.transactions;
    END IF;
END $$;

-- Criar o gatilho para atualizar o timestamp de updated_at
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Tabela de faturas (invoices)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT NOT NULL UNIQUE,
    reference_month INTEGER NOT NULL CHECK (reference_month BETWEEN 1 AND 12),
    reference_year INTEGER NOT NULL,
    unit_id BIGINT NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    unit TEXT NOT NULL,
    resident TEXT,
    total_amount DECIMAL(15, 2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    payment_date DATE,
    payment_method TEXT CHECK (payment_method IN ('pix', 'bank_transfer', 'credit_card', 'debit_card', 'cash', 'check', NULL)),
    payment_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar e remover o gatilho se ele já existir para invoices
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_invoices_updated_at') THEN
        DROP TRIGGER update_invoices_updated_at ON public.invoices;
    END IF;
END $$;

-- Criar o gatilho para atualizar o timestamp de updated_at
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Tabela de itens da fatura
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    billing_id BIGINT REFERENCES public.billings(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verificar e remover o gatilho se ele já existir para invoice_items
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_invoice_items_updated_at') THEN
        DROP TRIGGER update_invoice_items_updated_at ON public.invoice_items;
    END IF;
END $$;

-- Criar o gatilho para atualizar o timestamp de updated_at
CREATE TRIGGER update_invoice_items_updated_at
BEFORE UPDATE ON public.invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar o saldo da conta quando uma transação é criada
CREATE OR REPLACE FUNCTION update_account_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Para transações de entrada (income)
    IF NEW.type = 'income' THEN
        UPDATE public.bank_accounts
        SET balance = balance + NEW.amount
        WHERE id = NEW.account_id;
    
    -- Para transações de saída (expense)
    ELSIF NEW.type = 'expense' THEN
        UPDATE public.bank_accounts
        SET balance = balance - NEW.amount
        WHERE id = NEW.account_id;
    
    -- Para transferências
    ELSIF NEW.type = 'transfer' AND NEW.to_account_id IS NOT NULL THEN
        -- Reduz o saldo da conta de origem
        UPDATE public.bank_accounts
        SET balance = balance - NEW.amount
        WHERE id = NEW.account_id;
        
        -- Aumenta o saldo da conta de destino
        UPDATE public.bank_accounts
        SET balance = balance + NEW.amount
        WHERE id = NEW.to_account_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar e remover o gatilho se ele já existir para update_balance_on_transaction_insert
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_balance_on_transaction_insert') THEN
        DROP TRIGGER update_balance_on_transaction_insert ON public.transactions;
    END IF;
END $$;

-- Criar o gatilho para atualizar o saldo da conta quando uma transação é criada
CREATE TRIGGER update_balance_on_transaction_insert
AFTER INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance_on_transaction();

-- Função para atualizar o saldo da conta quando uma transação é atualizada
CREATE OR REPLACE FUNCTION update_account_balance_on_transaction_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o tipo de transação mudou ou o valor mudou
    IF OLD.type <> NEW.type OR OLD.amount <> NEW.amount OR OLD.account_id <> NEW.account_id OR OLD.to_account_id <> NEW.to_account_id THEN
        -- Reverter a transação antiga
        IF OLD.type = 'income' THEN
            UPDATE public.bank_accounts
            SET balance = balance - OLD.amount
            WHERE id = OLD.account_id;
        ELSIF OLD.type = 'expense' THEN
            UPDATE public.bank_accounts
            SET balance = balance + OLD.amount
            WHERE id = OLD.account_id;
        ELSIF OLD.type = 'transfer' AND OLD.to_account_id IS NOT NULL THEN
            UPDATE public.bank_accounts
            SET balance = balance + OLD.amount
            WHERE id = OLD.account_id;
            
            UPDATE public.bank_accounts
            SET balance = balance - OLD.amount
            WHERE id = OLD.to_account_id;
        END IF;
        
        -- Aplicar a nova transação
        IF NEW.type = 'income' THEN
            UPDATE public.bank_accounts
            SET balance = balance + NEW.amount
            WHERE id = NEW.account_id;
        ELSIF NEW.type = 'expense' THEN
            UPDATE public.bank_accounts
            SET balance = balance - NEW.amount
            WHERE id = NEW.account_id;
        ELSIF NEW.type = 'transfer' AND NEW.to_account_id IS NOT NULL THEN
            UPDATE public.bank_accounts
            SET balance = balance - NEW.amount
            WHERE id = NEW.account_id;
            
            UPDATE public.bank_accounts
            SET balance = balance + NEW.amount
            WHERE id = NEW.to_account_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar e remover o gatilho se ele já existir para update_balance_on_transaction_update
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_balance_on_transaction_update') THEN
        DROP TRIGGER update_balance_on_transaction_update ON public.transactions;
    END IF;
END $$;

-- Criar o gatilho para atualizar o saldo da conta quando uma transação é atualizada
CREATE TRIGGER update_balance_on_transaction_update
AFTER UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance_on_transaction_update();

-- Função para reverter o saldo da conta quando uma transação é excluída
CREATE OR REPLACE FUNCTION revert_account_balance_on_transaction_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Reverter a transação
    IF OLD.type = 'income' THEN
        UPDATE public.bank_accounts
        SET balance = balance - OLD.amount
        WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
        UPDATE public.bank_accounts
        SET balance = balance + OLD.amount
        WHERE id = OLD.account_id;
    ELSIF OLD.type = 'transfer' AND OLD.to_account_id IS NOT NULL THEN
        UPDATE public.bank_accounts
        SET balance = balance + OLD.amount
        WHERE id = OLD.account_id;
        
        UPDATE public.bank_accounts
        SET balance = balance - OLD.amount
        WHERE id = OLD.to_account_id;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Verificar e remover o gatilho se ele já existir para revert_balance_on_transaction_delete
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'revert_balance_on_transaction_delete') THEN
        DROP TRIGGER revert_balance_on_transaction_delete ON public.transactions;
    END IF;
END $$;

-- Criar o gatilho para reverter o saldo da conta quando uma transação é excluída
CREATE TRIGGER revert_balance_on_transaction_delete
AFTER DELETE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION revert_account_balance_on_transaction_delete();

-- Função para atualizar o status das faturas vencidas
CREATE OR REPLACE FUNCTION update_overdue_invoices()
RETURNS void AS $$
BEGIN
    UPDATE public.invoices
    SET status = 'overdue'
    WHERE status = 'pending' AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Criar uma função que será chamada por um job agendado para atualizar faturas vencidas diariamente
SELECT cron.schedule(
    'update-overdue-invoices',
    '0 0 * * *',  -- Executa todos os dias à meia-noite
    $$SELECT update_overdue_invoices()$$
);