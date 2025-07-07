"use client";
import { useState } from "react";
import Image from "next/image";
// import styles from "../../styles/Home.module.css";
import { Contract, ethers } from "ethers";
import { poseidon } from "circomlibjs";
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
import { Button } from "@components/components/ui/button";
import { Input } from "@components/components/ui/input";
import { toast } from "sonner";
// import { Textarea } from "@components/components/ui/textarea";
import { CheckIcon, CopyIcon } from "lucide-react";
import { ClaimsDataTable } from "./ClaimsDataTable";
import { Popover, PopoverContent, PopoverTrigger } from "@components/components/ui/popover";
import QRCode from "qrcode";

import LogoImage from "../../../public/NavLogo.png";
import Link from "next/link";
const groth16 = require("snarkjs").groth16;

async function downloadEncryptedCredentialFromContract(
  index: number,
  contract: Contract | undefined
) {
  if (contract) {
    const encCredential = await contract.viewArray(index);
    return encCredential;
  }
}

function ascii_to_hex(str: string) {
  var arr1 = ["0x"];
  for (var n = 0, l = str.length; n < l; n++) {
    var hex = Number(str.charCodeAt(n)).toString(16);
    arr1.push(hex);
  }
  return arr1.join("");
}

async function decryptionWithMM(walletAddress: string, encCredential: string) {
  if (window.ethereum) {
    const dataHexLike = `0x${Buffer.from(encCredential, "utf-8").toString("hex")}`;

    const decrypt = await window.ethereum.request!({
      method: "eth_decrypt",
      params: [dataHexLike, walletAddress],
    });
    return decrypt;
  }
}

async function readSchemaClaims(contract: Contract | undefined) {
  if (contract) {
    const readCredentialsSchema = await contract.credentialsSchema();
    const readCredentialsSchemaJSON = JSON.parse(readCredentialsSchema);
    const claimsArray = readCredentialsSchemaJSON.schema_json.claims;

    return claimsArray;
  }
}

async function generateMerkleProof(contract: Contract | undefined, credentialNumber: number) {
  if (contract) {
    const depth = await contract.TREE_DEPTH();
    const leavesArray = await contract.getLeavesArray();

    const tree = new IncrementalMerkleTree(poseidon, depth, BigInt(0), 2);
    leavesArray.forEach((element: ethers.BigNumber) => {
      tree.insert(element.toBigInt());
    });

    const proof = tree.createProof(credentialNumber - 1);

    return proof;
  }
}

async function generateZKProof(
  credentialJSON: {
    claims: credentialsObjectType;
  },
  claimsArray: claimsArrayType | undefined,
  merkleProof: any,
  disclosureVector: number[]
) {
  console.log("GenerateZKProof: ", credentialJSON);
  console.log("disclosure vector: ", disclosureVector);
  console.log("merkle proof: ", merkleProof);
  console.log("Claims Array:", claimsArray);

  const ethAddress = credentialJSON.claims.ethAddress;
  let convertedArrayHex: string[] = [];
  if (claimsArray) {
    for (let i in claimsArray) {
      if (claimsArray[i] !== "ethAddress") {
        convertedArrayHex.push(ascii_to_hex(credentialJSON.claims[claimsArray[i]]));
      } else {
        convertedArrayHex.push(credentialJSON.claims[claimsArray[i]]);
      }
    }
  }
  var siblings = merkleProof.siblings.map((val: any) => {
    var value = ethers.BigNumber.from(val[0]);
    return value.toHexString();
  });

  var root: any = ethers.BigNumber.from(merkleProof.root);
  root = root.toHexString();

  const inputs = {
    ClaimsVals: convertedArrayHex,
    MerkleProofSiblings: siblings,
    MerkleProofPathIndices: merkleProof.pathIndices,
    MerkleProofRoot: root,
    EthAddress: ethAddress,
    DisclosureVector: disclosureVector,
  };

  const { proof, publicSignals } = await groth16.fullProve(
    inputs,
    "zkVerifiableCredentialsDBCore.wasm",
    "circuit_final.zkey"
  );

  return { proof, publicSignals };
}

let proofCopyTimeout: NodeJS.Timeout;

export default function UserProof({
  credentialsDB,
  walletAddress,
}: {
  credentialsDB: Contract | undefined;
  walletAddress: string;
}) {
  const [credentialNumber, setCredentialNumber] = useState<number>(NaN);
  // const qrCodeRef = useRef<React.ReactNode>(null);
  const [claimsArray, setClaimsArray] = useState<claimsArrayType | undefined>();
  const [credentialsJSON, setCredentialsJSON] = useState<{
    claims: credentialsObjectType;
  }>();
  const [disclosureVector, setDisclosureVector] = useState<number[]>([0]);
  const [proof, setProof] = useState<any>(undefined);
  const [isProofCopied, setIsProofCopied] = useState<boolean>(false);
  const [qrCodeDataURL, setQRCodeDataURL] = useState("");
  console.log("🚀 ~ UserProof - disclosureVector:", disclosureVector);
  console.log("🚀 ~ UserProof - LogoImage:", LogoImage);
  console.log("🚀 ~ qrCodeDataURL:", qrCodeDataURL);

  // useEffect(() => {
  //   console.log("QR Code:", qrCodeRef);
  // });

  return (
    <div className={"flex-1 flex flex-col gap-6"}>
      <div className="flex flex-col sm:flex-row justify-center gap-8">
        <div className={`flex flex-col gap-3`}>
          <h2 className="text-2xl text-center">
            Recover {credentialsJSON ? "another" : "your"} credential
          </h2>
          <div className="mx-auto mt-4">
            <Input
              type="number"
              min={1}
              placeholder="Your ID here"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const val = Number.parseInt(event.target.value);
                setCredentialNumber(val); // When event.target.value is nothing, val will be NaN
                // But NaN can't be directly assigned so to controlled value prop, so we have ternary here
              }}
              value={Number.isNaN(credentialNumber) ? "" : credentialNumber}
              // onBlur={(e) => {
              //   // if (Number.parseInt(e.target.value) < 1)
              //   if (credentialNumber < 1) toast.error("Credential ID must be a natural number");
              // }}
            />
            <div
              className={`mt-2 text-center transition-all ${
                credentialNumber < 1 ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
            >
              <p className="text-sm text-orange-400">Credential ID must be a natural number</p>
            </div>
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button
              className="cursor-pointer hover:bg-muted-foreground hover:text-accent-foreground w-40"
              size={"lg"}
              disabled={credentialNumber < 1 || Number.isNaN(credentialNumber)}
              onClick={async () => {
                try {
                  if (Number.isNaN(credentialNumber) || credentialNumber < 1)
                    // This check is just for typescript as value may be null
                    throw new Error("Invalid Credential ID");
                  const claimsArray = await readSchemaClaims(credentialsDB);
                  const enc = await downloadEncryptedCredentialFromContract(
                    credentialNumber - 1,
                    credentialsDB
                  );
                  const credential = await decryptionWithMM(walletAddress, enc);
                  const credentialJSON = JSON.parse(credential);

                  console.log("CredentialsJSON", credentialJSON);
                  console.log("claimsArray", claimsArray);

                  const disclosureVector = claimsArray.map(() => 0);
                  setProof(undefined);
                  setClaimsArray(claimsArray);
                  setCredentialsJSON(credentialJSON);
                  setDisclosureVector(disclosureVector);
                  setQRCodeDataURL("");
                } catch (e) {
                  console.log(e);
                  toast.error("Invalid Input", {
                    description: "Please enter your credential only",
                    action: {
                      label: "Dismiss",
                      onClick: () => console.log("Dismissed"),
                    },
                  });
                }
              }}
            >
              Recover
            </Button>
            {/* <Button
          className="cursor-pointer hover:bg-muted-foreground hover:text-accent-foreground w-40"
          variant={"outline"}
          size={"lg"}
          onClick={() => {
            toast.info("Use your Credential ID to recover your data.", {
              action: {
                label: "OK",
                onClick: () => console.log("OK"),
              },
            });
            return;
          }}
        >
          Hint
        </Button> */}
            {!credentialsJSON && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="cursor-pointer hover:bg-muted-foreground hover:text-accent-foreground w-40"
                  >
                    Hint
                  </Button>
                </PopoverTrigger>
                <PopoverContent>Use your Credential ID to recover your data.</PopoverContent>
              </Popover>
            )}
          </div>
        </div>
        {proof && qrCodeDataURL && (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-50 aspect-square relative">
              <Image src={qrCodeDataURL} alt="QR Code" fill />
            </div>
            <Link href={qrCodeDataURL} download={`qr_zk_id_${credentialsJSON?.claims.ethAddress}`}>
              <Button className="cursor-pointer hover:bg-muted-foreground hover:text-accent-foreground">
                Download
              </Button>
            </Link>
          </div>
        )}
      </div>
      {proof ? (
        <div className="border rounded-lg p-2 text-left">
          {/* <textarea rows={15} cols={100}>
            {proof}
          </textarea> */}
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              fontFamily: "monospace",
              fontSize: "0.9rem", // optional for readability
            }}
          >
            {proof}
          </pre>
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="cursor-pointer"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(proof);
                setIsProofCopied(true);
                toast("Proof copied to clipboard", {
                  action: { label: "OK", onClick: () => {} },
                });
                clearTimeout(proofCopyTimeout); // Clear existing timeout before setting new
                proofCopyTimeout = setTimeout(() => {
                  setIsProofCopied(false);
                }, 10000);
              }}
            >
              {isProofCopied ? <CheckIcon /> : <CopyIcon />}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {credentialsJSON && claimsArray && (
            <div>
              {/* <h3 className="text-2xl">Recovered credential</h3> */}
              {/* <ul>
            {claimsArray.map((claimNames) => {
              return (
                <li key={claimNames}>
                  {claimNames} = {credentialJSON.claims[claimNames]}
                </li>
              );
            })}
          </ul>
          <h3>Selective disclosure selection</h3>
          <div className={""}>
            {claimsArray.map((claimNames, index) => {
              return (
                <div key={claimNames} className={""}>
                  <p>{claimNames.toUpperCase()}</p>{" "}
                  <input
                    type="checkbox"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      const newDisclosureVector = [...disclosureVector];
                      newDisclosureVector[index] = event.target.checked ? 1 : 0;
                      setDisclosureVector(newDisclosureVector as [number]);
                    }}
                  />
                </div>
              );
            })}
          </div> */}
              <ClaimsDataTable
                columns={claimsArray}
                data={credentialsJSON.claims}
                disclosureVector={disclosureVector}
                setDisclosureVector={setDisclosureVector}
              />
              <div className="flex justify-center items-center">
                <Button
                  className={
                    "basis-44 cursor-pointer hover:bg-muted-foreground hover:text-accent-foreground"
                  }
                  onClick={async () => {
                    // This check is just for typescript as value may be null
                    if (credentialNumber === null || credentialNumber < 0) return;
                    if (disclosureVector.every((val) => val === 0)) {
                      toast.error("Please select any field to be included", {
                        // description: "Only JSON formats accepted",
                        action: {
                          label: "Dismiss",
                          onClick: () => console.log("Dismissed"),
                        },
                      });
                      return;
                    }

                    const merkleProof = await generateMerkleProof(credentialsDB, credentialNumber);
                    console.log("🚀 ~ onClick ~ merkleProof:", merkleProof);
                    try {
                      const { proof, publicSignals } = await generateZKProof(
                        credentialsJSON,
                        claimsArray,
                        merkleProof,
                        disclosureVector
                      );

                      const proofPack = {
                        proof: proof,
                        publicSignals: publicSignals,
                      };

                      const newProof = JSON.stringify(proofPack);
                      setProof(newProof);
                      const qrCodeURL = await QRCode.toDataURL(newProof);
                      setQRCodeDataURL(qrCodeURL);
                    } catch (err) {
                      console.log(err);
                    }
                  }}
                >
                  Generate proof
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
