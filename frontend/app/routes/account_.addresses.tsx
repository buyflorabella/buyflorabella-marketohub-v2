import { ArrowLeft } from "lucide-react";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";

const CUSTOMER_ADRESSES_QUERY = `#graphql
  query CustomerAdresses($language: LanguageCode) @inContext(language: $language) {
    customer {
      addresses(first: 10) {
        nodes {
          id
          name
          address1
          city
          province
          zip
          country
        }
      }
    }
  }
`;

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { customerAccount } = context;

  const { data, errors } = await customerAccount.query(CUSTOMER_ADRESSES_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    console.error(errors);
    throw new Error('Customer not found');
  }

  console.info(data.customer.addresses.nodes)

  return { addresses: data.customer.addresses.nodes };
}


const Adresses = () => {
    const {addresses} = useLoaderData();

    return <div className="lg:col-span-3 space-y-8 mt-30 mx-10 px-10">
        <Link to="/account" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#7cb342] mt-8 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Saved Addresses</h2>
            <div className="grid md:grid-cols-2 gap-4">
                {addresses.map((address) => {
                return <div key={address.id} className="glass border border-white/10 rounded-2xl p-6">
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
            })}
            <button className="glass border-2 border-dashed border-white/20 rounded-2xl p-6 hover:border-[#7cb342]/50 hover:bg-white/5 transition-all text-white/50 hover:text-white flex items-center justify-center min-h-[160px]">
                + Add New Address
            </button>
            </div>
        </div>
    </div>
}

export default Adresses;