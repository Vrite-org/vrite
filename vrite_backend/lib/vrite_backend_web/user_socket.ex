defmodule VriteBackendWeb.UserSocket do
  use Phoenix.Socket

  # Define the channels and their topics
  channel "document:*", VriteBackendWeb.DocumentChannel  # map the channels

  # Default connect and id behavior
  def connect(_params, socket, _connect_info) do
    {:ok, socket}
  end

  def id(_socket), do: nil
end
