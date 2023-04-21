defmodule Sharedcanvas.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Telemetry supervisor
      SharedcanvasWeb.Telemetry,
      # Start the Ecto repository
      Sharedcanvas.Repo,
      # Start the PubSub system
      {Phoenix.PubSub, name: Sharedcanvas.PubSub},
      # Start Finch
      {Finch, name: Sharedcanvas.Finch},
      # Start the Endpoint (http/https)
      SharedcanvasWeb.Endpoint
      # Start a worker by calling: Sharedcanvas.Worker.start_link(arg)
      # {Sharedcanvas.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Sharedcanvas.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    SharedcanvasWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
