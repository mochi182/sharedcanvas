import {Socket} from "phoenix"
import {setupSharedCanvas} from "./shared_canvas"

var user_id = document.currentScript.getAttribute('user_id');
var room_id = document.currentScript.getAttribute('room_id');
var csrf_token = document.currentScript.getAttribute('csrf_token');

let socket = new Socket("/socket", { params: { user_id: user_id, room_id: room_id } })

socket.connect()

let channel = socket.channel("room:" + room_id, {})

setupSharedCanvas(channel, user_id, csrf_token)

channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

export default socket