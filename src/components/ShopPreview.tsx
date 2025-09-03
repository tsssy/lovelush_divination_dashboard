import React from 'react';
import { Card, CardContent } from './ui/card';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'XTR';
  credits: number;
  category: 'credits' | 'subscription' | 'feature';
  photo_url: string | null;
  feature_text: string | null;
  show_feature: boolean;
  sequence: number;
  stock_limit: number | null;
  is_active: boolean;
}

interface ShopPreviewProps {
  products: Product[];
  productsPerRow?: number;
}

// Define our own color styles for the ShopPreview component to match Shop.tsx
const shopPreviewStyles = {
  container: {
    color: 'white',
    backgroundColor: '#0f172a', // bg-slate-900
  },
  whiteText: {
    color: 'white',
  },
  blueText: {
    color: 'rgb(96, 165, 250)', // text-blue-400
  },
  yellowText: {
    color: 'rgb(250, 204, 21)', // text-yellow-400
  },
  whiteOpacity50: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  whiteOpacity60: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  whiteOpacity70: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  slateText400: {
    color: 'rgb(148, 163, 184)', // text-slate-400
  },
  slateText500: {
    color: 'rgb(100, 116, 139)', // text-slate-500
  },
  // Card styles to match Shop.tsx
  cardBackground: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)', // bg-slate-800/50
  },
  cardBorder: {
    borderColor: 'rgb(51, 65, 85)', // border-slate-700
  },
};

export function ShopPreview({ products, productsPerRow = 2 }: ShopPreviewProps) {
  const getGridColumnsClass = (productsPerRow: number): string => {
    switch (productsPerRow) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      case 6: return 'grid-cols-6';
      default: return 'grid-cols-2';
    }
  };

  // Filter to only active products and sort by sequence
  const activeProducts = products
    .filter(product => product.is_active)
    .sort((a, b) => a.sequence - b.sequence);

  if (activeProducts.length === 0) {
    return (
      <div className="w-full h-[calc(100vh-200px)] max-w-[400px] mx-auto border rounded-lg shadow-lg flex flex-col" 
           style={{...shopPreviewStyles.container, ...shopPreviewStyles.cardBorder}}>
        <div className="p-4 flex-shrink-0">
          <h2 className="text-lg text-center mb-4" style={shopPreviewStyles.whiteText}>Shop Preview</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4" style={shopPreviewStyles.slateText500}>
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-base mb-2" style={shopPreviewStyles.whiteText}>No Active Products</h3>
            <p className="text-sm" style={shopPreviewStyles.slateText400}>Add products to see preview</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-2/3 h-[calc(100vh-200px)] mx-auto border rounded-lg shadow-lg overflow-hidden flex flex-col" 
         style={{...shopPreviewStyles.container, ...shopPreviewStyles.cardBorder}}>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Balance Card */}
          <Card className="border flex-shrink-0" style={{...shopPreviewStyles.cardBackground, ...shopPreviewStyles.cardBorder}}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm mb-2" style={shopPreviewStyles.blueText}>Your Balance</p>
                <div className="text-2xl font-medium mb-2" style={shopPreviewStyles.whiteText}>200</div>
                <p className="text-sm mb-3" style={shopPreviewStyles.whiteOpacity50}>Coins</p>
                <div className="text-sm mb-3" style={shopPreviewStyles.whiteOpacity50}>Cost per message: 5</div>
                <button className="text-sm underline" style={shopPreviewStyles.whiteOpacity60}>Purchase History</button>
              </div>
            </CardContent>
          </Card>

          {/* Title */}
          <h3 className="text-lg text-center flex-shrink-0" style={shopPreviewStyles.blueText}>Purchase Packages</h3>

          {/* Products Grid */}
          <div className={`grid ${getGridColumnsClass(productsPerRow)} gap-3`}>
            {activeProducts.map((product) => (
              <Card 
                key={product.id} 
                className="border"
                style={{...shopPreviewStyles.cardBackground, ...shopPreviewStyles.cardBorder}}
              >
                <CardContent className="p-3">
                  {/* Feature Banner */}
                  {product.show_feature && product.feature_text?.trim() && (
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-2 py-1 mb-2 rounded text-center">
                      <p className="text-xs font-bold" style={shopPreviewStyles.whiteText}>{product.feature_text}</p>
                    </div>
                  )}
                  
                  {/* Product Title */}
                  <h3 className="text-sm text-center font-medium mb-2" style={shopPreviewStyles.whiteText}>{product.title}</h3>
                  
                  {/* Price and Credits */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <span className="text-lg font-semibold" style={shopPreviewStyles.yellowText}>{product.price}</span>
                      <span className="text-lg" style={shopPreviewStyles.yellowText}>⭐️</span>
                    </div>
                    <div className="text-sm mb-1" style={shopPreviewStyles.whiteOpacity70}>
                      {product.credits} {product.credits === 1 ? 'Message' : 'Messages'}
                    </div>
                    {/* Description */}
                    {product.description && (
                      <p className="text-xs mt-1 line-clamp-2" style={shopPreviewStyles.whiteOpacity60}>{product.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}