<script lang="ts">

import Vue from 'vue'
import { CSS_PREFIX } from '../constants';
import File from './file.vue'
import { EActions } from '../store/actions';

export default Vue.extend({
    name: 'Folder',
    props: [ 'folder', 'level' ],
    components: { File },
    data()
    {
        return {
            CSS_PREFIX
        }
    },

    methods:
    {
        toggleFolder()
        {
            this.$store.dispatch( EActions.UPDATE_FOLDER, { id: this.folder.id, isExpanded: ! this.folder.isExpanded })
        }
    }
})

</script>

<template>

    <div :class="`${CSS_PREFIX}__folder ${folder.isExpanded ? '' : CSS_PREFIX + '__folder--is-collapsed'}`">
            
        <div :class="CSS_PREFIX + '__holder'" :title="folder.name" :style="`padding-left: ${ level * 16 }px`" v-on:click="toggleFolder()">

            <!-- Opened folder -->
            <svg v-show="folder.isExpanded" aria-hidden="true" class="gitlab-tree-plugin__holder__icon">
                <use xlink:href="https://gitlab.com/assets/icons-5d6bba47cc3d399a160c22f8283b68e070717b97c9a35c0e3006d998b730b163.svg#folder-open"></use>
            </svg>

            <!-- Closed folder -->
            <svg v-show="! folder.isExpanded" aria-hidden="true" class="gitlab-tree-plugin__holder__icon">
                <use xlink:href="https://gitlab.com/assets/icons-5d6bba47cc3d399a160c22f8283b68e070717b97c9a35c0e3006d998b730b163.svg#folder"></use>
            </svg>

            <span> {{ folder.name }} </span>

        </div>

        <div :class="CSS_PREFIX + '__folder__content'">

            <folder v-for="subfolder in folder.subfolders" :folder="subfolder" :key="subfolder.name" :level="level + 1"></folder>
            <file v-for="file in folder.files" :file="file" :key="file.path" :level="level + 1"></file>
            
        </div>
        
    </div>

</template>