/**
 * Drawer -商城资源
 * @date: 2019-11-20
 * @author lzj <zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { fetchComanyInfo, addCompanyList, updateCompanyList } from '@/services/mallResourceService';

export default {
  namespace: 'mallResource',
  state: {
    companyList: [], // 公司集团列表
    pagination: {},
    templateInfo: {
      logoPath: '',
      faviconPath: '',
      title: '',
      footInformation: '',
      customerPhone: '',
      personPurchaseFlag: '',
      // visitorFlag: 1, // 是否允许游客模式
    }, // 详情信息
  },
  effects: {
    *fetchComanyInfo({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchComanyInfo, payload));
      const { content } = response;
      if (content.length > 0) {
        yield put({
          type: 'updateState',
          payload: {
            companyList: content,
            pagination: createPagination(response),
            templateInfo: content[0],
          },
        });
      }
      return content;
    },

    *addCompanyList({ payload }, { call }) {
      const response = yield call(addCompanyList, payload);
      return getResponse(response);
    },
    *updateCompanyList({ payload }, { call }) {
      const response = yield call(updateCompanyList, payload);
      return getResponse(response);
      // const {content} = getResponse(response);
      // if (content) {
      //   yield put({
      //     type: 'updateState',
      //     payload: {
      //       companyList: content,
      //       templateInfo: {
      //         logoPath: content[0].logoPath,
      //         faviconPath: content[0].faviconPath,
      //         title: content[0].title,
      //         footInformation: content[0].footInformation,
      //         customerPhone: content[0].customerPhone,
      //       },
      //     },
      //   });
      // }
      // return content;
    },

    // *fetchTemplateInfo({ payload }, { call }) {
    //   const response = yield call(fetchTemplateInfo, payload);
    //   return getResponse(response);
    // },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
