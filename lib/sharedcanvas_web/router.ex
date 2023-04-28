defmodule SharedcanvasWeb.Router do
  use SharedcanvasWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, {SharedcanvasWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", SharedcanvasWeb do
    pipe_through :browser

    get "/", PageController, :home
    post "/verify_user", PageController, :verify_user
    post "/lobby", LobbyController, :lobby
    post "/verify_password", LobbyController, :verify_password
    post "/verify_room_users", LobbyController, :verify_room_users
    post "/room", RoomController, :room
  end

  # Other scopes may use custom stacks.
  # scope "/api", SharedcanvasWeb do
  #   pipe_through :api
  # end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:sharedcanvas, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: SharedcanvasWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
