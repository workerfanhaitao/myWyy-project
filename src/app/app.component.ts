import { DOCUMENT } from '@angular/common';
import { filter, map, mergeMap, takeUntil } from 'rxjs/internal/operators';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { UserSheet } from './services/data-types/member.type';
import { StorageService } from './services/storage.service';
import { User } from './services/data-types/user.type';
import { MemberService, LikeSongParams, ShareParams } from './services/member.service';
import { LoginParams } from './share/wy-ui/wy-layer/wy-layer-login/wy-layer-login.component';
import { BatchActionsService } from './store/batch-actions.service';
import { SetModalType, SetUserId, SetModalVisible } from './store/actions/member.actions';
import { Store, select } from '@ngrx/store';
import { ModalTypes, ShareInfo } from './store/reducers/member.reducer';
import { SearchResult, SongSheet } from './services/data-types/common.types';
import { SearchService } from './services/search.service';
import { Component, Inject } from '@angular/core';
import { isEmptyObject } from './utils/tool';
import { NzMessageService } from 'ng-zorro-antd';
import { codeJson } from './utils/base64';
import { getMember, getLikeId, getModalVisible, getModalType, getShareInfo } from './store/selectors/member.selector';
import { Observable, interval } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'my-wyy';
  menu = [{
    label: '发现',
    path: '/home'
  }, {
    label: '歌单',
    path: '/sheet-list'
  }];

  searchResult: SearchResult;
  user: User;
  mySheets: SongSheet[];
  likeId: string;
  // 弹窗显示
  visible = false;

  showSpin = false;
  // 当前弹窗类型
  currentModalType = ModalTypes.Default;
  // 分享信息
  shareInfo: ShareInfo;

  wyRememberLogin: LoginParams;

  // 路由标题
  routerTitle = '';

  // 页面加载进度
  loadPercent = 0;

  private navEnd: Observable<NavigationEnd>;

  constructor(
    private searchService: SearchService,
    private store$: Store,
    private batchActionsService: BatchActionsService,
    private memberService: MemberService,
    private messageService: NzMessageService,
    private storageService: StorageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleServe: Title,
  ) {
    const userId = this.storageService.getStorage('wyUserId');
    if (userId) {
      this.memberService.getUserDetail(userId).subscribe((user: User) => {
        this.user = user;
      });
      this.store$.dispatch(SetUserId({ userId }));
    }
    const wyRememberLogin = this.storageService.getStorage('wyRememberLogin');
    if (wyRememberLogin) {
      this.wyRememberLogin = JSON.parse(wyRememberLogin);
    }
    this.listenStates();

    // 动态设置页头标题
    this.navEnd = this.router.events.pipe(
      filter((evt) => evt instanceof NavigationEnd)
    ) as Observable<NavigationEnd>;
    this.setLoadingBar();
    this.setTitle();
  }

  // 页面加载进度方法
  private setLoadingBar() {
    interval(100).pipe(takeUntil(this.navEnd)).subscribe(() => {
      this.loadPercent = Math.max(95, ++this.loadPercent);
    })
    this.navEnd.subscribe(() => {
      this.loadPercent = 100;
    });
  }

  private setTitle() {
    this.navEnd.pipe(
      map(() => this.activatedRoute),
      map((route: ActivatedRoute) => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      mergeMap((route) => route.data)
    ).subscribe((data) => {
      this.routerTitle = data.title;
      this.titleServe.setTitle(this.routerTitle);
    });
  }

  private listenStates() {
    const appStore$ = this.store$.pipe(select(getMember));
    appStore$.pipe(select(getLikeId)).subscribe((likeId) => {
      if (likeId) {
        this.likeId = likeId;
      }
    });
    appStore$.pipe(select(getModalVisible)).subscribe((visible) => {
      if (this.visible !== visible) {
        this.visible = visible;
      }
    });
    appStore$.pipe(select(getModalType)).subscribe((type) => {
      if (this.currentModalType !== type) {
        if (type === ModalTypes.Like) {
          this.onGetMySheets();
        }
        this.currentModalType = type;
      }
    });
    appStore$.pipe(select(getShareInfo)).subscribe((shareInfo) => {
      if (shareInfo) {
        if (this.user) {
          this.shareInfo = shareInfo;
          this.handleModal(ModalTypes.Share);
        } else {
          this.handleModal(ModalTypes.Default);
        }
      }
    });
  }

  // 打开弹窗 => 登录 | 注册
  openModalByMenu(type: 'loginByPhone' | 'register') {
    if (type === 'loginByPhone') {
      this.handleModal(ModalTypes.LoginByPhone);
    } else {
      this.handleModal(ModalTypes.Register);
    }
  }

  // 切换弹窗显示 | 隐藏
  handleModal(type?: ModalTypes) {
    if (type) {
      this.batchActionsService.controlModal(true, type);
    } else {
      this.batchActionsService.controlModal(false);
    }
  }

  // 改变弹窗类型
  onChangeModalType( modalType = ModalTypes.Default) {
    this.store$.dispatch(SetModalType({ modalType }));
  }

  // 获取当前用户歌单
  onGetMySheets() {
    if (this.user) {
      this.memberService.getUserSheets(this.user.profile.userId.toString())
      .subscribe((UserSheet: UserSheet) => {
        this.mySheets = UserSheet.self;
        this.store$.dispatch(SetModalVisible({ modalVisible: true }));
      });
    } else {
      this.handleModal(ModalTypes.Default);
    }
  }

  onSearch(keyword: string) {
    if (keyword) {
      this.searchService.search(keyword).subscribe((res: SearchResult) => {
        this.searchResult = this.highlightkeyword(keyword, res);
      });
    } else {
      this.searchResult = {};
    }
  }

  private highlightkeyword(keyword: string, result: SearchResult): SearchResult {
    if (!isEmptyObject(result)) {
      const reg = new RegExp(keyword, 'ig');
      ['artists', 'playlists', 'songs'].forEach((type) => {
        if (result[type]) {
          result[type].forEach((item) => {
            item.name = item.name.replace(reg, '<span class="highlight">$&</span>');
          });
        }
      });
    }
    return result;
  }

  // 登录
  onLogin(params: LoginParams) {
    this.showSpin = true;
    this.memberService.login(params).subscribe((user: User) => {
      this.user = user;
      this.handleModal();
      this.alertMessage('success', '登录成功');
      this.storageService.setStorage({
        key: 'wyUserId',
        value: user.profile.userId
      });

      this.store$.dispatch(SetUserId({ userId: user.profile.userId.toString() }));

      if (params.remember) {
        this.storageService.setStorage({
          key: 'wyRememberLogin',
          value: JSON.stringify(codeJson(params))
        });
      } else {
        this.storageService.removeStorage('wyRememberLogin');
      }
      this.showSpin = false;
    }, () => {
      this.alertMessage('error', '账号密码有误');
      this.showSpin = false;
    });
  }

  private alertMessage(type: string, msg: string) {
    this.messageService.create(type, msg);
  }

  // 退出登录
  outLogin() {
    this.memberService.logout().subscribe(() => {
      this.user = null;
      this.alertMessage('success', '成功退出登录');
      this.store$.dispatch(SetUserId({ userId: '' }));
      this.storageService.removeStorage('wyUserId');
    }, () => {
      this.alertMessage('error', '系统错误');
    });
  }

  // 收藏歌曲
  onLikeSong(args: LikeSongParams) {
    console.log('LikeSongParams', args);
    this.memberService.likeSongToSheet(args).subscribe(() => {
      this.handleModal();
      this.alertMessage('success', '收藏成功');
    }, (error) => {
      this.alertMessage('error', error.msg || '收藏失败');
    });
  }

  // 新建歌单
  onCreateSheet(sheetName: string) {
    this.memberService.createSheet(sheetName).subscribe((sheetId: number) => {
      this.handleModal();
      this.alertMessage('success', '歌单创建成功');
      this.onLikeSong({ pid: sheetId.toString(), tracks: this.likeId });
    }, (error) => {
      this.alertMessage('error', error.msg || '歌单创建失败');
    });
  }

  // 分享资源
  shareResource(shareParams: ShareParams) {
    this.memberService.shareResource(shareParams).subscribe(() => {
      this.handleModal();
      this.alertMessage('success', '分享成功');
    }, (error) => {
      this.alertMessage('error', error.msg || '分享失败');
    });
  }

  // 注册
  onRegister(phone: string) {
    this.alertMessage('success', '用户' + phone + '注册成功');
  }
}
