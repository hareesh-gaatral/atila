import { NextRequest, NextResponse } from 'next/server';
import { SectionService } from '@/services/SectionService';
import { SettingsService } from '@/services/SettingsService';
import { CMS_SECTION_DEFAULTS } from '@/lib/cmsDefaults';
import settingsData from '@/data/settings.json';

/**
 * Public content endpoint used by the Redux content store.
 *
 *   GET /api/site?scope=home    -> { sections: home sections, settings }
 *   GET /api/site?scope=global  -> { navbar, footer, settings }
 *
 * Returns fallback JSON data when MongoDB is unreachable so the site still
 * renders (images, navbar, footer, etc.) instead of a 500 error page.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') || 'home';

    const sectionService = new SectionService();
    const settingsService = new SettingsService();

    let settingsMap: Record<string, string> = { ...settingsData };
    let sections: any[] = [];
    let navbar: any = CMS_SECTION_DEFAULTS.navbar;
    let footer: any = CMS_SECTION_DEFAULTS.footer;

    try {
      const settingsList = await settingsService.getAllSettings();
      if (Array.isArray(settingsList)) {
        settingsList.forEach((s: any) => {
          if (s && s.key && s.value !== undefined) {
            settingsMap[s.key] = s.value;
          }
        });
      }
    } catch {
      // DB unavailable — keep JSON defaults.
    }

    if (scope === 'global') {
      try {
        const [dbNavbar, dbFooter] = await Promise.all([
          sectionService.getSectionByPageAndType('global', 'navbar'),
          sectionService.getSectionByPageAndType('global', 'footer'),
        ]);
        if (dbNavbar) navbar = dbNavbar;
        if (dbFooter) footer = dbFooter;
      } catch {
        // DB unavailable — use JSON defaults.
      }
      return NextResponse.json({
        success: true,
        data: { navbar, footer, settings: settingsMap },
      });
    }

    // Home scope
    try {
      const dbSections = await sectionService.getAllSections({ pageSlug: 'home', isActive: true } as any);
      if (Array.isArray(dbSections) && dbSections.length > 0) {
        sections = dbSections;
      }
    } catch {
      // DB unavailable — build section list from JSON defaults.
    }

    if (sections.length === 0) {
      const defaultTypes = ['hero', 'about', 'services', 'features', 'testimonials', 'faq', 'cta', 'contact'];
      sections = defaultTypes.map((type) => ({
        sectionType: type,
        ...(CMS_SECTION_DEFAULTS[type] || {}),
      }));
    }

    return NextResponse.json({
      success: true,
      data: { sections, settings: settingsMap },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load site content' },
      { status: 500 }
    );
  }
}
