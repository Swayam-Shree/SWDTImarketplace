import { ObjectId } from "mongodb"

export interface Auction {
	_id: ObjectId,
	ownerId: string,
	itemName: string,
	itemDescription: string,
	basePrice: number,
	duration: number,
	initTime: number,
	endTime: number,
	active: boolean,
	currentBid: number,
	highestBidderId: string,
	qrToken: string,
	imageURLs: string[],
	imageRefs: string[]
}

export interface User {
	_id: ObjectId,
	ownerId: string,
	balance: number,
	lockedBalance: number,
	biddings: {
		auctionId: ObjectId,
		bidAmount: number
	}[]
}