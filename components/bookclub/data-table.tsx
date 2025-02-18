"use client";

import { useState } from "react";
import { BookclubData } from "@/types/bookclub";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface DataTableProps {
  data: BookclubData[];
  onSelect: (data: BookclubData | null) => void;
}

export function DataTable({ data, onSelect }: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    {
      id: true,
      season: true,
      month: true,
      people: true,
      title: true,
    }
  );

  // Filter data based on search query
  const filteredData = data.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.people.toLowerCase().includes(searchLower) ||
      item.title.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    { key: "id", label: "ID" },
    { key: "season", label: "Season" },
    { key: "month", label: "Month" },
    { key: "people", label: "People" },
    { key: "title", label: "Title" },
  ];

  return (
    <div className="w-full h-[800px] overflow-auto rounded-md border-black mt-16">
      <div className="sticky top-0 bg-[#FCFADE] p-4 border-b border-black space-y-4">
        {/* Search and Column Toggle */}
        <div className="flex justify-between items-center gap-4">
          <Input
            placeholder="Search by people or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm bg-white"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto bg-white">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  className="capitalize"
                  checked={visibleColumns[column.key]}
                  onCheckedChange={(value) =>
                    setVisibleColumns((prev) => ({
                      ...prev,
                      [column.key]: !!value,
                    }))
                  }
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(
              (column) =>
                visibleColumns[column.key] && (
                  <TableHead key={column.key}>{column.label}</TableHead>
                )
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((item) => (
            <TableRow
              key={item.id}
              className="cursor-pointer"
              onClick={() => onSelect(item)}
            >
              {columns.map(
                (column) =>
                  visibleColumns[column.key] && (
                    <TableCell key={column.key}>
                      {item[column.key as keyof BookclubData]}
                    </TableCell>
                  )
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
