<script lang="ts">
    import { InAppBrowser } from "@capgo/inappbrowser";
    import { appState } from "../../module/AppState.svelte";
    import { SecureStorage } from "../../module/SecureStorage";

    async function openHirobaLoginBrowser() {
        await InAppBrowser.addListener("urlChangeEvent", async (event) => {
            if (event.url === "https://donderhiroba.jp/login_select.php") {
                const cookies = await InAppBrowser.getCookies({
                    url: "https://donderhiroba.jp",
                    includeHttpOnly: true,
                });

                const token = cookies["_token_v2"];
                await InAppBrowser.close();
                await InAppBrowser.clearAllCookies();
                await InAppBrowser.clearCache();

                if (token) {
                    await SecureStorage.set("hiroba-token", token);
                    appState.hirobaToken = token;
                    await appState.updateCardList();
                } else {
                    alert("오류가 발생했습니다.");
                }
            }
        });

        await InAppBrowser.openWebView({
            url: "https://account.bandainamcoid.com/login.html?client_id=nbgi_taiko&customize_id=&redirect_uri=https%3A%2F%2Fwww.bandainamcoid.com%2Fv2%2Foauth2%2Fauth%3Fback%3Dv3%26client_id%3Dnbgi_taiko%26scope%3DJpGroupAll%26redirect_uri%3Dhttps%253A%252F%252Fdonderhiroba.jp%252Flogin_process.php%253Finvite_code%253D%2526abs_back_url%253D%2526location_code%253D%26text%3D&prompt=login",
            title: "Donderhiroba Login",
        });
    }
</script>

<div class="container">
    <span>동더히로바에 로그인 되어있지 않습니다.</span>
    <span>아래 버튼을 눌러 로그인 해 주십시오.</span>
    <button onclick={openHirobaLoginBrowser}>동더히로바에 로그인</button>
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
