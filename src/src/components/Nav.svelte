<script lang="ts">
    import { getTheme } from "../module/theme.svelte";
    import homeIcon from "../assets/icon/home.svg";
    import uploadIcon from "../assets/icon/upload.svg";
    import historyIcon from "../assets/icon/history.svg";
    import settingIcon from "../assets/icon/setting.svg";
    import { getContext } from "svelte";

    let theme = $derived(getTheme());
    let hash = $derived((getContext("hash") as any).hash) as string;

    const navData: { text: string; href: string; iconSrc: string }[] = [
        {
            text: "홈",
            href: "#",
            iconSrc: homeIcon,
        },
        {
            text: "업로드",
            href: "#upload",
            iconSrc: uploadIcon,
        },
        {
            text: "기록",
            href: "#history",
            iconSrc: historyIcon,
        },
        {
            text: "설정",
            href: "#setting",
            iconSrc: settingIcon,
        },
    ];
</script>

{#snippet navItem(text: string, href: string, iconSrc: string)}
    <a
        class="navitem"
        class:current={href === hash}
        {href}
        aria-label={text}
        data-theme={theme}
    >
        <img src={iconSrc} alt={text} />
        <span>{text}</span>
    </a>
{/snippet}

<nav data-theme={theme}>
    {#each navData as { text, href, iconSrc }}
        {@render navItem(text, href, iconSrc)}
    {/each}
</nav>

<style>
    nav {
        width: 100%;
        height: 50px;

        box-sizing: border-box;
        height: 60px;
        border-top: 1px solid gray;

        display: flex;
        flex-direction: row;
        justify-content: space-around;
    }

    .navitem {
        flex: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        row-gap: 5px;
        text-decoration: none;

        &.current {
            font-weight: bolder;
            background-color: rgba(0, 0, 0, 0.2);
        }

        &[data-theme="light"] {
            color: black;
        }
        &[data-theme="dark"] {
            color: white;
            & img {
                filter: invert(100%);
            }
        }

        &:hover {
            text-decoration: underline;
        }

        & img {
            height: 16px;
        }
    }
</style>
