import { redirect } from 'next/navigation';

// Vendor Management is now part of the shared /services/[slug] detail pages.
// Keep the old URL working so existing links and bookmarks don't break.
export default function VendorManagementRedirect() {
  redirect('/services/vendor-management');
}
