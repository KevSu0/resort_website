import React, { useState, useEffect } from 'react';
import { Eye, Mail, Phone, Calendar, MessageSquare, ChevronDown } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { Card } from '../../components/Layout';
import AdminSearchFilter from '../../components/AdminSearchFilter';
import { enquiryService } from '../../lib/firestore';
import { Enquiry } from '../../types';
import { toast } from '../../hooks/useToast';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const enquiryData = await enquiryService.getAll();
        setEnquiries(enquiryData);
      } catch (error) {
        console.error("Failed to fetch enquiries", error);
        toast({ title: 'Error', description: 'Failed to fetch enquiries.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: Enquiry['status']) => {
    try {
      await enquiryService.update(id, { status: newStatus });
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
      toast({ title: 'Success', description: 'Enquiry status updated.', variant: 'success' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'new': return 'bg-blue-100 text-blue-800';
        case 'contacted': return 'bg-yellow-100 text-yellow-800';
        case 'quoted': return 'bg-purple-100 text-purple-800';
        case 'booked': return 'bg-green-100 text-green-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = enquiry.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enquiry.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enquiry.property_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || enquiry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <AdminLayout><div className="p-6">Loading enquiries...</div></AdminLayout>
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Enquiries Management</h1>
          <p className="text-gray-600 mt-1">Manage customer enquiries and support requests</p>
        </div>

        <div className="max-w-7xl mx-auto">
          <AdminSearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search by name, email, property..."
            filters={[
              {
                label: 'Status Filter',
                value: filterStatus,
                onChange: setFilterStatus,
                options: [
                  { value: 'all', label: 'All Status' },
                  { value: 'new', label: 'New' },
                  { value: 'contacted', label: 'Contacted' },
                  { value: 'quoted', label: 'Quoted' },
                  { value: 'booked', label: 'Booked' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]
              }
            ]}
          />

          <div className="space-y-4">
            {filteredEnquiries.map((enquiry) => (
              <Card key={enquiry.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{enquiry.customer.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
                        {enquiry.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {enquiry.customer.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {enquiry.customer.phone || 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(enquiry.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 mb-1">Enquiry for {enquiry.property_name}</h4>
                      <p className="text-gray-600 text-sm">{enquiry.booking_details.message}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <div className="relative inline-block text-left">
                        <select
                            value={enquiry.status}
                            onChange={(e) => handleStatusChange(enquiry.id, e.target.value as Enquiry['status'])}
                            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="quoted">Quoted</option>
                            <option value="booked">Booked</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
             {filteredEnquiries.length === 0 && (
                <Card className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No enquiries found</h3>
                    <p className="text-gray-600">There are no enquiries that match your current filters.</p>
                </Card>
             )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}