/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/bridge.json`.
 */
export type Bridge = {
  "address": "G3dDgLNsvXbwk3VEwdaJ48Ju7Cruk3M9Xk3kQwhAZKht",
  "metadata": {
    "name": "bridge",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "burnToken",
      "discriminator": [
        185,
        165,
        216,
        246,
        144,
        31,
        70,
        74
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mintAccount",
          "writable": true
        },
        {
          "name": "associatedTokenAccount",
          "writable": true
        },
        {
          "name": "userBalanceAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        }
      ],
      "args": [
        {
          "name": "polygonAddress",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createAssociatedTokenAccount",
      "discriminator": [
        112,
        83,
        122,
        159,
        174,
        104,
        244,
        19
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mintAccount"
        },
        {
          "name": "associatedTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mintAccount"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": []
    },
    {
      "name": "createTokenMint",
      "discriminator": [
        35,
        109,
        237,
        196,
        54,
        218,
        33,
        119
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mintAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createUserBalancePda",
      "discriminator": [
        124,
        185,
        35,
        29,
        51,
        122,
        220,
        135
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "userAccount"
        },
        {
          "name": "userBalanceAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "userAccount"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "depositedOnOppositeChain",
      "discriminator": [
        130,
        215,
        54,
        118,
        146,
        232,
        126,
        14
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "userAccount"
        },
        {
          "name": "userBalanceAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "userAccount"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [],
      "args": []
    },
    {
      "name": "mintToken",
      "discriminator": [
        172,
        137,
        183,
        14,
        207,
        110,
        234,
        56
      ],
      "accounts": [
        {
          "name": "mintAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "mintAccount",
          "writable": true
        },
        {
          "name": "associatedTokenAccount",
          "writable": true
        },
        {
          "name": "userBalanceAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "userBalance",
      "discriminator": [
        187,
        237,
        208,
        146,
        86,
        132,
        29,
        191
      ]
    }
  ],
  "events": [
    {
      "name": "customEvent",
      "discriminator": [
        101,
        189,
        94,
        83,
        118,
        162,
        97,
        220
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "inSufficientBalance",
      "msg": "You don't have enough tokens locked on Polygon Bridge"
    },
    {
      "code": 6001,
      "name": "overBurning",
      "msg": "You don't have enough tokens to be burned"
    }
  ],
  "types": [
    {
      "name": "customEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "eventType",
            "type": "string"
          },
          {
            "name": "sourceAddress",
            "type": "pubkey"
          },
          {
            "name": "polygonAddress",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "userBalance",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "balance",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
