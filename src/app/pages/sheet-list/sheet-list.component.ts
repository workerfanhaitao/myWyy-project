import { BatchActionsService } from './../../store/batch-actions.service';
import { SheetService } from './../../services/sheet.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SheetParams, SheetList } from './../../services/data-types/common.types';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sheet-list',
  templateUrl: './sheet-list.component.html',
  styleUrls: ['./sheet-list.component.less']
})
export class SheetListComponent implements OnInit {

  listParams: SheetParams = {
    cat: '全部',
    order: 'hot',
    offset: 1,
    limit: 30
  };
  sheets: SheetList;
  orderValue = 'hot';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sheetService: SheetService,
    private batchActionsService: BatchActionsService
  ) {
    this.listParams.cat = this.route.snapshot.queryParamMap.get('cat') || '全部';
    this.getList();
  }

  ngOnInit(): void {
  }

  private getList() {
    this.sheetService.getSheets(this.listParams).subscribe((res) => {
      this.sheets = res;
    });
  }

  onPlaySheet(id: number) {
    this.sheetService.playSheet(id).subscribe((list) => {
      this.batchActionsService.selectPlayList({ list, index: 0 });
    });
  }

  onOrderChange(order: 'new' | 'hot') {
    this.listParams.order = order;
    this.listParams.offset = 1;
    this.getList();
  }

  onPageChange(page: number) {
    console.log(page);
    this.listParams.offset = page;
    this.getList();
  }

  toInfo(id: number) {
    this.router.navigate(['/sheet-info', id]);
  }

}
