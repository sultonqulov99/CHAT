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
    const file = uploadInput.files[0]

    if (!username || !password || !file) {
        errorMessage.textContent = 'all fields must be filled!'
        return
    }

    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    formData.append('file', file)

    const response = await request('/register', 'POST', formData)
    if (response?.status == 200) {
        window.localStorage.setItem('token', response.token)
        window.location = '/'
    }
}
