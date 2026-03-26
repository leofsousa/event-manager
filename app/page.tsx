import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="">
      <Link href="/login">
        <button>Login</button>
      </Link>
    </main>
  );
}
