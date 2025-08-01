import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEnvConfig } from '@utils/interface';
import { dateToUnix } from '@utils/time';
import * as COS from 'cos-nodejs-sdk-v5';
import { join } from 'path';

@Injectable()
export class OssService {
  private readonly cosConfig: IEnvConfig['cos'];
  private readonly cos: COS;
  constructor(private readonly configServer: ConfigService) {
    this.cosConfig = {
      SecretId: this.configServer.get('cos.SecretId'),
      SecretKey: this.configServer.get('cos.SecretKey'),
      Expires: this.configServer.get('cos.Expires'),
      Bucket: this.configServer.get('cos.Bucket'),
      Region: this.configServer.get('cos.Region'),
    }
    this.cos = new COS({
      SecretId: this.cosConfig.SecretId,
      SecretKey: this.cosConfig.SecretKey,
    })
  }

  async saveJsonToCos(payload: {
    path: string;
    contentType: string;
  }, dir: string) {
    const { path, contentType } = payload;
    const { SecretId, SecretKey, Expires, Bucket, Region } = this.cosConfig;
    const now = new Date();
    const Key = join(dir, path);
    const expiration = new Date(Date.now() + Expires * 1000);
    const KeyTime = `${dateToUnix(now)};${dateToUnix(expiration)}`;
    const authorization = COS.getAuthorization({
      SecretId,
      SecretKey,
      Expires,
      KeyTime,
      Method: "put",
      Key,
      Bucket,
      Region,
    })
    const headers: Record<string, string> = {};
    headers['x-cos-acl'] = 'default';
    headers['Content-Type'] = contentType;
    headers['Authorization'] = authorization;
    return {
      headers,
      Key,
      expiration,
    }
  }

  async getBucketList(folder: string) {
    const { Bucket, Region } = this.cosConfig;
    return new Promise((res, rej) => {
      this.cos.getBucket({
        Bucket,
        Region,
        Prefix: `books/${folder}`,
      }, (err, data) => {
        if (err) rej(err);
        else res(data.Contents.map(i => {
          return {
            ...i,
            name: i.Key.replace(`books/${folder}/`, '')
          }
        }));
      })
    })
  }

  async getObject(Key: string) {
    const { Bucket, Region } = this.cosConfig;
    return new Promise((res, rej) => {
      this.cos.getObject({
        Bucket,
        Region,
        Key,
      }, (err, data) => {
        if (err) rej(err);
        else res(data);
      })
    })
  }

  async putObject(Key: string, file: any) {
    const { Bucket, Region } = this.cosConfig;
    return new Promise((res, rej) => {
      this.cos.putObject({
        Bucket,
        Region,
        Key,
        Body: file,
        ContentLength: file.length,
        ContentType: 'image/png',
      }, (err, data) => {
        if (err) rej(err);
        else res(data);
      })
    })
  }
}
