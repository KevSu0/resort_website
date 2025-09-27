import { useState } from 'react';
import { User, FileText, Image, Settings, Calendar } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'user' | 'content' | 'media' | 'system';
  action: string;
  user: {
    name: string;
    avatar?: string;
  };
  target?: string;
  timestamp: string;
  icon?: React.ReactNode;
}

const typeIcons = {
  user: User,
  content: FileText,
  media: Image,
  system: Settings
};

const typeColors = {
  user: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  content: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  media: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  system: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
};

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'user',
    action: 'created new account',
    user: { name: 'John Doe' },
    timestamp: '2 minutes ago'
  },
  {
    id: '2',
    type: 'content',
    action: 'updated page',
    user: { name: 'Jane Smith' },
    target: 'Homepage',
    timestamp: '15 minutes ago'
  },
  {
    id: '3',
    type: 'media',
    action: 'uploaded',
    user: { name: 'Mike Johnson' },
    target: '12 images',
    timestamp: '1 hour ago'
  },
  {
    id: '4',
    type: 'system',
    action: 'backup completed',
    user: { name: 'System' },
    timestamp: '2 hours ago'
  },
  {
    id: '5',
    type: 'content',
    action: 'published',
    user: { name: 'Sarah Wilson' },
    target: 'Blog Post: Summer Offers',
    timestamp: '3 hours ago'
  }
];

export const ActivityFeed: React.FC = () => {
  const [activities] = useState<ActivityItem[]>(mockActivities);
  const [filter, setFilter] = useState<'all' | 'user' | 'content' | 'media' | 'system'>('all');

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(activity => activity.type === filter);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <div className="mt-4 flex space-x-2">
          {['all', 'user', 'content', 'media', 'system'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={`px-3 py-1 text-sm rounded-full capitalize ${
                filter === type
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredActivities.map((activity) => {
          const Icon = typeIcons[activity.type];
          const colorClass = typeColors[activity.type];

          return (
            <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 rounded-full p-2 ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{activity.user.name}</span> {activity.action}
                    {activity.target && (
                      <span className="text-gray-600 dark:text-gray-400"> {activity.target}</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
          View all activity →
        </button>
      </div>
    </div>
  );
};