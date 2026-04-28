import { useState, useCallback } from 'react';
import { FileText, Download, Copy, CheckCircle, Zap, X, Sparkles, FileSignature } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "@/lib/animations";
import ToolLayout from "@/components/layout/ToolLayout";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";
import { useToast } from "@/hooks/use-toast";
import ToolFAQ from "@/components/ToolFAQ";

const categoryColor = "220 60% 45%";

interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'textarea';
  placeholder?: string;
  required?: boolean;
}

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  fields: TemplateField[];
  generate: (data: Record<string, string>) => string;
}

const TEMPLATES: DocumentTemplate[] = [
  {
    id: 'rental-agreement',
    name: 'Rental Agreement',
    description: 'Standard rental/lease agreement template',
    fields: [
      { name: 'landlordName', label: 'Landlord Name', type: 'text', placeholder: 'John Doe', required: true },
      { name: 'tenantName', label: 'Tenant Name', type: 'text', placeholder: 'Jane Smith', required: true },
      { name: 'propertyAddress', label: 'Property Address', type: 'textarea', placeholder: '123 Main St, City, State', required: true },
      { name: 'rentAmount', label: 'Monthly Rent', type: 'text', placeholder: '₹15,000', required: true },
      { name: 'startDate', label: 'Lease Start Date', type: 'date', required: true },
      { name: 'endDate', label: 'Lease End Date', type: 'date', required: true },
      { name: 'securityDeposit', label: 'Security Deposit', type: 'text', placeholder: '₹30,000', required: true },
    ],
    generate: (data) => `RENTAL AGREEMENT

This Rental Agreement ("Agreement") is made and entered into on ${new Date().toLocaleDateString()} by and between:

LANDLORD: ${data.landlordName}
TENANT: ${data.tenantName}

PROPERTY ADDRESS: ${data.propertyAddress}

1. TERM
The Landlord agrees to rent and the Tenant agrees to rent the Property for a term of ${data.startDate} to ${data.endDate}.

2. RENT
The Tenant shall pay monthly rent of ${data.rentAmount} to the Landlord, due on the 1st day of each month.

3. SECURITY DEPOSIT
The Tenant shall pay a security deposit of ${data.securityDeposit} to the Landlord upon signing this Agreement.

4. USE OF PREMISES
The Tenant shall use the Property for residential purposes only and shall not use it for any illegal or commercial purpose.

5. MAINTENANCE
The Tenant shall maintain the Property in good condition and shall be responsible for any damages caused by the Tenant or their guests.

6. UTILITIES
The Tenant shall be responsible for payment of all utilities including electricity, water, gas, and internet.

7. TERMINATION
Either party may terminate this Agreement with 30 days written notice.

8. GOVERNING LAW
This Agreement shall be governed by the laws of India.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

_____________________
LANDLORD SIGNATURE

_____________________
TENANT SIGNATURE`
  },
  {
    id: 'loan-agreement',
    name: 'Loan Agreement',
    description: 'Simple loan agreement between parties',
    fields: [
      { name: 'lenderName', label: 'Lender Name', type: 'text', placeholder: 'John Doe', required: true },
      { name: 'borrowerName', label: 'Borrower Name', type: 'text', placeholder: 'Jane Smith', required: true },
      { name: 'loanAmount', label: 'Loan Amount', type: 'text', placeholder: '₹1,00,000', required: true },
      { name: 'interestRate', label: 'Interest Rate (%)', type: 'text', placeholder: '10', required: true },
      { name: 'repaymentDate', label: 'Repayment Date', type: 'date', required: true },
      { name: 'paymentSchedule', label: 'Payment Schedule', type: 'textarea', placeholder: 'Monthly installments of ₹9,000', required: true },
    ],
    generate: (data) => `LOAN AGREEMENT

This Loan Agreement ("Agreement") is made on ${new Date().toLocaleDateString()} between:

LENDER: ${data.lenderName}
BORROWER: ${data.borrowerName}

1. LOAN AMOUNT
The Lender agrees to lend to the Borrower the sum of ${data.loanAmount} ("Loan Amount").

2. INTEREST RATE
The Loan Amount shall bear interest at the rate of ${data.interestRate}% per annum.

3. REPAYMENT
The Borrower shall repay the Loan Amount with interest by ${data.repaymentDate} according to the following schedule:
${data.paymentSchedule}

4. PURPOSE
The Borrower shall use the Loan Amount for [specify purpose] and shall not use it for any illegal activity.

5. DEFAULT
If the Borrower fails to make any payment when due, the entire Loan Amount shall become immediately due and payable.

6. GOVERNING LAW
This Agreement shall be governed by the laws of India.

IN WITNESS WHEREOF, the parties have executed this Agreement.

_____________________
LENDER SIGNATURE

_____________________
BORROWER SIGNATURE`
  },
  {
    id: 'nda',
    name: 'Non-Disclosure Agreement',
    description: 'Simple NDA for protecting confidential information',
    fields: [
      { name: 'disclosingParty', label: 'Disclosing Party Name', type: 'text', placeholder: 'Company ABC', required: true },
      { name: 'receivingParty', label: 'Receiving Party Name', type: 'text', placeholder: 'John Doe', required: true },
      { name: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
      { name: 'confidentialInfo', label: 'Confidential Information', type: 'textarea', placeholder: 'Describe the confidential information', required: true },
    ],
    generate: (data) => `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is made on ${data.effectiveDate} between:

DISCLOSING PARTY: ${data.disclosingParty}
RECEIVING PARTY: ${data.receivingParty}

1. CONFIDENTIAL INFORMATION
The Disclosing Party may share certain confidential information with the Receiving Party, including but not limited to:
${data.confidentialInfo}

2. OBLIGATIONS
The Receiving Party agrees to:
a) Keep all Confidential Information strictly confidential
b) Not disclose Confidential Information to any third party
c) Use Confidential Information only for the purpose intended
d) Take reasonable measures to protect Confidential Information

3. EXCLUSIONS
Confidential Information does not include information that:
a) Is already publicly known
b) Becomes publicly known through no fault of Receiving Party
c) Is independently developed by Receiving Party
d) Is rightfully received from a third party without confidentiality obligations

4. TERM
This Agreement shall remain in effect for a period of 3 years from the Effective Date.

5. GOVERNING LAW
This Agreement shall be governed by the laws of India.

IN WITNESS WHEREOF, the parties have executed this Agreement.

_____________________
DISCLOSING PARTY

_____________________
RECEIVING PARTY`
  },
  {
    id: 'employment-contract',
    name: 'Employment Contract',
    description: 'Basic employment contract template',
    fields: [
      { name: 'employerName', label: 'Employer Name', type: 'text', placeholder: 'Company ABC', required: true },
      { name: 'employeeName', label: 'Employee Name', type: 'text', placeholder: 'John Doe', required: true },
      { name: 'position', label: 'Position/Title', type: 'text', placeholder: 'Software Developer', required: true },
      { name: 'startDate', label: 'Start Date', type: 'date', required: true },
      { name: 'salary', label: 'Annual Salary', type: 'text', placeholder: '₹6,00,000', required: true },
      { name: 'workHours', label: 'Work Hours', type: 'text', placeholder: '9 AM to 6 PM, Monday to Friday', required: true },
    ],
    generate: (data) => `EMPLOYMENT CONTRACT

This Employment Contract ("Contract") is made on ${new Date().toLocaleDateString()} between:

EMPLOYER: ${data.employerName}
EMPLOYEE: ${data.employeeName}

1. POSITION
The Employee shall serve as ${data.position} and shall perform such duties as assigned by the Employer.

2. COMMENCEMENT DATE
The Employee shall commence employment on ${data.startDate}.

3. COMPENSATION
The Employee shall receive an annual salary of ${data.salary}, payable in monthly installments.

4. WORK HOURS
The Employee shall work ${data.workHours}.

5. BENEFITS
The Employee shall be entitled to such benefits as may be provided by the Employer from time to time, including:
- Paid leave as per company policy
- Health insurance
- Provident fund contributions

6. TERMINATION
Either party may terminate this Contract by giving 30 days written notice.

7. CONFIDENTIALITY
The Employee shall maintain the confidentiality of all proprietary information of the Employer.

8. GOVERNING LAW
This Contract shall be governed by the laws of India.

IN WITNESS WHEREOF, the parties have executed this Contract.

_____________________
EMPLOYER SIGNATURE

_____________________
EMPLOYEE SIGNATURE`
  },
];

export default function DocumentTemplateTool() {
  const toolSeoData = getToolSeoMetadata('document-template');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(TEMPLATES[0]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedDocument, setGeneratedDocument] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleGenerate = () => {
    const missingFields = selectedTemplate.fields.filter(field => field.required && !formData[field.name]);
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    const document = selectedTemplate.generate(formData);
    setGeneratedDocument(document);
  };

  const handleCopy = useCallback(async () => {
    if (!generatedDocument) {
      toast({
        title: 'No Document',
        description: 'Please generate a document first',
        variant: 'destructive',
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedDocument);
      setCopied(true);
      toast({
        title: 'Document Copied',
        description: 'Document copied to clipboard successfully',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy document to clipboard',
        variant: 'destructive',
      });
    }
  }, [generatedDocument, toast]);

  const handleDownload = () => {
    const blob = new Blob([generatedDocument], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTemplate.name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {CategorySEO.GovtLegal(
        toolSeoData?.title || "Document Template Generator",
        toolSeoData?.description || "Generate legal document and agreement templates",
        "document-template"
      )}
      <ToolLayout
        title="Document Template Generator"
        description="Generate legal document and agreement templates"
        category="Govt & Legal Tools"
        categoryPath="/category/govt-legal"
        toolSlug="document-template"
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
                <FileSignature className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Legal Document Generator</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Generate professional legal document templates instantly. Create rental agreements, NDAs, and more.
                </p>
                {/* Keyword Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">document template</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">legal document</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">agreement template</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">contract template</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Template Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" style={{ color: `hsl(${categoryColor})` }} />
              Select Document Type
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {TEMPLATES.map((template, index) => (
                <motion.button
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setFormData({});
                    setGeneratedDocument('');
                  }}
                  className={`p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                    selectedTemplate.id === template.id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  {selectedTemplate.id === template.id && (
                    <motion.div
                      layoutId="selectedTemplate"
                      className="absolute inset-0 bg-primary/5"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="relative">
                    <p className="font-medium text-sm mb-1">{template.name}</p>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Form Fields */}
          <div className="rounded-xl border border-border bg-card p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-4">Fill in Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedTemplate.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label htmlFor={field.name} className="block text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.name}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="input-tool w-full min-h-[100px] resize-none"
                      required={field.required}
                    />
                  ) : (
                    <input
                      id={field.name}
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="input-tool w-full"
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2 min-h-[48px]"
            >
              <FileText className="h-4 w-4" />
              Generate Document
            </button>
          </div>

          {/* Generated Document */}
          {generatedDocument && (
            <div className="rounded-xl border border-border bg-card p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Generated Document</h3>
                <div className="flex items-center gap-2">
                  {copied && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Copied!
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg mb-4">
                <pre className="whitespace-pre-wrap text-sm font-mono">{generatedDocument}</pre>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCopy}
                  className="btn-secondary flex items-center justify-center gap-2 min-h-[48px]"
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <Download className="h-4 w-4" />
                  Download as Text
                </button>
              </div>
            </div>
          )}

          {/* Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-border bg-card p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4">Important Notice</h3>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-900">
                <strong>Disclaimer:</strong> These document templates are provided for general informational purposes only and do not constitute legal advice. Laws and regulations vary by jurisdiction and circumstances. We recommend consulting with a qualified attorney before using these templates for legal purposes. The templates may need to be modified to suit your specific requirements and local laws.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600">📝 Tips</h4>
                <ul className="text-sm space-y-1">
                  <li>• Review all terms carefully</li>
                  <li>• Fill in all required fields accurately</li>
                  <li>• Get legal advice for complex agreements</li>
                  <li>• Keep copies of all signed documents</li>
                  <li>• Update templates as laws change</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">✅ Best Practices</h4>
                <ul className="text-sm space-y-1">
                  <li>• Use clear and unambiguous language</li>
                  <li>• Specify dates and amounts precisely</li>
                  <li>• Include all relevant parties</li>
                  <li>• Define key terms clearly</li>
                  <li>• Include dispute resolution clauses</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <div className="mt-8">
            <ToolFAQ faqs={[
              {
                question: "Are these document templates legally binding?",
                answer: "The templates are standard formats but may need modification for your specific situation. For legally binding agreements, consult with a qualified attorney to ensure compliance with local laws."
              },
              {
                question: "Can I customize the templates?",
                answer: "Yes! After generating the document, you can copy and edit it to add or modify clauses as needed. The templates provide a solid starting point."
              },
              {
                question: "What document types are available?",
                answer: "We provide templates for rental agreements, NDAs, employment contracts, and more. Each template is designed for common legal and business scenarios."
              },
              {
                question: "Do I need a lawyer for these documents?",
                answer: "While these templates are useful for simple agreements, complex legal matters require professional advice. Always consult an attorney for important contracts or disputes."
              },
              {
                question: "Can I use these templates for business purposes?",
                answer: "Yes, these templates are suitable for business use. However, ensure they comply with your company's policies and local regulations."
              }
            ]} />
          </div>
        </div>
      </ToolLayout>
    </>
  );
}
