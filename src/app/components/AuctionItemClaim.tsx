import type { Auction } from '@/app/customTypes';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Image from 'next/image';
import { useState, useEffect } from 'react';

import { socket } from '../socket';

export default function({ auction }: { auction: Auction }) {
	const [timeRemaining, setTimeRemaining] = useState(auction.endTime - Date.now());

	useEffect(() => {
		let secondDecrement = setInterval(() => {
			setTimeRemaining(timeRemaining - 1000);
		}, 1000);
	
		let timerSync = setInterval(() => {
			setTimeRemaining(auction.endTime - Date.now());
		}, 5 * 60 * 1000); // syncing timer every 3 mins to avoid drift

		return () => {
			clearInterval(secondDecrement);
			clearInterval(timerSync);
		}
	}, [timeRemaining]);

	if (timeRemaining <= 0) {
		return null;
	}

	let timeRemainingSeconds = Math.floor(timeRemaining / 1000);
	let days = Math.floor(timeRemainingSeconds / 86400);
	timeRemainingSeconds -= days * 86400;
	let hours = Math.floor(timeRemainingSeconds / 3600);
	timeRemainingSeconds -= hours * 3600;
	let mins = Math.floor(timeRemainingSeconds / 60);
	timeRemainingSeconds -= mins * 60;
	let seconds = timeRemainingSeconds;

	let timerString = '';
	if (days > 0) timerString += `${days} days, `;
	if (hours > 0) timerString += `${hours} hours, `;
	if (mins > 0) timerString += `${mins} mins, `;
	timerString += `${seconds} secs`;

	function handleEnd() {

	}

	return (<div className='flex flex-col items-center border border-black rounded p-[1em] m-[1em] min-w-[300px]'>
		<Image src='/logo.png' alt='Item Image' width='256' height='256' />
			<Typography sx={{mt: 4}} variant='h3'>{auction.itemName}</Typography>
			<div className='flex flex-col items-left mt-[1em] min-w-[250px]'>
				<Typography variant='h6'>Description:</Typography>
				<Typography variant='subtitle1'>{auction.itemDescription}</Typography>
				<Typography variant='h6'>Base Price:</Typography>
				<Typography variant='subtitle1'>₹{auction.basePrice}</Typography>
				<Typography variant='h6'>Current Price:</Typography>
				<Typography variant='subtitle1'>₹{auction.currentBid}</Typography>
				<Typography variant='h6'>Time remaining:</Typography>
				<Typography variant='subtitle1'>{ timerString }</Typography>
			</div>
		<Button sx={{mt: 4}} onClick={ handleEnd } variant='outlined'>End Auction</Button>
	</div>);
}