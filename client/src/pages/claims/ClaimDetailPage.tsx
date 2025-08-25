import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  MessageSquare,
  Paperclip,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAppDispatch, useAppSelector, usePermissions } from '@/hooks';
import { fetchClaimById, updateClaimStatus } from '@/store/slices/claimsSlice';
import { Button, Card, Badge, LoadingSpinner, Modal, Select } from '@/components/ui';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel, canTransitionStatus } from '@/utils/helpers';
import { ClaimStatus, StatusChangeRequest } from '@/types';
import toast from 'react-hot-toast';

const ClaimDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentClaim, isLoading, isSubmitting } = useAppSelector(state => state.claims);
  const { user } = useAppSelector(state => state.auth);
  const { canEditClaim } = usePermissions();
  
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<ClaimStatus>('SUBMITTED');
  const [statusReason, setStatusReason] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchClaimById(id));
    }
  }, [dispatch, id]);

  const handleStatusChange = async () => {
    if (!currentClaim || !user) return;

    if (!canTransitionStatus(currentClaim.status, newStatus, user.role)) {
      toast.error('You cannot perform this status transition');
      return;
    }

    try {
      const statusChange: StatusChangeRequest = {
        targetStatus: newStatus,
        reason: statusReason || undefined,
      };

      await dispatch(updateClaimStatus({ 
        id: currentClaim.id, 
        statusChange 
      })).unwrap();

      toast.success(`Claim status updated to ${getStatusLabel(newStatus)}`);
      setShowStatusModal(false);
      setStatusReason('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update claim status');
    }
  };

  const getAvailableStatusTransitions = (): ClaimStatus[] => {
    if (!currentClaim || !user) return [];

    const allStatuses: ClaimStatus[] = [
      'SUBMITTED', 'IN_REVIEW', 'INFO_REQUESTED', 'APPROVED', 'REJECTED', 'PAID', 'CLOSED'
    ];

    return allStatuses.filter(status => 
      status !== currentClaim.status && 
      canTransitionStatus(currentClaim.status, status, user.role)
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading claim details..." />
      </div>
    );
  }

  if (!currentClaim) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Claim not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The claim you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <div className="mt-6">
          <Button variant="primary" onClick={() => navigate('/claims')}>
            Back to Claims
          </Button>
        </div>
      </div>
    );
  }

  const availableTransitions = getAvailableStatusTransitions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/claims')}
            leftIcon={<ArrowLeft size={16} />}
          >
            Back to Claims
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Claim Details
            </h1>
            <p className="text-gray-600">
              ID: {currentClaim.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        
        {availableTransitions.length > 0 && (
          <Button
            variant="primary"
            onClick={() => setShowStatusModal(true)}
          >
            Update Status
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claim Overview */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Claim Overview
                </h3>
                <Badge 
                  variant={getStatusColor(currentClaim.status) as any}
                  size="lg"
                >
                  {getStatusLabel(currentClaim.status)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Incident Date</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(currentClaim.incidentDate)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Incident Type</p>
                      <p className="text-sm text-gray-600">{currentClaim.incidentType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Claimant</p>
                      <p className="text-sm text-gray-600">
                        {currentClaim.claimant?.displayName || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Amount Claimed</p>
                      <p className="text-sm text-gray-600">
                        {currentClaim.amountClaimed 
                          ? formatCurrency(currentClaim.amountClaimed, currentClaim.currency)
                          : 'Not specified'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {currentClaim.amountApproved && (
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Amount Approved</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(currentClaim.amountApproved, currentClaim.currency)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Created</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(currentClaim.createdAt, 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Claim Items */}
          {currentClaim.items && currentClaim.items.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Claim Items
                </h3>
                <div className="space-y-3">
                  {currentClaim.items.map((item, index) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.category}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(item.estimatedCost)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Attachments */}
          {currentClaim.attachments && currentClaim.attachments.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Attachments
                </h3>
                <div className="space-y-3">
                  {currentClaim.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Paperclip className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{attachment.fileName}</p>
                          <p className="text-sm text-gray-600">
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB • 
                            Uploaded {formatDate(attachment.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Info */}
          {currentClaim.assignment && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Assignment
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Assigned To</p>
                    <p className="text-sm text-gray-600">
                      {currentClaim.assignment.adjuster?.displayName || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Priority</p>
                    <Badge variant="warning" size="sm">
                      {currentClaim.assignment.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Due Date</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(currentClaim.assignment.dueAt)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
                <Button variant="ghost" size="sm" leftIcon={<MessageSquare size={14} />}>
                  Add Note
                </Button>
              </div>
              
              {currentClaim.notes && currentClaim.notes.length > 0 ? (
                <div className="space-y-3">
                  {currentClaim.notes.slice(0, 3).map((note) => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">
                          {note.author?.displayName || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(note.createdAt)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">{note.body}</p>
                    </div>
                  ))}
                  {currentClaim.notes.length > 3 && (
                    <Button variant="ghost" size="sm" fullWidth>
                      View all {currentClaim.notes.length} notes
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No notes yet</p>
              )}
            </div>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Activity Timeline
              </h3>
              
              {currentClaim.events && currentClaim.events.length > 0 ? (
                <div className="space-y-3">
                  {currentClaim.events.slice(0, 5).map((event, index) => (
                    <div key={event.id} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {event.eventType.replace('_', ' ').toLowerCase()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(event.createdAt)} by {event.actor?.displayName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No activity yet</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Claim Status"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowStatusModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleStatusChange}
              loading={isSubmitting}
            >
              Update Status
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="New Status"
            options={availableTransitions.map(status => ({
              value: status,
              label: getStatusLabel(status)
            }))}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as ClaimStatus)}
          />
          
          <div>
            <label className="form-label">Reason (Optional)</label>
            <textarea
              className="form-input"
              rows={3}
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Provide a reason for this status change..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClaimDetailPage;
