import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  MessageCircle,
  Plus,
  Search,
  Leaf,
  Menu,
  X,
  ArrowUpRight,
  IndianRupee,
  Boxes,
  CircleAlert,
  Trash2,
  Pencil,
  RefreshCw,
} from 'lucide-react';

const API = '/api';

const money = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n || 0);

export interface Product {
  _id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  createdAt?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  customerName: string;
  customerPhone?: string;
  address: string;
  items: OrderItem[];
  total: number;
  paymentMethod: 'Cash on Delivery' | 'UPI (demo)';
  paymentStatus: 'Pending' | 'Paid (demo)';
  status: 'New' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt?: string;
}

export interface Ticket {
  _id: string;
  customerName: string;
  email?: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt?: string;
}

const demoProducts: Product[] = [
  {
    _id: 'demo1',
    name: 'Handwoven Cotton Basket',
    category: 'Handicrafts',
    description: 'Handwoven by local artisans using natural river reeds',
    price: 450,
    stock: 18,
    image: '🧺',
  },
  {
    _id: 'demo2',
    name: 'Organic Turmeric Powder',
    category: 'Farm Produce',
    description: 'Freshly ground native Lakadong turmeric',
    price: 180,
    stock: 32,
    image: '🌾',
  },
  {
    _id: 'demo3',
    name: 'Terracotta Tea Cups (Set of 2)',
    category: 'Pottery',
    description: 'Traditional handmade clay pottery',
    price: 320,
    stock: 12,
    image: '🏺',
  },
  {
    _id: 'demo4',
    name: 'Handloom Cotton Stole',
    category: 'Textiles',
    description: 'Soft, naturally dyed village weave cotton',
    price: 650,
    stock: 9,
    image: '🧣',
  },
];

const nav = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products & sales', icon: Package },
  { id: 'orders', label: 'Orders & payments', icon: ShoppingBag },
  { id: 'delivery', label: 'Logistics', icon: Truck },
  { id: 'support', label: 'Customer support', icon: MessageCircle },
];

export default function App() {
  const [page, setPage] = useState('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [showProduct, setShowProduct] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showOrder, setShowOrder] = useState(false);
  const [showTicket, setShowTicket] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, o, t] = await Promise.all([
        fetch(`${API}/products`),
        fetch(`${API}/orders`),
        fetch(`${API}/tickets`),
      ]);
      if (!p.ok || !o.ok || !t.ok) throw new Error('API unavailable');
      const pData = await p.json();
      const oData = await o.json();
      const tData = await t.json();
      setProducts(pData);
      setOrders(oData);
      setTickets(tData);
      setApiOnline(true);
    } catch {
      setApiOnline(false);
      setProducts(demoProducts);
      setOrders([]);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (notice) {
      const id = setTimeout(() => setNotice(''), 4000);
      return () => clearTimeout(id);
    }
  }, [notice]);

  const stats = useMemo(
    () => ({
      sales: orders.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + (o.total || 0), 0),
      orders: orders.length,
      products: products.length,
      open: tickets.filter((t) => t.status !== 'Resolved').length,
    }),
    [orders, products, tickets]
  );

  const filtered = products.filter((p) =>
    `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase())
  );

  const refresh = () => load();

  async function saveProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get('name'),
      category: fd.get('category'),
      description: fd.get('description'),
      price: Number(fd.get('price')),
      stock: Number(fd.get('stock')),
      image: fd.get('image') || '📦',
    };
    try {
      const url = editProduct ? `${API}/products/${editProduct._id}` : `${API}/products`;
      const r = await fetch(url, {
        method: editProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message);
      setNotice(editProduct ? 'Product updated' : 'Product added');
      setShowProduct(false);
      setEditProduct(null);
      load();
    } catch (err: any) {
      setNotice(
        apiOnline
          ? err.message
          : 'Start backend and connect MongoDB to save products. Demo mode is read-only.'
      );
    }
  }

  async function deleteProduct(p: Product) {
    if (!confirm(`Delete ${p.name}?`)) return;
    try {
      const r = await fetch(`${API}/products/${p._id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error();
      setNotice('Product deleted');
      load();
    } catch {
      setNotice('Could not delete. Ensure backend and database are running.');
    }
  }

  async function createOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const product = products.find((p) => p._id === fd.get('productId'));
    const quantity = Number(fd.get('quantity'));
    if (!product || quantity < 1) return;
    if (product.stock < quantity) {
      setNotice('Not enough stock for this product.');
      return;
    }
    try {
      const r = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fd.get('customerName'),
          customerPhone: fd.get('customerPhone'),
          address: fd.get('address'),
          paymentMethod: fd.get('paymentMethod'),
          items: [{ productId: product._id, quantity }],
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setNotice('Order created successfully');
      setShowOrder(false);
      load();
    } catch (err: any) {
      setNotice(
        apiOnline
          ? err.message
          : 'Order creation needs the backend and database. Demo products are shown for preview.'
      );
    }
  }

  async function statusUpdate(kind: 'orders' | 'tickets', id: string, status: string) {
    try {
      const r = await fetch(`${API}/${kind}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setNotice('Status updated');
      load();
    } catch (err: any) {
      setNotice(err.message || 'Could not update status.');
    }
  }

  async function createTicket(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const r = await fetch(`${API}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fd.get('customerName'),
          email: fd.get('email'),
          subject: fd.get('subject'),
          message: fd.get('message'),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setNotice('Support request received');
      setShowTicket(false);
      load();
    } catch (err: any) {
      setNotice(
        apiOnline ? err.message : 'Support requests need the backend and database.'
      );
    }
  }

  const title = nav.find((n) => n.id === page)?.label || 'Overview';

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'show' : ''}`}>
        <div className="brand">
          <div className="logo-icon">
            <Leaf size={18} />
          </div>
          <div>
            <h2>RuralRoot</h2>
            <span>BUSINESS HUB</span>
          </div>
          <button className="icon-btn close-nav" onClick={() => setMobileNav(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="workspace">
          <div className="avatar">RB</div>
          <div>
            <b>Rural Business</b>
            <small>Seller workspace</small>
          </div>
          <span className="dot" />
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav>
          {nav.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${page === n.id ? 'active' : ''}`}
              onClick={() => {
                setPage(n.id);
                setMobileNav(false);
              }}
            >
              <n.icon size={18} />
              <span>{n.label}</span>
              {n.id === 'support' && stats.open > 0 && <em>{stats.open}</em>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <MessageCircle size={18} />
            </div>
            <b>Need a hand?</b>
            <p>We're here to help your business grow.</p>
            <button onClick={() => setPage('support')}>
              Get support <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="seller-mini">
            <div className="seller-avatar">IK</div>
            <div>
              <b>Local Seller</b>
              <small>Free plan</small>
            </div>
            <span>•••</span>
          </div>
        </div>
      </aside>

      {mobileNav && <div className="overlay" onClick={() => setMobileNav(false)} />}

      <main className="main">
        <header className="topbar">
          <div className="top-left">
            <button className="icon-btn menu-btn" onClick={() => setMobileNav(true)}>
              <Menu size={18} />
            </button>
            <div className="crumb">
              Workspace <span>/</span> <b>{title}</b>
            </div>
          </div>
          <div className="top-actions">
            <div className={`connection ${apiOnline ? 'online' : 'offline'}`}>
              <span /> {apiOnline ? 'Database connected' : 'Preview mode'}
            </div>
            <button className="icon-btn" title="Refresh data" onClick={refresh}>
              <RefreshCw size={17} />
            </button>
            <div className="top-avatar">IK</div>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                }).toUpperCase()}
              </div>
              <h1>{page === 'overview' ? 'Good morning, Seller 👋' : title}</h1>
              <p>
                {page === 'overview'
                  ? "Here's what's happening with your business today."
                  : 'Manage your ' + title.toLowerCase() + ' from one simple workspace.'}
              </p>
            </div>
            <div className="heading-actions">
              <button className="btn btn-light" onClick={refresh}>
                <RefreshCw size={16} /> Refresh
              </button>
              {page === 'products' && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditProduct(null);
                    setShowProduct(true);
                  }}
                >
                  <Plus size={17} /> Add product
                </button>
              )}
              {page === 'orders' && (
                <button className="btn btn-primary" onClick={() => setShowOrder(true)}>
                  <Plus size={17} /> New order
                </button>
              )}
              {page === 'support' && (
                <button className="btn btn-primary" onClick={() => setShowTicket(true)}>
                  <Plus size={17} /> New request
                </button>
              )}
            </div>
          </div>

          {notice && (
            <div className="notice">
              <span>{notice}</span>
              <button onClick={() => setNotice('')}>
                <X size={15} />
              </button>
            </div>
          )}

          {page === 'overview' && (
            <>
              <section className="welcome-banner">
                <div className="welcome-copy">
                  <span className="banner-tag">
                    <Leaf size={13} /> YOUR BUSINESS, GROWING
                  </span>
                  <h2>
                    Small beginnings.
                    <br />
                    <i>Big possibilities.</i>
                  </h2>
                  <p>Every product tells a story. Let's help more people discover yours.</p>
                  <button className="banner-btn" onClick={() => setPage('products')}>
                    Explore your products <ArrowUpRight size={16} />
                  </button>
                </div>
                <div className="banner-art">
                  <div className="sun" />
                  <div className="hill hill-one" />
                  <div className="hill hill-two" />
                  <div className="plant plant-one">🌿</div>
                  <div className="plant plant-two">🪴</div>
                  <div className="basket-art">🧺</div>
                </div>
              </section>

              <section className="stats-grid">
                <Stat
                  icon={IndianRupee}
                  label="Total sales"
                  value={money(stats.sales)}
                  note="From recorded orders"
                  tone="green"
                />
                <Stat
                  icon={ShoppingBag}
                  label="Total orders"
                  value={String(stats.orders)}
                  note="All order activity"
                  tone="orange"
                />
                <Stat
                  icon={Boxes}
                  label="Active products"
                  value={String(stats.products)}
                  note="In your catalogue"
                  tone="purple"
                />
                <Stat
                  icon={MessageCircle}
                  label="Open support"
                  value={String(stats.open)}
                  note="Awaiting resolution"
                  tone="blue"
                />
              </section>

              <div className="section-grid">
                <section className="panel products-panel">
                  <div className="panel-head">
                    <div>
                      <h3>Popular products</h3>
                      <p>Your product catalogue at a glance</p>
                    </div>
                    <button className="text-link" onClick={() => setPage('products')}>
                      View all <ArrowUpRight size={14} />
                    </button>
                  </div>
                  <div className="mini-products">
                    {products.slice(0, 4).map((p, i) => (
                      <div className="mini-product" key={p._id}>
                        <div className={`product-emoji color-${i % 4}`}>
                          {p.image?.startsWith('http') ? (
                            <img src={p.image} alt="" />
                          ) : (
                            p.image || '📦'
                          )}
                        </div>
                        <div className="mini-product-info">
                          <b>{p.name}</b>
                          <small>{p.category}</small>
                        </div>
                        <div className="mini-price">
                          <b>{money(p.price)}</b>
                          <small>{p.stock} in stock</small>
                        </div>
                      </div>
                    ))}
                    {!products.length && <Empty text="Add your first product to get started." />}
                  </div>
                </section>

                <section className="panel activity-panel">
                  <div className="panel-head">
                    <div>
                      <h3>Recent orders</h3>
                      <p>Keep track of customer purchases</p>
                    </div>
                    <button className="text-link" onClick={() => setPage('orders')}>
                      View all <ArrowUpRight size={14} />
                    </button>
                  </div>
                  {orders.slice(0, 4).map((o) => (
                    <div className="activity-row" key={o._id}>
                      <div className="activity-icon">
                        <ShoppingBag size={16} />
                      </div>
                      <div className="activity-info">
                        <b>{o.customerName}</b>
                        <small>{o.items?.map((i) => i.name).join(', ')}</small>
                      </div>
                      <div className="activity-value">
                        <b>{money(o.total)}</b>
                        <Status status={o.status} />
                      </div>
                    </div>
                  ))}
                  {!orders.length && <Empty text="Your new orders will appear here." />}
                </section>
              </div>

              <section className="quick-strip">
                <div>
                  <div className="quick-icon">
                    <Truck size={20} />
                  </div>
                  <div>
                    <b>Keep deliveries moving</b>
                    <p>Update dispatch and delivery status in Logistics.</p>
                  </div>
                </div>
                <button className="btn btn-light" onClick={() => setPage('delivery')}>
                  Manage deliveries <ArrowUpRight size={15} />
                </button>
              </section>
            </>
          )}

          {page === 'products' && (
            <section className="panel">
              <div className="panel-head panel-head-wrap">
                <div>
                  <h3>Product catalogue</h3>
                  <p>Add products and keep stock up to date.</p>
                </div>
                <div className="search-box">
                  <Search size={16} />
                  <input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>CATEGORY</th>
                      <th>PRICE</th>
                      <th>STOCK</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => (
                      <tr key={p._id}>
                        <td>
                          <div className="table-product">
                            <div className={`product-emoji color-${i % 4}`}>
                              {p.image?.startsWith('http') ? (
                                <img src={p.image} alt="" />
                              ) : (
                                p.image || '📦'
                              )}
                            </div>
                            <div>
                              <b>{p.name}</b>
                              <small>{p.description}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="category-pill">{p.category}</span>
                        </td>
                        <td>
                          <b>{money(p.price)}</b>
                        </td>
                        <td>
                          <span className={p.stock < 10 ? 'stock-low' : 'stock-ok'}>
                            {p.stock} units
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="icon-btn"
                              title="Edit"
                              onClick={() => {
                                setEditProduct(p);
                                setShowProduct(true);
                              }}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              className="icon-btn danger"
                              title="Delete"
                              onClick={() => deleteProduct(p)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filtered.length && (
                  <Empty text="No products found. Try another search or add a product." />
                )}
              </div>
            </section>
          )}

          {page === 'orders' && (
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h3>Orders & payments</h3>
                  <p>Review purchases, payment status and order progress.</p>
                </div>
                <span className="count-pill">{orders.length} orders</span>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ORDER / CUSTOMER</th>
                      <th>AMOUNT</th>
                      <th>PAYMENT</th>
                      <th>ORDER STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id}>
                        <td>
                          <div className="table-product">
                            <div className="order-symbol">
                              <ShoppingBag size={17} />
                            </div>
                            <div>
                              <b>{o.customerName}</b>
                              <small>
                                {o._id.slice(-7).toUpperCase()} ·{' '}
                                {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                              </small>
                              <small>
                                {o.items?.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <b>{money(o.total)}</b>
                        </td>
                        <td>
                          <Status status={o.paymentStatus} />
                          <small className="cell-sub">{o.paymentMethod}</small>
                        </td>
                        <td>
                          <select
                            className="status-select"
                            value={o.status}
                            onChange={(e) => statusUpdate('orders', o._id, e.target.value)}
                          >
                            {['New', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!orders.length && (
                  <Empty text="No orders yet. Create a sample order to test the workflow." />
                )}
              </div>
              <p className="disclaimer">
                Payment demo: “UPI (demo)” only marks a test order as paid. It does not process real money.
              </p>
            </section>
          )}

          {page === 'delivery' && (
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h3>Delivery tracking</h3>
                  <p>Move orders through packing, shipping and delivery.</p>
                </div>
              </div>

              {orders
                .filter((o) => o.status !== 'Cancelled')
                .map((o) => (
                  <div className="delivery-row" key={o._id}>
                    <div className="delivery-icon">
                      <Truck size={20} />
                    </div>
                    <div className="delivery-main">
                      <b>{o.customerName}</b>
                      <p>{o.address}</p>
                      <small>
                        Order #{o._id.slice(-7).toUpperCase()} ·{' '}
                        {o.items?.map((i) => i.name).join(', ')}
                      </small>
                      <div className="progress-track">
                        <div
                          style={{
                            width:
                              (
                                {
                                  New: '12%',
                                  Packed: '38%',
                                  Shipped: '68%',
                                  Delivered: '100%',
                                } as Record<string, string>
                              )[o.status] || '0%',
                          }}
                        />
                      </div>
                      <div className="progress-labels">
                        <span>Order placed</span>
                        <span>Packed</span>
                        <span>Shipped</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                    <div className="delivery-status">
                      <Status status={o.status} />
                      <select
                        className="status-select"
                        value={o.status}
                        onChange={(e) => statusUpdate('orders', o._id, e.target.value)}
                      >
                        {['New', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              {!orders.filter((o) => o.status !== 'Cancelled').length && (
                <Empty text="Orders will appear here so you can track deliveries." />
              )}
            </section>
          )}

          {page === 'support' && (
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h3>Customer support inbox</h3>
                  <p>Collect customer questions and track each request.</p>
                </div>
                <span className="count-pill">{stats.open} open</span>
              </div>

              {tickets.map((t) => (
                <div className="ticket-row" key={t._id}>
                  <div className="ticket-icon">
                    <MessageCircle size={18} />
                  </div>
                  <div className="ticket-main">
                    <b>{t.subject}</b>
                    <p>{t.message}</p>
                    <small>
                      {t.customerName}
                      {t.email ? ` · ${t.email}` : ''} ·{' '}
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                    </small>
                  </div>
                  <div className="ticket-actions">
                    <Status status={t.status} />
                    <select
                      className="status-select"
                      value={t.status}
                      onChange={(e) => statusUpdate('tickets', t._id, e.target.value)}
                    >
                      {['Open', 'In Progress', 'Resolved'].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              {!tickets.length && (
                <Empty text="No support requests yet. Create a test request to see how the inbox works." />
              )}
            </section>
          )}

          <footer className="footer">
            <span>© 2026 RuralRoot Business Hub</span>
            <span>
              Built for local makers, growers & dreamers <Leaf size={13} />
            </span>
          </footer>
        </div>
      </main>

      {showProduct && (
        <Modal
          title={editProduct ? 'Edit product' : 'Add a product'}
          onClose={() => {
            setShowProduct(false);
            setEditProduct(null);
          }}
        >
          <form className="form-grid" onSubmit={saveProduct}>
            <label>
              Product name
              <input
                name="name"
                required
                defaultValue={editProduct?.name || ''}
                placeholder="e.g. Handmade bamboo basket"
              />
            </label>
            <label>
              Category
              <select name="category" defaultValue={editProduct?.category || 'Handicrafts'}>
                {['Handicrafts', 'Farm Produce', 'Pottery', 'Textiles', 'Food', 'Other'].map(
                  (c) => (
                    <option key={c}>{c}</option>
                  )
                )}
              </select>
            </label>
            <label>
              Price (₹)
              <input
                name="price"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={editProduct?.price || ''}
                placeholder="450"
              />
            </label>
            <label>
              Stock quantity
              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={editProduct?.stock ?? ''}
                placeholder="20"
              />
            </label>
            <label className="full-field">
              Description
              <textarea
                name="description"
                defaultValue={editProduct?.description || ''}
                placeholder="Tell customers what makes it special"
                rows={3}
              />
            </label>
            <label className="full-field">
              Emoji or image URL
              <input
                name="image"
                defaultValue={editProduct?.image || '📦'}
                placeholder="🧺 or https://..."
              />
            </label>
            <div className="modal-actions full-field">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setShowProduct(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" type="submit">
                {editProduct ? 'Save changes' : 'Add product'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showOrder && (
        <Modal title="Create an order" onClose={() => setShowOrder(false)}>
          <form className="form-grid" onSubmit={createOrder}>
            <label>
              Customer name
              <input name="customerName" required placeholder="Customer full name" />
            </label>
            <label>
              Phone number
              <input name="customerPhone" placeholder="Optional phone number" />
            </label>
            <label className="full-field">
              Delivery address
              <textarea
                name="address"
                required
                rows={2}
                placeholder="Village, district, state, PIN code"
              />
            </label>
            <label className="full-field">
              Product
              <select name="productId" required>
                {products.map((p) => (
                  <option key={p._id} value={p._id} disabled={p.stock < 1}>
                    {p.name} — {money(p.price)} ({p.stock} left)
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantity
              <input name="quantity" type="number" min="1" defaultValue="1" required />
            </label>
            <label>
              Payment method
              <select name="paymentMethod">
                <option>Cash on Delivery</option>
                <option>UPI (demo)</option>
              </select>
            </label>
            <p className="form-hint full-field">
              This demo creates a local test order. UPI is simulated and does not collect real
              payments.
            </p>
            <div className="modal-actions full-field">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setShowOrder(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" type="submit">
                Create order
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showTicket && (
        <Modal title="New support request" onClose={() => setShowTicket(false)}>
          <form className="form-grid" onSubmit={createTicket}>
            <label>
              Customer name
              <input name="customerName" required placeholder="Customer name" />
            </label>
            <label>
              Email (optional)
              <input name="email" type="email" placeholder="name@example.com" />
            </label>
            <label className="full-field">
              Subject
              <input
                name="subject"
                required
                placeholder="What does the customer need help with?"
              />
            </label>
            <label className="full-field">
              Message
              <textarea
                name="message"
                required
                rows={4}
                placeholder="Describe the issue..."
              />
            </label>
            <div className="modal-actions full-field">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setShowTicket(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" type="submit">
                Submit request
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
  note: string;
  tone: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={19} />
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </div>
  );
}

function Status({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  let cls = 'neutral';
  if (['delivered', 'resolved', 'paid (demo)'].includes(s)) cls = 'success';
  else if (['shipped', 'in progress', 'packed'].includes(s)) cls = 'progress';
  else if (['cancelled'].includes(s)) cls = 'danger';
  else if (['new', 'open', 'pending'].includes(s)) cls = 'warning';
  return (
    <span className={`status ${cls}`}>
      <span />
      {status}
    </span>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <CircleAlert size={21} />
      </div>
      <b>Nothing to show yet</b>
      <p>{text}</p>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="modal">
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={19} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
