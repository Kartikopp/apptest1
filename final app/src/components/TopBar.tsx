import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Page } from "../App";

interface TopBarProps {
  page: Page;
  navigate: (page: Page) => void;
  profile: { name: string; role: string };
}

const pageTitles: Record<string, string> = {
  home: "Gupta Classes",
  courses: "Courses",
  "course-detail": "Course Details",
  "video-player": "Video Lecture",
  profile: "My Profile",
  admin: "Admin Panel",
  doubts: "My Doubts",
  notifications: "Notifications",
};

export function TopBar({ page, navigate, profile }: TopBarProps) {
  const notifications = useQuery(api.notifications.listMine) || [];
  const unread = notifications.filter((n) => !n.isRead).length;

  const canGoBack = page.name !== "home";

  const getBack = () => {
    if (page.name === "course-detail") navigate({ name: "courses" });
    else if (page.name === "video-player") navigate({ name: "course-detail", courseId: page.courseId });
    else navigate({ name: "home" });
  };

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          {canGoBack ? (
            <button onClick={getBack} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">GC</span>
            </div>
          )}
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              {pageTitles[page.name] || "Gupta Classes"}
            </h1>
            {page.name === "home" && (
              <p className="text-xs text-gray-400">Meerut, UP</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ name: "notifications" })}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
</parameter>
