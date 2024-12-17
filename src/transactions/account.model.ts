import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({
  timestamps: true
})
export class Account extends Model<Account> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  })
  balance: number;
}
