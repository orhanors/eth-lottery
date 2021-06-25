pragma solidity ^0.4.17; //Specifies the version of solidity 

contract Lottery {
    address public manager;
    address[] public players;
    
    function Lottery() public {
        //get account creator's address and make it manager
        manager = msg.sender;
        
    }
    
    function enter() public payable {
        require(msg.value > .001 ether);
        
        players.push(msg.sender);
    }
    
    function random() private view returns(uint) {
        return uint(keccak256(block.difficulty,now,players));
    }
    
    function pickWinner() public restricted {
       // require(msg.sender == manager); //if the condition is falsy, evm will termimate the code and stop execution
        require(players.length > 0);
        uint index = random() % players.length;
        players[index].transfer(this.balance);
        players = new address[](0);
    }
    
    function getPlayers() public view returns(address[]){
        return players;
    }
    
    function getBalance() public view returns(uint){
        return this.balance;
    }
    
    modifier restricted(){
        require(msg.sender == manager);
        _; //this means the rest of the function code
    }
}