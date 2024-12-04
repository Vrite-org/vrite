defmodule VriteBackend.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # One-time setup to create the ETS table for documents
      {Task, fn -> :ets.new(:document_store, [:named_table, :public, read_concurrency: true]) end},
      VriteBackendWeb.Telemetry,
      {DNSCluster, query: Application.get_env(:vrite_backend, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: VriteBackend.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: VriteBackend.Finch},
      # Start a worker by calling: VriteBackend.Worker.start_link(arg)
      # {VriteBackend.Worker, arg},
      # Start to serve requests, typically the last entry
      VriteBackendWeb.Endpoint,
      # Start the DocumentChannel supervisor
      {VriteBackendWeb.DocumentChannel, []}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: VriteBackend.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    VriteBackendWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
