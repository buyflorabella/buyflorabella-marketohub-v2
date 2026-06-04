import {useRouteLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs, Form, useActionData, useNavigation} from 'react-router';
import { User, Save, CheckCircle2, AlertCircle, Settings, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

export async function loader({context}: LoaderFunctionArgs) {
  // Auth check - will redirect to login if not authenticated
  await context.customerAccount.handleAuthStatus();
  return {};
}

export async function action({request, context}: ActionFunctionArgs) {
  const {customerAccount} = context;
  const formData = await request.formData();
  
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;

  // Use the customerAccount client for the mutation
  const {data, errors} = await customerAccount.mutate(CUSTOMER_UPDATE_MUTATION, {
    variables: {
      input: {
        firstName,
        lastName,
      },
    },
  });

  if (errors?.length) {
    return {error: errors[0].message};
  }

  if (data?.customerUpdate?.userErrors?.length) {
    return {error: data.customerUpdate.userErrors[0].message};
  }

  return {success: true, customer: data.customerUpdate.customer};
}

const CUSTOMER_UPDATE_MUTATION = `#graphql
  mutation customerUpdate($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      customer {
        firstName
        lastName
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const AccountSettings = () => {
  const { userData } = useRouteLoaderData('root');
  const actionData = useActionData();
  const navigation = useNavigation();
  const isUpdating = navigation.state === 'submitting';

  return (
    <div className="grid gap-8 px-8 mx-8 mt-30 pb-12">
        {/* Back Link */}
        <Link
          to="/account"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#7cb342] mt-8 mb-4"
        >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>    
      <div className="glass border border-white/10 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-6 h-6 text-[#7cb342]" />
          <h2 className="text-2xl font-semibold text-white">Profile Settings</h2>
        </div>

        <Form method="POST" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/50 ml-1">First Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  name="firstName"
                  defaultValue={userData?.firstName || ''}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#7cb342]/50 transition-colors"
                  placeholder="First name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/50 ml-1">Last Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  name="lastName"
                  defaultValue={userData?.lastName || ''}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#7cb342]/50 transition-colors"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center justify-center gap-2 w-full md:px-8 py-3 bg-[#7cb342] hover:bg-[#8bc34a] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all active:scale-[0.98]"
              >
                {isUpdating ? (
                  <div className="w-5 h-5 text-white border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {actionData?.error && (
            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {actionData.error}
            </div>
          )}

          {actionData?.success && (
            <div className="flex items-center gap-2 p-4 bg-[#7cb342]/10 border border-[#7cb342]/20 rounded-xl text-[#7cb342] text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Profile updated successfully!
            </div>
          )}

          <div className="pt-4">
            <a
              href="https://shopify.com/authentication/account/profile"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full md:w-auto md:px-8 py-3 bg-[#7cb342] hover:bg-[#8bc34a] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              Change Email
            </a>
          </div>
        </Form>
        
      </div>
    </div>
  );
};

export default AccountSettings;