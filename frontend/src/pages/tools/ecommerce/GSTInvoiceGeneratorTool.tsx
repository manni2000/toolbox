import { useState } from "react";
import { Download, Plus, Trash2, Sparkles, FileText, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import ToolLayout from "@/components/layout/ToolLayout";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";
import { toast } from "@/lib/toast";
import ToolFAQ from "@/components/ToolFAQ";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const categoryColor = "142 76% 36%";

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

const GSTInvoiceGeneratorTool = () => {
  const toolSeoData = getToolSeoMetadata('gst-invoice-generator');
  
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessGST, setBusinessGST] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientGST, setClientGST] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [gstRate, setGstRate] = useState(18);
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, price: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateGST = () => {
    return calculateSubtotal() * (gstRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateGST();
  };

  const generatePDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const { width, height } = page.getSize();
      let y = height - 50;

      // Title
      page.drawText('TAX INVOICE', {
        x: 50,
        y,
        size: 24,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      y -= 40;

      // Business Details
      page.drawText('From:', {
        x: 50,
        y,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      y -= 20;
      page.drawText(businessName || 'Business Name', {
        x: 50,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
      y -= 15;
      page.drawText(businessAddress || 'Business Address', {
        x: 50,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
      y -= 15;
      page.drawText(`GSTIN: ${businessGST || 'N/A'}`, {
        x: 50,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });

      // Client Details
      y = height - 50;
      page.drawText('To:', {
        x: 350,
        y,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      y -= 20;
      page.drawText(clientName || 'Client Name', {
        x: 350,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
      y -= 15;
      page.drawText(clientAddress || 'Client Address', {
        x: 350,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
      y -= 15;
      page.drawText(`GSTIN: ${clientGST || 'N/A'}`, {
        x: 350,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });

      // Invoice Details
      y -= 50;
      page.drawText(`Invoice No: ${invoiceNumber || 'N/A'}`, {
        x: 50,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
      page.drawText(`Date: ${invoiceDate}`, {
        x: 350,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });

      // Table Header
      y -= 30;
      page.drawLine({
        start: { x: 50, y },
        end: { x: 545, y },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      y -= 15;
      page.drawText('Description', {
        x: 50,
        y,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      page.drawText('Quantity', {
        x: 250,
        y,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      page.drawText('Price', {
        x: 350,
        y,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      page.drawText('Amount', {
        x: 450,
        y,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      // Table Rows
      y -= 15;
      page.drawLine({
        start: { x: 50, y },
        end: { x: 545, y },
        thickness: 0.5,
        color: rgb(0.5, 0.5, 0.5),
      });

      items.forEach((item) => {
        y -= 20;
        page.drawText(item.description || 'N/A', {
          x: 50,
          y,
          size: 9,
          font,
          color: rgb(0, 0, 0),
        });
        page.drawText(item.quantity.toString(), {
          x: 250,
          y,
          size: 9,
          font,
          color: rgb(0, 0, 0),
        });
        page.drawText(`₹${item.price.toFixed(2)}`, {
          x: 350,
          y,
          size: 9,
          font,
          color: rgb(0, 0, 0),
        });
        page.drawText(`₹${(item.quantity * item.price).toFixed(2)}`, {
          x: 450,
          y,
          size: 9,
          font,
          color: rgb(0, 0, 0),
        });
      });

      // Totals
      y -= 30;
      page.drawLine({
        start: { x: 50, y },
        end: { x: 545, y },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      y -= 20;
      page.drawText(`Subtotal: ₹${calculateSubtotal().toFixed(2)}`, {
        x: 350,
        y,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      y -= 15;
      page.drawText(`GST (${gstRate}%): ₹${calculateGST().toFixed(2)}`, {
        x: 350,
        y,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      y -= 15;
      page.drawText(`Total: ₹${calculateTotal().toFixed(2)}`, {
        x: 350,
        y,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      // Generate PDF bytes
      const pdfBytes = await pdfDoc.save();

      // Download
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceNumber || Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success({
        title: "Invoice Generated",
        description: "Your GST invoice has been downloaded.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error({
        title: "Generation Failed",
        description: "Could not generate invoice. Please try again.",
      });
    }
  };

  return (
    <>
      {CategorySEO.Ecommerce(
        toolSeoData?.title || "GST Invoice Generator",
        toolSeoData?.description || "Create GST-compliant invoices for your business",
        "gst-invoice-generator"
      )}
      <ToolLayout
        title={toolSeoData?.title || "GST Invoice Generator"}
        description={toolSeoData?.description || "Create GST-compliant invoices for your business"}
        category="E-commerce Tools"
        categoryPath="/category/ecommerce"
      >
      <div className="space-y-8">
        {/* Enhanced Hero Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 p-6 sm:p-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"
            style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}
          />
          <div className="relative flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `hsl(${categoryColor} / 0.15)`,
                boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)`,
              }}
            >
              <FileText className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">GST Invoice Generator</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Create professional GST-compliant invoices for your business. Add business details, line items, tax rates, and download as PDF instantly.
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" style={{ color: `hsl(${categoryColor})` }} />
                Invoice Details
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business Name *</Label>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your Business Name"
                />
              </div>
              <div className="space-y-2">
                <Label>Business GSTIN</Label>
                <Input
                  value={businessGST}
                  onChange={(e) => setBusinessGST(e.target.value)}
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Business Address</Label>
              <Input
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="Your Business Address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Name *</Label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client Name"
                />
              </div>
              <div className="space-y-2">
                <Label>Client GSTIN</Label>
                <Input
                  value={clientGST}
                  onChange={(e) => setClientGST(e.target.value)}
                  placeholder="Client GSTIN"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Client Address</Label>
              <Input
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Client Address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Number *</Label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="INV-001"
                />
              </div>
              <div className="space-y-2">
                <Label>Invoice Date *</Label>
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>GST Rate (%)</Label>
              <Input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                min={0}
                max={28}
              />
            </div>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-500" />
                Items
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5 space-y-2">
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Item description"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                    min={1}
                  />
                </div>
                <div className="col-span-3 space-y-2">
                  <Label className="text-xs">Price (₹)</Label>
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
                    min={0}
                    step={0.01}
                  />
                </div>
                <div className="col-span-2">
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addItem} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST ({gstRate}%):</span>
                <span className="font-semibold">₹{calculateGST().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <Button onClick={generatePDF} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Generate & Download Invoice
            </Button>
          </CardContent>
        </Card>
        </motion.div>

        {/* Tool Definition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            GST Invoice Generator Explained
          </h3>
          <p className="text-muted-foreground mb-4">
            Create professional tax invoices compliant with GST regulations. Include business details, client information, line items with quantities and prices, and automatic GST calculation.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-1">Business Details</h5>
              <p className="text-sm text-blue-800">Add your business name, address, and GSTIN for professional invoices</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-1">Auto GST Calculation</h5>
              <p className="text-sm text-green-800">Automatic GST calculation based on configurable tax rates</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h5 className="font-semibold text-purple-900 mb-1">Multiple Items</h5>
              <p className="text-sm text-purple-800">Add unlimited line items with descriptions and quantities</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <h5 className="font-semibold text-orange-900 mb-1">PDF Export</h5>
              <p className="text-sm text-orange-800">Download professional PDF invoices instantly</p>
            </div>
          </div>
        </motion.div>

        <div className="mt-8">
          <ToolFAQ faqs={[
            {
              question: "Is this invoice GST compliant?",
              answer: "Yes, the invoice format includes all required fields for GST compliance in India including business GSTIN, client GSTIN, invoice number, date, and GST breakdown."
            },
            {
              question: "Can I add my company logo?",
              answer: "The current version generates text-based PDFs. For logo support, you can add it manually in a PDF editor after download, or we can add this feature in a future update."
            },
            {
              question: "What GST rates can I use?",
              answer: "You can set any GST rate from 0% to 28%. Common rates are 5%, 12%, 18%, and 28%. The calculator automatically applies the selected rate to the subtotal."
            },
            {
              question: "Can I save invoice drafts?",
              answer: "Currently, invoices are generated on-demand. For saving drafts, we recommend copying the data or taking screenshots. Draft saving feature may be added in future updates."
            },
            {
              question: "Are these invoices legally valid?",
              answer: "The generated invoices follow standard invoice formats with all required fields. For legal validity, ensure you enter correct business details and comply with local tax regulations."
            }
          ]} />
        </div>
      </div>
    </ToolLayout>
    </>
  );
};

export default GSTInvoiceGeneratorTool;
