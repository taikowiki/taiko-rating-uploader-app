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

    async function upload() {
        isUploading = true;
        try {
            await ratingUploader.upload(hirobaProfile, wikiProfile);
        } finally {
            isUploading = false;
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
    <button class="upload-btn" onclick={upload} disabled={isUploading}>
        업로드
    </button>
    {#each hirobaProfile.clearData as data}
        {data[1].title}
    {/each}
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

    .upload-btn {
        width: 100%;
        max-width: 200px;
    }
</style>
