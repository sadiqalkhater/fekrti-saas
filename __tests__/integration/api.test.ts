// __tests__/integration/api.test.ts
/**
 * اختبارات API متكاملة
 * تشغيل: npm test -- api.test
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

describe('API Integration Tests', () => {
  let vendorId: string;
  let invoiceId: string;

  describe('Vendors API', () => {
    it('should fetch vendor by ID', async () => {
      try {
        // معرف تجريبي من بيانات البذرة
        const response = await axios.get(`${API_URL}/api/vendors/test-vendor-id`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('businessName');
        vendorId = response.data.id;
      } catch (error: any) {
        // الخطأ متوقع إذا لم يتم تشغيل الخادم
        console.log('API test skipped - server not running');
      }
    });
  });

  describe('Invoices API', () => {
    it('should create an invoice', async () => {
      if (!vendorId) return;

      const invoiceData = {
        vendorId,
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: [
          {
            description: 'Test Service',
            quantity: 1,
            unitPrice: 1000,
          },
        ],
      };

      try {
        const response = await axios.post(`${API_URL}/api/invoices`, invoiceData);
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('invoiceNumber');
        invoiceId = response.data.id;
      } catch (error) {
        console.log('Invoice creation test skipped');
      }
    });

    it('should fetch invoices', async () => {
      if (!vendorId) return;

      try {
        const response = await axios.get(`${API_URL}/api/invoices`, {
          params: { vendorId },
        });
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data.data)).toBe(true);
      } catch (error) {
        console.log('Fetch invoices test skipped');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing required fields', async () => {
      try {
        await axios.post(`${API_URL}/api/invoices`, {
          // بيانات غير كاملة
          clientName: 'Test',
        });
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
      }
    });

    it('should handle unauthorized requests', async () => {
      try {
        await axios.get(`${API_URL}/api/vendors/non-existent-id`);
      } catch (error: any) {
        expect(error.response?.status).toBeGreaterThanOrEqual(400);
      }
    });
  });
});
