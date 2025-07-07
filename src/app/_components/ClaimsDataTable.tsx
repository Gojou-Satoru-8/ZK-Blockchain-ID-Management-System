"use client";

// import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/components/ui/table";
import { Checkbox } from "@components/components/ui/checkbox";

type claimsArrayType = ["id", "ethAddress", "name", "age", "roll number", "department", "branch"];
type ClaimsDataTableType = {
  columns: claimsArrayType;
  data: credentialsObjectType;
  disclosureVector: number[];
  setDisclosureVector: React.Dispatch<React.SetStateAction<number[]>>;
};
export function ClaimsDataTable({
  columns,
  data,
  disclosureVector,
  setDisclosureVector,
}: ClaimsDataTableType) {
  console.log("🚀 ~ columns:", columns);
  console.log("🚀 ~ data:", data);

  return (
    <Table className="border my-4">
      <TableHeader>
        <TableRow>
          <TableHead colSpan={columns.length} className="text-center text-2xl">
            Recovered Credentials
          </TableHead>
        </TableRow>
        <TableRow>
          <TableHead align="center" className="text-center">
            Select
          </TableHead>
          <TableHead>Field</TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {columns?.length ? (
          columns.map((claimKey, index) => (
            <TableRow
              key={claimKey}
              onClick={() => {
                console.log(claimKey);
                setDisclosureVector((prevDisclosureVector) => {
                  const newDisclosureVector = [...prevDisclosureVector];
                  newDisclosureVector[index] = newDisclosureVector[index] === 0 ? 1 : 0;
                  return newDisclosureVector;
                });
              }}
            >
              <TableCell>
                <Checkbox
                  checked={disclosureVector.at(index) === 1}
                  // onCheckedChange={(checked) => {
                  //   console.log(claimKey, checked);
                  //   setDisclosureVector((prevDisclosureVector) => {
                  //     const newDisclosureVector = [...prevDisclosureVector];
                  //     newDisclosureVector[index] = checked ? 1 : 0;
                  //     return newDisclosureVector;
                  //   });
                  // }}
                />
              </TableCell>
              <TableHead>
                {" "}
                {claimKey === "id"
                  ? "ID"
                  : claimKey === "ethAddress"
                  ? "Ethereum Address"
                  : claimKey.at(0)?.toUpperCase() + claimKey.slice(1)}
              </TableHead>
              <TableCell align="left">{data?.[claimKey] ? data?.[claimKey] : "N/A"}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
