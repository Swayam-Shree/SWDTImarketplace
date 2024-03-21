import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
	if (res.socket.server.io) {
		console.log('Socket is already running');
	} else {
		console.log('Socket is initializing');
		res.socket.server.io = new Server(res.socket.server);
	}
	res.end();
}

export default SocketHandler;