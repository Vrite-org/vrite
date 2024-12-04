import { createEffect } from "solid-js";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, DOMParser, Slice } from "prosemirror-model";
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

export default function Editor() {
  let editorDiv: HTMLDivElement | undefined;

  createEffect(() => {
    // Initialize ProseMirror
    const state = EditorState.create({
      schema,
      doc: DOMParser.fromSchema(schema).parse(document.createElement("div")),
    });

    if (editorDiv) {
        const view = new EditorView(editorDiv, { state });
    
        // Connect to Phoenix Channels
        const socket = new Socket("ws://localhost:4000/socket");
        socket.connect();
        const channel = socket.channel("document:1");
        channel.join();

        // Broadcast updates
        view.setProps({
            dispatchTransaction(transaction) {
              const newState = view.state.apply(transaction);
              view.updateState(newState);
              const content = newState.doc.toJSON();
              console.log("Pushing update:", content); // Log the content to check if its working
              channel.push("update", { content });
            },
          });
          

        // Handle updates from server
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
    console.log(editorDiv);
  }} />;
}
