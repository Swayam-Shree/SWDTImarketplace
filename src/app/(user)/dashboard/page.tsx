"use client"

import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function Dashboard() {
	const router = useRouter();
	const [user, authLoading, authError] = useAuthState(auth);

	if (user) {
		return (<div className='flex flex-col items-center'>
			<Typography variant='h2'>Dashboard</Typography>
			<Typography sx={{mt: 2}} variant='h5'>Welcome, { user.displayName }</Typography>
			<Image className='my-[1em] rounded' src={ user.photoURL ? user.photoURL : './logo.png' } alt='Profile Picture' width='100' height='100' />
			<div className='grid grid-cols-2 m-[4em] gap-[2em]'>
				<Button onClick={() => {router.push('./newauction')}} variant='outlined'>Create Auction</Button>
				<Button variant='outlined'>Browse Auctions</Button>
				<Button variant='outlined'>Your Ongoing Auctions</Button>
				<Button variant='outlined'>History</Button>
				<Button variant='outlined'>Stuff</Button>
				<Button variant='outlined'>Settings</Button>
			</div>
			<Button variant='contained' onClick={ () => auth.signOut() }>Sign Out</Button>
		</div>);
	} else if (authLoading) {
		return (<div>Loading...</div>);
	} else if (authError) {
		return (<div>Error</div>);
	} else {
		router.push('/');
	}
}