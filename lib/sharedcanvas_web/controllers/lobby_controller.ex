defmodule SharedcanvasWeb.LobbyController do
  use SharedcanvasWeb, :controller

  def lobby(conn, %{"user_id" => user_id}) do

    {:ok, redis} = Redix.start_link(host: "localhost", port: 6379, database: 1)

    # Insert the user ID into the Redis list
    {:ok, _res} = Redix.command(redis, ~w(LPUSH users #{user_id}))

    # Unregister the Redis client alias and stop the Redis connection
    Redix.stop(redis)

    conn
    |> assign(:user_id, user_id)
    |> render(:lobby)
  end
end
