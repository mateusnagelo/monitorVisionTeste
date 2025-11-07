import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
        // A URL da API precisa ser a URL completa do seu backend no Netlify
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

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Logs do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Carregando logs...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
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
                    <TableCell>{log.ip_address}</TableCell>
                    <TableCell>{log.user_agent}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsPage;