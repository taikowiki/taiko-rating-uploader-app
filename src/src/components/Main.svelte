<script lang="ts">
    import { getTheme } from "../module/theme.svelte";
    import { SecureStorage } from "../module/SecureStorage";
    import { appState } from "../module/AppState.svelte";

    let theme = $derived(getTheme());

    const cardLogout = () => appState.updateCardList();
    const hirobaLogout = async () => {
        await SecureStorage.remove("hiroba-token");
        appState.hirobaLogout();
    };
    const wikiLogout = async () => {
        await SecureStorage.remove("wiki-token");
        appState.wikiLogout();
    };
</script>

{#snippet hirobaCardView()}
    {#if appState.hirobaProfile && appState.hirobaProfile !== "namco"}
        <div class="hiroba-container">
            <div class="menu">
                <div class="menu-left">
                    <span class="hiroba-header" data-theme={theme}>
                        동더히로바 프로필
                    </span>
                </div>
                <div class="menu-right">
                    <button onclick={cardLogout}>카드 선택</button>
                    <button onclick={hirobaLogout}>로그아웃</button>
                </div>
            </div>
            <div class="content">
                <img
                    class="mydon"
                    src={appState.hirobaProfile.myDon}
                    alt="my don"
                />
                <div class="profile">
                    <div class="nickname">
                        {appState.hirobaProfile.nickname}
                    </div>
                    <div class="taikonumber">
                        북 번호: {appState.hirobaProfile.taikoNumber}
                    </div>
                </div>
            </div>
        </div>
    {/if}
{/snippet}
{#snippet wikiProfileView()}
    {#if appState.wikiProfile}
        <div class="wiki-container">
            <div class="menu">
                <div class="menu-left">
                    <span class="wiki-header" data-theme={theme}>
                        taiko.wiki 프로필
                    </span>
                </div>
                <div class="menu-right">
                    <button onclick={wikiLogout}>로그아웃</button>
                </div>
            </div>
            <div class="content">
                <div class="nickname">{appState.wikiProfile.nickname}</div>
                <div class="UUID">{appState.wikiProfile.UUID}</div>
            </div>
        </div>
    {/if}
{/snippet}

<div class="container">
    {@render hirobaCardView()}
    {@render wikiProfileView()}
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        row-gap: 30px;

        box-sizing: border-box;
    }

    .hiroba-container,
    .wiki-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        row-gap: 10px;

        box-sizing: border-box;
        border: 1px solid gray;
        border-radius: 10px;

        padding: 20px;
    }

    .menu {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        & .menu-left,
        & .menu-right {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            column-gap: 5px;
        }
    }

    .hiroba-container {
        border-color: #fecaca;

        & .content {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            column-gap: 10px;
        }

        & .hiroba-header {
            font-size: 23px;
            &[data-theme="light"] {
                color: #b91c1c;
            }
            &[data-theme="dark"] {
                color: #ef4444;
            }
        }

        & .profile {
            display: flex;
            flex-direction: column;
            row-gap: 3px;
        }

        & .nickname {
            font-weight: bold;
            font-size: 18px;
        }

        & .taikonumber {
            font-size: 13px;
        }
    }

    .wiki-container {
        border-color: #bfdbfe;

        & .content {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: flex-end;
            column-gap: 5px;
        }

        & .wiki-header {
            font-size: 23px;
            &[data-theme="light"] {
                color: #1d4ed8;
            }
            &[data-theme="dark"] {
                color: #60a5fa;
            }
        }

        & .nickname {
            font-weight: bold;
            font-size: 18px;
        }

        & .UUID {
            font-size: 13px;
        }
    }

    .mydon {
        width: 80px;
        height: 80px;
    }
</style>
