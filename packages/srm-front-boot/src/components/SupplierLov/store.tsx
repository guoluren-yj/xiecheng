import React from 'react';
import { Tag } from 'choerodon-ui';
import type DataSet from 'choerodon-ui/pro/lib/data-set/DataSet';
import type { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { omit, keys } from 'lodash';
import { toJS, runInAction } from 'mobx';
import { RecordStatus, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import Record from 'choerodon-ui/pro/lib/data-set/Record';

import { getCurrentOrganizationId } from 'utils/utils';
import intl from '@/utils/intl';
import { SRM_SSLM, PRIVATE_BUCKET } from '@/utils/config';

const tenantId = getCurrentOrganizationId();

export const stylePrefix = 'supplier-lov-view';

export const DEFAULT_SEARCH_BAR_CODE: string = 'SRM.COMMON.SUPPLIER_SELECT.SEARCHBAR'; // 默认筛选器单元编码
export const DEFAULT_TABLE_CODE: string = 'SRM.COMMON.SUPPLIER_SELECT.TABLE'; // 默认表格单元编码
// 默认从表格单元编码, 由于选择供应商组件查询设计到多表查询，需设置第从表格单元编码
export const DEFAULT_SUB_TABLE_CODE: string = 'SRM.COMMON.SUPPLIER_SELECT.SUPPLIER_TABLE';
export const DEFAULT_TEXT_FIELD: string = 'supplierCompanyName'; // 默认值集显示字段名
export const DEFAULT_VALUE_FIELD: string = 'businesskey'; // 默认值集值字段名
export const PRIMARY_FIELD: string = 'businesskey'; // 默认值集值字段名
export const DEFAULT_COMMON_SUPPLIER_PARAM = {
  viewCode: 'SUPPLIER_FAVOURITE',
};
export const MORE_TABS: { [propName: string]: string } = {
  SUPPLIER_AVAILABLE: 'supplierAvailable',
  SUPPLIER_CATEGORY: 'supplierCategory',
  CONTACT_PERSON: 'contactPerson',
  QUALIFICATION_DOCUMENTS: 'qualificationDocuments',
  BANK_INFO: 'backInfo',
  PERFORMANCE_EVALUATION: 'performanceEvaluation',
};

export const tableDSConfig = ({
  originRecord,
  originDataSet,
  name,
  multiple,
  searchCode,
  textField,
  valueField,
  key,
  commonTableDs,
  queryParams,
  queryData,
  tableCode,
  subTableCode,
}: {
  originRecord: Record,
  originDataSet: DataSet;
  name: string;
  multiple: boolean;
  searchCode: string;
  textField?: string;
  valueField?: string;
  key: string;
  commonTableDs?: DataSet;
  queryParams?: any;
  queryData?: any;
  tableCode?: string;
  subTableCode?: string;
}) =>
  ({
    selection: multiple ? 'multiple' : 'single',
    autoQuery: false,
    autoCreate: false,
    cacheSelection: true,
    fields: [
      {
        // 主键
        name: 'businesskey',
        unique: true,
      },
      {
        name: 'supplierNum',
        label: intl.get('srm.common.supplier.model.supplierNumber').d('供应商编码'),
      },
      {
        name: 'supplierName',
        label: intl.get('srm.common.supplier.model.supplierName').d('供应商名称'),
      },
      {
        name: 'unifiedSocialCode',
        label: intl.get('sslm.common.modal.common.socialCode').d('统一社会信用代码'),
      },
      {
        name: 'businessRegistrationNumber',
        label: intl.get('sslm.common.modal.common.registrationNumber').d('企业注册登记号/税号'),
      },
      {
        name: 'dunsCode',
        label: intl.get('sslm.common.modal.common.dunsCode').d('邓白氏编码'),
      },
      {
        name: "supplierCompanyNum",
        label: intl.get('srm.common.supplier.model.platformSupplierCode').d('平台供应商编码'),
      },
      {
        name: "supplierCompanyName",
        label: intl.get('srm.common.supplier.model.platformSupplierName').d('平台供应商名称'),
      },
      {
        name: "localSupplierNum",
        label: intl.get('srm.common.supplier.model.localSupplierCode').d('本地供应商编码'),
      },
      {
        name: "localSupplierName",
        label: intl.get('srm.common.supplier.model.localSupplierName').d('本地供应商名称'),
      },
      {
        name: 'companyName',
        label: intl.get('srm.common.supplier.model.companyName').d('公司名称'),
      },
      {
        name: 'companyNum',
        label: intl.get('srm.common.supplier.model.companyNum').d('公司编码'),
      },
      {
        name: 'registeredCapital',
        label: intl.get('srm.common.supplier.model.registeredCapital').d('注册资本(万人民币)'),
      },
      {
        name: 'name',
        label: intl.get('srm.common.supplier.model.contactName').d('联系人'),
      },
      {
        name: 'mobilephone',
        label: intl.get('srm.common.supplier.model.mobilephone').d('手机号'),
      },
      {
        name: 'authorizeFlag',
        label: intl.get('srm.common.supplier.model.authorizedSupplier').d('特准供应商'),
      },
      {
        name: 'blacklistFlag',
        label: intl.get('srm.common.supplier.model.blacklistedSuppliers').d('黑名单供应商'),
      },
      {
        name: 'synergyFlag',
        label: intl.get('srm.common.supplier.model.synergySuppliers').d('是否协同'),
      },
      {
        name: 'isElectronTagMeaning',
        label: intl.get('srm.common.supplier.model.isElectronTag').d('是否电子签'),
      },
      {
        name: 'businessNature',
        label: intl.get('srm.common.supplier.model.businessNature').d('经营性质'),
      },
      {
        name: 'companyTypeMeaning',
        label: intl.get('srm.common.supplier.model.companyType').d('企业类型'),
      },
      {
        name: 'supplierCategoryName',
        label: intl.get('srm.common.supplier.model.supplierCategory').d('供应商分类'),
      },
    ],
    events: {
      load: ({ dataSet }: { dataSet: DataSet }) => {
        if (key === 'all') {
          handleAllTableDsLoad({ dataSet, originRecord, originDataSet, name, textField, valueField, commonTableDs, multiple });
        }
      },
    },
    transport: {
      read: ({ data, params }) => {
        // 查询时带上lovPara
        let lovPara = {};
        if (originDataSet.getField(name)) {
          lovPara = toJS(originDataSet.getField(name)!.get('lovPara', originDataSet.current)) || {};
        }
        const { __customParam__, queryCompanyId, ...other } = data;
        const requestData = {
          ...other,
          ...lovPara,
          ...(queryData || {}),
          ...(__customParam__ || {}),
        };
        return {
          url: `${SRM_SSLM}/v1/${tenantId}/supplier-basics/find`,
          method: 'POST',
          data: {
            ...requestData,
            companyId: requestData.companyId||queryCompanyId,
          },
          params: {
            ...(queryParams || {}),
            ...params,
            customizeUnitCode: `${searchCode},${tableCode},${subTableCode}`,
          },
        };
      },
    },
  } as DataSetProps);

const handleAllTableDsLoad = ({
  dataSet,
  originRecord,
  originDataSet,
  name,
  commonTableDs,
  textField,
  valueField,
  multiple,
}: {
  dataSet: DataSet;
  originRecord: Record,
  originDataSet: DataSet;
  name: string;
  textField?: string;
  valueField?: string;
  commonTableDs?: DataSet;
  multiple: boolean;
}) => {
  // 只在第一次load的时候处理
  const notFirstLoadFlag: boolean = dataSet.getState('notFirstLoadFlag');
  if (notFirstLoadFlag) {
    return;
  }
  dataSet.setState('notFirstLoadFlag', true);
  const lovRecord = originRecord || originDataSet.current;
  // 同步常用供应商和全部供应商的选中或不选择状态
  if (commonTableDs?.records?.length) {
    const cachedSelecteds: Record[] = !dataSet.cachedSelected?.length ? [] : dataSet.cachedSelected;
    commonTableDs.records.forEach(item => {
      const oldSelected = dataSet.selected.find(
        r => r.get(PRIMARY_FIELD) && r.get(PRIMARY_FIELD) === item.get(PRIMARY_FIELD)
      );
      const cacheSelected = dataSet.cachedSelected.find(
        r => r.get(PRIMARY_FIELD) && r.get(PRIMARY_FIELD) === item.get(PRIMARY_FIELD)
      );
      if (!item.isSelected) {
        if (oldSelected) {
          oldSelected.isSelected = false;
        }
        if (cacheSelected) {
          cacheSelected.isSelected = false;
        }
      } else if (!oldSelected && !cacheSelected) {
        const oldRecord = dataSet.records.find(
          r => r.get(PRIMARY_FIELD) && r.get(PRIMARY_FIELD) === item.get(PRIMARY_FIELD)
        );
        if (oldRecord) {
          oldRecord.isSelected = true;
        } else {
          const newSelected = new Record(toJS(item), dataSet, RecordStatus.sync);
          newSelected.isSelected = true;
          newSelected.isCached = true;
          cachedSelecteds.push(newSelected);
        }
      }
    });
    dataSet.setCachedSelected(cachedSelecteds);
    return;
  }
  const initialSelected = toJS(lovRecord?.get(name));
  if (multiple ? !initialSelected?.length : !initialSelected) {
    return;
  }
  // 同步初始值和表格数据的选中状态
  const cachedSelected: Record[] = [];
  const initRecordSelected = value => {
    const primitiveValue = value[PRIMARY_FIELD];
    const oldSelected = dataSet.records.find(r => r.get(PRIMARY_FIELD) === primitiveValue);
    if (oldSelected) {
      oldSelected.isSelected = true;
    } else {
      const newSelected = new Record(toJS(value), dataSet, RecordStatus.sync);
      newSelected.isSelected = true;
      newSelected.isCached = true;
      cachedSelected.push(newSelected);
    }
  };
  runInAction(() => {
    if (multiple) {
      initialSelected.forEach(initRecordSelected);
    } else {
      initRecordSelected(initialSelected);
    }
  });
  // 过滤掉combo值
  const noComboSelected = cachedSelected.filter(s => !(s.get(valueField || PRIMARY_FIELD) && s.get(valueField || PRIMARY_FIELD) === s.get(textField || DEFAULT_TEXT_FIELD)));
  dataSet.setCachedSelected(noComboSelected);
};

export const renderLifeCycleTag = (lifeCycleCode: string = '', lifeCycleDesc: string = '') => {
  switch (lifeCycleCode) {
    // 推荐
    case 'RECOMMEND':
      return <Tag color="yellow">{lifeCycleDesc}</Tag>;
    // 潜在
    case 'POTENTIAL':
      return <Tag color="blue">{lifeCycleDesc}</Tag>;
    // 合格
    case 'QUALIFIED':
      return <Tag color="green">{lifeCycleDesc}</Tag>;
    // 淘汰
    case 'ELIMINATED':
      return <Tag color="red">{lifeCycleDesc}</Tag>;
    // 注册
    default:
      return <Tag color="gray">{lifeCycleDesc}</Tag>;
  }
};

export const supplierCategoryDSConfig = ({ supplierRecord }: { supplierRecord: Record }) =>
  ({
    selection: false,
    fields: [
      {
        name: 'categoryCode',
        label: intl.get('srm.common.supplier.model.categoryCode').d('分类代码'),
      },
      {
        name: 'categoryDescription',
        label: intl.get('srm.common.supplier.model.categoryDescription').d('分类描述'),
      },
      {
        name: 'evaluationLevel',
        label: intl.get('srm.common.supplier.model.evaluationLevel').d('评级'),
      },
      {
        name: 'evaluationScore',
        label: intl.get('srm.common.supplier.model.evaluationScore').d('评分'),
      },
      {
        name: 'enabledFlag',
        label: intl.get('srm.common.supplier.model.enabledFlag').d('状态'),
      },
    ],
    transport: {
      read: () => {
        const { supplierCompanyId, supplierTenantId } = supplierRecord.get([
          'supplierCompanyId',
          'supplierTenantId',
        ]);
        return {
          url: `${SRM_SSLM}/v1/${tenantId}/supplier-category-assign`,
          method: 'GET',
          data: {
            supplierCompanyId,
            supplierTenantId,
            isAssignFlag: 1,
            isEnabledFlag: 1,
          },
        };
      },
    },
  } as DataSetProps);

export const supplierAvailableDSConfig = ({ supplierRecord }: { supplierRecord: Record }) =>
  ({
    selection: false,
    fields: [
      { name: 'itemCode', label: intl.get('srm.common.supplier.model.itemCode').d('物料编码') },
      { name: 'itemName', label: intl.get('srm.common.supplier.model.itemName').d('物料名称') },
      {
        name: 'itemCategoryCode',
        label: intl.get('srm.common.supplier.model.itemCategoryCode').d('品类代码'),
      },
      {
        name: 'itemCategoryName',
        label: intl.get('srm.common.supplier.model.itemCategoryName').d('品类名称'),
      },
      {
        name: 'supplyFlag',
        label: intl.get('srm.common.supplier.model.supplyFlag').d('是否可供'),
      },
    ],
    transport: {
      read: () => {
        const { companyId, supplierCompanyId } = supplierRecord.get([
          'companyId',
          'supplierCompanyId',
        ]);
        return {
          url: `${SRM_SSLM}/v1/${tenantId}/supply-ability-lines/query`,
          method: 'GET',
          data: {
            companyId,
            supplierCompanyId,
            customizeUnitCode: 'SSLM.SUPPLIER_LIFE_CYCLE.ABILITY_LINE_TABLE',
          },
        };
      },
    },
  } as DataSetProps);

export const contactDSConfig = ({ supplierRecord }: { supplierRecord: Record }) =>
  ({
    selection: false,
    fields: [
      { name: 'name', label: intl.get('srm.common.supplier.model.name').d('姓名') },
      { name: 'department', label: intl.get('srm.common.supplier.model.department').d('部门') },
      { name: 'position', label: intl.get('srm.common.supplier.model.position').d('职务') },
      {
        name: 'contactTypeMeaning',
        label: intl.get('srm.common.supplier.model.contactType').d('联系人类型'),
      },
      {
        name: 'mobilephone',
        label: intl.get('srm.common.supplier.model.mobilephone').d('电话号码'),
      },
      { name: 'mail', label: intl.get('srm.common.supplier.model.mail').d('邮箱地址') },
      {
        name: 'defaultFlag',
        label: intl.get('srm.common.supplier.model.defaultFlag').d('默认联系人'),
      },
      { name: 'enabledFlag', label: intl.get('hzero.common.status.enable').d('启用') },
    ],
    transport: {
      read: () => {
        const { companyId, supplierId, supplierCompanyId } = supplierRecord.get([
          'companyId',
          'supplierId',
          'supplierCompanyId',
        ]);
        // 有supplierCompanyId是srm供应商。没有是erp供应商
        if (supplierCompanyId) {
          return {
            url: `${SRM_SSLM}/v1/${tenantId}/supplier-contracts/getsupplierContact`,
            method: 'GET',
            data: {
              purchaserTenantId: tenantId,
              purchaserCompanyId: companyId,
              supplierCompanyId,
              enabledFlag: 1,
            },
          };
        } else {
          return {
            url: `${SRM_SSLM}/v1/${tenantId}/ext-supplier-contacts/${supplierId}`,
            method: 'GET',
            data: {
              enabledFlag: 1,
              customizeUnitCode: 'SPFM.PARTNER_LIST_SUPPLIER.CONTACTS',
            },
          };
        }
      },
    },
  } as DataSetProps);

export const attachmentDSConfig = ({ supplierRecord }: { supplierRecord: Record }) =>
  ({
    selection: false,
    fields: [
      {
        name: 'attachmentTypeMeaning',
        label: intl.get('srm.common.supplier.model.attachmentType').d('附件类型'),
      },
      {
        name: 'description',
        label: intl.get('srm.common.supplier.model.attachmentDescription').d('附件描述'),
      },
      {
        type: FieldType.attachment,
        name: 'attachmentUuid',
        bucketName: PRIVATE_BUCKET,
        label: intl.get('srm.common.supplier.model.attachmentInfo').d('附件信息'),
      },
      {
        name: 'uploadDate',
        label: intl.get('srm.common.supplier.model.uploadDate').d('最后上传日期'),
      },
      {
        name: 'endDate',
        label: intl.get('srm.common.supplier.model.endDate').d('文件到期日'),
      },
      {
        name: 'remark',
        label: intl.get('srm.common.supplier.model.remark').d('备注'),
      },
    ],
    transport: {
      read: () => {
        const { companyId, supplierCompanyId } = supplierRecord.get([
          'companyId',
          'supplierCompanyId',
        ]);
        if (!companyId || !supplierCompanyId) {
          return undefined;
        }
        return {
          url: `${SRM_SSLM}/v1/${tenantId}/supplier-attachments/getSupplierAttachment`,
          method: 'GET',
          data: {
            purchaserTenantId: tenantId,
            purchaserCompanyId: companyId,
            supplierCompanyId,
            customizeUnitCode: 'SSLM.SUPPLIER_LIFE_CYCLE.DETAIL.BUSINESS',
          },
        };
      },
    },
  } as DataSetProps);

export const bankInfoDSConfig = ({ supplierRecord }: { supplierRecord: Record }) =>
  ({
    selection: false,
    fields: [
      {
        name: 'bankCountryIdMeaning',
        label: intl.get('srm.common.supplier.model.bankCountry').d('国家'),
      },
      {
        name: 'bankCode',
        label: intl.get('srm.common.supplier.model.bankCode').d('银行编码'),
      },
      {
        name: 'bankName',
        label: intl.get('srm.common.supplier.model.bankName').d('银行名称'),
      },
      {
        name: 'bankFirm',
        label: intl.get('srm.common.supplier.model.bankFirm').d('联行行号'),
      },
      {
        name: 'bankBranchName',
        label: intl.get('srm.common.supplier.model.bankBranchName').d('开户行名称'),
      },
      {
        name: 'bankAccountName',
        label: intl.get('srm.common.supplier.model.bankAccountName').d('账户名称'),
      },
      {
        name: 'bankAccountNum',
        label: intl.get('srm.common.supplier.model.bankAccountNum').d('银行账户'),
      },
      {
        name: 'accountNatureMeaning',
        label: intl.get('srm.common.supplier.model.accountNature').d('账户性质'),
      },
      {
        name: 'accountPurposeMeaning',
        label: intl.get('srm.common.supplier.model.accountPurpose').d('账户用途'),
      },
      {
        name: 'currencyIdMeaning',
        label: intl.get('srm.common.supplier.model.currencyName').d('币种'),
      },
      {
        name: "bankIdentifyCodeTypeMeaning",
        label: intl.get("sslm.common.model.bank.bankIdentifyCodeType").d("银行识别码类型"),
      },
      {
        name: "bankIdentifyCode",
        label: intl.get("sslm.common.model.bank.bankIdentifyCode").d("银行识别码"),
      },
      {
        name: 'paymentTypeIdMeaning',
        label: intl.get('srm.common.supplier.model.paymentType').d('付款方式'),
      },
      {
        name: 'enabledFlag',
        label: intl.get('hzero.common.status.enable').d('启用'),
      },
      {
        name: 'masterFlag',
        label: intl.get('srm.common.supplier.model.masterFlag').d('主账号'),
      },
      {
        name: 'remark',
        label: intl.get('srm.common.supplier.model.remark').d('备注'),
      },
    ],
    transport: {
      read: () => {
        const { companyId, supplierCompanyId, supplierId } = supplierRecord.get([
          'companyId',
          'supplierCompanyId',
          'supplierId',
        ]);
        if (supplierCompanyId) {
          return {
            url: `${SRM_SSLM}/v1/${tenantId}/supplier-bank-accounts/getSupplierBankPage`,
            method: 'GET',
            data: {
              purchaserCompanyId: companyId,
              purchaserTenantId: tenantId,
              enabledFlag: 1,
              supplierCompanyId,
              customizeUnitCode: 'SSLM.SUPPLIER_LIFE_CYCLE.BANK_INFO',
            },
          };
        } else {
          return {
            url: `${SRM_SSLM}/v1/${tenantId}/ext-sup-bank-accts/${supplierId}`,
            method: 'GET',
            data: {
              customizeUnitCode: 'SPFM.PARTNER_LIST_SUPPLIER.BANK_ACCT',
            },
          };
        }

      },
    },
  } as DataSetProps);

export const performanceEvaluationDSConfig = ({ supplierRecord }: { supplierRecord: Record }) =>
  ({
    selection: false,
    fields: [
      {
        name: 'evalStatusMeaning',
        label: intl.get('srm.common.supplier.model.evalStatus').d('档案状态'),
      },
      {
        name: 'evalNum',
        label: intl.get('srm.common.supplier.model.evalNum').d('档案编码'),
      },
      {
        name: 'evalName',
        label: intl.get('srm.common.supplier.model.evalName').d('档案描述'),
      },
      {
        name: 'evalTplName',
        label: intl.get('srm.common.supplier.model.evalTplName').d('考评模板'),
      },
      {
        name: 'kpiMethodMeaning',
        label: intl.get('srm.common.supplier.model.kpiMethod').d('考评方式'),
      },
      {
        name: 'evalCycleMeaning',
        label: intl.get('srm.common.supplier.model.evalCycleMeaning').d('考评周期'),
      },
      {
        name: 'evalDateFrom',
        label: intl.get('srm.common.supplier.model.evalDateFrom').d('考评日期从'),
      },
      {
        name: 'evalDateTo',
        label: intl.get('srm.common.supplier.model.evalDateTo').d('考评日期至'),
      },
      {
        name: 'evalDimensionMeaning',
        label: intl.get('srm.common.supplier.model.evalDimension').d('考评维度'),
      },
      {
        name: 'evalDimensionValueMeaning',
        label: intl.get('srm.common.supplier.model.evalDimensionValue').d('维度值'),
      },
      {
        name: 'levelCode',
        label: intl.get('srm.common.supplier.model.levelCodes').d('评分等级'),
      },
      {
        name: 'processUserName',
        label: intl.get('srm.common.supplier.model.processUserName').d('考评负责人'),
      },
      {
        name: 'processUnitName',
        label: intl.get('srm.common.supplier.model.processUnitName').d('考评负责人部门'),
      },
      {
        name: 'creationDate',
        label: intl.get('srm.common.supplier.model.creationDate').d('建档时间'),
      },
      {
        name: 'finalScore',
        label: intl.get('srm.common.supplier.model.finalScore').d('考评得分'),
      },
    ],
    transport: {
      read: () => {
        const { supplierCompanyId } = supplierRecord.get([
          'supplierCompanyId',
        ]);
        if (!supplierCompanyId) {
          return undefined;
        }
        return {
          url: `${SRM_SSLM}/v1/${tenantId}/eval-headers/query-kpi-evalLineDeatil`,
          method: 'GET',
          data: {
            supplierCompanyId,
            tenantId,
          },
        };
      },
    },
  } as DataSetProps);
