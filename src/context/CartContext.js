"use client";

import {
  createContext,
   useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem("ironwear-cart");

      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Unable to load cart:", error);
    } finally {
      setHasLoadedCart(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedCart) {
      return;
    }

    window.localStorage.setItem(
      "ironwear-cart",
      JSON.stringify(items),
    );
  }, [items, hasLoadedCart]);

  function addItem(product, variant, quantity = 1) {
    if (!product || !variant || quantity < 1) {
      return;
    }

    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.variantId === variant.id,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.variantId === variant.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + quantity,
                  variant.stock,
                ),
              }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          variantId: variant.id,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          priceInCents: product.priceInCents,
          imageUrl: product.imageUrl,
          imageAlt: product.imageAlt,
          size: variant.size,
          color: variant.color,
          stock: variant.stock,
          quantity: Math.min(quantity, variant.stock),
        },
      ];
    });
  }

  function removeItem(variantId) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.variantId !== variantId),
    );
  }

  function updateQuantity(variantId, quantity) {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.variantId === variantId
            ? {
                ...item,
                quantity: Math.min(
                  Math.max(quantity, 0),
                  item.stock,
                ),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  const clearCart = useCallback(() => {
  window.localStorage.setItem("ironwear-cart", "[]");
  setItems([]);
}, []);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const subtotalInCents = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.priceInCents * item.quantity,
        0,
      ),
    [items],
  );

  const value = {
    items,
    itemCount,
    subtotalInCents,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    hasLoadedCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}