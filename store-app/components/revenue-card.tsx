"use client";

import { useState } from "react";
import { ArrowUpRight, X, Receipt } from "lucide-react";
import type { KPI } from "@/lib/types";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const chartData = [
  { name: "Coffee", value: 120, color: "#10b981" },
  { name: "Pastries", value: 80, color: "#3b82f6" },
  { name: "Mains", value: 124, color: "#6366f1" },
];

const mockTransactions = [
  { id: 1, time: "12:45", items: "Cappuccino + Pastry", amount: "€8.30", type: "Walk-in push" },
  { id: 2, time: "12:30", items: "Lunch Menu", amount: "€14.50", type: "Quiet period promo" },
  { id: 3, time: "11:15", items: "Hot Chocolate", amount: "€3.20", type: "Weather alert" },
  { id: 4, time: "10:50", items: "Apfelstrudel bundle", amount: "€9.00", type: "Returning customer" },
  { id: 5, time: "10:20", items: "Käsespätzle", amount: "€12.90", type: "Lunch preview" },
];

export default function RevenueCard(props: KPI) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="rounded-xl border border-ink-200 bg-white p-5 text-left hover:border-ink-300 transition group flex justify-between items-center"
      >
        <div>
          <div className="text-xs text-ink-500">{props.label}</div>
          <div className="mt-2 flex flex-col items-start gap-1">
            <div className="text-2xl font-semibold tracking-tight">{props.value}</div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium border rounded-full px-2 py-0.5 text-emerald-600 bg-emerald-50 border-emerald-200">
              <ArrowUpRight className="size-3" />
              {props.change}
            </span>
          </div>
        </div>
        
        <div className="w-16 h-16 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={18}
                outerRadius={30}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-ink-100 animate-in fade-in zoom-in-95 duration-200" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Receipt className="size-5 text-ink-500" />
                  Recent Transactions
                </h3>
                <p className="text-xs text-ink-500 mt-1">Breakdown of today's {props.value} AI revenue</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-ink-400 hover:text-ink-600 bg-ink-50 p-1.5 rounded-full">
                <span className="sr-only">Close</span>
                <X className="size-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {mockTransactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl border border-ink-100 hover:border-ink-200 transition bg-ink-50/50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-ink-900 truncate">{tx.items}</span>
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5 flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400"></span>
                      {tx.type} · {tx.time}
                    </div>
                  </div>
                  <div className="font-semibold text-ink-900 ml-4 shrink-0">
                    {tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}