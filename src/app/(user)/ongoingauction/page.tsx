"use client"

import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import { useRouter } from 'next/navigation';

import { useEffect } from 'react';

import { socket } from '../../socket';

import type { Auction } from '@/app/customTypes';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function OngoingAuction() {
	const router = useRouter();
	const [user, authLoading, authError] = useAuthState(auth);

	useEffect(() => {
		try{
			socket.emit('getMyOngoingAuctions', (data: Auction[]) => {
				// stuff to do
			});
		} catch (e) {
			router.push('/dashboard');
		}
	}, []);

	if (user) {
		return (<div className='flex flex-col items-center'>
			<Typography className='text-center' variant='h2'>Your Ongoing Auctions</Typography>
			<Button sx={{m: 2}} variant='outlined' onClick={ () => router.push('/dashboard') }>Back to Dashboard</Button>
		</div>);
	} else if (authLoading) {
		return (<div>Loading...</div>);
	} else if (authError) {
		return (<div>Error</div>);
	} else {
		router.push('/');
	}
}