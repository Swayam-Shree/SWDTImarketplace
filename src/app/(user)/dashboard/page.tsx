"use client"

import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import CircularProgress from '@mui/material/CircularProgress';

import { useEffect, useState } from 'react';

import { socket } from '@/app/socket';

import { userGlobals } from '../userGlobals';

export default function Dashboard() {
	const router = useRouter();
	const [user, authLoading, authError] = useAuthState(auth);
	const [boughtAuctionCount, setBoughtAuctionCount] = useState(0);
	const [soldAuctionCount, setSoldAuctionCount] = useState(0);

	useEffect(() => {
		socket.on('sendAuctionStats', (boughtAuctions, soldAuctions) => {
			setBoughtAuctionCount(boughtAuctions.length);
			setSoldAuctionCount(soldAuctions.length);
			userGlobals.boughtAuctions = boughtAuctions;
			userGlobals.soldAuctions = soldAuctions;
		});

		socket.emit('getAuctionStats', user?.uid);

		return () => {
			socket.off('getAuctionStats');
		};
	}, []);

	if (user) {
		return (<div className='flex flex-col items-center'>
			<Typography className='text-center' variant='h2'>Dashboard</Typography>
			<Typography sx={{mt: 2}} variant='h5'>Welcome, { user.displayName }</Typography>
			<Image className='my-[1em] rounded' src={ user.photoURL ? user.photoURL : './logo.png' } alt='Profile Picture' width='100' height='100' />

			<div className='grid grid-cols-2 m-[2em] gap-[2em]'>
				<Button onClick={() => {router.push('./newauction');}} variant='outlined'>Create Auction</Button>
				<Button onClick={() => {router.push('./browseauction');}} variant='outlined'>Browse Auctions</Button>
				<Button onClick={() => {router.push('./createdongoing');}} variant='outlined'>Created Ongoing Auctions</Button>
				<Button onClick={() => {router.push('./biddedongoing')}} variant='outlined'>Bidded Ongoing Auctions</Button>
				<Badge badgeContent={boughtAuctionCount} color='primary'>
					<Button onClick={() => {router.push('./boughtauction');}} variant='outlined'>Bought Auctions</Button>
				</Badge>
				<Badge badgeContent={soldAuctionCount} color='primary'>
					<Button onClick={() => {router.push('./soldauction');}} variant='outlined'>Sold Auctions</Button>
				</Badge>
			</div>
			<Button sx={{mt: 2}} variant='contained' onClick={ () => {auth.signOut();} }>Sign Out</Button>
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