import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import { getChainOptions, WalletProvider } from '@terra-money/wallet-provider';
import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { MetaMaskProvider } from "metamask-react";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#2b32b2',
        },
    },
});

getChainOptions().then((chainOptions) => {
    root.render(
        <React.StrictMode>
            <ThemeProvider theme={darkTheme}>
                <SnackbarProvider
                    autoHideDuration={5000}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center'}}>
                    <MetaMaskProvider>
                        <WalletProvider {...chainOptions}>
                            <App />
                        </WalletProvider>
                    </MetaMaskProvider>
                </SnackbarProvider>
            </ThemeProvider>
        </React.StrictMode>
    );
});