// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BizenDao Members SBT
 * @notice Soul Bound Token for BizenDao membership card
 * @dev Non-transferable NFT with the following features:
 * - Free minting (no mint fee)
 * - One token per account limit
 * - Only contract owner can burn tokens
 * - No transfer functionality (Soul Bound)
 */
contract BizenDaoMembersSBT {
    // Token name and symbol
    string public constant name = "BizenDao Members Card";
    string public constant symbol = "BIZSBT";
    
    // Owner of the contract
    address public owner;
    
    // Total supply counter
    uint256 public totalSupply;
    
    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;
    
    // Mapping from owner address to token ID (one token per address)
    mapping(address => uint256) private _tokenOfOwner;
    
    // Mapping from owner address to mint status
    mapping(address => bool) private _hasMinted;
    
    // User information structure
    struct UserInfo {
        string memberName;
        string discordId;
        string avatarUrl;
    }
    
    // Mapping from address to user information
    mapping(address => UserInfo) private _userInfo;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Mint(address indexed to, uint256 indexed tokenId);
    event Burn(uint256 indexed tokenId);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event UserInfoUpdated(address indexed user, string memberName, string discordId, string avatarUrl);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier hasNotMinted() {
        require(!_hasMinted[msg.sender], "Already minted");
        _;
    }
    
    /**
     * @dev Constructor sets the original owner of the contract
     */
    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }
    
    /**
     * @notice Mint a new SBT to the caller
     * @dev Each address can only mint once, no fee required
     */
    function mint() external hasNotMinted {
        uint256 tokenId = totalSupply + 1;
        
        _owners[tokenId] = msg.sender;
        _tokenOfOwner[msg.sender] = tokenId;
        _hasMinted[msg.sender] = true;
        
        totalSupply = tokenId;
        
        emit Transfer(address(0), msg.sender, tokenId);
        emit Mint(msg.sender, tokenId);
    }
    
    /**
     * @notice Burn a specific token
     * @param tokenId The ID of the token to burn
     * @dev Only contract owner can burn tokens
     */
    function burn(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        
        address tokenOwner = _owners[tokenId];
        
        delete _owners[tokenId];
        delete _tokenOfOwner[tokenOwner];
        delete _hasMinted[tokenOwner];
        delete _userInfo[tokenOwner];
        
        emit Transfer(tokenOwner, address(0), tokenId);
        emit Burn(tokenId);
    }
    
    /**
     * @notice Transfer ownership of the contract
     * @param newOwner The address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    /**
     * @notice Get the balance of an address (0 or 1 for SBT)
     * @param account The address to query
     * @return The number of tokens owned (0 or 1)
     */
    function balanceOf(address account) external view returns (uint256) {
        return _hasMinted[account] ? 1 : 0;
    }
    
    /**
     * @notice Get the owner of a specific token
     * @param tokenId The ID of the token
     * @return The address of the token owner
     */
    function ownerOf(uint256 tokenId) external view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "Token does not exist");
        return tokenOwner;
    }
    
    /**
     * @notice Get the token ID owned by an address
     * @param account The address to query
     * @return The token ID (0 if no token owned)
     */
    function tokenOfOwner(address account) external view returns (uint256) {
        return _tokenOfOwner[account];
    }
    
    /**
     * @notice Check if an address has already minted
     * @param account The address to check
     * @return True if the address has minted, false otherwise
     */
    function hasMinted(address account) external view returns (bool) {
        return _hasMinted[account];
    }
    
    /**
     * @notice Get the mint price (always 0 for this contract)
     * @return The mint price in wei (0)
     */
    function mintPrice() external pure returns (uint256) {
        return 0;
    }
    
    /**
     * @notice Get the maximum supply (unlimited for this contract)
     * @return The maximum supply (type(uint256).max)
     */
    function maxSupply() external pure returns (uint256) {
        return type(uint256).max;
    }
    
    /**
     * @notice Set user information
     * @param memberName The member's display name
     * @param discordId The member's Discord ID
     * @param avatarUrl The member's avatar URL
     * @dev Only the token holder can update their own information
     */
    function setUserInfo(
        string memory memberName,
        string memory discordId,
        string memory avatarUrl
    ) external {
        require(_hasMinted[msg.sender], "Must hold a token to set user info");
        
        _userInfo[msg.sender] = UserInfo({
            memberName: memberName,
            discordId: discordId,
            avatarUrl: avatarUrl
        });
        
        emit UserInfoUpdated(msg.sender, memberName, discordId, avatarUrl);
    }
    
    /**
     * @notice Get user information
     * @param user The address to query
     * @return memberName The member's display name
     * @return discordId The member's Discord ID
     * @return avatarUrl The member's avatar URL
     */
    function getUserInfo(address user) external view returns (
        string memory memberName,
        string memory discordId,
        string memory avatarUrl
    ) {
        UserInfo memory info = _userInfo[user];
        return (info.memberName, info.discordId, info.avatarUrl);
    }
    
    /**
     * @dev Check if a token exists
     * @param tokenId The ID of the token to check
     * @return True if the token exists, false otherwise
     */
    function _exists(uint256 tokenId) private view returns (bool) {
        return _owners[tokenId] != address(0);
    }
    
    /**
     * @dev This function is intentionally left empty to prevent transfers
     * SBTs cannot be transferred
     */
    function transferFrom(address, address, uint256) external pure {
        revert("SBT: Transfer not allowed");
    }
    
    /**
     * @dev This function is intentionally left empty to prevent transfers
     * SBTs cannot be transferred
     */
    function safeTransferFrom(address, address, uint256) external pure {
        revert("SBT: Transfer not allowed");
    }
    
    /**
     * @dev This function is intentionally left empty to prevent transfers
     * SBTs cannot be transferred
     */
    function safeTransferFrom(address, address, uint256, bytes memory) external pure {
        revert("SBT: Transfer not allowed");
    }
    
    /**
     * @dev This function is intentionally left empty to prevent approvals
     * SBTs cannot be approved for transfer
     */
    function approve(address, uint256) external pure {
        revert("SBT: Approval not allowed");
    }
    
    /**
     * @dev This function is intentionally left empty to prevent approvals
     * SBTs cannot be approved for transfer
     */
    function setApprovalForAll(address, bool) external pure {
        revert("SBT: Approval not allowed");
    }
    
    /**
     * @dev This function returns zero address as approvals are not allowed
     */
    function getApproved(uint256) external pure returns (address) {
        return address(0);
    }
    
    /**
     * @dev This function returns false as approvals are not allowed
     */
    function isApprovedForAll(address, address) external pure returns (bool) {
        return false;
    }
}