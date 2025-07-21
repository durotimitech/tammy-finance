import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical } from "lucide-react";

interface Transaction {
  id: string;
  name: string;
  avatar: string;
  amount: string;
  date: string;
  type: "Payment" | "Transfer";
  status: "Success" | "Pending";
}

const transactions: Transaction[] = [
  {
    id: "1",
    name: "Caskia Subscription",
    avatar: "/api/placeholder/32/32",
    amount: "$289.00",
    date: "23-08-2023",
    type: "Payment",
    status: "Success",
  },
  {
    id: "2",
    name: "Dr. Bobby Smith",
    avatar: "/api/placeholder/32/32",
    amount: "$2,000.00",
    date: "23-08-2023",
    type: "Transfer",
    status: "Success",
  },
  {
    id: "3",
    name: "Keena Brown",
    avatar: "/api/placeholder/32/32",
    amount: "$1,095.00",
    date: "22-08-2023",
    type: "Transfer",
    status: "Pending",
  },
];

export default function TransactionHistory() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Transaction History</h2>
        <button className="text-gray-600 hover:text-gray-800">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-3 text-xs font-medium text-gray-700">Name</th>
              <th className="pb-3 text-xs font-medium text-gray-700">Amount</th>
              <th className="pb-3 text-xs font-medium text-gray-700">Date</th>
              <th className="pb-3 text-xs font-medium text-gray-700">Type</th>
              <th className="pb-3 text-xs font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-b last:border-b-0">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={transaction.avatar} alt={transaction.name} />
                      <AvatarFallback>
                        {transaction.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{transaction.name}</span>
                  </div>
                </td>
                <td className="py-4">
                  <span className="text-sm font-medium">{transaction.amount}</span>
                </td>
                <td className="py-4">
                  <span className="text-sm text-gray-700">{transaction.date}</span>
                </td>
                <td className="py-4">
                  <span className="text-sm">{transaction.type}</span>
                </td>
                <td className="py-4">
                  <Badge
                    variant={transaction.status === "Success" ? "success" : "warning"}
                    className="text-xs"
                  >
                    {transaction.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}