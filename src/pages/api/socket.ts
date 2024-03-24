import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';

import { auctionsCollection } from '@/app/server/mongo';
import { Auction } from '@/app/customTypes';

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {

	// TODO: use mongo queries to optimize this
	function closeAuctions(auctions: Auction[]) {
		for (let i = auctions.length - 1; i >= 0; --i) {
			if (auctions[i].endTime < Date.now()) {
				auctionsCollection.updateOne({ _id: auctions[i]._id }, { $set: { active: false } });
				auctions.splice(i, 1);
			}
		}
	}

	// @ts-expect-error
	if (!res.socket.server.io) {
		// @ts-expect-error
		const io = new Server(res.socket.server);
		// @ts-expect-error
		res.socket.server.io = io;

		io.on('connection', (socket) => {
			console.log('socket connected');

			socket.on('createAuction', (auction) => {
				auction.initTime = Date.now();
				auction.endTime = auction.initTime + auction.duration;
				auction.active = true;
				auction.currentBid = 0;

				auctionsCollection.insertOne(auction);
			});

			socket.on('getAuctions', async (sendAuctions) => {
				let auctions = await auctionsCollection.find({ active: true }, {
					sort: { endTime: 1 }
				}).toArray();

				closeAuctions(auctions as Auction[]);

				sendAuctions(auctions);
			});

			socket.on('getMyOngoingAuctions', async (uid, sendAuctions) => {
				console.log("sending ongoing auctions");
				let auctions = await auctionsCollection.find({ ownerId: uid, active: true }, {
					sort: { endTime: 1 }
				}).toArray();

				closeAuctions(auctions as Auction[]);

				sendAuctions(auctions);
			});

			socket.on('disconnect', () => {
				console.log('socket disconnected');
			});
		});
	}
	res.end();
}

export default SocketHandler;