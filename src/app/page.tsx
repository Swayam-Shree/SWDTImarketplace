"use client"

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { auth } from './firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Landing() {
	const [user, authLoading, authError] = useAuthState(auth);

	if (user) {
		return (<div className='flex flex-col'>
			dashboard
		</div>);
	} else {
		return (<div className='flex flex-col'>
			hellow
		</div>);
	}
}