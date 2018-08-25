import { autoinject } from './libs/container';
import { Structure } from './mining/structure';
import { h } from 'superfine'
import { PubSub } from './libs/pubsub';
import { SettingsStore } from './settings.store';
import { Views } from './libs/views';
import { EVENT_SETTINGS_CHANGED, EVENT_TOGGLE_NAVIGATION, EVENT_TOGGLE_EXTENSION } from './constants';

@autoinject
export class Navigation
{
	private isNavigationOpened: boolean = true;
	private lastSort;

	constructor( private structure: Structure, private pubsub: PubSub, private views: Views, private settingsStore: SettingsStore )
	{
		// Subscribe to inner-module event system
		this.pubsub.subscribe( EVENT_SETTINGS_CHANGED, () => this.settingsChanged() );

		// Read settings and set default values
		this.lastSort = this.settingsStore.get( 'file-sort' );

		// Apply settings
		this.settingsChanged();
	}


	/**
	 * Callback fired once settings are changed.
	 */
	settingsChanged()
	{
		const sort = this.settingsStore.get( 'file-sort' );
		
		if ( this.lastSort !== sort )
		{
			this.views.redrawView( 'navigation' );
			this.lastSort = sort;
		}

		if ( this.settingsStore.get( 'single-change' ) && this.structure.flatFileStructure.length < 2 )
		{
			this.onToggleNavigationIsOpen( false );
		}
	}


	/**
	 * Opens the settings modal window.
	 */
	onOpenSettings(): void
	{
		this.pubsub.publish( 'open-settings' );
	}

	
	/**
	 * Navigation can have two states - collapsed, when it consumes only 50px, or expanded
	 * when it consumes as much as user defined (250px by default). This function toggles
	 * between them.
	 *
	 * @param {boolean} isOn - leave this empty if you want oposite of the previous value, or force the new value
	 */
	onToggleNavigationIsOpen( isOpen?: boolean )
	{
		this.isNavigationOpened = isOpen !== undefined ? isOpen : ! this.isNavigationOpened
	
		this.pubsub.publish( EVENT_TOGGLE_NAVIGATION, this.isNavigationOpened ); // changes on top level are required
		this.views.redrawView( 'navigation' );
	}


	/**
	 * This redirects a message, to specify whether extension should be working or not.
	 */
	onToggleExtensionIsOn()
	{
		this.pubsub.publish( EVENT_TOGGLE_EXTENSION );
	}


	render(): any
	{
		return (
			<div>
				
				<div class="gitlab-tree-plugin__files">

					{ this.structure.entryPoint.render() }
					
				</div>

				<div class="gitlab-tree-plugin__menu">

					<div class={`gitlab-tree-plugin__menu__item ${ this.isNavigationOpened ? '' : 'gitlab-tree-plugin--is-hidden' }`} title="Turn extension off" onclick={ () => this.onToggleExtensionIsOn() }>
						
						<i class="fa fa-power-off"></i>

					</div>

					<div class={`gitlab-tree-plugin__menu__item ${ this.isNavigationOpened ? '' : 'gitlab-tree-plugin--is-hidden' }`} title="Settings" onclick={ () => this.onOpenSettings() }>
					
						<i class="fa fa-cog"></i>

					</div>

					<div class="gitlab-tree-plugin__menu__item" id="gitlab-tree-plugin__toggle-hide" onclick={ () => this.onToggleNavigationIsOpen() } title="Collapse file browser">
					
						<i class={`fa fa-angle-double-${ this.isNavigationOpened ? 'left' : 'right' }`}></i>

					</div>

				</div>

			</div>
		);
	}
}