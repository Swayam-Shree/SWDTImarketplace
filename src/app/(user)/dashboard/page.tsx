"use client"

import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { socket } from '../../socket';
import { User } from '@/app/customTypes';

export default function Dashboard() {
	const router = useRouter();
	
	// TODO: handle socket not connected on dashboard load more elegantly
	if (!socket) {
		setTimeout(() => {router.push('/');}, 100);
		return (<div>Connecting to server...</div>);
	}

	const [user, authLoading, authError] = useAuthState(auth);
	const [userData, setUserData] = useState({} as User);

	useEffect(() => {
		console.log('getting user data');
		socket.emit('getUserData', user?.uid, (userData: any) => {
			setUserData(userData);
		});
	}, []);

	if (user) {
		return (<div className='flex flex-col items-center'>
			<Typography className='text-center' variant='h2'>Dashboard</Typography>
			<Typography sx={{mt: 2}} variant='h5'>Welcome, { user.displayName }</Typography>
			<Image className='my-[1em] rounded' src={ user.photoURL ? user.photoURL : './logo.png' } alt='Profile Picture' width='100' height='100' />
			
			{ 
				userData.ownerId ? 
					<Typography sx={{mt: 2}} variant='h6'>Balance: ₹{ userData.balance }</Typography> 
				: 
					<Typography sx={{mt: 2}} variant='h6'>Balance: Loading...</Typography>	
			}
			
			<div className='grid grid-cols-2 m-[2em] gap-[2em]'>
				<Button onClick={() => {router.push('./newauction');}} variant='outlined'>Create Auction</Button>
				<Button onClick={() => {router.push('./browseauction');}} variant='outlined'>Browse Auctions</Button>
				<Button onClick={() => {router.push('./ongoingauction');}} variant='outlined'>Your Ongoing Auctions</Button>
				<Button onClick={() => {router.push('./completedauction');}} variant='outlined'>Completed Auctions</Button>
				<Button variant='outlined'>Stuff</Button>
				<Button variant='outlined'>Settings</Button>
			</div>
			<Button sx={{mt: 2}} variant='contained' onClick={ () => auth.signOut() }>Sign Out</Button>
		</div>);
	} else if (authLoading) {
		return (<div>Loading...</div>);
	} else if (authError) {
		return (<div>Error</div>);
	} else {
		router.push('/');
	}
}