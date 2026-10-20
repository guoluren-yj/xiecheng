import React, { Component, Fragment } from 'react';
import { Form, Anchor, Affix, Row, Col, Button, Drawer } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import { Bind, debounce } from 'lodash-decorators';
import { yesOrNoRender } from 'utils/renderer';
import { Modal as c7nModal } from 'choerodon-ui/pro';
import { TreeSelect } from 'choerodon-ui';
import intl from 'utils/intl';
import querystring from 'querystring';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Button as PermissionButton } from 'components/Permission';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import {
  renderThousandthNum,
  preSubmitValidBudget,
  getDynamicLabel,
  queryCommonDoubleUomConfig,
} from '@/utils/util';
import formatterCollections from 'utils/intl/formatterCollections';
import { find } from 'lodash';
import moment from 'moment';
import hocRemote from 'utils/remote';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

// import DocFlow from '_components/DocFlow';
// import BudgetModal from 'srm-front-sbud/lib/routes/BudgetOccupiedModal';
import { transfromTreeSelectKey } from '@/utils/util';
import ApplicationScope from '@/routes/components/ContractSubject/ApplicationOrganization';

import { oldUnitCodeList, newUnitCodeList } from '@/routes/ContractControl/Detail/enum';
import { fetchHeader, queryCompareContract, getRelationDocControl } from '@/services/contractCommonService';
import { submitContract } from '@/services/contractControlService';
import TextComparisonModal from '../../../components/TextComparisonModal';
import CatelogRender from './CatelogRender';

import './index.less';

const { Link } = Anchor;
// const { Option } = Select;

@formatterCollections({
  code: [
    'spcm.common',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.roles',
    'hzero.common',
    'spcm.purchaseRequisitionCreation',
    'ssrc.inquiryHall',
  ],
})
@hocRemote({
  code: 'SPCM_CONTRACT_CHANGE_COMPARE',
  name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
},
{
  events: {
    // 协议提交之前预校验
    handleCuxPreSubmit() {},
    // 二开查询历史版本对比合同信息
    fetchCuxCompareContract() {},
  },
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL.READONLY',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.READONLY',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER.READONLY',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE.READONLY',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE.READONLY',
  ],
})
export default class InfoChangeCompare extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search, pathname },
    } = this.props;
    const {
      mainContractId,
      pcHeaderId,
      isBlackTenantFlag = 'true',
      fieldComparison,
      supplierCompanyId,
      electricSignFlag,
      versionFlag,
    } = querystring.parse(search?.substr(1));
    // 个性化单元解耦，根据当前租户区分所用个性化单元
    this.customUnitList = isBlackTenantFlag === 'true' ? oldUnitCodeList : newUnitCodeList;
    const matchStrs = pathname?.match(/\/(\w-*)+/g);
    const targetIndex = matchStrs.findIndex((item) => item === '/spcm');
    let backPath;
    switch (matchStrs[targetIndex + 1]) {
      case '/contract-control':
        backPath = `/spcm/contract-control/detail/${pcHeaderId}?hasChanged=true`;
        break;
      case '/contract-sign':
        backPath = `/spcm/contract-sign/detail?pcHeaderId=${pcHeaderId}&supplierCompanyId=${supplierCompanyId}&electricSignFlag=${electricSignFlag}`;
        break;
      case '/purchase-contract-view':
      default:
        if (fieldComparison) {
          backPath = `/spcm/purchase-contract-view/detail?pcHeaderId=${mainContractId}`;
        } else {
          backPath = `/spcm/purchase-contract-view/detail?pcHeaderId=${pcHeaderId}`;
        }
        break;
    }

    this.state = {
      backPath,
      mainContractId,
      pcHeaderId,
      allCatelogs: [],
      textComparisonVisible: false,
      headerInfo: {},
      confirmLoading: false,
      fieldComparison,
      versionFlag,
      contractList: [],
      doubleUnitEnabled: 0,
      relationDoc: {},
    };
  }

  componentDidMount() {
    const { pcHeaderId, fieldComparison, versionFlag } = this.state;
    this.fetchDoubleUnitFlag();
    this.fetchRelationDocControl();
    if (fieldComparison && versionFlag) {
      this.getCompareContract();
    }
    fetchHeader({
      pcHeaderId,
      customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL.READONLY',
    }).then((res) => {
      this.setState(
        {
          headerInfo: res || {},
        },
        () => {
          this.handleFillAllCatelogs();
        }
      );
    });
  }

  componentWillUnmount() {
    localStorage.removeItem('isFromContractControl');
  }

  getCompareContract = async () => {
    const { remote } = this.props;
    const { mainContractId } = this.state;
    // 埋点二开历史版本对比合同信息
    if (remote?.event) {
      const eventProps = {
        current: this,
      };
      const res = await remote.event.fireEvent('fetchCuxCompareContract', eventProps);
      if (!res) {
        return;
      }
    }
    const res = await queryCompareContract({ mainContractId });
    if (getResponse(res)) {
      this.setState({ contractList: res });
    }
  };

  /**
   * 双单位业务规则是否开启
   */
  @Bind()
  async fetchDoubleUnitFlag() {
    const res = await queryCommonDoubleUomConfig();
    this.setState({ doubleUnitEnabled: res });
  }

  /**
   * 单据流、执行单据业务规则是否开启
   */
  @Bind()
  async fetchRelationDocControl() {
    const res = getResponse(await getRelationDocControl());
      if (res) {
      this.setState({ relationDoc: res });
    }
  }

  /**
   * getParent-获取 dom 的parent
   * @param {HTMLElement} dom
   * @return {HTMLElement}
   */
  @Bind()
  getParent(dom) {
    const parent = dom && dom.parentNode.parentNode;
    return parent && parent.nodeType !== 11 ? parent : null;
  }

  /**
   * getAffixContainer-获取给 Affix 组件使用的元素
   * @return {HTMLElement}
   */
  @Bind()
  getAffixContainer() {
    const parent = this.getParent(
      document.getElementById('spcm-contract-sign-detail-content-inner-wrapper')
    );
    return parent || document.body;
  }

  // 查看适用范围
  @debounce(1500)
  viewApplicationOrgModal = (sourceAppScopeLineDTOs) => {
    const modalKey = c7nModal.key();
    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      drawer: true,
      title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
      children: <ApplicationScope sourceAppScopeLineDTOs={sourceAppScopeLineDTOs} />,
      footer: null,
      style: { width: '1000px' },
    });
  };

  @Bind()
  handleFillAllCatelogs() {
    const { mainContractId, pcHeaderId, headerInfo, doubleUnitEnabled, relationDoc } = this.state;
    const { customizeTable, custLoading, customizeForm, form } = this.props;
    const { pcSourceCode, pcKindCode, contractPurpose } = headerInfo;
    // 当协议性质为框架协议，协议用途为电商采购，该字段为false
    const taxIncludedUpRequired = !(
      ['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(pcKindCode) &&
      contractPurpose === 'OMMERCE_PURCHASE'
    );
    const editable = false;
    const isShowArchiveUpload = false;
    const allCatelogs = [
      {
        catelogTitle: intl
          .get(`spcm.common.view.message.title.contractHeaderInformation`)
          .d('采购协议头信息'),
        catelogId: 'headerform_platform',
        anchorId: 'info-change-detail-header-information',
        oldKey: 'oldPcHeader',
        newKey: 'newPcHeader',
        isTable: false,
        isCollpased: true,
        form,
        custLoading,
        customizeForm,
        customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL.READONLY',
        fields: [
          {
            label: intl.get(`spcm.purchaseRequisitionCreation.model.pcName`).d('协议名称'),
            dataIndex: 'pcName',
          },
          {
            label: intl.get(`spcm.purchaseRequisitionCreation.model.pcNum`).d('协议编号'),
            dataIndex: 'pcNum',
          },
          {
            label: intl.get(`hzero.common.date.creation`).d('创建时间'),
            dataIndex: 'creationDate',
          },
          {
            label: intl.get(`spcm.purchaseRequisitionCreation.model.amount`).d('协议总额'),
            dataIndex: 'taxIncludeAmount',
            transformResponse: (_, record) => renderThousandthNum(record.taxIncludeAmount),
          },
          {
            label: intl.get(`entity.roles.creator`).d('创建人'),
            dataIndex: 'createByRealName',
          },
          {
            label: intl.get(`spcm.purchaseRequisitionCreation.model.pcKindCode`).d('协议性质'),
            dataIndex: 'pcKindCode',
            transformResponse: (_, record, dataIndex) => record[`${dataIndex}Meaning`],
          },
          {
            label: intl.get(`entity.company.tag`).d('公司'),
            dataIndex: 'companyId',
            transformResponse: (_, record) => record.companyName,
          },
          {
            label: intl.get('entity.business.tag').d('业务实体'),
            dataIndex: 'ouId',
            transformResponse: (_, record) => record.ouName,
          },
          {
            label: intl.get('entity.organization.class.purchase').d('采购组织'),
            dataIndex: 'purchaseOrgId',
            transformResponse: (_, record) => record.purchaseOrgName,
          },
          {
            label: intl.get('spcm.common.model.common.agentName').d('采购员'),
            dataIndex: 'purchaseAgentId',
            transformResponse: (_, record) => record.purchaseAgentName,
          },
          {
            label: intl.get(`spcm.purchaseRequisitionCreation.model.pcType`).d('协议类型'),
            dataIndex: 'pcTypeId',
            transformResponse: (_, record) => record.pcTypeName,
          },
          {
            label: intl.get(`spcm.common.model.pcTemplateId`).d('协议模板'),
            dataIndex: 'pcTemplateId',
            transformResponse: (_, record) => record.templateName,
          },
          {
            label: intl.get(`entity.supplier.tag`).d('供应商'),
            dataIndex: 'supplierCompanyName',
            transformResponse: (_, record) => record.supplierCompanyName || record.supplierName,
          },
          {
            label: intl.get(`spcm.common.model.signedEffect`).d('签署即生效'),
            dataIndex: 'signEffectFlag',
            transformResponse: (_, record) => yesOrNoRender(record.signEffectFlag),
          },
          {
            label: intl.get(`spcm.common.model.effectiveTime`).d('有效时长'),
            dataIndex: 'effectiveTime',
            transformResponse: (_, record) => renderThousandthNum(record.effectiveTime),
          },
          {
            label: intl.get(`spcm.common.model.checkType`).d('验收类型'),
            dataIndex: 'acceptType',
            transformResponse: (_, record, dataIndex) => record[`${dataIndex}Meaning`],
          },
          {
            label: intl.get(`spcm.common.model.startDateActive`).d('协议起始日期'),
            dataIndex: 'startDateActive',
            transformResponse: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
          },
          {
            label: intl.get(`spcm.common.model.endDateActive`).d('协议终止日期'),
            dataIndex: 'endDateActive',
            transformResponse: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
          },
          {
            label: intl.get(`spcm.purchaseRequisitionCreation.model.mainContractId`).d('主协议'),
            dataIndex: 'mainContractId',
            transformResponse: (_, record) => record.mainPcNum,
          },
          {
            label: intl.get(`spcm.common.model.companyOrgName`).d('公司组织'),
            dataIndex: 'companyOrgId',
            transformResponse: (_, record) => record.companyOrgName,
          },
          {
            label: intl.get(`spcm.common.model.costAnchDepDesc`).d('费用挂靠部门'),
            dataIndex: 'costAnchDepId',
            transformResponse: (_, record) => record.costAnchDepDesc,
            dataIndexFlagRender: 'costAnchDepDesc',
          },
          {
            label: intl.get(`spcm.common.model.overseasProcurement`).d('境外采购'),
            dataIndex: 'overseasProcurement',
            transformResponse: (_, record) => yesOrNoRender(record.overseasProcurement),
          },
          {
            label: intl.get(`spcm.common.archiveCode`).d('归档码'),
            dataIndex: 'archiveCode',
          },
          {
            label: intl.get('spcm.common.model.pcSourceCode').d('协议来源'),
            dataIndex: 'pcSourceCode',
            transformResponse: (_, record, dataIndex) => record[`${dataIndex}Meaning`],
          },
          {
            label: intl.get(`spcm.common.model.common.globalFlag`).d('是否全局协议'),
            dataIndex: 'globalFlag',
            transformResponse: (_, record) => yesOrNoRender(record.globalFlag),
          },
          {
            label: intl.get(`spcm.common.model.contractPurpose`).d('协议用途'),
            dataIndex: 'contractPurpose',
            transformResponse: (_, record, dataIndex) => record[`${dataIndex}Meaning`],
          },
          {
            label: intl.get(`spcm.common.model.signDescription`).d('签订原因'),
            dataIndex: 'signDescription',
          },
          {
            label: intl.get(`spcm.common.model.signAddress`).d('签署地点'),
            dataIndex: 'signAddress',
          },
          {
            label: intl.get(`spcm.common.model.terminationReason`).d('终止原因'),
            dataIndex: 'terminationReason',
          },
          {
            label: intl.get('spcm.common.model.common.termId').d('付款条款'),
            dataIndex: 'termsName',
            hiddenFlag: (record) => record.pcSourceCode !== 'PURCHASE_ORDER',
          },
          {
            label: intl.get(`spcm.common.model.paperDeliveryMethod`).d('合同配送方式'),
            dataIndex: 'paperDeliveryMethod',
            transformResponse: (_, record) => record.paperDeliveryMethodMeaning,
            hiddenFlag: (record) => !record.paperFlag,
          },
          {
            label: intl.get(`spcm.common.model.paperDeliveryInfo`).d('合同配送信息'),
            dataIndex: 'paperDeliveryInfo',
            hiddenFlag: (record) => !record.paperFlag,
          },
          {
            label: intl.get('spcm.common.model.common.unitId').d('所属部门'),
            dataIndex: 'unitId',
            transformResponse: (_, record) => record.unitName,
          },
          {
            label: intl.get('spcm.common.model.common.creatorUnitId').d('创建人所属部门'),
            dataIndex: 'creatorUnitId',
            transformResponse: (_, record) => record.creatorUnitName,
          },
          {
            label: intl.get(`spcm.common.innerRemark`).d('内部批注'),
            dataIndex: 'internalPostil',
          },
          {
            label: intl.get(`spcm.common.attachmentUuid`).d('归档文件'),
            dataIndex: 'archiveAttachmentUuid',
            hiddenFlag: () => !isShowArchiveUpload,
          },
          {
            label: intl.get(`hzero.common.remark`).d('备注'),
            dataIndex: 'remark',
          },
        ],
        queryPayload: {
          url: `pc-compare/compare-header?mainContractId=${mainContractId}&pcHeaderId=${pcHeaderId}`,
          customizeUnitCode: editable
            ? 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL'
            : 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL.READONLY',
        },
      },
      {
        catelogTitle: intl.get(`spcm.common.view.message.title.contractSubject`).d('协议标的'),
        catelogId: 'subjectTable_platform',
        anchorId: 'info-change-detail-contract-subject',
        oldKey: 'oldSubjects',
        newKey: 'newSubjects',
        isTable: true,
        isCollpased: false,
        customizeTable,
        customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.READONLY',
        fields: [
          {
            dataIndex: 'lineNum',
            label: intl.get(`spcm.common.model.common.orderSeq`).d('序号'),
          },
          {
            label: intl.get('spcm.common.model.projectTaskName').d('项目任务名称'),
            dataIndex: 'projectTaskId',
            transformResponse: (_, record) => record.projectTaskName,
          },
          {
            dataIndex: 'itemCode',
            label: intl.get(`spcm.common.model.common.itemCode`).d('物料编码'),
          },
          {
            dataIndex: 'itemName',
            label: intl.get(`spcm.common.model.common.itemName`).d('物料名称'),
          },
          {
            dataIndex: 'categoryName',
            label: intl.get(`spcm.common.model.common.categoryName`).d('物料分类'),
          },
          {
            dataIndex: 'sourceAppScopeLineDTOs',
            label: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.applicationOrganization`)
              .d('适用其他组织'),
            hiddenFlag: () => this.state.headerInfo.pcSourceCode !== 'SEARCH_SOURCE_RESULT',
            transformResponse: (_, record) => (
              <a
                onClick={() => this.viewApplicationOrgModal(record.sourceAppScopeLineDTOs)}
                disabled={!record.sourceAppScopeLineDTOs}
              >
                {intl
                  .get('ssrc.inquiryHall.model.inquiryHall.applicationOrganization')
                  .d('适用其他组织')}
              </a>
            ),
          },
          {
            dataIndex: 'specifications',
            label: intl.get(`spcm.common.model.common.specifications`).d('规格'),
          },
          {
            dataIndex: 'model',
            label: intl.get(`spcm.common.model.common.model`).d('型号'),
          },
          {
            dataIndex: 'uomName',
            label: getDynamicLabel(doubleUnitEnabled),
            transformResponse: (_, record) => record.uomCodeAndName,
          },
          {
            dataIndex: 'quantity',
            label: getDynamicLabel(doubleUnitEnabled, 'quantity'),
            transformResponse: (_, record) => renderThousandthNum(record.quantity),
          },
          {
            dataIndex: 'taxId',
            label: intl.get(`spcm.common.model.common.taxType`).d('税种'),
            transformResponse: (_, record) => record.taxCode,
          },
          {
            dataIndex: 'taxRate',
            label: intl.get(`spcm.common.model.common.taxRate`).d('税率(%)'),
          },
          {
            dataIndex: 'unitPriceBatch',
            label: intl.get(`spcm.common.model.common.unitPriceBatch`).d('价格批量'),
            transformResponse: (_, record) => renderThousandthNum(record.unitPriceBatch),
          },
          {
            dataIndex: 'currencyCode',
            label: intl.get(`spcm.common.model.common.currencyCode`).d('原币币种'),
          },
          {
            dataIndex: 'purchaseCurrencyCode',
            label: intl.get(`spcm.common.model.common.purchaseCurrencyCode`).d('本币币种'),
          },
          {
            dataIndex: 'exchangeRate',
            label: intl.get(`spcm.common.model.common.exchangeRate`).d('汇率:(本币/原币)'),
            transformResponse: (_, record) => `${record.exchangeRate}:1`,
          },
          {
            dataIndex: 'priceType',
            label: intl.get(`spcm.common.priceType`).d('基准价'),
            transformResponse: (_, record) => record.priceTypeMeaning,
          },
          {
            dataIndex: 'taxIncludedUnitPrice',
            label: getDynamicLabel(doubleUnitEnabled, 'taxIncludedUnitPrice'),
            transformResponse: (_, record) => renderThousandthNum(record.taxIncludedUnitPrice, 2),
          },
          {
            dataIndex: 'purchaseTaxIncludedPrice',
            label: intl.get(`spcm.common.model.common.purchaseTaxIncludedPrice`).d('本币含税单价'),
            transformResponse: (_, record) =>
              renderThousandthNum(record.purchaseTaxIncludedPrice, 2),
          },
          {
            dataIndex: 'unitPrice',
            label: getDynamicLabel(doubleUnitEnabled, 'unitPrice'),
            transformResponse: (_, record) => renderThousandthNum(record.unitPrice, 2),
          },
          {
            dataIndex: 'taxIncludedLineAmount',
            label: intl.get(`spcm.common.model.common.taxIncludedLineAmount`).d('原币含税行金额'),
            transformResponse: (_, record) => renderThousandthNum(record.taxIncludedLineAmount, 2),
          },
          {
            dataIndex: 'purchaseTaxLineAmount',
            label: intl.get(`spcm.common.model.common.purchaseTaxLineAmount`).d('本币含税行金额'),
            transformResponse: (_, record) => renderThousandthNum(record.purchaseTaxLineAmount, 2),
          },
          {
            dataIndex: 'lineAmount',
            label: intl.get(`spcm.common.model.common.lineAmount`).d('原币不含税行金额'),
            transformResponse: (_, record) => renderThousandthNum(record.lineAmount, 2),
          },
          {
            dataIndex: 'taxAmount',
            label: intl.get(`spcm.common.model.common.taxAmount`).d('原币税额'),
            transformResponse: (_, record) => renderThousandthNum(record.taxAmount, 2),
          },
          {
            label: intl.get('spcm.common.model.taxIncludedUnitPrice.chinese').d('大写含税单价'),
            dataIndex: 'taxIncludedUnitPriceChinese',
            width: 150,
          },
          {
            label: intl
              .get('spcm.common.model.purchaseTaxIncludedPrice.chinese')
              .d('大写本币含税单价(原币含税单价x（本币/原币）)'),
            dataIndex: 'purchaseTaxIncludedPriceChinese',
            width: 150,
          },
          {
            label: intl.get('spcm.common.model.taxIncludedLineAmount.chinese').d('大写含税行金额'),
            dataIndex: 'taxIncludedLineAmountChinese',
            width: 150,
          },
          {
            label: intl
              .get('spcm.common.model.purchaseTaxLineAmount.chinese')
              .d('大写本币含税行金额(原币含税行金额x（本币/原币）)'),
            dataIndex: 'purchaseTaxLineAmountChinese',
            width: 150,
          },
          {
            label: intl.get('spcm.common.model.taxAmount.chinese').d('大写税额'),
            dataIndex: 'taxAmountChinese',
            width: 150,
          },
          {
            label: intl.get('spcm.common.model.unitPrice.chinese').d('大写单价'),
            dataIndex: 'unitPriceChinese',
            width: 150,
          },
          {
            label: intl.get('spcm.common.model.lineAmount.chinese').d('大写行金额'),
            dataIndex: 'lineAmountChinese',
            width: 150,
          },
          {
            dataIndex: 'priceStartDate',
            label: intl.get(`spcm.common.model.common.priceStartDate`).d('价格有效期从'),
          },
          {
            dataIndex: 'priceEndDate',
            label: intl.get(`spcm.common.model.common.priceEndDate`).d('价格有效期至'),
          },
          {
            dataIndex: 'ladderQuote',
            label: intl.get(`spcm.common.model.common.ladderQuote`).d('阶梯价格'),
          },
          {
            dataIndex: 'deliverDate',
            label: intl.get(`spcm.common.model.common.needByDate`).d('交付日期'),
            // transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
          },
          {
            dataIndex: 'guaranteePeriod',
            label: intl.get(`spcm.common.model.common.guaranteePeriod`).d('保质期'),
          },
          {
            dataIndex: 'packages',
            label: intl.get(`spcm.common.model.common.packages`).d('包装'),
          },
          {
            dataIndex: 'manufacturer',
            label: intl.get(`spcm.common.model.common.manufacturer`).d('生产厂家'),
          },
          {
            dataIndex: 'brand',
            label: intl.get(`spcm.common.model.common.brandName`).d('品牌'),
          },
          {
            dataIndex: 'itemProperties',
            label: intl.get(`spcm.common.model.common.export.itemPropertiesMeaning`).d('属性'),
            transformResponse: (_, record) => record.itemPropertiesMeaning,
          },
          {
            dataIndex: 'agentName',
            label: intl.get(`spcm.common.model.common.agentName`).d('采购员'),
          },
          {
            dataIndex: 'keeperUserName',
            label: intl.get(`spcm.common.model.common.keeperUserName`).d('保管人'),
          },
          {
            dataIndex: 'accepterUserName',
            label: intl.get(`spcm.common.model.common.accepterUserName`).d('验收人'),
          },
          {
            dataIndex: 'expBearDep',
            label: intl.get(`spcm.common.model.common.expBearDep`).d('费用承担部门'),
          },
          {
            dataIndex: 'address',
            label: intl.get(`spcm.common.model.common.location`).d('地点'),
          },
          {
            dataIndex: 'projectNum',
            label: intl.get(`spcm.common.model.common.projectCode`).d('项目编码'),
          },
          {
            dataIndex: 'projectName',
            label: intl.get(`spcm.common.model.common.projectName`).d('项目名称'),
          },
          {
            label: intl.get(`spcm.common.model.contractActualSource`).d('协议实际来源'),
            dataIndex: 'contractActualSource',
            transformResponse: (_, record) => record.contractActualSourceMeaning,
          },
          {
            dataIndex: 'invOrganizationId',
            label: intl.get(`spcm.common.model.invOrganizationId`).d('库存组织'),
            transformResponse: (_, record) => record.invOrganizationName,
          },
          {
            dataIndex: 'remark',
            label: intl.get(`hzero.common.remark`).d('备注'),
          },
          {
            label: intl.get(`spcm.common.model.benchmarkPrice`).d('基准价格'),
            dataIndex: 'benchmarkPrice',
          },
          {
            dataIndex: 'sourceCode',
            label: intl.get(`spcm.common.model.common.sourceCode`).d('来源单据编号'),
          },
          {
            dataIndex: 'sourceLineNum',
            label: intl.get(`spcm.common.model.common.sourceLineNum`).d('来源单据行号'),
            transformResponse: (_, record) =>
              pcSourceCode === 'PURCHASE_NEED' ? record.sourceDisplayLineNum : record.sourceLineNum,
          },
          ['1', 1].includes(relationDoc?.displayDocFlow) && {
            label: intl.get(`spcm.common.documentFlow`).d('单据流'),
            dataIndex: 'documentFlow',
            width: 100,
            // transformResponse: (_, record) => (
            //   <DocFlow
            //     tableName="spcm_pc_subject"
            //     tablePk={record.pcSubjectId}
            //     buttonType="button"
            //   />
            // ),
          },
          // {
          //   dataIndex: 'receiptsStatusMeaning',
          //   label: intl.get(`spcm.common.model.receiptsStatus`).d('执行状态'),
          // },
          ['1', 1].includes(relationDoc?.displayDoc) && {
            dataIndex: 'soureNum',
            label: intl.get(`spcm.common.model.soureNum`).d('执行单据单号'),
          },
          {
            dataIndex: 'execteLineNum',
            label: intl.get(`spcm.common.model.execteLineNum`).d('执行单据行号'),
          },
          doubleUnitEnabled && {
            label: intl.get(`spcm.common.model.common.unit`).d('单位'),
            dataIndex: 'secondaryUomId',
            transformResponse: (val, record) => record.secondaryUomCodeAndName,
          },
          doubleUnitEnabled && {
            label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
            dataIndex: 'secondaryQuantity',
            transformResponse: (val, record) => renderThousandthNum(record.secondaryQuantity),
          },
          doubleUnitEnabled && {
            label: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币单价(含税)'),
            dataIndex: 'taxIncludedSecondaryUnitPrice',
            align: 'right',
            transformResponse: (val, record) =>
              taxIncludedUpRequired
                ? renderThousandthNum(record.taxIncludedSecondaryUnitPrice)
                : null,
          },
          doubleUnitEnabled && {
            label: intl.get(`spcm.common.model.unitPrice`).d('原币单价(不含税)'),
            dataIndex: 'secondaryUnitPrice',
            align: 'right',
            transformResponse: (val, record) =>
              taxIncludedUpRequired ? renderThousandthNum(record.secondaryUnitPrice) : null,
          },
          {
            label: intl.get(`spcm.common.model.occupancyRecords`).d('金额占用记录查询'),
            dataIndex: 'occupancyRecords',
            width: 120,
            //   // 预算类型,1代表行生成预算，2代表头生成预算，0代表没有生成
            //   transformResponse: (_, record) =>
            //     ['1', '2'].includes(record.budgetType) && (
            //       <BudgetModal
            //         documentType="PC"
            //         docLineId={record.budgetType === '1' ? record.pcSubjectId : pcHeaderId}
            //       />
            //     ),
          },
        ],
        queryPayload: {
          url: `pc-compare/compare-subject?mainContractId=${mainContractId}&pcHeaderId=${pcHeaderId}`,
          customizeUnitCode: editable
            ? 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT'
            : 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.READONLY',
        },
      },
      {
        catelogTitle: intl.get('spcm.common.view.message.title.contractStage').d('协议阶段'),
        catelogId: 'stageTable_platform',
        anchorId: 'info-change-detail-contract-stage',
        oldKey: 'oldStages',
        newKey: 'newStages',
        isTable: true,
        isCollpased: false,
        customizeTable,
        customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE.READONLY',
        fields: [
          {
            label: intl.get(`spcm.common.model.common.orderSeq`).d('序号'),
            dataIndex: 'stageNo',
          },
          {
            dataIndex: 'stageCode',
            label: intl.get(`spcm.common.model.common.stageCode`).d('阶段编码'),
          },
          {
            dataIndex: 'stageName',
            label: intl.get(`spcm.common.model.common.stageName`).d('阶段名称'),
          },
          {
            dataIndex: 'prepaymentStage',
            label: intl.get(`spcm.common.model.common.prepaymentStage`).d('预付款阶段'),
            transformResponse: (_, record) => yesOrNoRender(record.prepaymentStage),
          },
          {
            dataIndex: 'milestoneTime',
            label: intl.get(`spcm.common.model.common.milestoneTime`).d('里程碑时间'),
          },
          {
            dataIndex: 'payRatio',
            label: `${intl.get(`spcm.common.model.common.payRatio`).d('付款比例')}(%)`,
          },
          {
            dataIndex: 'supplierCurrencyCode',
            label: intl.get(`spcm.common.currencyCode`).d('原币币种'),
          },
          {
            dataIndex: 'purchaseCurrencyCode',
            label: intl.get(`spcm.common.purchaseCurrencyCode`).d('本币币种'),
          },
          {
            dataIndex: 'exchangeRate',
            label: intl.get(`spcm.common.exchangeRate`).d('汇率:(本币/原币)'),
          },
          {
            dataIndex: 'costQuantity',
            label: intl.get(`spcm.common.model.common.supplierCostQuantity`).d('原币费用'),
            transformResponse: (_, record) => renderThousandthNum(record.costQuantity),
          },
          {
            dataIndex: 'purchaseCostQuantity',
            label: intl.get('spcm.common.model.purchaseCostQuantity').d('本币费用'),
            transformResponse: (_, record) => renderThousandthNum(record.purchaseCostQuantity, 2),
          },
          {
            label: intl.get('spcm.common.model.costQuantity.chinese').d('大写费用'),
            dataIndex: 'costQuantityChinese',
          },
          {
            label: intl
              .get('spcm.common.model.purchaseCostQuantity.chinese')
              .d('大写本币费用(原币费用x（本币/原币）'),
            dataIndex: 'purchaseCostQuantityChinese',
          },
          {
            dataIndex: 'termName',
            label: intl.get(`spcm.common.model.common.termId`).d('付款条款'),
          },
          {
            dataIndex: 'typeName',
            label: intl.get('spcm.common.model.common.typeId').d('付款方式'),
          },
          {
            dataIndex: 'remindCycle',
            label: intl.get(`spcm.common.model.common.remindCycle`).d('提醒周期'),
            transformResponse: (_, record) => renderThousandthNum(record.remindCycle),
          },
          {
            dataIndex: 'remark',
            label: intl.get('hzero.common.explain').d('说明'),
          },
        ],
        queryPayload: {
          url: `pc-compare/compare-stage?mainContractId=${mainContractId}&pcHeaderId=${pcHeaderId}`,
          customizeUnitCode: editable
            ? 'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE'
            : 'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE.READONLY',
        },
      },
      {
        catelogTitle: intl.get('spcm.common.view.message.title.ContractRebate').d('返利信息'),
        catelogId: 'rebateTable_platform',
        anchorId: 'info-change-detail-contract-rebate',
        oldKey: 'oldRebates',
        newKey: 'newRebates',
        isTable: true,
        isCollpased: false,
        customizeTable,
        customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE.READONLY',
        fields: [
          {
            dataIndex: 'lineNum',
            label: intl.get(`spcm.common.model.common.orderSeq`).d('序号'),
          },
          {
            dataIndex: 'saleRangeFrom',
            label: intl.get(`spcm.common.model.common.saleRangeFrom`).d('销售额区间从'),
            transformResponse: (_, record) => renderThousandthNum(record.saleRangeFrom),
          },
          {
            dataIndex: 'saleRangeTo',
            label: intl.get(`spcm.common.model.common.saleRangeTo`).d('销售额区间至'),
            transformResponse: (_, record) => renderThousandthNum(record.saleRangeTo),
          },
          {
            dataIndex: 'annualReturnRate',
            label: intl.get(`spcm.common.model.common.annualReturnRate`).d('年度返利率（%）'),
          },
          {
            dataIndex: 'rebateAmount',
            label: intl.get(`spcm.common.model.common.rebateAmount`).d('返利金额'),
            transformResponse: (_, record) => renderThousandthNum(record.rebateAmount),
          },
          {
            dataIndex: 'validityDateFrom',
            label: intl.get(`spcm.common.model.common.validityDateFrom`).d('有效期从'),
          },
          {
            dataIndex: 'validityDateTo',
            label: intl.get(`spcm.common.model.common.validityDateTo`).d('有效期至'),
          },
          {
            dataIndex: 'affiliatedCompany',
            label: intl.get('spcm.common.model.common.affiliatedCompany').d('关联公司'),
          },
          {
            dataIndex: 'supplierIds',
            label: intl.get('spcm.common.model.common.affiliatedSupplier').d('关联供应商'),
          },
          {
            dataIndex: 'remark',
            label: intl.get('hzero.common.explain').d('说明'),
          },
        ],
        queryPayload: {
          url: `pc-compare/compare-rebates?mainContractId=${mainContractId}&pcHeaderId=${pcHeaderId}`,
          customizeUnitCode: editable
            ? 'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE'
            : 'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE.READONLY',
        },
      },
      {
        catelogTitle: intl
          .get(`spcm.common.view.message.title.contractPartnerInformation`)
          .d('采购协议伙伴信息'),
        catelogId: 'partnerTable_platform',
        anchorId: 'info-change-detail-contract-partner',
        oldKey: 'oldPartneres',
        newKey: 'newPartneres',
        isTable: true,
        isCollpased: false,
        customizeTable,
        customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER.READONLY',
        fields: [
          {
            dataIndex: 'partnerTypeName',
            label: intl.get(`spcm.common.model.common.partnerTypeName`).d('伙伴类型名称'),
          },
          {
            dataIndex: 'partnerTypeCode',
            label: intl.get(`spcm.common.model.common.partnerTypeCode`).d('伙伴类型编码'),
          },
          {
            dataIndex: 'companyNum',
            label: intl.get(`entity.company.code`).d('公司编码'),
          },
          {
            dataIndex: 'companyName',
            label: intl.get(`entity.company.dataIndex`).d('公司名称'),
          },
          {
            dataIndex: 'legalRepName',
            label: intl.get(`spcm.common.model.common.legalRepName`).d('代表人'),
          },
          {
            dataIndex: 'corporateDuty',
            label: intl.get(`spcm.common.model.common.corporateDuty`).d('法人职务'),
          },
          {
            dataIndex: 'postCode',
            label: intl.get(`spcm.common.model.common.postCode`).d('邮编'),
          },
          {
            dataIndex: 'unifiedSocialCode',
            label: intl.get(`spcm.common.model.common.unifiedSocialCode`).d('统一社会信用代码'),
          },
          {
            dataIndex: 'address',
            label: intl.get(`spcm.common.model.common.address`).d('地址'),
          },
          {
            dataIndex: 'contacts',
            label: intl.get(`spcm.common.model.common.contacts`).d('联系人'),
          },
          {
            dataIndex: 'telNum',
            label: intl.get(`spcm.common.model.common.telNum`).d('联系电话'),
          },
          {
            dataIndex: 'taxRegistrationPhone',
            label: intl.get(`spcm.common.model.common.taxRegistrationPhone`).d('税务登记电话'),
          },
          {
            dataIndex: 'faxes',
            label: intl.get(`spcm.common.model.common.faxes`).d('传真'),
          },
          {
            dataIndex: 'mail',
            label: intl.get(`spcm.common.model.common.mail`).d('邮箱'),
          },
          {
            dataIndex: 'bankName',
            label: intl.get(`spcm.common.model.common.bankName`).d('开户行名称'),
          },
          {
            dataIndex: 'bankAccountName',
            label: intl.get(`spcm.common.model.common.bankAccountName`).d('账户名称'),
          },
          {
            dataIndex: 'bankAccountNum',
            label: intl.get(`spcm.common.model.common.bankAccountNum`).d('银行账号'),
          },
          {
            dataIndex: 'bankAddress',
            label: intl.get(`spcm.common.model.common.bankAddress`).d('开户行地址'),
          },
          {
            dataIndex: 'bankFirm',
            label: intl.get(`spcm.common.model.common.bankNumber`).d('联行行号'),
          },
          {
            dataIndex: 'remark',
            label: intl.get(`hzero.common.explain`).d('说明'),
          },
        ],
        queryPayload: {
          url: `pc-compare/compare-partner?mainContractId=${mainContractId}&pcHeaderId=${pcHeaderId}`,
          customizeUnitCode: editable
            ? 'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER'
            : 'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER.READONLY',
          dataRender: (data) => data,
        },
      },
      {
        catelogTitle: intl
          .get(`spcm.common.view.message.title.purcAgreementBusinessTerms`)
          .d('采购协议业务条款'),
        catelogId: 'businessTermsTable_platform',
        anchorId: 'info-change-detail-contract-business-terms',
        oldKey: 'oldTerms',
        newKey: 'newTerms',
        isTable: true,
        isCollpased: false,
        fields: [
          {
            dataIndex: 'termTypeCode',
            label: intl
              .get(`spcm.purchaseRequisitionCreation.model.termTypeCode`)
              .d('业务条款编码'),
          },
          {
            dataIndex: 'termTypeName',
            label: intl
              .get(`spcm.purchaseRequisitionCreation.model.termTypeName`)
              .d('业务条款名称'),
          },
          {
            dataIndex: 'termContent',
            label: intl.get(`spcm.purchaseRequisitionCreation.model.termContent`).d('业务条款内容'),
            transformResponse: (val, record) => {
              let termContentReadOnlyVal = '';
              const termContentReadOnlyObj = find(record.termTypeList, {
                value: record.termContent,
              });
              if (termContentReadOnlyObj) {
                termContentReadOnlyVal = termContentReadOnlyObj.meaning;
              } else {
                termContentReadOnlyVal = val;
              }
              return termContentReadOnlyVal;
            },
          },
          {
            dataIndex: 'remark',
            label: intl.get(`spcm.purchaseRequisitionCreation.model.termRemark`).d('业务条款说明'),
          },
        ],
        queryPayload: {
          url: `pc-compare/compare-terms?mainContractId=${mainContractId}&pcHeaderId=${pcHeaderId}`,
        },
      },
      // {
      //   catelogTitle: intl
      //     .get(`spcm.common.view.message.title.purchaseAttachmentList`)
      //     .d('附件信息'),
      //   catelogId: 'attachListTable_platform',
      //   anchorId: 'info-change-detail-contract-attachment-list',
      //   oldKey: 'oldAttachments',
      //   newKey: 'newAttachments',
      //   isTable: true,
      //   isCollpased: false,
      //   fields: [
      //     {
      //       dataIndex: 'attachmentTypeCode',
      //       label: intl.get(`spcm.purchaseContractType.model.attachmentTypeCode`).d('附件类型编码'),
      //     },
      //     {
      //       dataIndex: 'attachmentTypeName',
      //       label: intl.get(`spcm.purchaseContractType.model.attachmentTypeName`).d('附件类型名称'),
      //     },
      //     {
      //       dataIndex: 'remark',
      //       label: intl.get(`spcm.purchaseContractType.model.attachmentRemark`).d('附件类型说明'),
      //     },
      //     {
      //       dataIndex: 'nullableFlag',
      //       label: intl.get(`spcm.common.model.attachmentNullableFlag`).d('是否必传'),
      //     },
      //     {
      //       dataIndex: 'supAttachmentFlag',
      //       label: intl.get(`spcm.common.model.supAttachmentFlag`).d('供方附件'),
      //     },
      //     {
      //       dataIndex: 'enabledFlag',
      //       label: intl.get(`hzero.common.status.enable`).d('启用'),
      //     },
      //   ],
      //   queryPayload: {
      //     url: `pc-compare/compare-attachment?mainContractId=${mainContractId}&pcHeaderId=${pcHeaderId}`,
      //   },
      // },
    ];

    this.setState({
      allCatelogs,
      keyValue: `${mainContractId}${pcHeaderId}`,
    });
  }

  @Bind()
  handleControlComparison() {
    const { textComparisonVisible } = this.state;
    this.setState({ textComparisonVisible: !textComparisonVisible });
  }

  /**
   * 确认历史版本变更且提交该协议
   */
  @Bind()
  async handleConfirmAndSubmit() {
    const { remote, isFromContractControl } = this.props;
    if (isFromContractControl) {
      const { pcHeaderId } = this.state;
      this.setState({
        confirmLoading: true,
      });
      if (remote?.event) {
        const res = await remote.event.fireEvent('handleCuxPreSubmit', { current: this });
        if (!res) {
          return;
        }
      }
      // 处理数据格式，将对象键值对，处理成数组
      const tempCustomUnitList = Object.entries(this.customUnitList || {}).map((item) => ({
        [item[0]]: item[1],
      }));
      const validateBudgetFlag = await preSubmitValidBudget([
        {
          pcHeaderId,
        },
      ]);
      if (!validateBudgetFlag) {
        this.setState({
          confirmLoading: false,
        });
        return false;
      }
      const response = getResponse(
        await submitContract({
          submitBody: [
            {
              pcHeaderId,
              customUnitList: tempCustomUnitList,
            },
          ],
          customizeUnitCode:
            'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL,SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT,SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE,SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
        })
      );
      this.setState({
        confirmLoading: false,
      });
      if (response) {
        notification.success();
        this.props.history.push('/spcm/contract-control/list');
      }
    }
  }

  contractSelect = ({ pcHeaderId, mainContractId }) => {
    const { fieldComparison, contractList, versionFlag } = this.state;
    if (!contractList.length) {
      return null;
    }
    // return fieldComparison ? (
    //   <Select
    //     disabled={!fieldComparison}
    //     defaultValue={mainContractId || pcHeaderId}
    //     style={{ marginLeft: 20 }}
    //     onChange={(val) => {
    //       if (pcHeaderId) {
    //         this.setState({ pcHeaderId: val }, () => {
    //           this.handleFillAllCatelogs();
    //         });
    //       } else {
    //         this.setState({ mainContractId: val }, () => {
    //           this.handleFillAllCatelogs();
    //         });
    //       }
    //     }}
    //   >
    //     {contractList.map((option) => (
    //       <Option value={option.pcHeaderId}>
    //         {option.pcNum} {option.pcTag} {option.pcStatusCodeMeaning}
    //       </Option>
    //     ))}
    //   </Select>
    // ) : null;
    return fieldComparison && versionFlag ? (
      <TreeSelect
        style={{ width: '60%', marginLeft: 8 }}
        defaultValue={mainContractId || pcHeaderId}
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        treeData={transfromTreeSelectKey({ dataList: contractList, childrenField: 'compareHeaderDtos' })}
        treeDefaultExpandAll
        onChange={(val) => {
          if (pcHeaderId) {
            this.setState({ pcHeaderId: val }, () => {
              this.handleFillAllCatelogs();
            });
          } else {
            this.setState({ mainContractId: val }, () => {
              this.handleFillAllCatelogs();
            });
          }
        }}
      />
    ) : null;
  };

  @Bind()
  getTitle() {
    const { isFromContractControl } = this.props;
    const { fieldComparison } = this.state;
    if (fieldComparison) {
      return intl.get(`spcm.common.model.fieldComparison`).d('字段对比');
    }
    if (isFromContractControl) {
      return intl.get('spcm.common.model.common.contractChangeConfirm').d('协议变更确认');
    }
    return intl.get(`hzero.common.button.contractHistoryCompare`).d('历史版本对比');
  }

  @Bind()
  renderCompare() {
    const { pcHeaderId, allCatelogs, fieldComparison, mainContractId, keyValue } = this.state;
    const { isFromContractControl, custConfig } = this.props;
    return (
      <Col span={fieldComparison ? 24 : 23}>
        <Row>
          <Col span={12}>
            <h3>
              {isFromContractControl
                ? intl.get('spcm.common.view.title.beforeChange').d('变更前')
                : intl.get('spcm.common.view.title.referenceVersion').d('参照版本')}
              {this.contractSelect({ mainContractId })}
            </h3>
          </Col>
          <Col span={12}>
            <h3 style={{ marginLeft: '10px' }}>
              {isFromContractControl
                ? intl.get('spcm.common.view.title.afterChange').d('变更后')
                : intl.get('spcm.common.view.title.currentMode').d('当前打开版本')}
              {this.contractSelect({ pcHeaderId })}
            </h3>
          </Col>
        </Row>
        <Row>
          {allCatelogs.map((catelog) => (
            <CatelogRender
              custConfig={custConfig}
              key={`${catelog.catelogId}${keyValue}`}
              {...catelog}
              mainContractId={mainContractId}
              pcHeaderId={pcHeaderId}
            />
          ))}
        </Row>
      </Col>
    );
  }

  render() {
    const {
      backPath,
      pcHeaderId,
      textComparisonVisible,
      headerInfo,
      confirmLoading,
      fieldComparison,
    } = this.state;
    const { isFromContractControl } = this.props;
    const textComparisonProps = {
      pcHeaderId,
      visible: textComparisonVisible,
      onCancel: this.handleControlComparison,
    };
    if (fieldComparison) {
      return (
        <Content>
          <Row gutter={24}>{this.renderCompare()}</Row>
        </Content>
      );
    }
    return (
      <Fragment>
        <Header title={this.getTitle()} backPath={backPath}>
          {isFromContractControl && (
            <Button type="primary" onClick={this.handleConfirmAndSubmit} loading={confirmLoading}>
              {intl.get('spcm.common.model.common.confirm').d('确认')}
            </Button>
          )}
          {headerInfo &&
            !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) &&
            !(
              headerInfo.signatureType === 'ANNEX_SIGNATURE' &&
              headerInfo.electricSignFlag === 1 &&
              headerInfo.authType === 'ESIGN'
            ) && (
              <PermissionButton
                permissionList={[
                  {
                    code: 'srm.pc-admin.pc-purchaser.maintain.ps.text.comparison',
                    type: 'button',
                    meaning: '文本对比',
                  },
                ]}
                // disabled={!pcHeaderId || ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode)}
                onClick={this.handleControlComparison}
              >
                {intl.get('spcm.common.view.title.textComparison').d('文本对比')}
              </PermissionButton>
            )}
        </Header>
        <Content>
          <Row gutter={24}>
            <Col span={3}>
              <Affix
                style={{ top: '200px', width: '80vw', position: 'fixed' }}
                offsetTop={224}
                target={this.getAffixContainer}
              >
                <Anchor getContainer={this.getAffixContainer} offsetTop={24}>
                  <Link
                    href="#info-change-detail-header-information"
                    title={intl
                      .get(`spcm.common.view.message.title.contractHeaderInformation`)
                      .d('采购协议头信息')}
                  />
                  <Link
                    href="#info-change-detail-contract-subject"
                    title={intl.get(`spcm.common.view.message.title.contractSubject`).d('协议标的')}
                  />
                  <Link
                    href="#info-change-detail-contract-stage"
                    title={intl.get('spcm.common.view.message.title.contractStage').d('协议阶段')}
                  />
                  <Link
                    href="#info-change-detail-contract-rebate"
                    title={intl.get('spcm.common.view.message.title.ContractRebate').d('返利信息')}
                  />
                  <Link
                    href="#info-change-detail-contract-partner"
                    title={intl
                      .get(`spcm.common.view.message.title.contractPartnerInformation`)
                      .d('采购协议伙伴信息')}
                  />
                  <Link
                    href="#info-change-detail-contract-business-terms"
                    title={intl
                      .get(`spcm.common.view.message.title.purcAgreementBusinessTerms`)
                      .d('采购协议业务条款')}
                  />
                </Anchor>
              </Affix>
            </Col>
            {this.renderCompare()}
          </Row>
        </Content>
        {textComparisonVisible && <TextComparisonModal {...textComparisonProps} />}
      </Fragment>
    );
  }
}

/**
 * ChangeCompareDrawer - 字段对比Drawer
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {boolean} [record={}] - 当前选中行数据
 * @reactProps {boolean} [visible=false] - 侧弹窗关闭打开参数
 * @reactProps {Function} [closeCompare= e => e] - 侧弹窗关闭打开方法
 * @return React.element
 */
export const ChangeCompareDrawer = (props) => {
  const { closeCompare, visible, record, location, versionFlag = true, ...res } = props;
  return (
    <Drawer
      closable
      visible={visible}
      title={`${intl.get(`spcm.common.model.fieldComparison`).d('字段对比')}-${record.pcNum}`}
      width={1200}
      onClose={closeCompare}
      footer={
        <Button type="primary" onClick={closeCompare}>
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>
      }
    >
      <InfoChangeCompare
        {...res}
        location={{
          ...location,
          search: `?mainContractId=${record?.mainContractId}&pcHeaderId=${
            record?.pcHeaderId
          }&fieldComparison=true${versionFlag ? '&versionFlag=true' : ''}`,
        }}
      />
      <div className="compare-drawer">
        <Button type="primary" onClick={closeCompare}>
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>
      </div>
    </Drawer>
  );
};
