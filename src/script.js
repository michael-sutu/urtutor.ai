let path = window.location.pathname
let noauth = ["/", "/signup", "/login"]
let user = {}

if(localStorage.getItem("private")) {
	fetch('./get', { method: 'POST', headers: { 'Content-Type': 'application/json'},
		body: JSON.stringify({
			private: localStorage.getItem("private")
		})
	})
	.then(response => response.json())
	.then(data => {
		if(data.code != 200) {
			localStorage.removeItem("private")
			location.reload()
		} else {
			if(noauth.includes(path)) {
				window.location = "./dashboard"
			} else {
				user = data.user
				if(path == "/dashboard") {
					document.getElementById("fullname").textContent = `${user.firstName} ${user.lastName}`
					document.getElementById("firstName").value = user.firstName
					document.getElementById("lastName").value = user.lastName
					document.getElementById("email").value = user.email

					fetch('./getsessions', { method: 'POST', headers: { 'Content-Type': 'application/json'},
						body: JSON.stringify({
							private: localStorage.getItem("private")
						})
					})
					.then(response => response.json())
					.then(data => {
						if(data.code == 400 || data.code == 500) {
							window.location = "./dashboard"
						} else {
							if(data.sessions.length > 0) {
								document.querySelector(".maincenter").style.display = "none"
								document.querySelector(".reviewdiv").style.display = "flex"

								for(let i = data.sessions.length - 1; i >= 0; i--) {		
									document.querySelector(".reviewdiv").querySelector("div").innerHTML += `
										<div>
											<a>${data.sessions[i].date}</a>
											<img src="./images/${data.sessions[i].voice.toLowerCase()}.png">
											<p>${data.sessions[i].voice}</p>
											<button onclick="window.location = './${data.sessions[i].status.toLowerCase()}?id=${data.sessions[i].id}'">${data.sessions[i].status}</button>
										</div>
									`
								}
							}
							
							document.querySelector(".loading").remove()
						}
					})
				} else if(path == "/learn" || path == "/review") {
					const query = new URLSearchParams(window.location.search)
					let id = query.get('id')

					fetch('./getsession', { method: 'POST', headers: { 'Content-Type': 'application/json'},
						body: JSON.stringify({
							private: localStorage.getItem("private"),
							id: id
						})
					})
					.then(response => response.json())
					.then(data => {
						if(data.code == 400 || data.code == 500) {
							window.location = "./dashboard"
						} else {
							for(let i = 0; i < data.session.messages.length; i++) {
								let newmessage = document.createElement("p")
								newmessage.id = data.session.messages[i].role
								newmessage.textContent = data.session.messages[i].content
								document.getElementById("messages").appendChild(newmessage)
							}
							
							document.getElementById("image").src = `./images/${data.session.voice.toLowerCase()}.png`
							document.getElementById("name").textContent = data.session.voice
							document.getElementById("personality").textContent = data.session.personality

							let remaining = (data.session.start + data.session.duration * 60000) - new Date().getTime()

							let totalSeconds = Math.floor(remaining / 1000)
							let minutes = Math.floor(totalSeconds  / 60)
							let seconds = totalSeconds  % 60

							minutes = (minutes < 10) ? '0' + minutes : minutes
							seconds = (seconds < 10) ? '0' + seconds : seconds

							if(path == "/learn") {
								document.getElementById("remaining").textContent = `${minutes}:${seconds}`
								let valid = true

								if(typeof minutes == "string") {
									if(minutes.split("").includes("-")) {
										valid = false
									}
								}

								if(typeof seconds == "string") {
									if(seconds.split("").includes("-")) {
										valid = false
									}
								}
								
								if(!valid) {
									window.location = "./review?id="+id
								} else {
									document.querySelector(".loading").remove()
								}

								setInterval((e) => {
									remaining = (data.session.start + data.session.duration * 60000) - new Date().getTime()

									totalSeconds = Math.floor(remaining / 1000)
									minutes = Math.floor(totalSeconds  / 60)
									seconds = totalSeconds  % 60
									minutes = (minutes < 10) ? '0' + minutes : minutes
									seconds = (seconds < 10) ? '0' + seconds : seconds
									
									let valid = true
									if(typeof minutes == "string") {
										if(minutes.split("").includes("-")) {
											valid = false
										}
									}

									if(typeof seconds == "string") {
										if(seconds.split("").includes("-")) {
											valid = false
										}
									}

									if(!valid) {
										window.location = "./review?id="+id
									} else {
										document.getElementById("remaining").textContent = `${minutes}:${seconds}`
									}
								}, 1000)
							} else {
								let valid = true

								if(typeof minutes == "string") {
									if(minutes.split("").includes("-")) {
										valid = false
									}
								}

								if(typeof seconds == "string") {
									if(seconds.split("").includes("-")) {
										valid = false
									}
								}

								if(valid) {
									window.location = "./learn?id="+id
								} else {
									document.querySelector(".loading").remove()
								}
							}
						}
					})
				} else {
					document.querySelector(".loading").remove()
				}
			}
		}
	})
} else {
	if(noauth.includes(path)) {
		document.querySelector(".loading").remove()
	} else {
		window.location = "./"
	}
}

function displayError(id, msg) {
	errored.push(id)
	if(!document.getElementById(id).textContent.split("").includes("-")) {
		document.getElementById(id).textContent += ` - ${msg}`
		document.getElementById(id).style.color = "red"
	}
}

let errored = []
function cleanErrors() {
	for(let i = 0; i < errored.length; i++) {
		document.getElementById(errored[i]).textContent = document.getElementById(errored[i]).textContent.split(" - ")[0]
		document.getElementById(errored[i]).style.color = "black"
	}
}

function signUp() {
	document.getElementById("signupbtn").disabled = true
	document.getElementById("loading").style.opacity = "1"
	
	let level = "_"
	let firstName = document.getElementById("firstName").value
	let lastName = document.getElementById("lastName").value
	let email = document.getElementById("email").value
	let password = document.getElementById("password").value
	let confirmPassword = document.getElementById("confirmPassword").value
	
	if(document.querySelector(".chosen")) {
		level = document.querySelector(".chosen").querySelector("p").textContent
	}

	if(password == confirmPassword) {
		fetch('./signup', { method: 'POST', headers: { 'Content-Type': 'application/json'},
			body: JSON.stringify({
				level: level,
				firstName: firstName,
				lastName: lastName,
				email: email,
				password: password
			})
		})
		.then(response => response.json())
		.then(data => {
			if(data.code == 500) {
				location.reload()
			} else if(data.code == 200) {
				localStorage.setItem("private", data.private)
				window.location = "./dashboard"
			} else if(data.code == 400) {
				cleanErrors()
				for(let i = 0; i < data.errors.length; i++) {
					displayError(data.errors[i][0], data.errors[i][1])
				}
				document.getElementById("signupbtn").disabled = false
				document.getElementById("loading").style.opacity = "0"
			}
		})
	} else {
		cleanErrors()
		displayError("p", "Both password fields must match.")
		displayError("cp", "Both password fields must match.")
		document.getElementById("signupbtn").disabled = false
		document.getElementById("loading").style.opacity = "0"
	}
}

function logout() {
	localStorage.removeItem("private")
	location.reload()
}

function login() {
	document.getElementById("loginbtn").disabled = true
	document.getElementById("loading").style.opacity = "1"

	let email = document.getElementById("email").value
	let password = document.getElementById("password").value

	fetch('./login', { method: 'POST', headers: { 'Content-Type': 'application/json'},
		body: JSON.stringify({
			email: email,
			password: password
		})
	})
	.then(response => response.json())
	.then(data => {
		if(data.code == 500) {
			location.reload()
		} else if(data.code == 200) {
			localStorage.setItem("private", data.private)
			window.location = "./dashboard"
		} else if(data.code == 400) {
			cleanErrors()
			for(let i = 0; i < data.errors.length; i++) {
				displayError(data.errors[i][0], data.errors[i][1])
			}
			document.getElementById("loginbtn").disabled = false
			document.getElementById("loading").style.opacity = "0"
		}
	})
}

function update() {
	document.getElementById("save").innerHTML = `<i class="fa-solid fa-circle-notch" id="loading" style="opacity: 1; float: none;"></i>`
	document.getElementById("save").style.top = "2px"
	document.getElementById("save").disabled = true

	let email = document.getElementById("email").value
	let firstName = document.getElementById("firstName").value
	let lastName = document.getElementById("lastName").value
	let password = document.getElementById("password").value

	fetch('./update', { method: 'POST', headers: { 'Content-Type': 'application/json'},
		body: JSON.stringify({
			email: email,
			password: password,
			firstName: firstName,
			lastName: lastName,
			private: localStorage.getItem("private")
		})
	})
	.then(response => response.json())
	.then(data => {
		if(data.code == 500) {
			location.reload()
		} else if(data.code == 200) {
			location.reload()
		} else if(data.code == 400) {
			cleanErrors()
			for(let i = 0; i < data.errors.length; i++) {
				displayError(data.errors[i][0], data.errors[i][1])
			}
			document.getElementById("save").innerHTML = `Save`
			document.getElementById("save").style.top = "0px"
			document.getElementById("save").disabled = false
		}
	})
}

function setup() {
	document.getElementById("start").disabled = true
	document.getElementById("start").innerHTML = `<i class="fa-solid fa-circle-notch" id="loading" style="opacity: 1; float: none;"></i>`
	
	let duration = ""
	let instructions = document.getElementById("custom").value
	let voice = ""
	let personality = ""

	if(document.querySelector(".chosenduration")) {
		duration = parseInt(document.querySelector(".chosenduration").querySelector("p").textContent.split(" ")[0])
	}

	if(document.querySelector(".chosenpersonality")) {
		personality = document.querySelector(".chosenpersonality").querySelector("p").textContent
	}

	if(document.querySelector(".chosenvoice")) {
		voice = document.querySelector(".chosenvoice").querySelector("p").textContent
	}

	fetch('./setup', { method: 'POST', headers: { 'Content-Type': 'application/json'},
		body: JSON.stringify({
			duration: duration,
			instructions: instructions,
			voice: voice,
			personality: personality,
			private: localStorage.getItem("private")
		})
	})
	.then(response => response.json())
	.then(data => {
		if(data.code == 500 || data.code == 401) {
			location.reload()
		} else if(data.code == 200) {
			window.location = `./learn?id=${data.id}`
		} else if(data.code == 400) {
			cleanErrors()
			for(let i = 0; i < data.errors.length; i++) {
				displayError(data.errors[i][0], data.errors[i][1])
			}
			document.getElementById("start").disabled = false
			document.getElementById("start").innerHTML = `Setup`
		}
	})
}
