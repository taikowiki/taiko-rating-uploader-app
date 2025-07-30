<script>
    import { appState } from "../module/AppState.svelte";
</script>

{#if appState.hirobaProfile && appState.hirobaProfile !== "namco"}
    <div class="hiroba">
        <img src={appState.hirobaProfile.myDon} alt="mydon" />
        <div class="nickname">{appState.hirobaProfile.nickname}</div>
        <div class="taikonumber">{appState.hirobaProfile.taikoNumber}</div>
    </div>
{/if}

<style>
    .hiroba {
        display: flex;
        flex-direction: column;
        align-items: center;
        row-gap: 3px;

        & img {
            width: 150px;
            max-width: 100%;
        }

        & .nickname {
            font-size: 18px;
            font-weight: bold;
        }

        & .taikonumber {
            font-size: 13px;
        }
    }
</style>
