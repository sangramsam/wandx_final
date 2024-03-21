const createPortfolio = [
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "_maker", type: "address" },
      {
        indexed: false,
        name: "_portfolio",
        type: "address"
      },
      { indexed: false, name: "_fee", type: "uint256" },
      { indexed: false, name: "_hash", type: "bytes32" },
      {
        indexed: false,
        name: "_message",
        type: "bytes32"
      }
    ],
    name: "Exchange",
    type: "event"
  },
  {
    constant: false,
    inputs: [
      { name: "_maker", type: "address" },
      { name: "_assets", type: "address[]" },
      { name: "_volumes", type: "uint256[]" },
      { name: "_askValue", type: "uint256" },
      { name: "_expiryBlock", type: "uint256" },
      { name: "_name", type: "bytes32" }
    ],
    name: "createPortfolio",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "_storage", type: "address" },
      { name: "_calc", type: "address" },
      {
        name: "_proxy",
        type: "address"
      },
      { name: "_token", type: "address" }
    ],
    name: "updateExchange",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "_storage", type: "address" },
      { name: "_calc", type: "address" },
      {
        name: "_proxy",
        type: "address"
      },
      { name: "_token", type: "address" }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    constant: true,
    inputs: [],
    name: "ethertoken",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "feeCalculator",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      { name: "_askValue", type: "uint256" },
      { name: "_feeIndex", type: "uint256" }
    ],
    name: "getFee",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      { name: "_maker", type: "address" },
      { name: "_assets", type: "address[]" },
      {
        name: "_volumes",
        type: "uint256[]"
      },
      { name: "_askValue", type: "uint256" },
      { name: "_expiryBlock", type: "uint256" },
      { name: "_name", type: "bytes32" }
    ],
    name: "getPortfolioHash",
    outputs: [{ name: "", type: "bytes32" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "protostage",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "transferProxy",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "version",
    outputs: [{ name: "", type: "bytes32" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  }
];

//mainnet: 0x93bcdc141a64eece054064ff13d9330b33abee92
//testnet: 0xd98fd92d7a47ede09e41944f2035bf009c72beb1
const MainCreateContractAddress = "0x93bcdc141a64eece054064ff13d9330b33abee92";
const TestCreateContractAddress = "0xd98fd92d7a47ede09e41944f2035bf009c72beb1";

module.exports = {
  createPortfolio,
  MainCreateContractAddress,
  TestCreateContractAddress
};
