import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  User,
  Calendar,
  DollarSign,
  Filter
} from 'lucide-react';
import { useAppDispatch, useAppSelector, useAuth } from '@/hooks';
import { fetchClaims, setFilters } from '@/store/slices/claimsSlice';
import { Button, Card, Badge, LoadingSpinner, Select } from '@/components/ui';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel, getPriorityColor } from '@/utils/helpers';
import { ClaimStatus, Priority } from '@/types';

const WorkbenchPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { claims, isLoading } = useAppSelector(state => state.claims);
  
  const [selectedPriority, setSelectedPriority] = useState<Priority | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<ClaimStatus | ''>('');

  useEffect(() => {
    // Fetch claims assigned to current user or all claims for supervisors
    const filters = user?.role === 'SUPERVISOR' ? {} : { assignedTo: user?.id };
    dispatch(fetchClaims({ filters }));
  }, [dispatch, user]);

  const handleFilterChange = () => {
    const filters: any = {};
    if (selectedPriority) filters.priority = [selectedPriority];
    if (selectedStatus) filters.status = [selectedStatus];
    if (user?.role === 'ADJUSTER') filters.assignedTo = user.id;
    
    dispatch(setFilters(filters));
  };

  useEffect(() => {
    handleFilterChange();
  }, [selectedPriority, selectedStatus]);

  // Categorize claims
  const urgentClaims = claims.filter(claim => 
    claim.assignment?.priority === 'URGENT' || 
    (claim.assignment?.dueAt && new Date(claim.assignment.dueAt) < new Date())
  );
  
  const pendingReview = claims.filter(claim => 
    ['SUBMITTED', 'IN_REVIEW'].includes(claim.status)
  );
  
  const awaitingInfo = claims.filter(claim => 
    claim.status === 'INFO_REQUESTED'
  );

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'INFO_REQUESTED', label: 'Info Requested' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading workbench..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.role === 'SUPERVISOR' ? 'Supervisor Workbench' : 'Adjuster Workbench'}
        </h1>
        <p className="text-gray-600">
          Manage your assigned claims and track SLA compliance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{claims.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-red-600">{urgentClaims.length}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingReview.length}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Awaiting Info</p>
              <p className="text-2xl font-bold text-orange-600">{awaitingInfo.length}</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <CheckCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex space-x-4">
            <Select
              options={priorityOptions}
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as Priority | '')}
              className="w-40"
            />
            <Select
              options={statusOptions}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ClaimStatus | '')}
              className="w-40"
            />
          </div>
        </div>
      </Card>

      {/* Claims Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Claims */}
        {urgentClaims.length > 0 && (
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  Urgent Claims
                </h3>
                <Badge variant="danger" size="sm">
                  {urgentClaims.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {urgentClaims.slice(0, 5).map((claim) => (
                  <div
                    key={claim.id}
                    className="p-3 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 cursor-pointer transition-colors"
                    onClick={() => navigate(`/claims/${claim.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {claim.id.slice(0, 8)}...
                        </span>
                        <Badge variant="danger" size="sm">
                          {claim.assignment?.priority || 'URGENT'}
                        </Badge>
                      </div>
                      <Badge variant={getStatusColor(claim.status) as any} size="sm">
                        {getStatusLabel(claim.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{claim.incidentType}</span>
                      <span>
                        Due: {claim.assignment?.dueAt ? formatDate(claim.assignment.dueAt) : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Recent Claims */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Claims
              </h3>
              <Badge variant="primary" size="sm">
                {claims.length}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {claims.slice(0, 5).map((claim) => (
                <div
                  key={claim.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/claims/${claim.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {claim.id.slice(0, 8)}...
                      </span>
                      {claim.assignment?.priority && (
                        <Badge 
                          variant={getPriorityColor(claim.assignment.priority) as any} 
                          size="sm"
                        >
                          {claim.assignment.priority}
                        </Badge>
                      )}
                    </div>
                    <Badge variant={getStatusColor(claim.status) as any} size="sm">
                      {getStatusLabel(claim.status)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{claim.claimant?.displayName || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(claim.createdAt)}</span>
                    </div>
                  </div>
                  
                  {claim.amountClaimed && (
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>{formatCurrency(claim.amountClaimed)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {claims.length > 5 && (
              <div className="mt-4 text-center">
                <Button variant="ghost" size="sm">
                  View all {claims.length} claims
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Claims Table */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            All Assigned Claims
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Claim ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Claimant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {claim.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {claim.claimant?.displayName || 'Unknown'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {claim.incidentType}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {claim.assignment?.priority ? (
                        <Badge 
                          variant={getPriorityColor(claim.assignment.priority) as any} 
                          size="sm"
                        >
                          {claim.assignment.priority}
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(claim.status) as any} size="sm">
                        {getStatusLabel(claim.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {claim.assignment?.dueAt ? (
                        <span className={
                          new Date(claim.assignment.dueAt) < new Date() 
                            ? 'text-red-600 font-medium' 
                            : ''
                        }>
                          {formatDate(claim.assignment.dueAt)}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/claims/${claim.id}`)}
                        leftIcon={<Eye size={14} />}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {claims.length === 0 && (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No claims assigned</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any claims assigned to you at the moment.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default WorkbenchPage;
