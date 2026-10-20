/**
 * service - 租户级日历定义
 * @date: 2018-9-27
 * @version: 1.0.0
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_MDM } from '_utils/config';
import { parseParameters } from 'utils/utils';

const prefix = `${SRM_MDM}/v1`;

/**
 * 日历查询
 * @async
 * @function searchCalendar
 * @param {object} params - 查询条件
 * @param {!number} params.tenantId - 租户ID
 * @param {?string} params.calendarName - 描述
 * @param {?string} params.countryId - 国际/地区编码
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function searchCalendar(params) {
  const { tenantId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${tenantId}/calendars`, {
    method: 'GET',
    query: { ...param, tenantId },
  });
}
/**
 *  获取日历详情
 * @async
 * @function searchCalendarDetail
 * @param {object} params - 查询条件
 * @param {!string} params.calendarId - 日历ID
 * @returns {object} fetch Promise
 */
export async function searchCalendarDetail(params) {
  return request(`${prefix}/${params.tenantId}/calendars/${params.calendarId}`, {
    method: 'GET',
  });
}
/**
 *  获取特定年月的假期日历详情
 * @async
 * @function searchHolidayDetail
 * @param {object} params - 查询条件
 * @param {!number} params.tenantId - 租户ID
 * @param {!number} params.calendarId - 日历ID
 * @param {!number} params.year - 年
 * @param {!number} params.month - 月
 * @param {?number} params.date - 日
 * @returns {object} fetch Promise
 */
export async function searchHolidayDetail(params) {
  return request(`${prefix}/${params.tenantId}/calendars/${params.calendarId}/calendar-holidays`, {
    method: 'GET',
    query: { ...params },
  });
}
/**
 * 新增日历
 * @async
 * @function saveCalendar
 * @param {object} params - 查询条件
 * @param {!string} params.tenantId - 租户ID
 * @returns {object} fetch Promise
 */
export async function addCalendar(params) {
  return request(`${prefix}/${params.tenantId}/calendars`, {
    method: 'POST',
    body: { ...params },
  });
}

/**
 * 更新日历
 * @async
 * @function updateCalendar
 * @param {object} params - 查询条件
 * @param {!string} params.tenantId - 租户ID
 * @returns {object} fetch Promise
 */
export async function updateCalendar(params) {
  return request(`${prefix}/${params.tenantId}/calendars`, {
    method: 'PUT',
    body: { ...params },
  });
}

/**
 * 更新日历假期
 * @async
 * @function updateHoliday
 * @param {object} params - 查询条件
 * @param {!number} params.tenantId - 租户ID
 * @param {!number} params.calendarId - 日历Id
 * @returns {object} fetch Promise
 */
export async function updateHoliday(params) {
  return request(`${prefix}/${params.tenantId}/calendars/${params.calendarId}/calendar-holidays`, {
    method: 'PUT',
    body: { ...params },
  });
}

/**
 * 新增日历假期
 * @async
 * @function addHoliday
 * @param {object} params - 查询条件
 * @param {!number} params.tenantId - 租户ID
 * @param {!number} params.calendarId - 日历Id
 * @returns {object} fetch Promise
 */
export async function addHoliday(params) {
  return request(`${prefix}/${params.tenantId}/calendars/${params.calendarId}/calendar-holidays`, {
    method: 'POST',
    body: { ...params },
  });
}

/**
 * 重置日历假期
 * @async
 * @function resetHoliday
 * @param {object} params - 查询条件
 * @param {!number} params.tenantId - 租户ID
 * @param {!number} params.calendarId - 日历ID
 * @param {!number} params.holidayId - 假期ID
 * @returns {object} fetch Promise
 */
export async function resetHoliday(params) {
  return request(
    `${prefix}/${params.tenantId}/calendars/${params.calendarId}/calendar-holidays/${params.holidayId}`,
    {
      method: 'DELETE',
    }
  );
}
