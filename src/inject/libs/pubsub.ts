/**
 * Very simple PubSub system.
 */

export class PubSub
{
	subscribers: Map<string, any[]> = new Map<string, any[]>();

	/**
	 * Subscribes to specific message.
	 * 
	 * @param message - what message to receive
	 * @param callback - what should happen once the message is received
	 * @returns callback to unsubscribe
	 */
	subscribe( message: string, callback: any ): () => void
	{
		const subscribers = this.subscribers.get( message ) || [];
		subscribers.push( callback );

		this.subscribers.set( message, subscribers );

		// Unsubscribe
		return () =>
		{
			if ( subscribers.length > 1 )
			{
				subscribers.splice( subscribers.indexOf( callback ), 1 );
			}

			else
			{
				this.subscribers.delete( message );
			}
		}
	}


	/**
	 * Sends a message.
	 * 
	 * @param message - message name
	 * @param data - message data
	 */
	publish( message: string, data?: any )
	{
		const subscribers = this.subscribers.get( message ) || [];
		subscribers.forEach( subscriber =>
		{
			subscriber( message, data );
		})
	}


	/**
	 * 
	 */
	unsubscribeAll()
	{
		this.subscribers = new Map();
	}
}