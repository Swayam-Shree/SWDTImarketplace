
import { MongoClient } from 'mongodb';
import type { Db, Collection } from 'mongodb';
const uri = MONGO_URI;

const mongoClient = new MongoClient(uri);

let db: Db;
let auctionsCollection: Collection;

async function setup() {
	await mongoClient.connect();

	db = mongoClient.db('SWDTI');
	auctionsCollection = db.collection('auctions');
	
	// await c.insertOne({
	// 	name: 'test',
	// 	description: 'test desc',
	// 	basePrice: 100,
	// 	duration: 100,
	// 	createdAt: new Date()
	// });
}

setup();