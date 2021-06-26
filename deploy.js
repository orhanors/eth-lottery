require("dotenv").config();
const HDWalletProvider = require("truffle-hdwallet-provider"); //Wallet-enabled Web3 provider
const Web3 = require("web3");
const { interface, bytecode } = require("./compile");

const provider = new HDWalletProvider(
	process.env.ACCOUNT_MNEMONIC,
	process.env.RINKEBY_INFURA_CONNECTION_LINK
);

const web3 = new Web3(provider);

const deploy = async () => {
	const accounts = await web3.eth.getAccounts();

	console.log("😺 Attempting to deploy from account --> ", accounts[0]);

	const result = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({
			data: bytecode,
		})
		.send({ from: accounts[0], gas: "1000000" });

	console.log(result);
	console.log(
		`🚀 Contract deployed to address 📓 ${result.options.address} successfully!`
	);
};

deploy();
