"use client"

import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';

import { useEffect, useState } from 'react';

import { socket } from '@/app/socket';

import type { Auction } from '@/app/customTypes';

export default function Dashboard() {
	const router = useRouter();
	const [user, authLoading, authError] = useAuthState(auth);
	const [wonAuctions, setWonAuctions] = useState([] as Auction[]);

	useEffect(() => {
		socket.on('wonAuctions', (wonAuctions) => {
			setWonAuctions(wonAuctions);
		});

		socket.emit('getWonAuctions', user?.uid);

		return () => {
			socket.off('wonAuctions');
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
				<Button onClick={() => {router.push('./ongoingauction');}} variant='outlined'>Your Ongoing Auctions</Button>
				<Badge badgeContent={wonAuctions.length} color='primary'>
					<Button onClick={() => {router.push('./completedauction');}} variant='outlined'>Completed Auctions</Button>
				</Badge>
				<Button variant='outlined'>Stuff</Button>
				<Button variant='outlined'>Settings</Button>
			</div>
			<Button sx={{mt: 2}} variant='contained' onClick={ () => {auth.signOut();} }>Sign Out</Button>
		</div>);
	} else if (authLoading) {
		return (<div>Loading...</div>);
	} else if (authError) {
		return (<div>Error</div>);
	} else {
		router.push('/');
	}
}