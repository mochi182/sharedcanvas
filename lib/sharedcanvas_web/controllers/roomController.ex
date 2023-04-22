defmodule SharedcanvasWeb.RoomController do
  use SharedcanvasWeb, :controller

  def index(conn, _params) do
    render(conn, :index)
  end
end
