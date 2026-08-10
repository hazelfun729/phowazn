import Papa from 'papaparse';

export interface NameEntry {
  name: string;
  date: string; // YYYY-MM-DD
}

export interface SiteData {
  updatedAt: string; // ISO datetime
  deceased: NameEntry[]; // 亡者
  infants: NameEntry[]; // 堕胎婴灵
  animals: NameEntry[]; // 旁生
}

// CSV row indices (0-based)
const COL_DATE = 4; // 往生日期
const COL_CATEGORY = 5; // 分类
const COL_DECEASED = 6; // 亡者姓名
const COL_INFANTS = 7; // 堕胎婴灵姓名
const COL_ANIMALS = 8; // 旁生姓名

export function parseCSV(csvText: string): SiteData {
  const result = Papa.parse<string[]>(csvText, {
    skipEmptyLines: true,
    header: false,
  });

  const deceased: NameEntry[] = [];
  const infants: NameEntry[] = [];
  const animals: NameEntry[] = [];

  // Skip header row
  const rows = result.data.slice(1);

  for (const row of rows) {
    if (!row || row.length < 9) continue;

    const date = (row[COL_DATE] || '').trim();
    const category = (row[COL_CATEGORY] || '').trim();
    const deceasedName = (row[COL_DECEASED] || '').trim().replace(/亡者|姓名/g, '');
    const infantName = (row[COL_INFANTS] || '').trim().replace(/亡者|姓名/g, '');
    const animalName = (row[COL_ANIMALS] || '').trim().replace(/亡者|姓名/g, '');

    if (!date) continue;

    if (category === 'A.亡者' && deceasedName) {
      deceased.push({ name: deceasedName, date });
    } else if (category === 'B.堕胎婴灵' && infantName) {
      infants.push({ name: infantName, date });
    } else if (category === 'C.旁生' && animalName) {
      animals.push({ name: animalName, date });
    }
  }

  return {
    updatedAt: new Date().toISOString(),
    deceased,
    infants,
    animals,
  };
}

/**
 * Filter entries within 49 days from upload date, deduplicate by name, sort by date descending
 */
export function filterAndDedup(
  entries: NameEntry[],
  uploadDate: Date
): NameEntry[] {
  const cutoff = new Date(uploadDate);
  cutoff.setDate(cutoff.getDate() - 49);

  const seen = new Set<string>();
  const result: NameEntry[] = [];

  // Sort by date descending first
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const entry of sorted) {
    const entryDate = new Date(entry.date);
    if (entryDate < cutoff) continue;
    if (seen.has(entry.name)) continue;
    seen.add(entry.name);
    result.push(entry);
  }

  return result;
}
