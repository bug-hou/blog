import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Books, BooksChaptersUser } from "../../entities/book.entity";
import { Like } from "../../like/entities/like.entity";

@Entity()
export class Chapters {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar"
  })
  title: string;

  @Column({
    type: "int",
    default: 0,
  })
  index: number;

  @Column({
    type: "int",
    default: 0
  })
  version: number;

  @Column({
    type: "enum",
    enum: ["tag", "chapter"],
    default: "chapter"
  })
  kind: string;

  @Column({
    type: "enum",
    enum: ["draft", "published", "free"],
    default: "draft"
  })
  type: string;

  @Column({
    type: "varchar",
    default: ""
  })
  content: string;

  @Column({
    type: "int",
    default: 0
  })
  readCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Books, book => book.chapters)
  @JoinColumn({ name: "bookId" })
  book: Books;

  @OneToMany(() => Like, like => like.chapters)
  likes: Like[];

  @OneToMany(() => BooksChaptersUser, chapterUser => chapterUser.chapter)
  chapterUsers: BooksChaptersUser[];

  @OneToMany(() => ChapterWithVersion, chapterWithVersion => chapterWithVersion.chapter, {
    cascade: true,
  })
  chapterWithVersions: ChapterWithVersion[];
}

@Entity()
export class ChapterWithVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "int",
    default: 0
  })
  version: number;

  @Column({
    type: "varchar",
    default: ""
  })
  content: string;

  @ManyToOne(() => Chapters, chapter => chapter.id, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  chapter: Chapters;

  @ManyToOne(() => Books, book => book.id, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  book: Books;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}