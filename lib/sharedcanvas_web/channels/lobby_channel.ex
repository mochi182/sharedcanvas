defmodule SharedcanvasWeb.LobbyChannel do
  use SharedcanvasWeb, :channel

  def join("lobby", _message, socket) do
    user_id = socket.assigns.user_id

    # Connect to Redis
    {:ok, redis} = Redix.start_link(host: "localhost", port: 6379, database: 1)

    # Insert the user ID into the Redis list
    {:ok, _res} = Redix.command(redis, ~w(LPUSH users #{user_id}))

    # Stop the Redis connection
    Redix.stop(redis)

    {:ok, socket}
  end

  def handle_in("new_msg", %{"body" => body}, socket) do
    user_id = socket.assigns.user_id
    broadcast!(socket, "new_msg", %{body: user_id <> ": " <> body})
    {:noreply, socket}
  end

  def terminate(reason, socket) do
    user_id = socket.assigns.user_id
    {:ok, redis} = Redix.start_link(host: "localhost", port: 6379, database: 1)
    Redix.command(redis, ~w(LREM users 0 #{user_id}))
    Redix.stop(redis)
    :ok
  end
end
