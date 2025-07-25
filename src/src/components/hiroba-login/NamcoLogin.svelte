<script lang="ts">
    import { DonderHiroba } from "../../module/DonderHiroba.svelte";

    interface Props {
        setToken: (token: string) => Promise<any>;
        checkNamcoLogined: () => Promise<any>;
    }

    let { setToken, checkNamcoLogined }: Props = $props();

    let email = $state("");
    let password = $state("");
    let logining = $state(false);

    async function login() {
        logining = true;
        try {
            const token = await DonderHiroba.func.getSessionToken({
                email,
                password,
            });
            await setToken(token);
            await checkNamcoLogined();
        } finally {
            logining = false;
        }
    }
</script>

<div>남코 로그인</div>
<div>
    <input type="email" bind:value={email} />
</div>
<div>
    <input type="password" bind:value={password} />
</div>
<div>
    <button onclick={login}>로그인</button>
</div>
{#if logining}
    로그인중...
{/if}
