import { useState } from 'react';
import { Mail, Phone, Facebook, Twitter, Instagram, Send, CheckCircle2, Zap } from 'lucide-react';

const Footer = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.message) return;
    
    const mailtoLink = `mailto:Pottagames1@gmail.com?subject=Message from ${formData.name}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;
    window.location.href = mailtoLink;
    
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    
    <footer className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                POTTA
              </h2>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Not just a Game, A Hustle. Compete, stake, and show your skills in 8-ball pool.
            </p>
            <div className="pt-4">
              <p className="text-sm text-gray-500 mb-2">Join the community</p>
              <div className="flex gap-3">
                <a 
                  href="#" 
                  className="w-10 h-10 bg-slate-800 hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-500 rounded-lg flex items-center justify-center transition-all transform hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-slate-800 hover:bg-gradient-to-br hover:from-sky-600 hover:to-sky-500 rounded-lg flex items-center justify-center transition-all transform hover:scale-110"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.instagram.com/potta_games?igsh=MXR5aGZ6Nmp0ZG1ucA%3D%3D&utm_source=qr" 
                  className="w-10 h-10 bg-slate-800 hover:bg-gradient-to-br hover:from-pink-600 hover:to-purple-500 rounded-lg flex items-center justify-center transition-all transform hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              Contact Us
            </h3>
            <div className="space-y-4">
              <a 
                href="mailto:Pottagames1@gmail.com"
                className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-semibold group-hover:text-purple-400 transition-colors">
                    Pottagames1@gmail.com
                  </p>
                </div>
              </a>

              <a 
                href="tel:+233552713108"
                className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-all group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-semibold group-hover:text-blue-400 transition-colors">
                    +233 55 271 3108
                  </p>
                </div>
              </a>
            </div>

            {/* Quick Stats */}
            <div className="pt-4 grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                <p className="text-2xl font-black text-purple-400">24/7</p>
                <p className="text-xs text-gray-400">Support</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                <p className="text-2xl font-black text-blue-400">100%</p>
                <p className="text-xs text-gray-400">Secure</p>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              Send Us a Message
            </h3>
            
            {isSubmitted ? (
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 text-center">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-400" />
                <h4 className="text-xl font-bold text-green-400 mb-2">Message Sent!</h4>
                <p className="text-sm text-gray-300">We'll get back to you soon.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-gray-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-gray-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Your Message"
                    className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-gray-500 transition-all outline-none resize-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-lg font-bold transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} <span className="text-white font-semibold">POTTA</span>. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Fair Play</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;