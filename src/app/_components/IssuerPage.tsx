"use client";
import { useEffect, useState } from "react";
// import styles from "../../styles/Home.module.css";
import { Contract, ethers } from "ethers";
import { encrypt } from "@metamask/eth-sig-util";
import { poseidon } from "circomlibjs";
import { Button } from "@components/components/ui/button";
import { Label } from "@components/components/ui/label";
import { Input } from "@components/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/components/ui/tabs";
import { DrawerDialogDemo, IssuerTable } from "./IssuerDialog";
import CircularSpinner from "./CircularSpinner";
import { toast } from "sonner";
import BackIcon from "./BackIcon";
import { CirclePlus } from "lucide-react";
import AllCredentialsTable from "./AllCredentialsTable";

async function readCredentialsCounter(contract: Contract | undefined) {
  if (contract) {
    const credentialsCounter = await contract.credentialsCounter();
    return credentialsCounter;
  }
}

async function readSchemaClaims(contract: Contract | undefined) {
  if (contract) {
    //get claims array from schema
    const readCredentialsSchema = await contract.credentialsSchema();
    const readCredentialsSchemaJSON = JSON.parse(readCredentialsSchema);
    const claimsArray = readCredentialsSchemaJSON.schema_json.claims;

    return claimsArray;
  }
}

function encryptWithMM(publicKey: string, credential: { claims: { [x: string]: string } }): string {
  const enc = encrypt({
    publicKey: publicKey,
    data: JSON.stringify(credential),
    version: "x25519-xsalsa20-poly1305",
  });

  return JSON.stringify(enc);
}

async function uploadEncryptedCredentialAndLeafToContract(
  encCredential: string,
  contract: Contract | undefined,
  leaf: string
) {
  if (contract) {
    const tx = await contract.saveCredential(encCredential, leaf);
    const txReceip = await tx.wait();
    if (txReceip.status !== 1) {
      alert("error while uploading credential");
      return;
    }
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

function computeLeaf(
  credentialJSON: { claims: { [x: string]: string } },
  claimsArray: claimsArrayType | undefined
) {
  if (credentialJSON.claims.ethAddress) {
    if (claimsArray) {
      const ethAddress = credentialJSON.claims.ethAddress;
      let convertedArrayHex: string[] = [];

      for (let i in claimsArray) {
        if (claimsArray[i] !== "ethAddress") {
          convertedArrayHex.push(ascii_to_hex(credentialJSON.claims[claimsArray[i]]));
        } else {
          convertedArrayHex.push(credentialJSON.claims[claimsArray[i]]);
        }
      }

      // @ts-ignore
      var hashDigest = poseidon([convertedArrayHex[0], convertedArrayHex[1]]);
      if (claimsArray.length > 2) {
        for (let i = 2; i < claimsArray.length; i++) {
          hashDigest = poseidon([hashDigest, convertedArrayHex[i]]);
        }
      }
      const leaf = poseidon([hashDigest, ethAddress]);
      return leaf;
    }
  } else {
    throw "ethAddress not found as atribute in credential JSON";
  }
}

const validateCredentialsJSON = (credentialsJSON: credentialsObjectType) => {
  const errors: { [key in keyof credentialsObjectType]?: string } = {};

  // Basic validations (Missing)
  if (!credentialsJSON.id) errors.id = "Missing ID";
  if (!credentialsJSON.name) errors.name = "Enter the candidate's name";
  if (!credentialsJSON.department) errors.department = "Enter the candidate's department";
  if (!credentialsJSON.branch) errors.branch = "Enter the candidate's branch";

  // Missing + numeric validations
  if (!credentialsJSON.age || Number.parseInt(credentialsJSON.age) < 1)
    errors.age = "Enter an age greater than 0";
  if (!credentialsJSON["roll number"] || Number.parseInt(credentialsJSON["roll number"]) < 1)
    errors["roll number"] = "Enter a roll number greater than 0";
  if (
    !credentialsJSON.ethAddress ||
    credentialsJSON.ethAddress.length !== 42 ||
    !(credentialsJSON.ethAddress.startsWith("0x") || credentialsJSON.ethAddress.startsWith("0X"))
  )
    errors.ethAddress = "Enter a valid Ethereum Address";
  return errors;
};

interface IssuerProps {
  credentialsDB: Contract | undefined;
  walletAddress?: string;
}

const initialCredentialsValue = {
  id: "",
  name: "",
  age: "",
  "roll number": "",
  department: "",
  branch: "",
  ethAddress: "",
};

export default function Issuer({ credentialsDB }: IssuerProps) {
  const [claimsArray, setClaimsArray] = useState<claimsArrayType | undefined>(undefined);
  const [credentialsJSON, setCredentialsJSON] = useState<{
    claims: credentialsObjectType;
  }>({
    claims: initialCredentialsValue,
  });
  console.log("🚀 ~ Issuer ~ credentialsJSON:", credentialsJSON);
  const [formErrors, setFormErrors] = useState<{ [key in keyof credentialsObjectType]?: string }>(
    {}
  );
  console.log("🚀 ~ Issuer ~ formErrors:", formErrors);
  const [credentialsCounter, setCredentialsCounter] = useState<number>(0);
  console.log("🚀 ~ Issuer ~ credentialsCounter:", credentialsCounter);
  const [subjectEthPubKey, setSubjectEthPubKey] = useState<string>("");
  const [issuancePocInit, setIssuancePocInit] = useState<boolean>(false);
  const [step1flag, setStep1flag] = useState<boolean>(false);
  const [step2flag, setStep2flag] = useState<boolean>(false);
  const [step3flag, setStep3flag] = useState<boolean>(false);
  const [step4flag, setStep4flag] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewNewCredentialForm, setViewNewCredentialForm] = useState(false);
  const [allCredentialsIssued, setAllCredentialsIssued] = useState<Array<credentialsObjectType>>(
    []
  );

  const resetFormScreenState = async () => {
    // To be used after successful issuance of Credentials.
    const counter = await readCredentialsCounter(credentialsDB); // Get new credentials count
    setCredentialsCounter(counter);
    setCredentialsJSON({ claims: { ...initialCredentialsValue, id: (counter + 1).toString() } });
    setFormErrors({});
    setOpenDialog(false);
    setSubjectEthPubKey("");
    setIssuancePocInit(false);
    setStep1flag(false);
    setStep2flag(false);
    setStep3flag(false);
    setStep4flag(false);
  };

  const resetDialogFormSubmissionState = () => {
    // To be used in case of Credential Issuance errors on wrong public key.
    // The dialog remains open, only the states inside the dialog are reset.
    setIssuancePocInit(false);
    setStep1flag(false);
    setStep2flag(false);
    setStep3flag(false);
    setStep4flag(false);
  };

  useEffect(() => {
    const initIssuerScreen = async () => {
      const claims = await readSchemaClaims(credentialsDB);
      setClaimsArray(claims);
      const counter = await readCredentialsCounter(credentialsDB);
      setCredentialsCounter(counter);
      setCredentialsJSON((current) => ({
        claims: { ...current.claims, id: (counter + 1).toString() },
      }));
      const allCredentialsString = localStorage.getItem("allCredentials");
      if (allCredentialsString) {
        setAllCredentialsIssued(JSON.parse(allCredentialsString));
      }
    };
    initIssuerScreen();
    // return () => localStorage.removeItem("allCredentials");
  }, []);

  return (
    <div className={"flex-1 flex flex-col gap-4"}>
      <div>
        <h1 className="text-4xl text-center">Issuer Portal</h1>
      </div>
      <Tabs defaultValue="home" className="flex-1 flex flex-col gap-6">
        <TabsList className="mx-auto h-9 gap-0.5">
          {["home", "view"].map((tab) => (
            <TabsTrigger
              key={tab}
              className="cursor-pointer hover:bg-muted-foreground hover:text-accent-foreground px-4 transition-all duration-200"
              value={tab}
            >
              {tab.at(0)?.toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="home" className="flex flex-col">
          {/*ISSUER FORM*/}
          {!viewNewCredentialForm ? (
            <div className="py-8 flex flex-col items-center gap-4">
              <h2 className="text-2xl">Welcome</h2>
              <div>
                <h3 className="text-xl">
                  You are logged in as <strong>Issuer</strong>, as the contract is deployed under
                  the ownership of your address.
                  <br />
                  You may choose to view existing credentials or issue new ones using the button
                  below.
                </h3>
              </div>
              <div className="mt-4">
                <Button
                  size={"lg"}
                  className="cursor-pointer hover:bg-muted-foreground hover:text-accent-foreground"
                  onClick={async () => setViewNewCredentialForm(true)}
                >
                  <CirclePlus />
                  <span>New Credential</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className={""}>
              <div
                className="w-10 flex justify-center align-center rounded-full border-primary border-3 p-1"
                onClick={() => {
                  setViewNewCredentialForm(false);
                  setFormErrors({});
                }}
              >
                <BackIcon className="w-full h-full" />
              </div>
              <form
                onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                  event.preventDefault();
                  // setEnIssueModal(true);
                  const errorsObj = validateCredentialsJSON(credentialsJSON.claims);
                  setFormErrors(errorsObj);
                  if (Object.keys(errorsObj).length > 0) {
                    toast.error("There are errors in your credentials", {
                      description: "Please amend before proceeding",
                      action: { label: "OK", onClick: () => console.log("OK") },
                    });
                    return;
                  }
                  setOpenDialog(true);
                }}
                noValidate
              >
                <div
                  className="gap-4 my-10 grid grid-cols-1 sm:grid-cols-2 justify-center content-center"
                  // style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)" }}
                >
                  {claimsArray?.map((val) => {
                    const inputType = ["id", "age", "roll number"].includes(val)
                      ? "number"
                      : "text";
                    return (
                      <div
                        className={`h-18 ${
                          val === "ethAddress" ? "order-1 sm:col-span-2 w-3/4 m-auto" : ""
                        }`}
                        key={val}
                      >
                        <Label htmlFor={val} className="mb-2">
                          {val === "ethAddress" ? "ETHEREUM ADDRESS" : val.toUpperCase()}{" "}
                          {val === "id" && "(AUTO INCREMENT)"}
                        </Label>
                        <Input
                          name={val}
                          // Set minimum value if input type is number
                          {...(inputType === "number" && { min: 1 })}
                          value={credentialsJSON?.claims[val] || ""}
                          type={inputType}
                          required
                          disabled={val === "id"}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            // const name = event.target.name;
                            // const value = event.target.value;
                            const { name, value } = event.target;
                            let safeValue: string = value;
                            // Sanitizing number values (clearing decimals and handling isNaN case)
                            if (inputType === "number") {
                              const numValue = Number.parseInt(value);
                              if (Number.isNaN(numValue)) safeValue = "";
                              else safeValue = numValue.toString();
                            }
                            // if (!credentialJSON) {
                            //   setCredentialJSON((current) => ({
                            //     claims: {
                            //       [name]: safeValue,
                            //     },
                            //   }));
                            // } else {
                            setFormErrors({});
                            setCredentialsJSON((claims) => ({
                              claims: { ...claims.claims, [name]: safeValue },
                            }));
                            // }
                          }}
                        />
                        <div
                          className={`transition-all ${
                            formErrors[val] ? "opacity-100 visible" : "opacity-0 invisible"
                          }`}
                        >
                          <p className="text-sm text-orange-400">{formErrors[val]}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center">
                  <Button
                    size={"lg"}
                    className="cursor-pointer hover:bg-muted-foreground hover:text-accent-foreground"
                    type="submit"
                  >
                    Issue
                  </Button>
                </div>
              </form>
              <DrawerDialogDemo
                open={openDialog}
                setOpen={setOpenDialog}
                // title="Okay To Proceed?"
                // description="Check credential claims list and enter subject ethereum public key"
                // buttonText="Issue"
                // buttonOnClick={() => {}}
                mainContent={
                  <div className={""}>
                    {!issuancePocInit ? (
                      <div className={""}>
                        {/* <h4>Credential claims list</h4> */}

                        {credentialsJSON && (
                          <IssuerTable
                            columns={claimsArray && claimsArray.length > 0 ? claimsArray : []}
                            data={credentialsJSON.claims}
                          />
                        )}
                        <div className="w-full flex flex-col gap-2 justify-center items-center my-6">
                          <Input
                            placeholder="Enter subject ethereum public key, not address"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                              setSubjectEthPubKey(event.target.value);
                            }}
                          />

                          <Button
                            size={"lg"}
                            className="cursor-pointer hover:bg-muted-foreground hover:text-accent-foreground w-40"
                            onClick={async () => {
                              if (subjectEthPubKey.length !== 44) {
                                toast.error("Invalid Public Key", {
                                  description: "Public key is not of correct size",
                                  action: { onClick: () => console.log("OK"), label: "OK" },
                                });
                                return;
                              }
                              if (credentialsDB && credentialsJSON) {
                                try {
                                  credentialsDB.on("CredentialSavedInRegister", (credentialNo) => {
                                    if (credentialNo === credentialsCounter + 1) {
                                      setStep2flag(true);
                                    }
                                  });

                                  const leaf = computeLeaf(credentialsJSON, claimsArray);

                                  credentialsDB.on("LeafInserted", (eventleaf, root) => {
                                    if (eventleaf.toBigInt() === leaf) {
                                      setStep4flag(true);
                                    }
                                  });

                                  setIssuancePocInit(true);
                                  const enc = encryptWithMM(subjectEthPubKey, credentialsJSON);
                                  setStep1flag(true);

                                  setStep3flag(true);

                                  let print: string | ethers.BigNumber =
                                    ethers.BigNumber.from(leaf);
                                  print = print.toHexString();

                                  await uploadEncryptedCredentialAndLeafToContract(
                                    enc,
                                    credentialsDB,
                                    leaf
                                  );
                                  setAllCredentialsIssued((current) => {
                                    const newArray = [...current, credentialsJSON.claims];
                                    localStorage.setItem(
                                      "allCredentials",
                                      JSON.stringify(newArray)
                                    );
                                    return newArray;
                                  });
                                  toast.success("Credential Issued Successfully", {
                                    action: { label: "Okay", onClick: () => {} },
                                  });
                                  setTimeout(() => {
                                    resetFormScreenState();
                                  }, 3000);
                                } catch (err: unknown) {
                                  console.log(err);
                                  toast.error("Unable to Issue Credential", {
                                    description:
                                      err instanceof Error ? err.message : "Please try again",
                                    action: { onClick: () => console.log("OK"), label: "OK" },
                                  });
                                  // REVERT ALL STATES IF ANY OPERATION FAILS:
                                  resetDialogFormSubmissionState();
                                  return;
                                }
                              }
                            }}
                          >
                            Confirm
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 ">
                        <div className={"flex gap-3"}>
                          <span className="">{step1flag ? "✅" : <CircularSpinner />}</span>
                          <p>Encrypting credential with subject public key</p>
                        </div>
                        <div className={"flex gap-3"}>
                          <span className="">{step2flag ? "✅" : <CircularSpinner />}</span>
                          <p>Uploading encrypted credential to smart contract</p>
                        </div>
                        <div className={"flex gap-3"}>
                          <span className="">{step3flag ? "✅" : <CircularSpinner />}</span>
                          <p>Computing Credentials Merkle Tree leaf</p>
                        </div>
                        <div className={"flex gap-3"}>
                          <span className="">{step4flag ? "✅" : <CircularSpinner />}</span>
                          <p>Uploading leaf to smart contract and computing merkle root</p>
                        </div>
                      </div>
                    )}
                  </div>
                }
              />
            </div>
          )}
        </TabsContent>
        <TabsContent value="view">
          {claimsArray && allCredentialsIssued.length > 0 ? (
            <AllCredentialsTable
              allCredentialsIssued={allCredentialsIssued}
              columns={claimsArray}
            />
          ) : (
            <div className="my-10 flex-col justify-center">
              <p className="text-center text-lg">No Credentials Issued</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
