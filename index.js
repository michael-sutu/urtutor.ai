const express = require("express")
const bcrypt = require('bcrypt')
const { MongoClient } = require('mongodb')
const OpenAi = require("openai")
const app = express()
const gpt = new OpenAi({apiKey: process.env.openai_key})

app.use(express.json())
app.listen(1000)
const client = new MongoClient(`mongodb+srv://michaelsutu:${process.env.mongo_password}@cluster0.3uxbuj6.mongodb.net/?retryWrites=true&w=majority`)

async function generateresponse(messages, info) {
	try {
		let newmessages = [{"role": "system", "content": "You are a helpful assistant."},
			{"role": "user", "content": `You are tutor.ai and you are an ai tutor so your job is to help users learn and answer their questions. When responding however don't over elaborate unless you are specifically told.

			Here is information about who you are:
			Name: ${info.name}
			Personality: ${info.personality}
			Custom Instructions From User: ${info.instructions}

			Does all of this make sense and are you ready?`},
			{"role": "assistant", "content": "Yes I understand and I am ready to help your learn."}]

		for(let i = 0; i < messages.length; i++) {
			newmessages.push(messages[i])
		}
		
		const completion = await gpt.chat.completions.create({
			messages: newmessages,
			model: "gpt-4-1106-preview"
		})
	
		return completion.choices[0]
	} catch (error) {
		throw error
	}
}

const err = (msg) => {
	console.log('\x1b[31m%s\x1b[0m', msg)
}

const randString = (length) => {
	try {
		let final = ""
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
		const charactersLength = characters.length
		let counter = 0
		while (counter < length) {
			final += characters.charAt(Math.floor(Math.random() * charactersLength))
			counter += 1
		}
		return final
	} catch(error) {
		return 0
	}
}

const capString = (string) => {
	try {
		let final = ""
		let split = string.split(" ")
		for(let i = 0; i < split.length; i++) {
			split[i] = split[i].toLowerCase()
			final += split[i].charAt(0).toUpperCase() + split[i].slice(1)
			if(i != split.length - 1) {
				final += " "
			}
		}
		
		return final
	} catch(error) {
		return 0
	}
}

const dbCreate = async (collection, data) => {
	try {
		await client.connect()
		const db = client.db("main")
		await db.collection(collection).insertOne(data)
		return 1
	} catch(error) {
		return 0
	} finally {
		client.close()
	}
}

const dbGet = async (collection, query) => {
	try {
		await client.connect()
		const db = client.db("main")
		const result = await db.collection(collection).findOne(query)
		return result
	} catch(error) {
		return 0
	} finally {
		client.close()
	}
}

const dbUpdateSet = async (collection, query, data) => {
	try {
		await client.connect()
		const db = client.db("main")
		await db.collection(collection).updateOne(query, { $set: data})
		return 1
	} catch(error) {
		return 0
	} finally {
		client.close()
	}
}

const required = (errors, fields) => {
	try {
		for(let i = 0; i < fields.length; i++) {
			if(!(fields[i][1] && fields[i][1] != "")) {
				errors.push([fields[i][2], `Missing '${fields[i][0]}' field.`])
			}
		}
		return errors
	} catch(error) {
		return 0
	}
}

const validateEmail = (email) => {
	try {
		const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
		return email.toLowerCase().match(emailRegex)
	} catch(error) {
		return 0
	}
}

app.get("/", (req, res) => {
	res.sendFile(__dirname+"/public/index.html")
})

app.post("/get", async (req, res) => {
	try {
		let private = req.body.private

		if(private == null || private == "") {
			res.json({code: 400})
		}

		let user = await dbGet("users", {private: private})
		if(user) {
			res.json({code: 200, user: {
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName
			}})
		} else {
			res.json({code: 400})
		}
	} catch(error) {
		res.json({code: 500})
	}
})

app.get("/signup", (req, res) => {
	res.sendFile(__dirname+"/public/signup.html")
})

app.post("/getpayments", async (req, res) => {
	try {
		let private = req.body.private
		let pass = true
		let final = []

		if(private == null || private == "") {
			res.json({code: 400})
			pass = false
		}

		if(pass) {
			await client.connect()
			const collection = client.db('main').collection('sessions')
			const documents = await collection.find({private: private}).toArray()

			for(let i = 0; i < documents.length; i++) {
				final.push({
					duration: documents[i].duration,
					date: documents[i].date,
					spent: documents[i].duration / 4
				})
			}

			res.json({code: 200, payments: final})
		}
	} catch(error) {
		res.json({code: 500})
	}
})

app.post("/getsessions", async (req, res) => {
	try {
		let private = req.body.private
		let pass = true
		let final = []

		if(private == null || private == "") {
			res.json({code: 400})
			pass = false
		}

		if(pass) {
			await client.connect()
			const collection = client.db('main').collection('sessions')
			const documents = await collection.find({private: private}).toArray()

			for(let i = 0; i < documents.length; i++) {
				let status = "Learn"

				if(documents[i].start + (documents[i].duration * 60000) < new Date().getTime()) {
					status = "Review"
				}
				
				final.push({
					status: status,
					id: documents[i].id,
					voice: documents[i].voice,
					date: documents[i].date
				})
			}

			res.json({code: 200, sessions: final})
		}
	} catch(error) {
		res.json({code: 500})
	}
})

app.post("/getsession", async (req, res) => {
	try {
		let private = req.body.private
		let id = req.body.id
		let pass = true

		if(private == null || private == "") {
			res.json({code: 400})
			pass = false
		}

		if(id == null || id == "") {
			res.json({code: 400})
			pass = false
		}

		if(pass) {
			let session = await dbGet("sessions", {id: id})
			if(session && session.private == private) {
				res.json({code: 200, session: {
					personality: session.personality,
					duration: session.duration,
					voice: session.voice,
					messages: session.messages,
					start: session.start
				}})
			} else {
				res.json({code: 400})
			}
		}
	} catch(error) {
		res.json({code: 500})
	}
})

app.post("/setup", async (req, res) => {
	try {
		let voice = req.body.voice
		let personality = req.body.personality
		let instructions = req.body.instructions
		let duration = req.body.duration
		let private = req.body.private
		let errors = []

		errors = required(errors, [["voice", voice, "v"], ["personality", personality, "p"], ["duration", duration, "d"]])
		if(!errors) {
			throw new Error("Function 'required' threw 0.")
		}

		if(instructions) {
			if(instructions.split("").length > 1000) {
				errors.push(["i", "1000 character max for 'Custom Instructions'."])
			}
		}

		let user = await dbGet("users", {private: private})
		if(!user) {
			res.json({code: 401})
		}

		if(errors.length > 0) {
			res.json({code: 400, errors: errors})
		} else {
			let id = randString(16)

			if(!id) {
				throw new Error("Function 'randString' threw 0.")
			}

			let today = new Date()
			let dd = String(today.getDate()).padStart(2, '0')
			let mm = String(today.getMonth() + 1).padStart(2, '0')
			let yy = today.getFullYear().toString().substr(-2)

			const newSession = await dbCreate("sessions", {
				personality: personality,
				instructions: instructions,
				duration: duration,
				voice: voice,
				id: id,
				private: private,
				date: mm + '/' + dd + '/' + yy,
				start: new Date().getTime(),
				messages: []
			})

			if(newSession) {
				res.json({code: 200, id: id})
			} else {
				throw new Error("Function 'dbCreate' threw 0.")
			}
		}
	} catch(error) {
		err(error)
		res.json({code: 500})
	}
})

app.post("/signup", async (req, res) => {
	try {
		let level = req.body.level || "_"
		let firstName = req.body.firstName
		let lastName = req.body.lastName
		let email = req.body.email.toLowerCase()
		let password = req.body.password
		let errors = []

		errors = required(errors, [["firstName", firstName, "fn"], ["lastName", lastName, "ln"], ["email", email, "e"], ["password", password, "p"]])
		if(!errors) {
			throw new Error("Function 'required' threw 0.")
		}

		if(validateEmail(email) == null) {
			errors.push(["e", "Invalid email format."])
		} else {
			let checkEmail = await dbGet("users", {"email": email})
			if(checkEmail == 0) {
				throw new Error("Function 'dbGet' threw 0.")
			} else if(checkEmail != null) {
				errors.push(["e", "Email already taken."])
			}
		}

		let validLevels = ["Grade School", "Highschool", "College", "Other"]
		if(!validLevels.includes(level)) {
			level = "_"
		}

		if(password) {
			if(password.split("").length < 8) {
				errors.push(["p", "Password must be at least 8 characters long."])
			}
		}

		if(errors.length > 0) {
			res.json({code: 400, errors: errors})
		} else {
			bcrypt.genSalt(10, async (err, salt) => {
				bcrypt.hash(password, salt, async function(err, hash) {
					let private = randString(16)

					if(!private) {
						throw new Error("Function 'randString' threw 0.")
					}
					
					const newUser = await dbCreate("users", {
						level: level,
						firstName: capString(firstName),
						lastName: capString(lastName),
						email: email,
						password: hash,
						private: private
					})

					if(newUser) {
						res.json({code: 200, private: private})
					} else {
						throw new Error("Function 'dbCreate' threw 0.")
					}
				})
			})
		}
	} catch(error) {
		err(error)
		res.json({code: 500})
	}
})

app.post("/send", async (req, res) => {
	try {
		let message = req.body.message
		let id = req.body.id
		let private = req.body.private

		let session = await dbGet("sessions", {id: id})
		if(session && session.private == private && (session.start + (60000 * session.duration) > new Date().getTime())) {
			let messagestosend = []

			for(let i = 0; i < session.messages.length; i++) {
				messagestosend.push(session.messages[i])
			}
			messagestosend.push({"role": "user", "content": message})
			let response = await generateresponse(messagestosend, {name: "Arnold", personality: "Funny", instructions: ""})
			messagestosend.push(response.message)
			let updatecall = await dbUpdateSet("sessions", {id: id}, {
				messages: messagestosend
			})

			if(updatecall) {
				res.json({code: 200, response: response})
			} else {
				throw new Error("Function 'dbUpdateSet' threw 0.")
			}	
		} else {
			res.json({code: 400})
		}
	} catch(error) {
		err(error)
		res.json({code: 500})
	}
})

app.post("/update", async (req, res) => {
	try {
		let firstName = req.body.firstName
		let lastName = req.body.lastName
		let email = req.body.email.toLowerCase()
		let password = req.body.password
		let private = req.body.private
		let errors = []

		let currentUser = await dbGet("users", {private: private})

		errors = required(errors, [["firstName", firstName, "fn"], ["lastName", lastName, "ln"], ["email", email, "e"]])
		if(!errors) {
			throw new Error("Function 'required' threw 0.")
		}

		if(validateEmail(email) == null) {
			errors.push(["e", "Invalid email format."])
		} else {
			let checkEmail = await dbGet("users", {"email": email})
			if(checkEmail == 0) {
				throw new Error("Function 'dbGet' threw 0.")
			} else if(checkEmail != null && email != currentUser.email) {
				errors.push(["e", "Email already taken."])
			}
		}

		let newpassword = false
		if(password && password !== "") {
			if(password.split("").length < 8) {
				errors.push(["p", "Password must be at least 8 characters long."])
			} else {
				newpassword = true
			}
		}

		if(errors.length > 0) {
			res.json({code: 400, errors: errors})
		} else {
			bcrypt.genSalt(10, async (err, salt) => {
				bcrypt.hash(password, salt, async function(err, hash) {
					if(newpassword == false) {
						hash = currentUser.password
					}
					
					let updatedUser = await dbUpdateSet("users", {private: private}, {
						email: email,
						firstName: firstName,
						lastName: lastName,
						password: hash
					})

					if(updatedUser) {
						res.json({code: 200})
					} else {
						throw new Error("Function 'dbCreate' threw 0.")
					}
				})
			})
		}
	} catch(error) {
		err(error)
		res.json({code: 500})
	}
})

app.post("/deleteaccount", async (req, res) => {
	try {
		await client.connect()
		const db = client.db("main")
		await db.collection("users").deleteOne({ private: req.body.private })
		client.close()
		res.json({code: 200})
	} catch(error) {
		err(error)
		res.json({code: 500})
	}
})

app.post("/login", async (req, res) => {
	try {
		let email = req.body.email.toLowerCase()
		let password = req.body.password

		let user = await dbGet("users", {email: email})
		if(user) {
			bcrypt.compare(password, user.password, (err, pass) => {
				if (err) {
					res.json({code: 500})
				} else {
					if (pass) {
						res.json({code: 200, private: user.private})
					} else {
						res.json({code: 400, errors: [["p", "Incorrect password."]]})
					}
				}
			})
		} else {
			res.json({code: 400, errors: [["e", "No account found with that email."]]})
		}
	} catch (error) {
		err(error)
		res.json({code: 500})
	}
})

app.get("/login", (req, res) => {
	res.sendFile(__dirname+"/public/login.html")
})

app.get("/dashboard", (req, res) => {
	res.sendFile(__dirname+"/public/dashboard.html")
})

app.get("/setup", (req, res) => {
	res.sendFile(__dirname+"/public/setup.html")
})

app.get("/learn", (req, res) => {
	res.sendFile(__dirname+"/public/learn.html")
})

app.get("/review", (req, res) => {
	res.sendFile(__dirname+"/public/review.html")
})

app.get("/src/:path", (req, res) => {
	res.sendFile(__dirname+`/src/${req.params.path}`)
})

app.get("/images/:path", (req, res) => {
	res.sendFile(__dirname+`/images/${req.params.path}`)
})

app.get("*", (req, res) => {
	res.redirect("/")
})
