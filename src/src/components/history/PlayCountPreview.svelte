<script lang="ts">
    import type { HirobaDataStorage } from "../../module/HirobaDataStorage";
    import played from "../../assets/icon/crown/played.svg";
    import clear from "../../assets/icon/crown/clear.svg";
    import fc from "../../assets/icon/crown/fc.svg";
    import dfc from "../../assets/icon/crown/dfc.svg";

    interface Props {
        playCount: HirobaDataStorage.PlayCount["data"];
    }

    let { playCount }: Props = $props();
</script>

<div class="container">
    <div class="fragment">
        <img class="crwon" src={played} alt="crown" />
        {playCount.play}
    </div>
    <div class="fragment">
        <img class="crwon" src={clear} alt="crown" />
        {playCount.clear}
    </div>
    <div class="fragment">
        <img class="crwon" src={fc} alt="crown" />
        {playCount.fc}
    </div>
    <div class="fragment">
        <img class="crwon" src={dfc} alt="crown" />
        {playCount.dfc}
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        column-gap: 10px;
    }

    .fragment {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        column-gap: 5px;
    }

    img {
        width: 30px;
        height: auto;
    }
</style>
