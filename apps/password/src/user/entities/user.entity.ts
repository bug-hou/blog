import { ApiProperty } from "@nestjs/swagger";
import { Books, BooksChaptersUser } from "apps/books/src/entities/book.entity";
import { Favorite } from "apps/books/src/favorite/entities/favorite.entity";
import { Like } from "apps/books/src/like/entities/like.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("increment")
  @ApiProperty({
    example: "1",
    description: "User ID",
  })
  id: string;

  @Column({
    type: "enum",
    enum: ["admin", "manager", "common", "vip"],
    default: "common",
    comment: "用户角色",
  })
  role: string;

  @Column({
    type: "varchar",
    default: "https://example.com/avatar.jpg",
    comment: "用户头像URL",
  })
  @ApiProperty({
    example: "https://example.com/avatar.jpg",
    description: "URL of the user's avatar",
  })
  avatar: string;

  @Column({
    type: "varchar",
  })
  @ApiProperty({
    example: "john_doe",
    description: "Username of the user",
  })
  username: string;

  @Column({
    type: "varchar",
    unique: true,
  })
  @ApiProperty({
    example: "john@example.com",
    description: "Email address of the user",
  })
  email: string;

  @Column({
    type: "varchar",
    select: false,
  })
  @ApiProperty({
    example: "password123",
    description: "Hashed password of the user",
  })
  password: string;

  @Column({
    type: "boolean",
    default: true,
  })
  @ApiProperty({
    example: true,
    default: false,
    description: "Whether the user is active",
  })
  isActive: boolean;

  @Column({
    type: "enum",
    enum: ["0", "1", '2'],
    default: "0",
  })
  @ApiProperty({
    example: "0",
    description: "status: 0-unverified, 1-verified, 2-banned",
    enum: ["0", "1", "2"],
  })
  status: string;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  @ApiProperty({
    example: "2024-06-01T12:00:00.000Z",
    description: "Creation timestamp",
  })
  createdAt: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  @ApiProperty({
    example: "2024-06-01T12:00:00.000Z",
    description: "Last update timestamp",
  })
  updatedAt: Date;

  @OneToMany(() => Like, like => like.user)
  likes: Like[];

  @OneToMany(() => Favorite, favorite => favorite.user)
  favorites: Favorite[];

  @JoinTable({
    name: "buy_books",
  })
  @ManyToMany(() => Books, book => book.users)
  books: Books[];

  @OneToMany(() => BooksChaptersUser, chapterUser => chapterUser.chapter)
  chapterUsers: BooksChaptersUser[];
}

