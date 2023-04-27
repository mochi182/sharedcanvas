defmodule SharedcanvasWeb.RoomController do
  use SharedcanvasWeb, :controller

  def room(conn, params) do
    user_id = params["user_id"]
    room_id = params["room_id"]

    conn
    |> assign(:user_id, user_id)
    |> assign(:room_id, room_id)
    |> render(:room)
  end

end
