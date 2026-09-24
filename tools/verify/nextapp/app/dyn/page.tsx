import { cookies } from 'next/headers';
export default async function Page() { const c = await cookies(); return <p>theme {c.get('theme')?.value ?? 'none'}</p>; }
