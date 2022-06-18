const assert = require('assert');
const ganache = require('ganache-cli')
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(JSON.parse(interface))
                          .deploy({ data: bytecode})
                          .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery Contract', () => {
  it('deploys a contract', () => {
    assert.ok(lottery.options.address);
  });
  it('allows one account to enter', async () => {
    await lottery.methods.enter().send({ from: accounts[0], value: web3.utils.toWei('0.02', 'ether') });
    const players = await lottery.methods.getPlayers().call({ from: accounts[0] });

    assert.equal(players[0], accounts[0]);
    assert.equal(players.length, 1);
  });
  it('allows multiple account to enter', async () => {
    await lottery.methods.enter().send({ from: accounts[0], value: web3.utils.toWei('0.02', 'ether') });
    await lottery.methods.enter().send({ from: accounts[1], value: web3.utils.toWei('0.02', 'ether') });
    await lottery.methods.enter().send({ from: accounts[2], value: web3.utils.toWei('0.02', 'ether') });

    const players = await lottery.methods.getPlayers().call({ from: accounts[0] });

    assert.equal(players[0], accounts[0]);
    assert.equal(players[1], accounts[1]);
    assert.equal(players[2], accounts[2]);
    assert.equal(players.length, 3);
  });
  it('requires a minimum amount of ether to enter', async () => {
    try {
      await lottery.methods.enter().send({ from: accounts[0], value: 0 });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });
  it('only manager can call pickWinner', async () => {
    try {
      await lottery.methods.pickWinner().send({ from: accounts[1] });
      assert(false);
    }
    catch (err) {
      assert(err);
    }
  });
  it('sends money to the winner and resets the players array', async () => {
    await lottery.methods.enter().send({ from: accounts[0], value: web3.utils.toWei('2', 'ether') });
    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({ from: accounts[0] });
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;
    const playersAfterPickWinner = await lottery.methods.getPlayers().call({ from: accounts[0] });
    const contractBalanceAfterPickWinner = await web3.eth.getBalance(lottery.options.address);
    assert(difference > web3.utils.toWei('1.8', 'ether'));
    //Check if the players array is empty after pickWinner
    assert(playersAfterPickWinner.length === 0);
    //Check if the contract balance is 0 after pickWinner (This return string and compare with same data value)
    assert(contractBalanceAfterPickWinner === '0');
  });
});