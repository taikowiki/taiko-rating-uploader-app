import { DonderHiroba, type DifficultyScoreData, util, type Crown, type Badge, type ScoreData, type Difficulty } from "hiroba-js";
import { HirobaDataStorage } from "./HirobaDataStorage";
import type { HirobaProfile } from "./HirobaProfile.svelte";
import type { WikiProfile } from "./WikiProfile.svelte";
import { parse, type HTMLElement } from "node-html-parser";

export class RatingUploader {
    message: string = $state('');
    hirobaDataStorage = new HirobaDataStorage();

    async uploadAll(hirobaProfile: HirobaProfile, wikiProfile: WikiProfile) {
        try {
            this.message = '동더히로바 로그인 여부 확인 중...';
            await hirobaProfile.checkCardLogined();
            if (!hirobaProfile.currentLogin || !hirobaProfile.namcoLogined || !hirobaProfile.cardLogined) {
                this.message = '동더히로바에 로그인 되어있지 않습니다.';
                return;
            }

            this.message = 'taiko.wiki 로그인 여부 확인 중...';
            await wikiProfile.checkLogined();
            if (!wikiProfile.currentLogin) {
                this.message = 'taiko.wiki에 로그인 되어있지 않습니다.';
                return;
            }

            this.message = '클리어 데이터를 수집하는 중...';
            await hirobaProfile.updateRecord();
            await hirobaProfile.updateClearData();

            this.message = '캐시를 가져오는 중...';
            const oldDatas = await this.hirobaDataStorage.getScoreDatas(hirobaProfile.currentLogin.taikoNumber);
            const lastUpload = await this.hirobaDataStorage.getLastUpload(hirobaProfile.currentLogin.taikoNumber);

            const scoreDataRecord: HirobaDataStorage.ScoreDataRecord = {};
            let crawled = 0;
            let lastUploadData: { songNo: string; difficulty: Difficulty; data: DifficultyScoreData; } | null = null;
            let firstData: { songNo: string; difficulty: Difficulty; data: DifficultyScoreData; } | null = null;

            for (let i = 1; ; i++) {
                const datas = await this.getRecentScoreDatas(i);
                if (datas.length === 0) {
                    break;
                }

                let breakCondition = false;
                for (const { title, difficulty, difficultyScoreData } of datas) {
                    const songNo = Array.from(hirobaProfile.clearData).find(([_, clearData]) => clearData.title === title)?.[0];
                    if (!songNo) continue;

                    lastUploadData = {
                        songNo,
                        difficulty,
                        data: difficultyScoreData
                    };

                    if (lastUpload && this.hirobaDataStorage.isEqualCourseScoreData(lastUpload, lastUploadData)) {
                        breakCondition = true;
                        break;
                    }

                    if (firstData) {
                        if (firstData.songNo === songNo && firstData.difficulty === difficulty) {
                            breakCondition = true;
                            break;
                        }
                    }
                    else {
                        firstData = lastUploadData;
                    }

                    if (songNo in scoreDataRecord) {
                        scoreDataRecord[songNo].difficulty[difficulty] = difficultyScoreData;
                    }
                    else {
                        scoreDataRecord[songNo] = {
                            title,
                            songNo,
                            difficulty: {
                                [difficulty]: difficultyScoreData
                            }
                        }
                    }
                    crawled++;
                    this.message = `점수 데이터를 가져오는 중... (${crawled})`;
                }

                if (breakCondition) break;
            }

            let merged: HirobaDataStorage.ScoreDataRecord;
            if (oldDatas) {
                merged = this.hirobaDataStorage.mergeScoreDatas(oldDatas.scoreDataRecord, scoreDataRecord);
            }
            else {
                merged = scoreDataRecord;
            }

            this.message = 'taiko.wiki에 전송하는 중...'
            await fetch('https://taiko.wiki/api/user/donder', {
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    donderData: hirobaProfile.currentLogin,
                    clearData: Array.from(hirobaProfile.clearData.values()),
                    scoreData: merged
                }),
                method: 'post'
            });

            await this.hirobaDataStorage.updateScoreDatas(hirobaProfile.currentLogin.taikoNumber, merged);
            if (lastUploadData) {
                await this.hirobaDataStorage.setLastUpload(hirobaProfile.currentLogin.taikoNumber, lastUploadData?.songNo, lastUploadData?.difficulty, lastUploadData?.data)
            }

            this.message = '업로드 완료!';
        }
        catch (err) {
            this.message = '업로드 오류!';
        }
    }

    async getRecentScoreDatas(page: number) {
        try {
            const response = await fetch(`https://donderhiroba.jp/history_recent_score.php?page=${page}`);
            const html = await response.text();
            const dom = parse(html);
            return Array.from(dom.querySelectorAll('.scoreUser')).map((d) => this.parseScoreData(d)).filter(e => e !== null);
        }
        catch (err) {
            return [];
        }
    }

    parseScoreData(dom: HTMLElement) {
        const title = dom.querySelector('.songNameTitleScore')?.textContent?.trim();
        const difficultyNumber = dom.querySelector('.levelIcon')?.getAttribute('src')?.replace(/image\/sp\/640\/icon_course02_([0-9])_640.png/, '$1');
        const difficulty = (['easy', 'normal', 'hard', 'oni', 'ura'] as const)[Number(difficultyNumber) - 1];
        if (!title || !difficulty) return null;

        const difficultyScoreData: DifficultyScoreData = {
            crown: null,
            badge: null,
            score: 0,
            ranking: 0,
            good: 0,
            ok: 0,
            bad: 0,
            maxCombo: 0,
            roll: 0,
            count: {
                play: 0,
                clear: 0,
                fullcombo: 0,
                donderfullcombo: 0
            }
        }

        if (dom.querySelectorAll('.scoreDetailArea').length > 0) {
            const crown = getCrown(dom.querySelectorAll('.crownIcon')[0]?.getAttribute('src')?.replace(/image\/sp\/640\/crown_(..)_640\.png/, '$1'));
            if (crown) difficultyScoreData.crown = crown;

            const badge = getBadge(dom.querySelectorAll('.crownIcon')[1]);
            if (badge) difficultyScoreData.badge = badge;

            difficultyScoreData.score = Number(dom.querySelector('.scoreScore')?.textContent?.replace(/[^0-9]/g, '')) || 0;
            difficultyScoreData.good = Number(dom.querySelectorAll('.scoreElement')[1]?.textContent?.replace(/[^0-9]/g, '')) || 0;
            difficultyScoreData.ok = Number(dom.querySelectorAll('.scoreElement')[3]?.textContent?.replace(/[^0-9]/g, '')) || 0;
            difficultyScoreData.bad = Number(dom.querySelectorAll('.scoreElement')[5]?.textContent?.replace(/[^0-9]/g, '')) || 0;
            difficultyScoreData.maxCombo = Number(dom.querySelectorAll('.scoreElement')[2]?.textContent?.replace(/[^0-9]/g, '')) || 0;
            difficultyScoreData.roll = Number(dom.querySelectorAll('.scoreElement')[4]?.textContent?.replace(/[^0-9]/g, '')) || 0;
            difficultyScoreData.count.play = Number(dom.querySelectorAll('.scoreElement')[6]?.textContent?.replace(/[^0-9]/g, '')) || 0;
            difficultyScoreData.count.clear = Number(dom.querySelectorAll('.scoreElement')[7]?.textContent?.replace(/[^0-9]/g, '')) || 0;
            difficultyScoreData.count.fullcombo = Number(dom.querySelectorAll('.scoreElement')[8]?.textContent?.replace(/[^0-9]/g, '')) || 0;
            difficultyScoreData.count.donderfullcombo = Number(dom.querySelectorAll('.scoreElement')[9]?.textContent?.replace(/[^0-9]/g, '')) || 0;
        }

        return { title, difficulty: difficulty as Difficulty, difficultyScoreData };

        function getCrown(src: string | undefined) {
            let crown: Crown | null = null;
            switch (src) {
                case '01': {
                    crown = 'played';
                    break;
                }
                case '03': {
                    crown = 'silver';
                    break;
                }
                case '02': {
                    crown = 'gold';
                    break;
                }
                case '04': {
                    crown = 'donderfull';
                    break;
                }
            }
            return crown;
        }

        function getBadge(element: HTMLElement | Element | null): Badge | null {
            if (!element) return null;
            const badgeText = element.getAttribute('src')?.replace('image/sp/640/best_score_rank_', '').replace('_640.png', '');
            if (!badgeText) return null;

            switch (badgeText) {
                case '8': {
                    return 'rainbow';
                }
                case '7': {
                    return 'purple';
                }
                case '6': {
                    return 'pink';
                }
                case '5': {
                    return 'gold';
                }
                case '4': {
                    return 'silver';
                }
                case '3': {
                    return 'bronze';
                }
                case '2': {
                    return 'white';
                }
                default: {
                    return null;
                }
            }
        }
    }
}