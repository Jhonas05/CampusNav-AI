import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import MobileTabBar from './MobileTabBar';
import Navbar from './Navbar';
import SchoolLogo from '@/components/campus/SchoolLogo';
import { focusRing } from '@/components/campus/ui';

const footerColumns = [
  {
    title: 'Explore',
    links: [
      { label: 'Home', path: '/' },
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Facilities', path: '/facilities' },
      { label: 'Navigate', path: '/map' },
    ],
  },
  {
    title: 'Assistance',
    links: [
      { label: 'CLARA', path: '/clara' },
      { label: 'Events', path: '/events' },
      { label: 'Alerts & Announcements', path: '/alerts' },
      { label: 'Emergency', path: '/emergency' },
    ],
  },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-white text-[#1D1D1F]">
      <a
        href="#campusnav-main"
        className={`sr-only z-[80] rounded-full bg-[#1D1D1F] px-5 py-2.5 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 ${focusRing}`}
      >
        Skip to content
      </a>
      <Navbar />
      <div className="pb-[calc(64px+env(safe-area-inset-bottom))] lg:pb-0">
        <main id="campusnav-main">
          <Outlet />
        </main>
        <footer className="border-t border-[#E5E5E7] bg-white">
          <div className="mx-auto max-w-7xl px-6 py-14">
            <div className="flex flex-col justify-between gap-10 md:flex-row">
              <div className="max-w-sm">
                <div className="flex items-center gap-3">
                  <SchoolLogo size="md" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#86868B]">St. Clare College of Caloocan</p>
                    <p className="mt-1 text-xl font-semibold tracking-tight text-brand-800">CampusNav</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#6E6E73]">
                  Smart campus navigation, facility information, and digital campus assistance in one place.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-10 sm:gap-16">
                {footerColumns.map((column) => (
                  <nav key={column.title} aria-label={`Footer ${column.title}`}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86868B]">{column.title}</p>
                    <ul className="mt-4 space-y-2.5">
                      {column.links.map((link) => (
                        <li key={link.path}>
                          <Link to={link.path} className={`rounded-md text-sm text-[#6E6E73] transition-colors duration-200 hover:text-brand-700 ${focusRing}`}>
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ))}
              </div>
            </div>
            <div className="mt-12 flex flex-col gap-2 border-t border-[#E5E5E7] pt-6 text-xs text-[#86868B] sm:flex-row sm:items-center sm:justify-between">
              <p>CampusNav AI · St. Clare College</p>
              <p>Independent campus navigation system</p>
            </div>
          </div>
        </footer>
      </div>
      <MobileTabBar />
    </div>
  );
}
