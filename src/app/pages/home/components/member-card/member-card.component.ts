import { User } from './../../../../services/data-types/user.type';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.less']
})
export class MemberCardComponent implements OnInit {

  @Input() user: User;
  @Input() point: number;
  @Input() showPoint = false;
  @Output() openModal = new EventEmitter<void>();
  @Output() signin = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
    console.log('point', this.point);
    console.log('showPoint', this.showPoint);
  }

}
