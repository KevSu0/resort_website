import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Shield, Mail, Calendar, Filter, UserCheck, UserX } from 'lucide-react';
import Layout from '../../components/Layout';
import { Card, Grid } from '../../components/Layout';

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const users = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15',
      joinDate: '2023-06-15',
      bookings: 12,
      totalSpent: 15420,
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20business%20man%20portrait%20headshot%20suit%20confident%20smile&image_size=square'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      role: 'manager',
      status: 'active',
      lastLogin: '2024-01-14',
      joinDate: '2023-08-22',
      bookings: 8,
      totalSpent: 9850,
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20business%20woman%20portrait%20headshot%20blazer%20confident%20smile&image_size=square'
    },
    {
      id: 3,
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      role: 'customer',
      status: 'active',
      lastLogin: '2024-01-13',
      joinDate: '2023-11-10',
      bookings: 5,
      totalSpent: 6200,
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=young%20professional%20man%20portrait%20casual%20shirt%20friendly%20smile&image_size=square'
    },
    {
      id: 4,
      name: 'Emma Rodriguez',
      email: 'emma.rodriguez@email.com',
      role: 'customer',
      status: 'inactive',
      lastLogin: '2023-12-20',
      joinDate: '2023-09-05',
      bookings: 3,
      totalSpent: 2100,
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=young%20woman%20portrait%20casual%20top%20warm%20smile%20friendly&image_size=square'
    },
    {
      id: 5,
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      role: 'staff',
      status: 'active',
      lastLogin: '2024-01-12',
      joinDate: '2023-07-18',
      bookings: 0,
      totalSpent: 0,
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=middle%20aged%20man%20portrait%20polo%20shirt%20professional%20friendly&image_size=square'
    },
    {
      id: 6,
      name: 'Lisa Anderson',
      email: 'lisa.anderson@email.com',
      role: 'customer',
      status: 'suspended',
      lastLogin: '2024-01-10',
      joinDate: '2023-12-01',
      bookings: 1,
      totalSpent: 450,
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=woman%20portrait%20business%20casual%20professional%20confident&image_size=square'
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'staff': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
                  <p className="text-gray-600">Manage user accounts and permissions</p>
                </div>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <Grid className="grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'active').length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'admin').length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'suspended').length}</p>
                </div>
              </div>
            </Card>
          </Grid>

          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                  <option value="customer">Customer</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role.toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {user.email}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Joined {user.joinDate}
                        </div>
                        <div>
                          Last login: {user.lastLogin}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{user.bookings}</div>
                      <div className="text-xs text-gray-600">Bookings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">${user.totalSpent.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Total Spent</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}