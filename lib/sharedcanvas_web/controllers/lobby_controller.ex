defmodule SharedcanvasWeb.LobbyController do
  use SharedcanvasWeb, :controller

  def lobby(conn, %{"name" => name}) do
    conn
    |> assign(:name, name)
    |> render(:lobby)
  end

end
