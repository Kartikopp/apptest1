import { Page } from "../App";

interface BottomNavProps {
  page: Page;
  navigate: (page: Page) => void;
  isAdmin: boolean;
}

export function BottomNav({ page, navigate, isAdmin }: BottomNavProps) {
  const items = [
    {
      name: "home" as const,
      label: "Home",
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 ${active ? "text-blue-600" : "text-gray-400"}`} fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "courses" as const,
      label: "Courses",
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 ${active ? "text-blue-600" : "text-gray-400"}`} fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      name: "doubts" as const,
      label: "Doubts",
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 ${active ? "text-blue-600" : "text-gray-400"}`} fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    ...(isAdmin
      ? [
          {
            name: "admin" as const,
            label: "Admin",
            icon: (active: boolean) => (
              <svg className={`w-5 h-5 ${active ? "text-blue-600" : "text-gray-400"}`} fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
          },
        ]
      : []),
    {
      name: "profile" as const,
      label: "Profile",
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 ${active ? "text-blue-600" : "text-gray-400"}`} fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const active = page.name === item.name;
          return (
            <button
              key={item.name}
              onClick={() => navigate({ name: item.name })}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                active ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              {item.icon(active)}
              <span className={`text-xs font-medium ${active ? "text-blue-600" : "text-gray-400"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
</parameter>
