const {
    Web3
} = require('web3');
const web3 = new Web3('https://evm-rpc.planq.network');
const fs = require('fs');
const contractAddress = '0xD058D9636F47697B3a3cd1Cb52d4b29Ca910373C';
var jsonFile = "abis/factory.json";
var abi = JSON.parse(fs.readFileSync(jsonFile)); // ABI (Application Binary Interface) of your smart contract

const contract = new web3.eth.Contract(abi, contractAddress);
const {
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString
} = require('graphql');

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        contractData: {
            type: GraphQLString,
            resolve(parent, args) {
                // Implement logic to fetch data from the smart contract
                return contract.methods.getData().call();
            },
        },
    },
});

module.exports = new GraphQLSchema({
    query: RootQuery,
});