import Vue from 'vue'
import { store } from '../store/index';
import TreeList from './tree-list.vue'

export function treeList( element: HTMLElement )
{
	const treeList = new Vue(
	{
		el: element,
		// provide the store using the "store" option.
		// this will inject the store instance to all child components.
		store,
		components: { TreeList },
		template: `<TreeList></TreeList>`
	})
}