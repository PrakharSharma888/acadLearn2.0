import ClassCard from "../components/ClassCard";

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const CATEGORIES = [
  { key: "junior",       label: "Junior" },
  { key: "professional", label: "Professional" },
  { key: "all",          label: "All" },
];

const ClassesTab = ({ classes, loading, error, activeCategory, setActiveCategory, onBookDemo }) => (
  <div>
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <h2 className="text-lg font-bold text-slate-800">Explore Classes</h2>
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              activeCategory === cat.key
                ? "bg-white text-orange-600 shadow-sm"
                : "text-gray-500 hover:text-slate-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>

    {loading && (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <Skeleton className="w-16 h-16 mx-auto rounded-2xl" />
            <Skeleton className="h-4 w-2/3 mx-auto" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    )}

    {!loading && error && (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <p className="text-red-600 font-semibold mb-3">{error}</p>
      </div>
    )}

    {!loading && !error && classes.length === 0 && (
      <div className="bg-white border border-gray-100 rounded-2xl p-14 text-center shadow-sm">
        <p className="text-gray-400 text-sm">No classes found for this category.</p>
      </div>
    )}

    {!loading && !error && classes.length > 0 && (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {classes.map((cls) => (
          <ClassCard key={cls._id} cls={cls} onBookDemo={onBookDemo} />
        ))}
      </div>
    )}
  </div>
);

export default ClassesTab;
