import { CartForm } from "@shopify/hydrogen";
import { ArrowLeft, Package } from "lucide-react";
import { useState } from "react";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { useCart } from "~/componentsMockup2/contexts/CartContext";

const CUSTOMER_ORDERS_QUERY = `#graphql
  query CustomerOrders($language: LanguageCode) @inContext(language: $language) {
    customer {
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 1) {
            nodes {
              image {
                url
              }
              name
              title
              variantId
              quantity
            }
          }
        }
      }
    }
  }
`;

const OrderDetails = ({order}) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const { openCart } = useCart();

  return <div key={order.id} className="glass border border-white/10 rounded-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-white">Order {order.id.split('/').at(-1)}</h3>
            <span className="px-3 py-1 bg-[#7cb342]/20 text-[#7cb342] text-sm rounded-full font-semibold">
              {order.fulfillmentStatus}
            </span>
          </div>
          <p className="text-white/50 text-sm mt-1">{order.processedAt}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{order.totalPrice.currencyCode}{order.totalPrice.amount}</div>
          <p className="text-white/50 text-sm">{order.lineItems.nodes.length} items</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-4 py-2 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-lg font-semibold transition-colors">
          View Order
        </button>
        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.LinesAdd}
          inputs={{
            lines: order.lineItems.nodes.map((item) => {
              return {
                merchandiseId: item.variantId,
                quantity: item.quantity
              }
            })
          }}
        >
          {(fetcher) => (
            <button
              type="submit"
              disabled={fetcher.state !== 'idle'}
              onClick={openCart}
              className="px-4 py-2 border border-white/20 hover:bg-white/5 text-white rounded-lg font-semibold transition-colors">
              Reorder
            </button>
          )}
        </CartForm>
      </div>
      {!!showDetails && <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-white/10">
        <p className="text-white/50 text-xs uppercase tracking-wider font-semibold">Items in this order</p>
        <div className="grid gap-4">
          {order.lineItems.nodes.map((item, index) => (
            <div key={`${item.variantId}-${index}`} className="flex items-center gap-4">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-white/5 border border-white/10">
                {item.image ? (
                  <img
                    src={item.image.url}
                    alt={item.title}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/5">
                    <Package className="w-6 h-6 text-white/20" />
                  </div>
                )}
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#7cb342] text-[10px] font-bold text-white shadow-lg">
                  {item.quantity}
                </span>
              </div>
              <div className="flex flex-1 flex-col">
                <h4 className="text-sm font-medium text-white">{item.title}</h4>
                <p className="text-xs text-white/50">{item.name !== item.title ? item.name : 'Standard'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>}
    </div>
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { customerAccount } = context;

  const { data, errors } = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    console.error(errors);
    throw new Error('Customer not found');
  }

  return { orders: data.customer.orders.nodes };
}

const AccountOrders = () => {
    const { orders } = useLoaderData();

    return <div className='mt-30 p-10 px-20'>
        <Link to="/account" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#7cb342] mt-8 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h2 className="text-2xl font-bold text-white mb-3">Recent Orders</h2>
        <div className="space-y-4">
            {orders.map((order) => <OrderDetails key={order.id} order={order} />)}
        </div>
    </div>
}

export default AccountOrders;