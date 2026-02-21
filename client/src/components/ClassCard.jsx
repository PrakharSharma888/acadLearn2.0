import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Theme by category ─────────────────────────────────────────────────────────
const THEME = {
  junior: {
    iconBg:       "bg-orange-50 text-orange-500",
    currBg:       "bg-gray-50 hover:bg-gray-100",
    currNum:      "bg-orange-100 text-orange-600",
    btnPrimary:   "bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white",
    btnSecondary: "border-2 border-orange-500 text-orange-600 hover:bg-orange-50 active:bg-orange-100",
  },
  professional: {
    iconBg:       "bg-blue-50 text-blue-600",
    currBg:       "bg-gray-50 hover:bg-gray-100",
    currNum:      "bg-blue-100 text-blue-600",
    btnPrimary:   "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white",
    btnSecondary: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100",
  },
};

// ── Grade icons ───────────────────────────────────────────────────────────────
const GRADE_ICONS = {
  3: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21a12.083 12.083 0 01-6.16-10.422L12 14z"/></svg>,
  4: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
  5: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>,
  6: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>,
  7: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,
  8: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>,
  9: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>,
};

const DEFAULT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
  </svg>
);

const ClassCard = ({ cls, onBookDemo }) => {
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const navigate = useNavigate();

  const t = THEME[cls.category] || THEME.professional;

  const gradeMatch = cls.title?.match(/\b(\d)\b/);
  const gradeNum   = gradeMatch ? parseInt(gradeMatch[1]) : null;
  const icon       = GRADE_ICONS[gradeNum] || DEFAULT_ICON;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">

      {/* Icon + title */}
      <div className="flex flex-col items-center pt-7 pb-4 px-5">
        <div className={`w-16 h-16 rounded-2xl ${t.iconBg} flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-800 text-center leading-snug">{cls.title}</h3>
        {cls.subtitle && (
          <p className="text-xs text-gray-400 text-center mt-1 line-clamp-1">{cls.subtitle}</p>
        )}
      </div>

      {/* Curriculum accordion — subjects → lessons (falls back to flat curriculum) */}
      {(cls.subjects?.length > 0 || cls.curriculum?.length > 0) && (
        <div className="mx-5 mb-3 border border-gray-100 rounded-xl overflow-hidden">
          <button
            onClick={() => setCurriculumOpen((o) => !o)}
            className={`w-full flex justify-between items-center px-3 py-2.5 text-xs font-semibold text-slate-600 ${t.currBg} transition-colors`}
          >
            {cls.subjects?.length > 0 ? (
              <span>
                {cls.subjects.length} subject{cls.subjects.length !== 1 ? "s" : ""} ·{" "}
                {cls.subjects.reduce((n, s) => n + (s.lessons?.length || 0), 0)} lessons
              </span>
            ) : (
              <span>Curriculum ({cls.curriculum.length} topics)</span>
            )}
            <ChevronIcon open={curriculumOpen} />
          </button>

          {curriculumOpen && (
            <div className="bg-white max-h-52 overflow-y-auto">
              {cls.subjects?.length > 0 ? (
                cls.subjects.map((subject, si) => (
                  <div key={si}>
                    {/* Subject heading */}
                    <div className={`flex items-center gap-2 px-3 py-2 ${t.currBg} border-t border-gray-50`}>
                      <span className={`w-4 h-4 rounded-full ${t.currNum} text-[8px] font-bold flex items-center justify-center shrink-0`}>
                        {si + 1}
                      </span>
                      <p className="text-[10px] font-bold text-slate-700 leading-snug">{subject.title}</p>
                    </div>
                    {/* Lessons */}
                    {subject.lessons?.map((lesson, li) => (
                      <div key={li} className="flex items-start gap-2 px-3 py-2 pl-8 border-t border-gray-50">
                        <span className="text-[9px] text-gray-400 font-semibold shrink-0 mt-0.5">{li + 1}.</span>
                        <p className="text-xs text-slate-500 leading-snug">{lesson.title}</p>
                        {lesson.duration && (
                          <span className="ml-auto text-[9px] text-gray-400 shrink-0">{lesson.duration}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <ul className="divide-y divide-gray-50">
                  {cls.curriculum.map((lesson, i) => (
                    <li key={i} className="flex items-start gap-2 px-3 py-2.5">
                      <span className={`mt-0.5 w-4 h-4 rounded-full ${t.currNum} text-[9px] font-bold flex items-center justify-center shrink-0`}>
                        {i + 1}
                      </span>
                      <p className="text-xs text-slate-600 leading-snug">{lesson.title}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Price tag */}
      {cls.price > 0 && (
        <div className="mx-5 mb-3 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">Course fee</span>
          <span className="text-base font-black text-slate-800">₹{cls.price.toLocaleString("en-IN")}</span>
        </div>
      )}

      {/* CTAs */}
      <div className="mt-auto px-5 pb-5 flex flex-col gap-2.5">
        {cls.price > 0 ? (
          <button
            onClick={() => navigate(`/checkout/${cls._id}`)}
            className={`w-full py-2.5 ${t.btnPrimary} text-xs font-bold rounded-xl uppercase tracking-wide transition-colors`}
          >
            Buy Now — ₹{cls.price.toLocaleString("en-IN")}
          </button>
        ) : (
          <button
            onClick={() => navigate(`/apply/${cls._id}`)}
            className={`w-full py-2.5 ${t.btnPrimary} text-xs font-bold rounded-xl uppercase tracking-wide transition-colors`}
          >
            Apply for Full Course
          </button>
        )}
        <button
          onClick={() => onBookDemo(cls)}
          className={`w-full py-2.5 ${t.btnSecondary} text-xs font-bold rounded-xl uppercase tracking-wide transition-colors`}
        >
          Book Free Demo
        </button>
      </div>
    </div>
  );
};

export default ClassCard;
