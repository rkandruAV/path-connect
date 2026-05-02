'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUpdateProfile } from '@/hooks/useUser';

const EXPERTISE_OPTIONS = [
  'Software Engineering',
  'Product Management',
  'Data Science',
  'UX Design',
  'Machine Learning',
  'DevOps',
  'Frontend Development',
  'Backend Development',
  'Mobile Development',
  'Cloud Architecture',
  'Cybersecurity',
  'Engineering Management',
  'Startup / Entrepreneurship',
  'Career Transition',
];

const INDUSTRY_OPTIONS = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'E-Commerce',
  'Consulting',
  'Media / Entertainment',
  'Government',
  'Nonprofit',
  'Other',
];

const AVAILABILITY_OPTIONS = [
  'Weekday mornings',
  'Weekday afternoons',
  'Weekday evenings',
  'Weekend mornings',
  'Weekend afternoons',
];

export function MentorOnboardingForm() {
  const router = useRouter();
  const updateProfile = useUpdateProfile();

  const [expertise, setExpertise] = useState<string[]>([]);
  const [industry, setIndustry] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [availability, setAvailability] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');

  const toggleExpertise = (item: string) => {
    setExpertise((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const toggleAvailability = (item: string) => {
    setAvailability((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (expertise.length === 0) {
      setError('Please select at least one area of expertise.');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        mentorProfile: {
          expertise,
          industry: industry || undefined,
          yearsExperience: yearsExperience ? parseInt(yearsExperience, 10) : undefined,
          availability: availability.length > 0 ? availability : undefined,
          bio: bio.trim() || undefined,
          isActive: true,
        },
      });
      router.push('/dashboard');
    } catch {
      setError('Failed to save profile. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Expertise */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1">
          Areas of Expertise <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Select the areas where you can mentor others
        </p>
        <div className="flex flex-wrap gap-2">
          {EXPERTISE_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleExpertise(item)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                expertise.includes(item)
                  ? 'bg-primary-800 text-white border-primary-800'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Industry */}
      <div>
        <label htmlFor="industry" className="block text-sm font-semibold text-gray-900 mb-1">
          Industry
        </label>
        <select
          id="industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="input"
        >
          <option value="">Select your industry</option>
          {INDUSTRY_OPTIONS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      {/* Years of Experience */}
      <div>
        <label htmlFor="yearsExperience" className="block text-sm font-semibold text-gray-900 mb-1">
          Years of Experience
        </label>
        <input
          id="yearsExperience"
          type="number"
          min="0"
          max="50"
          value={yearsExperience}
          onChange={(e) => setYearsExperience(e.target.value)}
          placeholder="e.g. 8"
          className="input max-w-[120px]"
        />
      </div>

      {/* Availability */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1">
          Availability
        </label>
        <p className="text-sm text-gray-500 mb-3">
          When are you generally available for mentoring sessions?
        </p>
        <div className="flex flex-wrap gap-2">
          {AVAILABILITY_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleAvailability(item)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                availability.includes(item)
                  ? 'bg-accent-400 text-primary-900 border-accent-400'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-accent-400'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-semibold text-gray-900 mb-1">
          About You
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Tell mentees about your background and mentoring style
        </p>
        <textarea
          id="bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="I've spent 10 years in backend engineering at startups and big tech. I enjoy helping people navigate career transitions and level up their system design skills..."
          className="input resize-none"
          maxLength={2000}
        />
        <p className="text-xs text-gray-400 mt-1">{bio.length}/2000</p>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={updateProfile.isPending}
        className="btn-primary w-full"
      >
        {updateProfile.isPending ? 'Saving...' : 'Complete Profile'}
      </button>
    </form>
  );
}
