defmodule SharedcanvasWeb.RoomChannel do
  use Phoenix.Channel
  require Logger

  def join("room:" <> room_id, _message, socket) do
    user_id = socket.assigns.user_id

    # Assign room_id to socket
    socket = assign(socket, :room_id, room_id)

    # Obtain Redis connection
    redis = socket.assigns.redis

    # Check if room_users list is empty
    len = Redix.command!(redis, ["LLEN", "room_users:#{room_id}"])

    # Check if user is room_admin
    room_admin = len == 0
    socket = assign(socket, :room_admin, room_admin)

    # Insert the user ID into the Redis list
    {:ok, _res} = Redix.command(redis, ~w(LPUSH room_users:#{room_id} #{user_id}))

    Logger.info("#{user_id} joined the room:#{room_id} channel")
    {:ok, socket}
  end

  def handle_in("draw", %{"body" => body}, socket) do
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

    broadcast!(socket, "draw", %{body: point_id})
    {:noreply, socket}
  end

  def handle_in("test", _message, socket) do
    Logger.info("Test")
    {:noreply, socket}
  end

  def handle_in("new_msg", %{"body" => body}, socket) do
    user_id = socket.assigns.user_id
    broadcast!(socket, "new_msg", %{body: user_id <> ": " <> body})
    {:noreply, socket}
  end

  def handle_in("after_join", _params, socket) do
    user_id = socket.assigns.user_id

    # Broadcast to room that a new user has joined
    broadcast!(socket, "new_msg", %{body: user_id <> " has joined!"})

    # Broadcast to room to update user list
    redis = socket.assigns.redis
    room_id = socket.assigns.room_id
    user_list = Redix.command!(redis, ["LRANGE", "room_users:#{room_id}", "0", "-1"])
    broadcast!(socket, "update_user_list", %{body: user_list})

    {:noreply, socket}
  end

  def terminate(_reason, socket) do
    user_id = socket.assigns.user_id
    room_id = socket.assigns.room_id
    redis = socket.assigns.redis
    Redix.command(redis, ~w(LREM users 0 #{user_id}))
    Redix.command(redis, ~w(LREM room_users:#{room_id} 0 #{user_id}))

    # Broadcast to room to update user list
    redis = socket.assigns.redis
    room_id = socket.assigns.room_id
    user_list = Redix.command!(redis, ["LRANGE", "room_users:#{room_id}", "0", "-1"])
    broadcast!(socket, "update_user_list", %{body: user_list})

    # If the user is the room admin, do stuff here
    if socket.assigns.room_admin do
      # Do stuff here

      # Remove room password from room_passwords
      # redis_remove_pw_command = ~w(DEL room_passwords:#{room_id})
      # Redix.command(redis, redis_remove_pw_command)
    end

    Redix.stop(redis)

    :ok
  end
end
