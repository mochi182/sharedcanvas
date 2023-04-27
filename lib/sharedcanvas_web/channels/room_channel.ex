defmodule SharedcanvasWeb.RoomChannel do
  use Phoenix.Channel
  require Logger

  def join("room:" <> private_room_id, _message, socket) do
    user_id = socket.assigns.user_id

    # Connect to Redis
    {:ok, redis} = Redix.start_link(host: "localhost", port: 6379, database: 1)

    # Insert the user ID into the Redis list
    {:ok, _res} = Redix.command(redis, ~w(LPUSH users #{user_id}))

    # Stop the Redis connection
    Redix.stop(redis)

    Logger.info("#{user_id} joined the room:#{private_room_id} channel")
    Logger.info("Connected to Redis")

    {:ok, assign(socket, :redis, redis)}
  end

  # def join("room:" <> _private_room_id, _params, _socket) do
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

  def terminate(reason, socket) do
    user_id = socket.assigns.user_id
    {:ok, redis} = Redix.start_link(host: "localhost", port: 6379, database: 1)
    Redix.command(redis, ~w(LREM users 0 #{user_id}))
    Redix.stop(redis)
    :ok
  end
end
