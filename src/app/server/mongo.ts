
import { MongoClient } from 'mongodb';
import type { Db, Collection } from 'mongodb';
const uri = "mongodb+srv://swayamshreesharma:zhTke9j0f4KyNIru@swdti.bskhhcb.mongodb.net/?retryWrites=true&w=majority&appName=SWDTI";

const mongoClient = new MongoClient(uri);

let db: Db;
export let auctionsCollection: Collection;
export let usersCollection: Collection;

async function setup() {
	await mongoClient.connect();

	db = mongoClient.db('SWDTI');
	auctionsCollection = db.collection('auctions');
	usersCollection = db.collection('users');
}

setup();