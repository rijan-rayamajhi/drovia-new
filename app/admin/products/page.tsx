'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Edit, Trash2, X, Search, Check, Upload, Image as ImageIcon, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Product } from '@/types';
import { getAdminProducts, saveAdminProducts, addAdminProduct, updateAdminProduct, deleteAdminProduct } from '@/lib/adminProducts';

const ITEMS_PER_PAGE = 20;
const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const CATEGORIES = ['T-Shirts', 'Jackets', 'Shirts', 'Pants', 'Sweaters', 'Footwear', 'Hoodies', 'Accessories'];
const GENDERS = ['men', 'women', 'unisex'];

function AdminProductsPageInner() {
  const searchParams = useSearchParams();
  const lowStockFilter = searchParams.get('filter') === 'low-stock';

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [imageUploads, setImageUploads] = useState<string[]>([]);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    shortDescription: '',
    longDescription: '',
    price: '',
    originalPrice: '',
    stockQuantity: '',
    sizes: [] as string[],
    status: 'Active' as 'Active' | 'Inactive',
    fabric: '',
    images: [] as string[],
    category: 'T-Shirts',
    gender: 'unisex',
  });

  useEffect(() => {
    const loadProducts = async () => {
      const allProducts = await getAdminProducts();
      setProducts(allProducts);
    };
    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Apply low stock filter
    if (lowStockFilter) {
      filtered = filtered.filter((p: any) => {
        const stock = typeof p.stock === 'number' ? p.stock : (p.stockQuantity ? parseInt(p.stockQuantity) : 50);
        return stock <= 5;
      });
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p as any).sku?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchQuery, lowStockFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      const p = product as any;
      setFormData({
        name: product.name,
        sku: p.sku || '',
        shortDescription: p.shortDescription || '',
        longDescription: p.longDescription || '',
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || '',
        stockQuantity: p.stock?.toString() || p.stockQuantity?.toString() || '50',
        sizes: product.sizes || [],
        status: p.status || (product.inStock !== false ? 'Active' : 'Inactive'),
        fabric: product.fabric || '',
        images: product.images || (product.image ? [product.image] : []),
        category: product.category || 'T-Shirts',
        gender: product.gender || 'unisex',
      });
      setImageUploads(product.images || (product.image ? [product.image] : []));
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: '',
        shortDescription: '',
        longDescription: '',
        price: '',
        originalPrice: '',
        stockQuantity: '50',
        sizes: [],
        status: 'Active',
        fabric: '',
        images: [],
        category: 'T-Shirts',
        gender: 'unisex',
      });
      setImageUploads([]);
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.sku.trim()) errors.sku = 'SKU is required';
    if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'Price must be greater than 0';
    if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) errors.stockQuantity = 'Stock must be >= 0';
    if (formData.sizes.length === 0) errors.sizes = 'At least one size is required';
    if (formData.images.length === 0) errors.images = 'At least one image is required';

    // Check SKU uniqueness
    if (formData.sku) {
      const existingProduct = products.find(
        (p) => (p as any).sku === formData.sku && p.id !== editingProduct?.id
      );
      if (existingProduct) errors.sku = 'SKU must be unique';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    // Add cache-busting version to images
    const timestamp = Date.now();
    const versionedImages = formData.images.map((img) => {
      // If it's a data URL, keep it as is (new upload)
      if (img.startsWith('data:')) {
        return img;
      }
      // If it's an existing URL, add version parameter
      const url = new URL(img, window.location.origin);
      url.searchParams.set('v', timestamp.toString());
      return url.toString();
    });

    const productData: any = {
      name: formData.name,
      sku: formData.sku,
      shortDescription: formData.shortDescription,
      longDescription: formData.longDescription,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      stock: parseInt(formData.stockQuantity),
      stockQuantity: parseInt(formData.stockQuantity),
      sizes: formData.sizes,
      status: formData.status,
      fabric: formData.fabric,
      images: versionedImages,
      image: versionedImages[0] || '',
      imageVersion: timestamp,
      category: formData.category,
      gender: formData.gender,
      inStock: formData.status === 'Active',
    };

    if (editingProduct) {
      await updateAdminProduct(editingProduct.id, productData);
      // Dispatch event to refresh product displays
      window.dispatchEvent(new CustomEvent('productUpdated', { detail: { productId: editingProduct.id } }));
    } else {
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        category: 'T-Shirts',
      };
      await addAdminProduct(newProduct);
    }

    // Refresh products
    const refreshedProducts = await getAdminProducts();
    setProducts(refreshedProducts);
    setIsModalOpen(false);
    setSelectedProducts(new Set());
  };

  const handleDelete = async (id: string) => {
    await deleteAdminProduct(id);
    const refreshedProducts = await getAdminProducts();
    setProducts(refreshedProducts);
    setShowDeleteConfirm(null);
    setSelectedProducts(new Set());
  };

  const handleBulkDelete = async () => {
    for (const id of selectedProducts) {
      await deleteAdminProduct(id);
    }
    const refreshedProducts = await getAdminProducts();
    setProducts(refreshedProducts);
    setSelectedProducts(new Set());
    setShowBulkDeleteConfirm(false);
  };

  const handleBulkStatusChange = async (status: 'Active' | 'Inactive') => {
    for (const id of selectedProducts) {
      await updateAdminProduct(id, { inStock: status === 'Active' } as any);
    }
    const refreshedProducts = await getAdminProducts();
    setProducts(refreshedProducts);
    setSelectedProducts(new Set());
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 3 * 1024 * 1024) {
        alert(`Image ${file.name} exceeds 3MB limit`);
        return;
      }

      if (!file.type.match(/^image\/(jpg|jpeg|png)$/i)) {
        alert(`Image ${file.name} must be JPG or PNG`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        if (imageUploads.length < 5) {
          setImageUploads([...imageUploads, imageUrl]);
          setFormData({ ...formData, images: [...formData.images, imageUrl] });
        } else {
          alert('Maximum 5 images allowed');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = imageUploads.filter((_, i) => i !== index);
    setImageUploads(newImages);
    setFormData({ ...formData, images: newImages });
  };

  const handleDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedImageIndex === null) return;

    const newImages = [...imageUploads];
    const draggedItem = newImages[draggedImageIndex];
    newImages.splice(draggedImageIndex, 1);
    newImages.splice(index, 0, draggedItem);

    setImageUploads(newImages);
    setFormData({ ...formData, images: newImages });
    setDraggedImageIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedImageIndex(null);
  };

  const toggleSize = (size: string) => {
    const newSizes = formData.sizes.includes(size)
      ? formData.sizes.filter((s) => s !== size)
      : [...formData.sizes, size];
    setFormData({ ...formData, sizes: newSizes });
  };

  const toggleSelectProduct = (id: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === paginatedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(paginatedProducts.map((p) => p.id)));
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-3">
          {selectedProducts.size > 0 && (
            <>
              <Button
                variant="secondary"
                onClick={() => handleBulkStatusChange('Active')}
                className="text-sm"
              >
                Mark Active
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleBulkStatusChange('Inactive')}
                className="text-sm"
              >
                Mark Inactive
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="text-sm text-red-600"
              >
                Delete ({selectedProducts.size})
              </Button>
            </>
          )}
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <Plus className="w-5 h-5 inline mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or SKU..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6">
                  <input
                    type="checkbox"
                    checked={selectedProducts.size === paginatedProducts.length && paginatedProducts.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                </th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Thumbnail</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Title</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">SKU</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Price</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Stock</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Sizes</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Status</th>
                <th className="text-left py-4 px-6 text-text-light font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-text-light">
                    {searchQuery ? 'No products found matching your search' : 'No products yet'}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const p = product as any;
                  const stock = typeof p.stock === 'number' ? p.stock : (p.stockQuantity ? parseInt(p.stockQuantity) : 50);
                  const isLowStock = stock <= 5;
                  return (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => toggleSelectProduct(product.id)}
                          className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <img
                          src={product.image || product.images?.[0] || ''}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </td>
                      <td className="py-4 px-6 font-medium">{product.name}</td>
                      <td className="py-4 px-6 text-text-light">{p.sku || 'N/A'}</td>
                      <td className="py-4 px-6">
                        <div>
                          {product.originalPrice && (
                            <span className="text-text-light line-through text-sm mr-2">
                              {formatCurrency(product.originalPrice)}
                            </span>
                          )}
                          <span className="font-semibold">{formatCurrency(product.price)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={isLowStock ? 'text-orange-600 font-semibold' : ''}>
                          {stock}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-text-light">
                        {product.sizes?.join(', ') || 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${(p.status || (product.inStock !== false ? 'Active' : 'Inactive')) === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                          {p.status || (product.inStock !== false ? 'Active' : 'Inactive')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-text-light">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 border rounded-lg ${currentPage === page
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Title *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      error={formErrors.name}
                    />
                  </div>
                  <div>
                    <Input
                      label="SKU *"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      error={formErrors.sku}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Short Description
                  </label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Long Description
                  </label>
                  <textarea
                    value={formData.longDescription}
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                  />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Input
                      label="Price (₹) *"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      error={formErrors.price}
                    />
                  </div>
                  <div>
                    <Input
                      label="Original Price (₹)"
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <Input
                      label="Stock Quantity *"
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      error={formErrors.stockQuantity}
                    />
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Sizes * {formErrors.sizes && <span className="text-red-600 text-xs">({formErrors.sizes})</span>}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${formData.sizes.includes(size)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white border-gray-300 hover:border-primary'
                          }`}
                      >
                        {size}
                        {formData.sizes.includes(size) && <Check className="w-4 h-4 inline ml-1" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category, Gender, Status & Fabric */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {GENDERS.map((gender) => (
                        <option key={gender} value={gender}>
                          {gender.charAt(0).toUpperCase() + gender.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <Input
                      label="Fabric / Material"
                      value={formData.fabric}
                      onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Images * {formErrors.images && <span className="text-red-600 text-xs">({formErrors.images})</span>}
                    <span className="text-text-light text-xs ml-2">(Max 5, JPG/PNG, 3MB each)</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    {imageUploads.map((img, index) => (
                      <div
                        key={index}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className="relative group cursor-move"
                      >
                        <img
                          src={img}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Featured
                          </div>
                        )}
                      </div>
                    ))}
                    {imageUploads.length < 5 && (
                      <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                        <div className="text-center">
                          <Upload className="w-6 h-6 mx-auto mb-1 text-text-light" />
                          <span className="text-xs text-text-light">Upload</span>
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {imageUploads.length === 0 && (
                    <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 text-text-light" />
                      <span className="text-text-light">Click to upload images</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <Button variant="primary" onClick={handleSave} className="flex-1">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </Button>
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Delete Product</h3>
              <p className="text-text-light mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation */}
      <AnimatePresence>
        {showBulkDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBulkDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Delete Products</h3>
              <p className="text-text-light mb-6">
                Are you sure you want to delete {selectedProducts.size} product(s)? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleBulkDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Delete All
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={null}>
      <AdminProductsPageInner />
    </Suspense>
  );
}
