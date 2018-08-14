/**
 * Very simple PubSub system.
 */

export class PubSub
{
	subscribers: Map<string, any[]> = new Map<string, any[]>();


	subscribe( message: string, callback: any )
	{
		const subscribers = this.subscribers.get( message ) || [];
		subscribers.push( callback );

		this.subscribers.set( message, subscribers );
	}


	publish( message: string, data?: any )
	{
		const subscribers = this.subscribers.get( message ) || [];
		subscribers.forEach( subscriber =>
		{
			subscriber( message, data );
		})
	}
}