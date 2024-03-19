import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function Home() {
	return (
		<div className="flex flex-col">
			<Typography variant="h1">Hello, world!</Typography>
			<TextField label="Enter your name" />
			<Button variant="contained">Submit</Button>
		</div>
	);
}