"use client"

import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { socket } from '../../socket';

import type { Auction } from '@/app/customTypes';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import AuctionItemCard from '@/app/components/AuctionItemCard';

export default function BrowseAuction() {
	const router = useRouter();
	const [user, authLoading, authError] = useAuthState(auth);

	const [auctionsLoading, setAuctionsLoading] = useState(true);
	const [auctions, setAuctions] = useState([] as Auction[]);

	useEffect(() => {
		try{
			socket.emit('getAuctions', (data: Auction[]) => {
				setAuctionsLoading(false);
				setAuctions(data);
			});
		} catch (e) {
			router.push('/dashboard');
		}
	}, []);

	let auctionsJsx;
	if (!auctionsLoading) {
		if (auctions.length === 0) {
			auctionsJsx = <div>No active auctions...</div>;
		} else {
			auctionsJsx = auctions.map((auction: Auction, index) => {
				return (
					<div key={index}>
						<AuctionItemCard auction={auction} />
					</div>
				);
			});
		}
	} else {
		auctionsJsx = <div>Loading...</div>;
	}

	if (user) {
		return (<div className='flex flex-col items-center m-[2em]'>
			<Typography className='text-center' variant='h2'>Browse Auctions</Typography>
			<Button sx={{m: 2}} variant='outlined' onClick={ () => router.push('/dashboard') }>Back to Dashboard</Button>
			{ auctionsJsx }
		</div>);
	} else if (authLoading) {
		return (<div>Loading...</div>);
	} else if (authError) {
		return (<div>Error</div>);
	} else {
		router.push('/');
	}
}