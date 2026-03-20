import { Injectable,OnModuleInit } from "@nestjs/common";
import Redis from "ioredis"
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RedisService implements OnModuleInit{
    private client: Redis
    constructor(private readonly configService: ConfigService){}



    onModuleInit() {
        const host = this.configService.get<string>("REDIS_HOST") || "localhost"
        const port = this.configService.get<number>("REDIS_PORT") || 6379
        this.client = new Redis({host,port})
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
