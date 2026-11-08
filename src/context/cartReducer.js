export default function cartReducer(cart, action) {
  switch (action.type) {
    case 'ADD': {
      const product = action.product;
      if (product.stock < 1) return cart;
      const existing = cart.find(item => item.id === product.id);
      if (existing) {
        return cart.map(item => item.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
          : item);
      }
      return [...cart, { id: product.id, title: product.title, price: product.price,
        thumbnail: product.thumbnail, stock: product.stock, quantity: 1 }];
    }
    case 'INCREASE':
      return cart.map(item => item.id === action.id
        ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) } : item);
    case 'DECREASE':
      return cart.map(item => item.id === action.id
        ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item);
    case 'REMOVE':
      return cart.filter(item => item.id !== action.id);
    case 'CLEAR':
      return [];
    default:
      return cart;
  }
}
