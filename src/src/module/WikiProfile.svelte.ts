export class WikiProfile{
    currentLogin: {nickname: string, UUID: string} | null = $state(null);

    async checkLogined(){
        const response = await fetch('https://taiko.wiki/api/user');

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

    initialize(){
        this.currentLogin = null;
    }
}