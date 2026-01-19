'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your purchase. You will receive a confirmation email shortly.
          </p>

          <div className="border rounded-lg p-8 bg-muted/50 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                <p className="font-mono font-bold">{params.id?.substring(0, 12)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                <p className="font-semibold">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <p className="font-semibold text-green-600">Confirmed</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-bold">What's Next?</h2>
            <ul className="text-left max-w-md mx-auto space-y-2 text-muted-foreground">
              <li>✓ You'll receive a confirmation email</li>
              <li>✓ Track your order in your account</li>
              <li>✓ Expected delivery in 5-7 business days</li>
              <li>✓ Free returns within 30 days</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Link href="/orders" className="flex-1">
              <Button className="w-full">View My Orders</Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
