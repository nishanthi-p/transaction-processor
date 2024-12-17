import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class TransactionDto {
  @IsInt()
  @IsNotEmpty()
  accountId: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
