import { ApiProperty } from "@nestjs/swagger";
import { User } from "apps/password/src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, RelationId, Unique, UpdateDateColumn } from "typeorm";
import { Like } from "../like/entities/like.entity";
import { Chapters, ChapterWithVersion } from "../chapters/entities/chapters.entity";
import { Favorite } from "../favorite/entities/favorite.entity";

@Entity("books")
export class Books {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "书名", uniqueItems: true })
  @Column({
    type: "varchar",
    unique: true,
    nullable: false,
    comment: "书名"
  })
  name: string;

  @ApiProperty({ description: "书籍描述", required: false })
  @Column({
    type: "varchar",
    nullable: true,
    comment: "书籍描述",
    default: "",
  })
  description?: string;

  @Column({
    type: "enum",
    enum: ["free", "paid"],
    default: "paid",
  })
  kind: string;

  @Column({
    type: "int",
    comment: "阅读时间",
    default: 0
  })
  readTime: number;

  @Column({
    type: "int",
    default: 0,
    comment: "字数"
  })
  wordCount: number;

  @ApiProperty({ description: "是否完结", default: false })
  @Column({
    type: "boolean",
    default: false,
    comment: "是否完结"
  })
  isFinished: boolean;

  @ApiProperty({ description: "是否公开", default: true })
  @Column({
    type: "boolean",
    default: true,
    comment: "是否公开"
  })
  isPublic: boolean;

  @ApiProperty({ default: 0, description: "更新章节", type: "number" })
  @Column({
    type: "int",
    default: 0
  })
  updateChapterCount: number;

  @ApiProperty({ description: "章节数量", default: 0, type: "number" })
  @Column({
    type: "int",
    default: 0
  })
  totalChapterCount: number;

  @Column({
    type: "float",
    default: 0
  })
  currentPrice: number;

  @Column({
    type: "float",
    default: 0
  })
  oldPrice: number;

  @ApiProperty({ description: "创建时间" })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: "更新时间" })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Like, like => like.book)
  likes: Like[]

  @OneToMany(() => Favorite, favorite => favorite.book)
  favorites: Favorite[]

  @OneToMany(() => Chapters, chapter => chapter.book)
  chapters: Chapters[]

  @JoinTable({
    name: "tags",
  })
  @ManyToMany(() => BooksTags, tags => tags.book, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  tags: BooksTags[]

  @ManyToMany(() => User, user => user.books)
  users: User[]

  @OneToMany(() => BooksChaptersUser, chapterUser => chapterUser.book)
  chapterUsers: BooksChaptersUser[]
}

@Entity("books_tags")
export class BooksTags {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "标签名" })
  @Column({
    type: "varchar",
    nullable: false,
    comment: "标签名"
  })
  name: string;

  @Column({
    type: "varchar",
    nullable: true,
    comment: "别名",
    default: ""
  })
  alias: string;

  @Column({
    type: "enum",
    enum: ["icon", "kind", "tag"],
    default: "tag"
  })
  type: string;

  @Column({
    type: "varchar",
    nullable: true,
    comment: "图标",
    default: ""
  })
  icon: string;

  @Column({
    type: "varchar",
    nullable: true,
    comment: "颜色",
    default: ""
  })
  color: string;

  @Column({
    type: "varchar",
    comment: "描述",
    default: ""
  })
  description: string;

  @ApiProperty({ description: "创建时间" })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: "更新时间" })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Books, book => book.tags)
  book: Books;
}

@Entity("books_chapters_user")
@Unique(["book", "chapter", "user"])
export class BooksChaptersUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: [0, 1, 2],
    default: 0,
    comment: "阅读状态: 0-未读, 1-阅读中, 2-已读"
  })
  status: number;

  @Column({
    type: "int",
    default: 0,
    comment: "版本号"
  })
  version: number;

  @ManyToOne(() => Books, book => book.id, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  book: Books;

  @ManyToOne(() => Chapters, chapter => chapter.id, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  chapter: Chapters;

  @ManyToOne(() => User, user => user.id, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  user: User;

  @OneToMany(() => ChapterWithVersion, chapterWithVersion => chapterWithVersion.book, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  chapterWithVersions: ChapterWithVersion[];

  @RelationId((booksChaptersUser: BooksChaptersUser) => booksChaptersUser.book)
  bookId: number;

  @RelationId((booksChaptersUser: BooksChaptersUser) => booksChaptersUser.chapter)
  chapterId: number;

  @RelationId((booksChaptersUser: BooksChaptersUser) => booksChaptersUser.user)
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}