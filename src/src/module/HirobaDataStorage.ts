import Dexie, { type EntityTable, type Table } from "dexie";
import type { Difficulty, DifficultyScoreData, ScoreData } from "hiroba-js";

export class HirobaDataStorage {
    db;
    scoreDatas: Table<HirobaDataStorage.ScoreDataCache>;

    constructor() {
        this.db = new Dexie("HirobaDataStorage") as Dexie & {
            scoreDatas: EntityTable<HirobaDataStorage.ScoreDataCache, 'id'>;
            lastUpload: EntityTable<HirobaDataStorage.LastUpload, 'id'>;
        };

        this.db.version(1).stores({
            scoreDatas: "++id, &taikoNumber, scoreDataRecord",
            lastUpload: "++id, &taikoNumber, time, songNo, difficulty, data"
        });

        this.scoreDatas = this.db.scoreDatas;
    }

    async getScoreDatas(taikoNumber: string) {
        return (await this.scoreDatas.where('taikoNumber').equals(taikoNumber).first()) ?? null;
    }

    async updateScoreDatas(taikoNumber: string, scoreDataRecord: HirobaDataStorage.ScoreDataRecord) {
        const data = await this.getScoreDatas(taikoNumber);
        if (data) {
            await this.scoreDatas.where('taikoNumber').equals(taikoNumber).modify((obj) => { obj.scoreDataRecord = scoreDataRecord })
        }
        else {
            await this.scoreDatas.put({ taikoNumber, scoreDataRecord });
        }
    }

    async getLastUpload(taikoNumber: string){
        return (await this.db.lastUpload.where('taikoNumber').equals(taikoNumber).first()) ?? null;
    }

    async setLastUpload(taikoNumber: string, songNo: string, difficulty: Difficulty, data: DifficultyScoreData) {
        const data_ = await this.db.lastUpload.where('taikoNumber').equals(taikoNumber).first();
        if (data_) {
            await this.db.lastUpload.where('taikoNumber').equals(taikoNumber).modify((obj) => {
                obj.songNo = songNo;
                obj.difficulty = difficulty;
                obj.data = data;
                obj.time = Date.now();
            })
        }
        else {
            await this.db.lastUpload.put({
                taikoNumber,
                songNo,
                difficulty,
                data,
                time: Date.now()
            })
        }
    }

    async clearCache(taikoNumber: string){
        await this.db.scoreDatas.where('taikoNumber').equals(taikoNumber).delete();
        await this.db.lastUpload.where('taikoNumber').equals(taikoNumber).delete();
    }

    async clearAllCache(){
        await this.db.scoreDatas.clear();
        await this.db.lastUpload.clear();
    }
}

export namespace HirobaDataStorage {
    export function mergeScoreDatas(oldDatas: HirobaDataStorage.ScoreDataRecord, newDatas: HirobaDataStorage.ScoreDataRecord) {
        const merged: HirobaDataStorage.ScoreDataRecord = {};
        for (const [songNo, scoreData] of Object.entries(oldDatas)) {
            merged[songNo] = structuredClone(scoreData);
        }
        for (const [songNo, scoreData] of Object.entries(newDatas)) {
            if (songNo in merged) {
                for (const [diff, diffScoreData] of Object.entries(scoreData.difficulty)) {
                    merged[songNo].difficulty[diff as Difficulty] = structuredClone(diffScoreData);
                }
            }
            else {
                merged[songNo] = structuredClone(scoreData);
            }
        }
        return merged;
    }

    export function isEqualCourseScoreData<T extends Pick<HirobaDataStorage.LastUpload, 'songNo' | 'difficulty' | 'data'>>(a: T, b: T){
        if(a.songNo !== b.songNo) return false;
        if(a.difficulty !== b.difficulty) return false;
        if(a.data.bad !== b.data.bad) return false;
        if(a.data.badge !== b.data.badge) return false;
        if(a.data.crown !== b.data.crown) return false;
        if(a.data.good !== b.data.good) return false;
        if(a.data.maxCombo !== b.data.maxCombo) return false;
        if(a.data.ok !== b.data.ok) return false;
        if(a.data.ranking !== b.data.ranking) return false;
        if(a.data.roll !== b.data.roll) return false;
        if(a.data.score !== b.data.score) return false;
        if(a.data.count.clear !== b.data.count.clear) return false;
        if(a.data.count.donderfullcombo !== b.data.count.donderfullcombo) return false;
        if(a.data.count.fullcombo !== b.data.count.fullcombo) return false;
        if(a.data.count.play !== b.data.count.play) return false;
        return true;
    }


    export interface ScoreDataRecord {
        [songNo: string]: ScoreData;
    }

    export interface ScoreDataCache {
        id?: number;
        taikoNumber: string;
        scoreDataRecord: ScoreDataRecord;
    }

    export interface LastUpload {
        id?: number;
        taikoNumber: string;
        time: number;
        songNo: string;
        difficulty: Difficulty;
        data: DifficultyScoreData;
    }
}