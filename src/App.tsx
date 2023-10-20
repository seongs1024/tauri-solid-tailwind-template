import { createSignal } from "solid-js";
import logo from "./assets/logo.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

import WebPageInput from "./WebPageInput"
import WebPageView from "./WebPageView"

function App() {
    const [url, setUrl] = createSignal("");

    return (
        <div class="grid grid-cols-[minmax(400px,_1fr)_minmax(200px,_2fr)] divide-x h-screen">
            <WebPageInput url={url} setUrl={setUrl} />
            <WebPageView url={url} />
        </div>
    );
}

export default App;
