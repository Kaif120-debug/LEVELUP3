import React, { useState } from 'react';
import { SideNavBar } from '../components/SideNavBar';
import { useApp } from '../context/AppContext';
import { useSubscription } from '../hooks/useSubscription';
import { ProBadge } from '../components/ProBadge';
import { DbClient, DbInvoice, DbProposal } from '../types';

export const BusinessPage: React.FC = () => {
  const {
    clients,
    createClient,
    updateClient,
    deleteClient,
    invoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    proposals,
    createProposal,
    updateProposal,
    deleteProposal,
  } = useApp();

  const { isPro, isFree, enforceLimit, openUpgradeModal } = useSubscription();

  const [activeTab, setActiveTab] = useState<'clients' | 'invoices' | 'proposals'>('clients');

  // Client Search & Filter
  const [clientSearch, setClientSearch] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState<'all' | 'Active' | 'Lead' | 'Completed' | 'Archived'>('all');

  // Invoice Filter
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<'all' | 'Paid' | 'Sent' | 'Draft' | 'Overdue'>('all');

  // Proposal Filter
  const [proposalStatusFilter, setProposalStatusFilter] = useState<'all' | 'Accepted' | 'Sent' | 'Draft' | 'Declined'>('all');

  // Modal States
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<DbClient | null>(null);
  const [clientForm, setClientForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    status: 'Active',
    notes: '',
  });

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState<{
    invoice_number: string;
    client_id: string;
    client_name: string;
    status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
    issue_date: string;
    due_date: string;
    tax_rate: number;
    notes: string;
    items: Array<{ description: string; quantity: number; unit_price: number; amount: number }>;
  }>({
    invoice_number: `INV-${new Date().getFullYear()}-${String((invoices?.length || 0) + 1).padStart(3, '0')}`,
    client_id: '',
    client_name: '',
    status: 'Sent',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    tax_rate: 10,
    notes: '',
    items: [{ description: 'Engineering & Consulting Deliverables', quantity: 1, unit_price: 2500, amount: 2500 }],
  });

  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalForm, setProposalForm] = useState<{
    title: string;
    client_id: string;
    client_name: string;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Declined';
    value: number;
    scope: string;
    valid_until: string;
  }>({
    title: '',
    client_id: '',
    client_name: '',
    status: 'Sent',
    value: 5000,
    scope: '',
    valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  const [previewInvoice, setPreviewInvoice] = useState<DbInvoice | null>(null);

  // Financial Metrics Calculations
  const totalInvoiced = invoices.reduce((acc, inv) => acc + Number(inv.total_amount || 0), 0);
  const totalCollected = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((acc, inv) => acc + Number(inv.total_amount || 0), 0);
  const totalOutstanding = invoices
    .filter((inv) => inv.status !== 'Paid')
    .reduce((acc, inv) => acc + Number(inv.total_amount || 0), 0);
  const activeClientsCount = clients.filter((c) => c.status === 'Active').length;

  // Filtered Clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      (client.company || '').toLowerCase().includes(clientSearch.toLowerCase()) ||
      (client.email || '').toLowerCase().includes(clientSearch.toLowerCase());
    const matchesStatus = clientStatusFilter === 'all' || client.status === clientStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Invoices
  const filteredInvoices = invoices.filter((inv) => {
    return invoiceStatusFilter === 'all' || inv.status === invoiceStatusFilter;
  });

  // Filtered Proposals
  const filteredProposals = proposals.filter((prop) => {
    return proposalStatusFilter === 'all' || prop.status === proposalStatusFilter;
  });

  // Client Handlers
  const handleOpenClientModal = (client?: DbClient) => {
    if (client) {
      setEditingClient(client);
      setClientForm({
        name: client.name || '',
        company: client.company || '',
        email: client.email || '',
        phone: client.phone || '',
        website: client.website || '',
        status: client.status || 'Active',
        notes: client.notes || '',
      });
      setShowClientModal(true);
    } else {
      enforceLimit('clients', clients.length, 'Clients', () => {
        setEditingClient(null);
        setClientForm({
          name: '',
          company: '',
          email: '',
          phone: '',
          website: '',
          status: 'Active',
          notes: '',
        });
        setShowClientModal(true);
      });
    }
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim()) return;

    if (editingClient) {
      await updateClient(editingClient.id, clientForm);
    } else {
      await createClient(clientForm);
    }
    setShowClientModal(false);
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client record?')) {
      await deleteClient(id);
    }
  };

  // Invoice Handlers
  const handleOpenInvoiceModal = (presetClientName?: string) => {
    enforceLimit('invoices', invoices.length, 'Invoices', () => {
      const num = `INV-${new Date().getFullYear()}-${String((invoices?.length || 0) + 1).padStart(3, '0')}`;
      setInvoiceForm({
        invoice_number: num,
        client_id: '',
        client_name: presetClientName || (clients[0]?.name || ''),
        status: 'Sent',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        tax_rate: 10,
        notes: '',
        items: [{ description: 'Strategy & Execution Deliverables', quantity: 1, unit_price: 2500, amount: 2500 }],
      });
      setShowInvoiceModal(true);
    });
  };

  const handleAddInvoiceItem = () => {
    setInvoiceForm((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit_price: 0, amount: 0 }],
    }));
  };

  const handleUpdateInvoiceItem = (index: number, field: string, val: any) => {
    setInvoiceForm((prev) => {
      const items = [...prev.items];
      const item = { ...items[index], [field]: val };
      if (field === 'quantity' || field === 'unit_price') {
        const q = field === 'quantity' ? Number(val) : Number(item.quantity);
        const p = field === 'unit_price' ? Number(val) : Number(item.unit_price);
        item.amount = Math.round(q * p * 100) / 100;
      }
      items[index] = item;
      return { ...prev, items };
    });
  };

  const handleRemoveInvoiceItem = (index: number) => {
    if (invoiceForm.items.length <= 1) return;
    setInvoiceForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateInvoiceTotals = () => {
    const subtotal = invoiceForm.items.reduce((acc, item) => acc + Number(item.amount || 0), 0);
    const tax_amount = Math.round(((subtotal * Number(invoiceForm.tax_rate || 0)) / 100) * 100) / 100;
    const total_amount = Math.round((subtotal + tax_amount) * 100) / 100;
    return { subtotal, tax_amount, total_amount };
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.client_name.trim() || invoiceForm.items.length === 0) return;

    const { subtotal, tax_amount, total_amount } = calculateInvoiceTotals();

    await createInvoice(
      {
        invoice_number: invoiceForm.invoice_number,
        client_name: invoiceForm.client_name,
        client_id: invoiceForm.client_id || undefined,
        status: invoiceForm.status,
        issue_date: invoiceForm.issue_date,
        due_date: invoiceForm.due_date,
        subtotal,
        tax_rate: Number(invoiceForm.tax_rate || 0),
        tax_amount,
        total_amount,
        notes: invoiceForm.notes,
      },
      invoiceForm.items
    );

    setShowInvoiceModal(false);
  };

  const handleToggleInvoicePaid = async (inv: DbInvoice) => {
    const newStatus = inv.status === 'Paid' ? 'Sent' : 'Paid';
    await updateInvoice(inv.id, { status: newStatus });
  };

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm('Delete this invoice record?')) {
      await deleteInvoice(id);
    }
  };

  // Proposal Handlers
  const handleOpenProposalModal = (presetClientName?: string) => {
    enforceLimit('proposals', proposals.length, 'Proposals', () => {
      setProposalForm({
        title: '',
        client_id: '',
        client_name: presetClientName || (clients[0]?.name || ''),
        status: 'Sent',
        value: 5000,
        scope: '',
        valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      });
      setShowProposalModal(true);
    });
  };

  const handleSaveProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalForm.title.trim() || !proposalForm.client_name.trim()) return;

    await createProposal({
      title: proposalForm.title,
      client_name: proposalForm.client_name,
      client_id: proposalForm.client_id || undefined,
      status: proposalForm.status,
      value: Number(proposalForm.value || 0),
      scope: proposalForm.scope,
      valid_until: proposalForm.valid_until,
    });

    setShowProposalModal(false);
  };

  const handleUpdateProposalStatus = async (id: string, newStatus: DbProposal['status']) => {
    await updateProposal(id, { status: newStatus });
  };

  const handleDeleteProposal = async (id: string) => {
    if (window.confirm('Delete this proposal?')) {
      await deleteProposal(id);
    }
  };

  const { subtotal: modalSubtotal, tax_amount: modalTax, total_amount: modalTotal } = calculateInvoiceTotals();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <SideNavBar active="business" />
      <main className="lg:ml-[280px] ml-0 flex-1 flex flex-col min-h-screen overflow-x-hidden bg-surface-container-lowest w-full">
        {/* Header */}
        <header className="px-4 sm:px-margin-desktop py-4 sm:py-stack-md border-b border-outline-variant bg-surface flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 sm:gap-6">
          <div>
            <h2 className="font-headline-lg text-on-surface">Business & Client Hub</h2>
            <p className="text-on-surface-variant font-body-md text-sm">
              Manage client CRM, pitches, agreements, and automated invoice billing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-surface-container-low px-5 py-2.5 rounded border border-outline-variant/50">
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase">Total Invoiced</p>
              <p className="text-xl font-bold text-primary">${totalInvoiced.toLocaleString()}</p>
            </div>
            <div className="bg-surface-container-low px-5 py-2.5 rounded border border-outline-variant/50">
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase">Collected (Paid)</p>
              <p className="text-xl font-bold text-green-600">${totalCollected.toLocaleString()}</p>
            </div>
            <div className="bg-surface-container-low px-5 py-2.5 rounded border border-outline-variant/50">
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase">Outstanding</p>
              <p className="text-xl font-bold text-amber-600">${totalOutstanding.toLocaleString()}</p>
            </div>
            <div className="bg-surface-container-low px-5 py-2.5 rounded border border-outline-variant/50">
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase">Active Clients</p>
              <p className="text-xl font-bold text-on-surface">{activeClientsCount}</p>
            </div>

            <button
              onClick={() => handleOpenClientModal()}
              className="bg-primary text-on-primary px-4 py-2.5 rounded font-label-caps uppercase text-xs flex items-center gap-2 hover:bg-primary/90 transition-all cursor-pointer shadow-sm ml-2"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              New Client
            </button>
            <button
              onClick={() => handleOpenInvoiceModal()}
              className="bg-surface-container-high text-on-surface hover:bg-surface-container-highest px-4 py-2.5 rounded font-label-caps uppercase text-xs flex items-center gap-2 transition-all cursor-pointer border border-outline-variant"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              Create Invoice
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-margin-desktop space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-outline-variant pb-2 overflow-x-auto gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'clients'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">group</span>
                Clients ({clients.length})
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'invoices'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                Invoices ({invoices.length})
              </button>
              <button
                onClick={() => setActiveTab('proposals')}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'proposals'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">description</span>
                Proposals & Pitches ({proposals.length})
              </button>
            </div>

            {activeTab === 'clients' && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3 top-2.5">
                    search
                  </span>
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Search clients, company..."
                    className="pl-9 pr-4 py-2 text-xs bg-surface border border-outline-variant rounded-md w-56 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <select
                  value={clientStatusFilter}
                  onChange={(e) => setClientStatusFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-surface border border-outline-variant rounded-md text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Lead">Lead</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="flex items-center gap-3">
                <select
                  value={invoiceStatusFilter}
                  onChange={(e) => setInvoiceStatusFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-surface border border-outline-variant rounded-md text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Sent">Sent</option>
                  <option value="Draft">Draft</option>
                  <option value="Overdue">Overdue</option>
                </select>
                <button
                  onClick={() => handleOpenInvoiceModal()}
                  className="bg-primary text-on-primary px-3.5 py-2 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  New Invoice
                </button>
              </div>
            )}

            {activeTab === 'proposals' && (
              <div className="flex items-center gap-3">
                <select
                  value={proposalStatusFilter}
                  onChange={(e) => setProposalStatusFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-surface border border-outline-variant rounded-md text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="all">All Proposals</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Sent">Sent</option>
                  <option value="Draft">Draft</option>
                  <option value="Declined">Declined</option>
                </select>
                <button
                  onClick={() => handleOpenProposalModal()}
                  className="bg-primary text-on-primary px-3.5 py-2 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  New Proposal
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: CLIENTS */}
          {activeTab === 'clients' && (
            <div>
              {filteredClients.length === 0 ? (
                <div className="bg-surface rounded-xl border border-outline-variant/60 p-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">
                    person_search
                  </span>
                  <h3 className="font-bold text-on-surface mb-1">No clients found</h3>
                  <p className="text-sm text-on-surface-variant mb-4">
                    Add your first client or freelance account to track deliverables and invoices.
                  </p>
                  <button
                    onClick={() => handleOpenClientModal()}
                    className="bg-primary text-on-primary px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 hover:bg-primary/90"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add Client
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredClients.map((client) => {
                    const clientInvoices = invoices.filter(
                      (inv) =>
                        inv.client_id === client.id ||
                        (inv.client_name && inv.client_name.toLowerCase() === client.name.toLowerCase())
                    );
                    const clientTotalBilled = clientInvoices.reduce((a, b) => a + Number(b.total_amount || 0), 0);

                    return (
                      <div
                        key={client.id}
                        className="bg-surface rounded-xl border border-outline-variant/70 p-6 flex flex-col justify-between hover:border-primary/50 transition-all shadow-sm group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <h3 className="font-headline-sm text-lg font-bold text-on-surface">{client.name}</h3>
                              {client.company && (
                                <p className="text-xs font-medium text-on-surface-variant flex items-center gap-1 mt-0.5">
                                  <span className="material-symbols-outlined text-[14px]">corporate_fare</span>
                                  {client.company}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                client.status === 'Active'
                                  ? 'bg-green-100 text-green-800'
                                  : client.status === 'Lead'
                                  ? 'bg-blue-100 text-blue-800'
                                  : client.status === 'Completed'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-surface-container-high text-on-surface-variant'
                              }`}
                            >
                              {client.status || 'Active'}
                            </span>
                          </div>

                          <div className="space-y-2 py-3 border-y border-outline-variant/40 text-xs text-on-surface-variant">
                            {client.email && (
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[15px] text-primary">mail</span>
                                <a href={`mailto:${client.email}`} className="hover:underline text-on-surface">
                                  {client.email}
                                </a>
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[15px] text-primary">call</span>
                                <span>{client.phone}</span>
                              </div>
                            )}
                            {client.website && (
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[15px] text-primary">language</span>
                                <a
                                  href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:underline text-primary truncate max-w-[200px]"
                                >
                                  {client.website.replace(/^https?:\/\//, '')}
                                </a>
                              </div>
                            )}
                            {client.notes && (
                              <p className="mt-2 text-xs text-on-surface/80 bg-surface-container-low p-2.5 rounded border border-outline-variant/30 italic">
                                "{client.notes}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 flex items-center justify-between">
                          <div className="text-xs">
                            <span className="text-on-surface-variant">Billed: </span>
                            <span className="font-bold text-on-surface">${clientTotalBilled.toLocaleString()}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenInvoiceModal(client.name)}
                              title="Create invoice for client"
                              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">receipt</span>
                            </button>
                            <button
                              onClick={() => handleOpenClientModal(client)}
                              title="Edit client"
                              className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClient(client.id)}
                              title="Delete client"
                              className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INVOICES */}
          {activeTab === 'invoices' && (
            <div>
              {filteredInvoices.length === 0 ? (
                <div className="bg-surface rounded-xl border border-outline-variant/60 p-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">
                    receipt_long
                  </span>
                  <h3 className="font-bold text-on-surface mb-1">No invoices found</h3>
                  <p className="text-sm text-on-surface-variant mb-4">
                    Create clean, structured invoices with line-item totals and automatic tax rates.
                  </p>
                  <button
                    onClick={() => handleOpenInvoiceModal()}
                    className="bg-primary text-on-primary px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 hover:bg-primary/90"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Create Invoice
                  </button>
                </div>
              ) : (
                <div className="bg-surface rounded-xl border border-outline-variant/70 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-on-surface">
                      <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[11px] font-bold tracking-wider border-b border-outline-variant">
                        <tr>
                          <th className="px-6 py-4">Invoice #</th>
                          <th className="px-6 py-4">Client</th>
                          <th className="px-6 py-4">Issue / Due Date</th>
                          <th className="px-6 py-4">Subtotal</th>
                          <th className="px-6 py-4">Total Amount</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/40">
                        {filteredInvoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-surface-container-low/60 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-primary">{inv.invoice_number}</td>
                            <td className="px-6 py-4">
                              <span className="font-bold">{inv.client_name}</span>
                            </td>
                            <td className="px-6 py-4 text-on-surface-variant">
                              <div>{inv.issue_date || '—'}</div>
                              <div className="text-[10px] text-on-surface-variant/70">Due: {inv.due_date || '—'}</div>
                            </td>
                            <td className="px-6 py-4 text-on-surface-variant">
                              ${Number(inv.subtotal || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 font-bold text-sm">
                              ${Number(inv.total_amount || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleInvoicePaid(inv)}
                                title="Click to toggle Paid/Sent"
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                                  inv.status === 'Paid'
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : inv.status === 'Sent'
                                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                    : inv.status === 'Overdue'
                                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                                }`}
                              >
                                {inv.status}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setPreviewInvoice(inv)}
                                  title="Preview & Print Invoice"
                                  className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition-colors cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteInvoice(inv.id)}
                                  title="Delete Invoice"
                                  className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded transition-colors cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROPOSALS */}
          {activeTab === 'proposals' && (
            <div>
              {filteredProposals.length === 0 ? (
                <div className="bg-surface rounded-xl border border-outline-variant/60 p-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">
                    description
                  </span>
                  <h3 className="font-bold text-on-surface mb-1">No proposals found</h3>
                  <p className="text-sm text-on-surface-variant mb-4">
                    Draft and track high-ticket client proposals, project scopes, and quotes.
                  </p>
                  <button
                    onClick={() => handleOpenProposalModal()}
                    className="bg-primary text-on-primary px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 hover:bg-primary/90"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    New Proposal
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredProposals.map((prop) => (
                    <div
                      key={prop.id}
                      className="bg-surface rounded-xl border border-outline-variant/70 p-6 flex flex-col justify-between hover:border-primary/50 transition-all shadow-sm"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-headline-sm text-lg font-bold text-on-surface">{prop.title}</h3>
                          <select
                            value={prop.status}
                            onChange={(e) => handleUpdateProposalStatus(prop.id, e.target.value as any)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border-none focus:outline-none cursor-pointer ${
                              prop.status === 'Accepted'
                                ? 'bg-green-100 text-green-800'
                                : prop.status === 'Sent'
                                ? 'bg-blue-100 text-blue-800'
                                : prop.status === 'Declined'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-surface-container-high text-on-surface-variant'
                            }`}
                          >
                            <option value="Draft">Draft</option>
                            <option value="Sent">Sent</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Declined">Declined</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-on-surface-variant mb-3">
                          <span className="font-semibold text-primary">{prop.client_name}</span>
                          <span>•</span>
                          <span>Value: <strong className="text-on-surface">${Number(prop.value || 0).toLocaleString()}</strong></span>
                          {prop.valid_until && (
                            <>
                              <span>•</span>
                              <span>Valid until: {prop.valid_until}</span>
                            </>
                          )}
                        </div>

                        {prop.scope && (
                          <div className="bg-surface-container-low p-3.5 rounded border border-outline-variant/40 text-xs text-on-surface/90">
                            <p className="font-bold text-[10px] uppercase text-on-surface-variant mb-1">Scope & Deliverables</p>
                            <p className="whitespace-pre-line">{prop.scope}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 pt-3 border-t border-outline-variant/40 flex items-center justify-between">
                        <button
                          onClick={() => handleOpenInvoiceModal(prop.client_name || undefined)}
                          className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">receipt</span>
                          Convert to Invoice
                        </button>

                        <button
                          onClick={() => handleDeleteProposal(prop.id)}
                          className="p-1.5 text-on-surface-variant hover:text-error rounded transition-colors cursor-pointer"
                          title="Delete proposal"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL: ADD / EDIT CLIENT */}
        {showClientModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  {editingClient ? 'Edit Client Record' : 'Add New Client'}
                </h3>
                <button
                  onClick={() => setShowClientModal(false)}
                  className="p-1 text-on-surface-variant hover:text-on-surface rounded-full cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveClient} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    placeholder="e.g. Acme Corp or Sarah Jenkins"
                    className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      value={clientForm.company}
                      onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                      placeholder="e.g. Acme Labs"
                      className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Status
                    </label>
                    <select
                      value={clientForm.status}
                      onChange={(e) => setClientForm({ ...clientForm, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                    >
                      <option value="Active">Active</option>
                      <option value="Lead">Lead</option>
                      <option value="Completed">Completed</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      placeholder="client@company.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={clientForm.website}
                    onChange={(e) => setClientForm({ ...clientForm, website: e.target.value })}
                    placeholder="https://clientwebsite.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Notes & Scope
                  </label>
                  <textarea
                    rows={3}
                    value={clientForm.notes}
                    onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                    placeholder="Key deliverables, communication preference, payment terms..."
                    className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setShowClientModal(false)}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-on-primary px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary/90 cursor-pointer shadow-sm"
                  >
                    {editingClient ? 'Save Changes' : 'Create Client'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CREATE INVOICE */}
        {showInvoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
                <div>
                  <h3 className="font-headline-sm text-base font-bold text-on-surface">Generate Client Invoice</h3>
                  <p className="text-xs text-on-surface-variant">{invoiceForm.invoice_number}</p>
                </div>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-1 text-on-surface-variant hover:text-on-surface rounded-full cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveInvoice} className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={invoiceForm.client_name}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, client_name: e.target.value })}
                      placeholder="Client Name or Company"
                      className="w-full px-3.5 py-2 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Status
                    </label>
                    <select
                      value={invoiceForm.status}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.value as any })}
                      className="w-full px-3.5 py-2 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                    >
                      <option value="Sent">Sent</option>
                      <option value="Paid">Paid</option>
                      <option value="Draft">Draft</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={invoiceForm.issue_date}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, issue_date: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={invoiceForm.due_date}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Line Items & Deliverables
                    </label>
                    <button
                      type="button"
                      onClick={handleAddInvoiceItem}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {invoiceForm.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/60">
                        <input
                          type="text"
                          required
                          placeholder="Description / Deliverable"
                          value={item.description}
                          onChange={(e) => handleUpdateInvoiceItem(idx, 'description', e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs bg-surface border border-outline-variant rounded text-on-surface focus:outline-none focus:border-primary"
                        />
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleUpdateInvoiceItem(idx, 'quantity', e.target.value)}
                          className="w-16 px-2 py-1.5 text-xs bg-surface border border-outline-variant rounded text-on-surface text-center focus:outline-none focus:border-primary"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Price"
                          value={item.unit_price}
                          onChange={(e) => handleUpdateInvoiceItem(idx, 'unit_price', e.target.value)}
                          className="w-24 px-2 py-1.5 text-xs bg-surface border border-outline-variant rounded text-on-surface text-right focus:outline-none focus:border-primary"
                        />
                        <span className="w-20 text-xs font-bold text-right text-on-surface">
                          ${Number(item.amount || 0).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveInvoiceItem(idx)}
                          disabled={invoiceForm.items.length <= 1}
                          className="p-1 text-on-surface-variant hover:text-error disabled:opacity-30 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tax & Summary */}
                <div className="grid grid-cols-2 gap-6 pt-3 border-t border-outline-variant/60">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={invoiceForm.tax_rate}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, tax_rate: Number(e.target.value) })}
                      className="w-32 px-3 py-1.5 text-xs bg-surface-container-lowest border border-outline-variant rounded text-on-surface focus:outline-none focus:border-primary"
                    />
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mt-3 mb-1">
                      Payment Notes / Terms
                    </label>
                    <textarea
                      rows={2}
                      value={invoiceForm.notes}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                      placeholder="Bank wire instructions, net 14 terms..."
                      className="w-full px-3 py-1.5 text-xs bg-surface-container-lowest border border-outline-variant rounded text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="bg-surface-container-low p-4 rounded-xl space-y-2 text-xs border border-outline-variant/50">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Subtotal:</span>
                      <span className="font-bold text-on-surface">${modalSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Tax ({invoiceForm.tax_rate}%):</span>
                      <span className="font-bold text-on-surface">${modalTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-outline-variant text-sm font-bold text-primary">
                      <span>Total Due:</span>
                      <span>${modalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(false)}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-on-primary px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary/90 cursor-pointer shadow-sm"
                  >
                    Save & Issue Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: PROPOSAL */}
        {showProposalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
                <h3 className="font-headline-sm text-base font-bold text-on-surface">New Project Proposal</h3>
                <button
                  onClick={() => setShowProposalModal(false)}
                  className="p-1 text-on-surface-variant hover:text-on-surface rounded-full cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveProposal} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Project / Pitch Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={proposalForm.title}
                    onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                    placeholder="e.g. Design System Token Audit & Component Architecture"
                    className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Client / Company *
                    </label>
                    <input
                      type="text"
                      required
                      value={proposalForm.client_name}
                      onChange={(e) => setProposalForm({ ...proposalForm, client_name: e.target.value })}
                      placeholder="e.g. Apex Labs"
                      className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Proposal Status
                    </label>
                    <select
                      value={proposalForm.status}
                      onChange={(e) => setProposalForm({ ...proposalForm, status: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Declined">Declined</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Estimated Value ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={proposalForm.value}
                      onChange={(e) => setProposalForm({ ...proposalForm, value: Number(e.target.value) })}
                      placeholder="5000"
                      className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Valid Until Date
                    </label>
                    <input
                      type="date"
                      value={proposalForm.valid_until}
                      onChange={(e) => setProposalForm({ ...proposalForm, valid_until: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Project Scope & Key Milestones
                  </label>
                  <textarea
                    rows={4}
                    value={proposalForm.scope}
                    onChange={(e) => setProposalForm({ ...proposalForm, scope: e.target.value })}
                    placeholder="Describe deliverables, sprint milestones, and timelines..."
                    className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setShowProposalModal(false)}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-on-primary px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary/90 cursor-pointer shadow-sm"
                  >
                    Create Proposal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: INVOICE PREVIEW / RECEIPT */}
        {previewInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="bg-surface border border-outline-variant rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">receipt_long</span>
                  <h3 className="font-bold text-on-surface">{previewInvoice.invoice_number}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 text-on-surface-variant hover:text-primary rounded cursor-pointer"
                    title="Print invoice"
                  >
                    <span className="material-symbols-outlined text-[20px]">print</span>
                  </button>
                  <button
                    onClick={() => setPreviewInvoice(null)}
                    className="p-1 text-on-surface-variant hover:text-on-surface rounded-full cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-primary font-headline-lg tracking-tight">LEVELUP</h2>
                    <p className="text-xs text-on-surface-variant">Freelance & Business OS</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        previewInvoice.status === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : previewInvoice.status === 'Sent'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {previewInvoice.status}
                    </span>
                    <p className="text-xs text-on-surface-variant mt-2">
                      Issue: {previewInvoice.issue_date || '—'}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Due: {previewInvoice.due_date || '—'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant/50">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant">Billed To:</p>
                  <p className="text-base font-bold text-on-surface">{previewInvoice.client_name}</p>
                </div>

                {previewInvoice.items && previewInvoice.items.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-outline-variant text-on-surface-variant font-bold uppercase text-[10px]">
                        <th className="py-2 text-left">Description</th>
                        <th className="py-2 text-center">Qty</th>
                        <th className="py-2 text-right">Price</th>
                        <th className="py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {previewInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5">{item.description}</td>
                          <td className="py-2.5 text-center">{item.quantity}</td>
                          <td className="py-2.5 text-right">${Number(item.unit_price).toLocaleString()}</td>
                          <td className="py-2.5 text-right font-bold">${Number(item.amount).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex justify-between py-2 border-b border-outline-variant text-xs">
                    <span>Professional Services & Deliverables</span>
                    <span className="font-bold">${Number(previewInvoice.subtotal).toLocaleString()}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-outline-variant space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Subtotal:</span>
                    <span>${Number(previewInvoice.subtotal || 0).toLocaleString()}</span>
                  </div>
                  {previewInvoice.tax_rate && (
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Tax ({previewInvoice.tax_rate}%):</span>
                      <span>${Number(previewInvoice.tax_amount || 0).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-outline-variant">
                    <span>Total:</span>
                    <span>${Number(previewInvoice.total_amount || 0).toLocaleString()}</span>
                  </div>
                </div>

                {previewInvoice.notes && (
                  <p className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded border border-outline-variant/40">
                    <strong>Notes: </strong>{previewInvoice.notes}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
