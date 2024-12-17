import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { getModelToken } from '@nestjs/sequelize';
import { Transaction } from './transaction.model';
import { Account } from './account.model';
import { Sequelize } from 'sequelize-typescript';

const mockTransactionModel = {
  create: jest.fn(),
};

const mockAccountModel = {
  findByPk: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockSequelize = {
  transaction: jest.fn((callback) => callback({})),
};

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: getModelToken(Transaction), useValue: mockTransactionModel },
        { provide: getModelToken(Account), useValue: mockAccountModel },
        { provide: Sequelize, useValue: mockSequelize },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clears all mock interactions and calls
  });

  it('should create an account if it does not exist and process transactions', async () => {
    const transactions = [
      { accountId: 1, amount: 100 },
      { accountId: 1, amount: -50 },
      { accountId: 2, amount: 200 },
    ];

    mockAccountModel.findByPk.mockResolvedValueOnce(null);
    mockAccountModel.create.mockResolvedValueOnce({ id: 1, balance: 0, save: jest.fn() });
    mockTransactionModel.create.mockResolvedValueOnce({ status: 'Success' });

    const result = await service.processBulkTransactions(transactions);

    expect(mockAccountModel.findByPk).toHaveBeenCalledTimes(2);
    expect(mockAccountModel.create).toHaveBeenCalledTimes(2);
    expect(mockTransactionModel.create).toHaveBeenCalledTimes(3);
    expect(result).toHaveLength(3);
  });

  it('should update existing account balance and process transactions', async () => {
    const transactions = [
      { accountId: 1, amount: 50 },
      { accountId: 1, amount: 50 },
    ];

    const mockAccount = { id: 1, balance: 100, save: jest.fn() };
    mockAccountModel.findByPk.mockResolvedValue(mockAccount);
    mockTransactionModel.create.mockResolvedValue({ status: 'Success' });

    const result = await service.processBulkTransactions(transactions);

    expect(mockAccountModel.findByPk).toHaveBeenCalledTimes(1);
    expect(mockAccount.save).toHaveBeenCalled();
    expect(mockTransactionModel.create).toHaveBeenCalledTimes(2);
    expect(mockAccount.balance).toBe(200);
    expect(result).toHaveLength(2);
  });
});