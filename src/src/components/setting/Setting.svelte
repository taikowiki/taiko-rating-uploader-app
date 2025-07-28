<script lang="ts">
    import { appState } from "../../module/AppState.svelte";
    import { getTheme, setTheme } from "../../module/theme.svelte";

    let theme = $state(getTheme());
    $effect(() => {
        setTheme(theme);
    });

    async function clearCurrentHirobaProfileCache(){
        if(!appState.hirobaProfile || appState.hirobaProfile === "namco"){
            return alert("현재 로그인된 히로바 프로필이 없습니다.");
        }

        if(!confirm(`${appState.hirobaProfile.nickname}(북 번호: ${appState.hirobaProfile.taikoNumber})의 캐시 데이터를 제거하시겠습니까?`)){
            return;
        }

        await appState.hirobaDataStorage.clearCache(appState.hirobaProfile.taikoNumber);
        alert('제거가 완료되었습니다.')
    }

    async function clearAllCache(){
        if(!confirm(`정말 모든 캐시 데이터를 제거하시겠습니까?`)){
            return;
        }

        await appState.hirobaDataStorage.clearAllCache();
        alert('제거가 완료되었습니다.')
    }
</script>

<header class="page-header">설정</header>
<div class="container">
    <div class="setting-container">
        <div class="setting-left">테마</div>
        <div class="setting-right">
            <select bind:value={theme}>
                <option value="light">라이트</option>
                <option value="dark">다크</option>
            </select>
        </div>
    </div>
    <div class="setting-container">
        <div class="setting-left">현재 히로바 프로필 캐시 제거</div>
        <div class="setting-right">
            <button onclick={clearCurrentHirobaProfileCache}>
                제거하기
            </button>
        </div>
    </div>
    <div class="setting-container">
        <div class="setting-left">모든 캐시 제거</div>
        <div class="setting-right">
            <button onclick={clearAllCache}>
                제거하기
            </button>
        </div>
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
    }

    .setting-container {
        width: 100%;
        min-height: 50px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        box-sizing: border-box;
        border-top: 1px solid gray;
    }
</style>
