import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";

const SEPOLIA_PK =
  "93e61ffdf8509b03e49805bab90ae914ae511d7f1bb81fc7bc5f316c76203637";
const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/Dp3-dMBc1XWm2veRNbRiTFw-dUddq1c7`,
      accounts: [`0x${SEPOLIA_PK}`],
    },
  },
};

export default config;
