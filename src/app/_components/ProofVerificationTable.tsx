import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/components/ui/table";
import { toast } from "sonner";

const columns = ["id", "ethAddress", "name", "age", "roll number", "department", "branch"];
type ProofVerificationTableType = {
  disclosureVector: number[];
  credentialVals: string[];
  contractRoot: number;
  credentialSubjectAddress: string;
};
const ProofVerificationTable: React.FC<ProofVerificationTableType> = ({
  disclosureVector,
  credentialVals,
  contractRoot,
  credentialSubjectAddress,
}) => {
  return (
    <Table className="border max-w-full">
      <TableHeader>
        <TableRow>
          <TableHead colSpan={columns.length} className="text-center text-2xl">
            Credentials Displayed
          </TableHead>
        </TableRow>
        <TableRow>
          <TableHead className="w-1/3">Field</TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {columns?.length ? (
          columns.map((claimKey, index) => (
            <TableRow key={claimKey}>
              <TableHead>
                {" "}
                {claimKey === "id"
                  ? "ID"
                  : claimKey === "ethAddress"
                  ? "Ethereum Address"
                  : claimKey.at(0)?.toUpperCase() + claimKey.slice(1)}
              </TableHead>
              <TableCell align="left" className="max-w-[100px] overflow-auto">
                {disclosureVector[index] === 1 ? credentialVals[index] : "N/A"}
              </TableCell>
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
      <TableHeader>
        <TableRow>
          <TableHead colSpan={columns.length} className="text-center text-2xl">
            More Information
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableHead>Contract Merkle root</TableHead>
          <TableCell
            className="max-w-[100px] overflow-auto cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(contractRoot.toString());
              toast("Contract root copied to clipboard", {
                action: { label: "OK", onClick: () => {} },
              });
            }}
          >
            {contractRoot}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableHead>Credential Wallet Address</TableHead>
          <TableCell
            className="max-w-[100px] overflow-auto cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(credentialSubjectAddress);
              toast("Credential Wallet Address copied to clipboard", {
                action: { label: "OK", onClick: () => {} },
              });
            }}
          >
            {credentialSubjectAddress}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default ProofVerificationTable;
