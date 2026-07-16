"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";

export default function ClearCartOnSuccess() {
  const { clearCart } = useCart();
  const hasClearedCart = useRef(false);

  useEffect(() => {
    if (hasClearedCart.current) {
      return;
    }

    hasClearedCart.current = true;
    clearCart();
  }, [clearCart]);

  return null;
}