export class BondingManagerArtifact {
  public static contractName: string = "BondingManager";
  public static contractAbi: any = [
    {
      "constant": true,
      "inputs": [],
      "name": "maxEarningsClaimsRounds",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_delegator",
          "type": "address"
        },
        {
          "name": "_unbondingLockId",
          "type": "uint256"
        }
      ],
      "name": "isValidUnbondingLock",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_delegator",
          "type": "address"
        }
      ],
      "name": "delegatorStatus",
      "outputs": [
        {
          "name": "",
          "type": "uint8"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "reward",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_transcoder",
          "type": "address"
        },
        {
          "name": "_finder",
          "type": "address"
        },
        {
          "name": "_slashAmount",
          "type": "uint256"
        },
        {
          "name": "_finderFee",
          "type": "uint256"
        }
      ],
      "name": "slashTranscoder",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_transcoder",
          "type": "address"
        }
      ],
      "name": "getNextTranscoderInPool",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "setActiveTranscoders",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_transcoder",
          "type": "address"
        },
        {
          "name": "_round",
          "type": "uint256"
        }
      ],
      "name": "getTranscoderEarningsPoolForRound",
      "outputs": [
        {
          "name": "rewardPool",
          "type": "uint256"
        },
        {
          "name": "feePool",
          "type": "uint256"
        },
        {
          "name": "totalStake",
          "type": "uint256"
        },
        {
          "name": "claimableStake",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_endRound",
          "type": "uint256"
        }
      ],
      "name": "claimEarnings",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_unbondingLockId",
          "type": "uint256"
        }
      ],
      "name": "withdrawStake",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "unbond",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getTranscoderPoolSize",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_to",
          "type": "address"
        },
        {
          "name": "_unbondingLockId",
          "type": "uint256"
        }
      ],
      "name": "rebondFromUnbonded",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_transcoder",
          "type": "address"
        },
        {
          "name": "_fees",
          "type": "uint256"
        },
        {
          "name": "_round",
          "type": "uint256"
        }
      ],
      "name": "updateTranscoderWithFees",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "activeTranscoderSet",
      "outputs": [
        {
          "name": "totalStake",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_delegator",
          "type": "address"
        },
        {
          "name": "_unbondingLockId",
          "type": "uint256"
        }
      ],
      "name": "getDelegatorUnbondingLock",
      "outputs": [
        {
          "name": "amount",
          "type": "uint256"
        },
        {
          "name": "withdrawRound",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "withdrawFees",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "targetContractId",
      "outputs": [
        {
          "name": "",
          "type": "bytes32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getTranscoderPoolMaxSize",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getTotalBonded",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_transcoder",
          "type": "address"
        }
      ],
      "name": "getTranscoder",
      "outputs": [
        {
          "name": "lastRewardRound",
          "type": "uint256"
        },
        {
          "name": "rewardCut",
          "type": "uint256"
        },
        {
          "name": "feeShare",
          "type": "uint256"
        },
        {
          "name": "pricePerSegment",
          "type": "uint256"
        },
        {
          "name": "pendingRewardCut",
          "type": "uint256"
        },
        {
          "name": "pendingFeeShare",
          "type": "uint256"
        },
        {
          "name": "pendingPricePerSegment",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_numTranscoders",
          "type": "uint256"
        }
      ],
      "name": "setNumTranscoders",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "numActiveTranscoders",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_numActiveTranscoders",
          "type": "uint256"
        }
      ],
      "name": "setNumActiveTranscoders",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_transcoder",
          "type": "address"
        }
      ],
      "name": "isRegisteredTranscoder",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "unbondingPeriod",
      "outputs": [
        {
          "name": "",
          "type": "uint64"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_maxEarningsClaimsRounds",
          "type": "uint256"
        }
      ],
      "name": "setMaxEarningsClaimsRounds",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_round",
          "type": "uint256"
        }
      ],
      "name": "getTotalActiveStake",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_transcoder",
          "type": "address"
        },
        {
          "name": "_round",
          "type": "uint256"
        }
      ],
      "name": "isActiveTranscoder",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_rewardCut",
          "type": "uint256"
        },
        {
          "name": "_feeShare",
          "type": "uint256"
        },
        {
          "name": "_pricePerSegment",
          "type": "uint256"
        }
      ],
      "name": "transcoder",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getFirstTranscoderInPool",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_transcoder",
          "type": "address"
        }
      ],
      "name": "transcoderStatus",
      "outputs": [
        {
          "name": "",
          "type": "uint8"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_maxPricePerSegment",
          "type": "uint256"
        },
        {
          "name": "_blockHash",
          "type": "bytes32"
        },
        {
          "name": "_round",
          "type": "uint256"
        }
      ],
      "name": "electActiveTranscoder",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_controller",
          "type": "address"
        }
      ],
      "name": "setController",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_delegator",
          "type": "address"
        },
        {
          "name": "_endRound",
          "type": "uint256"
        }
      ],
      "name": "pendingStake",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_transcoder",
          "type": "address"
        }
      ],
      "name": "transcoderTotalStake",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_delegator",
          "type": "address"
        }
      ],
      "name": "getDelegator",
      "outputs": [
        {
          "name": "bondedAmount",
          "type": "uint256"
        },
        {
          "name": "fees",
          "type": "uint256"
        },
        {
          "name": "delegateAddress",
          "type": "address"
        },
        {
          "name": "delegatedAmount",
          "type": "uint256"
        },
        {
          "name": "startRound",
          "type": "uint256"
        },
        {
          "name": "lastClaimRound",
          "type": "uint256"
        },
        {
          "name": "nextUnbondingLockId",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_amount",
          "type": "uint256"
        },
        {
          "name": "_to",
          "type": "address"
        }
      ],
      "name": "bond",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_unbondingLockId",
          "type": "uint256"
        }
      ],
      "name": "rebond",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_unbondingPeriod",
          "type": "uint64"
        }
      ],
      "name": "setUnbondingPeriod",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_transcoder",
          "type": "address"
        },
        {
          "name": "_round",
          "type": "uint256"
        }
      ],
      "name": "activeTranscoderTotalStake",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_delegator",
          "type": "address"
        },
        {
          "name": "_endRound",
          "type": "uint256"
        }
      ],
      "name": "pendingFees",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "controller",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "name": "_controller",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "transcoder",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "pendingRewardCut",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "pendingFeeShare",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "pendingPricePerSegment",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "registered",
          "type": "bool"
        }
      ],
      "name": "TranscoderUpdate",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "transcoder",
          "type": "address"
        }
      ],
      "name": "TranscoderEvicted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "transcoder",
          "type": "address"
        }
      ],
      "name": "TranscoderResigned",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "transcoder",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "finder",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "penalty",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "finderReward",
          "type": "uint256"
        }
      ],
      "name": "TranscoderSlashed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "transcoder",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Reward",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "newDelegate",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "oldDelegate",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "delegator",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "additionalAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "bondedAmount",
          "type": "uint256"
        }
      ],
      "name": "Bond",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "delegate",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "delegator",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "unbondingLockId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "withdrawRound",
          "type": "uint256"
        }
      ],
      "name": "Unbond",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "delegate",
          "type": "address"
        },
        {
          "indexed": true,
          "name": "delegator",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "unbondingLockId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Rebond",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "delegator",
          "type": "address"
        },
        {
          "indexed": false,
          "name": "unbondingLockId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "name": "withdrawRound",
          "type": "uint256"
        }
      ],
      "name": "WithdrawStake",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "delegator",
          "type": "address"
        }
      ],
      "name": "WithdrawFees",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "controller",
          "type": "address"
        }
      ],
      "name": "SetController",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "param",
          "type": "string"
        }
      ],
      "name": "ParameterUpdate",
      "type": "event"
    }
  ];
  public static contractAddress: string =  "0x511Bc4556D823Ae99630aE8de28b9B80Df90eA2e"
}