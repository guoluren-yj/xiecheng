/**
 * service - 日历定义
 * @date: 2018-9-26
 * @version: 1.0.0
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { parseParameters, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

const prefix = `${HZERO_PLATFORM}/v1`;

// 日历层级判断
function calendarsApi(params) {
  return isTenantRoleLevel() ? `${params.tenantId}/calendars` : `calendars`;
}

/**
 * 平台级日历查询
 * @async
 * @function searchCalendar
 * @param {object} params - 查询条件
 * @param {?string} params.calendarName - 描述
 * @param {?string} params.countryId - 国际/地区编码
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function searchCalendar(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${calendarsApi(params)}`, {
    method: 'GET',
    query: { ...param },
  });
}
/**
 *  获取日历明细
 * @async
 * @function searchCalendarDetail
 * @param {object} params - 查询条件
 * @param {!string} params.calendarId - 日历ID
 * @returns {object} fetch Promise
 */
export async function searchCalendarDetail(params) {
  return request(`${prefix}/${calendarsApi(params)}/${params.calendarId}`, {
    method: 'GET',
  });
}

/**
 * 平台级日历保存
 * @async
 * @function addCalendar
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function addCalendar(params) {
  return request(`${prefix}/${calendarsApi(params)}`, {
    method: 'POST',
    body: { ...params },
  });
}

/**
 * 平台级日历更新
 * @async
 * @function updateCalendar
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function updateCalendar(params) {
  return request(`${prefix}/${calendarsApi(params)}`, {
    method: 'PUT',
    body: { ...params },
  });
}

/**
 *  获取工作日
 * @async
 * @function searchWeekdays
 * @param {object} params - 查询条件
 * @param {!string} params.calendarId - 日历ID
 * @returns {object} fetch Promise
 * /v1/calendars/{calendarId}/calendar-holidays
 */
export async function searchWeekdays(params) {
  return request(`${prefix}/${calendarsApi(params)}/${params.calendarId}/calendar-weekdays`, {
    method: 'GET',
    query: { ...params },
  });
}

/**
 * 更新工作日信息
 * @async
 * @function updateWeekday
 * @param {object} params - 查询条件
 * @param {!number} params.calendarId - 日历ID
 * @param {!array<object>} params.data - 工作日数据
 * @returns {object} fetch Promise
 */
export async function updateWeekday(params) {
  return request(
    `${prefix}/${calendarsApi(params)}/${params.calendarId}/calendar-weekdays/set-weekday`,
    {
      method: 'POST',
      body: [...params.data],
    }
  );
}

/**
 * 更新工作日信息
 * @async
 * @function updateWeekday
 * @param {object} params - 查询条件
 * @param {!number} params.calendarId - 日历ID
 * @param {!array<object>} params.data - 工作日数据
 * @returns {object} fetch Promise
 */
export async function getStatutory(body) {
  return request(
    `${prefix}/${getCurrentOrganizationId()}/calendars/referConfigData `,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 *  获取公共假期
 * @async
 * @function searchHolidays
 * @param {object} params - 查询条件
 * @param {!string} params.calendarId - 日历ID
 * @returns {object} fetch Promise
 */
export async function searchHolidays(params) {
  const { excludeHolidayIds, ...param } = parseParameters(params);
  const url = isTenantRoleLevel()
    ? `${prefix}/${calendarsApi(params)}/${param.calendarId}/calendar-holidays/list`
    : `${prefix}/${calendarsApi(params)}/${param.calendarId}/calendar-holidays`;
  return request(`${url}`, {
    method: isTenantRoleLevel() ? 'POST' : 'GET',
    query: { ...param },
    body: { excludeHolidayIds },
  });
}

/**
 * 更新公休假期
 * @async
 * @function updateHoliday
 * @param {object} params - 查询条件
 * @param {!number} params.calendarId - 租户ID
 * @param {!object} params.data - 公休假期对象
 * @returns {object} fetch Promise
 */
export async function updateHoliday(params) {
  return request(`${prefix}/${calendarsApi(params)}/${params.calendarId}/calendar-holidays`, {
    method: 'PUT',
    body: { ...params.data },
  });
}

/**
 * 平台级日历更新
 * @async
 * @function addHoliday
 * @param {object} params - 查询条件
 * @param {!number} params.calendarId - 租户ID
 * @param {!object} params.data - 公休假期对象
 * @returns {object} fetch Promise
 */
export async function addHoliday(params) {
  return request(`${prefix}/${calendarsApi(params)}/${params.calendarId}/calendar-holidays`, {
    method: 'POST',
    body: { ...params.data },
  });
}

/**
 * 批量移除公休假期
 * @async
 * @function deleteHoliday
 * @param {object} params - 查询条件
 * @param {!number} params.calendarId - 租户ID
 * @param {!array<object>} params.data - 公休假期对象列表
 * @returns {object} fetch Promise
 */
export async function deleteHoliday(params) {
  return request(
    `${prefix}/${calendarsApi(params)}/${params.calendarId}/calendar-holidays/batch-delete`,
    {
      method: 'POST',
      body: [...params.data],
    }
  );
}

/**
 * 提交公休假期+工作日
 * @async
 * @function submitHolidays
 * @param {object} params - 查询条件
 * @param {!number} params.calendarId - 租户ID
 * @param {!array<object>} params.data - 公休假期对象列表
 * @returns {object} fetch Promise
 */
export async function submitHolidays(params) {
  return request(`${prefix}/${calendarsApi(params)}/submit`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 审批通过/拒绝公休假期+工作日
 * @async
 * @function submitHolidays
 * @param {object} params - 查询条件
 * @param {!number} params.calendarId - 租户ID
 * @param {!array<object>} params.data - 公休假期对象列表
 * @returns {object} fetch Promise
 */
export async function approvedList(params) {
  const { approvedList: list, ...others } = params;
  return request(`${prefix}/${getCurrentOrganizationId()}/calendars/function-approve`, {
    method: 'POST',
    body: list,
    query: others,
  });
}
