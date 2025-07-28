<script lang="ts">
    import { Router, type RouteConfig } from "@mateothegreat/svelte5-router";
    import { SecureStorage } from "./module/SecureStorage";
    import "./module/fetch";
    import HirobaLogin from "./components/hiroba-login/HirobaLogin.svelte";
    import WikiLogin from "./components/wiki-login/WikiLogin.svelte";
    import Main from "./components/Main.svelte";
    import { Capacitor } from "@capacitor/core";
    import { getTheme, useTheme } from "./module/theme.svelte";
    import Nav from "./components/Nav.svelte";
    import Upload from "./components/upload/Upload.svelte";
    import { setContext, tick } from "svelte";
    import loading from "./assets/icon/loading.svg";
    import { appState } from "./module/AppState.svelte";
    import Record from "./components/record/Record.svelte";
    import Setting from "./components/setting/Setting.svelte";

    let hash = $state({ hash: location.hash || "#" });
    setContext("hash", hash);

    if (Capacitor.getPlatform() === "web") {
        appState.hirobaProfile = {
            taikoNumber: "000000000001",
            nickname: "えとうどん",
            myDon: "https://img.taiko-p.jp/imgsrc.php?v=&kind=mydon&fn=mydon_000000000001",
        };
        appState.wikiProfile = {
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
            component: Upload,
        },
        {
            path: "record",
            component: Record
        },
        {
            path: "setting",
            component: Setting
        }
    ];

    async function loadHiroba() {
        if (Capacitor.getPlatform() === "web") return;
        await tick();

        const hirobaToken = await SecureStorage.get("hiroba-token");
        if (hirobaToken) {
            //alert(hirobaToken);
            appState.hirobaToken = hirobaToken; 
            await appState.updateHirobaProfile();
        }

        const wikiToken = await SecureStorage.get("wiki-token");
        if (wikiToken) {
            appState.wikiToken = wikiToken;
            await appState.updateWikiProfile();
        }
    }
</script>

{#await loadHiroba()}
    <img src={loading} alt="loading" />
{:then}
    {#if !appState.hirobaProfile || appState.hirobaProfile === "namco"}
        <main data-theme={theme}>
            <HirobaLogin />
        </main>
    {:else if !appState.wikiProfile}
        <main data-theme={theme}>
            <WikiLogin />
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
