import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/components/ui/table";

type AllCredentialsTableProps = {
  columns: claimsArrayType;
  allCredentialsIssued: credentialsObjectType[];
};
const AllCredentialsTable: React.FC<AllCredentialsTableProps> = ({
  columns,
  allCredentialsIssued,
}) => {
  console.log("🚀 ~ credentials:", allCredentialsIssued);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col}>
                {col === "ethAddress"
                  ? "Ethereum Address"
                  : col === "id"
                  ? "ID"
                  : col === "roll number"
                  ? "Roll Number"
                  : col.at(0)?.toUpperCase() + col.slice(1)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {allCredentialsIssued.map((credential) => (
            <TableRow key={credential.id}>
              <TableCell>{credential.id}</TableCell>
              <TableCell>{credential.ethAddress}</TableCell>
              <TableCell>{credential.name}</TableCell>
              <TableCell>{credential.age}</TableCell>
              <TableCell>{credential["roll number"]}</TableCell>
              <TableCell>{credential.department}</TableCell>
              <TableCell>{credential.branch}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AllCredentialsTable;
