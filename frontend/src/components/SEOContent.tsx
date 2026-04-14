import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, Users, Zap, Shield } from 'lucide-react';

interface SEOContentProps {
  toolName: string;
  primaryKeyword: string;
  description: string;
  benefits: Array<{ title: string; description: string }>;
  useCases: string[];
  relatedTools: Array<{ name: string; url: string; description: string }>;
  faqs?: Array<{ question: string; answer: string }>;
}

const SEOContent: React.FC<SEOContentProps> = ({
  toolName,
  primaryKeyword,
  description,
  benefits,
  useCases,
  relatedTools,
  faqs = []
}) => {
  return (
    <div className="space-y-8">
      {/* SEO-optimized Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h2 className="text-2xl font-bold text-blue-900 mb-3">
          Best {primaryKeyword} Tool Online Free 2024
        </h2>
        <p className="text-blue-800 mb-4 leading-relaxed">
          {description}
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
            ⭐ 4.9/5 Rating
          </span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
            ✓ 100% Free
          </span>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
            🔒 Secure
          </span>
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">
            ⚡ Instant
          </span>
        </div>
      </section>

      {/* Key Features */}
      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Why Choose Our {toolName}? #1 Choice in 2024
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {benefits.map((benefit: { title: string; description: string }, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-200">
              <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Perfect for {primaryKeyword} - Top Use Cases
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          {useCases.map((useCase, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-800 text-sm font-medium">{useCase}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Step by Step Guide */}
      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          How to {primaryKeyword.toLowerCase()} - Step by Step Guide
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
              1
            </div>
            <p className="text-gray-700">
              <strong>Upload your file</strong> - Click the upload button or drag and drop your file
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
              2
            </div>
            <p className="text-gray-700">
              <strong>Configure options</strong> - Adjust settings according to your needs
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
              3
            </div>
            <p className="text-gray-700">
              <strong>Process</strong> - Click the process button and wait for results
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
              ✓
            </div>
            <p className="text-gray-700">
              <strong>Download</strong> - Get your processed file instantly
            </p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-xl font-bold text-green-900 mb-4">
          Trusted by Millions - {toolName} Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600">2M+</div>
            <div className="text-sm text-green-800">Happy Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">10M+</div>
            <div className="text-sm text-green-800">Files Processed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">99.9%</div>
            <div className="text-sm text-green-800">Uptime</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">4.9⭐</div>
            <div className="text-sm text-green-800">User Rating</div>
          </div>
        </div>
      </section>

      {/* Related Tools */}
      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          More Tools Like {primaryKeyword} - Complete Toolkit
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {relatedTools.map((tool, index) => (
            <Link
              key={index}
              to={tool.url}
              className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{tool.name}</h4>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-gray-600 text-sm">{tool.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions - {primaryKeyword}
          </h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Comparison with Others */}
      <section className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
        <h3 className="text-xl font-bold text-yellow-900 mb-4">
          Why Our {primaryKeyword} is Better Than Alternatives
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-green-800 mb-3">✅ DailyTools247</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-green-600" />
                <span>Instant processing</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>100% secure & private</span>
              </li>
              <li className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-green-600" />
                <span>No registration required</span>
              </li>
              <li className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-green-600" />
                <span>High quality results</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-red-800 mb-3">❌ Others</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <span className="text-red-600">✗</span>
                <span>Slow processing</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-red-600">✗</span>
                <span>Registration required</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-red-600">✗</span>
                <span>Limited file sizes</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-red-600">✗</span>
                <span>Poor quality output</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SEOContent;
