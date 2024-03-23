"use client"

import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import { useRouter } from 'next/navigation';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function CompletedAuction() {
	const router = useRouter();
	const [user, authLoading, authError] = useAuthState(auth);

	if (user) {
		return (<div className='flex flex-col items-center'>
			<Typography className='text-center' variant='h2'>Completed Auctions</Typography>
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