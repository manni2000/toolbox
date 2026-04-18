import { useState } from 'react';
import { Copy, Check, FileText, Download, Plus, Trash2, CheckCircle, Calculator, DollarSign, Sparkles } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { API_URLS } from "@/lib/api-complete";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "35 85% 55%";

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
}

interface InvoiceData {
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  date: string;
  due_date: string;
  tax_rate: string;
  currency: string;
  items: InvoiceItem[];
}

export default function InvoiceGeneratorTool() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoice_number: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    date: new Date().toISOString().split('T')[0],
    due_date: '',
    tax_rate: '',
    currency: 'INR',
    items: []
  });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newItem, setNewItem] = useState<Omit<InvoiceItem, 'quantity'> & { quantity: string }>({
    description: '',
    quantity: '1',
    unit_price: 0,
    discount: 0
  });

  const addItem = () => {
    if (newItem.description && newItem.quantity && newItem.unit_price > 0) {
      setInvoiceData(prev => ({
        ...prev,
        items: [...prev.items, {
          description: newItem.description,
          quantity: parseInt(newItem.quantity),
          unit_price: newItem.unit_price,
          discount: newItem.discount
        }]
      }));
      setNewItem({
        description: '',
        quantity: '1',
        unit_price: 0,
        discount: 0
      });
    }
  };

  const removeItem = (index: number) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const generateInvoice = async () => {
    if (!invoiceData.invoice_number || !invoiceData.client_name || !invoiceData.client_email || invoiceData.items.length === 0) {
      alert('Please fill in all required fields and add at least one item');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URLS.BASE_URL}/api/finance/invoice-generator/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        const html = await response.text();
        
        // Create a new window and write the HTML content
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(html);
          newWindow.document.close();
          
          // Show a message to the user
          setTimeout(() => {
            alert('Invoice opened in new window! Click "Print to PDF" button to save as PDF.');
          }, 500);
        } else {
          // If popup is blocked, create a downloadable HTML file
          const blob = new Blob([html], { type: 'text/html' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `invoice_${invoiceData.invoice_number}.html`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          alert('Invoice downloaded as HTML file. Open it and print to PDF.');
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to generate invoice'}`);
      }
    } catch (error) {
      // console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + ((item.quantity * item.unit_price) * (1 - item.discount / 100)), 0);
  };

  const calculateTax = () => {
    const taxRate = parseFloat(invoiceData.tax_rate) || 0;
    return (calculateSubtotal() * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoiceData.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleCopy = async () => {
    const text = `Invoice Summary\n` +
      `Invoice #: ${invoiceData.invoice_number}\n` +
      `Client: ${invoiceData.client_name}\n` +
      `Email: ${invoiceData.client_email}\n` +
      `Date: ${invoiceData.date}\n` +
      `Due Date: ${invoiceData.due_date}\n\n` +
      `Items:\n${invoiceData.items.map((item, index) => 
        `${index + 1}. ${item.description} - ${item.quantity} × ${formatCurrency(item.unit_price)}${item.discount > 0 ? ` (${item.discount}% discount)` : ''} = ${formatCurrency(item.quantity * item.unit_price * (1 - item.discount / 100))}`
      ).join('\n')}\n\n` +
      `Subtotal: ${formatCurrency(calculateSubtotal())}\n` +
      `Tax (${parseFloat(invoiceData.tax_rate) || 0}%): ${formatCurrency(calculateTax())}\n` +
      `Total: ${formatCurrency(calculateTotal())}`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Invoice Generator"
      description="Create professional invoices with PDF download"
      category="Finance Tools"
      categoryPath="/category/finance"
    >
      <div className="mx-auto max-w-6xl space-y-6 md:space-y-8 px-4 md:px-0">
        {/* Invoice Details Section */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="invoice-number" className="block text-sm font-medium mb-2">Invoice Number *</label>
                <input
                  id="invoice-number"
                  type="text"
                  value={invoiceData.invoice_number}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, invoice_number: e.target.value }))}
                  placeholder="INV-001"
                  className="input-tool w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="invoice-date" className="block text-sm font-medium mb-2">Date</label>
                <input
                  id="invoice-date"
                  type="date"
                  value={invoiceData.date}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, date: e.target.value }))}
                  className="input-tool w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="invoice-due-date" className="block text-sm font-medium mb-2">Due Date</label>
                <input
                  id="invoice-due-date"
                  type="date"
                  value={invoiceData.due_date}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="input-tool w-full"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="client-name" className="block text-sm font-medium mb-2">Client Name *</label>
                <input
                  id="client-name"
                  type="text"
                  value={invoiceData.client_name}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, client_name: e.target.value }))}
                  placeholder="John Doe"
                  className="input-tool w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="client-email" className="block text-sm font-medium mb-2">Client Email *</label>
                <input
                  id="client-email"
                  type="email"
                  value={invoiceData.client_email}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, client_email: e.target.value }))}
                  placeholder="john@example.com"
                  className="input-tool w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="client-phone" className="block text-sm font-medium mb-2">Client Phone</label>
                <input
                  id="client-phone"
                  type="tel"
                  value={invoiceData.client_phone}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, client_phone: e.target.value }))}
                  placeholder="+1 234 567 8900"
                  className="input-tool w-full"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 md:mt-6">
            <div className="space-y-2">
              <label htmlFor="client-address" className="block text-sm font-medium mb-2">Client Address</label>
              <textarea
                id="client-address"
                value={invoiceData.client_address}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, client_address: e.target.value }))}
                placeholder="123 Main St, City, State 12345"
                className="input-tool w-full min-h-[80px] resize-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tax-rate" className="block text-sm font-medium mb-2">Tax Rate (%)</label>
              <input
                id="tax-rate"
                type="number"
                value={invoiceData.tax_rate}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, tax_rate: e.target.value }))}
                placeholder="0"
                aria-label="Tax Rate (%)"
                className="input-tool w-full"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="currency" className="block text-sm font-medium mb-2">Currency</label>
              <select
                id="currency"
                value={invoiceData.currency}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, currency: e.target.value }))}
                className="input-tool w-full"
              >
                <option value="INR">INR (India)</option>
                <option value="USD">USD (USA)</option>
                <option value="AED">AED (Dubai/UAE)</option>
                <option value="PKR">PKR (Pakistan)</option>
                <option value="NPR">NPR (Nepal)</option>
                <option value="LKR">LKR (Sri Lanka)</option>
                <option value="BDT">BDT (Bangladesh)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="GBP">GBP (UK)</option>
                <option value="JPY">JPY (Japan)</option>
                <option value="CNY">CNY (China)</option>
                <option value="AUD">AUD (Australia)</option>
                <option value="CAD">CAD (Canada)</option>
                <option value="SGD">SGD (Singapore)</option>
                <option value="MYR">MYR (Malaysia)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoice Items Section */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Invoice Items
          </h3>
          
          {/* Add New Item */}
          <div className="space-y-4 p-4 bg-muted rounded-lg mb-6">
            <h4 className="font-semibold">Add New Item</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="sm:col-span-2 md:col-span-1">
                <input
                  type="text"
                  placeholder="Description"
                  aria-label="Item description"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  className="input-tool w-full"
                />
              </div>
              <input
                type="number"
                placeholder="Qty"
                aria-label="Item quantity"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                className="input-tool w-full"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                aria-label="Item unit price"
                value={newItem.unit_price || ''}
                onChange={(e) => setNewItem(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))}
                className="input-tool w-full"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Discount %"
                aria-label="Item discount percentage"
                value={newItem.discount || ''}
                onChange={(e) => setNewItem(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                className="input-tool w-full"
              />
            </div>
            <button
              type="button"
              onClick={addItem} 
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {invoiceData.items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No items added yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invoiceData.items.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted rounded-lg gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.unit_price)} = {formatCurrency(item.quantity * item.unit_price)}
                      </p>
                      {item.discount > 0 && (
                        <p className="text-sm text-green-600">
                          Discount: {item.discount}% ({formatCurrency((item.quantity * item.unit_price) * (item.discount / 100))})
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="btn-secondary p-2 self-start sm:self-center flex-shrink-0"
                      aria-label={`Remove item ${index + 1}`}
                      title={`Remove item ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          {invoiceData.items.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                </div>
                {parseFloat(invoiceData.tax_rate) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Tax ({parseFloat(invoiceData.tax_rate)}%):</span>
                    <span className="font-medium">{formatCurrency(calculateTax())}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-blue-300">
                  <span className="font-semibold text-lg">Total:</span>
                  <span className="font-bold text-xl text-blue-600">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            type="button"
            onClick={generateInvoice} 
            disabled={loading || !invoiceData.invoice_number || !invoiceData.client_name || !invoiceData.client_email || invoiceData.items.length === 0}
            className="btn-primary flex-1 flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Download className="h-4 w-4" />
            {loading ? 'Opening...' : 'Preview PDF Invoice'}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="btn-secondary flex items-center justify-center gap-2 min-h-[48px]"
            disabled={invoiceData.items.length === 0}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Summary'}
          </button>
        </div>

        {/* Information Section */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Invoice Best Practices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">💡 Professional Tips</h4>
              <ul className="text-sm space-y-1">
                <li>• Use sequential invoice numbers</li>
                <li>• Include clear payment terms</li>
                <li>• Specify due dates clearly</li>
                <li>• Provide multiple payment options</li>
                <li>• Keep professional formatting</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">✅ Legal Requirements</h4>
              <ul className="text-sm space-y-1">
                <li>• Include your business details</li>
                <li>• Add tax identification numbers</li>
                <li>• Specify currency clearly</li>
                <li>• Include payment methods</li>
                <li>• Add late payment terms</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <h4 className="font-semibold">Common Invoice Elements</h4>
            <div className="text-sm space-y-1 bg-muted p-3 rounded">
              <p>• <strong>Header:</strong> Business logo and contact info</p>
              <p>• <strong>Details:</strong> Invoice number, date, due date</p>
              <p>• <strong>Client Info:</strong> Name, address, contact details</p>
              <p>• <strong>Line Items:</strong> Description, quantity, price, total</p>
              <p>• <strong>Summary:</strong> Subtotal, tax, discounts, total</p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <strong>Pro Tip:</strong> Always save a copy of generated invoices for your records 
              and send a copy to your clients for their records.
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
