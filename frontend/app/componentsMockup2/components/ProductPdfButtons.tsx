import { useMemo } from "react";

export default function ProductPdfButtons() {
  const preOrderLink = useMemo(() => {
    const links = [
      "/product/aerator-plus",
      "/product/yield-boost",
    ];
    return links[Math.floor(Math.random() * links.length)];
  }, []);

  return (
    <section className="bg-[#f5f5f0] pt-40 pb-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6">

        {/* Top row: PDF buttons */}
        <div className="flex flex-wrap justify-center gap-6 w-full">
          <a
            href="https://cdn.shopify.com/s/files/1/0640/4833/2903/files/FB-Direct_Ag_Solutions_Areator_Plus_Flyer_PROD.pdf?v=1780594887"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-block px-8 py-4 rounded-lg
              bg-[#ff0080]
              border-2 border-[#d4ff00]
              ring-2 ring-[#d4ff00] ring-offset-2 ring-offset-[#f5f5f0]
              text-white font-bold uppercase tracking-widest text-sm
              transition-all duration-200
              hover:bg-[#cc0066] hover:scale-105
              active:scale-95
            "
          >
            AERATOR PLUS
          </a>

          <a
            href="https://cdn.shopify.com/s/files/1/0640/4833/2903/files/FB-YIELDBOOST_Brochure_PROD.pdf?v=1780594891"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-block px-8 py-4 rounded-lg
              bg-[#ff0080]
              border-2 border-[#d4ff00]
              ring-2 ring-[#d4ff00] ring-offset-2 ring-offset-[#f5f5f0]
              text-white font-bold uppercase tracking-widest text-sm
              transition-all duration-200
              hover:bg-[#cc0066] hover:scale-105
              active:scale-95
            "
          >
            YIELDBOOST
          </a>
        </div>

        {/* Description text */}
        <p className="italic text-sm text-gray-700 text-center">
          We are excited to introduce two new <span className="font-bold">amazing</span> products this June!
        </p>
        
       
      </div>
    </section>
  );
}