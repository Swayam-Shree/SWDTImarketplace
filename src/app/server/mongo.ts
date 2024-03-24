
import { MongoClient } from 'mongodb';
import type { Db, Collection } from 'mongodb';
const uri = MONGO_URI;

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