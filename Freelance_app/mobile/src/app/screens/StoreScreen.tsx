import { useState } from "react";
import { useHistory } from "react-router-dom";
import { Search, ShoppingCart, Star, Filter, TrendingUp, Sparkles, Zap } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";
import { PageTransition } from "../components/PageTransition";

interface StoreItem {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  sales: number;
  category: string;
  badge?: "Hot" | "New" | "Sale";
}

export function StoreScreen() {
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartCount, setCartCount] = useState(2);

  const categories = [
    "All",
    "Templates",
    "Graphics",
    "UI Kits",
    "Icons",
    "Fonts",
  ];

  const storeItems: StoreItem[] = [
    {
      id: "1",
      title: "Premium Resume Template",
      description: "Professional resume template with cover letter",
      price: 19.99,
      originalPrice: 39.99,
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop",
      rating: 4.8,
      sales: 1234,
      category: "Templates",
      badge: "Sale",
    },
    {
      id: "2",
      title: "Social Media Graphics Pack",
      description: "100+ customizable social media templates",
      price: 29.99,
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop",
      rating: 4.9,
      sales: 856,
      category: "Graphics",
      badge: "Hot",
    },
    {
      id: "3",
      title: "Modern Dashboard UI Kit",
      description: "Complete dashboard design system",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
      rating: 4.7,
      sales: 542,
      category: "UI Kits",
      badge: "New",
    },
    {
      id: "4",
      title: "Icon Collection - 500+ Icons",
      description: "Multi-style icon set for web & mobile",
      price: 24.99,
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop",
      rating: 4.6,
      sales: 923,
      category: "Icons",
    },
    {
      id: "5",
      title: "Portfolio Website Template",
      description: "Fully responsive portfolio template",
      price: 34.99,
      originalPrice: 49.99,
      image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop",
      rating: 4.9,
      sales: 678,
      category: "Templates",
      badge: "Sale",
    },
    {
      id: "6",
      title: "Brand Identity Kit",
      description: "Logo templates and brand guidelines",
      price: 39.99,
      image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop",
      rating: 4.8,
      sales: 445,
      category: "Graphics",
    },
  ];

  const getBadgeStyles = (badge?: "Hot" | "New" | "Sale") => {
    switch (badge) {
      case "Hot":
        return "bg-red-500 text-white";
      case "New":
        return "bg-green-500 text-white";
      case "Sale":
        return "bg-[#8B5CF6] text-white";
      default:
        return "";
    }
  };

  const getBadgeIcon = (badge?: "Hot" | "New" | "Sale") => {
    switch (badge) {
      case "Hot":
        return <TrendingUp className="w-3 h-3" />;
      case "New":
        return <Sparkles className="w-3 h-3" />;
      case "Sale":
        return <Zap className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const filteredItems = storeItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageTransition>
      <div className="h-screen bg-gray-50 flex flex-col max-w-md mx-auto overflow-hidden pb-20">
        {/* Status bar */}
        <div className="h-6 bg-white" />

        {/* Top app bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="h-14 flex items-center justify-between px-4">
            <h1 className="text-xl font-semibold text-gray-900">Store</h1>
            <button className="relative p-2 -mr-2">
              <ShoppingCart className="w-6 h-6 text-gray-900" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#8B5CF6] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Search bar */}
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-12 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B5CF6] bg-gray-50"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Categories chips */}
          <div className="px-4 pb-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? "bg-[#8B5CF6] text-white"
                      : "bg-white text-gray-700 border border-gray-300"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Featured banner */}
          <div className="p-4">
            <div className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Featured Deal</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Mega Bundle Sale</h2>
              <p className="text-sm opacity-90 mb-4">
                Get 50% off on selected templates and kits
              </p>
              <button className="bg-white text-[#8B5CF6] px-6 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">
                Shop Now
              </button>
            </div>
          </div>

          {/* Products grid */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedCategory === "All" ? "All Products" : selectedCategory}
              </h2>
              <span className="text-sm text-gray-600">
                {filteredItems.length} items
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Product image */}
                  <div className="relative aspect-[4/3] bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {item.badge && (
                      <div
                        className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 ${getBadgeStyles(
                          item.badge
                        )}`}
                      >
                        {getBadgeIcon(item.badge)}
                        {item.badge}
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                      {item.description}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-medium text-gray-900">
                        {item.rating}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({item.sales})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#8B5CF6]">
                        ${item.price}
                      </span>
                      {item.originalPrice && (
                        <span className="text-xs text-gray-500 line-through">
                          ${item.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Add to cart button */}
                    <button
                      onClick={() => setCartCount(cartCount + 1)}
                      className="w-full mt-3 h-9 bg-[#8B5CF6] text-white rounded-lg text-sm font-medium hover:bg-[#7C3AED] transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empty state */}
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Try adjusting your search or filter to find what you're looking for
              </p>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </PageTransition>
  );
}
