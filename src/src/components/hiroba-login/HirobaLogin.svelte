<script lang="ts">
    import type { CardData } from "hiroba-js";
    import CardLogin from "./CardLogin.svelte";
    import NamcoLogin from "./NamcoLogin.svelte";

    interface Props {
        namcoLogined: boolean;
        setToken: (token: string) => Promise<any>;
        checkNamcoLogined: () => Promise<any>;
        cardList: CardData[];
        cardLogin: (taikoNumber: string) => Promise<any>;
    }

    let {
        namcoLogined,
        setToken,
        checkNamcoLogined,
        cardList,
        cardLogin,
    }: Props = $props();
</script>

{#if namcoLogined}
    <CardLogin {cardList} {cardLogin} />
{:else}
    <NamcoLogin {setToken} {checkNamcoLogined} />
{/if}
