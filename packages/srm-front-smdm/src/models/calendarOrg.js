/**
 * model 租户级日历定义
 * @date: 2018-9-27
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import {
  searchCalendar,
  addCalendar,
  updateCalendar,
  searchCalendarDetail,
  searchHolidayDetail,
  addHoliday,
  updateHoliday,
  resetHoliday,
} from '@/services/calendarOrgService';
import { queryIdpValue } from 'services/api';
import { getResponse, createPagination } from 'utils/utils';

export default {
  namespace: 'calendarOrg',
  state: {
    calendarList: [], // 日历数据列表
    pagination: {}, // 分页器
    calendarDetail: {}, // 日历详情
    holidayDetail: {}, // 假期日历明细
    dateDetail: {}, // 具体一天日历明细
    holidayType: [], // 假期类型
  },
  effects: {
    // 获取假期类型
    *searchHolidayType(_, { call, put }) {
      const result = yield call(queryIdpValue, 'HPFM.HOLIDAY_TYPE');
      yield put({
        type: 'updateState',
        payload: {
          holidayType: result,
        },
      });
    },
    // 获取日历列表
    *searchCalendar({ payload }, { call, put }) {
      const result = getResponse(yield call(searchCalendar, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            pagination: createPagination(result),
            calendarList: result.content,
          },
        });
      }
    },
    // 获取日历明细
    *searchCalendarDetail({ payload }, { call, put }) {
      const result = getResponse(yield call(searchCalendarDetail, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            calendarDetail: result,
          },
        });
      }
    },
    // 获取日历假期详情
    *searchHolidayDetail({ payload }, { call, put }) {
      const result = getResponse(yield call(searchHolidayDetail, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            holidayDetail: result,
          },
        });
      }
    },
    // 获取具体一天日历假期详情
    *searchDayDetail({ payload }, { call, put }) {
      const { calendar, ...other } = payload;
      const result = getResponse(yield call(searchHolidayDetail, other));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            dateDetail: { ...result[calendar.format('MM-DD')], calendar },
          },
        });
      }
    },
    // 添加日历
    *addCalendar({ payload }, { call }) {
      const result = yield call(addCalendar, payload);
      return getResponse(result);
    },
    // 更新日历
    *updateCalendar({ payload }, { call }) {
      const result = yield call(updateCalendar, payload);
      return getResponse(result);
    },
    // 添加假期
    *addHoliday({ payload }, { call }) {
      const result = yield call(addHoliday, payload);
      return getResponse(result);
    },
    // 变更假期
    *updateHoliday({ payload }, { call }) {
      const result = yield call(updateHoliday, payload);
      return getResponse(result);
    },
    // 重置假期
    *resetHoliday({ payload }, { call }) {
      const result = yield call(resetHoliday, payload);
      return getResponse(result);
    },
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
