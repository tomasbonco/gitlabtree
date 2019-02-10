<script lang="ts">

import Vue from 'vue'
import { EFileState } from '../store/interface';

export default Vue.extend({
    name: 'File',
    props: {
        file: { type: Object },
        level: { type: Number },
        showFull: { type: Boolean, default: false }
    },

    updated()
    {
        this.createEllipsis()
    },

    mounted()
    {
        this.createEllipsis()
    },

    methods:
    {
        createEllipsis()
        {
            const target = this.$el.querySelector( '.gitlab-tree-plugin__file__name' );
            const text: string = target.innerText;
            const halfLength = Math.floor( text.length / 2 );
            const parts = [ text.substr( 0, halfLength ), text.substr( halfLength ) ];

            let eat = 3;

            const makeTextShorter = ()=>
            {
                if ( target.scrollWidth > target.clientWidth )
                {
                    const newParts = [
                        parts[0].substr( 0, parts[0].length - eat ),
                        parts[1].substr( eat )
                    ];

                    target.innerText = newParts.join('…');
                    eat++;

                    return requestAnimationFrame( makeTextShorter );
                }

                return false;
            }

            requestAnimationFrame( makeTextShorter );
        }
    },

    data: () => ({ EFileState })
})

</script>

<template>

	<div class="gitlab-tree-plugin__file gitlab-tree-plugin__holder" :style="`padding-left: ${ level * 16 }px`">
       
       <!-- Addition -->
        <svg v-show="file.changeType === EFileState.ADDED" aria-hidden="true" class="gitlab-tree-plugin__holder__icon" style="fill: #1aaa55;">
            <use xlink:href="https://gitlab.com/assets/icons-5d6bba47cc3d399a160c22f8283b68e070717b97c9a35c0e3006d998b730b163.svg#file-addition"></use>
        </svg>

        <!-- Modified -->
        <svg v-show="file.changeType === EFileState.UPDATED || file.changeType === EFileState.RENAMED" aria-hidden="true" class="gitlab-tree-plugin__holder__icon" style="fill: #fc9403;">
            <use xlink:href="https://gitlab.com/assets/icons-5d6bba47cc3d399a160c22f8283b68e070717b97c9a35c0e3006d998b730b163.svg#file-modified"></use>
        </svg>

        <!-- Deletion -->
        <svg v-show="file.changeType === EFileState.DELETED" aria-hidden="true" class="gitlab-tree-plugin__holder__icon" style="fill: #db3b21;">
            <use xlink:href="https://gitlab.com/assets/icons-5d6bba47cc3d399a160c22f8283b68e070717b97c9a35c0e3006d998b730b163.svg#file-deletion"></use>
        </svg>

        <span class="gitlab-tree-plugin__file__name" :title="file.base + '.' + file.ext" v-if="! showFull"> {{ file.base }}.{{ file.ext }} </span>
        <span class="gitlab-tree-plugin__file__name" :title="file.path" v-if="showFull"> {{ file.path }} </span>

        <span class="gitlab-tree-plugin__stats">
            <span class="gitlab-tree-plugin__stats__additions"> {{file.additions}} </span>
            <span class="gitlab-tree-plugin__stats__deletions"> {{file.deletions}} </span>
        </span>

    </div>

</template>