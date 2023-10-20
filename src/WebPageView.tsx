import { createResource, Accessor, Setter, Component, Switch, Match } from "solid-js";
import { Portal } from "solid-js/web";
import {invoke } from "@tauri-apps/api/tauri"

const WebPageView: Component<{
    url: Accessor<string>
}> = (props) => {
    const getByCrossOrigin = async (url: string) => {
        const text = await invoke<Uint8Array>("get_by_cross_origin", { url: url })
            .then((data) => {
                console.log(data)
                var text = Utf8ArrayToStr(data);
                console.log(text)
                return text;
            })
            .catch((e) => {
                throw e;
            });
        return text;
    }

    const [data] = createResource(props.url, getByCrossOrigin);

    return(
        <div class="m-0 flex flex-col justify-center text-center">
            <h1>WebPageView</h1>
            <p>{props.url()}</p>
            <Switch>
                <Match when={data.state === "pending" || data.state === "unresolved"}>
                    <p>Loading...</p>
                </Match>
                <Match when={data.state === "ready"}>
                    {make_div(data()!)}
                </Match>
                <Match when={data.state === "errored"}>
                    <p>{data.error}</p>
                </Match>
            </Switch>
        </div>
    )
}

export default WebPageView;

function make_div(data: string) {
    const host = document.createElement("div");
    const shadow = host?.attachShadow({ mode: "open" });
    shadow.innerHTML = data;
    return host
}

function Utf8ArrayToStr(array: Uint8Array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while(i < len) {
    c = array[i++];
    switch(c >> 4)
    { 
      case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12: case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) |
                       ((char2 & 0x3F) << 6) |
                       ((char3 & 0x3F) << 0));
        break;
    }
    }

    return out;
}