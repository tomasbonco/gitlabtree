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
	}


	openSettings()
	{
		this.pubsub.publish( 'open-settings' );
	}


	toggleHideNavigation()
	{
		this.isNavigationOpened = ! this.isNavigationOpened;
		this.pubsub.publish( 'toggle-navigation', this.isNavigationOpened );
		this.views.redrawView( 'navigation' );
	}


	render(): any
	{
		return (
			<div>
				
				{ this.structure.entryPoint.render() }

				<div class="gitlab-tree-plugin__menu">

					<div class={`gitlab-tree-plugin__menu__item ${ this.isNavigationOpened ? '' : 'gitlab-tree-plugin-hidden' }`} title="Turn extension off">
						
						<i class="fa fa-power-off"></i>

					</div>

					<div class={`gitlab-tree-plugin__menu__item ${ this.isNavigationOpened ? '' : 'gitlab-tree-plugin-hidden' }`} title="Settings" onclick={ () => this.openSettings() }>
					
						<i class="fa fa-cog"></i>

					</div>

					<div class="gitlab-tree-plugin__menu__item gitlab-tree-plugin__toggle-hide" onclick={ () => this.toggleHideNavigation() } title="Collapse file browser">
					
						<i class={`fa fa-angle-double-${ this.isNavigationOpened ? 'left' : 'right' }`}></i>

					</div>

				</div>

			</div>
		);
	}
}