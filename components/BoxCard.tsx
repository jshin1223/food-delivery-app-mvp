// components/BoxCard.tsx
import Image from "next/image";

type BoxCardProps = {
  title: string;
  price: number;
  quantity: number;
  image?: string;
};

export default function BoxCard({ title, price, quantity, image }: BoxCardProps) {
  return (
    <div className="border rounded-lg shadow-sm overflow-hidden w-full max-w-xs bg-white">
      <div className="relative h-40 w-full">
        <Image
          src={image || "/placeholder.webp"}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-600">${price.toFixed(2)}</p>
        <p className="text-sm text-gray-500">
          {quantity > 0 ? `${quantity} left` : "Sold out"}
        </p>
        <button
          disabled={quantity === 0}
          className="mt-2 w-full rounded bg-blue-600 px-3 py-2 text-white disabled:bg-gray-400"
        >
          {quantity === 0 ? "Unavailable" : "Buy"}
        </button>
      </div>
    </div>
  );
}
