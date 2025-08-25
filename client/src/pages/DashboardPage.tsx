import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks';
import { Card, Button, Badge, LoadingSpinner } from '@/components/ui';
import { reportsApi } from '@/utils/api';
import { formatCurrency, formatRelativeTime } from '@/utils/helpers';
import { DashboardStats } from '@/types';

const DashboardPage: React.FC = () => {
  const { user, hasAnyRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await reportsApi.getDashboardStats();
        setStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Claims',
      value: stats?.totalClaims || 0,
      icon: FileText,
      color: 'blue',
      change: '+12%',
    },
    {
      title: 'Pending Review',
      value: stats?.pendingReview || 0,
      icon: Clock,
      color: 'yellow',
      change: '-5%',
    },
    {
      title: 'Approved Today',
      value: stats?.approvedToday || 0,
      icon: CheckCircle,
      color: 'green',
      change: '+8%',
    },
    {
      title: 'Overdue',
      value: stats?.overdueAssignments || 0,
      icon: AlertTriangle,
      color: 'red',
      change: '-2%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.displayName}
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your claims today.
          </p>
        </div>
        {user?.role === 'POLICYHOLDER' && (
          <Link to="/claims/new">
            <Button variant="primary" leftIcon={<Plus size={16} />}>
              New Claim
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">{stat.change}</span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[
                {
                  id: '1',
                  action: 'Claim submitted',
                  claim: 'CLM-2024-001',
                  time: '2 hours ago',
                  status: 'submitted',
                },
                {
                  id: '2',
                  action: 'Status updated',
                  claim: 'CLM-2024-002',
                  time: '4 hours ago',
                  status: 'approved',
                },
                {
                  id: '3',
                  action: 'Document uploaded',
                  claim: 'CLM-2024-003',
                  time: '1 day ago',
                  status: 'in-review',
                },
              ].map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-500">{activity.claim}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="primary" size="sm">
                      {activity.status}
                    </Badge>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/claims">
                <Button variant="ghost" size="sm">
                  View all claims →
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {user?.role === 'POLICYHOLDER' && (
                <Link to="/claims/new">
                  <Button variant="primary" fullWidth leftIcon={<Plus size={16} />}>
                    Submit New Claim
                  </Button>
                </Link>
              )}
              
              <Link to="/claims">
                <Button variant="secondary" fullWidth leftIcon={<FileText size={16} />}>
                  View My Claims
                </Button>
              </Link>

              {hasAnyRole(['ADJUSTER', 'SUPERVISOR']) && (
                <Link to="/workbench">
                  <Button variant="secondary" fullWidth leftIcon={<Clock size={16} />}>
                    Open Workbench
                  </Button>
                </Link>
              )}

              {hasAnyRole(['SUPERVISOR', 'ADMIN']) && (
                <Link to="/reports">
                  <Button variant="secondary" fullWidth leftIcon={<TrendingUp size={16} />}>
                    View Reports
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      {stats && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {stats.averageProcessingTime}
                </p>
                <p className="text-sm text-gray-600">Avg. Processing Time (days)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success-600">95.2%</p>
                <p className="text-sm text-gray-600">SLA Compliance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning-600">
                  {formatCurrency(1250000)}
                </p>
                <p className="text-sm text-gray-600">Total Claims Value</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
