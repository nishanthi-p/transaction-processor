import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({
  timestamps: true
})
export class Transaction extends Model<Transaction> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  accountId: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount: number;

  @Column({
    type: DataType.ENUM('Pending', 'Success', 'Failed'),
    allowNull: false,
    defaultValue: 'Pending',
  })
  status: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  errorMessage: string;
}
