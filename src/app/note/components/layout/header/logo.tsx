import Image from 'next/image';
import Link from 'next/link';

export function Logo() {
  return (
    <>
      <Link href="/note/new">
        <Image src={'/logo.png'} alt="Notly" width={40} height={40} />
      </Link>
    </>
  );
}
