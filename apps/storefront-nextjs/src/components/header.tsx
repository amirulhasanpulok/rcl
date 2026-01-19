import Link from 'next/link';
import { ShoppingCart, Heart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="border-b bg-background">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          Store
        </Link>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <input
              type="search"
              placeholder="Search products..."
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute right-3 top-2.5 w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/favorites">
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="outline" size="sm">
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      </nav>

      <div className="border-t bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 py-2 flex gap-8">
          <Link href="/?category=electronics" className="text-sm hover:text-primary">
            Electronics
          </Link>
          <Link href="/?category=clothing" className="text-sm hover:text-primary">
            Clothing
          </Link>
          <Link href="/?category=home" className="text-sm hover:text-primary">
            Home & Garden
          </Link>
          <Link href="/?category=sports" className="text-sm hover:text-primary">
            Sports
          </Link>
          <Link href="/?category=books" className="text-sm hover:text-primary">
            Books
          </Link>
        </div>
      </div>
    </header>
  );
}
