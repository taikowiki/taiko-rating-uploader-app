<script lang="ts">
    import { Router, type RouteConfig } from "@mateothegreat/svelte5-router";
    import { SecureStorage } from "./module/SecureStorage";
    import "./module/fetch";
    import HirobaLogin from "./components/hiroba-login/HirobaLogin.svelte";
    import { HirobaProfile } from "./module/HirobaProfile.svelte";
    import { WikiProfile } from "./module/WikiProfile.svelte";
    import WikiLogin from "./components/wiki-login/WikiLogin.svelte";
    import Main from "./components/Main.svelte";
    import { DonderHiroba } from "hiroba-js";
    import { Capacitor } from "@capacitor/core";
    import { getTheme, setTheme, useTheme } from "./module/theme.svelte";
    import Nav from "./components/Nav.svelte";

    let hirobaProfile = $state(new HirobaProfile());
    let wikiProfile = $state(new WikiProfile());
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

    useTheme();
    let theme = $derived(getTheme());

    let routes: RouteConfig[] = $derived([
        {
            path: "",
            component: Main,
            props: {
                hirobaCard: hirobaProfile.currentLogin,
                wikiProfile: wikiProfile.currentLogin,
                cardLogout: () => hirobaProfile.checkNamcoLogined(),
                hirobaLogout: async () => {
                    await SecureStorage.remove("hiroba-token");
                    hirobaProfile = new HirobaProfile();
                },
                wikiLogout: async () => {
                    await SecureStorage.remove("wiki-token");
                    wikiProfile = new WikiProfile();
                },
            },
        },
    ]);

    async function loadHiroba() {
        if (Capacitor.getPlatform() === "web") return;
        const hirobaToken = await SecureStorage.get("hiroba-token");
        if (hirobaToken) {
            hirobaProfile.setToken(hirobaToken);
            await hirobaProfile.checkCardLogined();
        }
        const wikiToken = await SecureStorage.get("wiki-token");
        if (wikiToken) {
            wikiProfile.setToken(wikiToken);
            await wikiProfile.checkLogined();
        }
    }
</script>

{#await loadHiroba() then}
    {#if !hirobaProfile.currentLogin}
        <main data-theme={theme}>
            <HirobaLogin
                namcoLogined={hirobaProfile.namcoLogined}
                cardList={hirobaProfile.cardList}
                cardLogin={async (taikoNumber) =>
                    await hirobaProfile.cardLogin(taikoNumber)}
                setToken={async (token) => {
                    hirobaProfile.setToken(token);
                    await SecureStorage.set("hiroba-token", token);
                }}
                checkNamcoLogined={async () =>
                    await hirobaProfile.checkNamcoLogined()}
            />
        </main>
    {:else if !wikiProfile.currentLogin}
        <main data-theme={theme}>
            <WikiLogin
                setToken={async (token) => {
                    wikiProfile.setToken(token);
                    await SecureStorage.set("wiki-token", token);
                }}
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
