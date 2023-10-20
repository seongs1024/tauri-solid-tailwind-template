import { createSignal, Accessor, Component, Setter } from "solid-js";
import {invoke } from "@tauri-apps/api/tauri"

const WebPageInput: Component<{
    url: Accessor<string>
    setUrl: Setter<string>
}> = (props) => {
    const [value, setValue] = createSignal(props.url());

    return(
        <div class="m-0 flex flex-col justify-center text-center">
            <h1>Welcome to Tauri!</h1>
            <form
                class="flex justify-center"
                onSubmit={(e) => {
                    e.preventDefault();
                    props.setUrl(value())
                }}
            >
                <input
                    class="mr-2"
                    onChange={(e) => setValue(e.currentTarget.value)}
                    placeholder="Enter a url..."
                />
                <button>submit</button>
            </form>
            <button onClick={async () => {await invoke("open_docs", { url: value() });}}>create window</button>
        </div>
    )
}

export default WebPageInput;