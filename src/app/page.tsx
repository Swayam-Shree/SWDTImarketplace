"use client";

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { auth } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import { useRouter } from 'next/navigation';


export default function Landing() {
	const router = useRouter();
	const [user, authLoading, authError] = useAuthState(auth);

	function handleLogin() {
		router.push('/login');
	}

	if (user) {
		router.push('/dashboard');
	} else {
		return (<div className='flex flex-col items-center'>
			<Typography className='text-center' sx={{mt: 1}} variant='h2'>SWDTI marketplace</Typography>
			<Typography sx={{mt: 6}}>Welcome to the ultimate bidding marketplace.</Typography>
			<Typography sx={{mt: 1}}>Compete to buy everything at the cheapest prices.</Typography>
			<Button sx={{mt: 6}} variant='contained' onClick={ handleLogin }>Login / Sign Up</Button>
		</div>);
	}
}