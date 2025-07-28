<script lang="ts">
    import CardLogin from "./CardLogin.svelte";
    import NamcoLogin from "./NamcoLogin.svelte";
    import { appState } from "../../module/AppState.svelte";
</script>

{#if !appState.hirobaProfile}
    <NamcoLogin />
{:else if appState.hirobaProfile === "namco"}
    <CardLogin />
{/if}
