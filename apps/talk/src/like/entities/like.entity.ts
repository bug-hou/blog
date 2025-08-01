import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId, UpdateDateColumn } from "typeorm";
import { User } from "apps/password/src/user/entities/user.entity";

@Entity("talk-like")
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index()
  @Column({
    type: "varchar"
  })
  talkId: string;

  @Index()
  @Column({
    type: "int",
    comment: "0-unlike,1-like"
  })
  status: number;

  @Index()
  @Column({
    type: "int"
  })
  @RelationId((like: Like) => like.user)
  userId: number;

  @JoinColumn({
    name: "userId"
  })
  @ManyToOne(() => User, {
    onDelete: "CASCADE"
  })
  user: User;
}
