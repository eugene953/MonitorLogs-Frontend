import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uptime',
  standalone: true,
})
export class UptimePipe implements PipeTransform {
  transform(seconds: number): string {
    if (isNaN(seconds) || seconds < 0 || !seconds) return '0m';

    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0 || parts.length === 0) parts.push(`${m}m`);

    return parts.join(' ');
  }
}
