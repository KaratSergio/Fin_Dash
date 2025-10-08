import { Pipe, PipeTransform } from '@angular/core';
import { formatDateForApi } from '@src/core/utils/date';

@Pipe({ name: 'formatDate' })
export class FormatDatePipe implements PipeTransform {
    transform(value: string | undefined): string {
        if (!value) return '';
        return formatDateForApi(value);
    }
}
