import Routes from "@pages";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "@components/ui";
import ErrorNotification from "./notifications/ErrorNotification";

const MyApp = () => (
    <BrowserRouter>
        <SnackbarProvider>
            <ErrorNotification />
            <Routes />
        </SnackbarProvider>
    </BrowserRouter>
);

export default MyApp;
