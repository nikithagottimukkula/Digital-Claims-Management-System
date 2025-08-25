import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Plus, 
  Trash2, 
  Upload,
  FileText
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useAppDispatch } from '@/hooks';
import { createClaim } from '@/store/slices/claimsSlice';
import { Button, Input, Select, Card, Badge } from '@/components/ui';
import { ClaimFormData } from '@/types';
import { formatFileSize } from '@/utils/helpers';
import toast from 'react-hot-toast';

const claimSchema = z.object({
  policyId: z.string().min(1, 'Policy is required'),
  incidentDate: z.string().min(1, 'Incident date is required'),
  incidentType: z.string().min(1, 'Incident type is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  items: z.array(z.object({
    category: z.string().min(1, 'Category is required'),
    description: z.string().min(1, 'Description is required'),
    estimatedCost: z.number().min(0, 'Cost must be positive'),
  })).min(1, 'At least one item is required'),
});

type ClaimFormValues = z.infer<typeof claimSchema>;

const steps = [
  { id: 1, name: 'Policy Information', description: 'Select your policy' },
  { id: 2, name: 'Incident Details', description: 'Describe what happened' },
  { id: 3, name: 'Claim Items', description: 'List damaged items' },
  { id: 4, name: 'Documents', description: 'Upload supporting documents' },
  { id: 5, name: 'Review', description: 'Review and submit' },
];

const incidentTypes = [
  { value: 'AUTO_ACCIDENT', label: 'Auto Accident' },
  { value: 'PROPERTY_DAMAGE', label: 'Property Damage' },
  { value: 'THEFT', label: 'Theft' },
  { value: 'FIRE', label: 'Fire' },
  { value: 'WATER_DAMAGE', label: 'Water Damage' },
  { value: 'VANDALISM', label: 'Vandalism' },
  { value: 'OTHER', label: 'Other' },
];

const itemCategories = [
  { value: 'VEHICLE', label: 'Vehicle' },
  { value: 'ELECTRONICS', label: 'Electronics' },
  { value: 'FURNITURE', label: 'Furniture' },
  { value: 'JEWELRY', label: 'Jewelry' },
  { value: 'CLOTHING', label: 'Clothing' },
  { value: 'OTHER', label: 'Other' },
];

const mockPolicies = [
  { value: 'POL-001', label: 'Auto Insurance - POL-001' },
  { value: 'POL-002', label: 'Home Insurance - POL-002' },
  { value: 'POL-003', label: 'Renters Insurance - POL-003' },
];

const NewClaimPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ClaimFormValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      items: [{ category: '', description: '', estimatedCost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      setAttachments(prev => [...prev, ...acceptedFiles]);
    },
  });

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (step: number): (keyof ClaimFormValues)[] => {
    switch (step) {
      case 1:
        return ['policyId'];
      case 2:
        return ['incidentDate', 'incidentType', 'description'];
      case 3:
        return ['items'];
      default:
        return [];
    }
  };

  const onSubmit = async (data: ClaimFormValues) => {
    setIsSubmitting(true);
    try {
      const claimData: ClaimFormData = {
        ...data,
        attachments,
      };

      const result = await dispatch(createClaim(claimData)).unwrap();
      toast.success('Claim submitted successfully!');
      navigate(`/claims/${result.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Your Policy
              </h3>
              <Select
                label="Insurance Policy"
                options={mockPolicies}
                placeholder="Choose a policy..."
                {...register('policyId')}
                error={errors.policyId?.message}
                fullWidth
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Incident Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Incident Date"
                type="date"
                {...register('incidentDate')}
                error={errors.incidentDate?.message}
                fullWidth
              />
              
              <Select
                label="Incident Type"
                options={incidentTypes}
                placeholder="Select incident type..."
                {...register('incidentType')}
                error={errors.incidentType?.message}
                fullWidth
              />
            </div>
            
            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Describe what happened in detail..."
                {...register('description')}
              />
              {errors.description && (
                <span className="form-error">{errors.description.message}</span>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Claim Items
              </h3>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append({ category: '', description: '', estimatedCost: 0 })}
                leftIcon={<Plus size={16} />}
              >
                Add Item
              </Button>
            </div>
            
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        leftIcon={<Trash2 size={14} />}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                      label="Category"
                      options={itemCategories}
                      placeholder="Select category..."
                      {...register(`items.${index}.category`)}
                      error={errors.items?.[index]?.category?.message}
                      fullWidth
                    />
                    
                    <Input
                      label="Description"
                      placeholder="Item description..."
                      {...register(`items.${index}.description`)}
                      error={errors.items?.[index]?.description?.message}
                      fullWidth
                    />
                    
                    <Input
                      label="Estimated Cost"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register(`items.${index}.estimatedCost`, { valueAsNumber: true })}
                      error={errors.items?.[index]?.estimatedCost?.message}
                      fullWidth
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upload Documents
            </h3>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Drop files here' : 'Upload supporting documents'}
              </p>
              <p className="text-sm text-gray-600">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Supported: Images, PDF, Word documents (max 10MB each)
              </p>
            </div>
            
            {attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Uploaded Files</h4>
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      leftIcon={<Trash2 size={14} />}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 5:
        const formData = watch();
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Review Your Claim
            </h3>
            
            <div className="space-y-6">
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Policy Information</h4>
                <p className="text-sm text-gray-600">
                  Policy: {mockPolicies.find(p => p.value === formData.policyId)?.label}
                </p>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Incident Details</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Date:</span> {formData.incidentDate}</p>
                  <p><span className="font-medium">Type:</span> {
                    incidentTypes.find(t => t.value === formData.incidentType)?.label
                  }</p>
                  <p><span className="font-medium">Description:</span> {formData.description}</p>
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Claim Items</h4>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{item.category}</p>
                        <p className="text-xs text-gray-600">{item.description}</p>
                      </div>
                      <p className="text-sm font-medium">${item.estimatedCost.toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Total Estimated Cost:</p>
                      <p className="font-bold">
                        ${formData.items.reduce((sum, item) => sum + item.estimatedCost, 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              
              {attachments.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Documents</h4>
                  <p className="text-sm text-gray-600">
                    {attachments.length} file(s) ready to upload
                  </p>
                </Card>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
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
          <h1 className="text-2xl font-bold text-gray-900">Submit New Claim</h1>
          <p className="text-gray-600">Follow the steps to submit your insurance claim</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep > step.id
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : currentStep === step.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check size={16} />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 hidden md:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-primary-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Form Content */}
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={prevStep}
              disabled={currentStep === 1}
              leftIcon={<ArrowLeft size={16} />}
            >
              Previous
            </Button>
            
            {currentStep < steps.length ? (
              <Button
                type="button"
                variant="primary"
                onClick={nextStep}
                rightIcon={<ArrowRight size={16} />}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                rightIcon={<Check size={16} />}
              >
                Submit Claim
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewClaimPage;
