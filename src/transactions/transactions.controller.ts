import { Controller, Post, Body } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionDto } from './transaction.dto';

@Controller('bulk-transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Endpoint to process a list of bulk transactions.
   * 
   * @param {CreateTransactionDto[]} transactions - The list of transactions to process.
   * @returns {Promise<any[]>} - The processed transactions.
   */
  @Post()
  async processBulkTransactions(@Body() transactions: TransactionDto[]) {
    return await this.transactionsService.processBulkTransactions(transactions);
  }
}
