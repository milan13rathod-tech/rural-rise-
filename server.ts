import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-Memory Data Store with default seed data
interface Product {
  _id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  total: number;
  paymentMethod: 'Cash on Delivery' | 'UPI (demo)';
  paymentStatus: 'Pending' | 'Paid (demo)';
  status: 'New' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

interface Ticket {
  _id: string;
  customerName: string;
  email: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  updatedAt: string;
}

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString();
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 3600 * 1000).toISOString();

let products: Product[] = [
  {
    _id: 'prod_1',
    name: 'Handwoven Bamboo Fruit Basket',
    category: 'Handicrafts',
    description: 'Eco-friendly bamboo basket woven by artisan clusters in Assam.',
    price: 450,
    stock: 24,
    image: '🧺',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    _id: 'prod_2',
    name: 'Organic High-Curcumin Turmeric (500g)',
    category: 'Farm Produce',
    description: 'Fresh sun-dried and stone-ground Lakadong turmeric powder.',
    price: 220,
    stock: 40,
    image: '🌾',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
  },
  {
    _id: 'prod_3',
    name: 'Terracotta Chai Kullad Cups (Set of 6)',
    category: 'Pottery',
    description: 'Natural clay handcrafted tea cups made with riverbed clay.',
    price: 320,
    stock: 15,
    image: '🏺',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    _id: 'prod_4',
    name: 'Handloom Khadi Cotton Stole',
    category: 'Textiles',
    description: 'Soft, naturally dyed breathable cotton scarf.',
    price: 650,
    stock: 8,
    image: '🧣',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    _id: 'prod_5',
    name: 'Wild Forest Raw Honey (500g)',
    category: 'Food',
    description: 'Unprocessed, unpasteurized natural honey collected from forest hives.',
    price: 390,
    stock: 19,
    image: '🍯',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    _id: 'prod_6',
    name: 'Brass Handcrafted Diya Oil Lamp',
    category: 'Handicrafts',
    description: 'Traditional etched brass lamp for festive decor and daily prayers.',
    price: 480,
    stock: 12,
    image: '🪔',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
];

let orders: Order[] = [
  {
    _id: 'ord_101',
    customerName: 'Aarav Sharma',
    customerPhone: '+91 98234 56789',
    address: 'Near Old Banyan Tree, Post Rampur, Dist. Alwar, Rajasthan - 301001',
    items: [
      { productId: 'prod_1', name: 'Handwoven Bamboo Fruit Basket', quantity: 2, price: 450 },
      { productId: 'prod_5', name: 'Wild Forest Raw Honey (500g)', quantity: 1, price: 390 },
    ],
    total: 1290,
    paymentMethod: 'UPI (demo)',
    paymentStatus: 'Paid (demo)',
    status: 'Shipped',
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(2),
  },
  {
    _id: 'ord_102',
    customerName: 'Pooja Patel',
    customerPhone: '+91 97412 34567',
    address: 'Plot 14, Gram Panchayat Road, Anand District, Gujarat - 388001',
    items: [
      { productId: 'prod_2', name: 'Organic High-Curcumin Turmeric (500g)', quantity: 3, price: 220 },
    ],
    total: 660,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    status: 'Packed',
    createdAt: hoursAgo(18),
    updatedAt: hoursAgo(12),
  },
  {
    _id: 'ord_103',
    customerName: 'Rameshwar Verma',
    customerPhone: '+91 94150 98765',
    address: 'Shiv Mandir Marg, Chandauli Village, Varanasi, UP - 221001',
    items: [
      { productId: 'prod_3', name: 'Terracotta Chai Kullad Cups (Set of 6)', quantity: 2, price: 320 },
    ],
    total: 640,
    paymentMethod: 'UPI (demo)',
    paymentStatus: 'Paid (demo)',
    status: 'Delivered',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  },
  {
    _id: 'ord_104',
    customerName: 'Meenakshi Sundaram',
    customerPhone: '+91 99801 23450',
    address: 'Kavalar Street, Thanjavur Rural, Tamil Nadu - 613001',
    items: [
      { productId: 'prod_4', name: 'Handloom Khadi Cotton Stole', quantity: 1, price: 650 },
    ],
    total: 650,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    status: 'New',
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
  },
];

let tickets: Ticket[] = [
  {
    _id: 'tkt_201',
    customerName: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    subject: 'Expected delivery date for bamboo baskets',
    message: 'Could you please confirm if this will arrive before the weekend festival? Order #101.',
    status: 'In Progress',
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(3),
  },
  {
    _id: 'tkt_202',
    customerName: 'Devika Rani',
    email: 'devika.pottery@example.com',
    subject: 'Bulk discount query for terracotta cups',
    message: 'We are organizing an organic village fair and want to order 50 sets of Kullad cups. Do you offer bulk discounts?',
    status: 'Open',
    createdAt: hoursAgo(14),
    updatedAt: hoursAgo(14),
  },
  {
    _id: 'tkt_203',
    customerName: 'Kishore Kumar',
    email: 'kishore.k@example.com',
    subject: 'Packaging feedback for honey jar',
    message: 'Received the honey parcel in perfect glass bottle packaging with eco-friendly straw cushioning. Thank you!',
    status: 'Resolved',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
  },
];

// Helper to generate simple IDs
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

// --- Health Check ---
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Rural Business Hub API',
    database: 'In-Memory Store (Persistent active)',
    timestamp: new Date().toISOString(),
  });
});

// --- Products Routes ---
app.get('/api/products', (_req: Request, res: Response) => {
  const sorted = [...products].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(sorted);
});

app.post('/api/products', (req: Request, res: Response) => {
  const { name, category, description, price, stock, image } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Product name is required.' });
  }
  const numericPrice = Number(price);
  if (isNaN(numericPrice) || numericPrice < 0) {
    return res.status(400).json({ message: 'Price must be a positive number.' });
  }
  const numericStock = Number(stock ?? 0);

  const newProduct: Product = {
    _id: generateId('prod'),
    name: name.trim(),
    category: category || 'Other',
    description: description ? String(description).trim() : '',
    price: numericPrice,
    stock: isNaN(numericStock) || numericStock < 0 ? 0 : Math.floor(numericStock),
    image: image ? String(image).trim() : '📦',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = products.findIndex((p) => p._id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const { name, category, description, price, stock, image } = req.body;
  const existing = products[index];

  const updated: Product = {
    ...existing,
    name: name !== undefined ? String(name).trim() : existing.name,
    category: category !== undefined ? String(category).trim() : existing.category,
    description: description !== undefined ? String(description).trim() : existing.description,
    price: price !== undefined && !isNaN(Number(price)) ? Number(price) : existing.price,
    stock: stock !== undefined && !isNaN(Number(stock)) ? Math.max(0, Math.floor(Number(stock))) : existing.stock,
    image: image !== undefined ? String(image).trim() : existing.image,
    updatedAt: new Date().toISOString(),
  };

  products[index] = updated;
  res.json(updated);
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = products.length;
  products = products.filter((p) => p._id !== id);
  if (products.length === initialLength) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json({ message: 'Product deleted' });
});

// --- Orders Routes ---
app.get('/api/orders', (_req: Request, res: Response) => {
  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(sorted);
});

app.post('/api/orders', (req: Request, res: Response) => {
  const { customerName, address, items, paymentMethod = 'Cash on Delivery', customerPhone = '' } = req.body;

  if (!customerName || !address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Customer name, address and at least one item are required.' });
  }

  let total = 0;
  const savedItems: OrderItem[] = [];

  for (const item of items) {
    const product = products.find((p) => p._id === item.productId);
    const quantity = Number(item.quantity);

    if (!product || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Invalid product or quantity.' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: `Not enough stock for ${product.name}.` });
    }

    product.stock -= quantity;
    product.updatedAt = new Date().toISOString();
    total += product.price * quantity;

    savedItems.push({
      productId: product._id,
      name: product.name,
      quantity,
      price: product.price,
    });
  }

  const newOrder: Order = {
    _id: generateId('ord'),
    customerName: String(customerName).trim(),
    customerPhone: String(customerPhone).trim(),
    address: String(address).trim(),
    items: savedItems,
    total,
    paymentMethod: paymentMethod === 'UPI (demo)' ? 'UPI (demo)' : 'Cash on Delivery',
    paymentStatus: paymentMethod === 'UPI (demo)' ? 'Paid (demo)' : 'Pending',
    status: 'New',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['New', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid order status' });
  }

  const order = orders.find((o) => o._id === id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();

  // If order is cancelled and wasn't previously cancelled, restore stock
  res.json(order);
});

// --- Support Tickets Routes ---
app.get('/api/tickets', (_req: Request, res: Response) => {
  const sorted = [...tickets].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(sorted);
});

app.post('/api/tickets', (req: Request, res: Response) => {
  const { customerName, email, subject, message } = req.body;

  if (!customerName || !subject || !message) {
    return res.status(400).json({ message: 'Customer name, subject and message are required.' });
  }

  const newTicket: Ticket = {
    _id: generateId('tkt'),
    customerName: String(customerName).trim(),
    email: email ? String(email).trim() : '',
    subject: String(subject).trim(),
    message: String(message).trim(),
    status: 'Open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tickets.push(newTicket);
  res.status(201).json(newTicket);
});

app.patch('/api/tickets/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['Open', 'In Progress', 'Resolved'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid ticket status' });
  }

  const ticket = tickets.find((t) => t._id === id);
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();
  res.json(ticket);
});

// --- Global Error Handler ---
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Error]:', err);
  res.status(500).json({ message: err.message || 'Internal server error.' });
});

// --- Frontend Integration (Vite Middleware in Dev, Static in Prod) ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Rural Business Hub running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
