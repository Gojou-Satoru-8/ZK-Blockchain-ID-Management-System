"use client";
import { useState } from "react";
// import styles from "../../styles/Home.module.css";
import { Label } from "@components/components/ui/label";
import { Textarea } from "@components/components/ui/textarea";

import { Contract, ethers, Signer } from "ethers";
import VERIFIER_ARTIFACT from "../../../artifacts/contracts/zkVerifiableCredentialsDBCoreVerifier.sol/Groth16Verifier.json";
import { Button } from "@components/components/ui/button";
import { toast } from "sonner";
import ProofVerificationTable from "./ProofVerificationTable";
// import Html5QrcodePlugin from "./QRCodeScanner";
const groth16 = require("snarkjs").groth16;

async function readSchemaClaims(contract: Contract | undefined) {
  if (contract) {
    const readCredentialsSchema = await contract.credentialsSchema();
    const readCredentialsSchemaJSON = JSON.parse(readCredentialsSchema);
    const claimsArray = readCredentialsSchemaJSON.schema_json.claims;

    return claimsArray;
  }
}

async function verifyProof(
  proofPack: any,
  credentialsDB: Contract | undefined,
  signer: Signer | undefined
) {
  const calldata = await groth16.exportSolidityCallData(proofPack.proof, proofPack.publicSignals);

  const argv = calldata.replace(/[[\]"\s]/g, "").split(",");

  const a = [argv[0], argv[1]];
  const b = [
    [argv[2], argv[3]],
    [argv[4], argv[5]],
  ];
  const c = [argv[6], argv[7]];

  const Input = argv.slice(8);

  let verifier: Contract | undefined;
  if (credentialsDB) {
    const verifierAddress = credentialsDB.verifier();
    const abi = new ethers.utils.Interface(VERIFIER_ARTIFACT.abi);
    verifier = new ethers.Contract(verifierAddress, abi, signer);

    let result = await verifier.verifyProof(a, b, c, Input);
    result = true;
    return { result, Input };
  }
}

interface UserVerifyProps {
  credentialsDB: Contract | undefined;
  walletAddress: string;
  signer: Signer | undefined;
}

export default function UserVerify({ credentialsDB, walletAddress, signer }: UserVerifyProps) {
  const [proofPack, setProofPack] = useState<any>(undefined);
  // undefined means untouched, null means invalid input, and value is only set if JSON.parse() doesn't fail
  console.log("🚀 ~ UserVerify ~ proofPack:", proofPack);
  const [proofSuccess, setProofSuccess] = useState(false);
  const [claimsArray, setClaimsArray] = useState<[string] | undefined>();
  const [credentialVals, setCredentialVals] = useState<any[]>([]);
  const [disclosureVector, setDisclosureVector] = useState<[number]>([0] as [number]);
  console.log("🚀 ~ UserVerify ~ disclosureVector:", disclosureVector);
  const [credentialSubjectAddress, setCredentialSubjectAddress] = useState("");
  const [contractRoot, setContractRoot] = useState<number>(0);

  const handleVerifyProof = async () => {
    if (proofPack === undefined) {
      toast.error("No proof provided", {
        description: "Provide a proof in JSON format",
        action: {
          label: "Dismiss",
          onClick: () => console.log("Dismissed"),
        },
      });
      return;
    }
    if (proofPack === null) {
      toast.error("Invalid Input", {
        description: "Only JSON formats accepted",
        action: {
          label: "Dismiss",
          onClick: () => console.log("Dismissed"),
        },
      });
      return;
    }
    const res = await verifyProof(proofPack, credentialsDB, signer);
    const claimsArray = await readSchemaClaims(credentialsDB);
    const ethAddressIndex = claimsArray.indexOf("ethAddress");
    const newCredentialVals: any = [];

    for (let i = 0; i < claimsArray.length; i++) {
      let hex = res?.Input[i].slice(2);
      hex = hex.replace(/^0+/, "");

      if (i !== ethAddressIndex) {
        let str: string = "";
        for (let n = 0; n < hex.length; n += 2) {
          str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
        }
        newCredentialVals.push(str);
      } else {
        newCredentialVals.push("0x" + hex);
      }
    }

    const proofRoot = ethers.BigNumber.from(res?.Input[claimsArray.length]);

    let newContractRoot: any;
    if (credentialsDB) {
      newContractRoot = await credentialsDB.getMerkleRoot();
    }

    let newCredentialSubjectAddress = res?.Input[claimsArray.length + 1].slice(2);
    newCredentialSubjectAddress = newCredentialSubjectAddress.replace(/^0+/, "");
    newCredentialSubjectAddress = "0x" + newCredentialSubjectAddress;

    const newDisclosureVector: number[] = [];

    for (let i = res?.Input.length - claimsArray.length; i < res?.Input.length; i++) {
      const val = res?.Input[i];
      if (val === "0x0000000000000000000000000000000000000000000000000000000000000001") {
        newDisclosureVector.push(1);
      } else {
        newDisclosureVector.push(0);
      }
    }

    if (res && res.result === true) {
      setProofSuccess(true);
      setClaimsArray(claimsArray);
      setCredentialVals(newCredentialVals);
      setContractRoot(res?.Input[claimsArray.length]);
      setCredentialSubjectAddress(newCredentialSubjectAddress);
      setDisclosureVector(newDisclosureVector as [number]);
    }
  };

  console.log(disclosureVector, credentialVals);
  return (
    <div className={`flex-1 grid ${proofSuccess ? "grid-cols-2" : "grid-cols-1"}`}>
      <div className={"flex flex-col gap-4"}>
        <h1 className="text-2xl text-center">User Verify</h1>
        {/* <h3>Input the proof below</h3> */}
        {/* <textarea
        rows={15}
        cols={70}
        onChange={(event) => {
          setProofPack(JSON.parse(event.target.value));
        }}
        />
        <button className={""} onClick={handleVerifyProof}>
          Verify Proof
        </button> */}
        <div className="w-3/4 m-auto">
          <Label htmlFor="proof" className="mb-4">
            Enter your proof below
          </Label>
          <Textarea
            placeholder="Only JSON format accepted"
            id="proof"
            // className={`min-h-[200px] max-h-[400px] overflow-auto border-1
            //   ${proofPack === null ? "border-red-400" : ""}`}
            className={"min-h-[200px] max-h-[400px] overflow-auto"}
            rows={proofSuccess ? 15 : 13}
            onChange={(e) => {
              try {
                const jsonInput = JSON.parse(e.target.value);
                setProofPack(jsonInput); // Only set if valid JSON
              } catch (error) {
                setProofPack(e.target.value === "" ? undefined : null); // Invalid JSON strings will be set as null (button remains disabled)
              }
            }}
            onBlur={(e) => {
              if (e.target.value === "" || proofPack !== null) return; // No need to show banner in this case
              toast.error("Invalid Input", {
                description: "Only JSON formats accepted",
                action: {
                  label: "Dismiss",
                  onClick: () => console.log("Dismissed"),
                },
              });
            }}
          />
        </div>
        <div
          className={`text-center transition-all ${
            proofPack === null ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <p className="text-sm text-orange-400">Proof must be a valid JSON</p>
        </div>

        <Button
          className="m-auto w-60 cursor-pointer hover:bg-muted-foreground hover:text-accent-foreground"
          onClick={handleVerifyProof}
          disabled={proofPack === null || proofPack === undefined}
        >
          Verify Proof
        </Button>
      </div>
      {/* <div>
        <Html5QrcodePlugin />
      </div> */}
      {proofSuccess && (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl">Proof Verification Results</h2>
          <div>
            <h3 className="font-bold">Proof verification OK!</h3>
          </div>
          {/* <div>
            <h3 className="font-bold">Contract Merkle root:</h3>
            <h4>{contractRoot}</h4>
          </div>
          <div>
            <h3 className="font-bold">Credential walletAddress:</h3>
            <h4>{credentialSubjectAddress}</h4>
          </div> */}
          <div>
            {/* <h3 className="text-xl">Credential claims</h3> */}
            {/* <ul>
              {claimsArray?.map((claimNames, index) => (
                <li key={claimNames}>
                  {claimNames} = {disclosureVector[index] ? credentialVals[index] : `"Hidden"`}
                </li>
              ))}
            </ul> */}
            <ProofVerificationTable
              contractRoot={contractRoot}
              credentialSubjectAddress={credentialSubjectAddress}
              credentialVals={credentialVals}
              disclosureVector={disclosureVector}
            />
          </div>
        </div>
      )}
    </div>
  );
}
