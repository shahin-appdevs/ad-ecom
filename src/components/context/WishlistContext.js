"use client";
import { createContext, useState, useEffect, useContext } from 'react';

// Create context with default value
export const WishlistContext = createContext({
  wishlistItems: [],
  wishlistCount: 0,
  updateWishlist: () => {}
});

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        const loadWishlist = () => {
            const wishlist = localStorage.getItem('wishlist');
            if (wishlist) {
                try {
                    const parsedWishlist = JSON.parse(wishlist);
                    setWishlistItems(parsedWishlist);
                    setWishlistCount(parsedWishlist.length);
                } catch (error) {
                    console.error('Error parsing wishlist:', error);
                }
            }
        };

        loadWishlist();

        const handleStorageChange = (e) => {
            if (e.key === 'wishlist') {
                loadWishlist();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const updateWishlist = (newWishlist) => {
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        setWishlistItems(newWishlist);
        setWishlistCount(newWishlist.length);
    };

    return (
        <WishlistContext.Provider value={{ 
            wishlistItems, 
            wishlistCount, 
            updateWishlist 
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

// Custom hook with error handling
export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};