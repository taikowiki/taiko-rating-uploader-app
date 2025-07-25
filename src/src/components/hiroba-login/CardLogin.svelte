<script lang="ts">
    import type { CardData } from "hiroba-js";


    interface Props{
        cardList: CardData[];
        cardLogin: (taikoNumber: string) => Promise<any>
    }

    let {cardList, cardLogin}: Props = $props();
</script>

{#each cardList as card}
    <div>
        <img src={card.myDon} alt="mydon">
        <div>
            {card.nickname}
        </div>
        <div>
            {card.taikoNumber}
        </div>
        <button onclick={() => cardLogin(card.taikoNumber)}>
            로그인
        </button>
    </div>
{/each}
