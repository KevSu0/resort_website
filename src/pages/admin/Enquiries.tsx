import React, { useState } from 'react';
import { Eye, Trash2, Mail, Phone, Calendar, MessageSquare } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { Card, Grid } from '../../components/Layout';
import AdminStatsCard from '../../components/AdminStatsCard';
import AdminSearchFilter from '../../components/AdminSearchFilter';

export default function AdminEnquiries() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const enquiries = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      subject: 'Wedding Venue Inquiry',
      message: 'Looking for a beachfront venue for a 150-guest wedding in June 2024.',
      type: 'Wedding',
      status: 'new',
      date: '2024-01-15',
      priority: 'high'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      phone: '+1 (555) 987-6543',
      subject: 'Corporate Retreat',
      message: 'Need accommodation for 50 employees for a 3-day corporate retreat.',
      type: 'Corporate',
      status: 'in-progress',
      date: '2024-01-14',
      priority: 'medium'
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      email: 'emma.r@email.com',
      phone: '+1 (555) 456-7890',
      subject: 'Family Vacation',
      message: 'Planning a family vacation for 8 people, need connecting rooms.',
      type: 'Vacation',
      status: 'resolved',
      date: '2024-01-13',
      priority: 'low'
    },
    {
      id: 4,
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      phone: '+1 (555) 321-0987',
      subject: 'Special Dietary Requirements',
      message: 'Inquiring about gluten-free and vegan meal options for upcoming stay.',
      type: 'Special Request',
      status: 'new',
      date: '2024-01-12',
      priority: 'medium'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enquiry.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || enquiry.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || enquiry.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
            searchPlaceholder="Search enquiries..."
            filters={[
              {
                label: 'Status Filter',
                value: filterStatus,
                onChange: setFilterStatus,
                options: [
                  { value: 'all', label: 'All Status' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'in-progress', label: 'In Progress' },
                  { value: 'resolved', label: 'Resolved' },
                  { value: 'closed', label: 'Closed' }
                ]
              },
              {
                label: 'Priority Filter',
                value: filterPriority,
                onChange: setFilterPriority,
                options: [
                  { value: 'all', label: 'All Priority' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' }
                ]
              }
            ]}
          />

          {/* Enquiries List */}
          <div className="space-y-4">
            {filteredEnquiries.map((enquiry) => (
              <Card key={enquiry.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{enquiry.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
                        {enquiry.status.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(enquiry.priority)}`}>
                        {enquiry.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {enquiry.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {enquiry.phone}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {enquiry.date}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 mb-1">{enquiry.subject}</h4>
                      <p className="text-gray-600 text-sm">{enquiry.message}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {enquiry.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Reply
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}