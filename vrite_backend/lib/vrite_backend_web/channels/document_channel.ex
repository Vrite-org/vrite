defmodule VriteBackendWeb.DocumentChannel do
  use Phoenix.Channel

  # Handle the join request to a document channel
  def join("document:" <> document_id, _params, socket) do
    socket = assign(socket, :document_id, document_id)

    case :ets.lookup(:document_store, document_id) do
      [] ->
        # Initialize document with empty content
        :ets.insert(:document_store, {document_id, %{"content" => ""}})
        {:ok, %{"status" => "created"}, socket}

      [{_id, doc}] ->
        {:ok, doc, socket}
    end
  end

  # Handle "update" messages sent from the client
  def handle_in("update", %{"content" => content}, socket) do
    document_id = socket.assigns.document_id

    IO.inspect(content, label: "Received content from client")

    # Update the ETS table with the new state
    :ets.insert(:document_store, {document_id, %{"content" => content}})

    # Broadcast the updated content to all clients
    broadcast!(socket, "update", %{"content" => content})
    {:noreply, socket}
  end
end
