const socket = io({
    auth: {
        token: window.localStorage.getItem('token')
    }
})

let lastSelectedUserId

async function renderUsers(users) {
    for (const user of users) {
        const li = document.createElement('li')

        li.classList.add('chats-item')
        li.innerHTML = `
            <img src="${'/file/' + token + '/' + user.userImg}" alt="profile-picture">
            <p>${user.username}</p>
            <span data-id="${user.userId}" class="${user.socketId ? 'online-indicator' : ''}"></span>
        `

        chatsList.append(li)

        li.onclick = () => {
            lastSelectedUserId = user.userId
            window.localStorage.setItem('lastSelectedUserId', lastSelectedUserId)

            uploadedFiles.innerHTML = null
            chatsMain.innerHTML = null
            form.style.display = 'flex'
            chatsMain.style.display = 'flex'

            renderCurrentChat(user)
            getMessages(user.userId)
        }
    }
}

async function renderMessages(messages) {
    for (const message of messages) {
        const div = document.createElement('div')
        div.dataset.id = message.messageId

        const isMyMessage = !(lastSelectedUserId == message.messageTo.userId)
        div.classList.add('msg-wrapper', !isMyMessage ? 'msg-from' : null)

        const date = new Date(message.createdAt)
        const hour = date.getHours().toString().padStart(2, 0)
        const minute = date.getMinutes().toString().padStart(2, 0)
        const time = hour + ':' + minute

        if (message.messageType === 'plain/text') {
            div.innerHTML = `
                <img class="profile-img" src="${'/file/' + token + '/' + message.messageFrom.userImg}" alt="profile-picture">
                <div class="msg-text">
                    <p class="msg-author">${message.messageFrom.username}</p>
                    <p data-id="${message.messageId}" class="msg" onkeydown="updateMessage(event, this, ${message.messageId})" ${!isMyMessage ? 'contentEditable' : null}>${message.messageBody}</p>
                    <p class="time">${time}</p>
                </div>
                <img onclick="deleteMessage(this, event, ${message.messageId})" class="delete-icon ${!isMyMessage ? 'delete-icon-active' : ''}" src="https://cdn3.iconfinder.com/data/icons/flat-actions-icons-9/792/Close_Icon_Dark-512.png">
            ` 
        } else {
            div.innerHTML = `
                <img class="profile-img" src="${'/file/' + token + '/' + message.messageFrom.userImg}" alt="profile-picture">
                <div class="msg-text">
                    <p class="msg-author">${message.messageFrom.username}</p>
                    ${
                        !message.messageType.startsWith('video/') ?
                        `<object data="${'/file/' + token + '/' + message.messageBody}" type="${message.messageType}" class="msg object-class"></object>` :
                        `<video muted controls src="${'/file/' + token + '/' + message.messageBody}" type="${message.messageType}" class="msg object-class"></video>`
                    }
                    <a href="${'/download/' + token + '/' + message.messageBody}">
                        <img src="./img/download.png" width="25px">
                    </a>
                    <p class="time">${time}</p>
                </div>
                <img onclick="deleteMessage(this, event, ${message.messageId})" class="delete-icon ${!isMyMessage ? 'delete-icon-active' : ''}" src="https://cdn3.iconfinder.com/data/icons/flat-actions-icons-9/792/Close_Icon_Dark-512.png">
            ` 

            renderCurrentChatFile(message)
        }

        chatsMain.append(div)
    }

    chatsMain.scrollTo({ top: 1000000000 })
}

async function renderCurrentChat(user) {
    chatImg.src = '/file/' + token + '/' + user.userImg
    chatUsername.textContent = user.username
}

async function renderCurrentChatFile(message) {
    const li = document.createElement('li')
    li.classList.add('uploaded-file-item')
    li.innerHTML = `
        <a target="__blank" href="${'/file/' + token + '/' + message.messageBody}">
            <img src="./img/file.png" alt="file" width="30px">
            <p>${message.messageBody}</p>
        </a>
    `

    uploadedFiles.append(li)
}

async function renderProfileData() {
    profileImg.src = '/profileAvatar/' + token
    profileUsername.textContent = await (await fetch('/profileUsername/' + token)).text()
}

async function postMessage(messageBody, type) {
    if (type === 'text' && lastSelectedUserId) {
        const response = await request('/messages', 'POST', {
            messageBody,
            userId: lastSelectedUserId
        })
        if (response.status === 200) renderMessages([response.data])
    } else if(type === 'file' && lastSelectedUserId) {
        const formData = new FormData()
        formData.append('file', messageBody)
        formData.append('messageBody', 'sdfsdfsfs')
        formData.append('userId', lastSelectedUserId)

        const response = await request('/messages', 'POST', formData)
        if (response.status === 200) renderMessages([response.data])
    }
}

async function updateMessage(event, element, messageId) {
    if (!updateMessage.cacheText) {
        updateMessage.cacheText = element.textContent
    }

    if (event.keyCode !== 13) return 

    element.textContent = element.textContent.trim()
    element.blur()

    if (!element.textContent.length) {
        element.textContent = updateMessage.cacheText
        updateMessage.cacheText = null
        return
    }

    await request('/messages/' + messageId, 'PUT', {
        messageBody: element.textContent
    })
    updateMessage.cacheText = null
}

async function deleteMessage(element, event, messagaId) {
    const response = await request('/messages/' + messagaId, 'DELETE')
    if (response.status === 200) {
        element.parentNode.remove()
    }
}

async function getMessages(userId) {
    const messages = await request('/messages?userId=' + userId)
    renderMessages(messages)
}

async function getUsers() {
    const users = await request('/users')
    renderUsers(users)
}

form.onsubmit = event => {
    event.preventDefault()

    const messageBody = textInput.value.trim()

    if (!messageBody) {
        return textInput.value = ''
    }

    if (messageBody.includes('<') && messageBody.includes('>')) {
        textInput.value = ''
        return alert('message must not contain HTML element!')
    }

    postMessage(messageBody, 'text')
    form.reset()
}

uploadsInput.onchange = event => {
    const file = uploadsInput.files[0]

    if (file.size > 1024 * 1024 * 50) {
        return alert('file size is too large!')
    }

    socket.emit('messages:uploading', { to: lastSelectedUserId })

    postMessage(file, 'file')
    form.reset() 
}

let setTimeoutId
textInput.onkeyup = event => {
    if (event.keyCode === 13) {
        setTimeoutId = undefined
        socket.emit('messages:stopping', { to: lastSelectedUserId })
        return
    }

    if (setTimeoutId) return

    socket.emit('messages:typing', { to: lastSelectedUserId })

    setTimeoutId = setTimeout(() => {
        setTimeoutId = undefined
        socket.emit('messages:stopping', { to: lastSelectedUserId })
    }, 2000)
}

logOutBtn.onclick = () => {
    window.localStorage.clear()
    window.location = '/login'
}

const userId = window.localStorage.getItem('lastSelectedUserId')

getUsers()
renderProfileData()

socket.on('users:exit', () => {
    window.localStorage.clear()
    window.location = '/login'
})

socket.on('users:connected', ({ userId }) => {
    const span = document.querySelector(`.chats-item span[data-id="${userId}"]`)
    span && span.classList.add('online-indicator')
})

socket.on('users:disconnected', ({ userId }) => {
    const span = document.querySelector(`.chats-item span[data-id="${userId}"]`)
    span && span.classList.remove('online-indicator')
})

socket.on('users:new user', (user) => {
    console.log('hello')
    renderUsers([user])
})

socket.on('messages:new message', (message) => {
    console.log('hello')
    renderMessages([message])
})

socket.on('messages:typing', ({ from }) => {
    if (lastSelectedUserId == from) {
        chatAction.textContent = 'is typing...'
    }
})

socket.on('messages:uploading', ({ from }) => {
    if (lastSelectedUserId == from) {
        chatAction.textContent = 'is sending file...'
    }
})

socket.on('messages:stopping', ({ from }) => {
    if (lastSelectedUserId == from) {
        chatAction.textContent = null
    }
})

socket.on('messages:updated', ({ messageId, messageBody }) => {
    const p = document.querySelector(`.msg-text p[data-id="${messageId}"]`)
    p && (p.textContent = messageBody)
})

socket.on('messages:deleted', ({ messageId, messageFrom }) => {
    const div = document.querySelector(`.chat-main div[data-id="${messageId}"]`)
    if (lastSelectedUserId == messageFrom.userId && div) {
        div.remove()
    }
})