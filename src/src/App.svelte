<script lang="ts">
    import { Router, type RouteConfig } from "@mateothegreat/svelte5-router";
    import { SecureStorage } from "./module/SecureStorage";
    import "./module/fetch";
    import HirobaLogin from "./components/hiroba-login/HirobaLogin.svelte";
    import { HirobaProfile } from "./module/HirobaProfile.svelte";
    import { WikiProfile } from "./module/WikiProfile.svelte";
    import WikiLogin from "./components/wiki-login/WikiLogin.svelte";
    import Main from "./components/Main.svelte";
    import { Capacitor } from "@capacitor/core";
    import { getTheme, useTheme } from "./module/theme.svelte";
    import Nav from "./components/Nav.svelte";
    import Uploader from "./components/uploader/Uploader.svelte";
    import { RatingUploader } from "./module/RatingUploader.svelte";
    import { setContext, tick } from "svelte";
    import loading from "./assets/icon/loading.svg";

    let hirobaProfile = new HirobaProfile();
    let wikiProfile = new WikiProfile();
    let ratingUploader = new RatingUploader();
    let hash = $state({ hash: location.hash || "#" });

    setContext("hirobaProfile", hirobaProfile);
    setContext("wikiProfile", wikiProfile);
    setContext("ratingUploader", ratingUploader);
    setContext("hash", hash);

    if (Capacitor.getPlatform() === "web") {
        hirobaProfile.currentLogin = {
            taikoNumber: "000000000001",
            nickname: "えとうどん",
            myDon: "https://img.taiko-p.jp/imgsrc.php?v=&kind=mydon&fn=mydon_000000000001",
        };
        wikiProfile.currentLogin = {
            nickname: "nick",
            UUID: "foo-bar-uuid",
        };
    }

    window.addEventListener("hashchange", () => {
        hash.hash = location.hash || "#";
    });

    useTheme();
    let theme = $derived(getTheme());

    let routes: RouteConfig[] = [
        {
            path: "",
            component: Main,
        },
        {
            path: "upload",
            component: Uploader,
        },
    ];

    async function loadHiroba() {
        if (Capacitor.getPlatform() === "web") return;
        await tick();
        await hirobaProfile.checkCardLogined();
        await wikiProfile.checkLogined();
    }
</script>

{#await loadHiroba()}
    <img src={loading} alt="loading" />
{:then}
    {#if !hirobaProfile.currentLogin}
        <main data-theme={theme}>
            <HirobaLogin
                namcoLogined={hirobaProfile.namcoLogined}
                cardList={hirobaProfile.cardList}
                cardLogin={async (taikoNumber) =>
                    await hirobaProfile.cardLogin(taikoNumber)}
                checkNamcoLogined={async () =>
                    await hirobaProfile.checkNamcoLogined()}
            />
        </main>
    {:else if !wikiProfile.currentLogin}
        <main data-theme={theme}>
            <WikiLogin
                checkLogined={async () => await wikiProfile.checkLogined()}
            />
        </main>
    {:else}
        <main data-theme={theme}>
            <Router {routes} />
        </main>
        <Nav />
    {/if}
{/await}

<style>
    main {
        width: 100%;
        max-width: 500px;
        height: calc(100% - 60px);
        overflow-y: auto;

        box-sizing: border-box;
        padding-top: 20px;
        padding-bottom: 20px;
        padding-inline: 10px;
    }
</style>
