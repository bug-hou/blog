import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
    const config = this.configService.get('mail');
    this.transporter = createTransport(config)
  }

  getTemplate(templateName: "welcome" | "resetPassword" | "notification" | "verifyEmail", data: {
    name?: string;
    link?: string;
    message?: string;
  }): string {
    const templates = {
      welcome: `<div>欢迎加入我们，${data.name}！</div>`,
      resetPassword: `<div>请点击以下链接重置密码：<a href="${data.link}">重置密码</a></div>`,
      notification: `<div>您有一条新通知：${data.message}</div>`,
      verifyEmail: `<div>请点击以下链接验证您的邮箱：<a href="${data.link}">验证邮箱</a><span>30分钟后过期</span></div>`
    };
    return templates[templateName] || '';
  }

  async sendMail({ to, subject, html }) {
    await this.transporter.sendMail({
      from: {
        name: '系统邮件',
        address: 'bughou@foxmail.com'
      },
      to,
      subject,
      html
    });
  }
}
