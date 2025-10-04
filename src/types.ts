type User = {
    name: string;
    email: string;
    streak: number;
    createDate: Date;
}

type ChatLog = {
    title: string;
    userContent: {
        text: '',
        sentiment: 'worried' | 'neutral' | 'sad' | 'happy' | 'excited';
    }[];
    agentContent: {
        text: '',
        sentiment: 'worried' | 'neutral' | 'sad' | 'happy' | 'excited';
    }[];
    date: string;
}

type Video = {
    frames: Base64URLString[];
}