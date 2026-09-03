import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'primeiroNome',
    standalone: true
})
export class PrimeiroNomePipe implements PipeTransform {
    transform(value: string): string {
        if (!value) return '';
        // Pega a primeira palavra antes do espaço
        return value.trim().split(/\s+/)[0];
    }
}
