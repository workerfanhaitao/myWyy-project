import { Singer, SongSheet } from './../services/data-types/common.types';
import { SetModalType, SetModalVisible, SetLikeId, SetShareInfo } from './actions/member.actions';
import { MemberState, ModalTypes } from './reducers/member.reducer';
import { getMember } from './selectors/member.selector';
import { PlayState, CurrentActions } from './reducers/player.reducer';
import { AppStoreModule } from './index';
import { Injectable } from '@angular/core';
import { Song } from '../services/data-types/common.types';
import { Store, select } from '@ngrx/store';
import { getPlayer } from './selectors/player.selector';
import { SetSongList, SetPlayList, SetCurrentIndex, SetCurrentAction } from './actions/player.actions';
import { shuffle, findIndex } from '../utils/tool';
import { timer } from 'rxjs';

@Injectable({
  providedIn: AppStoreModule
})
export class BatchActionsService {
  private playerState: PlayState;
  private memberState: MemberState;

  constructor(
    private store$: Store<AppStoreModule>
  ) {
    this.store$.pipe(select(getPlayer)).subscribe((res) => this.playerState = res);
    this.store$.pipe(select(getMember)).subscribe((res) => this.memberState = res);
  }

  // 播放列表
  selectPlayList({ list, index }: { list: Song[], index: number}) {
    this.store$.dispatch(SetSongList({ songList: list }));
    let trueIndex = index;
    let trueList = list.slice();
    if (this.playerState.playMode.type === 'random') {
      trueList = shuffle(list || []);
      trueIndex = findIndex(trueList, list[trueIndex]);
    }
    this.store$.dispatch(SetPlayList({ playList: trueList }));
    this.store$.dispatch(SetCurrentIndex({ currentIndex: trueIndex }));
    this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Play }));
  }
  // 添加歌曲
  insertSong(song: Song, isPlay: boolean) {
    const songList = this.playerState.songList.slice();
    let playList = this.playerState.playList.slice();
    let insertIndex = this.playerState.currentIndex;
    const pIndex = findIndex(playList, song);
    if (pIndex > -1) {
      if (isPlay) {
        insertIndex = pIndex;
      }
    } else {
      songList.push(song);
      if (isPlay) {
        insertIndex = songList.length - 1;
      }
      if (this.playerState.playMode.type === 'random') {
        playList = shuffle(songList);
      } else {
        playList.push(song);
      }
      this.store$.dispatch(SetSongList({ songList }));
      this.store$.dispatch(SetPlayList({ playList }));
    }

    if (insertIndex !== this.playerState.currentIndex) {
      this.store$.dispatch(SetCurrentIndex({ currentIndex: insertIndex }));
      this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Play }));
    } else {
      this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Add }));
    }
  }

  // 添加歌单
  insertSongs(songs: Song[]) {
    let songList = this.playerState.songList.slice();
    let playList = this.playerState.playList.slice();
    const validSongs = songs.filter((item) => findIndex(playList, item) === -1);
    if (validSongs.length) {
      songList = songList.concat(validSongs);
      let songPlayList = validSongs.slice();
      if (this.playerState.playMode.type === 'random') {
        songList = shuffle(songList);
      }
      playList = playList.concat(songPlayList);
      this.store$.dispatch(SetSongList({ songList }));
      this.store$.dispatch(SetPlayList({ playList }));
    }
    this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Add }));
  }

  // 删除歌曲
  DeleteSong(song: Song) {
    const songList = this.playerState.songList.slice();
    const playList = this.playerState.playList.slice();
    const sIndex = findIndex(songList, song);
    const pIndex = findIndex(playList, song);
    let currentIndex = this.playerState.currentIndex;
    songList.splice(sIndex, 1);
    playList.splice(pIndex, 1);

    if (currentIndex > pIndex || currentIndex === this.playerState.playList.length) {
      currentIndex--;
    }

    this.store$.dispatch(SetSongList({ songList }));
    this.store$.dispatch(SetPlayList({ playList }));
    this.store$.dispatch(SetCurrentIndex({ currentIndex }));
    this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Delete }));
  }
  // 清空歌曲列表
  ClearSong() {
    this.store$.dispatch(SetSongList({ songList: [] }));
    this.store$.dispatch(SetPlayList({ playList: [] }));
    this.store$.dispatch(SetCurrentIndex({ currentIndex: -1 }));
    this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Clear }));
  }

  // 会员弹窗显示/隐藏
  controlModal(modalVisible = true, modalType?: ModalTypes) {
    if (modalType) {
      this.store$.dispatch(SetModalType({ modalType }));
    }
    this.store$.dispatch(SetModalVisible({ modalVisible }));
    if (!modalVisible) {
      timer(500).subscribe(() => this.store$.dispatch(SetModalType({ modalType: ModalTypes.Default })));
    }
  }

  // 收藏歌曲
  likeSong(id: string) {
    this.store$.dispatch(SetModalType({ modalType: ModalTypes.Like }));
    this.store$.dispatch(SetLikeId({ likeId: id }));
  }

  // 分享资源
  shareResource(resource: Song | SongSheet, type = 'song') {
    let txt = '';
    if (type === 'playlist') {
      txt = this.makeTxt('歌单', resource.name, (resource as SongSheet).creator.nickname);
    } else {
      txt = this.makeTxt('歌曲', resource.name, (resource as Song).ar);
    }
    this.store$.dispatch(SetShareInfo({ shareInfo: { id: resource.id.toString(), type, txt } }));
  }

  private makeTxt(type: string, name: string, makeBy: string | Singer[]): string {
    let makeByStr = '';
    if (Array.isArray(makeBy)) {
      makeByStr = makeBy.map((item) => item.name).join('/');
    } else {
      makeByStr = makeBy;
    }
    return `${type}: ${name} -- ${makeByStr}`;
  }
}
