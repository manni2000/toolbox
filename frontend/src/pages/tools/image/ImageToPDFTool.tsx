import { useState, useRef } from "react";

import { Upload, FileText, X, Plus, GripVertical, Image as ImageIcon, Download, Sparkles, Zap } from "lucide-react";

import { motion } from "framer-motion";

import { fadeInUp, scaleIn } from "@/lib/animations";

import ToolLayout from "@/components/layout/ToolLayout";

import { PDFDocument } from "pdf-lib";

import { ImageUploadZone } from "@/components/ui/image-upload-zone";

import { EnhancedDownload } from "@/components/ui/enhanced-download";

import ToolFAQ from "@/components/ToolFAQ";
import { CategorySEO } from "@/components/ToolSEO";
import { getToolSeoMetadata } from "@/data/toolSeoEnhancements";



const categoryColor = "173 80% 40%";



interface ImageFile {

  id: string;

  file: File;

  preview: string;

}



const ImageToPDFTool = () => {
  const toolSeoData = getToolSeoMetadata('image-to-pdf');

  const [images, setImages] = useState<ImageFile[]>([]);

  const [isDragging, setIsDragging] = useState(false);

  const [isConverting, setIsConverting] = useState(false);

  const [pageSize, setPageSize] = useState<"fit" | "a4" | "letter">("a4");

  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const [pdfSize, setPdfSize] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const downloadSectionRef = useRef<HTMLDivElement>(null);



  const handleFiles = (files: FileList) => {

    const newImages: ImageFile[] = [];

    Array.from(files).forEach((file) => {

      if (file.type.startsWith("image/")) {

        const reader = new FileReader();

        reader.onload = (e) => {

          newImages.push({

            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

            file,

            preview: e.target?.result as string,

          });

          if (newImages.length === files.length) {

            setImages((prev) => [...prev, ...newImages.filter(img => img.preview)]);

          }

        };

        reader.readAsDataURL(file);

      }

    });

  };



  const handleDragEnter = (e: React.DragEvent) => {

    e.preventDefault();

    setIsDragging(true);

  };



  const handleDragLeave = () => {

    setIsDragging(false);

  };



  const handleDragOver = (e: React.DragEvent) => {

    e.preventDefault();

    setIsDragging(true);

  };



  const handleDrop = (e: React.DragEvent) => {

    e.preventDefault();

    setIsDragging(false);

    if (e.dataTransfer.files.length > 0) {

      handleFiles(e.dataTransfer.files);

    }

  };



  const handleSingleFile = (file: File) => {

    if (file.type.startsWith("image/")) {

      const reader = new FileReader();

      reader.onload = (e) => {

        const newImage: ImageFile = {

          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

          file,

          preview: e.target?.result as string,

        };

        if (newImage.preview) {

          setImages((prev) => [...prev, newImage]);

        }

      };

      reader.readAsDataURL(file);

    }

  };



  const removeImage = (id: string) => {

    setImages((prev) => prev.filter((img) => img.id !== id));

  };



  const moveImage = (fromIndex: number, toIndex: number) => {

    const newImages = [...images];

    const [moved] = newImages.splice(fromIndex, 1);

    newImages.splice(toIndex, 0, moved);

    setImages(newImages);

  };



  const convertToPDF = async () => {

    if (images.length === 0) return;

    setIsConverting(true);



    try {

      const pdfDoc = await PDFDocument.create();



      for (const img of images) {

        const response = await fetch(img.preview);

        const imageBytes = await response.arrayBuffer();



        let embeddedImage;

        if (img.file.type === "image/png") {

          embeddedImage = await pdfDoc.embedPng(imageBytes);

        } else {

          embeddedImage = await pdfDoc.embedJpg(imageBytes);

        }



        const imgWidth = embeddedImage.width;

        const imgHeight = embeddedImage.height;



        let pageWidth: number;

        let pageHeight: number;



        if (pageSize === "fit") {

          pageWidth = imgWidth;

          pageHeight = imgHeight;

        } else {

          // A4: 595 x 842 points, Letter: 612 x 792 points

          if (pageSize === "a4") {

            pageWidth = orientation === "portrait" ? 595 : 842;

            pageHeight = orientation === "portrait" ? 842 : 595;

          } else {

            pageWidth = orientation === "portrait" ? 612 : 792;

            pageHeight = orientation === "portrait" ? 792 : 612;

          }

        }



        const page = pdfDoc.addPage([pageWidth, pageHeight]);



        // Calculate scaling to fit image on page with margins

        const margin = pageSize === "fit" ? 0 : 40;

        const availableWidth = pageWidth - margin * 2;

        const availableHeight = pageHeight - margin * 2;



        const scale = Math.min(

          availableWidth / imgWidth,

          availableHeight / imgHeight,

          1

        );



        const scaledWidth = imgWidth * scale;

        const scaledHeight = imgHeight * scale;



        // Center the image

        const x = (pageWidth - scaledWidth) / 2;

        const y = (pageHeight - scaledHeight) / 2;



        page.drawImage(embeddedImage, {

          x,

          y,

          width: scaledWidth,

          height: scaledHeight,

        });

      }



      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });

      const url = URL.createObjectURL(blob);



      setPdfUrl(url);

      setPdfSize(pdfBytes.length);

      

      // Scroll to download section after successful conversion

      setTimeout(() => {

        downloadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      }, 100);

    } catch (error) {

      // console.error("Error converting to PDF:", error);

      alert("Error converting images to PDF. Please try with JPG or PNG images.");

    } finally {

      setIsConverting(false);

    }

  };



  const reset = () => {

    if (pdfUrl) {

      URL.revokeObjectURL(pdfUrl);

    }

    setImages([]);

    setPdfUrl(null);

    setPdfSize(0);

  };



  return (
    <>
      {CategorySEO.Image(
        toolSeoData?.title || "Image to PDF",
        toolSeoData?.description || "Convert multiple images to a single PDF document",
        "image-to-pdf"
      )}
      <ToolLayout
      breadcrumbTitle="Image to PDF"
      category="Image Tools"

      categoryPath="/category/image"
      >

      <div className="space-y-6">

        {/* Enhanced Hero Section */}

        <motion.div

          variants={fadeInUp}

          initial="hidden"

          animate="visible"

          className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted/50 via-background to-muted/30 p-6 sm:p-8"

        >

          <motion.div

            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}

            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}

            className="absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl"

            style={{ backgroundColor: `hsl(${categoryColor} / 0.2)` }}

          />

          <div className="relative flex items-start gap-4">

            <motion.div

              initial={{ scale: 0, rotate: -180 }}

              animate={{ scale: 1, rotate: 0 }}

              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}

              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"

              style={{ backgroundColor: `hsl(${categoryColor} / 0.15)`, boxShadow: `0 8px 30px hsl(${categoryColor} / 0.3)` }}

            >

              <FileText className="h-7 w-7" style={{ color: `hsl(${categoryColor})` }} />

            </motion.div>

            <div>

              <h2 className="text-2xl font-bold">Images to PDF Converter</h2>

              <p className="mt-2 text-sm text-muted-foreground">

                Combine multiple images into a beautifully formatted PDF document.

              </p>

              {/* Keyword Tags */}

              <div className="flex flex-wrap gap-2 mt-4">

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">image to pdf</span>

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">pdf converter</span>

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">combine images</span>

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">pdf creator</span>

              </div>

            </div>

          </div>

        </motion.div>



        {/* Upload Area */}

        <ImageUploadZone

          isDragging={isDragging}

          onDragEnter={handleDragEnter}

          onDragLeave={handleDragLeave}

          onDragOver={handleDragOver}

          onDrop={handleDrop}

          onClick={() => inputRef.current?.click()}

          onFileSelect={handleSingleFile}

          accept="image/jpeg,image/png,image/webp"

          multiple={true}

          title="Drop images here or click to upload"

          subtitle="Supports JPG, PNG, WebP • Multiple files allowed"

        />



        {/* Image List */}

        {images.length > 0 && (

          <div className="space-y-6">

            <div className="flex items-center justify-between">

              <h3 className="font-semibold">{images.length} image{images.length > 1 ? "s" : ""} selected</h3>

              <div className="flex gap-2">

                <button

                  onClick={() => inputRef.current?.click()}

                  className="btn-secondary text-sm"

                  title="Add more images to PDF"

                >

                  <Plus className="h-4 w-4" />

                  Add More

                </button>

                <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground" title="Remove all images from PDF">

                  Clear All

                </button>

              </div>

            </div>



            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {images.map((img, index) => (

                <div

                  key={img.id}

                  className="group relative flex items-center gap-3 rounded-xl border border-border bg-card p-3"

                >

                  <div className="cursor-move text-muted-foreground hover:text-foreground">

                    <GripVertical className="h-5 w-5" />

                  </div>

                  <img

                    src={img.preview}

                    alt={img.file.name}

                    className="h-16 w-16 rounded-lg object-cover"

                  />

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-medium">{img.file.name}</p>

                    <p className="text-xs text-muted-foreground">Page {index + 1}</p>

                  </div>

                  <button

                    onClick={() => removeImage(img.id)}

                    className="rounded-lg p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"

                    title="Remove this image from PDF"

                  >

                    <X className="h-4 w-4" />

                  </button>

                </div>

              ))}

            </div>



            {/* Options */}

            <div className="grid gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-medium">Page Size</label>

                <select

                  value={pageSize}

                  onChange={(e) => setPageSize(e.target.value as "fit" | "a4" | "letter")}

                  className="input-field w-full"

                  aria-label="Page size"

                >

                  <option value="a4">A4 (210 × 297 mm)</option>

                  <option value="letter">Letter (8.5 × 11 in)</option>

                  <option value="fit">Fit to Image</option>

                </select>

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">Orientation</label>

                <select

                  value={orientation}

                  onChange={(e) => setOrientation(e.target.value as "portrait" | "landscape")}

                  className="input-field w-full"

                  disabled={pageSize === "fit"}

                  aria-label="Page orientation"

                >

                  <option value="portrait">Portrait</option>

                  <option value="landscape">Landscape</option>

                </select>

              </div>

            </div>



            {/* Convert Button */}

            <button

              onClick={convertToPDF}

              disabled={isConverting}

              className="btn-primary w-full"

              title="Convert selected images to PDF"

            >

              {isConverting ? (

                <>

                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />

                  Converting...

                </>

              ) : (

                <>

                  <Download className="h-5 w-5" />

                  Convert to PDF

                </>

              )}

            </button>



            {/* Download Section */}

            {pdfUrl && (

              <div ref={downloadSectionRef}>

                <EnhancedDownload

                  data={pdfUrl}

                  fileName="images-converted.pdf"

                  fileType="pdf"

                  title="Images Converted to PDF"

                  description={`Successfully converted ${images.length} image${images.length > 1 ? 's' : ''} to PDF`}

                  fileSize={`${(pdfSize / 1024 / 1024).toFixed(2)} MB`}

                  pageCount={images.length}

                />

              </div>

            )}

          </div>

        )}



        {/* Tool Definition Section */}

        <motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ delay: 0.3 }}

          className="rounded-xl border border-border bg-card p-6"

        >

          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">

            <FileText className="h-5 w-5 text-blue-500" />

            What is Image to PDF Conversion?

          </h3>

          <p className="text-muted-foreground mb-4">

            Image to PDF conversion transforms image files into PDF documents. This is useful for creating documents from images, sharing multiple images as a single file, or preparing images for printing and archival purposes.

          </p>

          

          <h4 className="font-semibold mb-2">How It Works</h4>

          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">

            <li>Upload one or more images</li>

            <li>Arrange the image order (drag to reorder)</li>

            <li>The tool converts them to PDF</li>

            <li>Download the PDF document</li>

          </ol>

          

          <div className="grid sm:grid-cols-2 gap-4 mt-4">

            <div className="p-3 bg-blue-50 rounded-lg">

              <h5 className="font-semibold text-blue-900 mb-1">Conversion Features</h5>

              <ul className="text-sm text-blue-800 space-y-1">

                <li>• Multiple image support</li>

                <li>• Drag to reorder pages</li>

                <li>• Automatic page sizing</li>

                <li>• High-quality output</li>

              </ul>

            </div>

            <div className="p-3 bg-green-50 rounded-lg">

              <h5 className="font-semibold text-green-900 mb-1">Common Uses</h5>

              <ul className="text-sm text-green-800 space-y-1">

                <li>• Document creation</li>

                <li>• Image archiving</li>

                <li>• Print preparation</li>

                <li>• File sharing</li>

              </ul>

            </div>

          </div>

        </motion.div>



        <div className="mt-8">

{/* FAQ Section */}

<ToolFAQ faqs={[

  {

    question: "Can I convert multiple images to one PDF?",

    answer: "Yes, you can upload multiple images and they will be combined into a single PDF document. You can drag to reorder the pages before conversion."

  },

  {

    question: "What image formats are supported?",

    answer: "Common image formats including JPG, PNG, WebP, and others are supported. The tool will convert any compatible image format to PDF."

  },

  {

    question: "How is page size determined?",

    answer: "The PDF page size is automatically set to match the image dimensions. For multiple images, each page matches its respective image size."

  },

  {

    question: "Can I set custom page sizes?",

    answer: "This tool automatically sizes pages to match images. For custom page sizes, you would need to resize images before converting or use specialized PDF software."

  },

  {

    question: "Is the output PDF searchable?",

    answer: "The PDF created from images contains the images as visual content. For searchable text, you would need OCR (Optical Character Recognition) software to extract text from images."

  }

]} />

</div>

</div>

</ToolLayout>

    </>
  );

}



export default ImageToPDFTool;

