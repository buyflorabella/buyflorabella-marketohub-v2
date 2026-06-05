import { Package, MapPin, Settings, LogOut, Heart } from 'lucide-react';
import { Link, useLoaderData, type LoaderFunctionArgs } from 'react-router-dom';
import AnnouncementBar from '../componentsMockup2/components/AnnouncementBar'
import { useCart } from '~/componentsMockup2/contexts/CartContext';
import { CartForm } from '@shopify/hydrogen';
import { useState } from 'react';


const CUSTOMER_DETAILS_QUERY = `#graphql
  query CustomerDetails($language: LanguageCode) @inContext(language: $language) {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      addresses(first: 10) {
        nodes {
          name
          address1
          city
          province
          zip
          country
        }
      }
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

export async function loader({ context }: LoaderFunctionArgs) {
  console.log("DxB - LOADER account.tsx +++++++++++++++++++++++++++++++++++++++");
  const { customerAccount } = context;

  const { data, errors } = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    console.error('Customer loader error:', errors);
    throw new Error('Customer not found');
  }

  return { customer: data.customer };
}

const OrderDetails = ({order}) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const { openCart } = useCart();

  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

  return (
    <div key={order.id} className="glass border border-white/10 rounded-2xl p-6">
    <span>DxB here</span>
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
  );
}

export default function AccountPage() {
  const { customer } = useLoaderData<typeof loader>();
  const { firstName } = customer;
  const orders = customer.orders.nodes;
  const addresses = customer.addresses.nodes;

  return (
    <>
      <AnnouncementBar />
      <div className="min-h-screen bg-gradient-to-b from-[#0a0015] to-[#1a1a2e] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">My Account</h1>
          <p className="text-white/70">Welcome back {firstName ? `, ${firstName}` : ''}!</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="glass border border-white/10 rounded-2xl p-6">
            <nav className="space-y-2">
              <a href="#orders" className="flex items-center gap-3 px-4 py-3 bg-[#7cb342]/20 text-[#7cb342] rounded-xl font-semibold">
                <Package className="w-5 h-5" />
                Orders
              </a>
              <a href="#addresses" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-white/70 hover:text-white rounded-xl transition-colors">
                <MapPin className="w-5 h-5" />
                Addresses
              </a>
              <a href="#wishlist" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-white/70 hover:text-white rounded-xl transition-colors">
                <Heart className="w-5 h-5" />
                Wishlist
              </a>
              <a href="#settings" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-white/70 hover:text-white rounded-xl transition-colors">
                <Settings className="w-5 h-5" />
                Settings
              </a>
              <Link to="/account/logout" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-white/70 hover:text-white rounded-xl transition-colors">
                <LogOut className="w-5 h-5" />
                Sign Out (DxB - @)
              </Link>
            </nav>
          </div>
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Recent Orders</h2>
              <div className="space-y-4">
                {orders.map((order) => <OrderDetails key={order.id} order={order} />)}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Active Subscriptions</h2>
              <div className="glass border border-white/10 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Essential Mineral Complex</h3>
                    <p className="text-white/70 text-sm">Next delivery: Feb 15, 2026</p>
                    <p className="text-white/50 text-sm">Every 30 days</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">$75.65</div>
                    <p className="text-[#7cb342] text-sm font-semibold">15% savings</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-[#7cb342] hover:bg-[#8bc34a] text-white rounded-lg font-semibold transition-colors">
                    Manage
                  </button>
                  <button className="px-4 py-2 border border-white/20 hover:bg-white/5 text-white rounded-lg font-semibold transition-colors">
                    Skip Next
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Saved Addresses</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {addresses.map((address) => {
                  return (
                    <div key={address.id} className="glass border border-white/10 rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-white">Home</h3>
                      <span className="text-xs text-[#7cb342] bg-[#7cb342]/20 px-2 py-1 rounded-full">Default</span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {address.name}<br />
                      {address.address1}<br />
                      {address.city}, {address.province} {address.zip}<br />
                      {address.country}
                    </p>
                    <button className="mt-4 text-[#7cb342] hover:underline text-sm font-semibold">
                      Edit
                    </button>
                  </div>
                  );
                })}
                <button className="glass border-2 border-dashed border-white/20 rounded-2xl p-6 hover:border-[#7cb342]/50 hover:bg-white/5 transition-all text-white/50 hover:text-white flex items-center justify-center min-h-[160px]">
                  + Add New Address
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
