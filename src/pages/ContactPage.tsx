import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Users, Calendar } from 'lucide-react';
import Layout from '../components/Layout';
import { Section, Card, Grid, HeroSection } from '../components/Layout';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      });
    }, 2000);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Contact Us
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">
            We're here to help you plan your perfect getaway. Get in touch with our team.
          </p>
        </div>
      </HeroSection>

      {/* Contact Information */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions about our properties or need assistance with your booking? 
            Our dedicated team is ready to help you 24/7.
          </p>
        </div>
        
        <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
            <p className="text-gray-600 text-sm mb-2">Call us anytime</p>
            <a href="tel:+1-800-RESORT" className="text-blue-600 hover:text-blue-700 font-medium">
              +1 (800) RESORT
            </a>
          </Card>
          
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600 text-sm mb-2">Send us a message</p>
            <a href="mailto:info@resortgroup.com" className="text-blue-600 hover:text-blue-700 font-medium">
              info@resortgroup.com
            </a>
          </Card>
          
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-600 text-sm mb-2">Chat with our team</p>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Start Chat
            </button>
          </Card>
          
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Hours</h3>
            <p className="text-gray-600 text-sm mb-2">We're available</p>
            <p className="text-gray-900 font-medium text-sm">24/7 Support</p>
          </Card>
        </Grid>
      </Section>

      {/* Contact Form & Office Info */}
      <Section className="bg-gray-50">
        <Grid className="grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Send us a Message
            </h2>
            
            {submitted ? (
              <Card className="p-8 text-center bg-green-50 border-green-200">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                  <Send className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Message Sent Successfully!
                </h3>
                <p className="text-green-700">
                  Thank you for contacting us. We'll get back to you within 24 hours.
                </p>
              </Card>
            ) : (
              <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-2">
                        Inquiry Type
                      </label>
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="booking">Booking Assistance</option>
                        <option value="support">Customer Support</option>
                        <option value="partnership">Partnership</option>
                        <option value="media">Media Inquiry</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief subject of your message"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </Card>
            )}
          </div>
          
          {/* Office Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Our Offices
            </h2>
            
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-100 rounded-lg mr-4">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Headquarters</h3>
                    <p className="text-gray-600 mb-2">
                      123 Resort Boulevard<br />
                      Miami Beach, FL 33139<br />
                      United States
                    </p>
                    <p className="text-sm text-gray-500">
                      Main office and customer service center
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-start">
                  <div className="p-2 bg-green-100 rounded-lg mr-4">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">West Coast Office</h3>
                    <p className="text-gray-600 mb-2">
                      456 Pacific Coast Highway<br />
                      Malibu, CA 90265<br />
                      United States
                    </p>
                    <p className="text-sm text-gray-500">
                      Regional operations and partnerships
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-start">
                  <div className="p-2 bg-purple-100 rounded-lg mr-4">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">International Office</h3>
                    <p className="text-gray-600 mb-2">
                      789 Resort Plaza<br />
                      Cancun, Quintana Roo<br />
                      Mexico
                    </p>
                    <p className="text-sm text-gray-500">
                      International properties and guest services
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Grid>
      </Section>

      {/* FAQ Section */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600">
            Quick answers to common questions
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              question: "How can I make a reservation?",
              answer: "You can make a reservation directly through our website, by calling our reservation hotline, or by contacting any of our properties directly."
            },
            {
              question: "What is your cancellation policy?",
              answer: "Cancellation policies vary by property and booking type. Most reservations can be cancelled up to 24-48 hours before check-in without penalty."
            },
            {
              question: "Do you offer group bookings?",
              answer: "Yes, we offer special rates and services for group bookings. Please contact our group sales team for customized packages."
            },
            {
              question: "Are pets allowed at your properties?",
              answer: "Pet policies vary by property. Many of our locations are pet-friendly with additional fees. Please check the specific property details or contact us."
            }
          ].map((faq, index) => (
            <Card key={index} className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Call to Action */}
      <Section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Book Your Stay?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Don't wait - secure your perfect accommodation today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              <Calendar className="mr-2 w-4 h-4" />
              Book Now
            </button>
            <button className="inline-flex items-center px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium">
              <Users className="mr-2 w-4 h-4" />
              Group Booking
            </button>
          </div>
        </div>
      </Section>
    </Layout>
  );
}