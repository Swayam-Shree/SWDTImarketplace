import type { Auction } from '@/app/customTypes';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Image from 'next/image';
import { useState, useEffect } from 'react';

import { socket } from '../socket';

export default function({ auction }: { auction: Auction }) {
	function handleClaim() {

	}

	return (<div className='flex flex-col items-center border border-black rounded p-[1em] m-[1em] min-w-[300px]'>
		<Image src='/logo.png' alt='Item Image' width='256' height='256' />
		<Typography sx={{mt: 4}} variant='h3'>{auction.itemName}</Typography>
		<div className='flex flex-col items-left mt-[1em] min-w-[250px]'>
			<Typography variant='h6'>Description:</Typography>
			<Typography variant='subtitle1'>{auction.itemDescription}</Typography>
			<Typography variant='h6'>Bought at:</Typography>
			<Typography variant='subtitle1'>₹{auction.currentBid}</Typography>
		</div>
		<Button sx={{mt: 4}} onClick={ handleClaim } variant='outlined'>Scan seller QR</Button>
	</div>);
}