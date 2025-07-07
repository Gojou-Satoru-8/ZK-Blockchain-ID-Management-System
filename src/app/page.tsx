"use client";
import type { NextPage } from "next";
import { useState, use, useEffect, useRef } from "react";
import { Contract, ethers, Signer } from "ethers";
// import styles from "../styles/Home.module.css";
import { Web3Provider } from "@ethersproject/providers";
import CREDENTIAL_DB_ARTIFACT from "../../artifacts/contracts/CredentialsDB.sol/CredentialsDB.json";
import Issuer from "@app/_components/IssuerPage";
import UserProof from "@app/_components/UserProof";
import UserVerify from "@app/_components/UserVerify";
import { ThemeContext, ThemeType } from "../context/ThemeContext";
import Image from "next/image";
import NavLogo from "../../public/NavLogo.png";
// import AccountIcon from "../../public/AccountIcon.png";
// import DarkModeIcon from "../../public/DarkModeIcon.png";
// import LightModeIcon from "../../public/LightModeIcon.png";
// import SystemThemeIcon from "../../public/SystemThemeIcon.png";
import {
  LaptopMinimal,
  MoonIcon,
  SunIcon,
  CircleUserIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";
import BackIcon from "@app/_components/BackIcon";
import { Button } from "@components/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuRadioGroup,
  // DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@components/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/components/ui/tabs";

import { toast } from "sonner";
import Link from "next/link";
// import Waves from "@app/_components/Waves";

let publicKeyTimeout: NodeJS.Timeout;
let publicKeyCopyTimeout: NodeJS.Timeout;

const Home: NextPage = () => {
  const themeContext = use(ThemeContext);
  const CREDENTIALS_DB_ADDRESS = process.env.NEXT_PUBLIC_CREDENTIALS_DB_ADDRESS;

  const [walletAddress, setWalletAddress] = useState("");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [walletPublicKey, setWalletPublicKey] = useState("");
  const [provider, setProvider] = useState<Web3Provider | undefined>(undefined);
  const [signer, setSigner] = useState<Signer | undefined>(undefined);
  const [credentialsDB, setCredentialsDB] = useState<Contract | undefined>(undefined);
  const [isIssuer, setIsIssuer] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [userSelection, setUserSelection] = useState("default");
  const [isPubKeyCopied, setIsPubKeyCopied] = useState(false);

  async function requestAccounts() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request!({
          method: "eth_requestAccounts",
        });
        console.log("🚀 ~ requestAccount ~ accounts:", accounts);

        // setWalletAddress(accounts[0]);
        // setAccounts(accounts);
        return accounts;
      } catch (e) {
        console.log(e);
        toast("Failed to load accounts", {
          description: "Please log into your metamask account",
          action: {
            label: "OK",
            onClick: () => console.log("OK"),
          },
        });
        return [];
      }
    } else {
      console.log("metamask not found");
      return [];
    }
  }

  async function connectAccount() {
    if (window.ethereum === undefined) {
      toast(
        <div>
          <h3 className="text-[15px] font-semibold">You don't have Metamask installed</h3>
          <p>
            Please install the metamask extension from{" "}
            <Link
              href="https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en"
              className="underline"
            >
              Chrome Webstore
            </Link>
          </p>
        </div>,
        { action: { label: "OK", onClick: () => {} } }
      );
      return;
    }

    const accounts = await requestAccounts();
    if (accounts.length === 0) {
      toast("Metamask is locked", {
        description: "Please log into your metamask account",
        action: {
          label: "OK",
          onClick: () => console.log("OK"),
        },
      });
      return;
    }
    setWalletAddress(accounts[0]);
    setAccounts(accounts);
  }

  async function getPubKeyFromMM(walletAddress: string) {
    if (window.ethereum) {
      try {
        const keyB64 = (await window.ethereum.request!({
          method: "eth_getEncryptionPublicKey",
          params: [walletAddress],
        })) as string;
        return keyB64;
      } catch (e) {
        console.log(e);
        toast.error("Failed to retrieve public key", {
          action: { label: "Dismiss", onClick: () => console.log("Dismissed") },
        });
        return;
      }
    }
  }

  const resetAppStateWithNewAccounts = (accounts: string[]) => {
    setAccounts(accounts);
    setWalletAddress(accounts[0] ? accounts[0] : "");
    setWalletPublicKey("");
    setWalletConnected(false);
    setUserSelection("default");
    setIsIssuer(false);
  };

  // On app load:
  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log("🚀 ~ useEffect ~ provider:", provider);
      setProvider(provider);
    }

    // IF Credentials DB address wasn't picked correctly from .env
    if (!CREDENTIALS_DB_ADDRESS || CREDENTIALS_DB_ADDRESS.length < 42)
      toast.error("Missing or Incorrect Credentials Contract Address");
  }, []);

  // Reacts to Account Change:
  useEffect(() => {
    const configureAccountOnChange = async () => {
      if (!CREDENTIALS_DB_ADDRESS) return;
      if (!provider) return;
      const signer = provider.getSigner();
      console.log("🚀 ~ configureAccountOnChange ~ signer:", signer);

      setSigner(signer);

      if (provider) {
        const abi = new ethers.utils.Interface(CREDENTIAL_DB_ARTIFACT.abi);
        console.log("🚀 ~ configureAccountOnChange ~ abi:", abi);

        const creDB = new ethers.Contract(CREDENTIALS_DB_ADDRESS, abi, signer);
        console.log("🚀 ~ configureAccountOnChange ~ creDB:", creDB);

        setCredentialsDB(creDB);

        const sigAdd = await signer.getAddress();
        const owner = await creDB.owner();
        console.log("🚀 ~ configureAccountOnChange ~ sigAdd | owner:", sigAdd, " | ", owner);

        if (owner == sigAdd) {
          setIsIssuer(true);
        } else setIsIssuer(false);

        setWalletPublicKey("");
        setWalletConnected(true);
      } else
        toast("Provider not found", {
          description: "Ensure Metamask is installed",
          action: { label: "OK", onClick: () => {} },
        });
    };
    configureAccountOnChange();
  }, [accounts, walletAddress]);

  useEffect(() => {
    if (!window.ethereum) return;
    (window.ethereum as any).on("accountsChanged", (accounts: string[]) => {
      // Handle account change here
      console.log("Accounts changed:", accounts);

      resetAppStateWithNewAccounts(accounts);
    });
  });

  useEffect(() => {
    // First clear any existing timeout (although unnecessary in this case cuz new timeout can only be
    // started by triggering Get Public Key button, but that is disabled when Public Key is shown)
    clearTimeout(publicKeyTimeout);
    // Then start a new timeout
    publicKeyTimeout = setTimeout(() => {
      setWalletPublicKey("");
      setIsPubKeyCopied(false);
    }, 20000);

    return () => clearTimeout(publicKeyTimeout);
  }, [walletPublicKey]);

  const ThemeIcon =
    themeContext.theme === "system"
      ? LaptopMinimal
      : themeContext.theme === "dark"
      ? MoonIcon
      : SunIcon;

  const NonIssuerContents = {
    prove: <UserProof walletAddress={walletAddress} credentialsDB={credentialsDB} />,
    verify: (
      <UserVerify
        walletAddress={walletAddress}
        credentialsDB={credentialsDB}
        signer={signer}
      ></UserVerify>
    ),
    // getPubAdd: (
    //   <div>
    //     <h4>Your public key: {walletPublicKey}</h4>
    //   </div>
    // ),
    home: (
      <div className="flex-1 flex flex-col justify-center items-center gap-10">
        <h1 className="text-3xl">What you want to do?</h1>
        <Button
          className="cursor-pointer hover:bg-muted-foreground hover:text-accent-foreground"
          size={"lg"}
          disabled={walletPublicKey !== ""}
          onClick={async () => {
            // setUserSelection("getPubAdd");
            const pubKey = await getPubKeyFromMM(walletAddress);
            if (pubKey) {
              setWalletPublicKey(pubKey);
            }
          }}
        >
          Get your public key
        </Button>
        <div
          className={`flex gap-4 justify-center items-center transition-all duration-500 ${
            walletPublicKey === "" ? "invisible opacity-0" : "visible opacity-100"
          }`}
        >
          <code>{walletPublicKey}</code>
          <Button
            variant="outline"
            className="cursor-pointer"
            size="icon"
            onClick={() => {
              navigator.clipboard.writeText(walletPublicKey);
              setIsPubKeyCopied(true);
              toast("Public Key copied to clipboard", {
                action: { label: "OK", onClick: () => {} },
              });
              clearTimeout(publicKeyCopyTimeout); // Clear existing timeout before setting new
              publicKeyCopyTimeout = setTimeout(() => {
                setIsPubKeyCopied(false);
              }, 10000);
            }}
          >
            {isPubKeyCopied ? <CheckIcon /> : <CopyIcon />}
          </Button>
        </div>
        {/* <div className="flex flex-wrap gap-6 justify-center items-baseline">
          <Button
            className="cursor-pointer hover:bg-muted-foreground hover:text-accent-foreground"
            size={"lg"}
            onClick={() => {
              setWalletPublicKey("");
              setUserSelection("proove");
            }}
          >
            Prove your credential
          </Button>
          <Button
            className="cursor-pointer hover:bg-muted-foreground hover:text-accent-foreground"
            size={"lg"}
            onClick={() => {
              setWalletPublicKey("");
              setUserSelection("verify");
            }}
          >
            Verify a proof
          </Button>
          <Button
            className="cursor-pointer hover:bg-muted-foreground hover:text-accent-foreground"
            size={"lg"}
            disabled={walletPublicKey !== ""}
            onClick={async () => {
              // setUserSelection("getPubAdd");
              const pubKey = await getPubKeyFromMM(walletAddress);
              if (pubKey) {
                setWalletPublicKey(pubKey);
              }
            }}
          >
            Get your public key
          </Button>
        </div> */}
      </div>
    ),
  };
  const headerRef = useRef<HTMLElement>(null);
  const mainContainerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    console.log("🚀 ~ headerRef:", headerRef);
    console.log(headerRef.current?.tagName);
    console.log("🚀 ~ mainContainerRef:", mainContainerRef);
    console.log(mainContainerRef.current?.tagName);
    if (!headerRef.current || !mainContainerRef.current) return;

    const navObserverCallback = (entries: IntersectionObserverEntry[]) => {
      console.log("🚀 ~ useEffect ~ entries:", entries);
    };

    const navObserver = new IntersectionObserver(navObserverCallback, {
      root: null,
      // rootMargin: "0px 0px 0px 0px",
      threshold: 0.1,
    });
    navObserver.observe(mainContainerRef.current);
    return () => {
      navObserver.disconnect();
    };
  });

  const [isMobileScreen, setIsMobileScreen] = useState(false);
  console.log("🚀 ~ isMobileScreen:", isMobileScreen);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    const ac = new AbortController();
    mq.addEventListener("change", (e) => setIsMobileScreen(e.matches), { signal: ac.signal });
    return () => ac.abort();
  }, []);

  return (
    <div>
      <header
        className="flex items-center justify-between w-[95%] lg:w-3/4 m-auto bg-gray-200/40 dark:bg-slate-800/40 rounded-2xl px-4 sticky top-2 backdrop-filter backdrop-blur-lg"
        ref={headerRef}
      >
        {/* <img src="college-logo.jpeg" width={55} /> */}

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-15 sm:h-15 relative">
            <Image src={NavLogo} alt="NavLogo" fill />
          </div>
          {userSelection !== "default" && (
            <div className="flex justify-center align-center rounded-full border-primary border-3 p-1">
              <BackIcon
                onClick={() => {
                  setWalletPublicKey("");
                  setUserSelection("default");
                }}
              />
            </div>
          )}
        </div>
        <div className="flex items-center justify-center">
          <h3 className="text-xl sm:text-2xl md:text-3xl text-center">
            {isMobileScreen ? "ZK" : "ZK ID Management System"}
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="border-3 rounded-full border-primary p-1 cursor-pointer">
                  <ThemeIcon />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {["system", "light", "dark"].map((theme) => (
                    <DropdownMenuItem
                      className={
                        theme === themeContext.theme ? "bg-primary text-primary-foreground" : ""
                      }
                      key={theme}
                      onClick={(e) => themeContext.changeTheme(theme as ThemeType)}
                    >
                      {theme.at(0)?.toUpperCase() + theme.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* <div>
            {walletAddress == "" ? (
              <Button
                onClick={connectAccount}
                className="cursor-pointer hover:bg-muted-foreground hover:text-accent-foreground"
              >
                <p>Connect Wallet</p>
              </Button>
            ) : (
              // <div className={styles.conButtonAddress}>
              //   {walletAddress.slice(0, 7) + "..." + walletAddress.slice(-4)}
              // </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div>
                    <CircleUserIcon className="cursor-pointer" size={"40"} />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Accounts</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {accounts.map((acc) => (
                      <DropdownMenuItem
                        // value={acc}
                        onClick={() => {
                          const newAccounts = [acc, ...accounts.filter((a) => a !== acc)];
                          console.log("🚀 ~ newAccounts:", newAccounts);
                          resetAppStateWithNewAccounts(newAccounts);
                        }}
                        className={
                          acc === walletAddress ? "bg-primary text-primary-foreground" : ""
                        }
                        key={acc}
                      >
                        {acc.slice(0, 20) + "..."}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div> */}
        </div>
      </header>
      <main
        className="flex flex-col gap-4 mt-10 sm:max-w-4/5 min-h-[calc(100vh-40vh)] mx-auto p-4"
        ref={mainContainerRef}
      >
        {walletConnected ? (
          <>
            {isIssuer ? (
              <Issuer credentialsDB={credentialsDB} />
            ) : (
              <Tabs defaultValue="home" className="flex-1 flex flex-col">
                <TabsList className="mx-auto h-9 gap-0.5">
                  {["home", "prove", "verify"].map((tab) => (
                    <TabsTrigger
                      value={tab}
                      key={tab}
                      className="cursor-pointer hover:bg-muted-foreground hover:text-accent-foreground px-4 transition-all duration-200"
                    >
                      {tab.at(0)?.toUpperCase() + tab.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {["home", "prove", "verify"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="flex-1 flex flex-col p-4">
                    {NonIssuerContents[tab as "home" | "prove" | "verify"]}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </>
        ) : (
          <div className="text-center flex-1 flex flex-col justify-center gap-6">
            <h1 className="text-3xl">Connect your wallet first</h1>
            <p className="text-xl mt-2">Your type of account will be automatically detected</p>
            <div>
              <Button
                onClick={connectAccount}
                className="cursor-pointer hover:bg-muted-foreground hover:text-accent-foreground"
              >
                <p>Connect Wallet</p>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
