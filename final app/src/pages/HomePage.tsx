import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Page } from "../App";

const CATEGORIES = [
  { label: "Class 9", icon: "9️⃣", color: "bg-purple-100 text-purple-700" },
  { label: "Class 10", icon: "🔟", color: "bg-blue-100 text-blue-700" },
  { label: "Class 11", icon: "1️⃣", color: "bg-green-100 text-green-700" },
  { label: "Class 12", icon: "🎓", color: "bg-orange-100 text-orange-700" },
  { label: "JEE", icon: "⚡", color: "bg-yellow-100 text-yellow-700" },
  { label: "NEET", icon: "🏥", color: "bg-red-100 text-red-700" },
];

interface HomePageProps {
  navigate: (page: Page) => void;
}

export function HomePage({ navigate }: HomePageProps) {
  const profile = useQuery(api.userProfiles.getMyProfile);
  const courses = useQuery(api.courses.listPublished, {}) || [];
  const announcements = useQuery(api.announcements.list) || [];
  const liveClasses = useQuery(api.liveClasses.listUpcoming) || [];

  const featuredCourses = courses.slice(0, 4);

  return (
    <div className="pb-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 pt-5 pb-8">
        <p className="text-blue-200 text-sm mb-1">Good {getGreeting()},</p>
        <h2 className="text-white text-xl font-bold mb-4">
          {profile?.name?.split(" ")[0] || "Student"} 👋
        </h2>
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
          <p className="text-white text-xs font-medium mb-1">🎯 Today's Goal</p>
          <p className="text-white text-sm">Keep learning and stay consistent!</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => navigate({ name: "courses" })}
              className="flex-1 bg-white text-blue-600 text-xs font-bold py-2 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Browse Courses
            </button>
            <button
              onClick={() => navigate({ name: "doubts" })}
              className="flex-1 bg-white/20 text-white text-xs font-bold py-2 rounded-xl hover:bg-white/30 transition-colors"
            >
              Ask Doubt
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-md p-4 grid grid-cols-3 gap-3">
          {[
            { label: "Courses", value: courses.length, icon: "📚" },
            { label: "Students", value: "1000+", icon: "👥" },
            { label: "Teachers", value: "10+", icon: "👨‍🏫" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl mb-0.5">{stat.icon}</div>
              <div className="text-lg font-black text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-800">Categories</h3>
          <button
            onClick={() => navigate({ name: "courses" })}
            className="text-blue-600 text-xs font-semibold"
          >
            See All
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => navigate({ name: "courses", category: cat.label })}
              className={`${cat.color} rounded-xl p-3 text-center hover:opacity-80 transition-opacity`}
            >
              <div className="text-xl mb-1">{cat.icon}</div>
              <div className="text-xs font-bold">{cat.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="px-4 mt-5">
          <h3 className="text-base font-bold text-gray-800 mb-3">📢 Announcements</h3>
          <div className="space-y-2">
            {announcements.slice(0, 3).map((ann) => (
              <div
                key={ann._id}
                className={`rounded-xl p-3 border-l-4 ${
                  ann.isImportant
                    ? "bg-red-50 border-red-500"
                    : "bg-blue-50 border-blue-400"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm">
                    {ann.type === "exam" ? "📝" : ann.type === "result" ? "🏆" : ann.type === "holiday" ? "🎉" : "📌"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{ann.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ann.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(ann.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Classes */}
      {liveClasses.length > 0 && (
        <div className="px-4 mt-5">
          <h3 className="text-base font-bold text-gray-800 mb-3">🔴 Upcoming Live Classes</h3>
          <div className="space-y-2">
            {liveClasses.map((cls) => (
              <div key={cls._id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🎥</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{cls.title}</p>
                    <p className="text-xs text-gray-500">{cls.teacherName}</p>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">
                      {new Date(cls.scheduledAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  {cls.meetingLink && (
                    <a
                      href={cls.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Join
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <div className="px-4 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-800">⭐ Featured Courses</h3>
            <button
              onClick={() => navigate({ name: "courses" })}
              className="text-blue-600 text-xs font-semibold"
            >
              See All
            </button>
          </div>
          <div className="space-y-3">
            {featuredCourses.map((course) => (
              <button
                key={course._id}
                onClick={() => navigate({ name: "course-detail", courseId: course._id })}
                className="w-full bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="flex gap-3 p-3">
                  <div className="w-20 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">📚</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {course.category}
                    </span>
                    <p className="text-sm font-bold text-gray-800 mt-1 line-clamp-1">{course.title}</p>
                    <p className="text-xs text-gray-500">{course.teacherName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {course.discountedPrice ? (
                        <>
                          <span className="text-sm font-black text-blue-600">₹{course.discountedPrice}</span>
                          <span className="text-xs text-gray-400 line-through">₹{course.price}</span>
                        </>
                      ) : (
                        <span className="text-sm font-black text-blue-600">₹{course.price}</span>
                      )}
                      {course.rating && (
                        <span className="text-xs text-yellow-600 font-medium">⭐ {course.rating}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contact */}
      <div className="px-4 mt-5">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-2">📞 Contact Us</h3>
          <p className="text-xs text-gray-500 mb-3">Have questions? Reach out to us!</p>
          <div className="flex gap-2">
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-green-600 transition-colors"
            >
              <span>💬</span> WhatsApp
            </a>
            <a
              href="tel:+919999999999"
              className="flex-1 bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-colors"
            >
              <span>📱</span> Call Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}
</parameter>
