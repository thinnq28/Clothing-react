// cartService.ts

export type Cart = Map<number, number>;

const CART_KEY = 'cart';

// Lấy giỏ hàng từ localStorage
export function getCart(): Cart {
  const storedCart = localStorage.getItem(CART_KEY);
  if (storedCart) {
    try {
      const parsed = JSON.parse(storedCart);
      return new Map<number, number>(parsed);
    } catch (e) {
      console.error('Lỗi khi parse cart từ localStorage:', e);
    }
  }
  return new Map<number, number>();
}

// Lưu giỏ hàng vào localStorage
function saveCartToLocalStorage(cart: Cart): void {
  localStorage.setItem(CART_KEY, JSON.stringify(Array.from(cart.entries())));
}

// Thêm sản phẩm vào giỏ hàng
export function addToCart(variantId: number, quantity: number = 1): void {
  const cart = getCart();
  if (cart.has(variantId)) {
    cart.set(variantId, cart.get(variantId)! + quantity);
  } else {
    cart.set(variantId, quantity);
  }
  saveCartToLocalStorage(cart);
}

// Xóa toàn bộ giỏ hàng
export function clearCart(): void {
  const cart = new Map<number, number>();
  saveCartToLocalStorage(cart);
}

// Gán giỏ hàng mới
export function setCart(cart: Cart): void {
  saveCartToLocalStorage(cart ?? new Map<number, number>());
}
