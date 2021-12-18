const express = require("express");
const app = express();

const ObjectId = require("mongodb").ObjectId;

const cors = require("cors");
require("dotenv").config();

const { MongoClient } = require("mongodb");

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// Server Connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zkd0m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

async function run() {
	try {
		await client.connect();
		const user_coll = client.db("tesla_DB").collection("users");
		const ordr_coll = client.db("tesla_DB").collection("orders");
		const prod_coll = client.db("tesla_DB").collection("product");
		const review_coll = client.db("tesla_DB").collection("review");

		/*------------------------ */
		/* Review Section */
		/*----------------------- */

		// post review
		app.post("/reviews", async (req, res) => {
			const review = req.body;
			const result = await review_coll.insertOne(review);
			console.log(result);
			res.json(result);
		});

		// Get Review by email and Date
		app.get("/reviews", async (req, res) => {
			const cursour = await review_coll.find({}).toArray();
			res.send(cursour);
		});

		/*------------------------ */
		/* Product Section */
		/*----------------------- */

		// Add new product
		app.post("/products", async (req, res) => {
			const product = req.body;
			const result = await prod_coll.insertOne(product);
			console.log(result);
			res.json(result);
		});

		// Send Single product
		app.get("/product/:id", async (req, res) => {
			const result = await prod_coll.findOne({
				_id: ObjectId(req.params.id),
			});
			res.send(result);
		});

		// Delete product
		app.delete("/products/:id", async (req, res) => {
			const result = await prod_coll.deleteOne({
				_id: ObjectId(req.params.id),
			});
			res.send(result);
		});

		// Get orders by email and Date
		app.get("/products", async (req, res) => {
			const cursour = await prod_coll.find({}).toArray();
			res.send(cursour);
		});

		/*------------------------ */
		/* Order Section */
		/*----------------------- */

		// post appointment
		app.post("/orders", async (req, res) => {
			const appointment = req.body;
			const result = await ordr_coll.insertOne(appointment);
			res.json(result);
		});

		// Get all orders
		app.get("/orders", async (req, res) => {
			const cursour = await ordr_coll.find({}).toArray();
			res.json(cursour);
		});

		// Delete order
		app.delete("/orders/:id", async (req, res) => {
			const result = await ordr_coll.deleteOne({
				_id: ObjectId(req.params.id),
			});
			res.send(result);
		});

		// Update Order Status
		app.put("/orders/:id", async (req, res) => {
			const query = { _id: ObjectId(req.params.id) };
			const options = { upsert: true };
			const updateStatus = {
				$set: {
					status: "Approved",
				},
			};
			const result = await ordr_coll.updateOne(query, updateStatus, options);
			res.send(result);
		});

		// Get orders by email
		app.get("/orders/:email", async (req, res) => {
			const email = req.params.email;
			const query = { email: email };
			const cursour = await ordr_coll.find(query).toArray();
			res.json(cursour);
		});

		/*------------------------ */
		/* User Section */
		/*----------------------- */
		// Post users
		app.post("/users", async (req, res) => {
			const user = req.body;
			const result = user_coll.insertOne(user);
			res.json(result);
		});

		//Updat API
		app.put("/users", async (req, res) => {
			const user = req.body;
			const filter = { email: user.email };
			const options = { upsert: true };
			const updateDoc = {
				$set: user,
			};
			const result = await user_coll.updateOne(filter, updateDoc, options);
			res.json(result);
		});

		// Get one User Information(Check Admin or Not)
		app.get("/users/:email", async (req, res) => {
			const email = req.params.email;
			const query = { email: email };
			const user = await user_coll.findOne(query);
			let isAdmin = false;
			if (user?.role == "admin") {
				isAdmin = true;
			}
			res.json({ admin: isAdmin });
		});

		// Update email as Admin
		app.put("/users/admin", async (req, res) => {
			const user = req.body.email;

			const filter = { email: user };
			const updateDoc = {
				$set: { role: "admin" },
			};
			const result = await user_coll.updateOne(filter, updateDoc);
			res.json(result);
		});
	} finally {
		// await client.close()
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("TESLA server is running!");
});

app.listen(port, () => {
	console.log(`app listening at http://localhost:${port}`);
});
