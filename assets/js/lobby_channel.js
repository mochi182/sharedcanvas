import { Socket } from "phoenix"
import { setupChat } from "./chat"

var user_id = document.currentScript.getAttribute('user_id');

let socket = new Socket("/socket", { params: { user_id: user_id } })

socket.connect()

let channel = socket.channel("lobby", {})

setupChat(channel)

channel.join()
    .receive("ok", resp => { console.log("Joined successfully", resp) })
    .receive("error", resp => { console.log("Unable to join", resp) })

export default socket