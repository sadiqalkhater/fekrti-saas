// __tests__/integration/api.test.ts
/**
 * اختبارات API متكاملة على خادم يعمل وقاعدة بيانات حقيقية.
 * تُتخطّى ما لم يُضبط TEST_API_URL، مثال:
 *   TEST_API_URL=http://localhost:3000 npm test -- api.test
 */

import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.TEST_API_URL;
const describeLive = API_URL ? describe : describe.skip;

/** عميل يحتفظ بكوكي الجلسة بين الطلبات */
function client(): AxiosInstance {
  const http = axios.create({ baseURL: API_URL, validateStatus: () => true });
  let cookie = '';
  http.interceptors.request.use((config) => {
    if (cookie) config.headers.set('Cookie', cookie);
    return config;
  });
  http.interceptors.response.use((res) => {
    const set = res.headers['set-cookie'];
    if (set) cookie = set.map((c) => c.split(';')[0]).join('; ');
    return res;
  });
  return http;
}

async function register(http: AxiosInstance, name: string) {
  const email = `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.fekrti.sa`;
  const res = await http.post('/api/auth/register', { name, email, password: 'password123' });
  expect(res.status).toBe(201);
  return { id: res.data.user.id as string, email };
}

describeLive('API Integration Tests', () => {
  const owner = client();
  const other = client();
  const anonymous = client();
  let vendorId: string;
  let invoiceId: string;

  beforeAll(async () => {
    await register(owner, 'owner');
    await register(other, 'other');
    const vendor = await owner.post('/api/vendors', { businessName: 'متجر الاختبار' });
    expect(vendor.status).toBe(201);
    vendorId = vendor.data.id;
  });

  describe('Invoices API', () => {
    it('should create an invoice with 15% VAT', async () => {
      const res = await owner.post('/api/invoices', {
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        items: [{ description: 'Test Service', quantity: 2, unitPrice: 500 }],
      });
      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('invoiceNumber');
      expect(res.data.subtotal).toBe(1000);
      expect(res.data.totalAmount).toBe(1150);
      invoiceId = res.data.id;
    });

    it('should list only the owner invoices', async () => {
      const mine = await owner.get('/api/invoices');
      expect(mine.status).toBe(200);
      expect(mine.data.data.map((i: { id: string }) => i.id)).toContain(invoiceId);

      const theirs = await other.get(`/api/invoices/${invoiceId}`);
      expect(theirs.status).toBe(404);
    });

    it('should reject missing required fields', async () => {
      const res = await owner.post('/api/invoices', { clientName: 'Test' });
      expect(res.status).toBe(400);
    });

    it('should reject requests without a session', async () => {
      expect((await anonymous.get('/api/invoices')).status).toBe(401);
      expect((await anonymous.post('/api/invoices', {})).status).toBe(401);
    });

    it('should delete a draft invoice', async () => {
      expect((await owner.delete(`/api/invoices/${invoiceId}`)).status).toBe(200);
      expect((await owner.get(`/api/invoices/${invoiceId}`)).status).toBe(404);
    });
  });

  describe('Vendors API', () => {
    it('should hide bank details from other users', async () => {
      await owner.put(`/api/vendors/${vendorId}`, { ibanNumber: 'SA0380000000608010167519' });
      const pub = await other.get(`/api/vendors/${vendorId}`);
      expect(pub.status).toBe(200);
      expect(pub.data).not.toHaveProperty('ibanNumber');
      const own = await owner.get(`/api/vendors/${vendorId}`);
      expect(own.data.ibanNumber).toBe('SA0380000000608010167519');
    });

    it('should not let another user edit or delete the vendor', async () => {
      expect((await other.put(`/api/vendors/${vendorId}`, { businessName: 'hijack' })).status).toBe(403);
      expect((await other.delete(`/api/vendors/${vendorId}`)).status).toBe(403);
    });

    it('should return 404 for an unknown vendor', async () => {
      expect((await anonymous.get('/api/vendors/non-existent-id')).status).toBe(404);
    });
  });

  describe('Masar API', () => {
    it('should keep boards private to workspace members', async () => {
      const boot = await owner.get('/api/masar/bootstrap');
      expect(boot.status).toBe(200);
      const workspace = boot.data.workspaces[0];
      expect(workspace.invoicing).toBe(true);

      const board = await owner.post('/api/masar/boards', { workspaceId: workspace.id, name: 'لوحة', lists: ['للتنفيذ', 'مكتمل'] });
      expect(board.status).toBe(201);
      expect((await other.get(`/api/masar/boards/${board.data.id}`)).status).toBe(404);
      expect((await owner.get(`/api/masar/boards/${board.data.id}`)).data.lists).toHaveLength(2);
    });
  });
});
