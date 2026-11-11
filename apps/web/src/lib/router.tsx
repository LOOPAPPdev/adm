'use client';
/**
 * Router adapter: the LOOP screens were written for react-router (hash routes). This module gives them the same
 * small API on top of the Next.js App Router, so the screens keep their code and the URLs become real paths.
 * Only the pieces the screens use are implemented: Link, NavLink, useParams, useNavigate, useLocation.
 */
import NextLink from 'next/link';
import { useParams as useNextParams, usePathname, useRouter } from 'next/navigation';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string; replace?: boolean };

export function Link({ to, replace, ...rest }: LinkProps) {
  return <NextLink href={to} replace={replace} {...rest} />;
}

type NavClass = string | ((s: { isActive: boolean }) => string | undefined | false);
export function NavLink({ to, end, className, children, ...rest }: Omit<LinkProps, 'className'> & { end?: boolean; className?: NavClass; children?: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const isActive = end || to === '/' ? pathname === to : pathname === to || pathname.startsWith(to + '/');
  const cls = typeof className === 'function' ? className({ isActive }) || undefined : className;
  return <NextLink href={to} className={cls} aria-current={isActive ? 'page' : undefined} {...rest}>{children}</NextLink>;
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T {
  const p = useNextParams() ?? {};
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(p)) out[k] = Array.isArray(v) ? v.join('/') : v;
  return out as T;
}

export function useNavigate() {
  const router = useRouter();
  return (to: string, opts?: { replace?: boolean }) => (opts?.replace ? router.replace(to) : router.push(to));
}

export function useLocation() {
  return { pathname: usePathname() ?? '/' };
}
