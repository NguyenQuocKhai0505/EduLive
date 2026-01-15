import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy,"google"){
    constructor(){
        super({
            clientID: process.env.GOOGLE_CLIENT_ID || "DUMMY_ID",
            clientSecret:process.env.GOOGLE_CLIENT_SECRET ||"DUMMY_SECRET",
            callbackURL:"http://localhost:3001/auth/google/callback",
            scope:["email","profile"]
        })
    }
    //Ham validate se nhan profile tu Google tra ve 
    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
      ): Promise<any> {
        const { id, name, emails, photos } = profile;
        
        // Kiểm tra dữ liệu từ Google
        if (!emails || emails.length === 0) {
          return done(new Error('No email found in Google profile'), false);
        }
        
        const user = {
          socialId: id,
          email: emails[0].value,
          fullName: `${name?.givenName || ''} ${name?.familyName || ''}`.trim() || emails[0].value,
          avatar: photos && photos.length > 0 ? photos[0].value : null,
          provider: 'google',
        };
        done(null, user);
      }
}