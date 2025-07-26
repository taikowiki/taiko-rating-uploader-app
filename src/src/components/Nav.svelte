<script lang="ts">
    import { getTheme } from "../module/theme.svelte";

    let theme = $derived(getTheme());
</script>

<nav data-theme={theme}></nav>

<style>
    nav {
        width: 100%;
        height: 50px;

        box-sizing: border-box;
        height: 60px;
        border-top: 1px solid gray;

        display: flex;
        flex-direction: row;
        justify-content: space-around;
    }
</style>
