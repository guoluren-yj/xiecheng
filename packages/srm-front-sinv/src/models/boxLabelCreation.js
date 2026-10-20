/*
 *
 * @date: 2020/10/26 17:47:27
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { getResponse } from 'utils/utils';
import {
  labelMaintain,
  fetchTreeList,
  labelPrint,
  createAndPrint,
  asnPrint,
  labelVoid,
  revokeLine,
  createLabelLine,
  saveLabel,
  submitLabel,
  deleteLabelLine,
} from '@/services/boxLabelCreationService';

export default {
  namespace: 'boxLabelCreation',

  state: {},

  effects: {
    *labelMaintain({ payload }, { call }) {
      const res = getResponse(yield call(labelMaintain, payload));
      return res;
    },
    *fetchTreeList({ payload }, { call }) {
      const res = getResponse(yield call(fetchTreeList, payload));
      return res;
    },
    *labelPrint({ payload }, { call }) {
      const res = getResponse(yield call(labelPrint, payload));
      return res;
    },
    *createAndPrint({ payload }, { call }) {
      const res = getResponse(yield call(createAndPrint, payload));
      return res;
    },
    *asnPrint({ payload }, { call }) {
      const res = getResponse(yield call(asnPrint, payload));
      return res;
    },
    *labelVoid({ payload }, { call }) {
      const res = getResponse(yield call(labelVoid, payload));
      return res;
    },
    *revokeLine({ payload }, { call }) {
      const res = getResponse(yield call(revokeLine, payload));
      return res;
    },
    *createLabelLine({ payload }, { call }) {
      const res = getResponse(yield call(createLabelLine, payload));
      return res;
    },
    *saveLabel({ payload }, { call }) {
      const res = getResponse(yield call(saveLabel, payload));
      return res;
    },
    *submitLabel({ payload }, { call }) {
      const res = getResponse(yield call(submitLabel, payload));
      return res;
    },
    *deleteLabelLine({ payload }, { call }) {
      const res = getResponse(yield call(deleteLabelLine, payload));
      return res;
    },
  },
};
