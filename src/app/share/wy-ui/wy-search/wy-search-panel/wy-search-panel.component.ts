import { Router } from '@angular/router';
import { SearchResult } from './../../../../services/data-types/common.types';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-wy-search-panel',
  templateUrl: './wy-search-panel.component.html',
  styleUrls: ['./wy-search-panel.component.less']
})
export class WySearchPanelComponent implements OnInit {

  searchResult: SearchResult;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  // 跳转
  toInfo(path: [string, number]) {
    if (path[1]) {
      this.router.navigate(path);
    }
  }

}
