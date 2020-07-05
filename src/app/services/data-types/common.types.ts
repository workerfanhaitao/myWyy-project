// 轮播图
export interface Banner {
  targetId: number;
  url: string;
  imageUrl: string;
}

// 热标签
export interface HotTag {
  id: number;
  name: string;
  position: number;
}

// 专辑
export interface SongSheet {
  id: number;
  name: string;
  playCount: number;
  picUrl: string;
  coverImgUrl: string;
  tags: string[];
  createTime: number;
  creator: {
    nickname: string;
    avatarUrl: string;
  };
  description: string;
  subscribedCount: number;
  shareCount: number;
  commentCount: number;
  subscribed: boolean;
  tracks: Song[];
  trackCount: number;
}

// 歌手
export interface Singer {
  id: number;
  name: string;
  albumSize: number;
  picUrl: string;
  alias: string[];
}

// 歌手详情
export interface SingerDetail {
  artist: Singer;
  hotSongs: Song[];
}

// 歌曲
export interface Song {
  id: number;
  name: string;
  ar: Singer[];
  url: string;
  al: {
    id: number;
    name: string;
    picUrl: string;
  };
  dt: number;
}

// 歌曲播放地址
export interface SongUrl {
  id: number;
  url: string;
}

// 歌词
export interface Lyric {
  lyric: string;
  tlyric: string;
}

// 获取歌单时参数
export interface SheetParams {
  offset: number;
  limit: number;
  order: 'new' | 'hot';
  cat: string;
}

// 歌单列表
export interface SheetList {
  playlists: SongSheet[];
  total: number;
}

// 搜索结果
export interface SearchResult {
  artists?: Singer[];
  playlists?: SongSheet[];
  songs?: Song[];
}

export interface SampleBack extends AnyJson {
  code: number;
}

export interface AnyJson {
  [key: string]: any;
}