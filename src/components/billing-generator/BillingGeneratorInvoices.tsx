
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Printer, 
  Send, 
  Trash2, 
  FileText, 
  Search,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Invoice {
  name: string;
  url: string;
  created_at: string;
  size: number;
  unitInfo: {
    block: string;
    number: string;
  };
}

const BillingGeneratorInvoices = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch invoices from Supabase storage
  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.storage.from('invoices').list('faturas', {
        sortBy: { column: 'created_at', order: 'desc' }
      });

      if (error) {
        throw error;
      }

      // Process the data to extract unit information from filenames
      const processedInvoices = data
        .filter(file => file.name.endsWith('.pdf'))
        .map(file => {
          // Extract unit information from filename (format: BLOCK-NUMBER_DATE.pdf)
          const nameWithoutExtension = file.name.replace('.pdf', '');
          const parts = nameWithoutExtension.split('_');
          const unitPart = parts[0]; // Should be in format BLOCK-NUMBER
          
          // Extract block and number
          const unitMatch = unitPart.match(/([A-Z])-(\d+)/);
          const block = unitMatch ? unitMatch[1] : '?';
          const number = unitMatch ? unitMatch[2] : '?';

          // Get public URL for the file
          const { data: { publicUrl } } = supabase.storage
            .from('invoices')
            .getPublicUrl(`faturas/${file.name}`);

          return {
            name: file.name,
            url: publicUrl,
            created_at: file.created_at || '',
            size: file.metadata?.size || 0,
            unitInfo: {
              block,
              number
            }
          };
        });

      setInvoices(processedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Erro ao buscar faturas",
        description: "Não foi possível carregar as faturas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => 
    invoice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${invoice.unitInfo.block}-${invoice.unitInfo.number}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle invoice download
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle invoice print
  const handlePrint = (url: string) => {
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    }
  };

  // Handle invoice send (mock implementation)
  const handleSend = (invoice: Invoice) => {
    toast({
      title: "E-mail enviado",
      description: `A fatura foi enviada por e-mail para o morador da unidade ${invoice.unitInfo.block}-${invoice.unitInfo.number}.`,
    });
  };

  // Handle invoice deletion
  const handleDelete = async (filename: string) => {
    try {
      const { error } = await supabase.storage
        .from('invoices')
        .remove([`faturas/${filename}`]);

      if (error) {
        throw error;
      }

      // Update the local state
      setInvoices(invoices.filter(invoice => invoice.name !== filename));

      toast({
        title: "Fatura excluída",
        description: "A fatura foi excluída com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Erro ao excluir fatura",
        description: "Não foi possível excluir a fatura. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Format file size for display
  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  // Load invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Faturas Geradas</h2>
        <Button variant="outline" onClick={fetchInvoices} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Atualizar"}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por unidade ou arquivo..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredInvoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.name}>
                    <TableCell className="font-medium">
                      {invoice.unitInfo.block}-{invoice.unitInfo.number}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      <a 
                        href={invoice.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {invoice.name}
                      </a>
                    </TableCell>
                    <TableCell>
                      {invoice.created_at ? 
                        format(new Date(invoice.created_at), 'dd/MM/yyyy HH:mm') : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell>{formatFileSize(invoice.size)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="icon" 
                          variant="outline"
                          onClick={() => handleDownload(invoice.url, invoice.name)}
                          title="Baixar"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline"
                          onClick={() => handlePrint(invoice.url)}
                          title="Imprimir"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline"
                          onClick={() => handleSend(invoice)}
                          title="Enviar por E-mail"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline"
                          onClick={() => handleDelete(invoice.name)}
                          title="Excluir"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <p>Nenhuma fatura encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingGeneratorInvoices;
