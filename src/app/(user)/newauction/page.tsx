"use client"

import { auth, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';

import { useRouter } from 'next/navigation';

import { useState } from 'react';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CircularProgress from '@mui/material/CircularProgress';

import Carousel from 'react-material-ui-carousel';

import { socket } from '../../socket';

export default function NewAuction() {
	const router = useRouter();
	const [user, authLoading, authError] = useAuthState(auth);

	const [itemName, setItemName] = useState('');
	const [itemDescription, setItemDescription] = useState('');
	const [basePrice, setBasePrice] = useState('');
	const durationDefaultVal = '1';
	const [duration, setDuration] = useState(durationDefaultVal);

	const [itemNameError, setItemNameError] = useState(false);
	const [itemDescriptionError, setItemDescriptionError] = useState(false);
	const [basePriceError, setBasePriceError] = useState(false);

	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");

	const [imageFiles, setImageFiles] = useState(null as FileList | null);

	const [uploading, setUploading] = useState(false);

	async function handleCreateAuction() {
		setItemNameError(!itemName);
		setItemDescriptionError(!itemDescription);
		setBasePriceError(!basePrice);

		if (!imageFiles) {
			setSnackbarOpen(true);
			setSnackbarMessage("Please upload images and enter all fields.");
		}

		if (itemName && itemDescription && basePrice && imageFiles) {
			setUploading(true);
			
			let imageURLs = [], imageRefs = [];
			for (let i = 0; i < imageFiles.length; ++i) {
				const file = imageFiles[i];
				const reff = String(Date.now()) + file.name;
				const storageRef = ref(storage, reff);

				await uploadBytes(storageRef, file);
				
				imageURLs.push(await getDownloadURL(storageRef));
				imageRefs.push(reff);
			}

			socket.emit('createAuction', {
				ownerId: user?.uid, 
				itemName,
				itemDescription,
				basePrice: parseInt(basePrice),
				duration: parseInt(duration) * 3600 * 1000, // converting hours to milliseconds
				imageURLs: imageURLs,
				imageRefs: imageRefs,
			}, (success: boolean) => {
				setUploading(false);
				if (success) {
					setItemName('');
					setItemDescription('');
					setBasePrice('');
					setDuration(durationDefaultVal);
					setImageFiles(null);

					setSnackbarOpen(true);
					setSnackbarMessage("Auction created successfully.");
				} else {
					setSnackbarOpen(true);
					setSnackbarMessage("Auction creation failed, please try again.");
				}
			});
		}
	}

	const durationOptions = [
		{ value: '1', label: '1 hour' },
		{ value: '3', label: '3 hours' },
		{ value: '6', label: '6 hours' },
		{ value: '8', label: '8 hours' },
		{ value: '12', label: '12 hours' },
		{ value: '24', label: '1 day' },
		{ value: '48', label: '2 days' },
		{ value: '72', label: '3 days' },
		{ value: '168', label: '1 week' }
	];

	if (user) {
		return (<div className='flex flex-col items-center m-[2em]'>
			<Typography className='text-center' variant='h2'>Create Auction</Typography>

			<TextField className='max-w-[768px]' sx={{mt: 6}} label='Item Name' value={ itemName } onChange={(e) => {setItemName(e.target.value);}} inputProps={{ maxLength: 64 }} error={itemNameError} fullWidth variant='filled' />
			<TextField className='max-w-[768px]' sx={{mt: 4}} label='Item Description' value={ itemDescription } onChange={(e) => {setItemDescription(e.target.value);}} inputProps={{ maxLength: 500 }} error={itemDescriptionError} multiline fullWidth variant='filled' />
			<TextField className='max-w-[768px]' sx={{mt: 4}} label='Base Price' type='number' error={basePriceError} fullWidth variant='filled'
				value={ basePrice } onChange={(e) => {setBasePrice(e.target.value);}}
				inputProps={{
					maxLength: 8,
				}}
				InputProps={{
					startAdornment: <InputAdornment position='start'>₹</InputAdornment>,
				}}
			/>
			<TextField className='max-w-[768px]' sx={{mt: 4}} label="Duration" value={ duration } onChange={(e) => {setDuration(e.target.value);}} select defaultValue={durationDefaultVal} fullWidth variant='filled'>
				{
					durationOptions.map((option) => (
						<MenuItem key={option.value} value={option.value}>
							{option.label}
						</MenuItem>
					))
				}
			</TextField>

			{ 
				imageFiles && <Carousel className='min-w-[256px] my-[4em]'>
					{
						imageFiles && Array.from(imageFiles).map((file, index) => (
							<img key={index} src={URL.createObjectURL(file)} />
						))
					}
				</Carousel>
			}

			<Button sx={{mt: 2}} component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
				Upload Images
					<input onChange={ (e) => setImageFiles(e?.target?.files) } type="file" hidden multiple />
			</Button>

			{
				uploading && <CircularProgress sx={{mt: 4}} />
			}

			<Button sx={{mt: 6}} onClick={ handleCreateAuction } variant='outlined' disabled={uploading}>Create Auction</Button>

			<Snackbar
				open={snackbarOpen}
				autoHideDuration={3000}
				onClose={() => {setSnackbarOpen(false);}}
				message={snackbarMessage}
			/>
		</div>);
	} else if (authLoading) {
		return (
			<div>
				Loading...
				<CircularProgress />
			</div>
		);
	} else if (authError) {
		return (<div>Error</div>);
	} else {
		router.push('/');
	}
}