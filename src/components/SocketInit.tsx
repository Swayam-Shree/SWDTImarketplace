"use client";

import { useEffect } from "react";

import type { Socket } from 'socket.io-client';
import io from 'socket.io-client';

let socket: Socket;

export default function SocketInit() {
	async function socketInit() {
		await fetch('/api/socket');
		
		socket = io();

		socket.on('connect', () => {
			console.log('socket connected');
		});
	}
	useEffect(() => {socketInit()}, []);

	return null;
}