defmodule SharedcanvasWeb.RoomChannel do
  use Phoenix.Channel
  require Logger

  def join("room:" <> _private_room_id, _message, socket) do
    IO.puts("Client joined the room:lobby channel")
    Logger.info("Connecting to Redis...")
    {:ok, redis} = Redix.start_link(host: "localhost", port: 6379, database: 1)
    Logger.info("Connected to Redis.")
    Logger.info(socket.assigns.user_id)
    {:ok, assign(socket, :redis, redis)}
  end

  #def join("room:" <> _private_room_id, _params, _socket) do
  #  {:error, %{reason: "unauthorized"}}
  #end

  def handle_in("new_msg", %{"body" => body}, socket) do
    redis = socket.assigns.redis
    # Store mouse point in Redis with a unique ID and associated room name
    {:ok, point_id} = Redix.command(redis, ["INCR", "point_id"])
    Redix.command(redis, ["HMSET", "points:#{point_id}", "x", body["x"], "y", body["y"], "room", socket.topic])
    broadcast!(socket, "new_msg", %{body: point_id})
    {:noreply, socket}
  end

  def handle_in("test", _message, socket) do
    Logger.info("Test")
    {:noreply, socket}
  end

  def handle_info(:after_join) do
    Logger.info("After join")
  end

end
