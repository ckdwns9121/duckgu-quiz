'use client';
export default function Page() { return <p>pub={process.env.NEXT_PUBLIC_A ?? 'undef'} secret={process.env.SECRET_B ?? 'undef'}</p>; }
