import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, X } from "lucide-react";

interface StreamResultsBoxProps {
  rows: any[] | null;
  returnedRows?: number;
  totalRows?: number;
  // optional controlled props
  open?: boolean; // when true forces expanded view
  openFull?: boolean; // when true forces full-screen
  onClose?: () => void;
}

export const StreamResultsBox = ({ rows, returnedRows = 0, totalRows = 0, open, openFull, onClose }: StreamResultsBoxProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [collapsed, setCollapsed] = useState(true);
  const [fullScreen, setFullScreen] = useState(false);
  const [showAll, setShowAll] = useState(true);
  const rowsPerPage = 100;

  const columns = useMemo(() => {
    if (!rows || rows.length === 0) return [] as string[];
    return Object.keys(rows[0]);
  }, [rows]);

  if (!rows || rows.length === 0) return null;

  const filtered = rows.filter((r) =>
    Object.values(r).some((v) => String(v).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const startIdx = (currentPage - 1) * rowsPerPage;
  const pageRows = showAll ? filtered : filtered.slice(startIdx, startIdx + rowsPerPage);

  // Collapsed floating badge
  // sync controlled open state from parent: if parent requests open, ensure collapsed=false
  useEffect(() => {
    if (open) setCollapsed(false);
  }, [open]);

  // sync controlled full screen state from parent: if parent requests full screen, open and expand
  useEffect(() => {
    if (openFull) {
      setFullScreen(true);
      setCollapsed(false);
    }
  }, [openFull]);

  const closePanel = () => {
    setCollapsed(true);
    // notify parent if they provided a close handler
    onClose?.();
  };

  if (collapsed) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="sm"
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 shadow-lg"
        >
          <Badge variant="outline">{rows.length}</Badge>
          <span className="hidden sm:inline">Streaming Results</span>
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Expanded floating panel
  const exportRowsToCSV = (rowsToExport: any[], filename = "nlq_stream.csv") => {
    if (!rowsToExport || rowsToExport.length === 0) return;
    const cols = Object.keys(rowsToExport[0]);
    const escape = (v: any) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };
    const header = cols.map((c) => escape(c)).join(",");
    const body = rowsToExport
      .map((r) => cols.map((c) => escape(r[c] ?? "")).join(","))
      .join("\n");
    const csv = header + "\n" + body;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copyVisibleRows = (rowsToCopy: any[]) => {
    if (!rowsToCopy || rowsToCopy.length === 0) return;
    const cols = Object.keys(rowsToCopy[0]);
    const header = cols.join("\t");
    const body = rowsToCopy
      .map((r) => cols.map((c) => String(r[c] ?? "")).join("\t"))
      .join("\n");
    const text = header + "\n" + body;
    navigator.clipboard.writeText(text).catch(() => {
      // ignore copy errors
    });
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${fullScreen ? "inset-0 m-0 w-full h-full" : "w-[min(96vw,900px)] h-[60vh]"}`}>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Streaming Results</CardTitle>
            <p className="text-sm text-muted-foreground">Returned: {returnedRows} / Total: {totalRows}</p>
          </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{rows.length} row{rows.length !== 1 ? "s" : ""}</Badge>
              <Button size="sm" variant="outline" onClick={() => exportRowsToCSV(filtered)}>
                Export CSV
              </Button>
              <Button size="sm" variant="outline" onClick={() => copyVisibleRows(showAll ? filtered : pageRows)}>
                Copy visible
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAll((s) => !s)}>
                {showAll ? "Paginate" : "Show all"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setFullScreen((s) => !s)}>
                {fullScreen ? "Exit" : "Full"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => closePanel()}>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => closePanel()}>
                <X className="h-4 w-4" />
              </Button>
            </div>
        </CardHeader>

        <div className="px-4">
          <Input
            placeholder="Search streamed results..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="mt-2"
          />
        </div>

        <CardContent className="overflow-hidden">
          <div className="rounded-md border border-border h-full">
            <div className="h-full max-h-full overflow-y-auto overflow-x-auto p-2">
              <Table className="min-w-max">
                <TableHeader>
                  <TableRow>
                    {columns.map((c) => (
                      <TableHead key={c} className="font-semibold">
                        {c}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((row, idx) => (
                    <TableRow key={idx}>
                      {columns.map((col) => (
                        <TableCell key={col} className="whitespace-pre">{String(row[col] ?? "")}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {!showAll && totalPages > 1 && (
              <div className="flex items-center justify-between mt-2 p-2">
                <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamResultsBox;
