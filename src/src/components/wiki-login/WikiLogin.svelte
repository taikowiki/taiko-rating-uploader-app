<script lang="ts">
    import { InAppBrowser } from "@capgo/inappbrowser";
    import { SecureStorage } from "../../module/SecureStorage";
    import { appState } from "../../module/AppState.svelte";

    async function openWikiLoginBrowser() {
        await InAppBrowser.addListener("urlChangeEvent", async (event) => {
            if (event.url === "https://taiko.wiki/auth/user") {
                const cookies = await InAppBrowser.getCookies({
                    url: "https://taiko.wiki",
                    includeHttpOnly: true,
                });

                const token = cookies["auth-user"];
                await InAppBrowser.close();
                await InAppBrowser.clearAllCookies();
                await InAppBrowser.clearCache();

                if (token) {
                    await SecureStorage.set("wiki-token", token);
                    appState.wikiToken = token;
                    await appState.updateWikiProfile();
                } else {
                    alert("오류가 발생했습니다.");
                }
            }
        });

        await InAppBrowser.openWebView({
            url: "https://taiko.wiki/auth/login?redirect_to=/auth/user",
            title: "taiko.wiki Login",
        });
    }
</script>

<div class="container">
    <span>taiko.wiki에 로그인 되어있지 않습니다.</span>
    <span>아래 버튼을 눌러 로그인 해 주십시오.</span>
    <button onclick={openWikiLoginBrowser}>taiko.wiki 로그인</button>
</div>

<style>
    .container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        row-gap: 10px;
    }

    button {
        font-size: 16px;
    }
</style>
