// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}

contract BookClubStaking {
    IERC20 public token; // USDC token
    address public owner;
    uint256 public constant STAKE_AMOUNT = 100 * 10 ** 6; // 100 USDC (6 decimals)

    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint8 participation; // 0–100 (%)
        bool refunded;
    }

    mapping(address => Stake) public stakes;
    address[] public stakers;
    mapping(address => bool) public isStaker;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not admin");
        _;
    }

    event Staked(address indexed user, uint256 amount);
    event ParticipationSet(address indexed user, uint8 percentage);
    event Refunded(address indexed user, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address _token) {
        token = IERC20(_token);
        owner = msg.sender;
    }

    function stake() external {
        require(stakes[msg.sender].amount == 0, "Already staked");

        require(token.transferFrom(msg.sender, address(this), STAKE_AMOUNT), "Transfer failed");

        stakes[msg.sender] = Stake({
            amount: STAKE_AMOUNT,
            timestamp: block.timestamp,
            participation: 0,
            refunded: false
        });

        if (!isStaker[msg.sender]) {
            stakers.push(msg.sender);
            isStaker[msg.sender] = true;
        }

        emit Staked(msg.sender, STAKE_AMOUNT);
    }

    function setParticipation(address _user, uint8 _percentage) external onlyOwner {
        require(_percentage <= 100, "Max 100%");
        require(stakes[_user].amount > 0, "User not staked");
        require(!stakes[_user].refunded, "Already refunded");

        stakes[_user].participation = _percentage;
        emit ParticipationSet(_user, _percentage);
    }

    function setMultipleParticipation(address[] calldata _users, uint8[] calldata _percentages) external onlyOwner {
        require(_users.length == _percentages.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < _users.length; i++) {
            require(_percentages[i] <= 100, "Max 100%");
            require(stakes[_users[i]].amount > 0, "User not staked");
            require(!stakes[_users[i]].refunded, "Already refunded");
            
            stakes[_users[i]].participation = _percentages[i];
            emit ParticipationSet(_users[i], _percentages[i]);
        }
    }

    function refund() external {
        Stake storage s = stakes[msg.sender];
        require(!s.refunded, "Already refunded");
        require(s.amount > 0, "No stake");
        require(s.participation > 0, "Not eligible yet");

        uint256 refundAmount = (s.amount * s.participation) / 100;
        s.refunded = true;

        require(token.transfer(msg.sender, refundAmount), "Refund transfer failed");
        emit Refunded(msg.sender, refundAmount);
    }

    function getStakeInfo(address _user) external view returns (
        uint256 stakedAmount,
        uint256 stakeTime,
        uint8 participation,
        bool refunded,
        uint256 eligibleRefund
    ) {
        Stake memory userStake = stakes[_user];
        uint256 eligibleAmount = userStake.amount > 0 && !userStake.refunded ? 
            (userStake.amount * userStake.participation) / 100 : 0;
        
        return (
            userStake.amount,
            userStake.timestamp,
            userStake.participation,
            userStake.refunded,
            eligibleAmount
        );
    }

    function getContractStats() external view returns (
        uint256 totalStaked,
        uint256 totalRefunded,
        uint256 totalStakers,
        uint256 activeStakers
    ) {
        uint256 _totalStaked = 0;
        uint256 _totalRefunded = 0;
        uint256 _activeStakers = 0;

        for (uint256 i = 0; i < stakers.length; i++) {
            Stake memory userStake = stakes[stakers[i]];
            if (userStake.amount > 0) {
                _totalStaked += userStake.amount;
                if (userStake.refunded) {
                    _totalRefunded += (userStake.amount * userStake.participation) / 100;
                } else {
                    _activeStakers++;
                }
            }
        }

        return (_totalStaked, _totalRefunded, stakers.length, _activeStakers);
    }

    function getAllStakers() external view returns (address[] memory) {
        return stakers;
    }

    function getStakersWithInfo() external view returns (
        address[] memory addresses,
        uint256[] memory amounts,
        uint8[] memory participations,
        bool[] memory refundedStatus
    ) {
        addresses = new address[](stakers.length);
        amounts = new uint256[](stakers.length);
        participations = new uint8[](stakers.length);
        refundedStatus = new bool[](stakers.length);

        for (uint256 i = 0; i < stakers.length; i++) {
            addresses[i] = stakers[i];
            amounts[i] = stakes[stakers[i]].amount;
            participations[i] = stakes[stakers[i]].participation;
            refundedStatus[i] = stakes[stakers[i]].refunded;
        }

        return (addresses, amounts, participations, refundedStatus);
    }

    // Admin can withdraw leftover funds (e.g., for forfeited deposits)
    function withdrawRemaining(address to) external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        require(token.transfer(to, balance), "Withdrawal failed");
    }

    function withdrawRemainingAmount(address to, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(token.balanceOf(address(this)) >= amount, "Insufficient balance");
        require(token.transfer(to, amount), "Withdrawal failed");
    }

    function tokenBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // Emergency function to update a user's stake (only owner)
    function emergencyUpdateStake(address _user, uint256 _amount, uint8 _participation, bool _refunded) external onlyOwner {
        stakes[_user].amount = _amount;
        stakes[_user].participation = _participation;
        stakes[_user].refunded = _refunded;
        
        if (_amount > 0 && !isStaker[_user]) {
            stakers.push(_user);
            isStaker[_user] = true;
        }
    }
} 