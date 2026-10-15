'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCreateInvitation, useInvitations } from '@/hooks/useInvitations';
import { useCurrentUser } from '@/hooks/useUser';

export default function InviteMentorPage() {
  const { data: user } = useCurrentUser();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [result, setResult] = useState<{ inviteLink: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const createInvitation = useCreateInvitation();
  const { data: invitations } = useInvitations();

  const inviterName = user?.displayName || user?.email || 'Someone';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      const res = await createInvitation.mutateAsync({
        email: email.trim(),
        name: name.trim() || undefined,
        role: 'MENTOR',
      });
      setResult({ inviteLink: res.data.inviteLink });
    } catch {
      // Error handled by mutation state
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkedIn = () => {
    if (!result) return;
    const message = `Hi${name ? ` ${name}` : ''}, I'd love for you to be my mentor on PathConnect! Here's your invite: ${result.inviteLink}`;
    window.open(
      `https://www.linkedin.com/messaging/compose/?body=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  const handleReset = () => {
    setEmail('');
    setName('');
    setResult(null);
    setCopied(false);
    createInvitation.reset();
  };

  const sentInvitations = invitations?.data?.filter((inv) => inv.status === 'PENDING') || [];

  return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </Link>

      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Invite a Mentor</h1>
        <p className="text-gray-500 mt-1">Know someone who&apos;d be a great mentor? Invite them to PathConnect.</p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-primary-50 rounded-2xl p-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mentor&apos;s Name <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="input"
              placeholder="e.g., Jane Smith"
            />
          </div>

          <div className="bg-primary-50 rounded-2xl p-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mentor&apos;s Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="mentor@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={!email.trim() || createInvitation.isPending}
            className={`w-full py-3 rounded-xl font-medium transition-colors ${
              email.trim()
                ? 'btn-primary'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {createInvitation.isPending ? 'Sending invite...' : 'Send Invitation'}
          </button>

          {createInvitation.isError && (
            <p className="text-center text-sm text-red-600">
              {createInvitation.error instanceof Error
                ? createInvitation.error.message
                : 'Failed to send invitation'}
            </p>
          )}
        </form>
      ) : (
        <div className="space-y-4">
          <div className="card bg-primary-50 border border-primary-200">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold text-primary-800">Invitation sent!</span>
            </div>
            <p className="text-sm text-primary-700">
              {name ? `${name} (${email})` : email} will receive an email invitation from {inviterName}.
            </p>
          </div>

          <div className="card">
            <p className="text-sm font-medium text-gray-700 mb-2">Share the invite link directly:</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={result.inviteLink}
                className="input flex-1 text-xs bg-gray-50"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleCopy}
                className="btn-secondary px-3 py-2 text-sm whitespace-nowrap"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <button
            onClick={handleLinkedIn}
            className="w-full py-3 rounded-xl font-medium bg-[#0A66C2] text-white hover:bg-[#004182] transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Share via LinkedIn
          </button>

          <button
            onClick={handleReset}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Invite another mentor
          </button>
        </div>
      )}

      {sentInvitations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Pending Invitations</h2>
          <div className="space-y-2">
            {sentInvitations.map((inv) => (
              <div key={inv.id} className="card flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {inv.inviteeName || inv.inviteeEmail}
                  </p>
                  {inv.inviteeName && (
                    <p className="text-xs text-gray-500">{inv.inviteeEmail}</p>
                  )}
                </div>
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
