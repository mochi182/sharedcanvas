defmodule SharedcanvasWeb.RoomChannel do
  use Phoenix.Channel
  require Logger

  def join("room:" <> room_id, _message, socket) do
    user_id = socket.assigns.user_id

    # Assign room_id to socket
    socket = assign(socket, :room_id, room_id)

    # Obtain Redis connection
    redis = socket.assigns.redis

    # Insert the user ID into the Redis list
    {:ok, _res} = Redix.command(redis, ~w(LPUSH room_users:#{room_id} #{user_id}))

    Logger.info("#{user_id} joined the room:#{room_id} channel")
    {:ok, socket}
  end

  # def join("room:" <> _room_id, _params, _socket) do
  #  {:error, %{reason: "unauthorized"}}
  # end

  def handle_in("new_msg", %{"body" => body}, socket) do
    redis = socket.assigns.redis
    # Store mouse point in Redis with a unique ID and associated room name
    {:ok, point_id} = Redix.command(redis, ["INCR", "point_id"])

    Redix.command(redis, [
      "HMSET",
      "points:#{point_id}",
      "x",
      body["x"],
      "y",
      body["y"],
      "room",
      socket.topic
    ])

    broadcast!(socket, "new_msg", %{body: point_id})
    {:noreply, socket}
  end

  def handle_in("test", _message, socket) do
    Logger.info("Test")
    {:noreply, socket}
  end

  def terminate(_reason, socket) do
    user_id = socket.assigns.user_id
    room_id = socket.assigns.room_id
    redis = socket.assigns.redis
    Redix.command(redis, ~w(LREM users 0 #{user_id}))
    Redix.command(redis, ~w(LREM room_users:#{room_id} 0 #{user_id}))
    Redix.stop(redis)
    :ok
  end
end
