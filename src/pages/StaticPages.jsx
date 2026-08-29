import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Mail, Phone, MapPin, Send, HelpCircle, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export const HelpPage = () => {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: 'How can I track my A_S Commerce consignment?',
      a: 'Navigate to our Track Order page and input your 8-character Order ID (e.g. AS-884219) or Bluedart tracking number to check real-time courier milestones.'
    },
    {
      q: 'What is the standard delivery duration?',
      a: 'Standard deliveries are fulfilled via Bluedart Express within 3-4 business days. VIP Air Express orders are delivered within 24-48 hours.'
    },
    {
      q: 'What is the return and refund policy?',
      a: 'We extend an effortless 30-day return policy on all eligible unblemished luxury pieces with original packaging intact. Refunds are initiated instantly via your original payment mode.'
    },
    {
      q: 'Are all products authentic?',
      a: 'Yes, 100% of our catalogue is handcrafted and guaranteed authentic, complete with bespoke authentication serial codes.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn space-y-8">
      <div className="text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Client Concierge</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-950 mt-1">
          Frequently Asked Questions
        </h1>
      </div>

      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
              className="w-full text-left p-5 flex items-center justify-between font-bold text-sm text-navy-950 hover:text-gold-600 transition-colors"
            >
              <span>{f.q}</span>
              <span className="text-lg">{openFaq === i ? '−' : '+'}</span>
            </button>
            {openFaq === i && (
              <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ContactPage = () => {
  const { addToast } = useToast();
  const [msg, setMsg] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    addToast('Your inquiry has been received. Our VIP Concierge will respond within 2 hours.', 'success');
    setMsg({ name: '', email: '', message: '' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-sm space-y-6">
        <div className="text-center max-w-md mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600">24/7 Dedicated Support</span>
          <h1 className="font-serif text-3xl font-bold text-navy-950 mt-1">Contact Our Concierge</h1>
          <p className="text-xs text-gray-500 mt-2">
            Reach out for bespoke styling guidance, consignment inquiries, or order status assistance.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto text-xs">
          <input
            type="text"
            required
            placeholder="Your Full Name"
            value={msg.name}
            onChange={(e) => setMsg({ ...msg, name: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-gold-500"
          />
          <input
            type="email"
            required
            placeholder="Email Address"
            value={msg.email}
            onChange={(e) => setMsg({ ...msg, email: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-gold-500"
          />
          <textarea
            required
            rows="4"
            placeholder="How may our concierge assist you today?"
            value={msg.message}
            onChange={(e) => setMsg({ ...msg, message: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-gold-500"
          />
          <button
            type="submit"
            className="w-full py-3.5 bg-gold-gradient text-navy-950 font-bold text-xs rounded-xl shadow-gold-sm hover:brightness-105"
          >
            Submit Inquiry
          </button>
        </form>
      </div>
    </div>
  );
};
