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
    advanceDiscount?: number;
    advanceDiscountType?: string;
    variationId?: string;
    variationTitle?: string;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
    removeItem: (id: string, variationId?: string) => void;
    updateQuantity: (id: string, quantity: number, variationId?: string) => void;
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
                    const existingItem = state.items.find(
                        (item) => item.id === newItem.id && item.variationId === newItem.variationId
                    );
                    if (existingItem) {
                        return {
                            items: state.items.map((item) =>
                                item.id === newItem.id && item.variationId === newItem.variationId
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

            removeItem: (id, variationId) => {
                set((state) => ({
                    items: state.items.filter((item) => !(item.id === id && item.variationId === variationId)),
                }));
            },

            updateQuantity: (id, quantity, variationId) => {
                set((state) => {
                    if (quantity <= 0) {
                        return { items: state.items.filter((item) => !(item.id === id && item.variationId === variationId)) };
                    }
                    return {
                        items: state.items.map((item) =>
                            item.id === id && item.variationId === variationId ? { ...item, quantity } : item
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
                const items = get().items;
                if (items.length === 0) return 0;

                // 1. Calculate total weight of all items
                const totalWeight = items.reduce((sum, item) => {
                    return sum + (item.weight || 0) * item.quantity;
                }, 0);

                // 2. Find the highest base delivery fee among items
                // This acts as the starting fee for the first 1000g
                const maxBaseFee = items.reduce((max, item) => {
                    return Math.max(max, item.deliveryFee || 0);
                }, 0);

                // 3. Calculate surcharge for weight above 1000g
                // "100rs total increase per 1000g"
                let surcharge = 0;
                if (totalWeight > 1000) {
                    const extraWeight = totalWeight - 1000;
                    const extraChunks = Math.ceil(extraWeight / 1000);
                    surcharge = extraChunks * 100;
                }

                return maxBaseFee + surcharge;
            }
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
