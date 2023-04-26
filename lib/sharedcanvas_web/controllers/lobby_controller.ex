defmodule SharedcanvasWeb.LobbyController do
  use SharedcanvasWeb, :controller

  def lobby(conn, _params) do
    render(conn, :lobby)
  end
end
