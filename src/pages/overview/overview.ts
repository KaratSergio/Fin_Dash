import { Component, signal } from '@angular/core';

@Component({
    selector: 'app-overview',
    templateUrl: './overview.html',
    styleUrls: ['./overview.scss']
})
export class Overview {
    count = signal(0);

    increment() {
        this.count.set(this.count() + 1);
    }
}
