interface Transaction {
    accountId: number;
    amount: number;
    date: string;
}
  
interface GroupedTransactions {
    accountId: number;
    totalAmount: number;
    transactions: Transaction[];
}