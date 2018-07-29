import { Container } from './container';
import { GitLabTree } from './inject';

const container = new Container();
const gitlabTree: GitLabTree = container.get( GitLabTree );