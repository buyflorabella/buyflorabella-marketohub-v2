import { Leaf } from 'lucide-react';

export default function PageBackground() {
  return (
    <>
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#7cb342] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#8b6f47] rounded-full blur-3xl"></div>
      </div>

      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 floating">
          <Leaf className="w-32 h-32 text-[#7cb342]" />
        </div>
        <div className="absolute bottom-1/4 right-1/4 floating-delayed">
          <Leaf className="w-24 h-24 text-[#8b6f47]" />
        </div>
        <div className="absolute top-1/3 right-1/3 floating-slow">
          <Leaf className="w-20 h-20 text-[#7cb342]" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 floating-x">
          <Leaf className="w-28 h-28 text-[#8b6f47]" />
        </div>
        <div className="absolute top-2/3 right-1/4 floating-diagonal">
          <Leaf className="w-16 h-16 text-[#7cb342]" />
        </div>
      </div>
    </>
  );
}
