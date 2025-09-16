'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, 
  Mail, 
  Lock, 
  Search, 
  Phone, 
  Save, 
  Download, 
  Plus,
  Trash2,
  Edit,
  Send
} from 'lucide-react';

export default function ComponentShowcase() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    search: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Real-time validation examples
    if (field === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      }
    }

    if (field === 'confirmPassword' && value !== formData.password) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    alert('Form submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            UI Components Showcase
          </h1>
          <p className="text-xl text-gray-600">
            Customizable Input and Button Components with 3 Variants Each
          </p>
        </div>

        {/* Input Components Section */}
        <section className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Input Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Default Variant */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-700">Default Variant</h3>
              
              <Input
                variant="default"
                label="Full Name"
                placeholder="Enter your name"
                leftIcon={<User className="h-4 w-4" />}
                value={formData.name}
                onValueChange={handleInputChange('name')}
                hint="This will be displayed on your profile"
              />

              <Input
                variant="default"
                type="email"
                label="Email Address"
                placeholder="your@email.com"
                leftIcon={<Mail className="h-4 w-4" />}
                value={formData.email}
                onValueChange={handleInputChange('email')}
                error={errors.email}
                success={Boolean(formData.email && !errors.email)}
              />

              <Input
                variant="default"
                type="password"
                label="Password"
                placeholder="Enter password"
                leftIcon={<Lock className="h-4 w-4" />}
                showPasswordToggle
                value={formData.password}
                onValueChange={handleInputChange('password')}
              />
            </div>

            {/* Outlined Variant */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-700">Outlined Variant</h3>
              
              <Input
                variant="outlined"
                label="Phone Number"
                placeholder="+1 (555) 123-4567"
                leftIcon={<Phone className="h-4 w-4" />}
                value={formData.phone}
                onValueChange={handleInputChange('phone')}
              />

              <Input
                variant="outlined"
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                leftIcon={<Lock className="h-4 w-4" />}
                showPasswordToggle
                value={formData.confirmPassword}
                onValueChange={handleInputChange('confirmPassword')}
                error={errors.confirmPassword}
              />

              <Input
                variant="outlined"
                label="Search"
                placeholder="Search anything..."
                leftIcon={<Search className="h-4 w-4" />}
                value={formData.search}
                onValueChange={handleInputChange('search')}
              />
            </div>

            {/* Filled Variant */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-700">Filled Variant</h3>
              
              <Input
                variant="filled"
                label="Company"
                placeholder="Your company name"
                success={true}
              />

              <Input
                variant="filled"
                label="Website"
                placeholder="https://yoursite.com"
                error="Invalid URL format"
              />

              <Input
                variant="filled"
                label="Disabled Field"
                placeholder="Cannot edit this"
                disabled
                value="Read-only value"
              />
            </div>
          </div>
        </section>

        {/* Button Components Section */}
        <section className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Button Components</h2>
          
          <div className="space-y-8">
            
            {/* Primary Variant */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Primary Variant</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" size="sm" leftIcon={<Plus className="h-3 w-3" />}>
                  Add New
                </Button>
                
                <Button variant="primary" size="default" rightIcon={<Save className="h-4 w-4" />}>
                  Save Changes
                </Button>
                
                <Button variant="primary" size="lg" leftIcon={<Download className="h-5 w-5" />}>
                  Download Report
                </Button>
                
                <Button variant="primary" loading={loading} onClick={handleSubmit}>
                  {loading ? 'Submitting...' : 'Submit Form'}
                </Button>
              </div>
            </div>

            {/* Secondary Variant */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Secondary Variant</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary" size="sm" leftIcon={<Edit className="h-3 w-3" />}>
                  Edit
                </Button>
                
                <Button variant="secondary" size="default">
                  Cancel
                </Button>
                
                <Button variant="secondary" size="lg" rightIcon={<Send className="h-5 w-5" />}>
                  Send Message
                </Button>
                
                <Button variant="secondary" disabled>
                  Disabled
                </Button>
              </div>
            </div>

            {/* Ghost Variant */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Ghost Variant</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
                
                <Button variant="ghost" size="default" rightIcon={<User className="h-4 w-4" />}>
                  Profile
                </Button>
                
                <Button variant="ghost" size="lg">
                  Learn More
                </Button>
                
                <Button variant="ghost" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Special Variants */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Special Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="destructive" leftIcon={<Trash2 className="h-4 w-4" />}>
                  Delete
                </Button>
                
                <Button variant="success" rightIcon={<Save className="h-4 w-4" />}>
                  Approve
                </Button>
                
                <Button variant="warning">
                  Warning
                </Button>
              </div>
            </div>

            {/* Full Width Examples */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Full Width Buttons</h3>
              <div className="space-y-3 max-w-md">
                <Button variant="primary" fullWidth>
                  Sign In
                </Button>
                
                <Button variant="secondary" fullWidth>
                  Create Account
                </Button>
                
                <Button variant="ghost" fullWidth>
                  Forgot Password?
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Form Example */}
        <section className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Interactive Form Example</h2>
          
          <div className="max-w-md mx-auto space-y-6">
            <Input
              variant="default"
              type="email"
              label="Email"
              placeholder="Enter your email"
              leftIcon={<Mail className="h-4 w-4" />}
              value={formData.email}
              onValueChange={handleInputChange('email')}
              error={errors.email}
              success={Boolean(formData.email && !errors.email)}
            />
            
            <Input
              variant="default"
              type="password"
              label="Password"
              placeholder="Enter your password"
              leftIcon={<Lock className="h-4 w-4" />}
              showPasswordToggle
              value={formData.password}
              onValueChange={handleInputChange('password')}
            />
            
            <Input
              variant="default"
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              leftIcon={<Lock className="h-4 w-4" />}
              showPasswordToggle
              value={formData.confirmPassword}
              onValueChange={handleInputChange('confirmPassword')}
              error={errors.confirmPassword}
            />
            
            <Button 
              variant="primary" 
              fullWidth 
              size="lg"
              loading={loading}
              onClick={handleSubmit}
              disabled={!formData.email || !formData.password || !!errors.email || !!errors.confirmPassword}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}
