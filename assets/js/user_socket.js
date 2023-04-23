import {Socket} from "phoenix"
import {setupChat} from "./chat"
import {setupSharedCanvas} from "./shared_canvas"

let socket = new Socket("/socket", {params: {token: window.userToken}})

socket.connect()

let channel = socket.channel("room:lobby", {})

//setupChat(channel)
setupSharedCanvas(channel)

channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

export default socket