from datetime import date, timedelta
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('sync_github',Path(__file__).resolve().parents[1]/'scripts/sync_github.py')
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)

def fixture(count=2):
    start = date(2025,10,19)
    cells = []
    for index in range(367):
        day = start + timedelta(days=index)
        value = count if index==366 else 0
        level = 4 if value else 0
        label = f'{value} contributions' if value else 'No contributions'
        cells.append(f'<td id="day-{index}" data-date="{day.isoformat()}" data-level="{level}"></td><tool-tip for="day-{index}">{label} on a date.</tool-tip>')
    return f'<h2>{count} contributions in the last year</h2>'+''.join(cells)

class CalendarTests(unittest.TestCase):
    def test_verified_counts_and_dates_survive_parsing(self):
        days = sync.parse_calendar(fixture())
        self.assertEqual(len(days),367)
        self.assertEqual(sum(day['count'] for day in days),2)
        self.assertEqual(days[-1]['date'],'2026-10-20')
    def test_incorrect_summary_is_rejected(self):
        with self.assertRaises(ValueError):
            sync.parse_calendar(fixture().replace('<h2>2 contributions','<h2>9 contributions'))
    def test_upstream_markup_changes_fail_closed(self):
        with self.assertRaises(ValueError):
            sync.parse_calendar(fixture().replace('No contributions on','Unknown activity on',1))
    def test_duplicate_dates_are_rejected(self):
        with self.assertRaises(ValueError):
            sync.parse_calendar(fixture().replace('2025-10-20','2025-10-19'))

if __name__ == '__main__': unittest.main()
