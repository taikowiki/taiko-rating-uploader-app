<script lang="ts">
    import { Router, type RouteConfig } from "@mateothegreat/svelte5-router";
    import { SecureStorage } from "./module/SecureStorage";
    import "./module/fetch";
    import HirobaLogin from "./components/hiroba-login/HirobaLogin.svelte";
    import { HirobaProfile } from "./module/HirobaProfile.svelte";
    import { WikiProfile } from "./module/WikiProfile.svelte";
    import WikiLogin from "./components/wiki-login/WikiLogin.svelte";
    import Main from "./components/Main.svelte";
    import { Capacitor, CapacitorCookies } from "@capacitor/core";
    import { getTheme, useTheme } from "./module/theme.svelte";
    import Nav from "./components/Nav.svelte";
    import Uploader from "./components/uploader/Uploader.svelte";
    import { RatingUploader } from "./module/RatingUploader.svelte";
    import { setContext } from "svelte";

    let hirobaProfile = new HirobaProfile();
    let wikiProfile = new WikiProfile();
    let ratingUploader = new RatingUploader();
    let hash = $state({hash: location.hash || '#'});

    setContext("hirobaProfile", hirobaProfile);
    setContext("wikiProfile", wikiProfile);
    setContext("ratingUploader", ratingUploader);
    setContext('hash', hash);

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

    window.addEventListener('hashchange', () => {
        hash.hash = location.hash || '#';
    })

    useTheme();
    let theme = $derived(getTheme());

    let routes: RouteConfig[] = $derived.by(() => {
        return [
            {
                path: "",
                component: Main,
            },
            {
                path: "upload",
                component: Uploader,
                props: {
                    hirobaCard: hirobaProfile.currentLogin,
                    message: ratingUploader.message,
                    upload: async () => {
                        await ratingUploader.upload(hirobaProfile, wikiProfile);
                    },
                },
            },
        ];
    });

    async function loadHiroba() {
        if (Capacitor.getPlatform() === "web") return;
        const hirobaToken = await SecureStorage.get("hiroba-token");
        if (hirobaToken) {
            await CapacitorCookies.setCookie({
                url: "https://donderhiroba.jp",
                key: '_token_v2',
                value: hirobaToken,
                path: '/'
            })
            await hirobaProfile.checkCardLogined();
        }
        const wikiToken = await SecureStorage.get("wiki-token");
        if (wikiToken) {
            await CapacitorCookies.setCookie({
                url: "https://taiko.wiki",
                key: 'auth-user',
                value: wikiToken,
                path: '/'
            })
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
