import React, { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const TAB_ORDER = [
  'dashboard',
  'debts',
  'savings',
  'deposits',
  'vouchers',
  'salary-slips',
  'employee-finance',
  'my-finance',
  'absensi',
  'team',
  'sop',
] as const;

type Tab = (typeof TAB_ORDER)[number];

interface PageTransitionProps {
  activeTab: string;
  children: React.ReactNode;
}

const SLIDE = 44;

const variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? SLIDE : -SLIDE,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -SLIDE : SLIDE,
    opacity: 0,
  }),
};

const transition = {
  duration: 0.21,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
};

export function PageTransition({ activeTab, children }: PageTransitionProps) {
  const prevTabRef = useRef<string>(activeTab);
  const prevIdx = TAB_ORDER.indexOf(prevTabRef.current as Tab);
  const currIdx = TAB_ORDER.indexOf(activeTab as Tab);
  const direction = currIdx >= prevIdx ? 1 : -1;

  React.useEffect(() => {
    prevTabRef.current = activeTab;
  }, [activeTab]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={activeTab}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          style={{ willChange: 'transform, opacity' }}
          className="absolute inset-0 overflow-y-auto overflow-x-hidden no-scrollbar scroll-smooth pb-24"
        >
          {children}
          <div className="px-5 py-6 text-center">
            <p className="text-[9px] text-white/60 font-black uppercase tracking-[0.4em] opacity-30">
              AlfathPulsa v2.0
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
