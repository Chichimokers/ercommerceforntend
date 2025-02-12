import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") return <div>Loading...</div>;

    if (status === "unauthenticated" || session?.error) {
        router.push("/?modal=login");
        return null;
    }

    return children;
} 