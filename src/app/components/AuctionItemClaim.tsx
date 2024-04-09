import type { Auction } from '@/app/customTypes';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Snackbar from '@mui/material/Snackbar';

import Image from 'next/image';
import { useState } from 'react';

import { socket } from '../socket';

import { QrReader } from 'react-qr-reader';

export default function({ auction }: { auction: Auction }) {
	const [openModal, setOpenModal] = useState(false);
	const [removeAuction, setRemoveAuction] = useState(false);
	const [openSnackbar, setOpenSnackbar] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");

	function handleClaim() {
		setOpenModal(true);
	}

	function handleQrResult(result: any, error: any) {
		if (result?.text) {
			setOpenModal(false);
			socket.emit("scannedQr", auction._id, result.text, (success: boolean) => {
				if (success) {
					setRemoveAuction(true);
					setOpenSnackbar(true);
					setSnackbarMessage("Auction claimed successfully");
				} else {
					setOpenSnackbar(true);
					setSnackbarMessage("Incorrect QR code scanned");
				}
			});
		}
	}

	if (removeAuction) {
		return null;
	}

	return (<div className='flex flex-col items-center border border-black rounded p-[1em] m-[1em] min-w-[300px]'>
		<Image src='/logo.png' alt='Item Image' width='256' height='256' />
		<Typography sx={{mt: 4}} variant='h3'>{auction.itemName}</Typography>
		<div className='flex flex-col items-left mt-[1em] min-w-[250px]'>
			<Typography variant='h6'>Description:</Typography>
			<Typography variant='subtitle1'>{auction.itemDescription}</Typography>
			<Typography variant='h6'>Bought at:</Typography>
			<Typography variant='subtitle1'>₹{auction.currentBid}</Typography>
		</div>
		<Button sx={{mt: 4}} onClick={ handleClaim } variant='outlined'>Scan seller QR</Button>
		<Modal open={openModal} onClose={() => setOpenModal(false)}>
			<div className="flex flex-col">
				<QrReader onResult={handleQrResult} constraints={{ facingMode: "environment" }} />
				<Button onClick={() => setOpenModal(false)} variant="contained">Close</Button>
			</div>
		</Modal>
		<Snackbar
			open={openSnackbar}
			autoHideDuration={3000}
			message={snackbarMessage}
		/>
	</div>);
}