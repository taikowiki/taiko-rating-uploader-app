import type { HirobaProfile } from "./HirobaProfile.svelte";
import type { WikiProfile } from "./WikiProfile.svelte";

export class RatingUploader{
    message: string = $state('');

    async upload(hirobaProfile: HirobaProfile, wikiProfile: WikiProfile){
        this.message = '동더히로바 로그인 여부 확인 중...';
        await hirobaProfile.checkCardLogined();
        if(!hirobaProfile.namcoLogined || !hirobaProfile.cardLogined){
            this.message = '동더히로바에 로그인 되어있지 않습니다.';
            return;
        }

        this.message = 'taiko.wiki 로그인 여부 확인 중...';
        await wikiProfile.checkLogined();
        if(!wikiProfile.currentLogin){
            this.message = 'taiko.wiki에 로그인 되어있지 않습니다.';
            return;
        }

        this.message = '클리어 데이터를 수집하는 중...';
        await hirobaProfile.updateRecord();
        await hirobaProfile.updateClearData();

        this.message = '업로드 완료!';
    }
}