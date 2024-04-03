import { User, Auction } from '@/app/customTypes';

export let userGlobals = {
	userData: {} as User,
	soldAuctions: [] as Auction[],
	boughtAuctions: [] as Auction[]
}