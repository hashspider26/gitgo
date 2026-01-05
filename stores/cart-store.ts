import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
    id: string;
    title: string;
    price: number;
    image?: string;
    slug: string;
    quantity: number;
    deliveryFee?: number;
    weight?: number; // Weight in grams
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    setIsOpen: (isOpen: boolean) => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    getTotalDeliveryFee: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (newItem) => {
                set((state) => {
                    const qty = newItem.quantity || 1;
                    const existingItem = state.items.find((item) => item.id === newItem.id);
                    if (existingItem) {
                        return {
                            items: state.items.map((item) =>
                                item.id === newItem.id
                                    ? { ...item, quantity: item.quantity + qty }
                                    : item
                            ),
                            isOpen: true,
                        };
                    }
                    const { quantity, ...rest } = newItem;
                    return {
                        items: [...state.items, { ...rest, quantity: qty }],
                        isOpen: true,
                    };
                });
            },

            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
            },

            updateQuantity: (id, quantity) => {
                set((state) => {
                    if (quantity <= 0) {
                        return { items: state.items.filter((item) => item.id !== id) };
                    }
                    return {
                        items: state.items.map((item) =>
                            item.id === id ? { ...item, quantity } : item
                        ),
                    };
                });
            },

            clearCart: () => set({ items: [] }),

            setIsOpen: (isOpen) => set({ isOpen }),

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },

            getTotalDeliveryFee: () => {
                // Calculate delivery fee for each item individually based on its weight and quantity
                const items = get().items;
                let totalFee = 0;

                for (const item of items) {
                    const baseDeliveryFee = item.deliveryFee || 0;
                    if (baseDeliveryFee === 0) continue; // Free delivery items don't contribute

                    const itemWeight = item.weight || 0;
                    const totalItemWeight = itemWeight * item.quantity;

                    // Logic: Double the delivery fee for every 1000g exceeded
                    // 0-1000g: 1x
                    // 1001-2000g: 2x
                    // 2001-3000g: 3x
                    // etc.
                    let multiplier = 1;
                    if (totalItemWeight > 1000) {
                        multiplier = Math.ceil(totalItemWeight / 1000);
                    }

                    totalFee += (baseDeliveryFee * multiplier);
                }

                return totalFee;
            }
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
