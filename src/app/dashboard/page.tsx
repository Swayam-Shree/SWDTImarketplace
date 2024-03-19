"use client"

import { auth } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

import { useRouter } from 'next/navigation';

import Button from '@mui/material/Button';

export default function Dashboard() {
	const router = useRouter();
	const [user, authLoading, authError] = useAuthState(auth);

	if (user) {
		return (<div>
			<h1>Dashboard</h1>
			<p>Welcome, { user.displayName }</p>
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