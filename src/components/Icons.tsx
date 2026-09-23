import { createVNode } from '../lib';

const HEART = 'M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z';

export const HeartIcon = () => <svg viewBox="0 0 24 24"><path fill="currentColor" d={HEART} /></svg>;
export const FireIcon = () => (
  <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c1 4-2 5-2 8 0 1.5 1 2.5 2 2.5s2-1 2-2.5c2 1.5 3 3.5 3 6A5 5 0 0 1 12 21a5 5 0 0 1-5-5c0-4 3-6 3-9 0-2 1-4 2-5z" /></svg>
);
export const BoltIcon = () => <svg viewBox="0 0 24 24"><path fill="currentColor" d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>;
export const StarIcon = () => (
  <svg viewBox="0 0 24 24"><path fill="currentColor" d="m12 2 3 6.5 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21l1.5-7L2 9.3l7-.8z" /></svg>
);
export const CheckIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M5 12.5 10 17 19 7" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
);
export const LockIcon = () => (
  <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h6V8a3 3 0 0 0-6 0z" /></svg>
);
export const TrophyIcon = () => (
  <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 3h10v2h3v3a4 4 0 0 1-4 4 5 5 0 0 1-3 2.8V18h3v3H8v-3h3v-3.2A5 5 0 0 1 8 12a4 4 0 0 1-4-4V5h3zm0 4H6v1a2 2 0 0 0 1 1.7zm10 0v2.7A2 2 0 0 0 18 8V7z" /></svg>
);
export const CloseIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round" /></svg>
);
export const SoundIcon = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M4 9h4l5-4v14l-5-4H4z" />
    {on
      ? <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      : <path d="m16 9 5 6m0-6-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />}
  </svg>
);
export const BulbIcon = () => (
  <svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 21h6v-1.5H9zm3-19a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2z" /></svg>
);
