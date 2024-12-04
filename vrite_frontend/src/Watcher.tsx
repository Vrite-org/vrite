import { createEffect } from "solid-js";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, Slice } from "prosemirror-model";
import { Socket } from "phoenix";

const schema = new Schema({
  nodes: {
    doc: { content: "paragraph+" },
    paragraph: { content: "text*", toDOM: () => ["p", 0] },
    text: {
        toDOM: (node) => ["span", {}, node.text], // 'span' as the wrapping element
    },
  },
});

export default function Watcher() {
  let editorDiv: HTMLDivElement | undefined;

  createEffect(() => {
    if (editorDiv) {
      // Initialize ProseMirror in read-only mode
      const state = EditorState.create({
        schema,
        doc: schema.node("doc", null, [schema.node("paragraph")]),
      });

      const view = new EditorView(editorDiv, {
        state,
        editable: () => false, // Read-only editor
      });

      // Connect to Phoenix Channels
      const socket = new Socket("ws://localhost:4000/socket");
      socket.connect();
      const channel = socket.channel("document:1");
      channel.join().receive("ok", (response) => {
        // Load the initial state from the server
        if (response.content) {
          const newDoc = schema.nodeFromJSON(response.content);
          
          // Convert the Fragment to a Slice
          const slice = new Slice(newDoc.content, 0, 0); // openStart and openEnd are 0
          
          // Replace the content in the transaction
          const tr = view.state.tr.replace(0, view.state.doc.content.size, slice);
          view.updateState(view.state.apply(tr));
        }
      });

      // Handle updates from the server
      channel.on("update", (payload) => {
        const newDoc = schema.nodeFromJSON(payload.content);

        // Convert the Fragment to a Slice
        const slice = new Slice(newDoc.content, 0, 0); // openStart and openEnd are 0

        // Replace the content in the transaction
        const tr = view.state.tr.replace(0, view.state.doc.content.size, slice);
        view.updateState(view.state.apply(tr));
      });

      return () => view.destroy();
    }
  });

  return <div ref={(el) => {
    editorDiv = el;
    console.log(editorDiv); // Check if the editorDiv is assigned
  }} />;
}
