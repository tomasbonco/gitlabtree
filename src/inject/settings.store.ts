import { PubSub } from "./libs/pubsub";
import { autoinject } from "./libs/container";
import { EVENT_SETTINGS_CHANGED } from "./constants";

export interface ISettings
{
	'single-change': boolean;
	'file-sort': number;
	'panel-width': number;
}


@autoinject
export class SettingsStore
{
	public onceReady; // constructor will assign a promise here

	private storage = localStorage;

	private defaultValues: ISettings =
	{
		'single-change': true,
		'file-sort': 2,
		'panel-width': 250,
	}
	
	private state: ISettings = this.defaultValues;


	constructor( private pubsub: PubSub )
	{
		this.onceReady = this.pullSettings();
	}


	private setState( newState: ISettings|any )
	{
		this.state = Object.assign( {}, this.state, newState )
	}


	pullSettings(): Promise<any>
	{
		return new Promise( ( resolve ) =>
		{			
			const result = Object.assign( {}, this.state )

			Object.keys(this.defaultValues).forEach((key) => {
				const val = this.storage.getItem(key)
				val && (result[key] = val)
			})

			resolve(result)
		})
	}


	pushSettings( settings )
	{
		this.setState( settings )

		Object.keys(settings).forEach((key) => {
			const val = settings[key]
			val && this.storage.setItem(key, val)
		})

		this.pubsub.publish( EVENT_SETTINGS_CHANGED, Object.assign( {}, this.state ) );
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