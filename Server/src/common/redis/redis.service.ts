import { Injectable,OnModuleInit } from "@nestjs/common";
import Redis from "ioredis"

@Injectable()
export class RedisService implements OnModuleInit{
    private client: Redis

    onModuleInit() {
        this.client = new Redis({
            host: "localhost",
            port: 6379
        })
    }

    //Tang gia tri va dat thoi gian het han 
    async incr(key:string,ttl:number):Promise<number>{
        const count = await this.client.incr(key)
        if(count ===1 ) await this.client.expire(key,ttl)
        return count
    }
    async get(key: string) { return await this.client.get(key); }
    async set(key: string, value: string, ttl: number) { await this.client.set(key, value, 'EX', ttl); }
    async del(key: string) { await this.client.del(key); }
}