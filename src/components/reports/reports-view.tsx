"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon3D } from "@/components/ui/icon3d";
import {
  Chart3D,
  Receipt3D,
  Diamond3D,
  Trophy3D,
  Bolt3D,
  Money3D,
} from "@/components/ui/laundry-icons";
import { ReportsCharts } from "./reports-charts";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { exportToCSV, printPDF, formatTableHTML } from "@/lib/export";
import { Download, FileSpreadsheet, FileText, TrendingDown, TrendingUp } from "lucide-react";
import { statusLabels, type OrderStatus } from "@/lib/dummy-data";

const periods = [
  { id: "today", label: "Hari Ini" },
  { id: "7d", label: "7 Hari" },
  { id: "30d", label: "30 Hari" },
  { id: "month", label: "Bulan Ini" },
  { id: "all", label: "Semua" },
];

interface ReportOrder {
  id: string;
  invoice: string;
  status: string;
  total: number;
  customerName: string | null;
  customerPhone: string | null;
  service: string;
  createdAt: Date;
}

interface PnLData {
  revenue: number;
  revenueCount: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  opex: number;
  netProfit: number;
  netMargin: number;
  expensesByCategory: { name: string; color: string; total: number }[];
  revenueByService: { name: string; total: number; count: number }[];
}

export function ReportsView({
  stats,
  breakdown,
  orders,
  pnl: initialPnL,
}: {
  stats: { ordersToday: number; revenueToday: number };
  breakdown: { name: string; value: number; color: string }[];
  orders: ReportOrder[];
  pnl: PnLData;
}) {
  const toast = useToast();
  const [period, setPeriod] = useState("month");
  const [pnl, setPnl] = useState(initialPnL);
  const [loadingPnl, setLoadingPnl] = useState(false);

  const periodDates = useMemo(() => {
    const now = new Date();
    let start = new Date(0);
    let end = now;
    if (period === "today") {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
    } else if (period === "7d") {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "30d") {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    return { start, end };
  }, [period]);

  // Re-fetch P&L when period changes
  useEffect(() => {
    setLoadingPnl(true);
    fetch(
      `/api/reports/pnl?start=${periodDates.start.toISOString()}&end=${periodDates.end.toISOString()}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.revenue !== undefined) setPnl(data);
      })
      .catch(() => toast.error("Gagal memuat P&L"))
      .finally(() => setLoadingPnl(false));
  }, [period]);

  // Filter orders by period
  const filtered = useMemo(() => {
    return orders.filter((o) => new Date(o.createdAt) >= periodDates.start);
  }, [orders, periodDates.start]);

  const aov = pnl.revenueCount ? Math.round(pnl.revenue / pnl.revenueCount) : 0;

  const periodLabel = periods.find((p) => p.id === period)?.label ?? "Bulan Ini";

  // Monthly trend (mock distribution - bisa diganti dengan real data nanti)
  const monthlyTrend = [
    {
      month: "Jan",
      revenue: Math.round(pnl.revenue * 0.6),
      profit: Math.round(pnl.netProfit * 0.6),
    },
    {
      month: "Feb",
      revenue: Math.round(pnl.revenue * 0.7),
      profit: Math.round(pnl.netProfit * 0.7),
    },
    {
      month: "Mar",
      revenue: Math.round(pnl.revenue * 0.8),
      profit: Math.round(pnl.netProfit * 0.8),
    },
    {
      month: "Apr",
      revenue: Math.round(pnl.revenue * 0.9),
      profit: Math.round(pnl.netProfit * 0.9),
    },
    { month: "Mei", revenue: pnl.revenue, profit: pnl.netProfit },
  ];

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.warning("Tidak ada data");
      return;
    }
    exportToCSV(
      filtered.map((o) => ({
        Invoice: o.invoice,
        Date: formatDateTime(o.createdAt),
        Customer: o.customerName ?? "",
        Phone: o.customerPhone ?? "",
        Service: o.service,
        Status: statusLabels[o.status as OrderStatus] ?? o.status,
        Total: o.total,
      })),
      `report-${period}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast.success("Export CSV berhasil");
  };

  const handleExportPnL = () => {
    const html = `
      <div class="header">
        <h1>Laporan Laba Rugi (P&L)</h1>
        <div class="meta">
          Periode: ${periodLabel} · Generated: ${new Date().toLocaleString("id-ID")}
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-label">Revenue</div>
          <div class="stat-value">${formatCurrency(pnl.revenue)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Gross Profit</div>
          <div class="stat-value">${formatCurrency(pnl.grossProfit)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Net Profit</div>
          <div class="stat-value">${formatCurrency(pnl.netProfit)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Net Margin</div>
          <div class="stat-value">${pnl.netMargin.toFixed(1)}%</div>
        </div>
      </div>

      <h2>Income Statement</h2>
      <table>
        <tr><td><strong>Revenue (Pendapatan)</strong></td><td style="text-align:right">${formatCurrency(pnl.revenue)}</td></tr>
        <tr><td>COGS (Cost of Goods Sold)</td><td style="text-align:right">(${formatCurrency(pnl.cogs)})</td></tr>
        <tr style="border-top:1px solid #000"><td><strong>Gross Profit</strong></td><td style="text-align:right"><strong>${formatCurrency(pnl.grossProfit)}</strong></td></tr>
        <tr><td colspan="2" style="font-size:10px;color:#64748b;padding-left:20px">Gross Margin: ${pnl.grossMargin.toFixed(1)}%</td></tr>
        <tr><td>Operating Expenses</td><td style="text-align:right">(${formatCurrency(pnl.opex)})</td></tr>
        <tr style="border-top:2px solid #000"><td><strong>Net Profit</strong></td><td style="text-align:right"><strong>${formatCurrency(pnl.netProfit)}</strong></td></tr>
        <tr><td colspan="2" style="font-size:10px;color:#64748b;padding-left:20px">Net Margin: ${pnl.netMargin.toFixed(1)}%</td></tr>
      </table>

      <h2>Operating Expenses Breakdown</h2>
      ${formatTableHTML(pnl.expensesByCategory, [
        { key: "name", label: "Kategori" },
        { key: "total", label: "Nominal", format: (v) => formatCurrency(Number(v)) },
      ])}

      <h2>Revenue by Service</h2>
      ${formatTableHTML(pnl.revenueByService, [
        { key: "name", label: "Layanan" },
        { key: "count", label: "Order" },
        { key: "total", label: "Revenue", format: (v) => formatCurrency(Number(v)) },
      ])}
    `;
    printPDF(html, `Laporan PnL ${periodLabel}`);
    toast.success("Print dialog terbuka", "Pilih Save as PDF");
  };

  return (
    <>
      {/* P&L Header Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 bg-gradient-to-br from-emerald-500 to-green-600 text-white relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative">
            <div className="text-[10px] sm:text-xs uppercase tracking-wide opacity-80">
              Revenue {periodLabel}
            </div>
            <div className="text-xl sm:text-3xl font-bold mt-1 truncate">
              {formatCurrency(pnl.revenue)}
            </div>
            <div className="text-[11px] mt-2 opacity-90">{pnl.revenueCount} order</div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
              Gross Profit
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 truncate">
              {formatCurrency(pnl.grossProfit)}
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-1">
              Margin {pnl.grossMargin.toFixed(1)}%
            </div>
          </div>
          <Icon3D variant="cyan" size="lg">
            <Chart3D className="w-9 h-9" />
          </Icon3D>
        </Card>

        <Card className="p-4 sm:p-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide truncate">
              Operating Expense
            </div>
            <div className="text-xl sm:text-2xl font-bold text-rose-600 mt-1 truncate">
              {formatCurrency(pnl.opex)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {pnl.expensesByCategory.length} kategori
            </div>
          </div>
          <Icon3D variant="red" size="lg">
            <TrendingDown size={24} />
          </Icon3D>
        </Card>

        <Card
          className={`p-4 sm:p-5 flex items-center justify-between gap-2 ${
            pnl.netProfit >= 0
              ? "bg-gradient-to-br from-blue-500 to-primary-600 text-white"
              : "bg-gradient-to-br from-rose-500 to-red-600 text-white"
          }`}
        >
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs uppercase tracking-wide opacity-80">
              {pnl.netProfit >= 0 ? "Net Profit" : "Net Loss"}
            </div>
            <div className="text-xl sm:text-2xl font-bold mt-1 truncate">
              {formatCurrency(Math.abs(pnl.netProfit))}
            </div>
            <div className="text-[11px] mt-1 opacity-90">
              Margin {pnl.netMargin.toFixed(1)}%
            </div>
          </div>
          <div className="text-white">
            {pnl.netProfit >= 0 ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
          </div>
        </Card>
      </div>

      {/* Filter & Export */}
      <Card className="mt-4 sm:mt-5 p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {periods.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              disabled={loadingPnl}
              className={
                period === p.id
                  ? "px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-md shadow-primary-500/30"
                  : "px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:border-primary-200"
              }
            >
              {p.label}
            </button>
          ))}
          {loadingPnl && <span className="text-xs text-slate-400">memuat...</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" type="button" onClick={handleExportPnL}>
            <FileText size={14} /> P&L PDF
          </Button>
          <Button variant="secondary" type="button" onClick={handleExportCSV}>
            <FileSpreadsheet size={14} /> Excel/CSV
          </Button>
        </div>
      </Card>

      {/* Income Statement */}
      <Card className="mt-4 sm:mt-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Money3D className="w-6 h-6" /> Income Statement
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Ringkasan keuangan {periodLabel.toLowerCase()}
          </p>
        </CardHeader>
        <div className="p-4 sm:p-5 pt-0">
          <div className="space-y-2 text-sm">
            <Row label="Revenue (Pendapatan)" value={pnl.revenue} bold />
            <Row label="(−) COGS — Cost of Goods Sold" value={-pnl.cogs} indent />
            <div className="border-t border-slate-200 my-2" />
            <Row
              label="Gross Profit"
              value={pnl.grossProfit}
              bold
              highlight="cyan"
              hint={`Margin ${pnl.grossMargin.toFixed(1)}%`}
            />
            <Row label="(−) Operating Expenses" value={-pnl.opex} indent />
            <div className="border-t-2 border-slate-300 my-2" />
            <Row
              label={pnl.netProfit >= 0 ? "Net Profit" : "Net Loss"}
              value={pnl.netProfit}
              bold
              highlight={pnl.netProfit >= 0 ? "green" : "red"}
              hint={`Margin ${pnl.netMargin.toFixed(1)}%`}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-[10px] text-slate-500 uppercase">Order Lunas</div>
              <div className="font-bold text-slate-900 text-lg mt-0.5">
                {pnl.revenueCount}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-[10px] text-slate-500 uppercase">AOV</div>
              <div className="font-bold text-slate-900 text-lg mt-0.5">
                {formatCurrency(aov)}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-[10px] text-slate-500 uppercase">COGS Ratio</div>
              <div className="font-bold text-slate-900 text-lg mt-0.5">
                {pnl.revenue > 0 ? ((pnl.cogs / pnl.revenue) * 100).toFixed(1) : 0}%
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-[10px] text-slate-500 uppercase">OPEX Ratio</div>
              <div className="font-bold text-slate-900 text-lg mt-0.5">
                {pnl.revenue > 0 ? ((pnl.opex / pnl.revenue) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <ReportsCharts trend={monthlyTrend} breakdown={breakdown} />

      {/* Expense breakdown & Revenue by service */}
      <div className="mt-4 sm:mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Pengeluaran per kategori</p>
          </CardHeader>
          <div className="p-4 sm:p-5 pt-0 space-y-2.5">
            {pnl.expensesByCategory.length === 0 && (
              <div className="text-sm text-slate-400 text-center py-8">
                Belum ada pengeluaran tercatat
              </div>
            )}
            {pnl.expensesByCategory
              .sort((a, b) => b.total - a.total)
              .map((c) => {
                const pct = pnl.opex > 0 ? (c.total / pnl.opex) * 100 : 0;
                return (
                  <div key={c.name} className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: c.color }}
                      />
                      <span className="flex-1 truncate font-medium text-slate-700">
                        {c.name}
                      </span>
                      <span className="font-bold text-rose-600">
                        {formatCurrency(c.total)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: c.color }}
                      />
                    </div>
                  </div>
                );
              })}
            {pnl.opex > 0 && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Total</span>
                <span className="text-sm font-bold text-rose-600">
                  {formatCurrency(pnl.opex)}
                </span>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy3D className="w-6 h-6" /> Revenue by Service
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Top layanan paling profit</p>
          </CardHeader>
          <div className="p-4 sm:p-5 pt-0 space-y-3">
            {pnl.revenueByService.length === 0 && (
              <div className="text-sm text-slate-400 text-center py-8">
                Belum ada layanan terjual
              </div>
            )}
            {pnl.revenueByService
              .sort((a, b) => b.total - a.total)
              .slice(0, 5)
              .map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <Icon3D
                    variant={
                      i === 0 ? "amber" : i === 1 ? "indigo" : i === 2 ? "purple" : "blue"
                    }
                    size="sm"
                  >
                    <span className="text-xs font-bold">{i + 1}</span>
                  </Icon3D>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900 truncate">
                      {s.name}
                    </div>
                    <div className="text-xs text-slate-500">{s.count} order</div>
                  </div>
                  <div className="font-bold text-sm text-emerald-600 whitespace-nowrap">
                    {formatCurrency(s.total)}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  indent,
  bold,
  highlight,
  hint,
}: {
  label: string;
  value: number;
  indent?: boolean;
  bold?: boolean;
  highlight?: "cyan" | "green" | "red";
  hint?: string;
}) {
  const colorClass =
    highlight === "cyan"
      ? "text-cyan-700"
      : highlight === "green"
      ? "text-emerald-600"
      : highlight === "red"
      ? "text-rose-600"
      : "text-slate-900";
  return (
    <div
      className={`flex items-center justify-between ${indent ? "pl-6" : ""} ${
        bold ? "py-1" : ""
      }`}
    >
      <div>
        <span className={bold ? "font-bold text-slate-900" : "text-slate-700"}>{label}</span>
        {hint && <span className="text-[10px] text-slate-500 ml-2">{hint}</span>}
      </div>
      <span
        className={`tabular-nums ${bold ? "font-bold" : "font-medium"} ${colorClass}`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}
