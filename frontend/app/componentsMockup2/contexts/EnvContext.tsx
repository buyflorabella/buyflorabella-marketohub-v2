import { createContext, useContext, type ReactNode } from "react";

// The clean types used by your components
export interface EnvValues {
  contactPageUrl: string;
  shopPageUrl: string;
  message1: string;
  message2: string;
  message3: string;
  whatsappGroupUrl?: string;
  whatsappGroupName?: string;
  whatsappLinkCallout?: string;
  whatsappLinkDescription?: string;
  announcementBarEnabled?: boolean;
  announcementBarCoupon?: string;
}

const defaultEnv: EnvValues = {
  contactPageUrl: "/contact",
  shopPageUrl: "/shop",
  message1: "",
  message2: "",
  message3: "",
  whatsappGroupUrl: undefined,
  whatsappGroupName: undefined,
  whatsappLinkCallout: undefined,
  whatsappLinkDescription: undefined,
  announcementBarEnabled: false,
  announcementBarCoupon: "",
};

const EnvContext = createContext<EnvValues>(defaultEnv);

export const EnvProvider = ({
  children,
  env,
}: {
  children: ReactNode;
  env: EnvValues; // ← Changed from Env to EnvValues (already transformed by root.tsx)
}) => {
  // No transformation needed - data is already clean from root.tsx!
  //console.log("EnvProvider values:", env);
  
  return (
    <EnvContext.Provider value={env}>
      {children}
    </EnvContext.Provider>
  );
};

export const useEnv = () => useContext(EnvContext);