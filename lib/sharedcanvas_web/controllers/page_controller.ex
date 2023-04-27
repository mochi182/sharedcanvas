defmodule SharedcanvasWeb.PageController do
  use SharedcanvasWeb, :controller

  def home(conn, _params) do
    render(conn, :home, layout: false)
  end

  def verify_user(conn, params) do
    case params["user_id"] do
      nil ->
        conn
        |> put_status(400)
        |> json(%{ error: "User ID is required" })

      user_id ->
        # Connect to Redis
        {:ok, redis} = Redix.start_link(host: "localhost", port: 6379, database: 1)

        # Check if the user already exists in the Redis list
        index = Redix.command!(redis, ["LPOS", "users", user_id])
        exists = !is_nil(index)

        # Stop the Redis connection
        Redix.stop(redis)

        conn
        |> json(%{ exists: exists })
    end
  end

end
