// chat.js

export function setupChat(channel) {

    let chatInput = document.querySelector("#chat-input")
    let messagesContainer = document.querySelector("#messages")

    chatInput.addEventListener("keypress", event => {
        if (event.key === 'Enter') {
            channel.push("new_msg", { body: chatInput.value })
            chatInput.value = ""
        }
    })

    channel.on("new_msg", payload => {
        let messageItem = document.createElement("p")
        messageItem.innerText = `[${Date()}] ${payload.body}`
        messagesContainer.appendChild(messageItem)
    })
}
