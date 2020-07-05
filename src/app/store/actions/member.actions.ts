import { ModalTypes, ShareInfo } from './../reducers/member.reducer';
import { createAction, props } from '@ngrx/store';

export const SetModalVisible = createAction('[member] Set modalVisible', props<{ modalVisible: boolean }>());
export const SetModalType = createAction('[member] Set modalType', props<{ modalType: ModalTypes }>());
export const SetUserId = createAction('[member] Set userId', props<{ userId: string }>());
export const SetLikeId = createAction('[member] Set likeId', props<{ likeId: string }>());
export const SetShareInfo = createAction('[member] Set shareInfo', props<{ shareInfo: ShareInfo }>());