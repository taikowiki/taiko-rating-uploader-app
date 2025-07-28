<script lang="ts">
    import type { CardData } from "hiroba-js";
    import { appState } from "../../module/AppState.svelte";
</script>

<div class="container">
    <div>카드를 선택 해 주십시오.</div>
    {#each appState.cardList as card}
        <div class="card">
            <div class="profile">
                <img class="mydon" src={card.myDon} alt="mydon" />
                <div class="detail">
                    <div class="nickname">
                        {card.nickname}
                    </div>
                    <div class="taikonumber">
                        {card.taikoNumber}
                    </div>
                </div>
            </div>
            <button onclick={() => appState.cardLogin(card.taikoNumber)}>
                로그인
            </button>
        </div>
    {/each}
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;

        box-sizing: padding;

        row-gap: 20px;
    }

    .card {
        width: 100%;
        max-width: 300px;
        display: flex;
        flex-direction: column;
        align-items: center;

        box-sizing: border-box;
        padding: 20px;

        border: 1px solid gray;
        border-radius: 10px;

        row-gap: 10px;
    }

    .profile {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        column-gap: 10px;
    }

    .mydon {
        width: 80px;
        height: 80px;
    }

    .detail {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        row-gap: 5px;
    }

    .nickname {
        font-weight: bold;
        font-size: 18px;
    }

    .taikonumber {
        font-size: 13px;
    }
</style>
