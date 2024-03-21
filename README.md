<h1 align="center">Work Completed</h1>

<h2 align="center">Trade Aggregator</h2>

1. Allow users to swap 'n' tokens with 'n' other tokens, one at a time, using best exchange rates from Bancor, Kyber and Uniswap. 'n' represents all tokens available in Bancor, Kyber and Uniswap liquidity pools.
2. Integration with a decent UI for the swap.

<h2 align="center">Staking</h2>

### Livepeer

1. Allow users to stake their Livepeer tokens to an 'Orchestrator' of their choice, with an improved UI that guides them through the process.
2. Users can buy LPT using the UI itself, if they do not own any.
3. Staking rewards can be received in a matter of 8 days.

### Tezos

1. Allowing users to delegate their Tezos tokens (XTZ) to delegates they can find from the UI itself.
2. Feature that allows users to transfer their XTZ to other addresses
3. Very first staking rewards transferred directly into users' wallets, 2 months from the time of staking.

<h2 align="center">Baskets</h2>

1. An improved wallet that displays all tokens the user owns.
2. If a user wants some token she doesn't own, in her basket, she has the option to buy it, <i>while</i> creating her basket.
3. Baskets being created on a single click from the user, after which, they are free to close the desktop app and come back later to find their baskets published (or resume the creation process, in case it gets paused).
4. UI that will allow users to see all the baskets that are pending, all that are active (published on blockchain), and all they do not own, with relevant details.
5. UI that will allow users to buy the baskets they do not own, and also to liquidate the baskets they own.
6. Appropriate server code to handle (2), (3), (4) and (5) above. Built in such a manner that allows it to resume from where it left off, after a crash (due to request overload, etc.), hence making it crash-tolerant. Now using infura instead of maintaining our own geth node (may save on cost).

<h1 align="center">Issues to be Solved</h1>

1. Sometimes a token contract while trading (during basket creation) gives a contract-revert, resulting in a failed transaction. Current implementation perceives this as a successful transaction, and the token is NOT included in the basket.
2. Even after applying many fixes, still sometimes, 'connection not open on send()' error pops up in the server due to some irregularities in the websocket connection to infura. As a result basket contract address does not get updated in the database, and the basket creation gets halted forever. Refreshing the server is a temporary fix.
3. During the basket-creation flow, the user is advised not to make any transactions with the address they created the basket (until basket gets published). But if they do, the basket-creation process will be halted. As of now, the only option with the user is to create another basket.
4. If the user 5 ABC tokens, out of which he has pledged 3 tokens for a basket. Now if he spends 4 ABCs elsewhere, he's left with only 1 ABC, and the server code expects 3 ABCs. Hence the txn will fail, and the basket-creation will be halted. The only way out is to create another basket with apt number of tokens in wallet.
5. Sometimes Bancor, Kyber, Uniswap APIs throw error for particular tokens at particular points of time, due to which the trade cannot be completed. These need to be handled.
6. Handling the case for insufficient balance in user's wallet, to be able to create a basket. Seems pretty tough to be solved, as gas estimation is required for variable number of signatures, beforehand.
