defmodule SharedcanvasWeb.LobbyController do
  use SharedcanvasWeb, :controller

  def lobby(conn, %{"user_id" => user_id}) do
    conn
    |> assign(:user_id, user_id)
    |> render(:lobby)
  end
end
