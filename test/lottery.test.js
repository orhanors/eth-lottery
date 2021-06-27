const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const { interface, bytecode } = require("../compile");

const web3 = new Web3(ganache.provider());

let accounts;
let lottery;

beforeEach(async () => {
	accounts = await web3.eth.getAccounts();

	lottery = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({
			data: bytecode,
		})
		.send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery Contract", () => {
	it("deploys a contract", () => {
		//if there is an address, we assume that it was deployed successfully
		assert.ok(lottery.options.address);
	});

	it("allows one account to enter", async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei("0.02", "ether"),
		});

		const players = await lottery.methods
			.getPlayers()
			.call({ from: accounts[0] });

		assert.strictEqual(players[0], accounts[0]);
		assert.strictEqual(players.length, 1);
	});

	it("allows multiple accounts to enter", async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei("0.02", "ether"),
		});

		await lottery.methods.enter().send({
			from: accounts[1],
			value: web3.utils.toWei("0.03", "ether"),
		});
		await lottery.methods.enter().send({
			from: accounts[2],
			value: web3.utils.toWei("0.04", "ether"),
		});

		const players = await lottery.methods
			.getPlayers()
			.call({ from: accounts[0] });

		assert.strictEqual(players[0], accounts[0]);
		assert.strictEqual(players[1], accounts[1]);
		assert.strictEqual(players[2], accounts[2]);

		assert.strictEqual(players.length, 3);
	});

	it("requires a minimum amount of ether to enter", async () => {
		try {
			await lottery.methods.enter().send({ from: accounts[0], value: 0 });
			assert(false); //if this works we should set as false, because we send 0 ether to enter which should cause an error
		} catch (error) {
			assert(error);
		}
	});

	it("only allows manager to call pickWinner ", async () => {
		//accounts[0] is the manager account
		//if I call pickWinner from another account it should throw an error
		try {
			await lottery.methods.pickWinner().send({
				from: accounts[1],
				value: web3.utils.toWei("0.02", "ether"),
			});

			assert(false);
		} catch (error) {
			assert(error);
		}
	});

	it("sends money to the winner and resets the players array", async () => {
		const dealMoneyEth = "2";
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei(dealMoneyEth, "ether"),
		});

		const initialBalance = await web3.eth.getBalance(accounts[0]);

		await lottery.methods.pickWinner().send({ from: accounts[0] });

		const finalBalance = await web3.eth.getBalance(accounts[0]);

		const difference = finalBalance - initialBalance;
		assert(difference > web3.utils.toWei("1.8", "ether"));
	});
});
