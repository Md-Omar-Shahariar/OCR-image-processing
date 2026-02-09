"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
) {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      checkAuthentication();
    }, []);

    const checkAuthentication = () => {
      const authStatus = sessionStorage.getItem("Access");
      if (authStatus === "Authenticated") {
        setIsAuthenticated(true);
      } else {
        // Redirect to home if not authenticated
        router.push("/");
      }
      setIsChecking(false);
    };

    if (isChecking) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-lg">Verifying access...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
