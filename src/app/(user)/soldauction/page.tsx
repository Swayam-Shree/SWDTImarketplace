"use client"

import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import { useRouter } from 'next/navigation';

import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { userGlobals } from '../userGlobals';

import { useState, useEffect } from 'react';

import type { Auction } from '@/app/customTypes';

import AuctionItemSell from '@/app/components/AuctionItemSell';

export default function BoughtAuction() {
	const router = useRouter();
	const [user, authLoading, authError] = useAuthState(auth);

	const [auctions, setAuctions] = useState(userGlobals.soldAuctions);

	useEffect(() => {
		setAuctions(userGlobals.soldAuctions);
	}, []);

	let auctionsJsx;
	if (auctions.length === 0) {
		auctionsJsx = <div>No auctions sold yet</div>;
	} else {
		auctionsJsx = auctions.map((auction: Auction, index) => {
			return (
				<div key={index}>
					<AuctionItemSell auction={auction} />
				</div>
			);
		});
	}

	if (user) {
		return (<div className='flex flex-col items-center'>
			<Typography className='text-center' variant='h2'>Sold Auctions</Typography>
			<div className='grid md:grid-cols-2 lg:grid-cols-3'>
				{ auctionsJsx }
			</div>
		</div>);
	} else if (authLoading) {
		return (
			<div>
				Loading...
				<CircularProgress />
			</div>
		);
	} else if (authError) {
		return (<div>Error</div>);
	} else {
		router.push('/');
	}
}