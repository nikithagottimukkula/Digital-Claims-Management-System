import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Calendar,
  DollarSign,
  User
} from 'lucide-react';
import { useAppDispatch, useAppSelector, useAuth, useDebounce } from '@/hooks';
import { fetchClaims, setFilters } from '@/store/slices/claimsSlice';
import { Button, Input, Select, Card, Badge, LoadingSpinner } from '@/components/ui';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from '@/utils/helpers';
import { ClaimStatus, Priority } from '@/types';

const ClaimsListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, hasAnyRole } = useAuth();
  const { claims, filters, pagination, isLoading } = useAppSelector(state => state.claims);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    dispatch(fetchClaims({ 
      filters: { ...filters, search: debouncedSearch || undefined },
      page: pagination.page,
      limit: pagination.limit 
    }));
  }, [dispatch, filters, debouncedSearch, pagination.page, pagination.limit]);

  const handleFilterChange = (key: string, value: any) => {
    dispatch(setFilters({ ...filters, [key]: value }));
  };

  const handlePageChange = (page: number) => {
    dispatch(fetchClaims({ 
      filters, 
      page, 
      limit: pagination.limit 
    }));
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'INFO_REQUESTED', label: 'Info Requested' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'PAID', label: 'Paid' },
    { value: 'CLOSED', label: 'Closed' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Claims</h1>
          <p className="text-gray-600">
            Manage and track insurance claims
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

      {/* Search and Filters */}
      <Card>
        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search size={16} />}
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter size={16} />}
            >
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <Select
                label="Status"
                options={statusOptions}
                value={filters.status?.[0] || ''}
                onChange={(e) => handleFilterChange('status', e.target.value ? [e.target.value] : undefined)}
              />
              <Select
                label="Priority"
                options={priorityOptions}
                value={filters.priority?.[0] || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value ? [e.target.value] : undefined)}
              />
              <Input
                label="Date From"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Claims Table */}
      <Card>
        {isLoading ? (
          <div className="p-8">
            <LoadingSpinner size="lg" text="Loading claims..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claimant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Incident Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {claim.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User size={16} className="text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {claim.claimant?.displayName || 'Unknown'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{claim.incidentType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign size={16} className="text-gray-400 mr-1" />
                        <div className="text-sm text-gray-900">
                          {claim.amountClaimed ? formatCurrency(claim.amountClaimed) : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={getStatusColor(claim.status) as any}
                        size="sm"
                      >
                        {getStatusLabel(claim.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {formatDate(claim.createdAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/claims/${claim.id}`)}
                        leftIcon={<Eye size={14} />}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {claims.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No claims found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {user?.role === 'POLICYHOLDER' 
                    ? "You haven't submitted any claims yet."
                    : "No claims match your current filters."
                  }
                </p>
                {user?.role === 'POLICYHOLDER' && (
                  <div className="mt-6">
                    <Link to="/claims/new">
                      <Button variant="primary" leftIcon={<Plus size={16} />}>
                        Submit Your First Claim
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ClaimsListPage;
