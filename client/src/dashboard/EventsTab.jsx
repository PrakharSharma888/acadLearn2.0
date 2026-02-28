import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import API_BASE from "../config/api";
import { authHeader } from "./constants";

const INPUT = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400";

const fmtDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

const fmtTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

const EMPTY_FORM = {
  title: "", description: "", imageUrl: "",
  date: "", time: "",
  isFree: true, price: "",
  totalSlots: "",
  universityId: "", universityName: "", targetDepartments: [],
  showOn: "org", isActive: true,
};

const SHOW_ON_OPTIONS = [
  { value: "org",          label: "Org Page only",           color: "border-indigo-400 bg-indigo-50", text: "text-indigo-700" },
  { value: "junior",       label: "Junior only",             color: "border-amber-400 bg-amber-50",   text: "text-amber-700" },
  { value: "professional", label: "Professional only",       color: "border-blue-400 bg-blue-50",     text: "text-blue-700" },
  { value: "both",         label: "Junior + Professional",   color: "border-purple-400 bg-purple-50", text: "text-purple-700" },
];

// ── Event Form Modal ──────────────────────────────────────────────────────────
const EventModal = ({ token, editEvent, onClose, onSaved, universities, defaultUnivId }) => {
  const isEdit = Boolean(editEvent);
  const [form, setForm] = useState(
    isEdit
      ? {
          title:       editEvent.title,
          description: editEvent.description || "",
          imageUrl:    editEvent.imageUrl || "",
          date:        editEvent.date || "",
          time:        editEvent.time || "",
          isFree:      editEvent.isFree !== false,
          price:       editEvent.price || "",
          totalSlots:  editEvent.totalSlots || "",
          universityId:      editEvent.universityId?.toString() || "",
          universityName:    editEvent.universityName || "",
          targetDepartments: editEvent.targetDepartments || [],
          showOn:      editEvent.showOn || "org",
          isActive:    editEvent.isActive !== false,
        }
      : { ...EMPTY_FORM, universityId: defaultUnivId || "", universityName: universities.find((u) => u._id === defaultUnivId)?.name || "" }
  );
  const [preview, setPreview] = useState(isEdit ? editEvent.imageUrl || "" : "");
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState("");
  const [imgErr,  setImgErr]  = useState("");

  const availableDepts = universities.find((u) => u._id === form.universityId)?.departments || [];

  const handleUnivChange = (e) => {
    const id   = e.target.value;
    const univ = universities.find((u) => u._id === id);
    setForm((f) => ({ ...f, universityId: id, universityName: univ?.name || "", targetDepartments: [] }));
  };

  const toggleDept = (name) => {
    setForm((f) => ({
      ...f,
      targetDepartments: f.targetDepartments.includes(name)
        ? f.targetDepartments.filter((d) => d !== name)
        : [...f.targetDepartments, name],
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setImgErr("Image too large! Max 2MB."); e.target.value = ""; return; }
    setImgErr("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setForm((f) => ({ ...f, imageUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      const payload = {
        ...form,
        price:        form.isFree ? 0 : (Number(form.price) || 0),
        totalSlots:   Number(form.totalSlots) || 0,
        universityId: form.universityId || null,
      };
      const url    = isEdit ? `${API_BASE}/api/events/${editEvent._id}` : `${API_BASE}/api/events`;
      const method = isEdit ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers: authHeader(token), body: JSON.stringify(payload) });
      const data   = await res.json();
      if (!res.ok) { setMsg(data.message || "Failed"); return; }
      onSaved();
      onClose();
    } catch { setMsg("Server error."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">

        {/* ── Header ── */}
        <div className="bg-linear-to-r from-orange-500 to-amber-400 p-5 text-white shrink-0 rounded-t-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-1">Events</p>
          <h2 className="text-xl font-bold">{isEdit ? "Edit Event" : "Create New Event"}</h2>
          <p className="text-orange-100 text-sm mt-0.5">
            {isEdit ? "Update event details below" : "Fill in details — live preview on the right"}
          </p>
        </div>

        {/* ── Body: two columns ── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row gap-0">

            {/* ── Left: fields ── */}
            <div className="flex-1 p-6 space-y-4 lg:border-r border-gray-100">

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Event Title <span className="text-red-400">*</span></label>
                <input required value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Annual Tech Fest 2025" className={INPUT} />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                <textarea rows={2} value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Event ke baare mein batao…" className={`${INPUT} resize-none`} />
              </div>

              {/* Image upload + URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Event Image
                  <span className="ml-2 text-[10px] font-normal text-orange-500 bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5">max 2MB</span>
                </label>
                <label className="flex items-center gap-2 w-full border border-dashed border-gray-300 rounded-xl px-3 py-2 text-sm cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors mb-2">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-gray-500 text-xs">Upload image from device</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                <input value={form.imageUrl}
                  onChange={(e) => { setForm((f) => ({ ...f, imageUrl: e.target.value })); setPreview(e.target.value); }}
                  placeholder="...ya image URL paste karo"
                  className={INPUT} />
                {imgErr && <p className="text-xs text-red-500 mt-1">{imgErr}</p>}
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Date <span className="text-red-400">*</span></label>
                  <input required type="date" value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    min={new Date().toISOString().split("T")[0]} className={INPUT} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Time</label>
                  <input type="time" value={form.time}
                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                    className={INPUT} />
                </div>
              </div>

              {/* Pricing */}
              <div className="border border-gray-100 rounded-xl p-3 space-y-3 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pricing</p>
                <div className="flex gap-2">
                  <label className={`flex-1 flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${form.isFree ? "border-green-400 bg-green-50" : "border-gray-200 bg-white"}`}>
                    <input type="radio" name="pricing" checked={form.isFree} onChange={() => setForm((f) => ({ ...f, isFree: true, price: "" }))} className="accent-green-500" />
                    <div>
                      <p className="text-sm font-bold text-green-700">Free</p>
                      <p className="text-[10px] text-gray-400">Koi charge nahi</p>
                    </div>
                  </label>
                  <label className={`flex-1 flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${!form.isFree ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white"}`}>
                    <input type="radio" name="pricing" checked={!form.isFree} onChange={() => setForm((f) => ({ ...f, isFree: false }))} className="accent-orange-500" />
                    <div>
                      <p className="text-sm font-bold text-orange-700">Paid</p>
                      <p className="text-[10px] text-gray-400">Razorpay se</p>
                    </div>
                  </label>
                </div>
                {!form.isFree && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Price (₹) <span className="text-red-400">*</span></label>
                    <input required={!form.isFree} type="number" min="1" value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="e.g. 199" className={INPUT} />
                  </div>
                )}
              </div>

              {/* Slots */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Total Slots <span className="font-normal text-gray-400">(0 = unlimited)</span>
                </label>
                <input type="number" min="0" value={form.totalSlots}
                  onChange={(e) => setForm((f) => ({ ...f, totalSlots: e.target.value }))}
                  placeholder="e.g. 50" className={INPUT} />
              </div>

              {/* University */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Target University</p>
                <select value={form.universityId} onChange={handleUnivChange} className={INPUT}>
                  <option value="">— All / No specific university —</option>
                  {universities.map((u) => (
                    <option key={u._id} value={u._id}>{u.name}{u.shortName ? ` (${u.shortName})` : ""}</option>
                  ))}
                </select>
                {form.universityId && availableDepts.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Target Departments</p>
                    <div className="flex flex-wrap gap-2">
                      {availableDepts.map((d) => {
                        const sel = form.targetDepartments.includes(d.name);
                        return (
                          <button key={d._id} type="button" onClick={() => toggleDept(d.name)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${sel ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400"}`}>
                            {sel && "✓ "}{d.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Show On */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Show On</p>
                <div className="grid grid-cols-2 gap-2">
                  {SHOW_ON_OPTIONS.map((opt) => (
                    <label key={opt.value}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${form.showOn === opt.value ? opt.color : "border-gray-200 bg-white"}`}>
                      <input type="radio" name="showOn" value={opt.value}
                        checked={form.showOn === opt.value}
                        onChange={() => setForm((f) => ({ ...f, showOn: opt.value }))}
                        className="accent-orange-500 shrink-0" />
                      <span className={`text-xs font-bold ${form.showOn === opt.value ? opt.text : "text-gray-600"}`}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* ── Right: live preview ── */}
            <div className="lg:w-64 shrink-0 p-6 bg-gray-50 lg:rounded-br-2xl">
              <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Live Preview</p>

              {/* Event card preview */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Image */}
                <div className="h-36 w-full overflow-hidden bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl relative">
                  {preview ? (
                    <img src={preview} alt="preview" className="w-full h-full object-cover"
                      onError={() => setPreview("")} />
                  ) : (
                    <span className="opacity-60">🎯</span>
                  )}
                  {/* Badges overlay */}
                  <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                    {form.isFree
                      ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500 text-white">FREE</span>
                      : form.price
                        ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500 text-white">₹{form.price}</span>
                        : null
                    }
                    {form.totalSlots > 0 && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-white/80 text-gray-700">{form.totalSlots} slots</span>
                    )}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-3">
                  <p className="font-black text-slate-900 text-sm leading-snug mb-1">
                    {form.title || <span className="text-gray-300 font-normal">Event title…</span>}
                  </p>
                  {form.description && (
                    <p className="text-[11px] text-gray-400 line-clamp-2 mb-2">{form.description}</p>
                  )}
                  {form.date && (
                    <div className="flex items-center gap-1 text-[11px] text-indigo-600 font-semibold mb-2">
                      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {fmtDate(form.date)}{form.time ? ` · ${fmtTime(form.time)}` : ""}
                    </div>
                  )}
                  {form.universityName && (
                    <p className="text-[10px] font-semibold text-indigo-500 mb-1">{form.universityName}</p>
                  )}
                  {/* Show On badge */}
                  {form.showOn && (
                    <div className="mt-2">
                      {(() => {
                        const opt = SHOW_ON_OPTIONS.find((o) => o.value === form.showOn);
                        return opt ? (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${opt.color} ${opt.text}`}>
                            {opt.label}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  )}
                  <button disabled
                    className={`mt-3 w-full py-2 text-xs font-bold rounded-full ${
                      form.isFree
                        ? "bg-indigo-600 text-white"
                        : "bg-linear-to-r from-orange-500 to-amber-500 text-white"
                    }`}>
                    {form.isFree ? "Register for Free" : `Pay ₹${form.price || "…"} & Register`}
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 text-center mt-2">Org page par aise dikhega</p>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="px-6 pb-6 pt-2 border-t border-gray-100">
            {msg && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5 mb-3">{msg}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60">
                {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Event"}
              </button>
              <button type="button" onClick={onClose}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Invoice Print Helper ──────────────────────────────────────────────────────
const printInvoice = (reg, event) => {
  const paid   = reg.isPaid;
  const date   = new Date(reg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const evDate = event.date ? new Date(event.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "";

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <title>Invoice – ${reg.name}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; background:#f9fafb; padding:32px; color:#1e293b; }
    .card { background:#fff; border-radius:12px; max-width:600px; margin:0 auto; box-shadow:0 2px 16px #0001; overflow:hidden; }
    .header { background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; padding:28px 32px; }
    .header h1 { font-size:22px; font-weight:900; letter-spacing:-0.5px; }
    .header p { font-size:12px; opacity:0.8; margin-top:4px; }
    .badge { display:inline-block; background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.3); border-radius:999px; padding:3px 10px; font-size:11px; font-weight:700; margin-top:8px; }
    .body { padding:28px 32px; }
    .section { margin-bottom:20px; }
    .section-title { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; margin-bottom:10px; border-bottom:1px solid #f1f5f9; padding-bottom:6px; }
    .row { display:flex; justify-content:space-between; margin-bottom:7px; font-size:13px; }
    .row .label { color:#64748b; }
    .row .value { font-weight:600; color:#1e293b; text-align:right; max-width:60%; }
    .total-box { background:#f8faff; border:1px solid #e0e7ff; border-radius:8px; padding:14px 18px; display:flex; justify-content:space-between; align-items:center; }
    .total-box .label { font-size:13px; color:#64748b; }
    .total-box .amount { font-size:20px; font-weight:900; color:${paid ? "#16a34a" : "#2563eb"}; }
    .status-pill { display:inline-block; background:${paid ? "#dcfce7" : "#dbeafe"}; color:${paid ? "#15803d" : "#1d4ed8"}; border-radius:999px; padding:3px 12px; font-size:11px; font-weight:700; }
    .footer { text-align:center; padding:16px 32px; border-top:1px solid #f1f5f9; font-size:11px; color:#94a3b8; }
    .payment-id { font-family:monospace; font-size:11px; color:#64748b; word-break:break-all; }
    @media print { body { background:#fff; padding:0; } .card { box-shadow:none; } }
  </style>
  </head><body>
  <div class="card">
    <div class="header">
      <h1>AcadLearn</h1>
      <p>Event Registration ${paid ? "Invoice" : "Confirmation"}</p>
      <div class="badge">${paid ? "PAID" : "FREE REGISTRATION"}</div>
    </div>
    <div class="body">
      <div class="section">
        <div class="section-title">Registrant Details</div>
        <div class="row"><span class="label">Name</span><span class="value">${reg.name}</span></div>
        ${reg.parentName ? `<div class="row"><span class="label">Parent / Guardian</span><span class="value">${reg.parentName}</span></div>` : ""}
        <div class="row"><span class="label">Email</span><span class="value">${reg.email}</span></div>
        ${reg.phone ? `<div class="row"><span class="label">Phone</span><span class="value">${reg.phone}</span></div>` : ""}
        ${reg.batchYear ? `<div class="row"><span class="label">Batch & Year</span><span class="value">${reg.batchYear}</span></div>` : ""}
        ${reg.college ? `<div class="row"><span class="label">College</span><span class="value">${reg.college}</span></div>` : ""}
        ${reg.department ? `<div class="row"><span class="label">Department</span><span class="value">${reg.department}</span></div>` : ""}
      </div>
      <div class="section">
        <div class="section-title">Event Details</div>
        <div class="row"><span class="label">Event</span><span class="value">${event.title}</span></div>
        ${evDate ? `<div class="row"><span class="label">Date</span><span class="value">${evDate}${event.time ? " · " + event.time : ""}</span></div>` : ""}
        ${event.universityName ? `<div class="row"><span class="label">University</span><span class="value">${event.universityName}</span></div>` : ""}
        <div class="row"><span class="label">Registration Date</span><span class="value">${date}</span></div>
        <div class="row"><span class="label">Status</span><span class="value"><span class="status-pill">${reg.status?.toUpperCase()}</span></span></div>
      </div>
      ${paid ? `
      <div class="section">
        <div class="section-title">Payment Details</div>
        ${reg.paymentId ? `<div class="row"><span class="label">Payment ID</span><span class="value payment-id">${reg.paymentId}</span></div>` : ""}
        ${reg.orderId ? `<div class="row"><span class="label">Order ID</span><span class="value payment-id">${reg.orderId}</span></div>` : ""}
      </div>` : ""}
      <div class="total-box">
        <span class="label">Amount ${paid ? "Paid" : ""}</span>
        <span class="amount">${paid ? `₹${reg.amount}` : "FREE"}</span>
      </div>
    </div>
    <div class="footer">AcadLearn · acadlearn.com · This is an auto-generated receipt.</div>
  </div>
  </body></html>`;

  const win = window.open("", "_blank", "width=700,height=900");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
};

// ── Registrations Modal ───────────────────────────────────────────────────────
const RegistrationsModal = ({ token, event, onClose }) => {
  const [regs,    setRegs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/events/${event._id}/registrations`, { headers: authHeader(token) })
      .then((r) => r.ok ? r.json() : [])
      .then((d) => { setRegs(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [event._id, token]);

  const paidCount  = regs.filter((r) => r.isPaid).length;
  const totalPaid  = regs.filter((r) => r.isPaid).reduce((s, r) => s + (r.amount || 0), 0);
  const filtered   = search
    ? regs.filter((r) =>
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.email?.toLowerCase().includes(search.toLowerCase()) ||
        r.college?.toLowerCase().includes(search.toLowerCase()) ||
        r.phone?.includes(search)
      )
    : regs;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-linear-to-r from-indigo-500 to-purple-500 p-5 text-white rounded-t-2xl shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-indigo-100 text-xs font-semibold uppercase tracking-widest mb-1">Registrations</p>
          <h2 className="text-lg font-bold leading-snug">{event.title}</h2>
          <div className="flex gap-3 mt-3 flex-wrap">
            <div className="bg-white/15 rounded-xl px-3 py-1.5 text-center">
              <p className="text-xl font-black leading-none">{regs.length}</p>
              <p className="text-[10px] text-indigo-200">Total</p>
            </div>
            <div className="bg-white/15 rounded-xl px-3 py-1.5 text-center">
              <p className="text-xl font-black leading-none">{paidCount}</p>
              <p className="text-[10px] text-indigo-200">Paid</p>
            </div>
            <div className="bg-white/15 rounded-xl px-3 py-1.5 text-center">
              <p className="text-xl font-black leading-none">{regs.length - paidCount}</p>
              <p className="text-[10px] text-indigo-200">Free</p>
            </div>
            {totalPaid > 0 && (
              <div className="bg-green-400/25 border border-green-300/40 rounded-xl px-3 py-1.5 text-center">
                <p className="text-xl font-black leading-none">₹{totalPaid}</p>
                <p className="text-[10px] text-green-200">Collected</p>
              </div>
            )}
            {event.totalSlots > 0 && (
              <div className="bg-white/15 rounded-xl px-3 py-1.5 text-center">
                <p className="text-xl font-black leading-none">{event.totalSlots - regs.length}</p>
                <p className="text-[10px] text-indigo-200">Slots Left</p>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-2 shrink-0">
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, college..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-5 pb-4">
          {loading ? (
            <p className="text-center text-gray-400 py-12 text-sm">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">{search ? "No match found." : "No registrations yet."}</p>
          ) : (
            <div className="space-y-3 pt-1">
              {filtered.map((r, i) => (
                <div key={r._id} className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                  {/* Row top */}
                  <div className="flex items-start gap-3 p-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-slate-800">{r.name}</p>
                        {r.isPaid ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Paid ₹{r.amount}</span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Free</span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"}`}>
                          {r.status}
                        </span>
                      </div>
                      {/* Details grid */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-2">
                        {r.email && <p className="text-xs text-gray-500 truncate"><span className="font-semibold text-gray-600">Email:</span> {r.email}</p>}
                        {r.phone && <p className="text-xs text-gray-500"><span className="font-semibold text-gray-600">Phone:</span> {r.phone}</p>}
                        {r.parentName && <p className="text-xs text-gray-500"><span className="font-semibold text-gray-600">Parent:</span> {r.parentName}</p>}
                        {r.batchYear && <p className="text-xs text-gray-500"><span className="font-semibold text-gray-600">Batch:</span> {r.batchYear}</p>}
                        {r.college && <p className="text-xs text-gray-500 truncate"><span className="font-semibold text-gray-600">College:</span> {r.college}</p>}
                        {r.department && <p className="text-xs text-gray-500"><span className="font-semibold text-gray-600">Dept:</span> {r.department}</p>}
                      </div>
                      {/* Payment IDs */}
                      {r.isPaid && r.paymentId && (
                        <div className="mt-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2 space-y-0.5">
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Payment Info</p>
                          <p className="text-[11px] font-mono text-gray-600 break-all"><span className="font-semibold">Pay ID:</span> {r.paymentId}</p>
                          {r.orderId && <p className="text-[11px] font-mono text-gray-600 break-all"><span className="font-semibold">Order ID:</span> {r.orderId}</p>}
                        </div>
                      )}
                    </div>
                    {/* Invoice button */}
                    <button
                      onClick={() => printInvoice(r, event)}
                      title="Print / Save Invoice"
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-xl border border-indigo-100 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="w-full py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main EventsTab ────────────────────────────────────────────────────────────
const EventsTab = ({ token }) => {
  const location       = useLocation();
  const navState       = location.state || {};

  const [events,       setEvents]       = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [modal,        setModal]        = useState(null); // null | "create" | { editEvent } | { regsEvent }
  const [filterUnivId, setFilterUnivId] = useState(navState.filterUnivId || "");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [eRes, uRes] = await Promise.all([
        fetch(`${API_BASE}/api/events/all`, { headers: authHeader(token) }),
        fetch(`${API_BASE}/api/universities/all`, { headers: authHeader(token) }),
      ]);
      setEvents(eRes.ok ? await eRes.json() : []);
      setUniversities(uRes.ok ? await uRes.json() : []);
    } catch { setEvents([]); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleToggle = async (ev) => {
    try {
      await fetch(`${API_BASE}/api/events/${ev._id}`, {
        method: "PUT", headers: authHeader(token),
        body: JSON.stringify({ isActive: !ev.isActive }),
      });
      loadData();
    } catch { alert("Could not update event."); }
  };

  const handleDelete = async (ev) => {
    if (!window.confirm(`Delete "${ev.title}"? All registrations will also be deleted.`)) return;
    try {
      await fetch(`${API_BASE}/api/events/${ev._id}`, { method: "DELETE", headers: authHeader(token) });
      loadData();
    } catch { alert("Could not delete event."); }
  };

  const slotsLeft = (ev) => ev.totalSlots > 0 ? ev.totalSlots - ev.registeredCount : null;

  const filteredEvents = filterUnivId
    ? events.filter((ev) => ev.universityId?.toString() === filterUnivId)
    : events;

  const activeFilterName = filterUnivId
    ? (universities.find((u) => u._id === filterUnivId)?.name || navState.filterUnivName || "")
    : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Events</h1>
          <p className="text-sm text-gray-400 mt-0.5">University events — free & paid, limited or unlimited slots</p>
        </div>
        <button
          onClick={() => setModal({ create: true, defaultUnivId: filterUnivId || "" })}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Event
        </button>
      </div>

      {/* University filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={filterUnivId}
          onChange={(e) => setFilterUnivId(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        >
          <option value="">All Universities</option>
          {universities.map((u) => (
            <option key={u._id} value={u._id}>{u.name}{u.shortName ? ` (${u.shortName})` : ""}</option>
          ))}
        </select>
        {filterUnivId && (
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2">
            <span className="text-xs font-semibold text-indigo-700">{activeFilterName}</span>
            <button onClick={() => setFilterUnivId("")} className="text-indigo-400 hover:text-indigo-700 text-sm leading-none">×</button>
          </div>
        )}
        <span className="text-xs text-gray-400">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-16 text-center text-gray-400 text-sm">Loading…</div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-16 text-center">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700">
            {filterUnivId ? `No events for ${activeFilterName}` : "No events yet"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Click "Create Event" to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((ev) => {
            const left = slotsLeft(ev);
            const full = left !== null && left <= 0;
            return (
              <div key={ev._id} className={`bg-white rounded-2xl border overflow-hidden ${ev.isActive ? "border-gray-100" : "border-gray-200 opacity-60"}`}>
                <div className="flex gap-4 p-5">
                  {/* Date badge */}
                  <div className={`shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center text-center ${ev.isActive && !full ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>
                    <p className="text-xl font-bold leading-none">{new Date(ev.date + "T00:00:00").getDate()}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide">
                      {new Date(ev.date + "T00:00:00").toLocaleString("en-IN", { month: "short" })}
                    </p>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-800 text-sm">{ev.title}</p>
                      {ev.isFree ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">FREE</span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">₹{ev.price}</span>
                      )}
                      {full && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">FULL</span>}
                      {!ev.isActive && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">Inactive</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {fmtDate(ev.date)}{ev.time ? ` · ${fmtTime(ev.time)}` : ""}
                    </p>
                    {ev.universityName && (
                      <p className="text-xs text-indigo-600 font-semibold mt-0.5">{ev.universityName}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <button
                        onClick={() => setModal({ regsEvent: ev })}
                        className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {ev.registeredCount} registered
                        {ev.totalSlots > 0 && ` / ${ev.totalSlots} slots`}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleToggle(ev)} title={ev.isActive ? "Deactivate" : "Activate"}
                      className={`p-2 rounded-lg transition-colors ${ev.isActive ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-gray-200 text-gray-500 hover:bg-gray-300"}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ev.isActive ? "M5 13l4 4L19 7" : "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"} />
                      </svg>
                    </button>
                    <button onClick={() => setModal({ editEvent: ev })} title="Edit"
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(ev)} title="Delete"
                      className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {(modal?.create || modal?.editEvent) && (
        <EventModal
          token={token}
          editEvent={modal?.editEvent || null}
          onClose={() => setModal(null)}
          onSaved={loadData}
          universities={universities}
          defaultUnivId={modal?.defaultUnivId || filterUnivId || ""}
        />
      )}
      {modal?.regsEvent && (
        <RegistrationsModal
          token={token}
          event={modal.regsEvent}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default EventsTab;
