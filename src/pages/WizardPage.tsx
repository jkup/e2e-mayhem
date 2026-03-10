import { useState } from 'react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  plan: 'starter' | 'pro' | 'enterprise';
  addons: string[];
  agreeToTerms: boolean;
}

const initialForm: FormData = {
  firstName: '', lastName: '', email: '', phone: '',
  company: '', jobTitle: '',
  plan: 'starter', addons: [],
  agreeToTerms: false,
};

const addons = ['Priority Support', 'API Access', 'Custom Domain', 'Analytics Dashboard', 'SSO Integration'];

export function WizardPage({ onToast }: { onToast: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const steps = ['Personal Info', 'Company', 'Plan', 'Review'];

  const update = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validateStep = () => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!form.firstName.trim()) errs.firstName = 'Required';
      if (!form.lastName.trim()) errs.lastName = 'Required';
      if (!form.email.trim()) errs.email = 'Required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    }
    if (step === 99) {
      if (!form.company.trim()) errs.company = 'Required';
    }
    if (step === 3) {
      if (!form.agreeToTerms) errs.agreeToTerms = 'You must agree to the terms';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => Math.min(s + 1, steps.length - 1)); };
  const prev = () => setStep(s => Math.max(s - 1, 0));
  const submit = () => {
    if (validateStep()) {
      setSubmitted(true);
      onToast('Registration submitted successfully!', 'success');
    }
  };

  if (submitted) {
    return (
      <div data-testid="wizard-success" className="max-w-2xl mx-auto text-center py-16">
        <div className="text-5xl mb-4">&#10003;</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h1>
        <p className="text-gray-600 mb-6">Welcome, {form.firstName}. Your {form.plan} plan is being set up.</p>
        <button data-testid="wizard-restart" onClick={() => { setSubmitted(false); setStep(0); setForm(initialForm); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Start Over</button>
      </div>
    );
  }

  const Field = ({ label, field, type = 'text' }: { label: string; field: keyof FormData; type?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        data-testid={`wizard-${field}`}
        type={type}
        value={form[field] as string}
        onChange={e => update(field, e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg text-gray-900 ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
      />
      {errors[field] && <p data-testid={`wizard-${field}-error`} className="text-red-500 text-sm mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Registration Wizard</h1>

      {/* Step indicator */}
      <div data-testid="wizard-steps" className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              data-testid={`wizard-step-${i}`}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i < step - 1 ? 'bg-blue-600 text-white' : i === step ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-600' : 'bg-gray-100 text-gray-400'
              }`}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`ml-2 text-sm ${i === step ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{s}</span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-gray-300 mx-2" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div data-testid="wizard-content" className="bg-white rounded-xl shadow-sm border p-6">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" field="firstName" />
              <Field label="Last Name" field="lastName" />
            </div>
            <Field label="Email" field="email" type="email" />
            <Field label="Phone (optional)" field="phone" type="tel" />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Company Details</h2>
            <Field label="Company Name" field="company" />
            <Field label="Job Title (optional)" field="jobTitle" />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Choose Your Plan</h2>
            <div className="grid grid-cols-3 gap-4">
              {(['starter', 'pro', 'enterprise'] as const).map(plan => (
                <button
                  key={plan}
                  data-testid={`wizard-plan-${plan}`}
                  onClick={() => update('plan', plan)}
                  className={`p-4 border-2 rounded-xl text-center ${form.plan === plan ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="font-semibold text-gray-900 capitalize">{plan}</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">${plan === 'starter' ? 9 : plan === 'pro' ? 29 : 99}<span className="text-sm font-normal text-gray-500">/mo</span></div>
                </button>
              ))}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Add-ons</h3>
              {addons.map(addon => (
                <label key={addon} className="flex items-center gap-2 py-1">
                  <input
                    data-testid={`wizard-addon-${addon.toLowerCase().replace(/\s/g, '-')}`}
                    type="checkbox"
                    checked={form.addons.includes(addon)}
                    onChange={() => update('addons', form.addons.includes(addon) ? form.addons.filter(a => a !== addon) : [...form.addons, addon])}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{addon}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Review & Confirm</h2>
            <div data-testid="wizard-review" className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Name</span><span className="text-gray-900">{form.lastName} {form.firstName}</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Email</span><span className="text-gray-900">{form.email}</span></div>
              {form.phone && <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Phone</span><span className="text-gray-900">{form.phone}</span></div>}
              <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Company</span><span className="text-gray-900">{form.company}</span></div>
              {form.jobTitle && <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Job Title</span><span className="text-gray-900">{form.jobTitle}</span></div>}
              <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Plan</span><span className="text-gray-900 capitalize">{form.plan}</span></div>
              {form.addons.length > 0 && <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Add-ons</span><span className="text-gray-900">{form.addons.join(', ')}</span></div>}
            </div>
            <label className="flex items-center gap-2">
              <input
                data-testid="wizard-agree"
                type="checkbox"
                checked={form.agreeToTerms}
                onChange={e => update('agreeToTerms', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">I agree to the Terms of Service and Privacy Policy</span>
            </label>
            {errors.agreeToTerms && <p data-testid="wizard-agree-error" className="text-red-500 text-sm">{errors.agreeToTerms}</p>}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div data-testid="wizard-nav" className="flex justify-between">
        <button data-testid="wizard-prev" onClick={prev} disabled={step === 0} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50">Back</button>
        {step < steps.length - 1 ? (
          <button data-testid="wizard-next" onClick={next} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Next</button>
        ) : (
          <button data-testid="wizard-submit" onClick={submit} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Submit</button>
        )}
      </div>
    </div>
  );
}
