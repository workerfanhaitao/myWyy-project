import { SetModalVisible, SetModalType, SetUserId, SetLikeId, SetShareInfo } from './../actions/member.actions';
import { createReducer, on, Action } from '@ngrx/store';

export enum ModalTypes {
  Register = 'register',
  LoginByPhone = 'loginByPhone',
  Share = 'share',
  Like = 'like',
  Default = 'default'
}

export interface MemberState {
  modalVisible: boolean;
  modalType: ModalTypes;
  userId: string;
  likeId: string;
  shareInfo?: ShareInfo;
}

export interface ShareInfo {
  id: string;
  type: string;
  txt: string;
}

export const initState: MemberState = {
  modalVisible: false,
  modalType: ModalTypes.Default,
  userId: '',
  likeId: '',
};

const reducer = createReducer(
  initState,
  on(SetModalVisible, (state, {modalVisible}) => ({ ...state, modalVisible })),
  on(SetModalType, (state, {modalType}) => ({ ...state, modalType})),
  on(SetUserId, (state, {userId}) => ({ ...state, userId})),
  on(SetLikeId, (state, {likeId}) => ({ ...state, likeId})),
  on(SetShareInfo, (state, {shareInfo}) => ({ ...state, shareInfo }))
);

export function memberReducer(state: MemberState, action: Action) {
  return reducer(state, action);
}
