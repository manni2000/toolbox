export interface CategoryFAQs {
  [category: string]: Array<{ question: string; answer: string }>;
}

export const categorySpecificFaqs: CategoryFAQs = {
  'PDF Tools': [
    {
      question: 'Are PDF conversions secure and private?',
      answer: 'Yes, all PDF processing happens locally in your browser. Your files never leave your device and are not stored on any server.',
    },
    {
      question: 'What PDF formats are supported?',
      answer: 'We support all standard PDF formats including PDF 1.4 through 2.0, with support for text, images, and embedded content.',
    },
    {
      question: 'Can I convert password-protected PDFs?',
      answer: 'For password-protected PDFs, you need to enter the password first. Our tools can then process them normally.',
    },
    {
      question: 'Is there a file size limit for PDF tools?',
      answer: 'Most PDF tools support files up to 50MB. Large files may take longer but will still process successfully.',
    },
    {
      question: 'Will formatting be preserved in conversions?',
      answer: 'Our tools preserve most formatting including fonts, layouts, and images. Complex layouts may need minor adjustments.',
    },
  ],

  'Image Tools': [
    {
      question: 'What image formats are supported?',
      answer: 'We support all major formats: JPG, PNG, WebP, GIF, BMP, TIFF, SVG, and more. Conversion between formats is seamless.',
    },
    {
      question: 'Are my images processed locally?',
      answer: 'Yes, all image processing happens in your browser. Your images are never uploaded to any server, ensuring complete privacy.',
    },
    {
      question: 'Can I edit RAW image files?',
      answer: 'Currently, we support standard web formats. For RAW files, convert them to TIFF or PNG first for best results.',
    },
    {
      question: 'Is there quality loss in conversions?',
      answer: 'Our tools use lossless algorithms where possible. For JPG conversions, you can control the quality to balance file size and image quality.',
    },
    {
      question: 'What\'s the maximum image size I can process?',
      answer: 'Images up to 40MP and 50MB are supported. Larger images may take longer but will still process successfully.',
    },
  ],

  'Developer Tools': [
    {
      question: 'Are these developer tools suitable for production use?',
      answer: 'These tools are designed for development, testing, and debugging. For production, always validate and test thoroughly.',
    },
    {
      question: 'Do developer tools store my code or data?',
      answer: 'No, all processing happens locally in your browser. Your code, tokens, and sensitive data never leave your device.',
    },
    {
      question: 'Can I use these tools for commercial projects?',
      answer: 'Yes, all tools are free for commercial use. However, always verify results and follow best practices for production code.',
    },
    {
      question: 'Are the generated code snippets production-ready?',
      answer: 'Generated code provides a solid starting point. Always review, test, and adapt it to your specific requirements.',
    },
    {
      question: 'Do these tools work with modern frameworks?',
      answer: 'Yes, our tools support modern frameworks like React, Vue, Angular, and Node.js, along with standard web technologies.',
    },
  ],

  'Security Tools': [
    {
      question: 'Are security tools completely safe to use?',
      answer: 'Yes, all security processing happens locally in your browser. No data is sent to external servers, ensuring maximum security.',
    },
    {
      question: 'Can I trust password generators and hash tools?',
      answer: 'Our tools use cryptographically secure algorithms. For critical applications, consider using dedicated security libraries.',
    },
    {
      question: 'Are generated passwords stored anywhere?',
      answer: 'No, generated passwords and hashes are never stored. They exist only in your browser session and disappear when you close the tab.',
    },
    {
      question: 'How secure are the encryption methods used?',
      answer: 'We use industry-standard encryption algorithms like AES-256, SHA-256, and bcrypt for maximum security.',
    },
    {
      question: 'Can I use these tools for sensitive data?',
      answer: 'While tools are secure, for highly sensitive data, consider using offline, dedicated security applications.',
    },
  ],

  'Text Tools': [
    {
      question: 'Can I process large text documents?',
      answer: 'Yes, our text tools can handle documents up to 1MB. For larger files, consider splitting them into smaller chunks.',
    },
    {
      question: 'Are special characters and Unicode supported?',
      answer: 'Yes, all text tools support Unicode characters, emojis, and special characters from all languages.',
    },
    {
      question: 'Is my text data private?',
      answer: 'Absolutely. All text processing happens locally in your browser. Your content is never uploaded or stored anywhere.',
    },
    {
      question: 'Can I work with code and programming text?',
      answer: 'Yes, our tools work perfectly with code, JSON, XML, and other programming text formats without breaking syntax.',
    },
    {
      question: 'Are formatting and preserved?',
      answer: 'Plain text tools preserve content exactly. For formatted text, consider using our document conversion tools.',
    },
  ],

  'SEO Tools': [
    {
      question: 'Are SEO analysis results accurate?',
      answer: 'Our tools provide reliable analysis based on current SEO best practices. For comprehensive audits, combine multiple tools.',
    },
    {
      question: 'Do SEO tools access my website data?',
      answer: 'Analysis happens in your browser. For website analysis tools, only public information is accessed, no private data.',
    },
    {
      question: 'Can I use these tools for competitor analysis?',
      answer: 'Yes, SEO tools can analyze public website information. Always respect robots.txt and terms of service.',
    },
    {
      question: 'Are SEO suggestions up-to-date with current algorithms?',
      answer: 'We regularly update our tools to reflect current search engine algorithms and SEO best practices.',
    },
    {
      question: 'Do these tools guarantee better rankings?',
      answer: 'Our tools provide insights and suggestions. Actual rankings depend on many factors including content quality and competition.',
    },
  ],

  'Finance Tools': [
    {
      question: 'Are financial calculations accurate?',
      answer: 'Our calculators use standard financial formulas. For important decisions, always verify with professional financial advisors.',
    },
    {
      question: 'Is my financial data secure?',
      answer: 'All calculations happen locally in your browser. No financial data is ever stored or transmitted to any server.',
    },
    {
      question: 'Can I use these tools for business planning?',
      answer: 'Yes, these tools are great for planning and estimates. For official financial reports, consult with accounting professionals.',
    },
    {
      question: 'Are currency exchange rates real-time?',
      answer: 'Currency tools use reference rates. For actual transactions, check with your bank for current rates.',
    },
    {
      question: 'Do these tools consider taxes and regulations?',
      answer: 'Calculators provide estimates. Tax laws vary by location and change frequently. Consult professionals for tax advice.',
    },
  ],

  'Video Tools': [
    {
      question: 'What video formats are supported?',
      answer: 'We support MP4, WebM, AVI, MOV, and other common formats. Conversion maintains quality while optimizing for web use.',
    },
    {
      question: 'Are my videos processed locally?',
      answer: 'Yes, all video processing happens in your browser using WebAssembly. Your videos never leave your device.',
    },
    {
      question: 'Is there a limit on video file size?',
      answer: 'Videos up to 100MB are supported. Larger videos may take longer but will still process successfully.',
    },
    {
      question: 'Will video quality be preserved?',
      answer: 'Our tools maintain original quality where possible. For compression, you can control the quality-to-size ratio.',
    },
    {
      question: 'Can I edit 4K videos?',
      answer: 'Basic editing is supported for all resolutions. For complex 4K editing, dedicated video software is recommended.',
    },
  ],

  'Audio Tools': [
    {
      question: 'What audio formats are supported?',
      answer: 'We support MP3, WAV, OGG, M4A, FLAC, and other popular audio formats for conversion and editing.',
    },
    {
      question: 'Is audio processing done locally?',
      answer: 'Yes, all audio processing happens in your browser. Your audio files are never uploaded to any server.',
    },
    {
      question: 'Can I process large audio files?',
      answer: 'Audio files up to 50MB are supported. Larger files may take longer but will still process successfully.',
    },
    {
      question: 'Will audio quality be preserved?',
      answer: 'Our tools maintain original quality where possible. For compressed formats, you can control the bitrate.',
    },
    {
      question: 'Can I edit multi-track audio?',
      answer: 'Current tools focus on single-track editing. For multi-track projects, consider dedicated audio software.',
    },
  ],

  'Education Tools': [
    {
      question: 'Are educational tools suitable for all ages?',
      answer: 'Yes, our tools are designed to be accessible and useful for students, teachers, and lifelong learners of all ages.',
    },
    {
      question: 'Can I use these tools for homework and assignments?',
      answer: 'Absolutely! These tools are perfect for homework, projects, and learning activities. Always cite your sources properly.',
    },
    {
      question: 'Are calculation results accurate?',
      answer: 'Yes, our educational tools use standard mathematical formulas and are regularly verified for accuracy.',
    },
    {
      question: 'Can teachers use these tools in classroom?',
      answer: 'Yes, teachers can use these tools for demonstrations, assignments, and interactive learning activities.',
    },
    {
      question: 'Are these tools available in multiple languages?',
      answer: 'Currently available in English. We\'re working on adding support for more languages in the future.',
    },
  ],

  'Date & Time Tools': [
    {
      question: 'Are date calculations accurate?',
      answer: 'Yes, our tools use standard calendar algorithms and account for leap years and time zones correctly.',
    },
    {
      question: 'Do these tools handle time zones?',
      answer: 'Yes, time zone tools use the IANA time zone database for accurate conversions and calculations.',
    },
    {
      question: 'Can I use these for business date calculations?',
      answer: 'Yes, these tools are suitable for business planning, project management, and professional date calculations.',
    },
    {
      question: 'Are working day calculations accurate?',
      answer: 'Working day calculations account for weekends and common holidays. You can customize holidays for your region.',
    },
    {
      question: 'Do timers work when tab is not active?',
      answer: 'Timers continue running even when the tab is in the background, though some browsers may limit inactive tabs.',
    },
  ],

  'Internet Tools': [
    {
      question: 'Are internet tools safe to use?',
      answer: 'Yes, all processing happens locally. For website analysis tools, only publicly available information is accessed.',
    },
    {
      question: 'Do these tools store website data?',
      answer: 'No, website data is processed temporarily in your browser and never stored on any server.',
    },
    {
      question: 'Can I use these for website testing?',
      answer: 'Yes, these tools are great for basic website testing, debugging, and performance analysis.',
    },
    {
      question: 'Are SSL checks comprehensive?',
      answer: 'SSL tools check certificate validity, expiration, and common security issues. For security audits, use dedicated tools.',
    },
    {
      question: 'Do screenshot tools capture dynamic content?',
      answer: 'Screenshots capture the current state. For dynamic content, wait for it to load before capturing.',
    },
  ],

  'Social Media Tools': [
    {
      question: 'Are social media tools platform-compliant?',
      answer: 'Yes, our tools follow platform guidelines. Always check individual platform terms before posting content.',
    },
    {
      question: 'Is my social media content private?',
      answer: 'All content creation happens locally. We don\'t access your social media accounts or store your content.',
    },
    {
      question: 'Can I use generated content commercially?',
      answer: 'Generated content is yours to use. Always ensure compliance with platform policies and copyright laws.',
    },
    {
      question: 'Are hashtag suggestions effective?',
      answer: 'Hashtag suggestions are based on trending topics and best practices. Results may vary by platform and audience.',
    },
    {
      question: 'Do meme generators respect copyright?',
      answer: 'Use responsibly. Ensure you have rights to images used and comply with platform content policies.',
    },
  ],

  'Zip Tools': [
    {
      question: 'What archive formats are supported?',
      answer: 'We support ZIP, RAR, 7Z, TAR, GZIP, and other common archive formats for creation and extraction.',
    },
    {
      question: 'Is archive processing secure and private?',
      answer: 'Yes, all archive operations happen locally in your browser. Your files are never uploaded to any server.',
    },
    {
      question: 'Can I handle large archive files?',
      answer: 'Archives up to 100MB are supported. Larger files may take longer but will still process successfully.',
    },
    {
      question: 'Are passwords and encryption supported?',
      answer: 'Yes, you can create password-protected archives and extract encrypted files using the correct password.',
    },
    {
      question: 'Will file permissions be preserved?',
      answer: 'Basic file information is preserved. For complex permission systems, some metadata may not transfer.',
    },
  ],

  'General Tools': [
    {
      question: 'Are general tools free to use?',
      answer: 'Yes, all general tools are completely free with no hidden charges or limitations.',
    },
    {
      question: 'Is my data safe with general tools?',
      answer: 'Absolutely. All processing happens locally in your browser. Your data is never uploaded or stored anywhere.',
    },
    {
      question: 'Can I use these tools for work?',
      answer: 'Yes, these tools are suitable for both personal and professional use.',
    },
    {
      question: 'Do these tools work on mobile devices?',
      answer: 'Yes, all tools are fully responsive and work perfectly on smartphones, tablets, and desktop computers.',
    },
    {
      question: 'Are there any usage limits?',
      answer: 'No, you can use these tools as many times as you need without any restrictions.',
    },
  ],
};

// Helper function to get FAQs for a specific category
export const getCategoryFaqs = (category: string): Array<{ question: string; answer: string }> => {
  return categorySpecificFaqs[category] || [];
};

// Helper function to get universal FAQs that apply to all tools
export const getUniversalFaqs = (): Array<{ question: string; answer: string }> => [
  {
    question: 'Is this tool completely free to use?',
    answer: 'Yes, this tool is 100% free with no hidden charges, subscriptions, or premium features. Simply visit the page and start using it immediately without any signup.',
  },
  {
    question: 'Is my data secure and private when using this tool?',
    answer: 'Absolutely. All processing happens locally in your browser. Your files and data never leave your device and are not stored on any server. We do not collect any personal information.',
  },
  {
    question: 'Do I need to install any software or create an account?',
    answer: 'No installation or account required. All tools work directly in your web browser. Just visit the tool page and start using it instantly.',
  },
  {
    question: 'Can I use this tool on mobile devices?',
    answer: 'Yes, all tools are fully supported and work perfectly on smartphones, tablets, and desktop computers.',
  },
  {
    question: 'How fast is the processing?',
    answer: 'Processing is instant for most files. Large files may take a few seconds depending on your internet speed and device performance.',
  },
  {
    question: 'Are there any watermarks or limitations?',
    answer: 'No watermarks, no limitations, and no quality loss. All tools provide professional results without any restrictions.',
  },
];
