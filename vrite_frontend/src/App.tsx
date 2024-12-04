import { createSignal } from "solid-js";
import Editor from "./Editor";
import Watcher from "./Watcher";

function App() {
  const [mode, setMode] = createSignal<"editor" | "watcher">("editor");

  return (
    <div>
      <h1>Vrite - Minimal Google Docs Clone</h1>
      <button onClick={() => setMode("editor")}>Editor</button>
      <button onClick={() => setMode("watcher")}>Watcher</button>
      {mode() === "editor" ? <Editor /> : <Watcher />}
    </div>
  );
}

export default App;
