// contract test code will go here
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider()); //Create instance from web3 and connect with the ganache provider network.
const { interface, bytecode } = require('../compile');

let accounts;
let inbox;
beforeEach(async () => {
  //get a list of all accounts  
  accounts = await web3.eth.getAccounts();
  //use one of those accounts to deploy the contract
  inbox = await new web3.eth.Contract(JSON.parse(interface))
                        .deploy({ data: bytecode, arguments: ['Hi there!'] })
                        .send(({ from: accounts[0], gas: '1000000' }));
});

describe('Inbox', () => {
  it('should deploy a contract', () => {
    //Check if the value of the contract is defined
    assert.ok(inbox.options.address); 
  });
  it('should have a default message', async () => {
    const message = await inbox.methods.message().call();
    assert.equal(message, 'Hi there!');
  });
  it('should set the message', async () => {
    await inbox.methods.setMessage('Bye there!').send({ from: accounts[0] });
    const message = await inbox.methods.message().call();
    assert.equal(message, 'Bye there!');
  });
});
