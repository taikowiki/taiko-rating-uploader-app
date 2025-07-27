<script lang="ts">
    import type { CardData } from "hiroba-js";
    import { getContext } from "svelte";
    import type { HirobaProfile } from "../../module/HirobaProfile.svelte";
    import type { RatingUploader } from "../../module/RatingUploader.svelte";
    import type { WikiProfile } from "../../module/WikiProfile.svelte";

    let hirobaProfile = getContext("hirobaProfile") as HirobaProfile;
    let wikiProfile = getContext("wikiProfile") as WikiProfile;
    let ratingUploader = getContext("ratingUploader") as RatingUploader;

    let hirobaCard = $derived(hirobaProfile.currentLogin) as CardData;
    let isUploading = $state(false);
    let uploadType = $state<"clear" | "all">("all");

    let lastUploadTrigger = $state(false);

    async function upload() {
        isUploading = true;
        try {
            if (uploadType === "clear") {
            } else {
                await ratingUploader.uploadAll(hirobaProfile, wikiProfile);
            }
        } finally {
            isUploading = false;
            lastUploadTrigger = !lastUploadTrigger;
        }
    }
</script>

{#snippet hirobaCardView()}
    <div class="hiroba">
        <img src={hirobaCard.myDon} alt="mydon" />
        <div class="nickname">{hirobaCard.nickname}</div>
        <div class="taikonumber">{hirobaCard.taikoNumber}</div>
    </div>
{/snippet}

<div class="container">
    {@render hirobaCardView()}
    <div class="message">{ratingUploader.message}</div>
    <div class="radio-container">
        <label>
            <input type="radio" bind:group={uploadType} value="all" /> 점수 데이터
            업로드 (레이팅)
        </label>
        <label>
            <input type="radio" bind:group={uploadType} value="clear" /> 클리어 데이터
            업로드
        </label>
    </div>
    <button class="upload-btn" onclick={upload} disabled={isUploading}>
        업로드
    </button>
    {#key lastUploadTrigger}
        {#await ratingUploader.hirobaDataStorage.getLastUpload(hirobaCard.taikoNumber) then u}
            {#if u}
                <div>
                    마지막 업데이트: {new Date(u.time).toLocaleString()}
                </div>
            {/if}
        {/await}
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
