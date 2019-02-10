import Vuex from 'vuex'
import { IFile, IFolder, IState, IFileUpdate } from './interface';
import { mutations } from './mutations';
import { actions } from './actions';
import { getters } from './getters';
import Vue from 'vue';
import { getDefaultState } from './defaults';

Vue.use( Vuex )

export const store = new Vuex.Store<IState>(
{
	state: getDefaultState,
	getters,
	mutations,
	actions,
})