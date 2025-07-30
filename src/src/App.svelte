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
    import History from "./components/history/History.svelte";
    import Setting from "./components/setting/Setting.svelte";
    import { App } from "@capacitor/app";

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
            path: "history",
            component: History,
        },
        {
            path: "setting",
            component: Setting,
        },
    ];

    async function loadHiroba() {
        if (Capacitor.getPlatform() === "web") return;
        await tick();
        const indemnityClauseAgrred = await SecureStorage.get(
            "indemnity-clause-agreed",
        );
        if (indemnityClauseAgrred !== "true") {
            if (
                confirm(
                    "면책 조항\n이 앱은 (주)반다이 남코 엔터테인먼트와 관련이 없는 비공식 앱입니다.\n이 앱의 일부 기능은 donderhiroba.jp의 이용 약관을 위반할 수 있습니다.\n이로 인해 발생할 수 있는 모든 문제에 대한 모든 책임은 사용자 본인에게 있음에 동의합니다.",
                )
            ) {
                await SecureStorage.set("indemnity-clause-agreed", "true");
            } else {
                await App.exitApp();
                return;
            }
        }

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
