pragma solidity ^0.4.17;

contract CampaignFactory{
    address[] public deployedCampaigns;
    function createCampaign(uint minimun) public{
        address newCampaign = new Campaign(msg.sender, minimun);
        deployedCampaigns.push(newCampaign);
    }
    function getDeployedCampaigns() public view returns(address[]){
        return deployedCampaigns;
    }
}

contract Campaign{

    struct Request{
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount; 
        mapping(address=>bool) approvals;
    }
    address public manager;
    uint public minimunContribution;
    mapping(address=>bool) public approvers;
    Request[] public requests;
    uint public approversCount;

    modifier onlyManager{
        require(msg.sender == manager);
        _;
    }

    modifier requireMinimun{
        require(msg.value > minimunContribution);
        _;
    }

    function Campaign(address creator, uint minimun) public{
        manager = creator;
        minimunContribution= minimun;
    }

    function contribute() public payable requireMinimun{
        approvers[msg.sender]=true;
        approversCount++;
    }

    function createRequest(string description, uint value, address recipient) public onlyManager{
        Request memory request = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });
        requests.push(request);
    }
    function approveRequest(uint index) public{
        Request storage request = requests[index];
        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);

        request.approvals[msg.sender] =true;
        request.approvalCount++;
    }
    function finalizeRequest(uint index) public onlyManager{
        Request storage request = requests[index];
        require(request.approvalCount > (approversCount / 2));
        require(!request.complete);

        request.recipient.transfer(request.value);
        request.complete=true;
    }
}
