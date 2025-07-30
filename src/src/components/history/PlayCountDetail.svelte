<script lang="ts">
    import type { DifficultyScoreData } from "hiroba-js";
    import played from "../../assets/icon/crown/played.svg";
    import clear from "../../assets/icon/crown/clear.svg";
    import fc from "../../assets/icon/crown/fc.svg";
    import dfc from "../../assets/icon/crown/dfc.svg";

    interface Props {
        difficultyScoreDatas: {
            songNo: string;
            diff: "oni" | "ura";
            title: string;
            data: DifficultyScoreData;
        }[];
    }

    let { difficultyScoreDatas }: Props = $props();

    let opened = $state(false);
    function toggle() {
        opened = !opened;
    }
</script>

<button onclick={toggle}>전체 플레이 카운트 보기</button>
{#if opened}
    <table>
        <thead>
            <tr>
                <th> 곡 </th>
                <th> 난이도 </th>
                <th>
                    <img src={played} alt="played" />
                </th>
                <th>
                    <img src={clear} alt="clear" />
                </th>
                <th>
                    <img src={fc} alt="fc" />
                </th>
                <th>
                    <img src={dfc} alt="dfc" />
                </th>
            </tr>
        </thead>
        <tbody>
            {#each difficultyScoreDatas as data}
                <tr>
                    <td>
                        <a
                            href={`https://donderhiroba.jp/score_detail.php?song_no=${data.songNo}&level=${data.diff === "oni" ? 4 : 5}`}
                            target="_blank"
                        >
                            {data.title}({data.songNo})
                        </a>
                    </td>
                    <td>
                        {data.diff}
                    </td>
                    <td>
                        {data.data.count.play}
                    </td>
                    <td>
                        {data.data.count.clear}
                    </td>
                    <td>
                        {data.data.count.fullcombo}
                    </td>
                    <td>
                        {data.data.count.donderfullcombo}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}

<style>
    table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid gray;
    }

    tr {
        padding-block: 10px;
    }

    th,
    td {
        text-align: center;
        word-wrap: break-word;
        border: 1px solid gray;
        font-size: 14px;
    }

    th:nth-child(2) {
        width: 40px;
    }
    th:nth-child(n + 3):nth-child(-n + 6) {
        min-width: 30px;
    }

    th img {
        width: 20px;
        height: auto;
    }

    td:nth-child(1) a {
        text-decoration: none;
        color: #9e9eff;
    }
</style>
