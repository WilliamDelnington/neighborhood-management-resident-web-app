import Routes from "@pages";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "@components/ui";
import ErrorNotification from "./notifications/ErrorNotification";
import ErrorBoundary from "./ErrorBoundary";

const MyApp = () => (
    <BrowserRouter>
        <SnackbarProvider>
            <ErrorNotification />
            <ErrorBoundary>
                <Routes />
            </ErrorBoundary>
        </SnackbarProvider>
    </BrowserRouter>
);

export default MyApp;
