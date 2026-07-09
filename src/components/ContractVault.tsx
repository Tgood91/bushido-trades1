import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink, HelpCircle, Cpu, Settings, Sword } from 'lucide-react';

export default function ContractVault() {
  const [copied, setCopied] = useState(false);
  const [network, setNetwork] = useState<'mainnet' | 'sepolia'>('mainnet');

  // Input fields for Constructor helper
  const [customFactory, setCustomFactory] = useState('0x33128a8fC17869897dcE68Ed026d694621f6FDfD');
  const [customPosition, setCustomPosition] = useState('0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f3');
  const [customWeth, setCustomWeth] = useState('0x4200000000000000000000000000000000000006');
  const [customOwner, setCustomOwner] = useState('0x5FbDB2315678afecb367f032d93F642f64180aa3');

  // Pre-configured address parameters as supplied in the request:
  const baseConfig = {
    mainnet: {
      uniswapFactory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
      positionManager: "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f3",
      weth: "0x4200000000000000000000000000000000000006"
    },
    sepolia: {
      uniswapFactory: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
      positionManager: "0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2",
      weth: "0x4200000000000000000000000000000000000006"
    }
  };

  const applyNetworkDefaults = (net: 'mainnet' | 'sepolia') => {
    setNetwork(net);
    const cfg = baseConfig[net];
    setCustomFactory(cfg.uniswapFactory);
    setCustomPosition(cfg.positionManager);
    setCustomWeth(cfg.weth);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(solidityCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const solidityCode = `// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ─── UNISWAP V3 INTERFACES ───────────────────────────────────

interface IUniswapV3Factory {
    function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool);
    function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool);
}

interface IUniswapV3Pool {
    function initialize(uint160 sqrtPriceX96) external;
}

interface INonfungiblePositionManager {
    struct MintParams {
        address token0;
        address token1;
        uint24  fee;
        int24   tickLower;
        int24   tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }
    function mint(MintParams calldata params)
        external payable
        returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1);
}

// ─── LAUNCHPAD COIN (ERC20Z) ──────────────────────────────────

contract LaunchpadCoin is ERC20, Ownable {

    event FeesDistributed(
        address indexed creator,
        address indexed platform,
        uint256 creatorAmount,
        uint256 platformAmount
    );
    event MetadataUpdated(string newTokenURI);

    error ZeroAddress();
    error OnlyHook();
    error FeeSendFailed();

    uint256 public constant TOTAL_SUPPLY = 1_000_000_000e18;

    uint16 public constant CREATOR_FEE_BPS       = 50;  // 0.50%
    uint16 public constant TRADE_REFERRER_FEE_BPS = 15;  // 0.15%
    uint16 public constant CREATE_REFERRER_FEE_BPS= 15;  // 0.15%
    uint16 public constant PLATFORM_FEE_BPS       = 20;  // 0.20%

    address public immutable fundsRecipient;
    address public immutable platformRecipient;
    uint16  public immutable initialPlatformFeeBps;
    address public createReferrer;
    string  public tokenURI;
    address public feeCollector;

    constructor(
        string  memory _name,
        string  memory _symbol,
        string  memory _tokenURI,
        address _creator,
        address _splitter,
        address _platformRecipient,
        uint16  _initialPlatformFeeBps
    ) ERC20(_name, _symbol) Ownable(_creator) {
        if (_creator == address(0) || _platformRecipient == address(0)) revert ZeroAddress();

        tokenURI              = _tokenURI;
        platformRecipient     = _platformRecipient;
        initialPlatformFeeBps = _initialPlatformFeeBps;
        fundsRecipient        = _splitter != address(0) ? _splitter : _creator;

        _mint(msg.sender, TOTAL_SUPPLY);
    }

    function setFeeCollector(address _feeCollector) external onlyOwner {
        feeCollector = _feeCollector;
    }

    function setCreateReferrer(address _referrer) external onlyOwner {
        createReferrer = _referrer;
    }

    function setTokenURI(string calldata _uri) external onlyOwner {
        tokenURI = _uri;
        emit MetadataUpdated(_uri);
    }

    function distributeFees(address tradeReferrer) external payable {
        if (msg.sender != feeCollector && msg.sender != owner()) revert OnlyHook();

        uint256 total = msg.value;
        if (total == 0) return;

        uint256 creatorAmount;
        uint256 tradeRefAmount;
        uint256 createRefAmount;
        uint256 platformAmount;

        unchecked {
            creatorAmount = (total * CREATOR_FEE_BPS) / 100;
            tradeRefAmount = (total * TRADE_REFERRER_FEE_BPS) / 100;
            createRefAmount = (total * CREATE_REFERRER_FEE_BPS) / 100;
            platformAmount = total - creatorAmount - tradeRefAmount - createRefAmount;
        }

        _send(fundsRecipient,    creatorAmount);
        _send(platformRecipient, platformAmount);

        if (tradeReferrer != address(0)) {
            _send(tradeReferrer, tradeRefAmount);
        } else {
            _send(platformRecipient, tradeRefAmount);
        }

        address _createRef = createReferrer;
        if (_createRef != address(0)) {
            _send(_createRef, createRefAmount);
        } else {
            _send(platformRecipient, createRefAmount);
        }

        emit FeesDistributed(fundsRecipient, platformRecipient, creatorAmount, platformAmount);
    }

    function feeConfig() external pure returns (
        uint16 creatorBps,
        uint16 tradeReferrerBps,
        uint16 createReferrerBps,
        uint16 platformBps
    ) {
        return (
            CREATOR_FEE_BPS,
            TRADE_REFERRER_FEE_BPS,
            CREATE_REFERRER_FEE_BPS,
            PLATFORM_FEE_BPS
        );
    }

    function _send(address to, uint256 amount) internal {
        if (amount == 0 || to == address(0)) return;
        (bool ok,) = to.call{value: amount}("");
        if (!ok) {
            (bool ok2,) = platformRecipient.call{value: amount}("");
            if (!ok2) revert FeeSendFailed();
        }
    }

    receive() external payable {}
}

// ─── COIN FACTORY ────────────────────────────────────────────

contract LaunchpadCoinFactory is Ownable2Step, ReentrancyGuard {

    error ZeroAddress();
    error InsufficientLiquidity();
    error PoolAlreadyExists();
    error TransferFailed();
    error FeeTooHigh();
    error OnlyFactory();

    event CoinDeployed(
        address indexed coin,
        address indexed creator,
        address indexed splitter,
        string  name,
        string  symbol,
        address pool,
        uint256 initialLiquidityETH
    );

    uint256 public constant TOTAL_SUPPLY      = 1_000_000_000e18; 
    uint256 public constant CREATOR_ALLOCATION = 10_000_000e18;   // 1% allocation to creator
    uint256 public constant POOL_ALLOCATION    = 990_000_000e18;  // 99% allocated to pool

    uint24  public constant POOL_FEE = 10000; // 1% Uniswap V3 Pool Fee
    int24   public constant TICK_LOWER = -887200;
    int24   public constant TICK_UPPER =  887200;

    IUniswapV3Factory public immutable uniswapFactory;
    INonfungiblePositionManager public immutable positionManager;
    address public immutable WETH;

    mapping(address => bool) public authorizedFactories;
    mapping(address => address) public coinPool;    
    mapping(address => address) public coinCreator; 
    address[] public allCoins;

    constructor(
        address _uniswapFactory,
        address _positionManager,
        address _weth,
        address _initialOwner
    ) Ownable(_initialOwner) {
        if (_uniswapFactory == address(0) || _positionManager == address(0) || _weth == address(0))
            revert ZeroAddress();
        uniswapFactory  = IUniswapV3Factory(_uniswapFactory);
        positionManager = INonfungiblePositionManager(_positionManager);
        WETH            = _weth;
    }

    function setAuthorizedFactory(address factory, bool authorized) external onlyOwner {
        authorizedFactories[factory] = authorized;
    }

    function deploy(
        string  calldata tokenName,
        string  calldata symbol,
        string  calldata tokenURI,
        address payable creator,
        address splitter,
        address platformRecipient,
        uint16  platformFeeBps,
        uint256 initialLiquidityETH,
        uint160 sqrtPriceX96
    ) external payable nonReentrant returns (address coin) {
        if (!authorizedFactories[msg.sender] && msg.sender != owner())
            revert OnlyFactory();
        if (creator == address(0)) revert ZeroAddress();
        if (platformFeeBps > 1000) revert FeeTooHigh();
        if (msg.value < initialLiquidityETH) revert InsufficientLiquidity();

        LaunchpadCoin newCoin = new LaunchpadCoin(
            tokenName,
            symbol,
            tokenURI,
            creator,
            splitter,
            platformRecipient,
            platformFeeBps
        );
        coin = address(newCoin);
        allCoins.push(coin);
        coinCreator[coin] = creator;

        newCoin.transfer(creator, CREATOR_ALLOCATION);

        uint256 platformFee;
        uint256 liquidityETH;
        unchecked {
            platformFee = (initialLiquidityETH * platformFeeBps) / 10000;
            liquidityETH = initialLiquidityETH - platformFee;
        }

        if (platformFee > 0) {
            (bool ok,) = platformRecipient.call{value: platformFee}("");
            if (!ok) revert TransferFailed();
        }

        address pool = _createAndSeedPool(coin, liquidityETH, newCoin, sqrtPriceX96);
        coinPool[coin] = pool;

        uint256 excess = msg.value - initialLiquidityETH;
        if (excess > 0) {
            (bool ok,) = msg.sender.call{value: excess}("");
            if (!ok) revert TransferFailed();
        }

        emit CoinDeployed(coin, creator, splitter, tokenName, symbol, pool, liquidityETH);
    }

    function _createAndSeedPool(
        address coin,
        uint256 liquidityETH,
        LaunchpadCoin coinContract,
        uint160 sqrtPriceX96
    ) internal returns (address pool) {
        address token0;
        address token1;
        uint256 amount0Desired;
        uint256 amount1Desired;

        if (coin < WETH) {
            token0 = coin;
            token1 = WETH;
            amount0Desired = POOL_ALLOCATION;
            amount1Desired = liquidityETH;
        } else {
            token0 = WETH;
            token1 = coin;
            amount0Desired = liquidityETH;
            amount1Desired = POOL_ALLOCATION;
        }

        pool = uniswapFactory.createPool(token0, token1, POOL_FEE);
        IUniswapV3Pool(pool).initialize(sqrtPriceX96);

        coinContract.approve(address(positionManager), POOL_ALLOCATION);

        positionManager.mint{value: liquidityETH}(
            INonfungiblePositionManager.MintParams({
                token0: token0,
                token1: token1,
                fee: POOL_FEE,
                tickLower: TICK_LOWER,
                tickUpper: TICK_UPPER,
                amount0Desired: amount0Desired,
                amount1Desired: amount1Desired,
                amount0Min: 0, 
                amount1Min: 0, 
                recipient: address(this), 
                deadline: block.timestamp + 300
            })
        );
    }

    function totalCoins() external view returns (uint256) {
        return allCoins.length;
    }

    function getPool(address coin) external view returns (address) {
        return coinPool[coin];
    }
}`;

  return (
    <div className="space-y-6">
      {/* Network Configuration Guide Cards */}
      <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-display font-black text-slate-100 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-cyan-450" />
              Base Network Contract Directory
            </h2>
            <p className="text-xs text-slate-450 font-jp">
              Pre-configured smart contract addresses required to deploy the Launchpad Factory.
            </p>
          </div>

          <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-900">
            <button
              type="button"
              onClick={() => applyNetworkDefaults('mainnet')}
              className={`px-3 py-1.5 text-xs rounded font-display font-bold transition-all uppercase tracking-wide cursor-pointer ${
                network === 'mainnet'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Base Mainnet
            </button>
            <button
              type="button"
              onClick={() => applyNetworkDefaults('sepolia')}
              className={`px-3 py-1.5 text-xs rounded font-display font-bold transition-all uppercase tracking-wide cursor-pointer ${
                network === 'sepolia'
                  ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.25)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Base Sepolia
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs text-slate-300">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 relative">
            <span className="text-[10px] text-slate-500 uppercase block mb-1 font-semibold">Uniswap V3 Factory</span>
            <span className="text-cyan-400 font-bold break-all">{baseConfig[network].uniswapFactory}</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
            <span className="text-[10px] text-slate-500 uppercase block mb-1 font-semibold">Nonfungible Position Manager</span>
            <span className="text-amber-400 font-bold break-all">{baseConfig[network].positionManager}</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
            <span className="text-[10px] text-slate-500 uppercase block mb-1 font-semibold">WETH Contract</span>
            <span className="text-emerald-400 font-bold break-all">{baseConfig[network].weth}</span>
          </div>
        </div>
      </div>

      {/* Compiler & Constructor Helper */}
      <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-display font-black text-slate-300 mb-4 flex items-center gap-2">
          <Settings className="h-4 w-4 text-cyan-455" />
          Remix Constructor Parameters Builder
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Uniswap V3 Factory</label>
            <input 
              type="text" 
              value={customFactory} 
              onChange={(e) => setCustomFactory(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-slate-350 text-xs font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Position Manager</label>
            <input 
              type="text" 
              value={customPosition} 
              onChange={(e) => setCustomPosition(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-slate-350 text-xs font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">WETH Token</label>
            <input 
              type="text" 
              value={customWeth} 
              onChange={(e) => setCustomWeth(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-slate-350 text-xs font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Initial Owner Address</label>
            <input 
              type="text" 
              value={customOwner} 
              onChange={(e) => setCustomOwner(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-slate-350 text-xs font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-xs">
          <span className="text-[10px] text-slate-500 uppercase block mb-1.5 font-bold">Copyable Constructor Inputs for Remix / Etherscan:</span>
          <div className="bg-slate-900 p-3 rounded border border-slate-900 text-cyan-400 select-all break-all overflow-x-auto whitespace-nowrap">
            "{customFactory}", "{customPosition}", "{customWeth}", "{customOwner}"
          </div>
        </div>
      </div>

      {/* Contract Source Code IDE Section */}
      <div className="bg-[#090b11] border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex justify-between items-center bg-slate-950 px-6 py-4 border-b border-slate-900">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-650" />
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono text-slate-550 ml-2">contracts/ERC20ZFactory.sol (Solidity 0.8.20)</span>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-black text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_8px_rgba(34,211,238,0.2)]"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-slate-950" />
                Copied Source!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-950" />
                Copy Contract Code
              </>
            )}
          </button>
        </div>

        {/* Scrollable code explorer */}
        <div className="p-6 bg-slate-950 max-h-[460px] overflow-y-auto font-mono text-[11px] text-slate-400 select-text scrollbar-thin">
          <pre className="whitespace-pre overflow-x-auto leading-relaxed">
            {solidityCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
