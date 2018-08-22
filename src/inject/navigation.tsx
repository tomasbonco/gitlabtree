import { autoinject } from './libs/container';
import { Structure } from './mining/structure';
import { h } from 'superfine'
import { PubSub } from './libs/pubsub';
import { SettingsStore } from './settings.store';
import { Views } from './libs/views';

@autoinject
export class Navigation
{
	private isNavigationOpened: boolean = true;
	private lastSort;

	constructor( private structure: Structure, private pubsub: PubSub, private views: Views, private settingsStore: SettingsStore )
	{
		this.lastSort = this.settingsStore.get( 'file-sort' );

		this.settingsChanged();

		this.pubsub.subscribe( 'settings-changed', () => this.settingsChanged() );
	}


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
			this.toggleHideNavigation( false );
		}
	}


	openSettings()
	{
		this.pubsub.publish( 'open-settings' );
	}


	toggleHideNavigation( display?: boolean )
	{
		if ( display === undefined )
		{
			this.isNavigationOpened = ! this.isNavigationOpened;
		}

		else
		{
			this.isNavigationOpened = display;
		}

		this.pubsub.publish( 'toggle-navigation', this.isNavigationOpened );
		this.views.redrawView( 'navigation' );
	}


	toggleExtensionIsOn()
	{
		console.log( 'toggle me baby' )
		this.pubsub.publish( 'toggle-extension-is-on' );
	}


	render(): any
	{
		return (
			<div>
				
				<div class="gitlab-tree-plugin__files">

					{ this.structure.entryPoint.render() }
					
				</div>

				<div class="gitlab-tree-plugin__menu">

					<div class={`gitlab-tree-plugin__menu__item ${ this.isNavigationOpened ? '' : 'gitlab-tree-plugin--is-hidden' }`} title="Turn extension off" onclick={ () => this.toggleExtensionIsOn() }>
						
						<i class="fa fa-power-off"></i>

					</div>

					<div class={`gitlab-tree-plugin__menu__item ${ this.isNavigationOpened ? '' : 'gitlab-tree-plugin--is-hidden' }`} title="Settings" onclick={ () => this.openSettings() }>
					
						<i class="fa fa-cog"></i>

					</div>

					<div class="gitlab-tree-plugin__menu__item" id="gitlab-tree-plugin__toggle-hide" onclick={ () => this.toggleHideNavigation() } title="Collapse file browser">
					
						<i class={`fa fa-angle-double-${ this.isNavigationOpened ? 'left' : 'right' }`}></i>

					</div>

				</div>

			</div>
		);
	}
}