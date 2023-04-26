defmodule SharedcanvasWeb.LobbyChannel do
  use SharedcanvasWeb, :channel

  def join("lobby", _message, socket) do
    {:ok, socket}
  end

  def handle_in("new_msg", %{"body" => body}, socket) do
    user_id = socket.assigns.user_id
    broadcast!(socket, "new_msg", %{body: user_id <> ": " <> body})
    {:noreply, socket}
  end

end
