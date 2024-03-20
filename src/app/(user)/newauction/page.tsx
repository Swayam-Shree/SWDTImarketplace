"use client"

import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import { useRouter } from 'next/navigation';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export default function NewAuction() {
	const router = useRouter();
	const [user, authLoading, authError] = useAuthState(auth);

	if (user) {
		return (<div className='flex flex-col items-center m-[2em]'>
			<Typography className='text-center' variant='h2'>Create Auction</Typography>
			<Button sx={{m: 2}} variant='outlined' onClick={ () => router.push('/dashboard') }>Back to Dashboard</Button>
			<TextField sx={{mt: 4}} label='Item Name' fullWidth variant='filled' />
			<TextField sx={{mt: 2}} label='Item Description' multiline fullWidth variant='filled' />
			<TextField sx={{mt: 2}} label='Base Price' multiline fullWidth variant='filled' />
			<TextField sx={{mt: 2}} label='Duration' multiline fullWidth variant='filled' />
			<Button sx={{mt: 4}} variant='contained'>Create Auction</Button>
		</div>);
	} else if (authLoading) {
		return (<div>Loading...</div>);
	} else if (authError) {
		return (<div>Error</div>);
	} else {
		router.push('/');
	}
}