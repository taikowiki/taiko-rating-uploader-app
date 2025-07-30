import { DonderHiroba, util, type Badge, type CardData, type Clear, type ClearData, type Crown, type Difficulty, type DifficultyScoreData, type ScoreData } from "hiroba-js";
import { HirobaDataStorage } from "./HirobaDataStorage";
import { HTMLElement, parse as parseHtml } from "node-html-parser";

const { HirobaError } = util;

class AppState {
    // hiroba
    hirobaToken = $state<null | string>(null);
    hirobaProfile = $state<null | 'namco' | CardData>(null);
    cardList = $state<CardData[]>([]);

    setHirobaToken(token: string | null) {
        this.hirobaToken = token;
    }
    async updateHirobaProfile() {
        try {
            const currentLogin = await this.hirobaErrorWrapper(() => DonderHiroba.func.getCurrentLogin({ token: this.hirobaToken ?? undefined }));
            this.hirobaProfile = currentLogin;
        }
        catch { }
    }
    async updateCardList() {
        try {
            const cardData = await this.hirobaErrorWrapper(() => DonderHiroba.func.getCardList({ token: this.hirobaToken ?? undefined }));
            this.hirobaProfile = 'namco';
            this.cardList = cardData;
            this.hirobaCache = null;
        }
        catch { }
    }
    async cardLogin(taikoNumber: string) {
        this.hirobaCache = null;
        const currentLogin = await this.hirobaErrorWrapper(() => DonderHiroba.func.cardLogin({
            token: this.hirobaToken ?? undefined,
            taikoNumber,
            cardList: this.cardList
        }));
        this.hirobaProfile = currentLogin;
        await this.loadHirobaCache(taikoNumber);
    }
    async updateHirobaRecord() {
        await this.hirobaErrorWrapper(() => DonderHiroba.func.updateRecord({ token: this.hirobaToken ?? undefined }));
    }
    async getClearData() {
        const clearData = await this.hirobaErrorWrapper(() => DonderHiroba.func.getClearData({ token: this.hirobaToken ?? undefined }));
        const clearDataRecord: Record<string, ClearData> = {};
        clearData.forEach((data) => {
            clearDataRecord[data.songNo] = data;
        });
        return clearDataRecord;
    }
    hirobaLogout() {
        this.hirobaToken = null;
        this.hirobaProfile = null;
        this.cardList = [];
        this.hirobaCache = null;
    }
    private async hirobaErrorWrapper<T>(callback: () => (T | Promise<T>)) {
        try {
            return await callback();
        }
        catch (err) {
            if (err instanceof HirobaError && (err.code === "NOT_LOGINED" || err.code === "NOT_NAMCO_LOGINED")) {
                this.hirobaProfile = null;
            }
            throw err;
        }
    }

    //wiki
    wikiToken = $state<null | string>(null);
    wikiProfile = $state<null | { nickname: string, UUID: string }>(null);

    async updateWikiProfile() {
        try {
            const data = await fetch('https://taiko.wiki/api/user', {
                headers: {
                    'content-type': 'application/json',
                    cookie: this.wikiToken ? `auth-user=${this.wikiToken};` : ''
                }
            }).then((res) => res.json());

            if (data.logined) {
                this.wikiProfile = {
                    nickname: data.nickname,
                    UUID: data.UUID
                };
            }
            else {
                this.wikiProfile = null;
            }
        }
        catch {
            this.wikiProfile = null;
        }
    }
    wikiLogout() {
        this.wikiToken = null;
        this.wikiProfile = null;
    }

    // uploader
    uploading = $state(false);
    uploadMessage = $state('');

    async upload(mode: 'clear' | 'all') {
        this.uploading = true;
        try {
            this.setUploadMessage('동더히로바 로그인 여부 확인 중...');
            await this.updateHirobaProfile();
            if (!this.hirobaProfile || this.hirobaProfile === "namco") {
                this.setUploadMessage('동더히로바에 로그인 되어있지 않습니다.');
                return;
            }

            this.setUploadMessage('taiko.wiki 로그인 여부 확인 중...');
            await this.updateWikiProfile();
            if (!this.wikiProfile) {
                this.setUploadMessage('taiko.wiki에 로그인 되어있지 않습니다.');
                return;
            }

            this.setUploadMessage('클리어 데이터를 수집하는 중...');
            await this.updateHirobaRecord();
            const clearData = await this.getClearData();

            if (mode === 'clear') {
                this.setUploadMessage('taiko.wiki에 전송하는 중...');
                await this.uploadWikiData(this.hirobaProfile, Object.values(clearData));
                this.setUploadMessage('업로드 완료!');
                return;
            }

            this.setUploadMessage('캐시를 가져오는 중...');
            const scoreDataCache = await this.hirobaDataStorage.getScoreDatas(this.hirobaProfile.taikoNumber);
            const lastUploadData: { songNo: string; difficulty: Difficulty; data: DifficultyScoreData; } | null = await this.hirobaDataStorage.getLastUpload(this.hirobaProfile.taikoNumber);

            const scoreData: HirobaDataStorage.ScoreDataRecord = {};
            let crawled = 0;
            let firstData: { songNo: string; difficulty: Difficulty; data: DifficultyScoreData; } | null = null;
            let newLastUploadData: { songNo: string; difficulty: Difficulty; data: DifficultyScoreData; } | null = null;
            for (let i = 1; ; i++) {
                const crawledScoreDatas = await this.getRecentScoreDatas(i);
                if (crawledScoreDatas.length === 0) break;

                let doBreak = false;
                for (const { title, difficulty, difficultyScoreData } of crawledScoreDatas) {
                    const songNo = Array.from(Object.values(clearData)).find((data) => data.title === title)?.songNo;
                    if (!songNo) continue;

                    newLastUploadData = { songNo, difficulty, data: difficultyScoreData };
                    if (lastUploadData && HirobaDataStorage.isEqualCourseScoreData(lastUploadData, newLastUploadData)) {
                        doBreak = true;
                        break;
                    }
                    if (!firstData) {
                        firstData = newLastUploadData;
                    }
                    else if (firstData.songNo === songNo && firstData.difficulty === difficulty) {
                        doBreak = true;
                        break;
                    }

                    if (songNo in scoreData) {
                        scoreData[songNo].difficulty[difficulty] = difficultyScoreData;
                    }
                    else {
                        scoreData[songNo] = {
                            title,
                            songNo,
                            difficulty: {
                                [difficulty]: difficultyScoreData
                            }
                        }
                    }

                    crawled++;
                    this.setUploadMessage(`점수 데이터를 가져오는 중... (${crawled}개 완료)`);
                }

                if (doBreak) break;
            }

            if (scoreDataCache) {
                var merged = HirobaDataStorage.mergeScoreDatas(scoreDataCache.scoreDataRecord, scoreData);
            }
            else {
                var merged = scoreData;
            }

            this.setUploadMessage('taiko.wiki에 전송하는 중...');
            await this.uploadWikiData(this.hirobaProfile, Object.values(clearData), merged);
            await this.hirobaDataStorage.updateScoreDatas(this.hirobaProfile.taikoNumber, merged);
            if (newLastUploadData) {
                await this.hirobaDataStorage.setLastUpload(this.hirobaProfile.taikoNumber, newLastUploadData?.songNo, newLastUploadData?.difficulty, newLastUploadData?.data);
            };

            const playCount = this.calculatePlayCount(Object.values(merged));
            await this.hirobaDataStorage.setPlayCount(this.hirobaProfile.taikoNumber, playCount);
            await this.loadHirobaCache(this.hirobaProfile.taikoNumber);

            this.setUploadMessage('업로드 완료!');
        }
        catch {
            this.uploadMessage = '업로드 에러'
        }
        finally {
            this.uploading = false;
        }
    }
    private setUploadMessage(message: string) {
        this.uploadMessage = message;
    }
    private async getRecentScoreDatas(page: number) {
        try {
            const response = await fetch(`https://donderhiroba.jp/history_recent_score.php?page=${page}`, {
                headers: util.createHeader(`_token_v2=${this.hirobaToken};`)
            });
            const html = await response.text();
            const dom = parseHtml(html);
            return Array.from(dom.querySelectorAll('.scoreUser')).map((d) => this.parseScoreData(d)).filter(e => e !== null);
        }
        catch (err) {
            return [];
        }
    }
    private parseScoreData(dom: HTMLElement) {
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
    private async uploadWikiData(donderData: CardData, clearData: ClearData[], scoreData?: HirobaDataStorage.ScoreDataRecord) {
        const body: Record<string, any> = {
            donderData,
            clearData,
        };
        if (scoreData) body.scoreData = scoreData;

        await fetch('https://taiko.wiki/api/user/donder', {
            headers: {
                'content-type': 'application/json',
                cookie: this.wikiToken ? `auth-user=${this.wikiToken};` : ''
            },
            body: JSON.stringify(body),
            method: 'post'
        });
    }
    private calculatePlayCount(scoreDatas: ScoreData[]) {
        let play = 0;
        let clear = 0;
        let fc = 0;
        let dfc = 0;

        scoreDatas.forEach((d) => {
            (["oni", "ura"] as const).forEach((diff) => {
                if (diff in d.difficulty && d.difficulty[diff]?.count) {
                    play += d.difficulty[diff].count.play;
                    clear += d.difficulty[diff].count.clear;
                    fc += d.difficulty[diff].count.fullcombo;
                    dfc += d.difficulty[diff].count.donderfullcombo;
                }
            })
        });

        return { play, clear, fc, dfc };
    }


    // data storgage
    hirobaDataStorage = $state(new HirobaDataStorage());

    // cache
    hirobaCache = $state<HirobaCache | null>(null);

    async loadHirobaCache(taikoNumber: string) {
        const playCount = await this.hirobaDataStorage.getPlayCount(taikoNumber);
        if (!playCount) return;
        const scoreData = await this.hirobaDataStorage.getScoreDatas(taikoNumber);
        if (!scoreData) return;

        const difficultyScoreDatas: HirobaCache['difficultyScoreDatas'] = [];
        Object.values(scoreData.scoreDataRecord).forEach((d: ScoreData) => {
            if (d.difficulty?.oni) {
                difficultyScoreDatas.push({
                    title: d.title,
                    songNo: d.songNo,
                    data: d.difficulty.oni,
                    diff: 'oni'
                })
            }
            if (d.difficulty?.ura) {
                difficultyScoreDatas.push({
                    title: d.title,
                    songNo: d.songNo,
                    data: d.difficulty.ura,
                    diff: 'ura'
                })
            }
        });
        difficultyScoreDatas.sort((a, b) => b.data.count.play - a.data.count.play);

        this.hirobaCache = {
            playCount: playCount.data,
            difficultyScoreDatas,
            scoreDataMap: scoreData.scoreDataRecord
        }
    }

    async clearHirobaCache() {
        this.hirobaCache = null;
    }
}

export const appState = new AppState();

type HirobaCache = {
    playCount: HirobaDataStorage.PlayCount['data'];
    difficultyScoreDatas: {songNo: string, diff: 'oni' | 'ura', title: string, data: DifficultyScoreData}[];
    scoreDataMap: Record<string, ScoreData>;
}