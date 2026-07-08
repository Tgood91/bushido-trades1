import React, { useState } from 'react';
import { Copy, Check, ShieldAlert, Phone, Terminal, Compass, LayoutGrid, CheckCircle, Sword } from 'lucide-react';

export default function AndroidGuide() {
  const [activeMethod, setActiveMethod] = useState<'remix' | 'termux' | 'thirdweb'>('remix');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Mobile-Optimization Header Notice */}
      <div className="bg-[#090b11] border border-red-500/20 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
        <div className="flex gap-4 items-start">
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-500">
            <Sword className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-md font-display font-black text-slate-100 uppercase tracking-wider">Android Deployment Scroll</h2>
            <p className="text-xs text-slate-455 mt-1 max-w-2xl leading-relaxed font-jp">
              Solidity compilation and deployment can be fully achieved directly from your Android device using these pre-compiled methods. Select your preferred environment setup below to view customized instructions:
            </p>
          </div>
        </div>
      </div>

      {/* Playbook Method Switcher */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-900">
        <button
          type="button"
          onClick={() => setActiveMethod('remix')}
          className={`py-3 px-4 rounded-lg font-display font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${
            activeMethod === 'remix'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Compass className="h-4 w-4" />
          Remix Mobile
        </button>
        <button
          type="button"
          onClick={() => setActiveMethod('termux')}
          className={`py-3 px-4 rounded-lg font-display font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${
            activeMethod === 'termux'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Terminal className="h-4 w-4" />
          Termux CLI
        </button>
        <button
          type="button"
          onClick={() => setActiveMethod('thirdweb')}
          className={`py-3 px-4 rounded-lg font-display font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider ${
            activeMethod === 'thirdweb'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          Thirdweb GUI
        </button>
      </div>

      {/* Render selected guide */}
      <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-6 shadow-xl">
        {activeMethod === 'remix' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-display font-bold text-slate-200 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-cyan-400" />
                Remix IDE in a Mobile Web3 Browser
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-jp">
                The fastest way to deploy without setting up a development environment. Approvals are triggered directly through your mobile wallet.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-start text-xs text-slate-300">
                <span className="w-5 h-5 rounded-full bg-slate-950 border border-slate-900 font-bold flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5 font-mono">1</span>
                <div>
                  <h4 className="font-display font-bold text-slate-200 mb-1">Install a Web3 Mobile Wallet</h4>
                  <p className="text-slate-400 font-jp">Ensure you have <span className="text-slate-300 font-semibold">MetaMask, Coinbase Wallet, or Rabby</span> installed on your Android device. Set the wallet network to <span className="text-slate-300 font-semibold">Base Mainnet</span> or <span className="text-slate-300 font-semibold">Base Sepolia</span> depending on your launch goals.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start text-xs text-slate-300">
                <span className="w-5 h-5 rounded-full bg-slate-950 border border-slate-900 font-bold flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5 font-mono">2</span>
                <div>
                  <h4 className="font-display font-bold text-slate-200 mb-1">Open the Wallet's Built-In Browser</h4>
                  <p className="text-slate-400 font-jp">Open your mobile wallet app, navigate to its built-in browser (the dApp Browser icon), and go to <span className="text-cyan-400 underline font-mono select-all">https://remix.ethereum.org</span>.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start text-xs text-slate-300">
                <span className="w-5 h-5 rounded-full bg-slate-950 border border-slate-900 font-bold flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5 font-mono">3</span>
                <div>
                  <h4 className="font-display font-bold text-slate-200 mb-1">Create ERC20ZFactory.sol</h4>
                  <p className="text-slate-400 font-jp">Tap on the file explorer inside Remix, create a new file named <span className="font-mono text-slate-200">ERC20ZFactory.sol</span>, and paste the code from the <span className="text-cyan-400 font-semibold">Contract Vault</span> tab.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start text-xs text-slate-300">
                <span className="w-5 h-5 rounded-full bg-slate-950 border border-slate-900 font-bold flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5 font-mono">4</span>
                <div>
                  <h4 className="font-display font-bold text-slate-200 mb-1">Compiler Settings (Crucial for Base)</h4>
                  <p className="text-slate-400 font-jp">Go to the Solidity Compiler tab. Choose version <span className="font-mono text-slate-200">0.8.20</span>. Expand Advanced Configurations and set EVM Version to <span className="text-cyan-400 font-bold font-mono">paris</span>.</p>
                  <div className="bg-slate-950 border border-red-500/10 p-3 rounded-lg flex gap-2.5 mt-2 max-w-xl">
                    <ShieldAlert className="h-4.5 w-4.5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-red-500/90 leading-relaxed font-mono">
                      <strong>Paris EVM Fallback:</strong> Base chains do not fully support the "shanghai" push0 opcode on older node configurations. Forcing compiler EVM setting to "paris" prevents contract deployment failures.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start text-xs text-slate-300">
                <span className="w-5 h-5 rounded-full bg-slate-950 border border-slate-900 font-bold flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5 font-mono">5</span>
                <div>
                  <h4 className="font-display font-bold text-slate-200 mb-1">Deploy via Injected Provider</h4>
                  <p className="text-slate-400 font-jp">Navigate to the Deploy & Run Transactions tab. Change Environment to <span className="text-slate-200 font-bold">Injected Provider</span>. Select <span className="font-mono text-slate-200">LaunchpadCoinFactory</span> in the contract list, paste your constructor parameters, and tap <span className="text-cyan-455 font-bold">Transact</span> to sign and launch!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMethod === 'termux' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-display font-bold text-slate-200 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-red-500" />
                Hardhat Deployment via Termux CLI
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-jp">
                For developers who prefer command-line compiling and deploying directly inside a local Linux emulator on their Android phone.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 block font-display">1. Update packages & install Node.js:</span>
                <div className="relative">
                  <pre className="bg-slate-950 p-3 rounded-lg font-mono text-[11px] text-cyan-400 overflow-x-auto whitespace-pre border border-slate-900">
                    pkg update && pkg upgrade -y{"\n"}
                    pkg install nodejs-lts git python make clang -y
                  </pre>
                  <button
                    type="button"
                    onClick={() => copyCommand("pkg update && pkg upgrade -y && pkg install nodejs-lts git python make clang -y", "t1")}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {copiedCmd === "t1" ? <Check className="h-4 w-4 text-cyan-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 block font-display">2. Initialize project and install Hardhat framework:</span>
                <div className="relative">
                  <pre className="bg-slate-950 p-3 rounded-lg font-mono text-[11px] text-cyan-400 overflow-x-auto whitespace-pre border border-slate-900">
                    mkdir erc20z-deploy && cd erc20z-deploy{"\n"}
                    npm init -y{"\n"}
                    npm install --save-dev hardhat @openzeppelin/contracts dotenv
                  </pre>
                  <button
                    type="button"
                    onClick={() => copyCommand("mkdir erc20z-deploy && cd erc20z-deploy && npm init -y && npm install --save-dev hardhat @openzeppelin/contracts dotenv", "t2")}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {copiedCmd === "t2" ? <Check className="h-4 w-4 text-cyan-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 block font-display">3. Setup deployment script (scripts/deploy.js):</span>
                <div className="relative">
                  <pre className="bg-slate-950 p-3 rounded-lg font-mono text-[11px] text-slate-400 overflow-x-auto whitespace-pre max-h-[160px] scrollbar-thin border border-slate-900">
                    {"const hre = require(\"hardhat\");\n\n"}
                    {"async function main() {\n"}
                    {"  const Factory = await hre.ethers.getContractFactory(\"LaunchpadCoinFactory\");\n"}
                    {"  const factory = await Factory.deploy(\n"}
                    {"    \"0x33128a8fC17869897dcE68Ed026d694621f6FDfD\", // V3 Factory\n"}
                    {"    \"0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f3\", // Position Manager\n"}
                    {"    \"0x4200000000000000000000000000000000000006\", // WETH\n"}
                    {"    process.env.OWNER_ADDRESS // Initial Owner\n"}
                    {"  );\n"}
                    {"  await factory.deployed();\n"}
                    {"  console.log(\"Factory deployed to:\", factory.address);\n"}
                    {"}\n"}
                    {"main().catch((error) => { console.error(error); process.exit(1); });"}
                  </pre>
                  <button
                    type="button"
                    onClick={() => copyCommand(`const hre = require("hardhat");\nasync function main() {\n  const Factory = await hre.ethers.getContractFactory("LaunchpadCoinFactory");\n  const factory = await Factory.deploy(\"0x33128a8fC17869897dcE68Ed026d694621f6FDfD\", \"0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f3\", \"0x4200000000000000000000000000000000000006\", process.env.OWNER_ADDRESS);\n  await factory.deployed();\n  console.log("Factory deployed to:", factory.address);\n}\nmain().catch((error) => { console.error(error); process.exit(1); });`, "t3")}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {copiedCmd === "t3" ? <Check className="h-4 w-4 text-cyan-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 block font-display">4. Execute deployment:</span>
                <div className="relative">
                  <pre className="bg-slate-950 p-3 rounded-lg font-mono text-[11px] text-cyan-400 overflow-x-auto whitespace-pre border border-slate-900">
                    npx hardhat run scripts/deploy.js --network base
                  </pre>
                  <button
                    type="button"
                    onClick={() => copyCommand("npx hardhat run scripts/deploy.js --network base", "t4")}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {copiedCmd === "t4" ? <Check className="h-4 w-4 text-cyan-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMethod === 'thirdweb' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-display font-bold text-slate-200 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-500" />
                No-Code Dashboard Deployment via Thirdweb
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-jp">
                The most elegant, mobile-friendly interface for managing, deploying, and editing factory contract settings on a small screen without writing script logic.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-start text-xs text-slate-300">
                <span className="w-5 h-5 rounded-full bg-slate-950 border border-slate-900 font-bold flex items-center justify-center text-amber-500 flex-shrink-0 mt-0.5 font-mono">1</span>
                <div>
                  <h4 className="font-display font-bold text-slate-200 mb-1">Open Thirdweb Dashboard</h4>
                  <p className="text-slate-400 font-jp">On your phone's standard mobile web browser (e.g., Chrome), go to <span className="font-semibold text-slate-200">thirdweb.com/dashboard</span> and connect your wallet via WalletConnect.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start text-xs text-slate-300">
                <span className="w-5 h-5 rounded-full bg-slate-950 border border-slate-900 font-bold flex items-center justify-center text-amber-500 flex-shrink-0 mt-0.5 font-mono">2</span>
                <div>
                  <h4 className="font-display font-bold text-slate-200 mb-1">Upload the Factory Contract</h4>
                  <p className="text-slate-400 font-jp">Go to "Contracts" and select "Deploy Contract". You can upload the consolidated <span className="font-mono text-slate-200">ERC20ZFactory.sol</span> contract code directly from your local phone file storage.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start text-xs text-slate-300">
                <span className="w-5 h-5 rounded-full bg-slate-950 border border-slate-900 font-bold flex items-center justify-center text-amber-500 flex-shrink-0 mt-0.5 font-mono">3</span>
                <div>
                  <h4 className="font-display font-bold text-slate-200 mb-1">Generate Mobile Explorer Dashboard</h4>
                  <p className="text-slate-400 font-jp">Once deployed, Thirdweb will automatically generate a highly optimized, fully responsive mobile dashboard specifically for your deployed contract! You can interactively execute the `deploy` function, check fees, and manage permissions from your phone anywhere.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
