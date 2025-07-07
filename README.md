# Basic Setup

## System Setup

1. Install `nvm`
2. Install the latest LTS version of node using `nvm install --lts` (This project was made using node version 22)
3. Install cargo `curl https://sh.rustup.rs -sSf | sh` then run `source $HOME/.cargo/env`
4. Now run `git clone https://github.com/iden3/circom.git && cd circom`
5. Run `cargo build --release` && `cargo install --path circom`

## Project Setup and Deployment

1.  Move into the project directory, and run:

    ```bash
    npm install
    ```

2.  Set executable permission for the compile script:

    ```bash
    chmod 754 ./scripts/compile-circuit.sh
    ```

3.  Compile the circuit using either:

    - **Default entropy (auto-generated):**

      ```bash
      npm run compilecircuit
      ```

    - **Custom entropy (recommended for production or multi-party contributions):**

      ```bash
      npm run compilecircuit -- "YourSecureRandomEntropyHere"
      ```

    - **Or run the script directly:**

           ```bash
           ./scripts/compile-circuit.sh "YourSecureRandomEntropyHere"
           ```

      > ⚠️ **Please note:**
      > Circuit compilation and trusted setup can take a few minutes due to intensive cryptographic calculations.

4.  (Optional) Run bump solidity script using `npm run bumpsolidityverifier`.
5.  Setup a network locally using `npm run hardhat:node` or `npx hardhat node --verbose`
6.  Now you have to deploy the contracts, use `npm run deploy` or `npx hardhat run --network localhost scripts/deploy.ts` to deploy it in the hardhat local network setup in the earlier step.
    Or in case you want to deploy into sepolia testnet, use `npm run deploysepolia` or `hardhat run --network sepolia scripts/deploy.ts`.
7.  Copy the contract address from the console output of deploy, create a .env file in the root directory of the project, and assign it to NEXT_PUBLIC_CREDENTIALS_DB_ADDRESS.
    - For example, NEXT_PUBLIC_CREDENTIALS_DB_ADDRESS="0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"
8.  Finally, run the Next.js app using `npm run dev`
9.  Before connecting an account, you must ensure you are logged into Metamask and connected to localhost.

## Localhost configuration for Metamask Extension (Browser)

1. Add custom network with following values:
   1. RPC URL: `http://127.0.0.1:8545`
   2. Chain ID: `31337`
   3. Currency symbol: `ETH`
   4. Now select the new network (Localhost).
2. Now add accounts from the console output of the hardhat local network to Metamask.
   1. Click the account dropdown, and select `Add account or hardware wallet`.
   2. Under `Import a wallet or account`, select `Private Key` option.
   3. Paste the private key of the accounts from the console output of the hardhat local network.
   4. Now select `Import` button.
   5. NOTE: You need the first account of the console output to be able to issue credentials, as that is the owner of the contract.

## System Roles

- **Issuer:** The account that owns the contract and issues new credentials.
- **User Prover:** A user who possesses a credential and can generate a proof demonstrating ownership.
- **User Verifier:** A user who verifies the validity of such proofs.

### Application Summary

This application uses a Next.js frontend and two smart contracts deployed on an EVM-compatible blockchain. It integrates tools like Circom, snarkjs, and zk-kit to implement its zero-knowledge proof mechanics.

The **first contract**, `CredentialsDB.sol`, manages a registry containing encrypted credentials along with a Merkle Tree. Credentials are publicly accessible to ensure availability, but remain encrypted using each user's public key. The Merkle Tree stores leaves representing individual credentials.

The **second contract** is an auto-generated verifier contract created using snarkjs from the circuit defined in `circuits/zkVerifiableCredentialsDBCore.circom`.

The frontend allows users to interact with these contracts – issuers can issue new credentials, while regular users can prove and validate credentials. The app automatically detects if the current user is an issuer and renders the interface accordingly.

### Optional Configuration

1. **Credential Schema:** Update the example credential schema at `credentials-src/examplecredentialschema.json`. This JSON schema defines the structure and claims included in each credential set.

2. **Circuit Parameters:** Modify `circuits/zkVerifiableCredentialsDBCore.circom` to adjust:

   - **depth:** Defines the Merkle Tree depth, determining the total number of credentials it can hold (`total credentials = 2^depth`). Increasing depth increases circuit complexity, requiring a larger Ptau file for setup ([see available Ptau files](https://github.com/iden3/snarkjs#7-prepare-phase-2)).
   - **claimsN:** Must match the number of claims in your credential schema.

   For example, setting `depth=16` and `claimsN=5` creates a tree capable of storing 65,536 credentials, each with five claims.

3. **Contract Consistency:** Ensure that the same `TREE_DEPTH` value is configured in `CredentialsDB.sol` to match your circuit configuration.

## Resources

1. [compiling circuits](https://docs.circom.io/getting-started/compiling-circuits)
2. [Example implementation](https://medium.com/better-programming/zero-knowledge-proofs-using-snarkjs-and-circom-fac6c4d63202)
3. [Witness Generation](https://docs.circom.io/getting-started/computing-the-witness/)
