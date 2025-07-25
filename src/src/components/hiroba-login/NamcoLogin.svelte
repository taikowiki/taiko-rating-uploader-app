<script lang="ts">
    import { InAppBrowser } from "@capgo/inappbrowser";

    interface Props {
        setToken: (token: string) => Promise<any>;
        checkNamcoLogined: () => Promise<any>;
    }

    let { setToken, checkNamcoLogined }: Props = $props();

    async function openHirobaLoginBrowser() {
        await InAppBrowser.addListener("urlChangeEvent", async (event) => {
            if (new URL(event.url).origin === "https://donderhiroba.jp") {
                const cookies = await InAppBrowser.getCookies({
                    url: "https://donderhiroba.jp",
                    includeHttpOnly: true,
                });

                const token = cookies["_token_v2"];
                if (token) {
                    await setToken(token);
                    await checkNamcoLogined();
                    await InAppBrowser.close();
                } else {
                    await InAppBrowser.close();
                }
            }
        });

        await InAppBrowser.openWebView({
            url: "https://account.bandainamcoid.com/login.html?client_id=nbgi_taiko&customize_id=&redirect_uri=https%3A%2F%2Fwww.bandainamcoid.com%2Fv2%2Foauth2%2Fauth%3Fback%3Dv3%26client_id%3Dnbgi_taiko%26scope%3DJpGroupAll%26redirect_uri%3Dhttps%253A%252F%252Fdonderhiroba.jp%252Flogin_process.php%253Finvite_code%253D%2526abs_back_url%253D%2526location_code%253D%26text%3D&prompt=login",
        });
    }
</script>

<button onclick={openHirobaLoginBrowser}>동더히로바에 로그인</button>
