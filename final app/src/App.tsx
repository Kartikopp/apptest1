import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { HomePage } from "./pages/HomePage";
import { CoursesPage } from "./pages/CoursesPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { VideoPlayerPage } from "./pages/VideoPlayerPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminPage } from "./pages/AdminPage";
import { DoubtsPage } from "./pages/DoubtsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { BottomNav } from "./components/BottomNav";
import { TopBar } from "./components/TopBar";
import { SetupProfile } from "./components/SetupProfile";
import { Id } from "../convex/_generated/dataModel";

export type Page =
  | { name: "home" }
  | { name: "courses"; category?: string }
  | { name: "course-detail"; courseId: Id<"courses"> }
  | { name: "video-player"; courseId: Id<"courses">; lectureId: Id<"lectures"> }
  | { name: "profile" }
  | { name: "admin" }
  | { name: "doubts" }
  | { name: "notifications" };

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Unauthenticated>
        <LandingPage />
      </Unauthenticated>
      <Authenticated>
        <MainApp />
      </Authenticated>
      <Toaster position="top-center" />
    </div>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 text-center">
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <span className="text-4xl font-black text-blue-600">GC</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-1">Gupta Classes</h1>
          <p className="text-blue-200 text-sm font-medium">Meerut, Uttar Pradesh</p>
        </div>
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1 text-center">Welcome Back!</h2>
          <p className="text-gray-500 text-sm text-center mb-6">Sign in to continue learning</p>
          <SignInForm />
        </div>
        <div className="mt-8 text-center">
          <p className="text-blue-200 text-xs">Trusted by 1000+ students in Meerut</p>
          <div className="flex justify-center gap-6 mt-3">
            {["Class 9-12", "JEE/NEET", "Live Classes"].map((t) => (
              <span key={t} className="text-white text-xs bg-white/20 px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const profile = useQuery(api.userProfiles.getMyProfile);
  const [page, setPage] = useState<Page>({ name: "home" });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  if (profile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-black text-white">GC</span>
          </div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <SetupProfile />;
  }

  const renderPage = () => {
    switch (page.name) {
      case "home":
        return <HomePage navigate={setPage} />;
      case "courses":
        return <CoursesPage navigate={setPage} category={page.category} />;
      case "course-detail":
        return <CourseDetailPage navigate={setPage} courseId={page.courseId} />;
      case "video-player":
        return (
          <VideoPlayerPage
            navigate={setPage}
            courseId={page.courseId}
            lectureId={page.lectureId}
          />
        );
      case "profile":
        return <ProfilePage navigate={setPage} />;
      case "admin":
        return profile.role === "admin" ? (
          <AdminPage navigate={setPage} />
        ) : (
          <HomePage navigate={setPage} />
        );
      case "doubts":
        return <DoubtsPage navigate={setPage} />;
      case "notifications":
        return <NotificationsPage navigate={setPage} />;
      default:
        return <HomePage navigate={setPage} />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-xl">
      <TopBar page={page} navigate={setPage} profile={profile} />
      <div className="pb-20">{renderPage()}</div>
      <BottomNav page={page} navigate={setPage} isAdmin={profile.role === "admin"} />
    </div>
  );
}
</parameter>
