import { Socket } from "phoenix"
import { setupSharedCanvas } from "./shared_canvas"
import { setupChat } from "./chat"

var name = document.currentScript.getAttribute('name');
let socket = new Socket("/socket", { params: { user_id: name } })

socket.connect()

// Get room from URL:
const path = window.location.pathname;
const channelName = path.substring(1); // Remove leading slash

// Set up channel:
let channel = socket.channel(channelName, {})

if (channelName === "room") {
    setupSharedCanvas(channel)
} else if (channelName === "lobby") {
    setupChat(channel)
}

channel.join()
    .receive("ok", resp => { console.log("Joined successfully", resp) })
    .receive("error", resp => { console.log("Unable to join", resp) })

export default socket