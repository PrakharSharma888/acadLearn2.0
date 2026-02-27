import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../config/api";
import { authHeader } from "./constants";

const INPUT_CLS =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition";

const msgClass = (type) =>
  type === "success"
    ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
    : "bg-red-50 border border-red-200 text-red-600";

const ProfileTab = ({ user, token, onUserUpdate }) => {
  const navigate = useNavigate();

  const [editForm,  setEditForm]  = useState({ name: user.name || "", email: user.email || "" });

  // Re-sync form when user loads from localStorage (async)
  useEffect(() => {
    if (user.email) {
      setEditForm({ name: user.name || "", email: user.email || "" });
    }
  }, [user.name, user.email]);

  // ── Academic Info state ────────────────────────────────────────────────────
  const [universities,   setUniversities]   = useState([]);
  const [acadForm,       setAcadForm]       = useState({
    phone:          user.phone        || "",
    universityId:   user.university   || "",
    department:     user.department   || "",
    year:           user.year         || "",
    semester:       user.semester     || "",
  });
  const [acadDepts,      setAcadDepts]      = useState([]);
  const [acadMsg,        setAcadMsg]        = useState({ text: "", type: "" });
  const [acadLoading,    setAcadLoading]    = useState(false);

  const loadUniversities = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/universities`);
      if (!res.ok) return;
      const data = await res.json();
      setUniversities(data);
      // Pre-fill departments if user already has a university
      if (user.university) {
        const found = data.find((u) => u._id === user.university);
        if (found) setAcadDepts(found.departments || []);
      }
    } catch {}
  }, [user.university]);

  useEffect(() => { loadUniversities(); }, [loadUniversities]);

  const handleUniversityChange = (e) => {
    const univId = e.target.value;
    const found = universities.find((u) => u._id === univId);
    setAcadDepts(found ? found.departments : []);
    setAcadForm((p) => ({ ...p, universityId: univId, department: "" }));
  };

  const handleAcadSubmit = async (e) => {
    e.preventDefault();
    setAcadLoading(true);
    setAcadMsg({ text: "", type: "" });
    const selectedUniv = universities.find((u) => u._id === acadForm.universityId);
    try {
      const res = await fetch(`${API_BASE}/api/profile/me`, {
        method: "PUT",
        headers: authHeader(token),
        body: JSON.stringify({
          phone: acadForm.phone,
          university: acadForm.universityId || null,
          universityName: selectedUniv ? selectedUniv.name : "",
          department: acadForm.department,
          year: acadForm.year,
          semester: acadForm.semester,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const updated = {
        ...user,
        phone: data.phone,
        university: data.university,
        universityName: data.universityName,
        department: data.department,
        year: data.year,
        semester: data.semester,
      };
      localStorage.setItem("userInfo", JSON.stringify({ ...updated, token }));
      onUserUpdate(updated);
      setAcadMsg({ text: "Academic info saved!", type: "success" });
    } catch (err) {
      setAcadMsg({ text: err.message || "Failed to save", type: "error" });
    } finally {
      setAcadLoading(false);
    }
  };
  const [pwdForm,   setPwdForm]   = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [editMsg,   setEditMsg]   = useState({ text: "", type: "" });
  const [pwdMsg,    setPwdMsg]    = useState({ text: "", type: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [pwdLoading,  setPwdLoading]  = useState(false);
  const [showDelete,  setShowDelete]  = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMsg({ text: "", type: "" });
    try {
      const res = await fetch(`${API_BASE}/api/profile/me`, {
        method: "PUT",
        headers: authHeader(token),
        body: JSON.stringify({ name: editForm.name, email: editForm.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const updated = { ...user, name: data.name, email: data.email };
      localStorage.setItem("userInfo", JSON.stringify({ ...updated, token }));
      onUserUpdate(updated);
      setEditMsg({ text: "Profile updated successfully!", type: "success" });
    } catch (err) {
      setEditMsg({ text: err.message || "Update failed", type: "error" });
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg({ text: "New passwords do not match", type: "error" });
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdMsg({ text: "Password must be at least 6 characters", type: "error" });
      return;
    }
    setPwdLoading(true);
    setPwdMsg({ text: "", type: "" });
    try {
      const res = await fetch(`${API_BASE}/api/profile/password`, {
        method: "PUT",
        headers: authHeader(token),
        body: JSON.stringify({
          currentPassword: pwdForm.currentPassword,
          newPassword: pwdForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPwdMsg({ text: "Password changed successfully!", type: "success" });
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwdMsg({ text: err.message || "Failed to change password", type: "error" });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await fetch(`${API_BASE}/api/profile/me`, {
        method: "DELETE",
        headers: authHeader(token),
      });
      localStorage.removeItem("userInfo");
      navigate("/login");
    } catch {
      alert("Could not delete account. Please try again.");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-lg font-bold text-slate-800">My Profile</h2>

      {/* Avatar card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
        <div className="w-16 h-16 bg-linear-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-base font-bold text-slate-800">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className="inline-block mt-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 capitalize">
            {user.role || "student"}
          </span>
        </div>
      </div>

      {/* Edit profile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Edit Profile</h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
            <input
              className={INPUT_CLS}
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
            <input
              type="email"
              className={INPUT_CLS}
              value={editForm.email}
              onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          {editMsg.text && (
            <p className={`text-xs rounded-xl px-4 py-3 ${msgClass(editMsg.type)}`}>{editMsg.text}</p>
          )}
          <button
            type="submit"
            disabled={editLoading}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors"
          >
            {editLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Academic Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Academic Info</h3>
        <form onSubmit={handleAcadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
            <input
              type="tel"
              className={INPUT_CLS}
              placeholder="e.g. 9876543210"
              value={acadForm.phone}
              onChange={(e) => setAcadForm((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">University</label>
            <select
              className={INPUT_CLS}
              value={acadForm.universityId}
              onChange={handleUniversityChange}
            >
              <option value="">-- Select University --</option>
              {universities.map((u) => (
                <option key={u._id} value={u._id}>{u.name}{u.shortName ? ` (${u.shortName})` : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
            <select
              className={INPUT_CLS}
              value={acadForm.department}
              onChange={(e) => setAcadForm((p) => ({ ...p, department: e.target.value }))}
              disabled={acadDepts.length === 0}
            >
              <option value="">-- Select Department --</option>
              {acadDepts.map((d) => (
                <option key={d._id} value={d.name}>{d.name}{d.code ? ` (${d.code})` : ""}</option>
              ))}
            </select>
            {acadForm.universityId && acadDepts.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">No departments added for this university yet.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Year</label>
              <select
                className={INPUT_CLS}
                value={acadForm.year}
                onChange={(e) => setAcadForm((p) => ({ ...p, year: e.target.value }))}
              >
                <option value="">-- Year --</option>
                {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Semester</label>
              <select
                className={INPUT_CLS}
                value={acadForm.semester}
                onChange={(e) => setAcadForm((p) => ({ ...p, semester: e.target.value }))}
              >
                <option value="">-- Semester --</option>
                {["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6", "Sem 7", "Sem 8"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          {acadMsg.text && (
            <p className={`text-xs rounded-xl px-4 py-3 ${msgClass(acadMsg.type)}`}>{acadMsg.text}</p>
          )}
          <button
            type="submit"
            disabled={acadLoading}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors"
          >
            {acadLoading ? "Saving..." : "Save Academic Info"}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {[
            { label: "Current Password",     key: "currentPassword" },
            { label: "New Password",          key: "newPassword" },
            { label: "Confirm New Password",  key: "confirmPassword" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
              <input
                type="password"
                className={INPUT_CLS}
                value={pwdForm[key]}
                onChange={(e) => setPwdForm((p) => ({ ...p, [key]: e.target.value }))}
                required
              />
            </div>
          ))}
          {pwdMsg.text && (
            <p className={`text-xs rounded-xl px-4 py-3 ${msgClass(pwdMsg.type)}`}>{pwdMsg.text}</p>
          )}
          <button
            type="submit"
            disabled={pwdLoading}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors"
          >
            {pwdLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-xs text-gray-400 mb-4">Deleting your account is permanent and cannot be undone.</p>
        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl border border-red-200 transition-colors"
          >
            Delete My Account
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDeleteAccount}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setShowDelete(false)}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTab;
