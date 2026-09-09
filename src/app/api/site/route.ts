import { NextRequest, NextResponse } from 'next/server';
import { SectionService } from '@/services/SectionService';
import { SettingsService } from '@/services/SettingsService';

/**
 * Public content endpoint used by the Redux content store.
 *
 *   GET /api/site?scope=home    -> { sections: home sections, settings }
 *   GET /api/site?scope=global  -> { navbar, footer, settings }
 *
 * Read-only and deliberately unauthenticated — it only returns published
 * content. Writes happen through the protected /api/sections endpoints.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') || 'home';

    const sectionService = new SectionService();
    const settingsService = new SettingsService();

    const settingsList = await settingsService.getAllSettings();
    const settingsMap: Record<string, string> = {};
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    if (scope === 'global') {
      const [navbar, footer] = await Promise.all([
        sectionService.getSectionByPageAndType('global', 'navbar'),
        sectionService.getSectionByPageAndType('global', 'footer'),
      ]);
      return NextResponse.json({
        success: true,
        data: { navbar, footer, settings: settingsMap },
      });
    }

    const sections = await sectionService.getAllSections({ pageSlug: 'home', isActive: true } as any);
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
