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


    send(self, :after_join)
    Logger.info("#{user_id} joined the room:#{room_id} channel")
    {:ok, socket}
  end

  def handle_info(:after_join, socket) do
    # Get the room ID
    room_id = socket.assigns.room_id

    # Retrieve the drawing data
    redis = socket.assigns.redis
    room_drawing = Redix.command!(redis, ["HGETALL", "room_drawings:#{room_id}"])

    # Broadcast the drawing data to the client
    push(socket, "sync_drawing", %{body: room_drawing})
    {:noreply, socket}
  end


  def handle_in("draw", %{"body" => body}, socket) do
    redis = socket.assigns.redis

    # Get values
    x_coordinate = body["x"]
    y_coordinate = body["y"]
    color = body["color"]
    thickness = body["thickness"]

    # Build the hash key
    room_id = socket.assigns.room_id
    room_drawings_key = "room_drawings:#{room_id}"

    # Build the coordinate key for previous key
    coord_key = "{x: #{x_coordinate}, y: #{y_coordinate}}"

    # Build the corresponding coordinate value
    coord_value = "{color: #{color}, thickness: #{thickness}}"

    Redix.command(redis, ["HSET", room_drawings_key, coord_key, coord_value])

    broadcast!(socket, "draw", %{body: body})
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

  def handle_in("mouse_movement", %{"body" => body}, socket) do
    user_id = socket.assigns.user_id
    res = Map.put(body, :user_id, user_id)
    broadcast!(socket, "mouse_movement", %{body: res})
    {:noreply, socket}
  end

  def terminate(_reason, socket) do
    user_id = socket.assigns.user_id
    room_id = socket.assigns.room_id
    redis = socket.assigns.redis
    Redix.command(redis, ~w(LREM users 0 #{user_id}))
    Redix.command(redis, ~w(LREM room_users:#{room_id} 0 #{user_id}))

    # Broadcast to room that a user has left
    broadcast!(socket, "new_msg", %{body: user_id <> " left the room ;_;"})

    # Broadcast to room to update user list
    room_id = socket.assigns.room_id
    user_list = Redix.command!(redis, ["LRANGE", "room_users:#{room_id}", "0", "-1"])
    broadcast!(socket, "update_user_list", %{body: user_list})

    # If room admin left, disconnect everone
    if socket.assigns.room_admin do
      broadcast!(socket, "disconnect", %{})
    end

    # If room is empty, delete room drawing and password
    len = Redix.command!(redis, ["LLEN", "room_users:#{room_id}"])
    if len == 0 do
      Redix.command(redis, ~w(DEL room_passwords:#{room_id}))
      Redix.command(redis, ~w(DEL room_drawings:#{room_id}))
    end

    Redix.stop(redis)

    :ok
  end
end
