'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const Header = () => {
  const pathname = usePathname();
  return (
    <header>
      <div className="inner">
        <Link href="/">
          <Image src="/logo.svg" alt="CryptoLens logo" width={300} height={100} />
        </Link>

        <nav>
          <Link
            href="/"
            className={cn('nav-link', 'is-home', {
              'is-active': pathname === '/',
            })}
          >
            Home
          </Link>
          {/* <p>Search Modal</p> */}
          <Link
            href="/coins"
            className={cn('nav-link', {
              'is-active': pathname === '/coins',
            })}
          >
            All Coins
          </Link>
        </nav>
      </div>
    </header>
  );
};
export default Header;
