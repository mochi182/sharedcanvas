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

  def handle_in("after_join", _params, socket) do
    user_id = socket.assigns.user_id
    broadcast!(socket, "new_msg", %{body: user_id <> " has joined!"})
    {:noreply, socket}
  end

  def terminate(_reason, socket) do
    user_id = socket.assigns.user_id
    redis = socket.assigns.redis
    Redix.command(redis, ~w(LREM users 0 #{user_id}))
    Redix.stop(redis)
    :ok
  end
end

#user_id = socket.assigns.user_id
#broadcast!(socket, "new_msg", %{body: user_id <> " has joined!"})
