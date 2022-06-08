// deploy code will go here
const HdWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');
require('dotenv').config()

const provider = new HdWalletProvider(
  process.env.MNEMONIC,
  process.env.POCKET_ENDPOINT
);
const web3 = new Web3(provider);

const deploy = async () => {
  // Get accouns from Mnemonic
  const accounts = await web3.eth.getAccounts();
  console.log(accounts[0]);
  // Keep the response from the contract creation
  const result = await new web3.eth.Contract(JSON.parse(interface))
                    .deploy({ data: bytecode, arguments: ['Hi there!'] })
                    .send(({ from: accounts[0], gas: '1000000' }));
  // Return the address of the contract
  console.log('Contract deployed to: ', result.options.address);
  // Test of the getting the message from contract
  const message = await result.methods.message().call();
  console.log('Value of the message method',message );
  const setMessage = await result.methods.setMessage('Bye there!').send({ from: accounts[0] });
  const messageFromSetMessage = await result.methods.message().call();
  console.log('Value of the setMessage method',messageFromSetMessage );
  provider.engine.stop();
}
deploy();