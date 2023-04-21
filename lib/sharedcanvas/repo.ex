defmodule Sharedcanvas.Repo do
  use Ecto.Repo,
    otp_app: :sharedcanvas,
    adapter: Ecto.Adapters.MyXQL
end
