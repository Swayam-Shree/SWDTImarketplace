import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';

import { auctionsCollection } from '@/app/server/mongo';

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
	// @ts-expect-error
	if (!res.socket.server.io) {
		// @ts-expect-error
		const io = new Server(res.socket.server);
		// @ts-expect-error
		res.socket.server.io = io;

		io.on('connection', (socket) => {
			console.log('socket connected');

			socket.on('createAuction', (data) => {
				auctionsCollection.insertOne(data);
			});

			socket.on('disconnect', () => {
				console.log('socket disconnected');
			});
		});
	}
	res.end();
}

export default SocketHandler;