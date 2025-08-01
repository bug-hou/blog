import { OssService } from '@app/oss';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommentPublishEntity } from './entities/talk.entiry';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from 'apps/password/src/user/user.service';
import { LikeService } from './like/like.service';

@Injectable()
export class TalkService {
  @Inject(OssService)
  private readonly ossService: OssService;
  @Inject(LikeService)
  private readonly likeService: LikeService;
  @InjectModel(CommentPublishEntity.name)
  private readonly commentPublishModel: Model<CommentPublishEntity>;
  @Inject(UserService)
  private readonly userService: UserService;

  async saveToCos(body: { path: string, contentType: string }) {
    return await this.ossService.saveJsonToCos(body, 'json');
  }

  async publish(payload: any) {
    return await this.commentPublishModel.create(payload);
  }

  async list({ chapter_id, reply_to_comment_id, book_id, page, pageSize }, userId: number) {
    const list = await this.commentPublishModel.find({
      chapter_id,
      reply_to_comment_id,
      book_id
    })
      .sort({ createdAt: -1 })
      .skip(page * pageSize)
      .limit(pageSize)
      .exec();

    const userListInfo = await this.userService.find(list.map(item => item.user_id));

    const resultList = await Promise.all(list.map(async (item) => {
      const _id = item._id.toString();
      const like_count = await this.likeService.countLikes(_id);
      const reply_count = await this.commentPublishModel.countDocuments({
        reply_to_comment_id: _id,
        chapter_id: item.chapter_id
      })
      const isLiked = !!(await this.likeService.findLikesByTalkId(_id, userId));
      const isAuthor = userId === +item.user_id;
      return {
        ...item.toJSON(),
        user_info: userListInfo.find(({ id }) => id === item.user_id || id),
        like_count,
        reply_count,
        isLiked,
        isAuthor
      };
    }));
    return {
      list: resultList,
      total: await this.commentPublishModel.countDocuments({ chapter_id, reply_to_comment_id }).exec()
    };
  }

  async count({ chapter_id, reply_to_comment_id, book_id }: { chapter_id: string, reply_to_comment_id?: string, book_id?: string }) {
    return await this.commentPublishModel.countDocuments({ chapter_id, reply_to_comment_id, book_id }).exec();
  }

  async delete(commentId: string) {
    return await this.commentPublishModel.findByIdAndDelete(commentId).exec();
  }
}
