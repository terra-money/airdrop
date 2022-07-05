import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import { getChainOptions, WalletProvider } from '@terra-money/wallet-provider';
import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SnackbarProvider } from 'notistack';
import { MetaMaskProvider } from "metamask-react";
import { LandingPage } from './components/LandingPage';

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
                    autoHideDuration={2000}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right'}}>
                    <MetaMaskProvider>
                        <WalletProvider {...chainOptions}>
                            <BrowserRouter>
                                <Routes>
                                    <Route path="/" element={<LandingPage />} />
                                    <Route path="/wizard" element={<App />} />
                                </Routes>
                            </BrowserRouter>
                        </WalletProvider>
                    </MetaMaskProvider>
                </SnackbarProvider>
            </ThemeProvider>
        </React.StrictMode>
    );
});