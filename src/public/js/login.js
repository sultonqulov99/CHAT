showButton.onclick = () => {
    if (passwordInput.type === 'text') {
        passwordInput.type = 'password'
    } else {
        passwordInput.type = 'text'
    }
}

form.onsubmit = async event => {
    event.preventDefault()

    const username = usernameInput.value.trim()
    const password = passwordInput.value.trim()

    if (!username || !password) {
        errorMessage.textContent = 'all fields must be filled!'
        return
    }

    const response = await request('/login', 'POST', {
        username,
        password
    })

    if (response?.status == 200) {
        window.localStorage.setItem('token', response.token)
        window.location = '/'
    }
}

