import moment from 'moment';

import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { validateBits, conversionUpdate, getDynamicLabel, getPrecision } from '@/utils/util';

const organizationId = getCurrentOrganizationId();

// 协议标的信息
const subjectDS = (props) => {
  const { editable, pcHeaderId, doubleUomFlag, headerFormDs, headerInfo = {} } = props;
  const {
    pcKindCode,
    contractPurpose,
    // priceTypeMeaning,
    companyId,
    pcSourceCode,
    priceType = 'NONE',
    supplierCurrencyCode = 'CNY',
    purchaseCurrencyCode = 'CNY',
    amountControlDimension,
    manuallyModifyAmount,
  } = headerInfo;

  // 当协议性质为框架协议，物料名称选填，物料分类必填
  const pcKindRequired = !['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(pcKindCode);
  // 当协议性质为框架协议，协议用途为电商采购，该字段为false
  const taxIncludedUpRequired = !(
    ['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(pcKindCode) &&
    contractPurpose === 'OMMERCE_PURCHASE'
  );
  // 当为引用订单创建时
  const onlyReadFlag = pcSourceCode === 'PURCHASE_ORDER' || pcSourceCode === '采购订单';
  return {
    selection: editable && 'multiple',
    primaryKey: 'pcSubjectId',

    fields: [
      {
        name: 'lineNum',
        type: 'string',
        label: intl.get(`spcm.common.model.common.orderSeq`).d('序号'),
      },
      {
        name: 'projectTaskId',
        label: intl.get('spcm.common.model.projectTaskName').d('项目任务名称'),
        lovCode: 'SIEC.PROJECT_TASK_TREE',
        type: 'object',
        transformRequest: (value) => value && value.taskId,
        transformResponse: (value, object) => {
          const { projectTaskId, projectTaskName } = object;
          return value ? { taskId: projectTaskId, taskName: projectTaskName } : null;
        },
        lovPara: {
          tileTreeFlag: 1,
          businessObjectCode: 'SRM_C_SRM_SPCM_PC_HEADER',
        },
        optionsProps: {
          paging: 'server',
          idField: 'taskId',
          parentField: 'parentTaskId',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
      },
      {
        name: 'itemCodeLov',
        type: 'object',
        label: intl.get(`spcm.common.model.common.itemCode`).d('物料编码'),
        lovCode: 'SPCM.ITEM_RELATE_PUR_PRICE',
        ignore: 'always',
        textField: 'itemCode',
        dynamicProps: {
          lovPara: () => ({
            companyId,
            enabledFlag: 1,
            tenantId: organizationId,
          }),
        },
      },
      {
        name: 'itemCode',
        bind: 'itemCodeLov.itemCode',
      },
      {
        name: 'itemId',
        bind: 'itemCodeLov.itemId',
      },
      {
        name: 'itemName',
        type: 'string',
        label: intl.get(`spcm.common.model.common.itemName`).d('物料名称'),
        required: pcKindRequired,
        validator: (value) => {
          if (value && value.length > 360) {
            return intl.get('hzero.common.validation.max', { max: 360 });
          }
          return true;
        },
      },
      {
        name: 'invOrganizationIdLov',
        type: 'object',
        label: intl.get(`spcm.common.model.invOrganizationId`).d('库存组织'),
        lovCode: 'SPCM.UNIT_PUR_ORGANIZATION',
        ignore: 'always',
        textField: 'invOrganizationName',
        dynamicProps: {
          lovPara: () => {
            return {
              ouId: headerFormDs?.current?.get('ouId'),
              tenantId: organizationId,
            };
          },
        },
      },
      {
        name: 'invOrganizationId',
        bind: 'invOrganizationIdLov.invOrganizationId',
      },
      {
        name: 'invOrganizationName',
        bind: 'invOrganizationIdLov.invOrganizationName',
      },
      {
        name: 'categoryIdLov',
        type: 'object',
        label: intl.get(`spcm.common.model.common.categoryName`).d('物料分类'),
        // lovCode: 'SPCM.SMDM.TREE_ITEM_CATEGORY',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        ignore: 'always',
        textField: 'categoryName',
        required: !pcKindRequired,
        dynamicProps: {
          lovPara: () => ({
            enabledFlag: 1,
            tiledFlag: 1,
            // module: 'PR',
            tenantId: organizationId,
            businessObjectCode: 'SRM_C_SRM_SPCM_PC_HEADER',
          }),
        },
        optionsProps: {
          paging: 'server',
          idField: 'categoryId',
          parentField: 'parentCategoryId',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
      },
      {
        name: 'categoryId',
        bind: 'categoryIdLov.categoryId',
      },
      {
        name: 'categoryName',
        bind: 'categoryIdLov.categoryName',
      },
      {
        name: 'specifications',
        type: 'string',
        label: intl.get(`spcm.common.model.common.specifications`).d('规格'),
        validator: (value) => {
          if (value && value.length > 480) {
            return intl.get('hzero.common.validation.max', { max: 480 });
          }
          return true;
        },
      },
      {
        name: 'model',
        type: 'string',
        label: intl.get(`spcm.common.model.common.model`).d('型号'),
        validator: (value) => {
          if (value && value.length > 480) {
            return intl.get('hzero.common.validation.max', { max: 480 });
          }
          return true;
        },
      },
      {
        name: 'uomIdLov',
        type: 'object',
        // label: intl.get(`spcm.common.model.common.unit`).d('单位'),
        lovCode: 'SPCM.UOM',
        required: taxIncludedUpRequired,
        ignore: 'always',
        textField: 'uomCodeAndName',
        dynamicProps: {
          label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled')),
          lovPara: () => ({
            tenantId: organizationId,
          }),
          disabled: ({ record }) => doubleUomFlag && record.get('itemCode'),
        },
      },
      {
        name: 'uomId',
        bind: 'uomIdLov.uomId',
      },
      {
        name: 'uomCode',
        bind: 'uomIdLov.uomCode',
      },
      {
        name: 'uomName',
        bind: 'uomIdLov.uomName',
      },
      {
        name: 'uomCodeAndName',
        bind: 'uomIdLov.uomCodeAndName',
      },
      {
        name: 'uomPrecision',
        bind: 'uomIdLov.uomPrecision',
      },
      {
        name: 'secondaryUomId',
        type: 'object',
        label: intl.get(`spcm.common.model.common.unit`).d('单位'),
        lovCode: 'SMDM_ITEM_ORG_UOM',
        // required: taxIncludedUpRequired,
        ignore: 'always',
        textField: 'uomCodeAndName',
        dynamicProps: {
          lovPara: ({ record }) => ({
            tenantId: organizationId,
            itemId: record.get('itemId'),
            primaryUomId: record.get('uomId'),
          }),
          required: ({ dataSet }) => taxIncludedUpRequired && dataSet.getState('doubleUnitEnabled'),
          disabled: ({ record }) => doubleUomFlag && record.get('itemCode'),
        },
        transformResponse: (value, object) =>
          object?.secondaryUomId
            ? {
                uomId: object?.secondaryUomId,
                uomCode: object?.secondaryUomCode,
                uomName: object?.secondaryUomName,
                uomCodeAndName: object?.secondaryUomCodeAndName,
              }
            : null,
        transformRequest: (value) => {
          return value?.uomId;
        },
      },
      {
        name: 'secondaryUomCode',
        bind: 'secondaryUomId.uomCode',
      },
      {
        name: 'secondaryUomName',
        bind: 'secondaryUomId.uomName',
      },
      {
        name: 'secondaryUomCodeAndName',
        bind: 'secondaryUomId.uomCodeAndName',
      },
      {
        name: 'secondaryUomPrecision',
        bind: 'secondaryUomId.secondaryUomPrecision',
      },
      {
        name: 'quantity',
        // label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
        type: 'number',
        required: pcKindRequired,
        dynamicProps: {
          label: ({ dataSet }) =>
            getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
          precision: ({ record }) => getPrecision(record.get('uomPrecision')),
        },
        validator: (value) => validateBits(value),
      },
      {
        name: 'secondaryQuantity',
        label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
        type: 'number',
        // required: pcKindRequired,
        dynamicProps: {
          required: ({ dataSet }) => pcKindRequired && dataSet.getState('doubleUnitEnabled'),
          precision: ({ record }) => getPrecision(record.get('secondaryUomPrecision')),
        },
        validator: (value) => validateBits(value),
      },
      {
        name: 'taxIdLov',
        type: 'object',
        label: intl.get(`spcm.common.model.common.taxType`).d('税种'),
        lovCode: 'SPCM.TAX',
        required: taxIncludedUpRequired,
        ignore: 'always',
        textField: 'taxCode',
      },
      {
        name: 'taxId',
        bind: 'taxIdLov.taxId',
        required: taxIncludedUpRequired,
      },
      {
        name: 'taxCode',
        bind: 'taxIdLov.taxCode',
      },
      {
        name: 'taxRate',
        type: 'string',
        label: intl.get(`spcm.common.model.common.taxRate`).d('税率(%)'),
        // bind: 'taxIdLov.taxRate',
        disabled: true,
      },
      {
        name: 'unitPriceBatch',
        type: 'number',
        label: intl.get(`spcm.common.model.common.unitPriceBatch`).d('价格批量'),
        dynamicProps: {
          defaultValue: ({ record }) =>
            (pcSourceCode === 'PURCHASE_NEED' || pcSourceCode === '采购申请') &&
            !record.get('unitPriceBatch')
              ? 1
              : record.get('unitPriceBatch'),
          precision: ({ record }) => getPrecision(record.get('uomPrecision')),
        },
        validator: (value) => validateBits(value),
      },
      {
        name: 'currencyCodeLov',
        type: 'object',
        label: intl.get(`spcm.common.model.common.currencyCode`).d('原币币种'),
        lovCode: 'SPCM.CURRENCY',
        required: taxIncludedUpRequired,
        ignore: 'always',
        textField: 'currencyCode',
        // dynamicProps: {
        //   defaultValue: ({ value }) =>{
        //     return value || {
        //     currencyCode: supplierCurrencyCode,
        //     };
        //   },
        // },
      },
      {
        name: 'currencyCode',
        bind: 'currencyCodeLov.currencyCode',
      },
      {
        name: 'purchaseCurrencyCodeLov',
        type: 'object',
        label: intl.get(`spcm.common.model.common.purchaseCurrencyCode`).d('本币币种'),
        lovCode: 'SPCM.CURRENCY',
        required: taxIncludedUpRequired,
        ignore: 'always',
        textField: 'currencyCode',
        // dynamicProps: {
        //   defaultValue: ({ value }) =>{
        //     return value || {
        //     currencyCode: purchaseCurrencyCode,
        //     };
        //   },
        // },
      },
      {
        name: 'purchaseCurrencyCode',
        bind: 'purchaseCurrencyCodeLov.currencyCode',
      },
      {
        name: 'exchangeRate',
        type: 'number',
        label: intl.get(`spcm.common.model.common.exchangeRate`).d('汇率:(本币/原币)'),
        required: taxIncludedUpRequired,
        min: 0.0000001,
        precision: 10,
        dynamicProps: {
          defaultValue: ({ record }) =>
            record.get('purchaseCurrencyCode') === record.get('currencyCode')
              ? '1'
              : record.get('exchangeRate'),
          disabled: ({ record }) =>
            record.get('purchaseCurrencyCode') === record.get('currencyCode') ||
            (record.get('disableChangeRate') == null
              ? record.get('defaultExchangeRate') === '1'
              : record.get('disableChangeRate')),
        },
        // transformResponse: (_, record) =>
        //   !(editable && !onlyReadFlag && record.purchaseCurrencyCode !== record.currencyCode) &&
        //   `${record.exchangeRate}:1`,
        validator: (value) => validateBits(value),
      },
      {
        name: 'priceType',
        type: 'string',
        label: intl.get(`spcm.common.priceType`).d('基准价'),
        // transformResponse: (_, record) => record.priceTypeMeaning || priceTypeMeaning,
      },
      {
        name: 'taxIncludedSecondaryUnitPrice',
        label: intl.get(`spcm.common.model.common.inculdeTaxUnitPrice`).d('原币含税单价'),
        min: 0,
        dynamicProps: {
          required: ({ record, dataSet }) =>
            editable &&
            !onlyReadFlag &&
            dataSet.getState('doubleUnitEnabled') &&
            ['TAX_INCLUDED_PRICE', 'NONE'].includes(record.get('priceType') || priceType),
        },
        validator: (value) => validateBits(value),
      },
      {
        name: 'taxIncludedUnitPrice',
        // label: intl.get(`spcm.common.model.common.inculdeTaxUnitPrice`).d('原币含税单价'),
        min: 0,
        dynamicProps: {
          label: ({ dataSet }) =>
            getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'taxIncludedUnitPrice'),
          required: ({ record, dataSet }) =>
            editable &&
            !onlyReadFlag &&
            !dataSet.getState('doubleUnitEnabled') &&
            ['TAX_INCLUDED_PRICE', 'NONE'].includes(record.get('priceType') || priceType),
        },
        validator: (value) => validateBits(value),
      },
      {
        name: 'purchaseTaxIncludedPrice',
        type: 'string',
        label: intl.get(`spcm.common.model.common.purchaseTaxIncludedPrice`).d('本币含税单价'),
      },
      {
        name: 'secondaryUnitPrice',
        label: intl.get(`spcm.common.model.common.unitPrice`).d('原币不含税单价'),
        min: 0,
        dynamicProps: {
          required: ({ record, dataSet }) =>
            editable &&
            !onlyReadFlag &&
            dataSet.getState('doubleUnitEnabled') &&
            ['NET_PRICE', 'NONE'].includes(record.get('priceType') || priceType),
        },
        validator: (value) => validateBits(value),
      },
      {
        name: 'unitPrice',
        // label: intl.get(`spcm.common.model.common.unitPrice`).d('原币不含税单价'),
        min: 0,
        dynamicProps: {
          label: ({ dataSet }) =>
            getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'unitPrice'),
          required: ({ record, dataSet }) =>
            editable &&
            !onlyReadFlag &&
            !dataSet.getState('doubleUnitEnabled') &&
            ['NET_PRICE', 'NONE'].includes(record.get('priceType') || priceType),
        },
        validator: (value) => validateBits(value),
      },
      {
        name: 'taxIncludedLineAmount',
        label: intl.get(`spcm.common.model.common.taxIncludedLineAmount`).d('原币含税行金额'),
      },
      {
        name: 'purchaseTaxLineAmount',
        label: intl.get(`spcm.common.model.common.purchaseTaxLineAmount`).d('本币含税行金额'),
      },
      {
        name: 'lineAmount',
        label: intl.get(`spcm.common.model.common.lineAmount`).d('原币不含税行金额'),
      },
      {
        name: 'taxAmount',
        label: intl.get(`spcm.common.model.common.taxAmount`).d('原币税额'),
      },
      {
        name: 'taxIncludedUnitPriceChinese',
        type: 'string',
        label: intl.get('spcm.common.model.taxIncludedUnitPrice.chinese').d('大写含税单价'),
      },
      {
        name: 'purchaseTaxIncludedPriceChinese',
        type: 'string',
        label: intl
          .get('spcm.common.model.purchaseTaxIncludedPrice.chinese')
          .d('大写本币含税单价(原币含税单价x（本币/原币）)'),
      },
      {
        name: 'taxIncludedLineAmountChinese',
        type: 'string',
        label: intl.get('spcm.common.model.taxIncludedLineAmount.chinese').d('大写含税行金额'),
      },
      {
        name: 'purchaseTaxLineAmountChinese',
        type: 'string',
        label: intl
          .get('spcm.common.model.purchaseTaxLineAmount.chinese')
          .d('大写本币含税行金额(原币含税行金额x（本币/原币）)'),
      },
      {
        name: 'taxAmountChinese',
        type: 'string',
        label: intl.get('spcm.common.model.taxAmount.chinese').d('大写税额'),
      },
      {
        name: 'unitPriceChinese',
        type: 'string',
        label: intl.get('spcm.common.model.unitPrice.chinese').d('大写单价'),
      },
      {
        name: 'lineAmountChinese',
        type: 'string',
        label: intl.get('spcm.common.model.lineAmount.chinese').d('大写行金额'),
      },
      {
        name: 'priceStartDate',
        type: 'date',
        label: intl.get(`spcm.common.model.common.priceStartDate`).d('价格有效期从'),
        dynamicProps: {
          max: ({ record }) => record.get('priceEndDate'),
        },
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        transformResponse: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'priceEndDate',
        type: 'date',
        label: intl.get(`spcm.common.model.common.priceEndDate`).d('价格有效期至'),
        dynamicProps: {
          min: ({ record }) => record.get('priceStartDate'),
        },
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        transformResponse: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'ladderQuote',
        type: 'string',
        label: intl.get(`spcm.common.model.common.ladderQuote`).d('阶梯价格'),
      },
      {
        name: 'deliverDate',
        type: 'date',
        label: intl.get(`spcm.common.model.common.needByDate`).d('交付日期'),
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        transformResponse: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'guaranteePeriod',
        type: 'string',
        label: intl.get(`spcm.common.model.common.guaranteePeriod`).d('保质期'),
      },
      {
        name: 'packages',
        type: 'string',
        label: intl.get(`spcm.common.model.common.packages`).d('包装'),
      },
      {
        name: 'manufacturer',
        type: 'string',
        label: intl.get(`spcm.common.model.common.manufacturer`).d('生产厂家'),
      },
      {
        name: 'brand',
        type: 'string',
        label: intl.get(`spcm.common.model.common.brandName`).d('品牌'),
      },
      {
        name: 'itemProperties',
        type: 'string',
        label: intl.get(`spcm.common.model.common.export.itemPropertiesMeaning`).d('属性'),
        lookupCode: 'SPUC.PR_LINE_ITEM_PROPERTIE',
      },
      {
        name: 'agentIdLov',
        type: 'object',
        label: intl.get(`spcm.common.model.common.agentName`).d('采购员'),
        lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
        ignore: 'always',
      },
      {
        name: 'agentId',
        bind: 'agentIdLov.purchaseAgentId',
      },
      {
        name: 'agentName',
        bind: 'agentIdLov.purchaseAgentName',
      },
      {
        name: 'keeperUserIdLov',
        type: 'object',
        label: intl.get(`spcm.common.model.common.keeperUserName`).d('保管人'),
        lovCode: 'SSLM.USER',
        ignore: 'always',
        textField: 'userName',
        dynamicProps: {
          lovPara: () => ({
            tenantId: organizationId,
          }),
        },
      },
      {
        name: 'keeperUserId',
        bind: 'keeperUserIdLov.userId',
      },
      {
        name: 'keeperUserName',
        bind: 'keeperUserIdLov.userName',
      },
      {
        name: 'accepterUserIdLov',
        type: 'object',
        label: intl.get(`spcm.common.model.common.accepterUserName`).d('验收人'),
        lovCode: 'SSLM.USER',
        ignore: 'always',
        textField: 'userName',
        dynamicProps: {
          lovPara: () => ({
            tenantId: organizationId,
          }),
        },
      },
      {
        name: 'accepterUserId',
        bind: 'accepterUserIdLov.userId',
      },
      {
        name: 'accepterUserName',
        bind: 'accepterUserIdLov.userName',
      },
      {
        name: 'expBearDepIdLov',
        type: 'object',
        label: intl.get(`spcm.common.model.common.expBearDep`).d('费用承担部门'),
        lovCode: 'SPFM.UNIT_G_C',
        ignore: 'always',
        dynamicProps: {
          lovPara: () => ({
            organizationId,
            levelPathFrom: 0,
            levelPathTo: 3,
            unitTypeCode: 'D',
            unitCompanyId: headerFormDs.current.get('companyOrgId'),
          }),
        },
      },
      {
        name: 'expBearDepId',
        bind: 'expBearDepIdLov.unitId',
      },
      {
        name: 'expBearDep',
        bind: 'expBearDepIdLov.unitName',
      },
      {
        name: 'address',
        type: 'string',
        label: intl.get(`spcm.common.model.common.location`).d('地点'),
      },
      {
        name: 'projectNumLov',
        type: 'object',
        label: intl.get(`spcm.common.model.common.projectCode`).d('项目编码'),
        lovCode: 'SPCM.PROJECT',
        ignore: 'always',
        textField: 'projectNum',
        dynamicProps: {
          lovPara: () => ({
            tenantId: organizationId,
            companyId,
          }),
        },
      },
      {
        name: 'projectNum',
        bind: 'projectNumLov.projectNum',
      },
      {
        name: 'projectName',
        type: 'string',
        label: intl.get(`spcm.common.model.common.projectName`).d('项目名称'),
        validator: (value) => {
          if (value && value.length > 480) {
            return intl.get('hzero.common.validation.max', { max: 480 });
          }
          return true;
        },
      },
      {
        name: 'contractActualSource',
        type: 'string',
        label: intl.get(`spcm.common.model.contractActualSource`).d('协议实际来源'),
        help: intl
          .get('spcm.common.view.message.contractActualSource')
          .d('外部系统导入的协议，该字段展示实际协议来源'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get(`hzero.common.remark`).d('备注'),
        validator: (value) => {
          if (value && value.length > 480) {
            return intl.get('hzero.common.validation.max', { max: 480 });
          }
          return true;
        },
      },
      {
        name: 'sourceAppScopeLineDTOs',
        type: 'object',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.applicationOrganization`)
          .d('适用其他组织'),
      },
      {
        name: 'sourceCode',
        type: 'string',
        label: intl.get(`spcm.common.model.common.sourceCode`).d('来源单据编号'),
      },
      {
        name: 'sourceLineNum',
        type: 'string',
        label: intl.get(`spcm.common.model.common.sourceLineNum`).d('来源单据行号'),
      },
      {
        name: 'receiptsStatusMeaning',
        type: 'string',
        label: intl.get(`spcm.common.model.receiptsStatus`).d('执行状态'),
      },
      {
        name: 'referPrice',
        type: 'string',
        label: intl.get(`spcm.workspace.model.common.referPrice`).d('参考价格'),
      },
      {
        name: 'soureNum',
        type: 'string',
        label: intl.get(`spcm.common.model.soureNum`).d('执行单据单号'),
      },
      {
        name: 'execteLineNum',
        type: 'string',
        label: intl.get(`spcm.common.model.execteLineNum`).d('执行单据行号'),
      },
      {
        label: intl.get(`spcm.common.documentFlow`).d('单据流'),
        name: 'documentFlow',
      },
      {
        name: 'benchmarkPrice',
        label: intl.get(`spcm.common.model.benchmarkPrice`).d('基准价格'),
      },
      {
        name: 'lineMaxContractAmount',
        type: 'number',
        min: 0,
        label: intl.get(`spcm.common.model.field.lineMaxContractAmount`).d('协议行金额上限'),
        required: editable && amountControlDimension === 'LINE' && manuallyModifyAmount === '1',
      },
      {
        label: intl
          .get(`spcm.common.model.field.taxIncludeLineOccupiedAmount`)
          .d('协议行订单已占用含税金额'),
        name: 'taxIncludeLineOccupiedAmount',
        type: 'number',
      },
      {
        label: intl.get(`spcm.common.model.field.lineOccupiedAmount`).d('协议行订单已占用未税金额'),
        name: 'lineOccupiedAmount',
        type: 'number',
      },
      {
        name: 'orderOccupiedLineAmountRatio',
        type: 'number',
        // precision: 2,
        label: intl
          .get('spcm.common.model.common.orderLineAmountRatio')
          .d('订单已占用行金额比例（%）'),
        help: intl
          .get('spcm.common.model.common.orderLineAmountRatioTip')
          .d('该字段计算逻辑为：（协议行订单已占用金额/协议行金额上限）*100%'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { queryParams } = data;
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-subject/page`,
          method: 'GET',
          data: queryParams,
          transformResponse: (res) => {
            let retrunData = '';
            try {
              const jsonData = JSON.parse(res);
              const content = jsonData?.content || [];
              const data2 = content.map((item) => {
                return {
                  ...item,
                  currencyCode: item.currencyCode || supplierCurrencyCode,
                  purchaseCurrencyCode: item.purchaseCurrencyCode || purchaseCurrencyCode,
                };
              });
              jsonData.content = data2;
              // pcHeaderDetailDTO
              retrunData = jsonData;
            } catch (error) {
              retrunData = res;
            }
            return retrunData;
          },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-subject/batch`,
          method: 'DELETE',
          data,
        };
      },
    },
    events: {
      update: ({ dataSet, record, name, value }) => {
        const spcmEnabled = dataSet.getState('doubleUnitEnabled');
        const itemCode = record.get('itemCode');
        const loading = dataSet.getState('loading');
        if (name === 'taxIdLov') {
          if (value) {
            record.set('taxRate', value.taxRate);
          } else {
            record.set('taxRate', null);
          }
        }
        if (name === 'itemCodeLov') {
          const {
            uomId,
            uomName,
            uomCode,
            uomPrecision,
            uomCodeAndName,
            secondaryUomId,
            secondaryUomName,
            secondaryUomCode,
            secondaryUomCodeAndName,
            secondaryUomPrecision,
          } = value || {};
          const uomObj = uomId && { uomId, uomCode, uomName, uomPrecision, uomCodeAndName };
          const secondaryUomObj = secondaryUomId
            ? {
                uomId: secondaryUomId,
                uomCode: secondaryUomCode,
                uomName: secondaryUomName,
                secondaryUomPrecision,
                uomCodeAndName: secondaryUomCodeAndName,
              }
            : uomObj;
          // 开启双单位 做单位转换
          if (spcmEnabled) {
            record.set({ uomIdLov: uomObj, secondaryUomId: secondaryUomObj });
            // conversionUpdate({ dataSet, record, loading });
          }
        }
        if (name === 'secondaryUomId' && spcmEnabled) {
          // 开启双单位 并且有 必备参数 换算出基本数量
          if (itemCode) {
            conversionUpdate({ dataSet, record, loading });
          } else {
            record.set({ uomIdLov: value });
          }
        }
        if (name === 'secondaryQuantity' && spcmEnabled) {
          // 有物料编码 并且开启双单位换算出基本数量
          if (itemCode && value) {
            conversionUpdate({ dataSet, record, loading, value });
          } else {
            record.set({ quantity: value });
          }
        }
      },
    },
  };
};

export default subjectDS;
