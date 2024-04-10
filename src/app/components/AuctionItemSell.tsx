import type { Auction } from '@/app/customTypes';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Carousel from 'react-material-ui-carousel';

import Image from 'next/image';

import QRCode from "react-qr-code";

import { useState } from 'react';

import { socket } from '../socket';

export default function({ auction }: { auction: Auction }) {
	const [qrVal, setQrVal] = useState("");

	function handleGenerate() {
		socket.emit("generateQr", auction._id, (success: boolean, qrVal: string) => {
			if (success) {
				setQrVal(qrVal);
			} else {
				console.error("Failed to generate QR");
			}
		});
	}

	return (<div className='flex flex-col items-center border border-black rounded p-[1em] m-[1em] min-w-[300px]'>
		<Carousel className='min-w-[256px]'>
			{
				auction.imageURLs.map((url, index) => (
					<Image key={index} src={url} alt='Item Image' width='256' height='256' />
				))
			}
		</Carousel>
		
		<Typography sx={{mt: 4}} variant='h3'>{auction.itemName}</Typography>
		<div className='flex flex-col items-left mt-[1em] min-w-[250px]'>
			<Typography variant='h6'>Description:</Typography>
			<Typography variant='subtitle1'>{auction.itemDescription}</Typography>
			<Typography variant='h6'>Sold at:</Typography>
			<Typography variant='subtitle1'>₹{auction.currentBid}</Typography>
		</div>
		<Button sx={{my: 1}} onClick={ handleGenerate } variant="contained">Generate QR</Button>
		<div>
			{
				qrVal ? <QRCode size={256} value={qrVal} /> : null
			}
		</div>
	</div>);
}