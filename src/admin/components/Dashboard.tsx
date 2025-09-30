import { Link } from 'react-router-dom';
import {
  Building,
  DoorOpen,
  Image,
  MessageSquare,
  Tag,
  Clock,
  Eye
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  // Mock stats for now
  const stats = [
    {
      name: 'Properties',
      value: '3',
      change: '+0%',
      icon: <Building className="w-6 h-6" />,
      color: 'bg-blue-500',
      href: '/admin/content'
    },
    {
      name: 'Room Types',
      value: '12',
      change: '+0%',
      icon: <DoorOpen className="w-6 h-6" />,
      color: 'bg-green-500',
      href: '/admin/content'
    },
    {
      name: 'Media Files',
      value: '48',
      change: '+12%',
      icon: <Image className="w-6 h-6" />,
      color: 'bg-purple-500',
      href: '/admin/media'
    },
    {
      name: 'Enquiries',
      value: '24',
      change: '+25%',
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-orange-500',
      href: '/admin/enquiries'
    },
  ];

  const recentActivity = [
    {
      type: 'enquiry',
      message: 'New enquiry received for Chelotte Estate',
      time: '2 minutes ago',
      icon: <MessageSquare className="w-4 h-4" />
    },
    {
      type: 'publish',
      message: 'Published changes to homepage',
      time: '1 hour ago',
      icon: <Eye className="w-4 h-4" />
    },
    {
      type: 'media',
      message: 'Uploaded 5 new images to Bayfront Retreat',
      time: '3 hours ago',
      icon: <Image className="w-4 h-4" />
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back! Here's what's happening with your resort website.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-md ${stat.color}`}>
                  <div className="text-white">{stat.icon}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== recentActivity.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        ></span>
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                            <span className="text-gray-500">{activity.icon}</span>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900 font-medium">
                              {activity.message}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/admin/content"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Building className="w-4 h-4 mr-2" />
                Edit Content
              </Link>
              <Link
                to="/admin/media"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Image className="w-4 h-4 mr-2" />
                Upload Media
              </Link>
              <Link
                to="/admin/offers"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Tag className="w-4 h-4 mr-2" />
                Create Offer
              </Link>
              <Link
                to="/admin/enquiries"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                View Enquiries
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Draft/Publish Status */}
      <div className="mt-6 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Publishing Status
          </h3>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You have unpublished changes. Review and publish when ready.
                </p>
                <div className="mt-4">
                  <div className="flex space-x-3">
                    <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      Review Changes
                    </button>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                      View Draft
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};