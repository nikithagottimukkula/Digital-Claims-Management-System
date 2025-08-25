import React, { useState } from 'react';
import { Save, Shield, Bell, Database, Mail, Clock } from 'lucide-react';
import { Button, Input, Select, Card, Badge } from '@/components/ui';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'general', name: 'General', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'sla', name: 'SLA Rules', icon: Clock },
    { id: 'email', name: 'Email Templates', icon: Mail },
    { id: 'data', name: 'Data Management', icon: Database },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'sla':
        return <SLASettings />;
      case 'email':
        return <EmailSettings />;
      case 'data':
        return <DataSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          loading={saving}
          leftIcon={<Save size={16} />}
        >
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={16} className="mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            {renderTabContent()}
          </Card>
        </div>
      </div>
    </div>
  );
};

const GeneralSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Company Name"
          defaultValue="Acme Insurance Company"
          fullWidth
        />
        <Input
          label="Support Email"
          type="email"
          defaultValue="support@acmeinsurance.com"
          fullWidth
        />
        <Input
          label="Support Phone"
          defaultValue="+1 (555) 123-4567"
          fullWidth
        />
        <Select
          label="Default Currency"
          options={[
            { value: 'USD', label: 'US Dollar (USD)' },
            { value: 'EUR', label: 'Euro (EUR)' },
            { value: 'GBP', label: 'British Pound (GBP)' },
          ]}
          defaultValue="USD"
          fullWidth
        />
        <Select
          label="Time Zone"
          options={[
            { value: 'UTC', label: 'UTC' },
            { value: 'EST', label: 'Eastern Time' },
            { value: 'PST', label: 'Pacific Time' },
          ]}
          defaultValue="UTC"
          fullWidth
        />
        <Select
          label="Date Format"
          options={[
            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
          ]}
          defaultValue="MM/DD/YYYY"
          fullWidth
        />
      </div>

      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">File Upload Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Max File Size (MB)"
            type="number"
            defaultValue="10"
            fullWidth
          />
          <Input
            label="Allowed File Types"
            defaultValue="pdf,jpg,jpeg,png,doc,docx"
            helperText="Comma-separated list of file extensions"
            fullWidth
          />
        </div>
      </div>
    </div>
  );
};

const NotificationSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Email Notifications</h4>
            <p className="text-sm text-gray-600">Send email notifications for important events</p>
          </div>
          <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600" />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">SMS Notifications</h4>
            <p className="text-sm text-gray-600">Send SMS for urgent notifications</p>
          </div>
          <input type="checkbox" className="h-4 w-4 text-primary-600" />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">SLA Breach Alerts</h4>
            <p className="text-sm text-gray-600">Alert supervisors when SLA is breached</p>
          </div>
          <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600" />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Daily Summary Reports</h4>
            <p className="text-sm text-gray-600">Send daily summary to managers</p>
          </div>
          <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600" />
        </div>
      </div>
    </div>
  );
};

const SLASettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SLA Rules</h3>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Response Time SLAs</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Initial Response (hours)"
              type="number"
              defaultValue="24"
              fullWidth
            />
            <Input
              label="First Update (hours)"
              type="number"
              defaultValue="48"
              fullWidth
            />
            <Input
              label="Resolution Time (days)"
              type="number"
              defaultValue="7"
              fullWidth
            />
            <Input
              label="Escalation Threshold (days)"
              type="number"
              defaultValue="5"
              fullWidth
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Approval Thresholds</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Adjuster Approval Limit ($)"
              type="number"
              defaultValue="5000"
              fullWidth
            />
            <Input
              label="Supervisor Approval Limit ($)"
              type="number"
              defaultValue="25000"
              fullWidth
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Priority Rules</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">Auto-escalate claims over $10,000</span>
              <Badge variant="warning" size="sm">HIGH</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">Auto-escalate overdue claims</span>
              <Badge variant="danger" size="sm">URGENT</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmailSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Templates</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="form-label">Claim Submitted Template</label>
          <textarea
            className="form-input"
            rows={4}
            defaultValue="Dear {{claimant_name}},

Your claim {{claim_id}} has been successfully submitted and is now under review.

We will contact you within 24 hours with an update.

Best regards,
Claims Team"
          />
        </div>

        <div>
          <label className="form-label">Claim Approved Template</label>
          <textarea
            className="form-input"
            rows={4}
            defaultValue="Dear {{claimant_name}},

Great news! Your claim {{claim_id}} has been approved for {{approved_amount}}.

Payment will be processed within 3-5 business days.

Best regards,
Claims Team"
          />
        </div>

        <div>
          <label className="form-label">Information Request Template</label>
          <textarea
            className="form-input"
            rows={4}
            defaultValue="Dear {{claimant_name}},

We need additional information to process your claim {{claim_id}}.

Please provide: {{requested_info}}

Best regards,
Claims Team"
          />
        </div>
      </div>
    </div>
  );
};

const DataSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Data Retention</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Claims Data Retention (years)"
              type="number"
              defaultValue="7"
              fullWidth
            />
            <Input
              label="Audit Log Retention (years)"
              type="number"
              defaultValue="10"
              fullWidth
            />
            <Input
              label="Document Retention (years)"
              type="number"
              defaultValue="7"
              fullWidth
            />
            <Input
              label="User Activity Logs (months)"
              type="number"
              defaultValue="12"
              fullWidth
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Backup Settings</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">Daily Database Backup</span>
              <Badge variant="success" size="sm">ENABLED</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">Weekly Full Backup</span>
              <Badge variant="success" size="sm">ENABLED</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm">Document Archive Backup</span>
              <Badge variant="warning" size="sm">PENDING</Badge>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Data Export</h4>
          <div className="flex space-x-3">
            <Button variant="secondary" size="sm">
              Export Claims Data
            </Button>
            <Button variant="secondary" size="sm">
              Export User Data
            </Button>
            <Button variant="secondary" size="sm">
              Export Audit Logs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
