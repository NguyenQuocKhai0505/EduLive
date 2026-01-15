import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      // Dùng dấu ! hoặc ép kiểu string để báo với TS là biến này chắc chắn tồn tại
      clientID: process.env.FACEBOOK_APP_ID as string,
      clientSecret: process.env.FACEBOOK_APP_SECRET as string,
      callbackURL: 'http://localhost:3000/auth/facebook/callback',
      scope: 'email',
      profileFields: ['emails', 'name', 'photos'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: any) {
    const { id, name, emails, photos } = profile;
    const user = {
      socialId: id,
      email: emails?.[0].value,
      fullName: `${name?.givenName} ${name?.familyName}`,
      avatar: photos?.[0].value,
      provider: 'facebook',
    };
    done(null, user);
  }
}