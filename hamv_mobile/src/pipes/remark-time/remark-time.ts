import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'remarkTime'
})
export class RemarkTime implements PipeTransform {
    public transform(value: string, args?: any[]): string {
        if (!value.match(/^\d{1,2}:\d{2}$/)) return '';
        let tt = value.split(':');
        if ((+tt[0]) >= 12) {
            let t: string = (+tt[0]) > 12 ? '' + (+tt[0] - 12) : '' + tt[0];
            t = t.length > 1 ? t : '0' + t;
            const hour = +t < 10 ? t.slice(1) : t;
            return hour + ':' + tt[1] + ' ' + 'PM';
        } else {
            const hour = (+tt[0]) < 10 ? tt[0].slice(1) : tt[0];
            return hour + ':' + tt[1] + ' ' + 'AM';
        }
    }
}
