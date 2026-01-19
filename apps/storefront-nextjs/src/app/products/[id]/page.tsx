'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

interface ProductDetail {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  variants?: Array<{ name: string; value: string }>;
}

export default function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const apiGateway = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';
      const res = await axios.get(`${apiGateway}/products/${params.id}`);
      setProduct(res.data?.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    for (let i = 0; i < quantity; i++) {
      cart.push(params.id);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="text-center py-16">Loading product...</div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="text-center py-16">Product not found</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Image */}
            <div>
              <div className="bg-muted h-96 flex items-center justify-center rounded-lg">
                <span className="text-muted-foreground">Product Image</span>
              </div>
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">(125 reviews)</span>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">${product.price.toFixed(2)}</span>
                <p className="text-sm text-muted-foreground mt-2">Inclusive of all taxes</p>
              </div>

              <p className="text-muted-foreground mb-6">{product.description}</p>

              <div className="space-y-4">
                {product.variants && product.variants.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Available Options</h3>
                    <div className="flex gap-2">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.value}
                          className="px-4 py-2 border rounded-md hover:border-primary transition-colors"
                        >
                          {variant.value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Quantity</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 border rounded-md"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 border rounded-md">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-2 border rounded-md"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="lg">
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Stock:</span>{' '}
                    <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                      {product.stock > 0 ? `${product.stock} Available` : 'Out of Stock'}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">Category:</span> {product.category}
                  </p>
                  <p>
                    <span className="font-semibold">SKU:</span> {product.id?.substring(0, 8)}
                  </p>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
                  <p>✓ Free shipping on orders over $50</p>
                  <p>✓ 30-day money back guarantee</p>
                  <p>✓ Secure & encrypted payments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
