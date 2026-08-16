import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadsService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
      api_key:    config.get('CLOUDINARY_API_KEY'),
      api_secret: config.get('CLOUDINARY_API_SECRET'),
    });
  }

  generateSignature() {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'datreserve';
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      this.config.get('CLOUDINARY_API_SECRET'),
    );
    return {
      signature,
      timestamp,
      folder,
      apiKey:    this.config.get('CLOUDINARY_API_KEY'),
      cloudName: this.config.get('CLOUDINARY_CLOUD_NAME'),
    };
  }
}
