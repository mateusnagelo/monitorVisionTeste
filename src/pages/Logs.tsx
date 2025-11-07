import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { exportToExcel } from "@/utils/exportToExcel";

// Define a interface para o tipo de dado de um log
interface Log {
  id: number;
  message: string;
  created_at: string;
  ip_address: string;
  user_agent: string;
  username: string | null;
}

const LogsPage = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("https://monitorr.netlify.app/api/logs");
        if (!response.ok) {
          throw new Error("Falha ao buscar os logs.");
        }
        const data = await response.json();
        if (data.success) {
          setLogs(data.logs);
        } else {
          throw new Error(data.error || "Erro desconhecido ao buscar logs.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocorreu um erro.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const handleExport = () => {
    const dataToExport = logs.map(log => ({
      ID: log.id,
      Data: new Date(log.created_at).toLocaleString(),
      Mensagem: log.message,
      'Endereço IP': log.ip_address,
      'User Agent': log.user_agent,
      Username: log.username
    }));
    exportToExcel(dataToExport, 'logs_do_sistema');
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Logs do Sistema</CardTitle>
          <Button onClick={handleExport} disabled={logs.length === 0}>
            Exportar para Excel
          </Button>
        </CardHeader>
        <CardContent>
          {loading && <p>Carregando logs...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Endereço IP</TableHead>
                    <TableHead>User Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.id}</TableCell>
                      <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                      <TableCell>{log.message}</TableCell>
                      <TableCell>
                        {log.ip_address ? (
                          <Tooltip>
                            <TooltipTrigger>
                              <span>{log.ip_address.split(',')[0]}...</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{log.ip_address}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        {log.user_agent ? (
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="truncate max-w-[200px] block">{log.user_agent}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{log.user_agent}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsPage;