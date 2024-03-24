import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';

import { auctionsCollection, usersCollection } from '@/app/server/mongo';
import { Auction } from '@/app/customTypes';

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
	// @ts-expect-error
	if (!res.socket.server.io) {
		// @ts-expect-error
		const io = new Server(res.socket.server);
		// @ts-expect-error
		res.socket.server.io = io;

		io.on('connection', (socket) => {
			console.log('socket connected');

			socket.on('getUserData', async (uid, sendUserData) => {
				let userData =  await usersCollection.findOne({ ownerId: uid });
				if (userData) {
					sendUserData(userData);
				} else {
					let user = {
						ownerId: uid,
						balance: 10000,
						ongoingAuctions: [],
						completedAuctions: []
					};
					usersCollection.insertOne(user);
					sendUserData(user);
				}
			});

			socket.on('createAuction', (auction) => {
				auction.initTime = Date.now();
				auction.endTime = auction.initTime + auction.duration;
				auction.active = true;
				auction.currentBid = 0;

				auctionsCollection.insertOne(auction);
			});

			// TODO: stream or send data incrementally and apply projections
			socket.on('getAuctions', async (sendAuctions) => {
				await auctionsCollection.updateMany({ endTime: { $lt: Date.now() } }, { $set: { active: false } });

				const cursor = auctionsCollection.find({ active: true }, { sort: { endTime: 1 } });

				sendAuctions(await cursor.toArray());

				await cursor.close();
			});

			// TODO: stream or send data incrementally and apply projections
			socket.on('getMyOngoingAuctions', async (uid, sendAuctions) => {
				await auctionsCollection.updateMany({ endTime: { $lt: Date.now() } }, { $set: { active: false } });

				let cursor = auctionsCollection.find({ ownerId: uid, active: true }, { sort: { endTime: 1 } });

				sendAuctions(await cursor.toArray());

				await cursor.close();
			});

			socket.on('disconnect', () => {
				console.log('socket disconnected');
			});
		});
	}
	res.end();
}

export default SocketHandler;