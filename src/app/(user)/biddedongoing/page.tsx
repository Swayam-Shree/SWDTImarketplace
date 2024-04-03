"use client"

import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { socket } from '../../socket';

import type { Auction } from '@/app/customTypes';

import Typography from '@mui/material/Typography';

import AuctionItemBid from '@/app/components/AuctionItemBid';

import { userGlobals } from '../userGlobals';

export default function BrowseAuction() {
	const router = useRouter();
	const [user, authLoading, authError] = useAuthState(auth);

	const [auctionsLoading, setAuctionsLoading] = useState(true);
	const [auctions, setAuctions] = useState([] as Auction[]);
	const [updatedAuction, setUpdatedAuction] = useState({} as Auction);

	useEffect(() => {
		try{
			socket.on('updateAuction', (auction: Auction) => {
				if (userGlobals.userData.biddings.map(bidding => bidding.auctionId).indexOf(auction._id) !== -1) {
					setUpdatedAuction(auction);
				}
			});

			socket.emit('getBiddedOngoingAuctions', user?.uid, (auctions: Auction[]) => {
				setAuctionsLoading(false);
				setAuctions(auctions);
			});
		} catch (e) {
			router.push('/dashboard');
		}

		return () => {
			socket.off('updateAuction');
		};
	}, []);

	if (updatedAuction._id) {
		for (let i = 0; i < auctions.length; ++i) {
			if (auctions[i]._id === updatedAuction._id) {
				auctions[i] = updatedAuction;
				setUpdatedAuction({} as Auction);
				setAuctions(auctions);
				break;
			}
		}
	}

	let auctionsJsx;
	if (!auctionsLoading) {
		if (auctions.length === 0) {
			auctionsJsx = <div>No active auctions...</div>;
		} else {
			auctionsJsx = auctions.map((auction: Auction, index) => {
				return (
					<div key={index}>
						<AuctionItemBid auction={auction} />
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