import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  Calendar,
  Download
} from 'lucide-react';
import { Card, Button, Select, Input, LoadingSpinner } from '@/components/ui';
import { reportsApi } from '@/utils/api';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { SLAReport, DashboardStats } from '@/types';

const ReportsPage: React.FC = () => {
  const [slaReport, setSlaReport] = useState<SLAReport | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedReport, setSelectedReport] = useState('overview');

  useEffect(() => {
    fetchReports();
  }, [dateFrom, dateTo]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [slaResponse, statsResponse] = await Promise.all([
        reportsApi.getSLAReport({ dateFrom, dateTo }),
        reportsApi.getDashboardStats(),
      ]);
      
      setSlaReport(slaResponse.data.data);
      setDashboardStats(statsResponse.data.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const reportOptions = [
    { value: 'overview', label: 'Overview' },
    { value: 'sla', label: 'SLA Performance' },
    { value: 'financial', label: 'Financial Summary' },
    { value: 'trends', label: 'Trends Analysis' },
  ];

  const exportReport = () => {
    // Implementation for exporting reports
    console.log('Exporting report...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading reports..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">
            Monitor performance and track key metrics
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={exportReport}
          leftIcon={<Download size={16} />}
        >
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <Select
            label="Report Type"
            options={reportOptions}
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="w-48"
          />
          <Input
            label="From Date"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
          <Input
            label="To Date"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
          />
        </div>
      </Card>

      {/* Overview Stats */}
      {selectedReport === 'overview' && dashboardStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Claims</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalClaims}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600">+12% from last month</span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{dashboardStats.pendingReview}</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-100">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-red-600">+5% from last month</span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Today</p>
                  <p className="text-2xl font-bold text-green-600">{dashboardStats.approvedToday}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600">+8% from yesterday</span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{dashboardStats.overdueAssignments}</p>
                </div>
                <div className="p-3 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600">-2% from last week</span>
              </div>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Processing Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Processing Time</span>
                  <span className="text-sm font-medium">{dashboardStats.averageProcessingTime} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">SLA Compliance</span>
                  <span className="text-sm font-medium text-green-600">95.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">First Call Resolution</span>
                  <span className="text-sm font-medium">87.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Customer Satisfaction</span>
                  <span className="text-sm font-medium">4.6/5.0</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Financial Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Claims Value</span>
                  <span className="text-sm font-medium">{formatCurrency(2450000)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Approved Amount</span>
                  <span className="text-sm font-medium text-green-600">{formatCurrency(2100000)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Amount</span>
                  <span className="text-sm font-medium text-yellow-600">{formatCurrency(250000)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rejected Amount</span>
                  <span className="text-sm font-medium text-red-600">{formatCurrency(100000)}</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* SLA Performance */}
      {selectedReport === 'sla' && slaReport && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              SLA Overview
            </h3>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {((slaReport.onTime / slaReport.totalClaims) * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">SLA Compliance Rate</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{slaReport.onTime}</div>
                  <p className="text-sm text-gray-600">On Time</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-xl font-bold text-red-600">{slaReport.overdue}</div>
                  <p className="text-sm text-gray-600">Overdue</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {slaReport.averageCycleTime.toFixed(1)} days
                </div>
                <p className="text-sm text-gray-600">Average Cycle Time</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              SLA Breaches by Product
            </h3>
            <div className="space-y-3">
              {Object.entries(slaReport.breachesByProduct).map(([product, breaches]) => (
                <div key={product} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">{product}</span>
                  <span className="text-sm font-bold text-red-600">{breaches}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Financial Summary */}
      {selectedReport === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Claims by Value Range
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">$0 - $1,000</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">$1,000 - $5,000</span>
                <span className="text-sm font-medium">30%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">$5,000 - $10,000</span>
                <span className="text-sm font-medium">15%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">$10,000+</span>
                <span className="text-sm font-medium">10%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Trends
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">January</span>
                <span className="text-sm font-medium">{formatCurrency(180000)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">February</span>
                <span className="text-sm font-medium">{formatCurrency(220000)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">March</span>
                <span className="text-sm font-medium">{formatCurrency(195000)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">April</span>
                <span className="text-sm font-medium">{formatCurrency(240000)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Loss Causes
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Auto Accidents</span>
                <span className="text-sm font-medium">35%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Property Damage</span>
                <span className="text-sm font-medium">25%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Theft</span>
                <span className="text-sm font-medium">20%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Water Damage</span>
                <span className="text-sm font-medium">12%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Other</span>
                <span className="text-sm font-medium">8%</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Trends Analysis */}
      {selectedReport === 'trends' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Claims Volume Trends
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart visualization would go here</p>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Processing Time Trends
              </h3>
              <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Processing time chart</p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Approval Rate Trends
              </h3>
              <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Approval rate chart</p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
