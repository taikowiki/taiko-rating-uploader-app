<script lang="ts">
    import type { CardData } from "hiroba-js";
    import { getTheme } from "../module/theme.svelte";

    interface Props {
        hirobaCard: CardData;
        wikiProfile: { nickname: string; UUID: string };
        cardLogout: () => Promise<any>;
        hirobaLogout: () => Promise<any>;
        wikiLogout: () => Promise<any>;
    }

    let {
        hirobaCard,
        wikiProfile,
        cardLogout,
        hirobaLogout,
        wikiLogout,
    }: Props = $props();

    let theme = $derived(getTheme());
</script>

{#snippet hirobaCardView()}
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
            <img class="mydon" src={hirobaCard.myDon} alt="my don" />
            <div class="profile">
                <div class="nickname">{hirobaCard.nickname}</div>
                <div class="taikonumber">북 번호: {hirobaCard.taikoNumber}</div>
            </div>
        </div>
    </div>
{/snippet}
{#snippet wikiProfileView()}
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
            <div class="nickname">{wikiProfile.nickname}</div>
            <div class="UUID">{wikiProfile.UUID}</div>
        </div>
    </div>
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
