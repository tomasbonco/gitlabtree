import { h, app } from 'hyperapp'

const state =
{
	count: 0
}

const actions =
{
	down: value => state => ({ count: state.count - value }),
	up: value => state => ({ count: state.count + value })
}

const view = (state, actions) =>
(
	<div class="folder gitlab-tree-plugin-folder-expanded">
		<div class="holder" title="{state.folderName}">{state.folderName}</div>
		
		<a href="#b40f98529f916358017e5cb2a143511dd52b8e44" class="file gitlab-tree-plugin-file-updated gitlab-tree-plugin-file-active">
			<span>a.md</span>
		</a>
	</div>
)

app(state, actions, view, document.body)