export interface Auction {
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