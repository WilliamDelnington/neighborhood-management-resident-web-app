import Routes from "@pages";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "@components/ui";
import ErrorNotification from "./notifications/ErrorNotification";
import ErrorBoundary from "./ErrorBoundary";
import AuthBootstrap from "./AuthBootstrap";

const MyApp = () => (
    <BrowserRouter>
        <SnackbarProvider>
            <ErrorNotification />
            <AuthBootstrap />
            <ErrorBoundary>
                <Routes />
            </ErrorBoundary>
        </SnackbarProvider>
    </BrowserRouter>
);

export default MyApp;
