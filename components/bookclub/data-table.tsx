"use client";

import { BookclubData } from "@/types/bookclub";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps {
  data: BookclubData[];
  onSelect: (data: BookclubData | null) => void;
}

export function DataTable({ data, onSelect }: DataTableProps) {
  return (
    <div className="w-full h-[800px] overflow-auto rounded-md border bg-white">
      <Table>
        <TableHeader className="sticky top-0 bg-[#FCFADE]">
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Season</TableHead>
            <TableHead>Month</TableHead>
            <TableHead>People</TableHead>
            <TableHead>Title</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              className="cursor-pointer"
              onClick={() => onSelect(item)}
            >
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.season}</TableCell>
              <TableCell>{item.month}</TableCell>
              <TableCell>{item.people}</TableCell>
              <TableCell>{item.title}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
