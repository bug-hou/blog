import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, RelationId, Unique } from "typeorm";
import { Books } from "../../entities/book.entity";
import { User } from "apps/password/src/user/entities/user.entity";
import { Chapters } from "../../chapters/entities/chapters.entity";

@Entity("like")
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: "int",
    comment: "-1-dislike,0-cancel,1-like"
  })
  status: number;

  @ManyToOne(() => Books, {
    onDelete: "CASCADE"
  })
  book: Books;

  @RelationId((like: Like) => like.book)
  bookId: number;

  @ManyToOne(() => User, {
    onDelete: "CASCADE"
  })
  user: User;

  @RelationId((like: Like) => like.user)
  userId: number;

  @ManyToOne(() => Chapters, {
    onDelete: "CASCADE"
  })
  chapters: Chapters;

  @RelationId((like: Like) => like.chapters)
  chaptersId: number;
}
