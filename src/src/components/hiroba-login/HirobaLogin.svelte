<script lang="ts">
    import type { CardData } from "hiroba-js";
    import CardLogin from "./CardLogin.svelte";
    import NamcoLogin from "./NamcoLogin.svelte";

    interface Props {
        namcoLogined: boolean;
        checkNamcoLogined: () => Promise<any>;
        cardList: CardData[];
        cardLogin: (taikoNumber: string) => Promise<any>;
    }

    let {
        namcoLogined,
        checkNamcoLogined,
        cardList,
        cardLogin,
    }: Props = $props();
</script>

{#if namcoLogined}
    <CardLogin {cardList} {cardLogin} />
{:else}
    <NamcoLogin {checkNamcoLogined} />
{/if}
