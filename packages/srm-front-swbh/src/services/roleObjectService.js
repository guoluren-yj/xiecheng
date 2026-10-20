// 维护单据对象接口
import request from 'utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { SRM_SWBH } from '../routes/components/utils/config';
import { lowcodeOrganizationURL } from '../routes/components/utils';

const organizationId = getCurrentOrganizationId();
const TenantRoleLevel = isTenantRoleLevel();
const prefix = TenantRoleLevel ? `${SRM_SWBH}/v1/${organizationId}` : `${SRM_SWBH}/v1`;

/**
 * 创建单据对象
 * */
export async function createRoManagement({ body = {} }) {
  const url = `${lowcodeOrganizationURL({ route: SRM_SWBH })}/doc-object-definitions`;
  return request(url, {
    method: 'POST',
    body,
  });
}
/**
 * 发布
 * */
export async function release({ data }) {
  const { level, type, combineCode } = data;
  const url = `${lowcodeOrganizationURL({
    route: SRM_SWBH,
  })}/doc-object-definitions/doc-publish/?level=${level}&${type}`;
  return request(url, {
    method: 'PUT',
    body: combineCode,
  });
}
/**
 * 查询单据对象详情-基础信息
 * */
export async function getManagementDetail(id) {
  const url = `${lowcodeOrganizationURL({ route: SRM_SWBH })}/doc-object-definitions/${id}`;
  return request(url, {
    method: 'GET',
  });
}

/**
 * 左侧对象详情关系树
 * */
export async function getRoleBOList({ combineId, query }) {
  const url = `${lowcodeOrganizationURL({
    route: SRM_SWBH,
  })}/doc-object-definitions/relations-tree?combineId=${combineId}`;
  return request(url, {
    method: 'GET',
    query,
  });
}

/**
 * 新建模板管理
 * */
export async function createTemplate({ body = {} }) {
  const url = isTenantRoleLevel()
    ? `${prefix}/doc-object-rels?tenantId=${organizationId}`
    : `${prefix}/doc-object-rels`;
  return request(url, {
    method: 'POST',
    body,
  });
}

/**
 * 删除模板
 * */
export async function deleteTemplate({ body = {} }) {
  return request(`${lowcodeOrganizationURL({ route: SRM_SWBH })}/business-objects-export-templates`, {
    method: 'DELETE',
    body,
  });
}
/**
 * 保存模板字段列表
 * */
export async function saveFieldList({ body = {}, query }) {
  return request(
    `${lowcodeOrganizationURL({
      route: SRM_SWBH,
    })}/business-objects-export-template-columns/batch`,
    {
      method: 'POST',
      query,
      body,
    }
  );
}
/**
 * 删除es对象单据
 * */
export async function deleteEsBill(code) {
  return request(
    `${lowcodeOrganizationURL({
      route: SRM_SWBH,
    })}/doc-object-definitions`,
    {
      method: 'DELETE',
      body: { combineCode: code },
    }
  );
}
