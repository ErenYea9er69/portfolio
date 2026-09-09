import { MetadataRoute } from 'next';
import { DATA } from "@/data/resume";
import fs from 'fs';
import path from 'path';

const baseUrl = DATA.url;
export const revalidate = 86400; // Revalidate once per day

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get file modification dates for static pages
  const getFileModDate = (filePath: string) => {
    try {
      const stats = fs.statSync(path.join(process.cwd(), filePath));
      return new Date(stats.mtime);
    } catch (e) {
      return new Date();
    }
  };

  // Static routes with actual file modification dates
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: getFileModDate('src/app/page.tsx'),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cli`,
      lastModified: getFileModDate('src/app/cli/page.tsx'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  return routes;
}
