import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { DataSet } from 'choerodon-ui/pro';
import queryString from 'querystring';
// import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isEmpty, compose, noop, isFinite } from 'lodash';
// import { isEmpty } from 'lodash';
// import classnames from 'classnames';
import remote from 'utils/remote';
import { editCustomCode, viewCustomCode } from '@/utils/enum';

import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
// import intl from 'utils/intl';
// import notification from 'utils/notification';
import { queryNewOrOldLink } from '@/services/newContractService';
import { querySealType, queryShareEditConfig, getExtractConfig } from '@/services/workspaceService';
import { fetchTenantIsBlacklist } from '@/services/contractCommonService';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

// import styles from '../index.less';
import { fetchNewFunWhiteList } from '../utils/utils';
import headerFormDS from '../components/ContractHeader/HeaderFormDS';

import Wrapper2 from './Wrapper2';
// import EditOnlineWrapper from './EditOnlineWrapper';

// import { getCurrentOrganizationId } from 'utils/utils';

class Wrapper extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: { params: { pcHeaderId } = {} } = {},
      location: { search },
      editable,
    } = props;
    const { companyId } = queryString.parse(search.substr(1));
    this.companyId = companyId;
    this.pcHeaderId = pcHeaderId;
    this.headerFormDs = new DataSet(headerFormDS({ pcHeaderId, editable }));
    this.state = {
      enableTemplateEdit: null, // 是否允许编辑模板阶段
      enableEditShare: null, // 是否启用在线编辑协同
      onlyEditReplaceWildcardBefore: null, // 是否仅编辑通配符替换前的文件
      headerInfoRes: {},
      pcHeaderId,
      editable,
      hiddenRejectCompareTextFlag: false, // 合同拒绝后的文本对比隐藏标识
      attachmentSupportUpload: false, // 是否显示附件合同模板字段
      enableSmartContract: null, // 是否开启【智能合同提取控制】
      enableOnlineAttachmentContract: null, // 是否在【附件合同在线编辑黑名单】
      showTextMode: false,
      isBlacklistTenant: false, // 黑名单租户
    };
  }

  componentDidMount() {
    const { isChapter, remoteWorkDetail, location: { pathname } = {} } = this.props;
    const { pcHeaderId, editable } = this.state;
    let url = '';
    if (isChapter) {
      url = `purchase-contract/${pcHeaderId}/${this.companyId}`;
    }
    // 用章页面请求接口不一样
    const _this = this;
    this.fetchExtractConfig();
    // 增加查询在线编辑配置
    Promise.all([
      queryNewOrOldLink(),
      querySealType({ pcHeaderId }),
      this.fetchShareEditConfig(),
      this.queryNewFunWhiteList(),
    ]).then(([linkRes, resSealType]) => {
      this._linkFlag = !!linkRes;
      this.sealType = resSealType?.sealType || '';
      this.headerFormDs = new DataSet(
        remoteWorkDetail
          ? remoteWorkDetail.process(
              'SPCM_WORKSPACE_DETAIL_HEADERFORMDS',
              headerFormDS({ pcHeaderId, editable, _linkFlag: !!linkRes, url }),
              { current: this }
            )
          : headerFormDS({ pcHeaderId, editable, _linkFlag: !!linkRes, url })
      );
      this.headerFormDs.setState('sealType', this.sealType);
      // if (this.sealType&&isChapter) {
      //   this.headerFormDS.setQueryParameter('sealType', this.sealType);
      // }
      _this.fetchHeader().then(async (res) => {
        let headerInfoRes = { ...res };
        if (this.headerFormDs?.current) {
          this.headerFormDs.current.init('isPub', pathname?.includes('pub') ? '1' : '0');
        }
        if (remoteWorkDetail) {
          headerInfoRes = await remoteWorkDetail.process(
            'SPCM_WORKSPACE_DETAIL_FETCHHEADER',
            headerInfoRes,
            {
              current: this,
            }
          );
        }
        this.setState({
          headerInfoRes,
        });
        // _this.fetchList(headerInfoRes);
      });
    });
    // 查询租户是否不在黑名单
    this.queryTenantIsBlacklist();
  }

  componentDidUpdate() {
    const {
      match: {
        params: { pcHeaderId },
      },
    } = this.props;
    if (this.state.pcHeaderId !== pcHeaderId && pcHeaderId) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(
        {
          pcHeaderId,
          headerInfoRes: {},
        },
        () => {
          this.componentDidMount();
        }
      );
    }
  }

  // 在线编辑共享配置
  @Bind()
  fetchShareEditConfig() {
    queryShareEditConfig().then((res) => {
      if (getResponse(res)) {
        const { enableTemplateEdit, enableEditShare, onlyEditReplaceWildcardBefore } = res;
        this.setState({
          enableTemplateEdit, // 是否允许编辑模板阶段
          enableEditShare, // 是否启用在线编辑协同
          onlyEditReplaceWildcardBefore, // 是否仅编辑通配符替换前的文件
        });
      }
    });
  }

  @Bind()
  queryNewFunWhiteList() {
    // 查询配置表-隐藏合同拒绝后的文本对比的租户
    fetchNewFunWhiteList({
      functionCode: 'HIDE_TEXT_AFTER_CONTRACT_REJECT',
      callback: ({ enableFlag }) => {
        this.setState({
          hiddenRejectCompareTextFlag: !!Number(enableFlag), // 合同拒绝后的文本对比隐藏标识
        });
      },
    });
    // 查询配置表（协议新功能白名单）-是否显示附件合同模板字段
    fetchNewFunWhiteList({
      functionCode: 'ATTACHMENT_SUPPORT_UPLOAD',
      callback: ({ enableFlag }) => {
        this.setState({
          attachmentSupportUpload: !!Number(enableFlag), // 合同拒绝后的文本对比隐藏标识
        });
      },
    });
  }

  // 查询租户是否不在黑名单
  @Bind()
  queryTenantIsBlacklist() {
    fetchTenantIsBlacklist().then((res) => {
      // 返回1在黑名单，0 不在黑名单
      if (isFinite(Number(res))) {
        this.setState({
          isBlacklistTenant: !!Number(res),
        });
      } else {
        getResponse(res);
      }
    });
  }

  /**
   * 获取配置表是否开启【智能合同提取控制】、是否在【附件合同在线编辑黑名单】
   */
  @Bind()
  async fetchExtractConfig() {
    // if (intelligent) {
    const res = getResponse(await getExtractConfig());
    if (res) {
      const { enableSmartContract, enableOnlineAttachmentContract } = res;
      this.setState({
        enableSmartContract, // 是否开启【智能合同提取控制】
        enableOnlineAttachmentContract, // 是否在【附件合同在线编辑白名单】
        // 启用智能提取配置表的，或者租户在《附件合同在线编辑白名单》的需要展示切换模式
        // 启用智能提取配置表功能页会走分屏模式逻辑，工作流还是走的以前逻辑
        showTextMode: enableOnlineAttachmentContract || enableSmartContract,
      });
    }
    // }
  }

  /**
   * 查询头信息
   */
  @Bind()
  fetchHeader() {
    const { editable, isChapter } = this.props;
    this.headerFormDs.setQueryParameter('queryParams', {
      customizeUnitCode: editable
        ? `SPCM.WORKSPACE_DETAIL.HEADER,SPCM.WORKSPACE_DETAIL.ATTACHMENT_FORM,${Object.values(
            editCustomCode
          ).toString()}`
        : `SPCM.WORKSPACE_DETAIL.HEADER.READONLY,SPCM.WORKSPACE_DETAIL.ATTACHMENT_FORM,${Object.values(
            viewCustomCode
          ).toString()}`,
      authType: isChapter ? this.sealType : '',
    });
    return this.headerFormDs.query();
  }

  render() {
    const { editable } = this.props;
    const {
      headerInfoRes,
      pcHeaderId,
      enableEditShare,
      enableTemplateEdit,
      onlyEditReplaceWildcardBefore,
      hiddenRejectCompareTextFlag,
      attachmentSupportUpload,
      enableSmartContract,
      enableOnlineAttachmentContract,
      showTextMode,
      isBlacklistTenant,
    } = this.state;
    return (
      !isEmpty(headerInfoRes) && (
        <Wrapper2
          enableEditShare={enableEditShare}
          onlyEditReplaceWildcardBefore={onlyEditReplaceWildcardBefore}
          enableTemplateEdit={enableTemplateEdit}
          sealType={this.sealType}
          headerFormDs={this.headerFormDs}
          headerInfoRes={headerInfoRes}
          pcHeaderId={pcHeaderId}
          editable={editable}
          _linkFlag={this._linkFlag}
          hiddenRejectCompareTextFlag={hiddenRejectCompareTextFlag}
          attachmentSupportUpload={attachmentSupportUpload}
          enableSmartContract={enableSmartContract}
          enableOnlineAttachmentContract={enableOnlineAttachmentContract}
          showTextMode={showTextMode}
          isBlacklistTenant={isBlacklistTenant}
          {...this.props}
        />
      )
    );
  }
}

const hocFunc = (com) =>
  compose(
    connect(({ loading, workSpace }) => ({
      saving: loading.effects['workSpace/update'] || loading.effects['workSpace/add'],
      workSpace,
    })),
    formatterCollections({
      code: [
        'spcm.workspace',
        'spcm.contractChange',
        'spcm.common',
        'entity.company',
        'entity.business',
        'entity.organization',
        'entity.supplier',
        'entity.roles',
        'component.docFlow',
        'hzero.common',
        'spcm.contractSubject',
        'spcm.purchaseRequisitionCreation',
        'spcm.contractControl',
        'sodr.sendOrder',
        'ssta.purchaseSettle',
        'sodr.workspace',
        'entity.item',
        'entity.attachment',
        'ssrc.inquiryHall',
        'spcm.workspace',
        'spcm.purchaseContractView',
        'spcm.contractSign',
        'sodr.common',
        'spcm.contractChapter',
        'mallf.common',
        'hzero.c7nProUI',
        'sodr.quotePurchase',
        'spfp.ruleMaintenance',
        'spfp.common',
        'spcm.scux',
        'scux.spcm',
      ],
    }),
    withCustomize({
      unitCode: [
        'SPCM.WORKSPACE_DETAIL.HEADER', // 协议头
        'SPCM.WORKSPACE_DETAIL.BTN_GROUP', // 详情-按钮组
        'SPCM.WORKSPACE_DETAIL.HEADER.READONLY', // 协议头只读
        'SPCM.WORKSPACE_DETAIL.SUBJECT', // 标的
        'SPCM.WORKSPACE_DETAIL.SUBJECT.READONLY', // 标的只读
        'SPCM.WORKSPACE_DETAIL.STAGE', // 阶段
        'SPCM.WORKSPACE_DETAIL.STAGE.READONLY', // 阶段只读
        'SPCM.WORKSPACE_DETAIL.STAGE.BTN_GROUP', // 阶段按钮
        'SPCM.WORKSPACE_DETAIL.REBATE', // 返利信息
        'SPCM.WORKSPACE_DETAIL.REBATE.READONLY', // 返利信息只读
        'SPCM.WORKSPACE_DETAIL.REBATE.BTN_GROUP', // 返利信息-按钮组
        'SPCM.WORKSPACE_DETAIL.PARTNER', // 伙伴行
        'SPCM.WORKSPACE_DETAIL.PARTNER.READONLY', // 伙伴行只读
        'SPCM.WORKSPACE_DETAIL.PARTNER.BTN_GROUP', // 伙伴按钮
        'SPCM.WORKSPACE_DETAIL.CONTRACTREPLENISH', // 补充协议列表
        'SPCM.WORKSPACE_DETAIL.BUSINESSTERMS', // 业务条款
        'SPCM.WORKSPACE_DETAIL.BUSINESSTERMS.BTN_GROUP',
        'SPCM.WORKSPACE_DETAIL.BUSINESSTERMS.READONLY', // 业务条款只读
        'SPCM.WORKSPACE_DETAIL.BATCH.MAINTENANCE', // 标的批量维护
        'SPCM.WORKSPACE_COMMON.TERMINATION', // 协议终止
        'SPCM.WORKSPACE_DETAIL.SUBJECT.BTN_GROUP', // 标的-按钮组
        'SPCM.WORKSPACE_DETAIL.ATTACHMENT_CARD', // 协议附件卡片（左侧）
        'SPCM.WORKSPACE_DETAIL.ATTACHMENT_CARD2', // 协议附件卡片(右侧)
        'SPCM.WORKSPACE_DETAIL.CARD', // 协议卡片
        'SPCM.WORKSPACE_DETAIL.CARD.READONLY', // 协议只读
        'SPCM.WORKSPACE_DETAIL.TABLEEXTEND', // 协议自定义行表信息
        'SPCM.WORKSPACE_DETAIL.TABLEEXTEND.BTN_GROUP', // 协议自定义行表-按钮组
        'SPCM.WORKSPACE_DETAIL.TABLEEXTEND.READONLY', // 协议自定义行表信息-只读
        ...Object.values(editCustomCode), // 附件编辑态个性化
        ...Object.values(viewCustomCode), // 附件查看态个性化
        'SPCM.WORKSPACE_DETAIL.SMART_REVIEW_C', // 智能合同审核
      ],
    }),
    remote(
      {
        code: 'SPCM_WORKSPACE_DETAIL',
        name: 'remoteWorkDetail', // 默认 'remote'， 如有属性冲突可以改此属性
      },
      {
        process: {
          // 协议阶段行更新监控
          handleCuxStageLineUpdate: undefined,
          // 协议驳回生成预文本前，文本编辑头部处理
          handleCuxRenderHeader: undefined,
        },
        events: {
          // 审批工作台提交二开
          handleCuxWorkflowApprove(props = {}) {
            const { handleUpdateContract = noop } = props || {};
            handleUpdateContract();
          },
          handleCreateSubjectLines(props = {}) {
            const { batchCreateData = noop, selectedData = [] } = props || {};
            batchCreateData(selectedData);
          },
          // 删除标的行前置校验
          handleBeforeDeleteSubjectLines() {},
          handleChangeItemClear() {},
          // 改变工作台头字段埋点处理
          handleFormUpdate() {},
          // 归档前处理
          handleCuxPreArchive() {},
          // 归档后处理
          handleCuxArchive() {},
          // 作废
          handleCuxInvalid() {},
          // 终止
          handleCuxTerminate() {},
          // 历史版本对比
          handleCuxHistoryCompare() {},
          // 保存后处理
          handleCuxAfterUpdate() {},
          // 提交前处理
          submitBeforeValidate(props = {}) {
            const { handleUpdateContract } = props;
            handleUpdateContract({}, 0, 'isSubmit');
          },
          // 审批过程中wps保存
          handleCuxWpsSave() {},
          // 头供应商字段切换
          handleCuxSupplierLovChange() {},
          // 头保存之后
          handleCuxSaveHeaderAfter() {},
          // 协议标的保存之后
          handleCuxSaveContractSubjectAfter() {},
          // 标的行新建
          handleCuxContractSubjectAdd() {},
          // 提交按钮回调
          handleCuxSubmit() {},
          // 提交后埋点
          handleCuxSubmitAfter() {},
          // 保存前的校验
          handleCuxSaveValidate() {},
          // 协议性质修改校验
          handleCuxChangePcKindCode() {},
          // 协议阶段新增之后
          handleCuxContractStageCreateAfter() {},
          // 生成预文本二开
          handleCuxGeneratorPreFile() {},
          // 退回至模板二开
          handleCuxPreTextBack() {},
          // 文本创建二开
          handleCuxOpenEditArea() {},
          // 头公司更换
          handleCuxCompanyIdLovChange() {},
          // 处理二开需要初始化的信息
          handleCuxInitInfo() {},
          // 切换文本模式没有驳回版本(通配符替换后）文件处理
          handleNotRejectAfterFileUrl() {},
          // 删除协议后二开处理
          handleCuxDeleteAfter() {},
        },
      }
    )
  )(com);

export { Wrapper, hocFunc };

export default hocFunc(Wrapper);
