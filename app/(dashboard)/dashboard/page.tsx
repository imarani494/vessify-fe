"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSession, signOut } from "@/lib/auth-client";
import Loading from "./loading";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: string | number;
  balance: string | number | null;
  confidence: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [text, setText] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (cursor?: string) => {
    const url = new URL("/api/transactions", API_URL);
    if (cursor) url.searchParams.set("cursor", cursor);

    const res = await fetch(url.toString(), { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch transactions");

    const body = (await res.json()) as {
      data: Transaction[];
      nextCursor: string | null;
    };

    return body;
  }, []);

  // Load initial transactions once session is ready
  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.push("/login");
      return;
    }

    fetchTransactions()
      .then(({ data, nextCursor }) => {
        setTransactions(data);
        setNextCursor(nextCursor);
      })
      .catch(() => setError("Failed to load transactions"));
  }, [session, isPending, router, fetchTransactions]);

  const handleParseAndSave = async () => {
    if (!text.trim()) return;
    setExtracting(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/transactions/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text }),
      });

      const body = (await res.json()) as { success: boolean; data?: Transaction; message?: string };

      if (!res.ok || !body.success) {
        setError(body.message ?? "Extraction failed");
        return;
      }

      setText("");
      // Refresh from top
      const fresh = await fetchTransactions();
      setTransactions(fresh.data);
      setNextCursor(fresh.nextCursor);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setExtracting(false);
    }
  };

  const handleLoadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);

    try {
      const { data, nextCursor: nc } = await fetchTransactions(nextCursor);
      setTransactions((prev) => [...prev, ...data]);
      setNextCursor(nc);
    } catch {
      setError("Failed to load more transactions");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const totalDebits = transactions
    .filter((t) => Number(t.amount) < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  const avgConfidence =
    transactions.length > 0
      ? Math.round(
          (transactions.reduce((sum, t) => sum + t.confidence, 0) /
            transactions.length) *
            100
        )
      : 0;

  if (isPending) {
    return <Loading/>
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {/* Welcome */}
        <section className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Welcome Back 👋</h2>
            <p className="mt-2 text-muted-foreground">
              Extract, store, and manage your financial transactions securely.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Total Transactions</CardDescription>
              <CardTitle className="text-3xl">{transactions.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Total Debits</CardDescription>
              <CardTitle className="text-3xl">
                ₹{totalDebits.toLocaleString("en-IN")}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Average Confidence</CardDescription>
              <CardTitle className="text-3xl">{avgConfidence}%</CardTitle>
            </CardHeader>
          </Card>
        </section>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-md">
            {error}
          </p>
        )}

        {/* Extract Form */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Extractor</CardTitle>
            <CardDescription>
              Paste raw bank statement text and extract structured transaction
              data.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Textarea
              placeholder={`Example:\n\nDate: 11 Dec 2025\nDescription: STARBUCKS COFFEE MUMBAI\nAmount: -420.00\nBalance after transaction: 18,420.50`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px]"
            />

            <Button
              onClick={handleParseAndSave}
              size="lg"
              disabled={extracting || !text.trim()}
            >
              {extracting ? "Extracting..." : "Parse & Save"}
            </Button>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              View your extracted transaction history.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h3 className="text-lg font-semibold">No Transactions Found</h3>
                <p className="mt-2 text-muted-foreground">
                  Paste a transaction above to get started.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Confidence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {new Date(transaction.date).toLocaleDateString(
                              "en-IN"
                            )}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell
                            className={
                              Number(transaction.amount) < 0
                                ? "text-red-600"
                                : "text-green-600"
                            }
                          >
                            ₹{Math.abs(Number(transaction.amount)).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            {transaction.balance != null
                              ? `₹${Number(transaction.balance).toLocaleString("en-IN")}`
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge>{Math.round(transaction.confidence * 100)}%</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {nextCursor && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
