// schema.js
const {
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLList,
    GraphQLString,
    GraphQLInt
} = require('graphql');
const {
    Web3
} = require('web3');
const web3 = new Web3('https://evm-rpc.planq.network');
const fs = require('fs');
const {
    cloneElement
} = require('react');
// Replace with the actual Uniswap V3 factory contract address and ABI
const uniswapV3FactoryContractAddress = '0x37e59adF08C3b4C0B744Be41E26120DB9953d30c';
var jsonFile = "abis/factory.json";
var PoolFile = "abis/pools.json";
const uniswapV3FactoryAbi = JSON.parse(fs.readFileSync(jsonFile)); // Replace with your contract ABI
const uniswapV3FactoryContract = new web3.eth.Contract(uniswapV3FactoryAbi, uniswapV3FactoryContractAddress, {
    from: '0x1234567890123456789012345678901234567891', // default from address
    gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
});

// Replace with the actual Uniswap V3 pool contract ABI
const uniswapV3PoolAbi = JSON.parse(fs.readFileSync(PoolFile)); // Replace with your pool contract ABI

const PoolType = new GraphQLObjectType({
    name: 'Pool',
    fields: {
        poolAddress: {
            type: GraphQLString
        },
        token0: {
            type: GraphQLString
        },
        token1: {
            type: GraphQLString
        },
        reserve0: {
            type: GraphQLString
        },
        reserve1: {
            type: GraphQLString
        },
        timestamp: {
            type: GraphQLInt
        },
    },
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        PhysicaFactoryowner: {
            type: GraphQLString,
            async resolve(parent, args) {
                try {
                    const owner = await uniswapV3FactoryContract.methods.owner().call();
                    return owner;
                } catch (error) {
                    console.error('Error fetching Uniswap V3 factory owner:', error);
                    throw error;
                }
            },
        },
        pools: {
            type: new GraphQLList(PoolType),
            async resolve(parent, args) {
                try {
                    const poolAddresses = await uniswapV3FactoryContract.methods.getPool().call();
                    console.log(poolAddresses)
                    const poolsData = await Promise.all(poolAddresses.map(async (poolAddress) => {
                        const poolContract = new web3.eth.Contract(uniswapV3PoolAbi, poolAddress);

                        const [token0, token1] = await Promise.all([
                            poolContract.methods.token0().call(),
                            poolContract.methods.token1().call(),
                        ]);

                        const [reserve0, reserve1] = await Promise.all([
                            poolContract.methods.getReserves().call(),
                        ]);

                        const timestamp = await poolContract.methods.getTimestamp().call();

                        return {
                            poolAddress,
                            token0,
                            token1,
                            reserve0,
                            reserve1,
                            timestamp,
                        };
                    }));

                    return poolsData;
                } catch (error) {
                    console.error('Error fetching Uniswap V3 pools:', error);
                    throw error;
                }
            },
        },
    },
});

module.exports = new GraphQLSchema({
    query: RootQuery,
});