// chat.js

export function setupChat(channel) {

    let chatInput = document.querySelector("#chat-input")

    // New message event:
    chatInput.addEventListener("keypress", event => {
        if (event.key === 'Enter') {
            channel.push("new_msg", { body: chatInput.value })
            chatInput.value = ""
        }
    })

    channel.on("new_msg", payload => {
        let messagesContainer = document.querySelector("#messages")
        let messageItem = document.createElement("p")
        messageItem.classList.add("messageItem");
        const now = new Date();
        const dateStr = `(${now.getDate()}/${('0' + (now.getMonth() + 1)).slice(-2)}/${now.getFullYear()})`;
        const hour = now.getHours() % 12 || 12;
        const period = now.getHours() >= 12 ? 'pm' : 'am';
        const timeStr = `${hour}:${('0' + now.getMinutes()).slice(-2)}:${('0' + now.getSeconds()).slice(-2)} ${period}`;
        messageItem.innerText = `${dateStr + ' ' + timeStr}: ${payload.body}`;
        messagesContainer.insertBefore(messageItem, messagesContainer.firstChild);
    })
    

    // After join event
    window.addEventListener("load", () => {
        channel.push("after_join", {})
    })

}
