<script lang="ts">
    import { Router, type RouteConfig } from "@mateothegreat/svelte5-router";
    import { SecureStorage } from "./module/SecureStorage";
    import type { CardData } from "hiroba-js";
    import { DonderHiroba } from "./module/DonderHiroba.svelte";
    import NamcoLogin from "./components/hiroba-login/NamcoLogin.svelte";
    import CardLogin from "./components/hiroba-login/CardLogin.svelte";
    import "./module/fetch";

    const routes: RouteConfig[] = [
        {
            path: "",
        },
    ];

    let hiroba = new DonderHiroba();

    async function loadHiroba() {
        const token = await SecureStorage.get("token");
        if (!token) return;

        hiroba.setToken(token);
        await hiroba.checkCardLogined();
    }
</script>

{#await loadHiroba() then}
    {#if hiroba.currentLogin}
        <img src={hiroba.currentLogin.myDon} alt="mydon" />
        <div>
            {hiroba.currentLogin.nickname}
        </div>
        <div>
            {hiroba.currentLogin.taikoNumber}
        </div>
    {:else if hiroba.namcoLogined}
        <CardLogin
            cardList={hiroba.cardList}
            cardLogin={async (taikoNumber) =>
                await hiroba.cardLogin(taikoNumber)}
        />
    {:else}
        <NamcoLogin
            setToken={async (token) => {
                hiroba.setToken(token);
                await SecureStorage.set("token", token);
            }}
            checkNamcoLogined={async () => await hiroba.checkNamcoLogined()}
        />
    {/if}
{/await}
