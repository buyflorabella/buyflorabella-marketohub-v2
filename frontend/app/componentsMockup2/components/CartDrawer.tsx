import { Suspense } from 'react';
import { X, Plus, Minus, ShoppingBag, RefreshCw } from 'lucide-react'; // PnT: Added RefreshCw for subscription icon
import { Link, useRouteLoaderData, Await } from 'react-router';
import { CartForm, Image, Money } from '@shopify/hydrogen';
import type { CartLine, Cart } from '@shopify/hydrogen/storefront-api-types';
import type { loader } from '~/root';
import { useCart } from '../contexts/CartContext';

export default function CartDrawer() {
  const { isCartOpen, closeCart } = useCart();
  const rootData = useRouteLoaderData<typeof loader>('root');
  
  // Since you're using defer in your loader, this is a promise.
  const cartPromise = rootData?.cart;

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={closeCart}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0a0015] z-50 shadow-2xl overflow-hidden flex flex-col border-l border-white/10">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Shopping Cart
          </h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 hover:rotate-90"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Resolve the deferred cart promise */}
        <Suspense fallback={<CartLoadingSkeleton />}>
          <Await resolve={cartPromise}>
            {(resolvedCart) => (
              <CartContent 
                cart={resolvedCart as Cart} 
                closeCart={closeCart} 
              />
            )}
          </Await>
        </Suspense>
      </div>
    </>
  );
}

function CartContent({ cart, closeCart }: { cart: Cart | null; closeCart: () => void }) {
  const lines = cart?.lines?.nodes ?? [];
  const totalQuantity = cart?.totalQuantity ?? 0;

  // PnT: DEBUG - Log cart lines to inspect subscription data
  // console.log('[CART DEBUG]', {
  //   totalQuantity,
  //   lines: lines.map((line: any) => ({
  //     id: line.id,
  //     productTitle: line.merchandise?.product?.title,
  //     quantity: line.quantity,
  //     hasSubscription: !!(line as any).sellingPlanAllocation,
  //     sellingPlanName: (line as any).sellingPlanAllocation?.sellingPlan?.name,
  //   })),
  // });

  // DxB Helper function to point to subdomain
  const getCheckoutUrl = (checkoutUrl: string) => {
    if (!checkoutUrl) return '';
    
    // Replace buyflorabella.com with checkout.buyflorabella.com
    return checkoutUrl.replace(
      'buyflorabella.com',
      'checkout.buyflorabella.com'
    );
  };  

  if (lines.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <ShoppingBag className="w-12 h-12 text-white/30" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Your cart is empty</h3>
        <p className="text-white/50 text-center mb-6">
          Add some products to get started!
        </p>
        <Link
          to="/shop"
          onClick={closeCart}
          className="px-6 py-3 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {lines.map((line) => (
          <div
            key={line.id}
            className="glass border border-white/10 rounded-xl p-4 flex gap-4"
          >
            {line.merchandise.image && (
              <Image
                data={line.merchandise.image}
                width={80}
                height={80}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">
                {line.merchandise.product.title}
              </h3>
              {line.merchandise.title !== 'Default Title' && (
                <p className="text-sm text-white/50 mb-2">
                  {line.merchandise.title}
                </p>
              )}

              {/* PnT: Subscription indicator badge */}
              {(line as any).sellingPlanAllocation && (
                <div className="flex items-center gap-1.5 mb-2">
                  <RefreshCw className="w-3.5 h-3.5 text-[#7cb342]" />
                  <span className="text-xs text-[#7cb342] font-medium">
                    {(line as any).sellingPlanAllocation.sellingPlan?.name || 'Subscription'}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CartLineQuantityAdjust line={line as CartLine} action="decrease" />
                  <span className="text-white font-medium w-8 text-center">
                    {line.quantity}
                  </span>
                  <CartLineQuantityAdjust line={line as CartLine} action="increase" />
                </div>

                <div className="text-right">
                  <div className="text-white font-bold">
                    <Money data={line.cost.totalAmount} />
                  </div>
                  <CartLineRemoveButton lineId={line.id} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-white/70">Subtotal ({totalQuantity})</span>
          <span className="text-2xl font-bold text-white">
            {cart?.cost?.subtotalAmount && (
              <Money data={cart.cost.subtotalAmount} />
            )}
          </span>
        </div>
        <p className="text-sm text-white/50 text-center">
          Shipping and taxes calculated at checkout
        </p>
        
        <a
          href={getCheckoutUrl(cart.checkoutUrl)}
          className="block w-full py-4 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 text-center"
        >
          Proceed to Checkout
        </a>
        
        <button
          onClick={closeCart}
          className="w-full py-3 border border-white/20 hover:bg-white/5 text-white rounded-xl font-semibold transition-all duration-300"
        >
          Continue Shopping
        </button>
      </div>
    </>
  );
}

function CartLineQuantityAdjust({
  line,
  action,
}: {
  line: CartLine;
  action: 'increase' | 'decrease';
}) {
  const nextQuantity = action === 'increase' ? line.quantity + 1 : line.quantity - 1;

  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{ lines: [{ id: line.id, quantity: nextQuantity }] }}
    >
      <button
        type="submit"
        disabled={action === 'decrease' && line.quantity <= 1}
        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-30"
      >
        {action === 'increase' ? <Plus size={16} /> : <Minus size={16} />}
      </button>
    </CartForm>
  );
}

function CartLineRemoveButton({ lineId }: { lineId: string }) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{ lineIds: [lineId] }}
    >
      <button
        type="submit"
        className="text-xs text-white/50 hover:text-red-400 transition-colors"
      >
        Remove
      </button>
    </CartForm>
  );
}

function CartLoadingSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}