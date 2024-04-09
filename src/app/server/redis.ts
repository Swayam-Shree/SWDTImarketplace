import { createClient } from 'redis';

export let redis: any;

async function setup() {
	redis = createClient({
		password: process.env.REDIS_PASSWORD as string,
		socket: {
			host: process.env.REDIS_HOST as string,
			port: Number(process.env.REDIS_PORT) as number
		}
	}).connect();
};

setup();