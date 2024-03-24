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
	currentBid: number
}

export interface User {
	_id: ObjectId,
	ownerId: string,
	balance: number,
	ongoingAuctions: Auction[],
	completedAuctions: Auction[]
}