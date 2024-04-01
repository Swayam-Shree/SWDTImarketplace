import type { Auction } from '@/app/customTypes';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import Image from 'next/image';
import { useState, useEffect } from 'react';

import { socket } from '../socket';

// import { userGlobals } from '../(user)/layout';
import { userGlobals } from '../(user)/userGlobals';

export default function({ auction }: { auction: Auction }) {
	const [timeRemaining, setTimeRemaining] = useState(auction.endTime - Date.now());
	const [bidValue, setBidValue] = useState(0)
	const [bidValueHelperText, setBidValueHelperText] = useState('');
	const [bidValueError, setBidValueError] = useState(false);

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

	function handleBid() {
		if (auction.currentBid === 0 && bidValue < auction.basePrice) {
			setBidValueError(true);
			setBidValueHelperText('First bid must be greater than base price');
		} else if (bidValue > userGlobals.userData.balance) {
			setBidValueError(true);
			setBidValueHelperText('insufficient balance: ₹' + userGlobals.userData.balance);
		} else if (auction.highestBidderId === userGlobals.userData.ownerId) {
			setBidValueError(true);
			setBidValueHelperText('You are already the highest bidder');
		} else {
			setBidValueError(false);
			setBidValueHelperText('');
			setBidValue(0);
			
			socket.emit('bid', userGlobals.userData?.ownerId, auction._id, bidValue, auction.currentBid, (success: Boolean, code: number) => {
				if (success) {
					setBidValueHelperText('Bid placed successfully');
				} else {
					setBidValueError(true);
					if (code === 1) {
						setBidValueHelperText('insufficient balance: ₹' + userGlobals.userData.balance);
					} else if (code === 0) {
						setBidValueHelperText('Bid amount changed, please try again');
					}
				}
			});
		}
	}

	let content = (<>
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

				<TextField sx={{mt: 4}} label='Your Bid' value={bidValue} onChange={(e) => {setBidValue(parseInt(e.target.value));}}
					type='number' error={ bidValueError } variant='outlined' helperText={ bidValueHelperText }
					InputProps={{
						startAdornment: <InputAdornment position='start'>₹</InputAdornment>,
					}}
				/>
			</div>
			<Button sx={{mt: 4}} onClick={ handleBid } variant='outlined'>Bid</Button>
		</>
	);

	return auction.highestBidderId === userGlobals.userData.ownerId ? (<div className='flex flex-col items-center border border-black rounded p-[1em] m-[1em] min-w-[300px] bg-green-50'>
		{ content }
	</div>) : (<div className='flex flex-col items-center border border-black rounded p-[1em] m-[1em] min-w-[300px]'>
		{ content }
	</div>);
}