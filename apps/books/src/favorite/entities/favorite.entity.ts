import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, RelationId } from 'typeorm';
import { Books } from '../../entities/book.entity';
import { User } from 'apps/password/src/user/entities/user.entity';

@Entity()
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Books, book => book.id, {
    onDelete: 'CASCADE',
    onUpdate: "CASCADE"
  })
  book: Books;

  @ManyToOne(() => User, user => user.id, {
    onDelete: 'CASCADE',
    onUpdate: "CASCADE"
  })
  user: User;

  @RelationId((favorite: Favorite) => favorite.user)
  userId: number;

  @RelationId((favorite: Favorite) => favorite.book)
  bookId: number;

  @Column({ type: 'int', default: 0 })
  status: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
