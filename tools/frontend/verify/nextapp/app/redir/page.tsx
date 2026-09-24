import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
export default async function Page() {
  await cookies();
  try { redirect('/'); } catch (e) { return <p>caught {(e as Error).message}</p>; }
}
