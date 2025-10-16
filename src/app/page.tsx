'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (hasVisited) {
      router.push('/note/new');
    } else {
      localStorage.setItem('hasVisited', 'true');
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-4xl font-bold mb-4">Notly</h1>
      <p className="text-lg text-muted-foreground mb-8">A simple and powerful note-taking app.</p>
      <Link href="/note/new">
        <button className="bg-primary text-primary-foreground px-6 py-2 rounded-md">
          Create a new note
        </button>
      </Link>
    </div>
  );
}
