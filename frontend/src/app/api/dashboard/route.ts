import { NextResponse } from "next/server";
import {
  getOrderStats,
  getRevenueChart,
  getServiceBreakdown,
  getBranchPerformance,
  listOrders,
} from "@/db/repositories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [stats, revenueChart, serviceBreakdown, branches, recentOrders] =
      await Promise.all([
        getOrderStats(),
        getRevenueChart(7),
        getServiceBreakdown(),
        getBranchPerformance(),
        listOrders({ limit: 6 }),
      ]);

    return NextResponse.json({
      stats,
      revenueChart,
      serviceBreakdown,
      branches,
      recentOrders,
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
