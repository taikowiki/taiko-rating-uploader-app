import TaikowikiApi from "@taiko-wiki/taikowiki-api";

export class WikiProfile{
    token?: string = $state();
    currentLogin: {nickname: string, UUID: string} | null = $state(null);

    constructor(token?:string){
        this.token = token;
    }

    setToken(token: string){
        this.token = token;
    }
    getToken(){
        return this.token;
    }

    async checkLogined(){
        if(!this.token) return;

        const response = await fetch('https://taiko.wiki/api/user', {
            headers: {
                cookie: `auth-user=${this.token}`
            }
        });

        const data = await response.json();

        if(data.logined){
            this.currentLogin = {
                nickname: data.nickname,
                UUID: data.UUID
            }
        }
        else{
            this.currentLogin = null;
        }
    }
}