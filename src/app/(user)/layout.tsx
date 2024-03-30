"use client"

import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { socket } from '../socket';

import { User } from '@/app/customTypes';

import { userGlobals } from './userGlobals';

export default function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();

	// TODO: handle socket not connected on dashboard load more elegantly
	if (!socket) {
		setTimeout(() => {router.push('/');}, 100);
		return (<div>Connecting to server...</div>);
	}

	const [user, authLoading, authError] = useAuthState(auth);
	const [userData, setUserData] = useState({} as User);

	useEffect(() => {
		socket.on('updateUserData', (userData: User) => {
			userGlobals.userData = userData; 
			setUserData(userData);
		});

		socket.emit('initUserData', user?.uid);
	}, []);

  	return (
		<div>
			<div className='flex justify-evenly'>
				{ 
					userData.ownerId ? 
						<div className='flex justify-between'>
							<Typography sx={{mt: 2, mx: 4}} variant='subtitle1'>Balance: ₹{ userData.balance }</Typography> 
							<Typography sx={{mt: 2, mx: 4}} variant='subtitle1'>Locked Balance: ₹{ userData.lockedBalance }</Typography> 
						</div>
					: 
						<div className='flex justify-between'>
							<Typography sx={{mt: 2, mx: 4}} variant='subtitle1'>Balance: Loading...</Typography>	
							<Typography sx={{mt: 2, mx: 4}} variant='subtitle1'>Locked Balance: Loading...</Typography>
						</div>
				}
				<Button sx={{m: 2}} variant='outlined' onClick={ () => router.push('/dashboard') }>Dashboard</Button>
			</div>
			{children}
		</div>
  	);
}