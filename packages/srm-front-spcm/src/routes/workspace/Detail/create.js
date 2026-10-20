/**
 * create - 协议工作台-创建
 * @date: 2018-12-29
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { DataSet } from 'choerodon-ui/pro';
import moment from 'moment';
import { Bind, Throttle } from 'lodash-decorators';
import querystring from 'querystring';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse, filterNullValueObject } from 'utils/utils';
import remote from 'utils/remote';
import DynamicButtons from '_components/DynamicButtons';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import notification from 'utils/notification';
import { queryNewOrOldLink } from '@/services/newContractService';
import { getRecommendSupplierFlag } from '@/services/contractCommonService';
import { isEmpty } from 'lodash';
import { renderSmartTips } from '@/utils/renderer';

import { fetchNewFunWhiteList } from './utils/utils';
import ContractHeader from './components/ContractHeader';
import headerFormDs from './components/ContractHeader/HeaderFormDS';
import styles from './index.less';

const commonViewPrompt = 'spcm.common.view.message.title';

@withCustomize({
  unitCode: ['SPCM.WORKSPACE_DETAIL.HEADER', 'SPCM.WORKSPACE_DETAIL.CREATE_HEADER_BTN'],
})
@formatterCollections({
  code: [
    'spcm.contractMaintain',
    'spcm.common',
    'spcm.purchaseRequisitionCreation',
    'entity.company',
    'entity.supplier',
    'entity.attachment',
    'hzero.common',
    'spcm.purchaseContractView',
    'spcm.workspace',
    'entity.business',
    'entity.organization',
    'entity.supplier',
    'entity.roles',
  ],
})
@connect(({ loading, workSpace }) => ({
  saving: loading.effects['workSpace/update'] || loading.effects['workSpace/add'],
  workSpace,
}))
@remote(
  {
    code: 'SPCM_WORKSPACE_DETAIL_CREATE',
    name: 'remote',
  },
  {
    events: {
      // 改变工作台头字段埋点处理
      handleFormUpdate() {},
      // 头供应商字段切换
      handleCuxSupplierLovChange() {},
      // 协议性质修改校验
      handleCuxChangePcKindCode() {},
      // 保存增加弱校验
      handleCuxSaveValidate() {},
      // 保存之后埋点
      handleCuxSaveAfter() {},
      // 头公司更换
      handleCuxCompanyIdLovChange() {},
    },
  }
)
export default class Create extends PureComponent {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = props;
    const { itemKey } = querystring.parse(search.substr(1));
    this.state = {
      _linkFlag: false, // 新链路标识
      finishFlag: false, // 是否请求完接口
      itemKey,
      purchaseNeedDTOs: {}, // 采购申请数据-headerInfo
      attachmentSupportUpload: false, // 合同模板是否支持上传附件标识
    };
  }

  componentDidMount() {
    this.handleInitData();
    // 查询配置表（协议新功能白名单）-是否显示附件合同模板字段
    fetchNewFunWhiteList({
      functionCode: 'ATTACHMENT_SUPPORT_UPLOAD',
      callback: ({ enableFlag }) => {
        this.setState({
          attachmentSupportUpload: !!Number(enableFlag), // 合同拒绝后的文本对比隐藏标识
        });
      },
    });
    // this.queryNewOrOldLink();
  }

  componentWillUnmount() {
    this.offDTOs();
  }

  offDTOs() {
    const { dispatch } = this.props;
    dispatch({
      type: 'workSpace/updateState',
      payload: {
        sourceResultDTOs: [],
        sourceRslQueryParams: {},
        createPurchaseOrderList: [],
        createPurchaseOrderInfo: {},
        initContractInfo: {},
      },
    });
  }

  @Bind()
  async handleInitData() {
    const {
      workSpace,
      dispatch,
      remote,
      location: { search },
    } = this.props;
    const { itemKey } = querystring.parse(search.substr(1));
    const { sourceResultDTOs, createPurchaseOrderList, initContractInfo = {} } = workSpace;

    const { thirdPartyInfo, ...otherInitInfo } = initContractInfo || {}; // 手工新建的按第三方提取结果取值

    const _linkFlag = await queryNewOrOldLink();
    const res = (await dispatch({ type: 'contractMaintain/fetchPurAgent' })) || []; // 查询采购员
    // 从sessionStorage中获取引用申请暂存的数据
    const purchaseNeedDTOs = JSON.parse(window.sessionStorage.getItem(itemKey))?.headerInfo;
    let pcSourceCode = 'MANUALLY';
    let pcSourceCodeMeaning = intl.get('spcm.workspace.view.button.createdManually').d('手工新建');

    // 引用寻源结果/引用采购申请/引用订单创建，
    // 仅协议名称、协议起始日期、协议终止日期按照第三方返回的，其他字段有值的按照引用来源单据覆盖
    const { pcName, startDateActive, endDateActive, ...otherThirdInfo } = thirdPartyInfo || {};
    const valueFields = filterNullValueObject({ pcName, startDateActive, endDateActive });
    let data = {};
    if (sourceResultDTOs?.length > 0) {
      pcSourceCode = 'SEARCH_SOURCE_RESULT';
      pcSourceCodeMeaning = intl.get(`spcm.common.model.common.sourceResult`).d('寻源结果');
      data = {
        ...otherThirdInfo, // 其他字段先取取第三方结果
        ...sourceResultDTOs[0],
        purchaseAgentId: sourceResultDTOs[0]?.purchaseAgentId || res[0]?.purchaseAgentId,
        purchaseAgentName: sourceResultDTOs[0]?.purchaseAgentName || res[0]?.purchaseAgentName,
        // 采购组织
        purchaseOrgId: sourceResultDTOs[0]?.purOrganizationId,
        purchaseOrgName: sourceResultDTOs[0]?.purchaseOrganizatioName,
        ...valueFields,
      };
    } else if (createPurchaseOrderList?.length > 0) {
      pcSourceCode = 'PURCHASE_ORDER';
      pcSourceCodeMeaning = intl.get(`spcm.common.model.common.purchaseOrder`).d('采购订单');
      data = {
        ...otherThirdInfo,
        companyId: createPurchaseOrderList[0]?.companyId,
        companyName: createPurchaseOrderList[0]?.companyName,
        ouId: createPurchaseOrderList[0]?.ouId,
        ouName: createPurchaseOrderList[0]?.ouName,
        purchaseOrgId: createPurchaseOrderList[0]?.purchaseOrgId,
        purchaseOrgName: createPurchaseOrderList[0]?.purOrganizationName,
        purchaseAgentId: createPurchaseOrderList[0]?.purchaseAgentId || res[0]?.purchaseAgentId,
        purchaseAgentName:
          createPurchaseOrderList[0]?.purchaseAgentName || res[0]?.purchaseAgentName,
        supplierCompanyId: createPurchaseOrderList[0]?.supplierCompanyId,
        supplierId: createPurchaseOrderList[0]?.supplierId,
        supplierTenantId: createPurchaseOrderList[0]?.supplierTenantId,
        supplierCompanyName: createPurchaseOrderList[0]?.supplierCompanyName,
        supplierName: createPurchaseOrderList[0]?.supplierName,
        termsId: createPurchaseOrderList[0]?.termsId,
        termsName: createPurchaseOrderList[0]?.termsName,
        ...valueFields,
      };
    } else if (itemKey && !isEmpty(purchaseNeedDTOs)) {
      pcSourceCode = 'PURCHASE_NEED';
      pcSourceCodeMeaning = intl.get(`spcm.common.sourceCode.purchaseRequisition`).d('采购申请');
      // 处理推荐供应商
      const recommendSupplier = await this.getRecommendSupplier({ purchaseNeedDTOs });
      data = {
        ...otherThirdInfo,
        ...purchaseNeedDTOs,
        ...recommendSupplier,
        prExchangeRate: purchaseNeedDTOs?.exchangeRate,
        purchaseAgentId: purchaseNeedDTOs?.purchaseAgentId || res[0]?.purchaseAgentId,
        purchaseAgentName: purchaseNeedDTOs?.purchaseAgentName || res[0]?.purchaseAgentName,
        ...valueFields,
      };
    } else {
      data = {
        ...data,
        purchaseAgentId: res[0]?.purchaseAgentId,
        purchaseAgentName: res[0]?.purchaseAgentName,
        ...thirdPartyInfo,
      };
    }
    const headDsProps = headerFormDs({ isMaintain: true, editable: true, _linkFlag });
    const remoteHeadDsProps = remote
      ? remote.process('SPCM_WORKSPACE_DETAIL_CREATE_HEADER_DS', headDsProps, {
          pcSourceCode,
          createPurchaseOrderList,
        })
      : headDsProps;
    this.headerFormDs = new DataSet(remoteHeadDsProps);
    this.setState(
      {
        _linkFlag,
        finishFlag: true,
        purchaseNeedDTOs,
      },
      () => {
        // ds创建数据，放在form表单渲染后，避免个性化字段默认值失效
        this.headerFormDs.create({
          ...data,
          ...otherInitInfo,
          pcSourceCode,
          pcSourceCodeMeaning,
        });
        const eventProps = {
          current: this,
          pcSourceCode,
          sourceResultDTOs,
          createPurchaseOrderList,
          purchaseNeedDTOs,
          data,
          headerFormDs: this.headerFormDs,
          _linkFlag,
        };
        this.pcSourceCode = pcSourceCode;
        if (remote?.event) {
          remote.event.fireEvent('afterInitHeaderData', eventProps);
        }
      }
    );
  }

  /**
   * 获取推荐供应商
   */
  async getRecommendSupplier(params = {}) {
    const { purchaseNeedDTOs } = params || {};
    const res = getResponse(await getRecommendSupplierFlag());
    if (res) {
      // 开启了推荐供应商
      const {
        selectSupplierCompanyId,
        selectSupplierCompanyName,
        selectSupplierTenantId,
        selectLocalSupplierId,
        selectLocalSupplierName,
      } = purchaseNeedDTOs;

      if (res === 1 && (selectSupplierCompanyId || selectLocalSupplierId)) {
        return {
          // 开启推荐供应商，同时推荐供应商有值给1，否则给0
          supplierTenantId: selectSupplierTenantId,
          supplierCompanyId: selectSupplierCompanyId,
          supplierCompanyName: selectSupplierCompanyName,
          supplierId: selectLocalSupplierId,
          supplierName: selectLocalSupplierName,
          recommendSupplierFlag: 1,
        };
      } else {
        return {
          recommendSupplierFlag: 0,
        };
      }
    }
  }

  /**
   * 创建
   */
  @Throttle(1000, {
    trailing: false,
    leading: true,
  })
  @Bind()
  async spcmCreate() {
    const {
      remote,
      dispatch,
      workSpace: { sourceResultDTOs, createPurchaseOrderList = [], initContractInfo },
    } = this.props;
    const { itemKey, purchaseNeedDTOs = {} } = this.state;
    const { showAttachmentFlag } = initContractInfo || {};
    if (!(await this.headerFormDs?.validate())) {
      return false;
    }
    const headerInfo = this.headerFormDs?.toData()[0];
    const createPurchaseOrderInfo = createPurchaseOrderList[0] || {};
    const { supplierId, supplierName, supplierCode } = createPurchaseOrderInfo || {};
    let supplierTenantId = '';
    if (this.pcSourceCode === 'PURCHASE_ORDER') {
      createPurchaseOrderList.forEach((element) => {
        if (!supplierTenantId && element.supplierTenantId) {
          // eslint-disable-next-line prefer-destructuring
          supplierTenantId = element.supplierTenantId;
        }
      });
    }
    const purchaseOrderInfoObj =
      this.pcSourceCode === 'PURCHASE_ORDER'
        ? {
            supplierId,
            supplierName,
            supplierNum: supplierCode,
          }
        : {};
    const headerData = {
      supplierTenantId,
      ...purchaseOrderInfoObj,
      ...headerInfo,
      tenantId: getCurrentOrganizationId(),
      startDateActive: headerInfo.startDateActive
        ? moment(headerInfo.startDateActive).format(DEFAULT_DATETIME_FORMAT)
        : undefined,
      endDateActive: headerInfo.endDateActive
        ? moment(headerInfo.endDateActive).format(DEFAULT_DATETIME_FORMAT)
        : undefined,
      overseasProcurement: headerInfo.overseasProcurement ? 1 : 0,
      signEffectFlag: headerInfo.signEffectFlag ? 1 : 0,
      sourceResultDTOs,
      poLineLocationVOList: createPurchaseOrderList,
      executionStrategyCode: purchaseNeedDTOs?.executionStrategyCode,
      secondLevelStrategyCode: purchaseNeedDTOs?.secondLevelStrategyCode,
      orderSecondLevelStrategyCode: purchaseNeedDTOs?.orderSecondLevelStrategyCode,
      workbenchFlag: '1',
      // supplierCompanyId:
      //   pcSourceCode === 'PURCHASE_ORDER'
      //     ? createPurchaseOrderInfo.supplierCompanyId
      //     : headerInfo.supplierCompanyId,
    };
    if (remote?.event) {
      const resp = await remote.event.fireEvent('handleCuxSaveValidate', {
        headerData,
        current: this,
      });
      if (!resp) {
        return;
      }
    }
    const res = await dispatch({
      type: 'workSpace/add',
      payload: {
        ...headerData,
        pcSourceCode: this.pcSourceCode,
        customizeUnitCode:
          'SPCM.WORKSPACE_DETAIL.HEADER,SPCM.WORKSPACE_DETAIL.SUBJECT,SPCM.WORKSPACE_DETAIL.STAGE,SPCM.WORKSPACE_DETAIL.PARTNER,SPCM.WORKSPACE_DETAIL.BUSINESSTERMS',
      },
    });
    if (remote?.event) {
      const resp = await remote.event.fireEvent('handleCuxSaveAfter', {
        res,
        headerData,
        current: this,
      });
      if (!resp) {
        return;
      }
    }
    if (res) {
      notification.success();
      const path = initContractInfo?.enableSmartContract ? 'intelligent' : 'update';
      const pathPart = Number(showAttachmentFlag) === 1 ? 'update' : path;

      if (itemKey) {
        this.props.history.push({
          pathname: `/spcm/contract-workspace/${pathPart}/${res.pcHeaderId}`,
          search: `?from=purchaseContract&itemKey=${itemKey}`,
        });
      } else {
        this.props.history.push({
          pathname: `/spcm/contract-workspace/${pathPart}/${res.pcHeaderId}`,
        });
      }
    }
  }

  render() {
    const {
      customizeBtnGroup,
      customizeCollapseForm,
      custLoading,
      // saving,
      remote,
      workSpace,
    } = this.props;
    const { _linkFlag, finishFlag, attachmentSupportUpload } = this.state;
    const { pcKindCodes, thirdPartyInfo: { smartTaskId } = {} } = workSpace?.initContractInfo || {};
    const buttons = [
      {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          color: 'primary',
          // loading: saving,
          wait: 200,
          waitType: 'throttle',
          onClick: this.spcmCreate,
        },
      },
    ];
    const btns = remote.process('SPCM_WORKSPACE_DETAIL_CREATE_HEADER_BTNS', buttons, {
      isCreate: true,
      current: this,
    });
    return (
      <React.Fragment>
        <Header
          backPath="/spcm/contract-workspace/list"
          title={
            <>
              {intl.get('spcm.workspace.detail.create.title').d('新建协议')}
              {renderSmartTips({ smartTaskId })}
            </>
          }
        >
          {customizeBtnGroup(
            {
              code: 'SPCM.WORKSPACE_DETAIL.CREATE_HEADER_BTN',
              pro: true,
            },
            <DynamicButtons maxNum={5} trigger="hover" buttons={btns} defaultBtnType="c7n-pro" />
          )}
        </Header>
        <Content style={{ padding: '20px' }}>
          <h3 className={styles.createBase}>
            {intl.get(`${commonViewPrompt}.basicInformation`).d('基本信息')}
          </h3>
          {finishFlag && this.headerFormDs && (
            <ContractHeader
              customizeCollapseForm={customizeCollapseForm}
              isCreate
              attachmentSupportUpload={attachmentSupportUpload}
              custLoading={custLoading}
              headerFormDs={this.headerFormDs}
              _linkFlag={_linkFlag}
              remoteWorkDetail={remote}
              pcKindCodes={pcKindCodes}
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
