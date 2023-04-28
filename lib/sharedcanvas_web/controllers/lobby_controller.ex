defmodule SharedcanvasWeb.LobbyController do
  use SharedcanvasWeb, :controller

  def lobby(conn, %{"user_id" => user_id}) do
    conn
    |> assign(:user_id, user_id)
    |> render(:lobby)
  end

  def verify_password(conn, params) do
    # Connect to Redis
    {:ok, redis} = Redix.start_link(host: "localhost", port: 6379, database: 1)

    # Obtain room_id from params
    room_id = params["room_id"]
    room_pw = params["room_pw"]

    # Check if room_users list is empty
    len = Redix.command!(redis, ["LLEN", "room_users:#{room_id}"])
    if len == 0 do
      # Insert the password to Redis
      Redix.command!(redis, ["SET", "room_passwords:#{room_id}", room_pw])

      # Stop the Redis connection
      Redix.stop(redis)

      conn
      |> put_status(200)
      |> json(%{ verified: true })
    else
      # Obtain the password from Redis
      password = Redix.command!(redis, ["GET", "room_passwords:#{room_id}"])

      # Stop the Redis connection
      Redix.stop(redis)

      case password do
        nil ->
          conn
          |> put_status(400)
          |> json(%{ error: "Room password not set" })

        _ ->
          if password == room_pw do
            conn
            |> put_status(200)
            |> json(%{ verified: true })
          else
            conn
            |> put_status(200)
            |> json(%{ verified: false })
          end
      end
    end
  end

  def verify_room_users(conn, %{"room_id" => room_id}) do
    # Connect to Redis
    {:ok, redis} = Redix.start_link(host: "localhost", port: 6379, database: 1)

    # Check if the number of users in the room is less than 6
    len = Redix.command!(redis, ["LLEN", "room_users:#{room_id}"])

    less_than_six = len < 5

    # Stop the Redis connection
    Redix.stop(redis)

    conn
    |> json(%{ less_than_six: less_than_six })
  end

end
