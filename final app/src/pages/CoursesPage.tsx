import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Page } from "../App";

const CATEGORIES = ["All", "Class 9", "Class 10", "Class 11", "Class 12", "JEE", "NEET"];

interface CoursesPageProps {
  navigate: (page: Page) => void;
  category?: string;
}

export function CoursesPage({ navigate, category }: CoursesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState(category || "All");
  const [search, setSearch] = useState("");

  const courses = useQuery(
    api.courses.listPublished,
    selectedCategory === "All" ? {} : { category: selectedCategory }
  ) || [];

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 py-4">
      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-gray-50"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Course Count */}
      <p className="text-xs text-gray-400 mb-3">{filtered.length} courses found</p>

      {/* Courses Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📚</div>
          <p className="text-gray-500 font-medium">No courses found</p>
          <p className="text-gray-400 text-sm mt-1">Try a different category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((course) => (
            <button
              key={course._id}
              onClick={() => navigate({ name: "course-detail", courseId: course._id })}
              className="w-full bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="h-36 bg-gradient-to-br from-blue-400 to-indigo-600 relative overflow-hidden">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl">📚</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="bg-white/90 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {course.category}
                  </span>
                </div>
                {course.discountedPrice && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {Math.round(((course.price - course.discountedPrice) / course.price) * 100)}% OFF
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{course.title}</h3>
                <p className="text-xs text-gray-500 mt-1">👨‍🏫 {course.teacherName}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    {course.discountedPrice ? (
                      <>
                        <span className="text-base font-black text-blue-600">₹{course.discountedPrice}</span>
                        <span className="text-xs text-gray-400 line-through">₹{course.price}</span>
                      </>
                    ) : (
                      <span className="text-base font-black text-blue-600">₹{course.price}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {course.rating && <span>⭐ {course.rating}</span>}
                    <span>📹 {course.totalLectures} lectures</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
</parameter>
