import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';

import { bidSession, auctionsCollection, usersCollection, getObjectId } from '@/app/server/mongo';

import { ObjectId } from 'mongodb';

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
	// @ts-expect-error
	if (!res.socket.server.io) {
		// @ts-expect-error
		const io = new Server(res.socket.server);
		// @ts-expect-error
		res.socket.server.io = io;

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
						biddings: []
					};
					usersCollection.insertOne(user);
					socket.emit("updateUserData", user);
				}
			});

			socket.on('getAuctionStats', async (uid) => {
				let userData = await usersCollection.findOne({ ownerId: uid });

				let auctionIds = userData?.biddings.map((bidding: {auctionId: ObjectId, bidAmount: number}) => getObjectId(String(bidding.auctionId)));
				
				let finishedAuctions = await auctionsCollection.find({
					_id: { $in: auctionIds }, // ids in keys of biddings
					endTime: { $lt: Date.now() }
				}).toArray();

				let returnedAmount = 0;
				let wonAuctions = [];
				let lostAuctions = [];
				for (let auction of finishedAuctions) {
					if (auction.highestBidderId === uid) {
						wonAuctions.push(auction);
					} else {
						returnedAmount += userData?.biddings.find((bidding: {auctionId: ObjectId, bidAmount: number} ) => {
							return String(bidding.auctionId) === String(auction._id);
						}).bidAmount;
						lostAuctions.push(auction);
					}
				}

				let myFinishedAuctions = await auctionsCollection.find({ ownerId: uid, endTime: { $lt: Date.now() } }).toArray();

				let soldAuctions = [];
				let unsoldAuctionsIds = [];
				for (let auction of myFinishedAuctions) {
					if (auction.currentBid === 0) {
						unsoldAuctionsIds.push(auction._id);
					} else {
						soldAuctions.push(auction);
					}
				}

				auctionsCollection.deleteMany({ _id: { $in: unsoldAuctionsIds } });

				socket.emit("sendAuctionStats", wonAuctions, soldAuctions);
				
				await usersCollection.updateOne({ ownerId: uid }, {
					// @ts-expect-error
					$pull: { biddings: { auctionId: { $in: lostAuctions.map(auction => String(auction._id)) } } },
					$inc: { balance: returnedAmount, lockedBalance: -returnedAmount }
				});
				
				socket.emit('updateUserData', await usersCollection.findOne({ ownerId: uid }));
			});

			socket.on('bid', async (uid, auctionId, bidAmount, currentExpectedAmount, success) => {
				await bidSession.withTransaction(async () => {
					let user = await usersCollection.findOne({ ownerId: uid });
					let auction = await auctionsCollection.findOne({ _id: getObjectId(auctionId) });
					
					if (auction?.currentBid === currentExpectedAmount) {
						if (auction?.currentBid === 0 && bidAmount < auction?.basePrice) return;
						if (user?.ownerId !== auction?.highestBidderId) {
							
							let biddingData = await usersCollection.findOne({ ownerId: uid, "biddings.auctionId": auctionId });
							
							// TODO: combine the following if else block via an upsert
							if (biddingData) { // user has bid on this auction before
								for (let bid of biddingData.biddings) {
									if (bid.auctionId === auctionId) {
										// total bid = total amount - already bid amount
										let totalBidAmount = bidAmount + currentExpectedAmount - bid.bidAmount;
										if (totalBidAmount <= user?.balance) {
											await usersCollection.updateOne({ ownerId: uid, "biddings.auctionId": auctionId }, {
												$inc: {
													"biddings.$.bidAmount": totalBidAmount,
													balance: -totalBidAmount,
													lockedBalance: totalBidAmount
												}
											});
										} else {
											success(false, 1); // insufficient balance on bid (not first time bid on item)
											return;
										}
										break;
									}
								}
							} else { // user is bidding on this auction for the first time
								let totalBidAmount = bidAmount + auction?.currentBid;

								if (totalBidAmount <= user?.balance) {
									await usersCollection.updateOne({ ownerId: uid }, { 
										// @ts-expect-error
										$push: { biddings: { auctionId: auctionId, bidAmount: totalBidAmount } },
										$inc: { balance: -totalBidAmount, lockedBalance: totalBidAmount }
									});
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
						return;
					}
				}, { readConcern: { level: 'local' }, writeConcern: { w: 'majority' } });
			});

			socket.on('createAuction', (auction, callback) => {
				try {
					auction.initTime = Date.now();
					auction.endTime = auction.initTime + auction.duration;
					auction.active = true;
					auction.currentBid = 0;
					auction.highestBidderId = '';
	
					auctionsCollection.insertOne(auction);
	
					callback(true);
				} catch {
					callback(false);
				}
			});

			socket.on('endAuction', async (auctionId, success) => {
				await auctionsCollection.updateOne({ _id: getObjectId(auctionId) }, { $set: { active: false, endTime: Date.now() } });
				success();
			});

			// TODO: stream or send data incrementally and apply projections
			socket.on('getAuctions', async (sendAuctions) => {
				await auctionsCollection.updateMany({ endTime: { $lt: Date.now() } }, { $set: { active: false } });

				const cursor = auctionsCollection.find({ active: true }, { sort: { endTime: 1 } });

				sendAuctions(await cursor.toArray());

				await cursor.close();
			});

			// TODO: stream or send data incrementally and apply projections
			socket.on('getCreatedOngoingAuctions', async (uid, sendAuctions) => {
				await auctionsCollection.updateMany({ endTime: { $lt: Date.now() } }, { $set: { active: false } });

				let cursor = auctionsCollection.find({ ownerId: uid, active: true }, { sort: { endTime: 1 } });

				sendAuctions(await cursor.toArray());

				await cursor.close();
			});

			// TODO: stream or send data incrementally and apply projections
			socket.on('getBiddedOngoingAuctions', async (uid, sendAuctions) => {
				let userData = await usersCollection.findOne({ ownerId: uid });

				let auctionIds = userData?.biddings.map((bidding: {auctionId: ObjectId, bidAmount: number}) => getObjectId(String(bidding.auctionId)));
				
				let cursor = auctionsCollection.find({
					_id: { $in: auctionIds }, // ids in keys of biddings
					endTime: { $gt: Date.now() }
				});

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