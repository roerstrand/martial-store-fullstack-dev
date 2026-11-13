import api from './api'
import * as articles from './articleService'
import * as products from './productService'
import * as cart from './cartService'
import * as favorites from './favoriteService'
import * as orders from './orderService'
import * as admin from './adminService'

vi.mock('./api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

beforeEach(() => {
  ;['get', 'post', 'put', 'patch', 'delete'].forEach((m) => api[m].mockResolvedValue({ data: { ok: m } }))
})

describe('articleService', () => {
  it('builds the query string', async () => {
    await articles.getArticles({ category: 'bjj', limit: 3 })
    expect(api.get).toHaveBeenCalledWith('/articles?category=bjj&limit=3')
  })

  it('omits the query string without params', async () => {
    await articles.getArticles()
    expect(api.get).toHaveBeenCalledWith('/articles')
  })

  it('fetches one article and returns the data', async () => {
    expect(await articles.getArticleById('a1')).toEqual({ ok: 'get' })
    expect(api.get).toHaveBeenCalledWith('/articles/a1')
  })
})

describe('productService', () => {
  it.each([
    [() => products.getProducts({ category: 'boxing' }), '/products?category=boxing'],
    [() => products.getProducts(), '/products'],
    [() => products.getNewArrivals(), '/products?newArrival=true'],
    [() => products.getLimitedSale(), '/products?limitedSale=true'],
    [() => products.getProduct('p1'), '/products/p1'],
  ])('calls GET %#', async (call, url) => {
    await call()
    expect(api.get).toHaveBeenCalledWith(url)
  })
})

describe('cartService', () => {
  it('reads and creates the cart', async () => {
    await cart.getCart()
    await cart.createCart()
    expect(api.get).toHaveBeenCalledWith('/carts/me')
    expect(api.post).toHaveBeenCalledWith('/carts')
  })

  it('adds an item with size', async () => {
    await cart.addCartItem('c1', 'p1', 'A2')
    expect(api.post).toHaveBeenCalledWith('/carts/c1/products', { product_id: 'p1', size: 'A2' })
  })

  it('removes an item with and without size', async () => {
    await cart.removeCartItem('c1', 'p1', 'A2')
    await cart.removeCartItem('c1', 'p1')
    expect(api.delete).toHaveBeenNthCalledWith(1, '/carts/c1/products/p1', { params: { size: 'A2' } })
    expect(api.delete).toHaveBeenNthCalledWith(2, '/carts/c1/products/p1', { params: undefined })
  })

  it('changes quantity and resets', async () => {
    await cart.increaseQuantity('c1', 'p1')
    await cart.decreaseQuantity('c1', 'p1')
    await cart.resetCart('c1')
    expect(api.patch).toHaveBeenCalledWith('/carts/c1/products/p1/increase')
    expect(api.patch).toHaveBeenCalledWith('/carts/c1/products/p1/decrease')
    expect(api.delete).toHaveBeenCalledWith('/carts/c1/reset')
  })
})

describe('favoriteService', () => {
  it('calls the favorites endpoints', async () => {
    await favorites.getMyFavorites()
    await favorites.addProductToFavorites('p1')
    await favorites.removeProductFromFavorites('p1')
    expect(api.get).toHaveBeenCalledWith('/favorites/me')
    expect(api.post).toHaveBeenCalledWith('/favorites/products/p1')
    expect(api.delete).toHaveBeenCalledWith('/favorites/products/p1')
  })
})

describe('orderService', () => {
  it('creates an order', async () => {
    await orders.createOrder([{ product_id: 'p1' }], 100, 'standard', 'PostNord')
    expect(api.post).toHaveBeenCalledWith('/orders', {
      products: [{ product_id: 'p1' }],
      totalPrice: 100,
      shippingMethod: 'standard',
      carrier: 'PostNord',
    })
  })

  it('reads orders', async () => {
    await orders.getMyOrders()
    await orders.getOrder('o1')
    expect(api.get).toHaveBeenCalledWith('/orders/me')
    expect(api.get).toHaveBeenCalledWith('/orders/o1')
  })
})

describe('adminService', () => {
  it('manages orders', async () => {
    await admin.adminGetAllOrders()
    await admin.adminUpdateOrderStatus('o1', 'shipped')
    await admin.adminDeleteOrder('o1')
    expect(api.get).toHaveBeenCalledWith('/orders')
    expect(api.patch).toHaveBeenCalledWith('/orders/o1/status', { status: 'shipped' })
    expect(api.delete).toHaveBeenCalledWith('/orders/o1')
  })

  it('manages users and products', async () => {
    await admin.adminGetAllUsers()
    await admin.adminCreateProduct({ title: 'Gi' })
    await admin.adminUpdateProduct('p1', { price: 1 })
    await admin.adminDeleteProduct('p1')
    expect(api.get).toHaveBeenCalledWith('/users')
    expect(api.post).toHaveBeenCalledWith('/products', { title: 'Gi' })
    expect(api.put).toHaveBeenCalledWith('/products/p1', { price: 1 })
    expect(api.delete).toHaveBeenCalledWith('/products/p1')
  })
})
