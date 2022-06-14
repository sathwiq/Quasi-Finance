import React from "react";
import "./App.css";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import Main from "./components/main";
import {orange} from "@mui/material/colors";

export default function App() {
    let darkTheme;
    darkTheme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: orange[500],
            },
        }
    });

    return (
        <ThemeProvider theme={darkTheme}>
            <Main/>
        </ThemeProvider>
    );
}
