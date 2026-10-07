import type * as ExcelJS from 'exceljs';
import type { TreeHistoryRow } from '../../modules/planting-units/planting-units.service';
import { formatTreeAge } from './tree-age.util';

const EVENT_LABELS: Record<string, string> = {
  PLANTED: 'Planted',
  REPLACEMENT: 'Replacement planted',
  MEASUREMENT: 'Measurement',
  PHOTO: 'Photo',
  DEAD: 'Dead',
  LOST: 'Lost',
  REPLACED: 'Replaced',
};

/**
 * "Tree History" sheet: one row per event per tree — planting, each later
 * measurement, photos, and dead/lost/replaced — with the tree's age at that
 * event, so growth can be read (and charted) at 6 months, 1 year, 3 years…
 */
export function addTreeHistorySheet(workbook: ExcelJS.Workbook, rows: TreeHistoryRow[]): void {
  const sheet = workbook.addWorksheet('Tree History');
  sheet.columns = [
    { header: 'Plot ID', key: 'plotId', width: 16 },
    { header: 'Tree ID', key: 'treeId', width: 18 },
    { header: 'Species', key: 'species', width: 18 },
    { header: 'Current Status', key: 'currentStatus', width: 14 },
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Tree Age', key: 'age', width: 12 },
    { header: 'Event', key: 'event', width: 20 },
    { header: 'Details', key: 'details', width: 50 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  if (rows.length === 0) {
    sheet.addRow({ plotId: 'No trees recorded yet' });
    return;
  }
  for (const row of rows) {
    sheet.addRow({
      plotId: row.plotId,
      treeId: row.treeId,
      species: row.species,
      currentStatus: row.currentStatus,
      date: new Date(row.date).toLocaleDateString('en-IN'),
      age: formatTreeAge(row.plantingDate, row.date),
      event: EVENT_LABELS[row.type] ?? row.type,
      details: row.description,
    });
  }
}
