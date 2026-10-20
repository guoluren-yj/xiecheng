/**
 * model - 物料查询
 * @date: 2018-9-25
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination, getCurrentOrganizationId } from 'utils/utils';
import {
  queryMateriel,
  queryDetail,
  queryAttribute,
  deleteAttributeTableData,
  saveAll,
  enabledFlag,
  queryPartner,
  deletePartnerTableData,
  queryCategory,
  deleteCategoryTableData,
  queryAffliated,
  queryEnclosure,
  onDraggerUploadRemove,
  deleteEnclosureTableData,
  deleteAffiatedTableData,
  checkValid,
  queryTreeData,
  queryTaxationData,
  querAllOrg,
  queryItemOrgUom,
  uomValid,
  unPack,
  fetchFileList,
  validateFile,
  imgImport,
  queryDrawingInfo,
  fetchVersionList,
  fetchDataCategories,
  fetchDataComponent,
  deleteComponentData,
} from '@/services/materielService';
import { queryLovData, queryMapIdpValue } from 'services/api';

const organizationId = getCurrentOrganizationId();
export default {
  namespace: 'materielQuery',
  state: {
    selectedRows: [],
    selectedRowKeys: [],
    materielData: [], // 物料列表数据
    ExecutorData: [], // 需求执行人列表
    ExtorPagination: {}, // 需求执行人分页参数
    pagination: {}, // 物料列表数据分页参数
    materielDetail: {}, // 物料详情表单数据
    attributeData: [], // 自定义物品属性数据
    partnerData: {}, // 客户物品数据
    drawInfoData: [], // 图纸信息
    categoryData: [], // 自主品类分配物品
    affliatedData: {}, // 所属组织数据
    enclosureDataSource: [], // 附件
    flagList: [], // 是否值集
    yesOrNoList: [], // 是否值集
    allowExcessTypeList: [], // 允许超过数量种类的值集
    ABCList: [], // 物料ABC属性值集
    dimensionQcList: [], // 质量管理维度值集
    itemOrgRelAttributeVO: {}, // 全部属性标识
    itemOrgUomData: {}, // 物料关联关系
    uploadDataSource: [], // 导入图片列表
    uploadPagination: {}, // 导入图片分页参数
    componentData: {}, // 组件列表数据
  },
  effects: {
    // 查询物料列表
    *fetchMaterialData({ payload }, { call, put }) {
      const response = yield call(queryMateriel, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { materielData: data, pagination: createPagination(data) },
        });
      }

      return data;
    },
    // 查询需求执行人列表
    *fetchExecutorData({ payload }, { call, put }) {
      const response = yield call(
        queryLovData,
        `/iam/hzero/v1/${organizationId}/users/paging`,
        payload
      );
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { ExecutorData: data.content, ExtorPagination: createPagination(data) },
        });
      }
    },
    // 保存所有数据
    *saveAll({ payload }, { call }) {
      const response = yield call(saveAll, payload);
      return getResponse(response);
    },
    // 启用作废
    *enabledFlag({ payload }, { call }) {
      const response = yield call(enabledFlag, payload);
      return getResponse(response);
    },
    // 查询详情表单
    *queryDetail({ payload }, { call, put }) {
      const response = yield call(queryDetail, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            materielDetail: data,
            attributeData: [],
            partnerData: {},
            categoryData: [],
            drawInfoData: [],
            affliatedData: {},
            enclosureDataSource: [],
            itemOrgUomData: {},
            componentData: {},
          },
        });
      }
    },
    // 查询自定义物品属性
    *queryAttribute({ payload }, { call, put }) {
      const response = yield call(queryAttribute, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { attributeData: data },
        });
      }
    },
    // 查询图纸信息
    *queryDrawInfo({ payload }, { call, put }) {
      const response = yield call(queryDrawingInfo, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { drawInfoData: data },
        });
      }
    },
    // 删除数据
    *deleteAttributeTableData({ payload }, { call }) {
      const response = yield call(deleteAttributeTableData, payload);
      return getResponse(response);
    },
    // 删除数据
    *deleteCategoryTableData({ payload }, { call }) {
      const response = yield call(deleteCategoryTableData, payload);
      return getResponse(response);
    },
    // 删除数据
    *deleteEnclosureTableData({ payload }, { call }) {
      const response = yield call(deleteEnclosureTableData, payload);
      return getResponse(response);
    },
    // 删除数据
    *deletePartnerTableData({ payload }, { call }) {
      const response = yield call(deletePartnerTableData, payload);
      return getResponse(response);
    },
    // 删除数据
    *deleteAffiatedTableData({ payload }, { call }) {
      const response = yield call(deleteAffiatedTableData, payload);
      return getResponse(response);
    },
    // 查询自定义物品属性
    *queryPartner({ payload }, { call, put }) {
      const response = yield call(queryPartner, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { partnerData: data },
        });
      }
    },
    // 查询自主品类分配物品
    *queryCategory({ payload }, { call, put }) {
      const response = yield call(queryCategory, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { categoryData: data },
        });
      }
    },
    // 查询自主品类分配物品
    *queryAffliated({ payload }, { call, put }) {
      const response = yield call(queryAffliated, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { affliatedData: {} },
        });
        yield put({
          type: 'updateState',
          payload: { affliatedData: data },
        });
      }
    },
    // 查询附件
    *queryEnclosure({ payload }, { call, put }) {
      const response = yield call(queryEnclosure, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { enclosureDataSource: data },
        });
      }
    },
    // 删除附件
    *onDraggerUploadRemove({ payload }, { call }) {
      const response = yield call(onDraggerUploadRemove, payload);
      return getResponse(response);
    },
    *checkValid({ payload }, { call }) {
      const response = yield call(checkValid, payload);
      return getResponse(response);
    },

    // 查询阶段列表
    *queryFlagList(_, { call, put }) {
      const response = getResponse(
        yield call(queryMapIdpValue, {
          flagList: 'SMDM.FLAG_REVERSE',
          yesOrNoList: 'HPFM.FLAG',
          dimensionQcList: 'SMDM.DIMENSION_QC',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          ...response,
        },
      });
    },

    // 查询值集
    *queryIdpValue(_, { call, put }) {
      const response = getResponse(
        yield call(queryMapIdpValue, {
          ABCList: 'SMDM.ITEM_ABC',
          allowExcessTypeList: 'SMDM.ALLOW_EXCESS_ORDER_TYPE',
          dimensionQcList: 'SMDM.DIMENSION_QC',
          TaxFreeType: 'SMDM.TAX_FREE_TYPE',
          FerentialMark: 'SMDM.PREFERENTIAL_MARK_TYPE',
        })
      );
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            ...response,
          },
        });
      }
    },

    // 树形菜单查询
    *queryTreeData({ payload }, { call }) {
      const response = yield call(queryTreeData, payload);
      return getResponse(response);
    },

    // 树形菜单查询
    *queryTaxationData({ payload }, { call }) {
      const response = yield call(queryTaxationData, payload);
      return getResponse(response);
    },

    // 查询自主品类分配物品
    *querAllOrg({ payload }, { call, put }) {
      const response = yield call(querAllOrg, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { affliatedData: {} },
        });
        yield put({
          type: 'updateState',
          payload: { affliatedData: data },
        });
        return data;
      }
    },
    // 查询自主品类分配物品
    *queryItemOrgUom({ payload }, { call, put }) {
      const response = yield call(queryItemOrgUom, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { itemOrgUomData: data },
        });
      }
    },

    *uomValid({ payload }, { call }) {
      const response = yield call(uomValid, payload);
      return response;
    },

    *unPack({ payload }, { call }) {
      const res = yield call(unPack, payload);
      const result = getResponse(res);
      return result;
    },

    // 商品图片导入list查询
    *fetchFileList({ payload }, { call, put }) {
      const { batchNum, page } = payload;
      const res = yield call(fetchFileList, { batchNum, page });
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            uploadDataSource: result.content,
            uploadPagination: createPagination(result),
          },
        });
      }
    },
    // 商品图片导入校验
    *validateFile({ payload }, { call }) {
      const { batchNum } = payload;
      const response = yield call(validateFile, { batchNum });
      return response;
    },

    *imgImport({ payload }, { call }) {
      const res = yield call(imgImport, payload);
      const result = getResponse(res);
      return result;
    },
    // 查询历史版本
    *fetchVersionList({ payload }, { call, put }) {
      const response = yield call(fetchVersionList, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { versionList: data },
        });
      }
    },
    *fetchDataCategories({ payload }, { call }) {
      const res = yield call(fetchDataCategories, payload);
      const result = getResponse(res);
      return result;
    },
    // 查询组件列表
    *queryComponent({ payload }, { call, put }) {
      const response = yield call(fetchDataComponent, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { componentData: data },
        });
      }
    },
    // 删除组件列表数据
    *deleteComponentTableData({ payload }, { call }) {
      const response = yield call(deleteComponentData, payload);
      return getResponse(response);
    },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
