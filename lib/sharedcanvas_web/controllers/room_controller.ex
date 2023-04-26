defmodule SharedcanvasWeb.RoomController do
  use SharedcanvasWeb, :controller
  def room(conn, _params) do
    render(conn, :room)
  end
end
