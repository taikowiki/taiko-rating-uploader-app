import { DonderHiroba as D, util, type CardData, type ClearData, type Difficulty, type ScoreData } from "hiroba-js";
import { SvelteMap } from "svelte/reactivity";

const { HirobaError, Const, createHeader } = util;

export class DonderHiroba {
    private token?: string = $state(undefined);
    namcoLogined: boolean = $state(false);
    cardLogined: boolean = $state(false);
    currentLogin: CardData | null = $state(null);
    cardList: CardData[] = [];
    clearData = new SvelteMap<string, ClearData>();
    scoreData = new SvelteMap<string, ScoreData>();
    ticket: string | null = null;

    constructor(token?: string) {
        this.token = token;
    }

    /**
     * 남코 계정에 로그인 되어있는 지 체크합니다. 이 함수를 사용하면 카드 로그인이 풀립니다.
     * @returns
     */
    async checkNamcoLogined() {
        this.cardLogined = false;
        this.namcoLogined = false;

        try {
            this.cardList = await DonderHiroba.func.getCardList({ token: this.token });
            this.namcoLogined = true;
            return true;
        }
        catch {
            return false;
        }
    }

    /**
     * 카드에 로그인 되어있는 지 체크합니다. 이 함수를 사용하면 남코 로그인이 풀릴 수 있습니다.
     * @returns 
     */
    async checkCardLogined() {
        this.namcoLogined = false;
        this.cardLogined = false;

        try {
            this.currentLogin = await DonderHiroba.func.getCurrentLogin();
            if (this.currentLogin) {
                this.namcoLogined = true;
                this.cardLogined = true;
                return true;
            }
            else {
                return false;
            }
        }
        catch {
            return false;
        }
    }

    /**
     * 카드 리스트를 다시 로드합니다.
     * 이 경우 카드 로그인이 풀립니다.
     */
    async reloadCardList() {
        this.cardList = await DonderHiroba.func.getCardList({ token: this.token });
    }

    /**
     * 카드에 로그인합니다.
     * @param taikoNumber 
     */
    async cardLogin(taikoNumber: string) {
        try {
            this.currentLogin = await this.loginedCheckWrapper(async () => {
                return await DonderHiroba.func.cardLogin({
                    token: this.token,
                    taikoNumber,
                    cardList: this.cardList
                });
            });
            this.cardLogined = true;
        }
        catch (err) {
            if (err instanceof HirobaError && err.code === 'NO_MATCHED_CARD') {
                await this.reloadCardList();
                await this.cardLogin(taikoNumber);
            }
            else {
                throw err;
            }
        }
    }

    /**
     * 클리어 데이터를 업데이트하고, 업데이트 된 클리어 데이터를 {songNo: ClearData} 형태의 객체로 반환합니다.
     * @param genre 
     * @returns 
     */
    async updateClearData(genre?: keyof typeof Const.genre) {
        const clearDataHtml = await this.loginedCheckWrapper<Promise<string | string[]>>(() => genre ? DonderHiroba.request.clearData({ token: this.token, genre }) : DonderHiroba.request.clearData({ token: this.token }));
        const clearData: ClearData[] = [];
        if (Array.isArray(clearDataHtml)) {
            clearDataHtml.forEach((html) => {
                clearData.push(...DonderHiroba.parse.clearData(html));
            });
            this.ticket = DonderHiroba.parse.ticket(clearDataHtml[clearDataHtml.length - 1]);
        }
        else {
            clearData.push(...DonderHiroba.parse.clearData(clearDataHtml));
            this.ticket = DonderHiroba.parse.ticket(clearDataHtml);
        }

        const clearDataRecord: Record<string, ClearData> = {};
        clearData.forEach((e) => {
            this.clearData.set(e.songNo, e);
            clearDataRecord[e.songNo] = e;
        });

        return clearDataRecord;
    }

    /**
     * 점수 데이터를 업데이트하고, 업데이트 된 점수 데이터를 반환합니다.
     * @param songNo 
     * @param difficulty 
     * @returns 
     */
    async updateScoreData(songNo: string, difficulty?: Difficulty) {
        const scoreDataHtml = await this.loginedCheckWrapper<Promise<string | string[]>>(() => difficulty ? DonderHiroba.request.scoreData({ token: this.token, songNo, difficulty }) : DonderHiroba.request.scoreData({ token: this.token, songNo }));
        if (Array.isArray(scoreDataHtml)) {
            var scoreData = DonderHiroba.parse.scoreData({ html: scoreDataHtml, songNo });
            this.ticket = DonderHiroba.parse.ticket(scoreDataHtml[scoreDataHtml.length - 1]);
        }
        else {
            var scoreData = DonderHiroba.parse.scoreData({ html: scoreDataHtml, songNo });
            this.ticket = DonderHiroba.parse.ticket(scoreDataHtml);
        }

        if (!scoreData) return null;

        let existingScoreData = this.scoreData.get(songNo);
        if (!existingScoreData) {
            existingScoreData = scoreData;
            this.scoreData.set(songNo, existingScoreData);
        }
        else {
            for (const [diff, diffScoreData] of Object.entries(scoreData.difficulty)) {
                existingScoreData.difficulty[diff as Difficulty] = diffScoreData;
            }
        };

        return existingScoreData;
    }

    async updateRecord() {
        //if(!this.ticket){
        //    await this.getTicket();
        //}

        await DonderHiroba.func.updateRecord({ token: this.token });
    }

    async changeName(newName: string) {
        if (!this.ticket) {
            await this.getTicket();
        }

        await DonderHiroba.func.changeName({ token: this.token, ticket: this.ticket as string, newName });
        await this.checkCardLogined();

        return this.currentLogin;
    }

    async getTicket() {
        const ticket = await this.loginedCheckWrapper(() => DonderHiroba.func.getTicket({ token: this.token }));
        this.ticket = ticket;
        return ticket;
    }

    setToken(token: string) {
        this.token = token;
    }

    getToken() {
        return this.token;
    }

    /**
     * 에러 발생 시 에러가 로그인과 관련된 에러라면 해당하는 속성을 초기화합니다.
     * @param callback 
     * @returns 
     */
    private async loginedCheckWrapper<T = void>(callback: () => (T | Promise<T>)) {
        try {
            return await callback();
        }
        catch (err) {
            if (err instanceof HirobaError && (err.code === 'NOT_LOGINED' || err.code === 'NOT_NAMCO_LOGINED')) {
                this.namcoLogined = false;
                this.cardLogined = false;
                this.currentLogin = null;
                this.cardList = [];
            }
            throw err;
        }
    }
}

export namespace DonderHiroba {
    export const login = D.login;
    export const parse = D.parse;
    export const request = D.request;
    export const func = D.func;
    func.cardLogin = async function(data: { token?: string, taikoNumber: string, cardList?: CardData[] }) {
        const { token, taikoNumber } = data;

        const cardList = data.cardList ?? await func.getCardList(data);
        const matchedCardIndex = cardList.findIndex(card => card.taikoNumber === taikoNumber);

        if (matchedCardIndex === -1) {
            throw new HirobaError('NO_MATCHED_CARD');
        }

        let response: Response;
        // 첫 번째 요청
        // 302 응답
        try {
            const params = new URLSearchParams();
            params.set('id_pos', `${matchedCardIndex + 1}`);
            params.set('mode', 'exec');

            response = await fetch('https://donderhiroba.jp/login_select.php', {
                method: 'post',
                headers: {
                    'content-type': "application/x-www-form-urlencoded; charset=UTF-8",
                    ...createHeader(token ? `_token_v2=${token}` : undefined),

                },
                redirect: 'manual',
                body: params
            });

            if (response.status !== 302) {
                throw response;
            }
        }
        catch (err) {
            if (err instanceof Response) {
                throw new HirobaError('CANNOT_CONNECT', err);
            }
            else {
                throw new HirobaError('CANNOT_CONNECT');
            }
        }

        // 두 번째 요청
        // 200 응답
        try {
            response = await fetch(response.headers.get('location') as string, {
                method: 'get',
                headers: createHeader(token ? `_token_v2=${token}` : undefined)
            });

            if (response.status !== 200) throw response;
        }
        catch (err) {
            if (err instanceof Response) {
                throw new HirobaError('CANNOT_CONNECT', err);
            }
            else {
                throw new HirobaError('CANNOT_CONNECT');
            }
        };

        return cardList[matchedCardIndex];
    }
};