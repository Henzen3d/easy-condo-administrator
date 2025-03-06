
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

// Get month name in Portuguese
export const getMonthName = (month: number): string => {
  const date = new Date();
  date.setMonth(month);
  return format(date, 'LLLL', { locale: pt }).toUpperCase();
};

// Format currency as Brazilian Real
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
};
