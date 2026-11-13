import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  CheckCircle2,
  Inbox,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  PhoneCall,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import {
  ADMIN_EMAIL,
  auth,
  deleteAppointment,
  formatFriendlyFirestoreError,
  signInAdminWithGoogle,
  signOutAdmin,
  subscribeAppointments,
  updateAppointmentStatus,
  type AppointmentStatus,
  type StoredAppointment,
} from '../lib/firebase';

interface AdminInquiriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  new: 'New Lead',
  contacted: 'Contacted',
  scheduled: 'Site Visit Scheduled',
  closed: 'Closed',
};

const STATUS_BADGE_CLASSES: Record<AppointmentStatus, string> = {
  new: 'bg-[#FFF1EC] text-[#D43F17] border-[#F05228]/30',
  contacted: 'bg-sky-50 text-sky-700 border-sky-200',
  scheduled: 'bg-amber-50 text-amber-800 border-amber-200',
  closed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export function AdminInquiriesModal({ isOpen, onClose }: AdminInquiriesModalProps) {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<StoredAppointment[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | AppointmentStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const isAuthorizedAdmin =
    Boolean(user?.emailVerified) && user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    if (!isOpen || !authReady || !isAuthorizedAdmin) {
      setAppointments([]);
      return;
    }

    setLoadingLeads(true);
    setLeadsError(null);
    const unsubscribe = subscribeAppointments(
      (items) => {
        setAppointments(items);
        setLoadingLeads(false);
      },
      (errMessage) => {
        setLeadsError(errMessage);
        setLoadingLeads(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, authReady, isAuthorizedAdmin]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const filteredAppointments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return appointments.filter((item) => {
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      if (!matchesStatus) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.referenceCode.toLowerCase().includes(q) ||
        item.serviceType.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
      );
    });
  }, [appointments, filterStatus, searchTerm]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signInAdminWithGoogle();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google sign-in was cancelled or failed.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    setAuthBusy(true);
    try {
      await signOutAdmin();
      setAppointments([]);
      setLeadsError(null);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleStatusChange = async (id: string, nextStatus: AppointmentStatus) => {
    setUpdatingId(id);
    setLeadsError(null);
    try {
      await updateAppointmentStatus(id, nextStatus);
    } catch (err) {
      setLeadsError(formatFriendlyFirestoreError(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setUpdatingId(id);
    setLeadsError(null);
    try {
      await deleteAppointment(id);
      setConfirmDeleteId(null);
    } catch (err) {
      setLeadsError(formatFriendlyFirestoreError(err));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-leads-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#19171C]/75 backdrop-blur-xs p-3 sm:p-6"
    >
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl border border-[#E6E4EB] shadow-2xl overflow-hidden text-[#26232A]">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 bg-[#19171C] text-white border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#D43F17] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="admin-leads-title" className="font-display font-bold text-base sm:text-lg truncate">
                Stored Appointment Inquiries
              </h2>
              <p className="text-xs text-white/65 truncate">
                Protected Cloud Firestore lead desk · Briicks Properties
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {user && (
              <button
                type="button"
                onClick={handleSignOut}
                disabled={authBusy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close inquiries panel"
              className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-white/75 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#F7F7F9]">
          {!authReady ? (
            <div className="py-12 flex flex-col items-center justify-center text-sm text-[#26232A]/70 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#D43F17]" aria-hidden="true" />
              <span>Checking authentication session...</span>
            </div>
          ) : !user ? (
            <div className="max-w-md mx-auto my-6 bg-white rounded-xl border border-[#E6E4EB] p-6 sm:p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFF1EC] text-[#D43F17] flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="font-display font-bold text-lg text-[#26232A]">
                Admin Sign-In Required
              </h3>
              <p className="text-sm text-[#26232A]/75 leading-relaxed">
                Client phone numbers and project inquiries are protected. Sign in with the authorized
                Briicks Properties Google account (<strong className="text-[#26232A]">{ADMIN_EMAIL}</strong>)
                to view and manage submitted appointments.
              </p>
              {authError && (
                <p className="text-xs font-medium text-[#B83210] bg-[#FFF1EC] p-3 rounded-lg" role="alert">
                  {authError}
                </p>
              )}
              <button
                type="button"
                onClick={handleSignIn}
                disabled={authBusy}
                className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#D43F17] hover:bg-[#B83210] text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60"
              >
                {authBusy ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <LogIn className="w-4 h-4" aria-hidden="true" />
                )}
                <span>Sign in with Google</span>
              </button>
            </div>
          ) : !isAuthorizedAdmin ? (
            <div className="max-w-md mx-auto my-6 bg-white rounded-xl border border-[#E6E4EB] p-6 text-center space-y-4">
              <h3 className="font-display font-bold text-lg text-[#26232A]">
                Restricted Account
              </h3>
              <p className="text-sm text-[#26232A]/75 leading-relaxed">
                Signed in as <strong>{user.email}</strong>. Stored client leads can only be read by
                verified admin <strong>{ADMIN_EMAIL}</strong>.
              </p>
              <button
                type="button"
                onClick={handleSignIn}
                disabled={authBusy}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#26232A] hover:bg-[#D43F17] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Switch to Admin Google Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Filter & Search Toolbar */}
              <div className="bg-white rounded-xl border border-[#E6E4EB] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['all', 'new', 'contacted', 'scheduled', 'closed'] as const).map((statusKey) => (
                    <button
                      key={statusKey}
                      type="button"
                      onClick={() => setFilterStatus(statusKey)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        filterStatus === statusKey
                          ? 'bg-[#26232A] text-white'
                          : 'bg-[#F7F7F9] text-[#26232A]/75 hover:bg-[#E6E4EB]/60'
                      }`}
                    >
                      {statusKey === 'all'
                        ? `All (${appointments.length})`
                        : STATUS_LABELS[statusKey]}
                    </button>
                  ))}
                </div>

                <div className="relative sm:w-64">
                  <Search
                    className="w-4 h-4 text-[#26232A]/45 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <label htmlFor="admin-lead-search" className="sr-only">
                    Search inquiries
                  </label>
                  <input
                    id="admin-lead-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, phone, BP-..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-[#F7F7F9] border border-[#E6E4EB] rounded-lg focus:outline-none focus:border-[#D43F17]"
                  />
                </div>
              </div>

              {leadsError && (
                <div className="p-4 rounded-xl bg-[#FFF1EC] border border-[#F05228]/35 text-xs font-medium text-[#B83210]" role="alert">
                  {leadsError}
                </div>
              )}

              {loadingLeads ? (
                <div className="py-12 flex flex-col items-center justify-center text-sm text-[#26232A]/70 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-[#D43F17]" aria-hidden="true" />
                  <span>Loading stored consultation leads...</span>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E6E4EB] p-10 text-center space-y-2">
                  <Inbox className="w-8 h-8 text-[#26232A]/35 mx-auto" aria-hidden="true" />
                  <p className="font-display font-semibold text-base text-[#26232A]">
                    No inquiries found
                  </p>
                  <p className="text-xs text-[#26232A]/65">
                    {appointments.length === 0
                      ? 'Submitted Book An Appointment requests will appear here automatically.'
                      : 'Try clearing the status filter or search query.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAppointments.map((lead) => (
                    <article
                      key={lead.id}
                      className="bg-white rounded-xl border border-[#E6E4EB] p-4 sm:p-5 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E6E4EB]">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-[#D43F17] bg-[#FFF1EC] px-2.5 py-1 rounded-md">
                            {lead.referenceCode}
                          </span>
                          <h3 className="font-display font-bold text-base text-[#26232A]">
                            {lead.name}
                          </h3>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${STATUS_BADGE_CLASSES[lead.status]}`}
                          >
                            {STATUS_LABELS[lead.status]}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <label htmlFor={`status-${lead.id}`} className="sr-only">
                            Update status for {lead.name}
                          </label>
                          <select
                            id={`status-${lead.id}`}
                            value={lead.status}
                            disabled={updatingId === lead.id}
                            onChange={(e) =>
                              handleStatusChange(lead.id, e.target.value as AppointmentStatus)
                            }
                            className="text-xs font-semibold bg-[#F7F7F9] border border-[#E6E4EB] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#D43F17]"
                          >
                            <option value="new">New Lead</option>
                            <option value="contacted">Contacted</option>
                            <option value="scheduled">Site Visit Scheduled</option>
                            <option value="closed">Closed</option>
                          </select>

                          {confirmDeleteId === lead.id ? (
                            <button
                              type="button"
                              onClick={() => handleDelete(lead.id)}
                              disabled={updatingId === lead.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#B83210] text-white hover:bg-[#96260A] cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              Confirm
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(lead.id)}
                              aria-label={`Delete inquiry ${lead.referenceCode}`}
                              className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-[#26232A]/50 hover:text-[#B83210] hover:bg-[#FFF1EC] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-[#26232A]/80">
                        <a
                          href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                          className="inline-flex items-center gap-1.5 hover:text-[#D43F17] font-medium tabular-nums"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-[#D43F17]" aria-hidden="true" />
                          <span>{lead.phone}</span>
                        </a>
                        <a
                          href={`mailto:${lead.email}`}
                          className="inline-flex items-center gap-1.5 hover:text-[#D43F17] truncate"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#D43F17] shrink-0" aria-hidden="true" />
                          <span className="truncate">{lead.email}</span>
                        </a>
                        <div className="sm:text-right text-[#26232A]/60">
                          {lead.createdAt
                            ? new Intl.DateTimeFormat('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              }).format(lead.createdAt)
                            : 'Just now'}
                        </div>
                      </div>

                      <div className="text-xs bg-[#F7F7F9] border border-[#E6E4EB] rounded-lg p-3 space-y-1">
                        <div>
                          <span className="font-semibold text-[#26232A]">Service:</span>{' '}
                          <span className="text-[#26232A]/85">{lead.serviceType}</span>
                        </div>
                        {lead.message && (
                          <p className="text-[#26232A]/80 leading-relaxed whitespace-pre-wrap">
                            <span className="font-semibold text-[#26232A]">Plot Notes:</span>{' '}
                            {lead.message}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
