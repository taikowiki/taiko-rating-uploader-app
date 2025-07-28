<script lang="ts">
    import { appState } from "../../module/AppState.svelte";

    let uploadMode = $state<"clear" | "all">("all");
    let lastUploadTrigger = $state(false);

    async function upload() {
        await appState.upload(uploadMode);
        lastUploadTrigger = !lastUploadTrigger;
    }
</script>

{#snippet hirobaCardView()}
    {#if appState.hirobaProfile && appState.hirobaProfile !== "namco"}
        <div class="hiroba">
            <img src={appState.hirobaProfile.myDon} alt="mydon" />
            <div class="nickname">{appState.hirobaProfile.nickname}</div>
            <div class="taikonumber">{appState.hirobaProfile.taikoNumber}</div>
        </div>
    {/if}
{/snippet}

<div class="container">
    {@render hirobaCardView()}
    <div class="message">{appState.uploadMessage}</div>
    <div class="radio-container">
        <label>
            <input type="radio" bind:group={uploadMode} value="all" /> 점수 데이터
            업로드 (레이팅)
        </label>
        <label>
            <input type="radio" bind:group={uploadMode} value="clear" /> 클리어 데이터
            업로드
        </label>
    </div>
    <button class="upload-btn" onclick={upload} disabled={appState.uploading}>
        업로드
    </button>
    {#key lastUploadTrigger}
        {#if appState.hirobaProfile && appState.hirobaProfile !== "namco"}
            {#await appState.hirobaDataStorage.getLastUpload(appState.hirobaProfile.taikoNumber) then u}
                {#if u}
                    <div>
                        마지막 업데이트: {new Date(u.time).toLocaleString()}
                    </div>
                {/if}
            {/await}
        {/if}
    {/key}
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        row-gap: 10px;
    }

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

    .radio-container {
        display: flex;
        flex-direction: column;
    }

    .upload-btn {
        width: 100%;
        max-width: 200px;
    }
</style>
