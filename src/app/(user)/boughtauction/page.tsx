"use client"

import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import { useRouter } from 'next/navigation';

import Typography from '@mui/material/Typography';

import { userGlobals } from '../userGlobals';

import { useState, useEffect } from 'react';

import type { Auction } from '@/app/customTypes';

import AuctionItemClaim from '@/app/components/AuctionItemClaim';

export default function BoughtAuction() {
	const router = useRouter();
	const [user, authLoading, authError] = useAuthState(auth);

	const [auctions, setAuctions] = useState(userGlobals.boughtAuctions);

	useEffect(() => {
		setAuctions(userGlobals.boughtAuctions);
	}, []);

	let auctionsJsx;
	if (auctions.length === 0) {
		auctionsJsx = <div>No auctions bought yet</div>;
	} else {
		auctionsJsx = auctions.map((auction: Auction, index) => {
			return (
				<div key={index}>
					<AuctionItemClaim auction={auction} />
				</div>
			);
		});
	}

	if (user) {
		return (<div className='flex flex-col items-center'>
			<Typography className='text-center' variant='h2'>Bought Auctions</Typography>
			<div className='grid md:grid-cols-2 lg:grid-cols-3'>
				{ auctionsJsx }
			</div>
		</div>);
	} else if (authLoading) {
		return (<div>Loading...</div>);
	} else if (authError) {
		return (<div>Error</div>);
	} else {
		router.push('/');
	}
}