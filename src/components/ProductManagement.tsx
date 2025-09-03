import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { ShopPreview } from './ShopPreview';
import productsApiService from '../api_services/products.js';

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
  meta: object;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductManagementProps {
  authState?: {
    isAuthenticated: boolean;
    userSession: any | null;
    agent: any | null;
  };
}

export function ProductManagement({ authState }: ProductManagementProps = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Track sequence changes for logging
  const [sequenceChanges, setSequenceChanges] = useState<{[productId: string]: {oldSequence: number, newSequence: number}}>({});
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    title: '',
    description: '',
    price: 0,
    currency: 'XTR',
    credits: 0,
    category: 'credits',
    photo_url: '',
    feature_text: '',
    show_feature: false,
    sequence: 0, // Will be calculated when creating
    stock_limit: null,
    meta: {},
    is_active: true
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      setProducts([]);
      setSequenceChanges({}); // Clear sequence changes on reload
      
      console.log('🚀 Loading initial products data...');
      const response = await productsApiService.get_all_products();
      console.log('✅ Initial products data loaded:', response);
      
      if (response.code === 200 && response.data && response.data.products) {
        // Sort products by sequence (ascending - lower sequence numbers first)
        const sortedProducts = response.data.products.sort((a, b) => a.sequence - b.sequence);
        console.log('📊 Products sorted by sequence:', sortedProducts.map(p => `${p.title} (seq: ${p.sequence})`));
        setProducts(sortedProducts);
      } else {
        setError('Failed to load products data - Invalid response format');
        setProducts([]);
      }
    } catch (err) {
      console.error('❌ Error loading products data:', err);
      setError('Error loading products data');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = (productId: string, field: string, value: any) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  // Auto-calculate unique sequence for a product based on its current position
  const getAutoCalculatedSequence = (productId: string) => {
    const currentIndex = products.findIndex(p => p.id === productId);
    if (currentIndex === -1) return 0;
    
    // Return the position (so first product has sequence 0, second has 1, etc.)
    return currentIndex;
  };

  // Update a product's sequence to its auto-calculated value
  const autoUpdateProductSequence = (productId: string) => {
    const autoSequence = getAutoCalculatedSequence(productId);
    const currentProduct = products.find(p => p.id === productId);
    
    if (currentProduct && currentProduct.sequence !== autoSequence) {
      console.log(`🔢 Auto-updating sequence for "${currentProduct.title}": ${currentProduct.sequence} → ${autoSequence}`);
      
      updateProduct(productId, 'sequence', autoSequence);
      
      // Track sequence change
      setSequenceChanges(prev => ({
        ...prev,
        [productId]: {
          oldSequence: prev[productId]?.oldSequence || currentProduct.sequence,
          newSequence: autoSequence
        }
      }));
    }
  };

  // Auto-calculate all sequences to ensure uniqueness (0, 1, 2, 3, ...)
  const autoCalculateAllSequences = () => {
    console.log('🔢 Auto-calculating all sequences to ensure uniqueness (starting from 0)...');
    
    const updatedProducts = products.map((product, index) => {
      const newSequence = index; // 0-based sequence
      
      if (product.sequence !== newSequence) {
        console.log(`   "${product.title}": ${product.sequence} → ${newSequence}`);
        
        // Track sequence change
        setSequenceChanges(prev => ({
          ...prev,
          [product.id]: {
            oldSequence: prev[product.id]?.oldSequence || product.sequence,
            newSequence
          }
        }));
      }
      
      return { ...product, sequence: newSequence };
    });
    
    setProducts(updatedProducts);
    console.log('✅ All sequences auto-calculated (0, 1, 2, 3, ...)');
  };

  const moveProduct = (productId: string, direction: 'up' | 'down') => {
    const currentIndex = products.findIndex(p => p.id === productId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= products.length) return;

    const currentProduct = products[currentIndex];
    const swapProduct = products[newIndex];
    
    console.log(`🔄 Moving product "${currentProduct.title}" ${direction}:`);
    console.log(`   Current: seq ${currentProduct.sequence} at index ${currentIndex}`);
    console.log(`   Swap with: "${swapProduct.title}" seq ${swapProduct.sequence} at index ${newIndex}`);

    // Swap sequences
    const newCurrentSequence = swapProduct.sequence;
    const newSwapSequence = currentProduct.sequence;

    // Update products array with swapped positions and sequences
    const newProducts = [...products];
    newProducts[currentIndex] = { ...currentProduct, sequence: newCurrentSequence };
    newProducts[newIndex] = { ...swapProduct, sequence: newSwapSequence };
    
    // Sort by sequence to maintain order
    newProducts.sort((a, b) => a.sequence - b.sequence);
    setProducts(newProducts);

    // Track sequence changes for logging
    setSequenceChanges(prev => ({
      ...prev,
      [currentProduct.id]: {
        oldSequence: currentProduct.sequence,
        newSequence: newCurrentSequence
      },
      [swapProduct.id]: {
        oldSequence: swapProduct.sequence,
        newSequence: newSwapSequence
      }
    }));

    console.log(`✅ Sequences swapped:`);
    console.log(`   "${currentProduct.title}": ${currentProduct.sequence} → ${newCurrentSequence}`);
    console.log(`   "${swapProduct.title}": ${swapProduct.sequence} → ${newSwapSequence}`);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      console.log('🚀 Saving products with sequence changes:', sequenceChanges);
      
      // Log sequence changes before saving
      if (Object.keys(sequenceChanges).length > 0) {
        console.log('📊 Sequence changes to be saved:');
        Object.entries(sequenceChanges).forEach(([productId, change]) => {
          const product = products.find(p => p.id === productId);
          console.log(`   "${product?.title}": ${change.oldSequence} → ${change.newSequence}`);
        });
      } else {
        console.log('📊 No sequence changes to save');
      }
      
      // Update each product individually using PUT requests (including sequence)
      const updatePromises = products.map(async (product) => {
        if (product.id) {
          return productsApiService.update_product(product.id, {
            title: product.title,
            description: product.description,
            price: product.price,
            currency: product.currency,
            credits: product.credits,
            category: product.category,
            photo_url: product.photo_url,
            feature_text: product.feature_text,
            show_feature: product.show_feature,
            sequence: product.sequence, // Include sequence in update
            stock_limit: product.stock_limit,
            is_active: product.is_active
          });
        }
        return Promise.resolve();
      });
      
      await Promise.all(updatePromises);
      console.log('✅ Products saved successfully');
      
      // Clear sequence changes after successful save
      setSequenceChanges({});
      console.log('🧹 Sequence changes cache cleared');
      
      alert('Products saved successfully!');
      
    } catch (err) {
      console.error('❌ Error saving products:', err);
      setError('Error saving products');
    } finally {
      setSaving(false);
    }
  };

  const updateNewProduct = (field: string, value: any) => {
    setNewProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleUploadNewProduct = async () => {
    try {
      setUploading(true);
      setError(null);

      if (!newProduct.title || !newProduct.description) {
        setError('Title and description are required');
        return;
      }
      
      // Calculate next sequence number (max + 1, starting from 0)
      const maxSequence = products.length > 0 ? Math.max(...products.map(p => p.sequence)) : -1;
      const nextSequence = maxSequence + 1;
      
      console.log('🚀 Creating new product with sequence:', nextSequence);
      console.log('📊 Current max sequence:', maxSequence, '→ Next sequence:', nextSequence);
      
      const response = await productsApiService.create_product({
        title: newProduct.title,
        description: newProduct.description,
        price: newProduct.price || 0,
        currency: 'XTR',
        credits: newProduct.credits || 0,
        category: newProduct.category || 'credits',
        photo_url: newProduct.photo_url || null,
        feature_text: newProduct.feature_text || null,
        show_feature: newProduct.show_feature || false,
        sequence: nextSequence, // Include calculated sequence
        stock_limit: newProduct.stock_limit,
        meta: newProduct.meta || {}
      });
      console.log('✅ New product created:', response);
      
      if (response.code === 201) {
        alert('New product created successfully!');
        // Reset form and hide it
        setNewProduct({
          title: '',
          description: '',
          price: 0,
          currency: 'XTR',
          credits: 0,
          category: 'credits',
          photo_url: '',
          feature_text: '',
          show_feature: false,
          sequence: 0, // Will be recalculated
          stock_limit: null,
          meta: {},
          is_active: true
        });
        setShowNewProductForm(false);
        // Reload products to show the new one
        loadInitialData();
      } else {
        setError('Failed to create new product');
      }
    } catch (err) {
      console.error('❌ Error creating new product:', err);
      setError('Error creating new product');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelNewProduct = () => {
    setShowNewProductForm(false);
    setNewProduct({
      title: '',
      description: '',
      price: 0,
      currency: 'XTR',
      credits: 0,
      category: 'credits',
      photo_url: '',
      feature_text: '',
      show_feature: false,
      sequence: 0, // Will be recalculated when needed
      stock_limit: null,
      meta: {},
      is_active: true
    });
  };

  const toggleExpanded = (productId: string) => {
    setExpandedProductId(expandedProductId === productId ? null : productId);
  };

  const formatStockDisplay = (stockLimit: number | null) => {
    return stockLimit === null ? '∞' : stockLimit.toString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-muted-foreground">Loading products data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-2xl mb-2">❌</div>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadInitialData}>
              <span className="text-base mr-2">🔄</span>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Additional safety check - don't render if still loading or no data ready
  if (loading || !products) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-muted-foreground">Preparing data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex gap-6 h-full">
      {/* Products List */}
      <div className="w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h2>Products</h2>
          <div className="text-sm text-muted-foreground">
            {products.length > 0 ? `${products.filter(p => p.is_active).length} active products` : '0 products'}
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-3 pr-4">
            {products.length > 0 ? products.map((product, index) => {
              const isExpanded = expandedProductId === product.id;
              
              return (
                <Card key={`${product.id}-${index}`} className="transition-all duration-200">
                  <CardContent className="p-4">
                    {/* Product Header */}
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => toggleExpanded(product.id)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {isExpanded ? '🔽' : '▶️'}
                          </span>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3>{product.title}</h3>
                              <div className="flex gap-2">
                                {product.show_feature && product.feature_text && (
                                  <Badge variant="secondary">{product.feature_text}</Badge>
                                )}
                                <Badge variant={product.is_active ? "default" : "secondary"}>
                                  {product.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                            <div className="flex justify-between items-center text-sm mb-2">
                              <span>{product.price} {product.currency === 'XTR' ? 'Telegram Stars' : product.currency}</span>
                              <span>{product.credits} credits</span>
                              <span className="text-xs">Stock: {formatStockDisplay(product.stock_limit)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <span className="text-base mr-1">🏷️</span>
                              Category: {product.category}
                              <span className="ml-3">
                                <span className="text-base mr-1">🔢</span>
                                Sequence: {product.sequence}
                                {product.sequence !== getAutoCalculatedSequence(product.id) && (
                                  <span className="text-orange-600 ml-1" title="Sequence differs from auto-calculated position">
                                    (Auto: {getAutoCalculatedSequence(product.id)})
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Order Controls */}
                      <div className="flex flex-col gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveProduct(product.id, 'up')}
                          disabled={index === 0}
                          className="h-6 w-6 p-0"
                        >
                          <span className="text-xs">⬆️</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveProduct(product.id, 'down')}
                          disabled={index === products.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <span className="text-xs">⬇️</span>
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Edit Form */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2">
                            <span className="text-base">📦</span>
                            Product Information
                          </h4>
                          
                          <div>
                            <Label>ID</Label>
                            <Input value={product.id} disabled />
                          </div>
                          
                          <div>
                            <Label>Title</Label>
                            <Input 
                              value={product.title}
                              onChange={(e) => updateProduct(product.id, 'title', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={product.description}
                              onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                            />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Price</Label>
                              <Input
                                type="number"
                                step="1"
                                value={product.price}
                                onChange={(e) => updateProduct(product.id, 'price', parseInt(e.target.value))}
                              />
                            </div>
                            <div>
                              <Label>Currency</Label>
                              <Select 
                                value={product.currency}
                                onValueChange={(value) => updateProduct(product.id, 'currency', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="XTR">Telegram Stars</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Credits</Label>
                              <Input
                                type="number"
                                value={product.credits}
                                onChange={(e) => updateProduct(product.id, 'credits', parseInt(e.target.value))}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label>Category</Label>
                            <Select 
                              value={product.category}
                              onValueChange={(value) => updateProduct(product.id, 'category', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="credits">Credits</SelectItem>
                                <SelectItem value="subscription">Subscription</SelectItem>
                                <SelectItem value="feature">Feature</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Sequence</Label>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                value={getAutoCalculatedSequence(product.id)}
                                disabled
                                title="Auto-calculated based on current position"
                                className="flex-1"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => autoUpdateProductSequence(product.id)}
                                className="text-xs"
                              >
                                🔢 Auto
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Auto-calculated: Position {getAutoCalculatedSequence(product.id)} (Current: {product.sequence})
                            </div>
                          </div>
                          
                          <div>
                            <Label>Photo URL</Label>
                            <Input
                              value={product.photo_url || ''}
                              onChange={(e) => updateProduct(product.id, 'photo_url', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label>Feature Text</Label>
                            <Input
                              value={product.feature_text || ''}
                              onChange={(e) => updateProduct(product.id, 'feature_text', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <Label>Stock Limit</Label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={product.stock_limit === null}
                                  onCheckedChange={(checked) => updateProduct(product.id, 'stock_limit', checked ? null : 100)}
                                />
                                <Label className="text-sm">Unlimited Stock</Label>
                              </div>
                              {product.stock_limit !== null && (
                                <Input
                                  type="number"
                                  min="0"
                                  value={product.stock_limit}
                                  onChange={(e) => updateProduct(product.id, 'stock_limit', parseInt(e.target.value))}
                                />
                              )}
                              {product.stock_limit === null && (
                                <div className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">
                                  Stock limit: ∞ (Unlimited)
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Product Settings */}
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2">
                            <span className="text-base">⚙️</span>
                            Product Settings
                          </h4>
                          
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={product.show_feature}
                                onCheckedChange={(checked) => updateProduct(product.id, 'show_feature', checked)}
                              />
                              <Label>Show Feature Badge</Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={product.is_active}
                                onCheckedChange={(checked) => updateProduct(product.id, 'is_active', checked)}
                              />
                              <Label>Active Product</Label>
                            </div>

                            {/* Temporarily disabled - Show in Shop toggle will be implemented later */}
                            {/* <div className="flex items-center space-x-2">
                              <Switch
                                checked={product.show_in_shop}
                                onCheckedChange={(checked) => updateProduct(product.id, 'show_in_shop', checked)}
                              />
                              <Label className="flex items-center gap-2">
                                <span className="text-base">🛒</span>
                                Show in Shop
                              </Label>
                            </div> */}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            }) : (
              <div className="text-center p-8 text-muted-foreground">
                <span className="text-2xl block mb-2">📦</span>
                <p>No products found</p>
              </div>
            )}
            
            {/* Add New Product Card */}
            <Card className="transition-all duration-200 border-dashed border-2">
              <CardContent className="p-4">
                {!showNewProductForm ? (
                  <div 
                    className="flex items-center justify-center p-8 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setShowNewProductForm(true)}
                  >
                    <div className="text-center text-muted-foreground">
                      <span className="text-4xl block mb-2">➕</span>
                      <p className="font-medium">Add New Product</p>
                      <p className="text-sm">Click to create a new product</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <span className="text-xl">➕</span>
                        Add New Product
                      </h3>
                    </div>

                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h4 className="flex items-center gap-2">
                        <span className="text-base">📦</span>
                        Product Information
                      </h4>
                      
                      <div>
                        <Label>Title</Label>
                        <Input 
                          value={newProduct.title || ''}
                          onChange={(e) => updateNewProduct('title', e.target.value)}
                          placeholder="Enter product title"
                        />
                      </div>
                      
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={newProduct.description || ''}
                          onChange={(e) => updateNewProduct('description', e.target.value)}
                          placeholder="Enter product description"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Price</Label>
                          <Input
                            type="number"
                            step="1"
                            value={newProduct.price || 0}
                            onChange={(e) => updateNewProduct('price', parseInt(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label>Currency</Label>
                          <Select 
                            value="XTR"
                            onValueChange={(value) => updateNewProduct('currency', value)}
                            disabled
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="XTR">Telegram Stars</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Credits</Label>
                          <Input
                            type="number"
                            value={newProduct.credits || 0}
                            onChange={(e) => updateNewProduct('credits', parseInt(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Category</Label>
                        <Select 
                          value={newProduct.category || 'credits'}
                          onValueChange={(value) => updateNewProduct('category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="credits">Credits</SelectItem>
                            <SelectItem value="subscription">Subscription</SelectItem>
                            <SelectItem value="feature">Feature</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Sequence (Auto-calculated)</Label>
                        <Input
                          type="number"
                          value={products.length > 0 ? Math.max(...products.map(p => p.sequence)) + 1 : 0}
                          disabled
                          title="Will be automatically set to the next available sequence number (starting from 0)"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          Will be automatically set to {products.length > 0 ? Math.max(...products.map(p => p.sequence)) + 1 : 0}
                        </div>
                      </div>
                      
                      <div>
                        <Label>Photo URL</Label>
                        <Input
                          value={newProduct.photo_url || ''}
                          onChange={(e) => updateNewProduct('photo_url', e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      
                      <div>
                        <Label>Feature Text</Label>
                        <Input
                          value={newProduct.feature_text || ''}
                          onChange={(e) => updateNewProduct('feature_text', e.target.value)}
                          placeholder="e.g., Most Popular, Limited Time"
                        />
                      </div>
                      
                      <div>
                        <Label>Stock Limit</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={newProduct.stock_limit === null}
                              onCheckedChange={(checked) => updateNewProduct('stock_limit', checked ? null : 100)}
                            />
                            <Label className="text-sm">Unlimited Stock</Label>
                          </div>
                          {newProduct.stock_limit !== null && (
                            <Input
                              type="number"
                              min="0"
                              value={newProduct.stock_limit || 100}
                              onChange={(e) => updateNewProduct('stock_limit', parseInt(e.target.value))}
                              placeholder="100"
                            />
                          )}
                          {newProduct.stock_limit === null && (
                            <div className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">
                              Stock limit: ∞ (Unlimited)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Product Settings */}
                    <div className="space-y-4">
                      <h4 className="flex items-center gap-2">
                        <span className="text-base">⚙️</span>
                        Product Settings
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newProduct.show_feature || false}
                            onCheckedChange={(checked) => updateNewProduct('show_feature', checked)}
                          />
                          <Label>Show Feature Badge</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newProduct.is_active !== false}
                            onCheckedChange={(checked) => updateNewProduct('is_active', checked)}
                          />
                          <Label>Active Product</Label>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button 
                        onClick={handleUploadNewProduct}
                        disabled={uploading || !newProduct.title || !newProduct.description}
                        className="flex-1"
                      >
                        <span className="text-base mr-2">{uploading ? '⏳' : '📤'}</span>
                        {uploading ? 'Uploading...' : 'Upload'}
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={handleCancelNewProduct}
                        disabled={uploading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
        
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSave} className="flex-1" disabled={saving}>
            <span className="text-base mr-2">{saving ? '⏳' : '💾'}</span>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button onClick={autoCalculateAllSequences} variant="outline" disabled={saving}>
            <span className="text-base mr-1">🔢</span>
            Auto-Calc All
          </Button>
          <Button onClick={loadInitialData} variant="outline">
            <span className="text-base mr-1">🔄</span>
            Refresh
          </Button>
        </div>
      </div>

      {/* App Preview */}
      <div className="w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h3>Preview in App</h3>
          <div className="text-sm text-muted-foreground">
            Product management interface
          </div>
        </div>
        
        <div className="mt-4">
          <div className="h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 rounded-lg p-4">
            <ShopPreview 
              products={products} 
              productsPerRow={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}