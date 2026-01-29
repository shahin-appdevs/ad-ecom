"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartCount, setCartCount] = useState(0);

    // List of all cart types
    const allCartTypes = [
        "flashSaleCart",
        "newArrivalCart",
        "categoryProductsCart",
        "campaignCart",
        "collectionCart",
        "brandCart",
        "categoryCart",
        "childSubCategoryCart",
        "subCategoryCart",
        "relatedProductCart",
        "productDetailsCart",
    ];

    const removeItemFromAllCarts = (uniqueId) => {
        console.log("Removing item with uniqueId:", uniqueId);

        allCartTypes.forEach((cartKey) => {
            const savedCart = localStorage.getItem(cartKey);
            if (savedCart) {
                let cartItems = JSON.parse(savedCart);
                const updatedItems = cartItems.filter((item) => {
                    // Check both uniqueId and backward compatibility with id
                    const itemUniqueId =
                        item.uniqueId ||
                        `${item.id}-${item.color || "no-color"}-${item.size || "no-size"}`;
                    return itemUniqueId !== uniqueId;
                });
                localStorage.setItem(cartKey, JSON.stringify(updatedItems));
                console.log(`Updated ${cartKey}:`, updatedItems);
            }
        });

        updateCartCount();
    };

    const updateCartCount = () => {
        // Get all carts from localStorage
        const allCarts = allCartTypes.map((cartKey) => {
            const cart = localStorage.getItem(cartKey);
            return cart ? JSON.parse(cart) : [];
        });

        // Flatten all cart items and sum quantities
        const count = allCarts
            .flat()
            .reduce((sum, item) => sum + (item.quantity || 1), 0);

        setCartCount(count);
    };

    const updateItemQuantity = (uniqueId, type, source) => {
        console.log(
            "Updating quantity for uniqueId:",
            uniqueId,
            "Type:",
            type,
            "Source:",
            source,
        );

        const cartKey = `${source}Cart`;
        const savedCart = localStorage.getItem(cartKey);

        if (savedCart) {
            let cartItems = JSON.parse(savedCart);
            const updatedItems = cartItems.map((item) => {
                // Create unique identifier for each item (for backward compatibility)
                const itemUniqueId =
                    item.uniqueId ||
                    `${item.id}-${item.color || "no-color"}-${item.size || "no-size"}`;

                if (itemUniqueId === uniqueId) {
                    return {
                        ...item,
                        quantity:
                            type === "increment"
                                ? item.quantity + 1
                                : Math.max(1, item.quantity - 1),
                    };
                }
                return item;
            });

            localStorage.setItem(cartKey, JSON.stringify(updatedItems));
            updateCartCount();
        } else {
            // If specific cart not found, search all carts
            allCartTypes.forEach((cartKey) => {
                const cart = localStorage.getItem(cartKey);
                if (cart) {
                    let cartItems = JSON.parse(cart);
                    const updatedItems = cartItems.map((item) => {
                        const itemUniqueId =
                            item.uniqueId ||
                            `${item.id}-${item.color || "no-color"}-${item.size || "no-size"}`;

                        if (itemUniqueId === uniqueId) {
                            return {
                                ...item,
                                quantity:
                                    type === "increment"
                                        ? item.quantity + 1
                                        : Math.max(1, item.quantity - 1),
                            };
                        }
                        return item;
                    });

                    localStorage.setItem(cartKey, JSON.stringify(updatedItems));
                }
            });
            updateCartCount();
        }
    };

    // Get all cart items (useful for checkout page)
    const getAllCartItems = () => {
        const allCarts = allCartTypes.map((cartKey) => {
            const cart = localStorage.getItem(cartKey);
            if (cart) {
                try {
                    const parsedCart = JSON.parse(cart);
                    return parsedCart.map((item) => ({
                        ...item,
                        // Ensure uniqueId exists for all items
                        uniqueId:
                            item.uniqueId ||
                            `${item.id}-${item.color || "no-color"}-${item.size || "no-size"}`,
                        source: item.source || cartKey.replace("Cart", ""),
                    }));
                } catch (error) {
                    console.error(`Error parsing ${cartKey}:`, error);
                    return [];
                }
            }
            return [];
        });

        return allCarts.flat();
    };

    // Clear all carts (useful after successful order)
    const clearAllCarts = () => {
        allCartTypes.forEach((cartKey) => {
            localStorage.removeItem(cartKey);
        });
        setCartCount(0);
    };

    useEffect(() => {
        const storedCount = localStorage.getItem("cartCount");
        if (storedCount) {
            setCartCount(parseInt(storedCount, 10));
        } else {
            // Initialize cart count from existing items
            updateCartCount();
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("cartCount", cartCount.toString());
    }, [cartCount]);

    const incrementCart = (amount = 1) => {
        setCartCount((prev) => prev + amount);
    };

    const decrementCart = (amount = 1) => {
        setCartCount((prev) => Math.max(0, prev - amount));
    };

    return (
        <CartContext.Provider
            value={{
                cartCount,
                incrementCart,
                decrementCart,
                updateCartCount,
                removeItemFromAllCarts,
                updateItemQuantity,
                getAllCartItems,
                clearAllCarts,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
