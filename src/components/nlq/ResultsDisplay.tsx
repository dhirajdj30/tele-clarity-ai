import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { StreamEvent } from "@/lib/nlqApi";
import { CheckCircle, XCircle, Loader2, Code } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ResultsDisplayProps {
  currentEvent: StreamEvent | null;
  isQuerying: boolean;
}

export const ResultsDisplay = ({ currentEvent, isQuerying }: ResultsDisplayProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  if (!currentEvent && !isQuerying) return null;

  const renderContent = () => {
    if (isQuerying && (!currentEvent || currentEvent.type === "status")) {
      return (
        <Alert className="bg-info/10 border-info/20">
          <Loader2 className="h-4 w-4 animate-spin text-info" />
          <AlertDescription className="text-info">
            {currentEvent?.message || "Processing your query..."}
          </AlertDescription>
        </Alert>
      );
    }

    if (currentEvent?.type === "sql") {
      return (
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Generated SQL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-sm font-mono">
              {currentEvent.data}
            </pre>
          </CardContent>
        </Card>
      );
    }

    if (currentEvent?.type === "result" && currentEvent.data) {
      const data = currentEvent.data;
      
      if (Array.isArray(data) && data.length > 0) {
        const columns = Object.keys(data[0]);
        
        // Filter data based on search
        const filteredData = data.filter((row) =>
          Object.values(row).some((value) =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          )
        );

        // Paginate
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        const startIdx = (currentPage - 1) * rowsPerPage;
        const paginatedData = filteredData.slice(startIdx, startIdx + rowsPerPage);

        return (
          <Card className="bg-card border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Query Results</CardTitle>
                <Badge variant="outline">
                  {filteredData.length} row{filteredData.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <Input
                placeholder="Search results..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="mt-2"
              />
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((col) => (
                        <TableHead key={col} className="font-semibold">
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((row, idx) => (
                      <TableRow key={idx}>
                        {columns.map((col) => (
                          <TableCell key={col}>{String(row[col])}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      }
    }

    if (currentEvent?.type === "complete") {
      return (
        <Alert className="bg-success/10 border-success/20">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            Query completed successfully in {currentEvent.execution_time?.toFixed(2)}s
          </AlertDescription>
        </Alert>
      );
    }

    if (currentEvent?.type === "error") {
      return (
        <Alert className="bg-destructive/10 border-destructive/20">
          <XCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            {currentEvent.message || "An error occurred"}
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  return <div className="space-y-4 mb-6">{renderContent()}</div>;
};
