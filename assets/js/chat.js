// chat.js

export function setupChat(channel) {

    let chatInput = document.querySelector("#chat-input")
    let messagesContainer = document.querySelector("#messages")

    // New message event:
    chatInput.addEventListener("keypress", event => {
        if (event.key === 'Enter') {
            channel.push("new_msg", { body: chatInput.value })
            chatInput.value = ""
        }
    })

    channel.on("new_msg", payload => {
        let messageItem = document.createElement("p")
        const now = new Date();
        const dateStr = `(${now.getDate()}/${('0' + (now.getMonth() + 1)).slice(-2)}/${now.getFullYear()})`;
        const timeStr = `${now.getHours()}:${('0' + now.getMinutes()).slice(-2)}:${('0' + now.getSeconds()).slice(-2)}`;
        messageItem.innerText = `${dateStr + ' ' + timeStr}: ${payload.body}`;
        messagesContainer.appendChild(messageItem)
    })

    // After join event
    window.addEventListener("load", () => {
        channel.push("after_join", {})
    })

}
