import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { SRM_SSLM } from '_utils/config';
import { checkCategoryCode } from '@/services/supplierCategoryService';

const organizationId = getCurrentOrganizationId();

const getSupplierCategoryDS = () => ({
  paging: false,
  forceValidate: true,
  selection: false,
  parentField: 'parentCategoryId',
  idField: 'categoryId',
  fields: [
    {
      name: 'categoryCode',
      label: intl
        .get('sslm.supplierCategory.model.supplierCategory.categoryEncoding')
        .d('供应商分类编码'),
    },
    {
      name: 'categoryDescription',
      label: intl.get('sslm.supplierCategory.model.supplierCategory.caDesc').d('供应商分类描述'),
    },
    {
      name: 'evaluationLevelFlag',
      label: intl.get('sslm.supplierCategory.model.supplierCategory.evalLevelFlag').d('是否评级项'),
    },
    {
      name: 'evaluationScoreFlag',
      label: intl.get('sslm.supplierCategory.model.supplierCategory.evalScoreFlag').d('是否评分项'),
    },
    {
      name: 'multiFlag',
      label: intl
        .get('sslm.supplierCategory.model.supplierCategoryNew.multiFlag')
        .d('允许多选末级'),
      help: intl
        .get('sslm.supplierCategory.model.supplierCategory.multiFlag.help')
        .d('若为是，则在维护供应商分类时，供应商可以维护该顶级分类下级的多个子分类'),
    },
    {
      name: 'setToLabelFlag',
      label: intl.get('sslm.supplierCategory.model.supplierCategory.setLabel').d('设为标签'),
    },
    {
      name: 'labelLevelConfig',
      label: intl.get('sslm.supplierCategory.model.supplierCategory.labelConfig').d('标签层级配置'),
    },
    {
      name: 'introCategoryFlag',
      label: intl.get('sslm.supplierCategory.model.supplierCategory.importClassify').d('引入分类'),
      help: intl
        .get('sslm.supplierCategory.model.supplierCategory.importClassify.help')
        .d(
          '若为是，通过业务规则定义控制采购发送邀约时邀约信息里需要至少填写一条引入分类时，可以选择此分类作为引入分类'
        ),
    },
    {
      name: 'synergyFlag',
      label: intl.get('sslm.supplierCategory.model.supplierCategoryNew.synergyFlag').d('协同'),
      help: intl
        .get('sslm.supplierCategory.model.supplierCategory.synergyFlag.help')
        .d(
          '此标识主要作用：判断在后续订单送货对账等业务流程中是否需要供应商参与协同，做不协同供应商的信息变更可修改其基础信息，有一个启用的不协同分类的供应商即为不协同供应商。'
        ),
    },
    {
      name: 'enabledFlag',
      label: intl.get('hzero.common.status').d('状态'),
    },
  ],
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supplier-categorys/tree-c7n-new`,
        method: 'GET',
        params: {
          ...params,
          customizeUnitCode:
            'SSLM.SUPPLIER_CATEGORY_LIST_NEW.SEARCH_TABLE,SSLM.SUPPLIER_CATEGORY_LIST_NEW.TABLE',
        },
      };
    },
  },
});

const getSupplierCategoryModalDS = type => ({
  forceValidate: true,
  fields: [
    {
      name: 'categoryCode',
      label: intl
        .get('sslm.supplierCategory.model.supplierCategory.categoryEncoding')
        .d('供应商分类编码'),
      required: true,
      disabled: type === 'edit',
      validator: async value => {
        const reg = /^[A-Za-z0-9][A-Za-z0-9-_./]*$/;
        if (!reg.test(value)) {
          return intl
            .get('sslm.supplierCategory.view.validation.CategoryCodeformat')
            .d('供应商分类编码格式需为英文字母或数字开头，由英文字母、数字以及符号_./组成');
        }
        const res = await getResponse(checkCategoryCode({ categoryCode: value }));
        if (!isEmpty(res) && type !== 'edit') {
          return intl
            .get('sslm.supplierCategory.view.validation.uniqueCategoryCode')
            .d('供应商分类代码重复');
        }
      },
    },
    {
      name: 'categoryDescription',
      type: 'intl',
      label: intl.get('sslm.supplierCategory.model.supplierCategory.caDesc').d('供应商分类描述'),
      required: true,
    },
    {
      name: 'evaluationLevelFlag',
      label: intl.get('sslm.supplierCategory.model.supplierCategory.evalLevelFlag').d('是否评级项'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      name: 'evaluationScoreFlag',
      label: intl.get('sslm.supplierCategory.model.supplierCategory.evalScoreFlag').d('是否评分项'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      name: 'multiFlag',
      label: intl
        .get('sslm.supplierCategory.model.supplierCategoryNew.multiFlag')
        .d('允许多选末级'),
      type: 'boolean',
      help: intl
        .get('sslm.supplierCategory.model.supplierCategory.multiFlag.help')
        .d('若为是，则在维护供应商分类时，供应商可以维护该顶级分类下级的多个子分类'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      name: 'setToLabelFlag',
      label: intl.get('sslm.supplierCategory.model.supplierCategory.setLabel').d('设为标签'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      name: 'labelLevelConfig',
      label: intl.get('sslm.supplierCategory.model.supplierCategory.labelConfig').d('标签层级配置'),
      lookupCode: 'SSLM.LABEL_LEVEL_CONFIG',
    },
    {
      name: 'introCategoryFlag',
      label: intl.get('sslm.supplierCategory.model.supplierCategory.importClassify').d('引入分类'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      help: intl
        .get('sslm.supplierCategory.model.supplierCategory.importClassify.help')
        .d(
          '若为是，通过业务规则定义控制采购发送邀约时邀约信息里需要至少填写一条引入分类时，可以选择此分类作为引入分类'
        ),
    },
    {
      name: 'synergyFlag',
      label: intl.get('sslm.supplierCategory.model.supplierCategoryNew.synergyFlag').d('协同'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      help: intl
        .get('sslm.supplierCategory.model.supplierCategory.synergyFlag.help')
        .d(
          '此标识主要作用：判断在后续订单送货对账等业务流程中是否需要供应商参与协同，做不协同供应商的信息变更可修改其基础信息，有一个启用的不协同分类的供应商即为不协同供应商。'
        ),
    },
  ],
  transport: {
    submit: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supplier-categorys`,
        method: 'POST',
        data,
        params: {
          ...params,
          customizeUnitCode:
            'SSLM.SUPPLIER_CATEGORY_LIST_NEW.SEARCH_TABLE,SSLM.SUPPLIER_CATEGORY_LIST_NEW.TABLE',
        },
      };
    },
  },
});

export { getSupplierCategoryDS, getSupplierCategoryModalDS };
