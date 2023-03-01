import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useConnectedWallet } from "@terra-money/wallet-provider";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import useWallets from "../../hooks/useWallets";
import { Chain } from "../../models/Chain";
import { Wallet } from "../../models/Wallet";
import "./ConnectWallet.scss";

export type ConnectWalletType = {
  wallets: Array<Wallet>;
  onWalletConnected: (wallet: Wallet, chain: Chain) => void;
};

export const ConnectWallet = (props: ConnectWalletType) => {
  const { wallets, onWalletConnected } = props;

  const [wallet, setWallet] = useState<Wallet | null>();
  const [walletId, setWalletId] = useState("");

  const [chains, setChains] = useState(new Array<Chain>());
  const [chain, setChain] = useState<Chain | null>();
  const [chainId, setChainId] = useState("");

  const [warnSwitchNetwork, setWarnSwitchNetwork] = useState<boolean>();

  const [walletInstalled, setWalletInstalled] = useState<boolean>();

  const { enqueueSnackbar } = useSnackbar();
  const { isInstalled, isConnected, connect, disconnectStation, getConnectedNetwork } = useWallets();
  const connectedWallet = useConnectedWallet();

  useEffect(() => {
    disconnectStation()
  }, []);

  // Imperative way to detect if station is connected
  useEffect(() => {
    if (connectedWallet && wallet && chain) {
      // Only proceed if user is attempting claim on Terra.
      if (['station', 'stationmobile'].includes(wallet.id)) {
        const walletNetwork = getConnectedNetwork(wallet);

        if (process.env.REACT_APP_ALLOW_STATION_MAINNET_ONLY === "TRUE"
          && walletNetwork !== 'mainnet') {
            setWarnSwitchNetwork(true);
        }
        else {
          onWalletConnected(wallet, chain);
        }
      }
    }
  }, [
    connectedWallet,
    wallet,
    chain,
    onWalletConnected
  ]);

  const handleSelectWallet = (event: any) => {
    const selectedWallet = wallets.find(
      (wallet) => wallet.id === event.target.value
    );
    setChain(null);
    setChainId("");
    setChains([]);

    if (selectedWallet) {
      setWalletId(event.target.value);
      setWallet(selectedWallet);
      setChains(selectedWallet.chains);

      const firstChain = selectedWallet.chains[0];
      if (selectedWallet.chains.length === 1) {
        setChain(firstChain);
        setChainId(firstChain.id);
      }

      const walletInstalled = isInstalled(selectedWallet);
      setWalletInstalled(walletInstalled);
      setWarnSwitchNetwork(false);
    }
  };

  const handleSelectChain = (event: any) => {
    const selectedChain = chains.find(
      (chain) => chain.id === event.target.value
    );

    if (wallet) {
      setChainId(event.target.value);
      setChain(selectedChain);
      setWarnSwitchNetwork(false);

      if (isConnected(wallet) && selectedChain) {
        onWalletConnected(wallet, selectedChain);
      }
    }
  };

  const handleConnectWallet = async () => {
    try {
      if (wallet && chain) {
        await connect(wallet, chain);
        setWarnSwitchNetwork(false);
        // For station and wallet connect
        // the status must be checked on
        // an imperative way thru useEffect
        if (wallet.id !== "station" && wallet.id !== "stationmobile") {
          onWalletConnected(wallet, chain);
        }
      }
    } catch (e) {
      console.log(e);
      enqueueSnackbar("Operation cancelled", { variant: "error" });
    }
  };

  const handleCleanSelections = () => {
    setWallet(null);
    setWalletId("");
    setChain(null);
    setChainId("");
    setChains([]);
    setWalletInstalled(false);
  };

  return (
    <div className="ConnectWallet">
      <h4>
        Select a wallet and connect to an available network. Then, check your
        wallet's airdrop eligibility, sign a transaction to prove ownership and
        claim your airdrop.
      </h4>
      <FormControl className="FormControl" fullWidth>
        <InputLabel id="WalletLabel">Select Wallet</InputLabel>
        <Select
          id="WalletDropdown"
          labelId="Wallet"
          value={walletId}
          label="Select Wallet"
          onChange={handleSelectWallet}
        >
          {wallets.map((wallet, index) => (
            <MenuItem className="DropdownItem" key={index} value={wallet.id}>
              <div className={"icon " + wallet.icon} />
              <span>{wallet.name}</span>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {wallet && !walletInstalled && (
        <Alert severity="error" onClose={() => handleCleanSelections()}>
          Install {wallet.name} to connect and select a chain
        </Alert>
      )}

      {wallet && walletInstalled && (
        <FormControl className="FormControl" fullWidth>
          <InputLabel id="OriginChainDropdownLabel">Origin Chain</InputLabel>
          <Select
            id="OriginChainDropdown"
            labelId="OriginChainDropdown"
            value={chainId}
            label="Origin Chain"
            onChange={handleSelectChain}
          >
            {chains.map((chain, index) => (
              <MenuItem className="DropdownItem" key={index} value={chain.id}>
                <div className={"icon " + chain.icon} />
                <span>{chain.name}</span>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      
      {warnSwitchNetwork  && (
        <Alert className="FormControl" severity="error">
          Change network to mainnet (phoenix-1) and refresh 
          the page to check your allocation
        </Alert>
      )}

      {wallet && chain && isInstalled(wallet) && (
        <div className="ConnectWalletFooter">
          <Button
            disabled={warnSwitchNetwork}
            variant="contained"
            fullWidth
            onClick={() => handleConnectWallet()}
          >
            Use {wallet.name} with {chain?.name}
          </Button>
        </div>
      )}
    </div>
  );
};
