defmodule SharedcanvasWeb.PageController do
  use SharedcanvasWeb, :controller

  def home(conn, _params) do
    render(conn, :home, layout: false)
  end

end
