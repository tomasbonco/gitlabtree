import { PubSub } from "./libs/pubsub";
import { autoinject } from "./libs/container";

declare const chrome, browser;

@autoinject
export class SettingsStore
{
	public onceReady; // constructor will assign a promise here

	private storage = (chrome || browser).storage.local

	private defaultValues =
	{
		'single-change': true,
		'file-sort': 2,
		'panel-width': 250,
	}
	
	private state = this.defaultValues;


	constructor( private pubsub: PubSub )
	{
		this.onceReady = this.pullSettings();
	}


	private setState( newState )
	{
		this.state = Object.assign( {}, this.state, newState )
	}


	pullSettings(): Promise<any>
	{
		return new Promise( ( resolve, reject ) =>
		{			
			const callback = values => 
			{
				// If we are running this for a first time, there might be
				// some values undefined. So we try to merge these that are not
				// undefined with a previous state (in a first time it's default values).

				const newState = Object.assign( {}, this.state );
				
				Object.keys( values ).forEach( key =>
				{
					if ( values.hasOwnProperty( key ) )
					{
						const value = values[ key ];

						if ( value !== undefined || value !== null )
						{
							newState[ key ] = value;
						}
					}
				})

				this.setState( newState )
				resolve( newState )
			}

			
			// Chrome uses callbacks, Firefox uses Promises, so this is cross-browser solution
			const keys = Object.keys( this.defaultValues );
			const storage = this.storage.get( keys, callback )
			
			if ( storage && storage.then )
			{
				storage.then( callback )
			}
		})
	}


	pushSettings( settings )
	{
		this.setState( settings )
		this.storage.set( this.state )
		this.pubsub.publish( 'settings-changed', Object.assign( {}, this.state ) );
	}


	get( name: string )
	{
		return this.state[ name ];
	}


	getAll()
	{
		return Object.assign( {}, this.state ); // return copy, so receiver can't mutate our internal state
	}
}