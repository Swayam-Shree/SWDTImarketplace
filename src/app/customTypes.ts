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