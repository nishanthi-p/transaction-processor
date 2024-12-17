import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from './transaction.model';
import { Account } from './account.model';
import { Sequelize } from 'sequelize-typescript';
import { TransactionDto } from './transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction) private transactionModel: typeof Transaction,
    @InjectModel(Account) private accountModel: typeof Account,
    private sequelize: Sequelize,
  ) {}

  /**
   * Process a list of bulk transactions grouped by accountId in batches.
   * 
   * @param {TransactionDto[]} transactions - The list of transaction data to be processed.
   * @returns {Promise<Transaction[]>} - A list of the processed transactions.
   */
  async processBulkTransactions(transactions: TransactionDto[]) {
    // Group transactions by accountId and calculate net amount
    const groupedTransactions: GroupedTransactions[] = Object.values(
      transactions.reduce((acc, tx) => {
        if (!acc[tx.accountId]) {
          acc[tx.accountId] = { accountId: tx.accountId, totalAmount: 0, transactions: [] };
        }
        acc[tx.accountId].totalAmount += tx.amount;
        acc[tx.accountId].transactions.push(tx);
        return acc;
      }, {})
    );

    // Define batch size
    const BATCH_SIZE = 100;
    const processedTransactions = [];

    for (let i = 0; i < groupedTransactions.length; i += BATCH_SIZE) {
      const batch = groupedTransactions.slice(i, i + BATCH_SIZE);

      await this.sequelize.transaction(async (t) => {
        for (const group of batch) {
          try {
            // Fetch the account
            let account = await this.accountModel.findByPk(group.accountId, { transaction: t });
            if (!account) {
              account = await this.accountModel.create(
                { id: group.accountId, balance: 0.00 },
                { transaction: t }
              );
            }
          
            
            account.balance += group.totalAmount;

            // Mark individual transactions as Successs
            for (const tx of group.transactions) {
              const transaction = await this.transactionModel.create(
                {
                  accountId: tx.accountId,
                  amount: tx.amount,
                  status: 'Success',
                },
                { transaction: t },
              );
              processedTransactions.push(transaction);
            }
          } catch (error) {
            console.log(error);
            // Mark all transactions for this group as Failed
            for (const tx of group.transactions) {
              const transaction = await this.transactionModel.create(
                {
                  accountId: tx.accountId,
                  amount: tx.amount,
                  status: 'Failed',
                  errorMessage: error.message,
                },
                { transaction: t },
              );
              processedTransactions.push(transaction);
            }
          }
        }
      });
    }

    return processedTransactions;
  }
}
