<script lang="ts">
    import { appState } from "../../module/AppState.svelte";
    import HirobaCardView from "../HirobaCardView.svelte";
    import loading from "../../assets/icon/loading.svg";
    import PlayCountPreview from "./PlayCountPreview.svelte";
    import PlayCountDetail from "./PlayCountDetail.svelte";

    async function loadCache() {
        if (!appState.hirobaProfile || appState.hirobaProfile === "namco")
            return;
        if (!appState.hirobaCache) {
            await appState.loadHirobaCache(appState.hirobaProfile.taikoNumber);
        }
    }
</script>

<div class="container">
    <HirobaCardView />
    {#await loadCache()}
        <img src={loading} alt="loading" />
    {:then}
        {#if appState.hirobaCache}
            <PlayCountPreview playCount={appState.hirobaCache.playCount} />
            <PlayCountDetail
                difficultyScoreDatas={appState.hirobaCache.difficultyScoreDatas}
            />
        {:else}
            기록이 없습니다. 업로드를 한 번 진행해주세요.
        {/if}
    {/await}
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        row-gap: 10px;
    }
</style>
