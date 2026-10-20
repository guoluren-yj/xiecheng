/**
 * 个性化配置service
 * @date: 2019-12-15
 * @version: 0.0.1
 * @author: zhaotong <tong.zhao@hand-china.com>
 * @copyright Copyright (c) 2019, Hands
 */
import request from 'utils/request';
import { HZERO_PLATFORM, HZERO_HMDE } from 'utils/config';
import { isTenantRoleLevel, getCurrentOrganizationId, parseParameters } from 'utils/utils';

const headerArr = `${window.$$env.CUST_HEADER}`.split('#');
const headers =
  headerArr.length > 1
    ? {
        [headerArr[0]]: headerArr[1],
      }
    : undefined;

// const mockapi = '/api/hpfm';

const prefix = isTenantRoleLevel()
  ? `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}`
  : `${HZERO_PLATFORM}/v1`;

export async function queryCode(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value`, {
    query: params,
  });
}
export async function queryModule(params = {}) {
  // return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/list/model`, {
  return request(`${HZERO_HMDE}/v1/${getCurrentOrganizationId()}/data-source-biz/view-model`, {
    query: params,
  });
}

export async function queryTree(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/menu-tree`, {
    query: params,
    method: 'GET',
  });
}
export async function queryGroup(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/groupUnits`, {
    query: params,
    method: 'GET',
  });
}
export async function queryUnitDetails(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/details`, {
    query: params,
    method: 'GET',
  });
}
export async function saveFieldIndividual(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/save`, {
    headers,
    body: params,
    method: 'POST',
  }, { encryptBody: true });
}
export async function queryFieldMapping(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/mapping/details`, {
    query: params,
    method: 'GET',
  });
}
export async function queryConditions(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/condition`, {
    query: params,
    method: 'GET',
  });
}
export async function queryRelatedUnits(params = {}) {
  return request(
    !isTenantRoleLevel()
      ? `${HZERO_PLATFORM}/v1/unit-config/unit/related`
      : `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/unit/related`,
    {
      query: params,
      method: 'GET',
    }
  );
}
export async function deleteFieldIndividual(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/delete`, {
    query: params,
    method: 'DELETE',
  });
}
export async function saveHeaderIndividual(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/save-header`, {
    body: params,
    method: 'POST',
  });
}
export async function querySelfValidator(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/condition-valid`, {
    query: params,
    method: 'GET',
  });
}
// export async function saveSelfValidator(params = {}) {
//   return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/condition-valid`, {
//     body: params,
//     method: 'POST',
//   });
// }
/**
 * 查询同模型同类型的个性化单元
 */
export async function querySameModelUnit(params = {}) {
  const query = parseParameters(params);
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/lovs/sql/data`, {
    method: 'GET',
    query,
  });
}
/**
 * 从 现有单元 修复(复制) (租户级)个性化字段 至 其他(新增)单元
 */
export async function copyFiled(params = {}) {
  return request(
    `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/batch-copy/config-field`,
    {
      body: params,
      method: 'POST',
    }
  );
}

/**
 * 租户个性化保存单元配置头
 */
export async function saveUnitConfigHeader(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/save-header`, {
    body: params,
    method: 'POST',
  });
}

export async function queryModelFields(params = {}) {
  const path = isTenantRoleLevel()
    ? 'unit-config/field/list/not-config'
    : 'customize/unit/not-config';
  return request(`${prefix}/${path}`, {
    method: 'GET',
    query: params,
  });
}
// ForJson
export async function exportUnitConfig(params = []) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/data-migrate/cusz/export`, {
    body: params,
    method: 'POST',
    responseType: 'text',
  });
}
export async function exportUnitConfigForExcel(params = []) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/cusz-data-export?cuszType=CUSZ`, {
    body: params,
    method: 'POST',
    responseType: 'text',
  });
}
export async function exportTplConfig(params = []) {
  return request(
    `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/data-migrate/doc-templates/export`,
    {
      body: params,
      method: 'POST',
      responseType: 'text',
    }
  );
}
export async function importUnitConfig(params) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/data-migrate/cusz/import`, {
    method: 'POST',
    body: params,
    // responseType: 'text',
  });
}
export async function importTplConfig(params) {
  return request(
    `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/data-migrate/doc-templates/import`,
    {
      method: 'POST',
      body: params,
      // responseType: 'text',
    }
  );
}
export async function queryImportLogHeaders() {
  return request(
    `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/data-migrate/cusz/import/header-log`,
    {
      method: 'POST',
    }
  );
}
export async function queryTplImportLogHeaders() {
  return request(
    `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/data-migrate/doc-templates/import/header-log`,
    {
      method: 'POST',
    }
  );
}
export async function queryImportLogLines(params = {}) {
  return request(
    `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/data-migrate/import/line-log`,
    {
      query: params,
      method: 'POST',
    }
  );
}

export async function queryImportUnitLog(params = {}) {
  return request(
    `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/data-migrate/cusz/import/unit-log`,
    {
      query: params,
      method: 'POST',
    }
  );
}
export async function queryImportTplLog(params = {}) {
  return request(
    `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/data-migrate/doc-templates/import/template-log/details`,
    {
      query: params,
      method: 'POST',
    }
  );
}
export async function saveMenu(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/menu`, {
    body: params,
    method: 'POST',
  });
}

export async function resetMenu(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/menu/reset`, {
    body: params,
    method: 'POST',
  });
}
export async function saveModule(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/docs/module`, {
    body: params,
    method: 'POST',
  });
}

export async function deleteModule(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/docs/module`, {
    query: params,
    method: 'DELETE',
  });
}

export async function queryTemplateRelatedUnits(params = {}) {
  return request(
    `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/tpl/unit/related`,
    {
      method: 'GET',
      query: params,
    }
  );
}

// 检验值集是否已分配给当前个性化单元所在的菜单
export async function checkValueCodeAssignMenu(params = {}, body) {
  return request(
    `${HZERO_PLATFORM}/v1/cusz/check-field`,
    {
      method: 'POST',
      responseType: "text",
      query: params,
      body,
    }
  );
}
