import { h } from 'superfine'
import { Views } from './libs/views';
import { autoinject } from './libs/container';
import { PubSub } from './libs/pubsub';
import { SettingsStore } from './settings.store';
declare const chrome, browser;

export enum EFileSort { AZName, ZAName, AZExt, ZAExt };


@autoinject
export class Settings
{
	state = {} as any;
	storage = (chrome || browser).storage.local

	constructor( private views: Views, private pubsub: PubSub, private settingsStore: SettingsStore )
	{
		this.setState( settingsStore.getAll() );

		this.pubsub.subscribe( 'open-settings', () => this.show() );
	}

	
	setState( newState )
	{
		this.state = Object.assign( {}, this.state, newState );
		this.views.redrawView( 'settings' );
	}
	

	show()
	{
		this.setState({ isDisplayed: true })
		this.views.redrawView( 'settings' );

	}


	hide()
	{
		this.setState({ isDisplayed: false })
		this.views.redrawView( 'settings' );
	}


	save()
	{
		const newSettings =
		{
			'single-change': this.state['single-change'],
			'file-sort': this.state['file-sort'],
			'panel-width': this.state['panel-width']
		}

		this.settingsStore.pushSettings( newSettings );
		this.hide();
	}


	valueChanged( field: string, value: string|boolean )
	{
		if ( field === 'single-change' && ! [ true, false ].includes( value as boolean ))
		{
			return;
		}


		if ( field === 'file-sort' && ! [ '0', '1', '2', '3' ].includes( value as string ))
		{
			return;
		}


		if ( field === 'panel-width' && ! (value as string).match( /^[0-9]+$/ ))
		{
			return;
		}

		this.setState({ [field]: value })
	}


	render()
	{
		const fileSort = parseInt( this.state['file-sort'] );

		return (
			<div class={`gitlab-tree-plugin__settings ${ this.state.isDisplayed ? '' : 'gitlab-tree-plugin-hidden' }`} onclick={e => (e.target as HTMLElement ).classList.contains( 'gitlab-tree-plugin__settings' ) ? this.hide() : undefined }>
			
				<div class="gitlab-tree-plugin__settings__fg">

					<div class="gitlab-tree-plugin__setting">
				
						<label for="checkbox-single-change"> Hide when there is only single change </label>

						<div class="gitlab-tree-plugin__e__toggle">

							<input type="checkbox" id="checkbox-single-change" onchange={ e => this.valueChanged( 'single-change', e.target.checked ) } checked={this.state['single-change']} />
							<label for="checkbox-single-change"></label>

						</div>

					</div>
				
					<div class="gitlab-tree-plugin__setting">
				
						<label> Sort files by </label>
						<select onchange={ e => this.valueChanged( 'file-sort', e.target.value ) }>
							<option value={EFileSort.AZName} selected={fileSort === EFileSort.AZName}> Name A~>Z</option>
							<option value={EFileSort.ZAName} selected={fileSort === EFileSort.ZAName}> Name Z~>A</option>
							<option value={EFileSort.AZExt} selected={fileSort === EFileSort.AZExt}> Extension A~>Z</option>
							<option value={EFileSort.ZAExt} selected={fileSort === EFileSort.ZAExt}> Extension Z~>A</option>
						</select>

					</div>

					<div class="gitlab-tree-plugin__setting">
				
						<label> Panel width </label>

						<div>
							<input type="number" class="gitlab-tree-plugin__e__micro-input" value={this.state['panel-width']} onchange={ e => this.valueChanged( 'panel-width', e.target.value ) } /> px
						</div>

					</div>


					<div class="gitlab-tree-plugin__settings__footer">

						<button class="btn btn-success pull-right gitlab-tree-plugin__settings__footer__save" onclick={() => this.save()}> Save </button>
						<a class="btn btn-second" href="https://github.com/tomasbonco/gitlabtree/issues" target="__blank"> Send feedback </a>
					
					</div>

				</div>

			</div>
		)
	}
}