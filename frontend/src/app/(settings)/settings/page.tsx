import { redirect } from 'next/navigation';

/** /settings has no page of its own — send people to the first section. */
export default function SettingsIndexPage() {
  redirect('/settings/profile');
}
