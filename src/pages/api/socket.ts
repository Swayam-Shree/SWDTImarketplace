import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';

import { bidSession, auctionsCollection, usersCollection, getObjectId } from '@/app/server/mongo';

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
	// @ts-expect-error
	if (!res.socket.server.io) {
		// @ts-expect-error
		const io = new Server(res.socket.server);
		// @ts-expect-error
		res.socket.server.io = io;

		// function updateUserData(socket, uid) {
		// 	let userData = await usersCollection.findOne({ ownerId: uid });
		// 	socket.emit('userDataUpdate', userData);
		// }

		io.on('connection', (socket) => {
			console.log('socket connected');

			socket.on('initUserData', async (uid) => {
				let userData = await usersCollection.findOne({ ownerId: uid });

				if (userData) {
					socket.emit("updateUserData", userData);
				} else {
					let user = {
						ownerId: uid,
						balance: 10000,
						lockedBalance: 0,
						ongoingAuctions: [],
						completedAuctions: [],
						biddings: []
					};
					usersCollection.insertOne(user);
					socket.emit("updateUserData", user);
				}
			});

			socket.on('bid', async (uid, auctionId, bidAmount, currentExpectedAmount, success) => {
				await bidSession.withTransaction(async () => {
					let user = await usersCollection.findOne({ ownerId: uid });
					let auction = await auctionsCollection.findOne({ _id: getObjectId(auctionId) });
					
					if (auction?.currentBid === currentExpectedAmount) {
						if (auction?.currentBid === 0 && bidAmount < auction?.basePrice) return;
						if (user?.ownerId !== auction?.highestBidderId && user?.balance >= bidAmount) {
							
							let biddingData = await usersCollection.findOne({ ownerId: uid, "biddings.auctionId": auctionId });

							if (biddingData) { // user has bid on this auction before
								await usersCollection.updateOne({ ownerId: uid, "biddings.auctionId": auctionId }, { $inc: { "biddings.$.bidAmount": bidAmount } });
								await usersCollection.updateOne({ ownerId: uid }, { $inc: { balance: -bidAmount, lockedBalance: bidAmount } });
							} else { // user is bidding on this auction for the first time
								let totalBidAmount = bidAmount + auction?.currentBid;
								if (totalBidAmount <= user?.balance) {
									// @ts-expect-error
									await usersCollection.updateOne({ ownerId: uid }, { $push: { biddings: { auctionId: auctionId, bidAmount: totalBidAmount } } });
									await usersCollection.updateOne({ ownerId: uid }, { $inc: { balance: -totalBidAmount, lockedBalance: totalBidAmount } });
								} else {
									success(false, 1); // insufficient balance on first time bid on item
									return;
								}
							}

							await auctionsCollection.updateOne({ _id: getObjectId(auctionId) }, {
								$set: { highestBidderId: uid },
								$inc: { currentBid: bidAmount }
							});

							socket.emit('updateUserData', await usersCollection.findOne({ ownerId: uid }));
							io.emit('updateAuction', await auctionsCollection.findOne({ _id: getObjectId(auctionId) }));

							success(true, 0);
						}
					} else {
						success(false, 0); // auction data changed during order from client and receive on server
					}
				}, { readConcern: { level: 'local' }, writeConcern: { w: 'majority' } });
			});

			socket.on('createAuction', (auction) => {
				auction.initTime = Date.now();
				auction.endTime = auction.initTime + auction.duration;
				auction.active = true;
				auction.currentBid = 0;
				auction.highestBidderId = '';

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