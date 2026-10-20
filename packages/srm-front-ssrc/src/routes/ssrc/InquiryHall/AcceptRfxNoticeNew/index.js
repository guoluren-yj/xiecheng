/**
 * 询价单 - 中标公告 -c7n
 * @date: 20120-6-4
 * @author: zk <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 *
 * 代码来源自 src/routes/ssrc/InquiryHall/AcceptRfxNotice
 */

import React, { Component } from 'react';
import {
  Form,
  DataSet,
  Output,
  CheckBox,
  NumberField,
  Select,
  TextField,
  Attachment,
  Spin,
  Modal,
} from 'choerodon-ui/pro';
import { Collapse, Icon } from 'choerodon-ui';

import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty, isArray, compose, noop } from 'lodash';
import classnames from 'classnames';
import { observer } from 'mobx-react';

import remotes from 'hzero-front/lib/utils/remote';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { getActiveTabKey } from 'utils/menuTab';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';

import {
  recallNotice,
  publishWInnerBidNotice,
  BidNoticeValidateBeforePublish,
  fetchWInnerBidNotice,
  previewWInnerBidNotice,
  saveWInnerBidNotice,
} from '@/services/inquiryHallService';
import { phoneRender } from '@/utils/renderer';

import IMChatDraggable from '_components/IMChatDraggable';
import { BID, getDocumentTypeName, INQUIRY } from '@/utils/globalVariable';
import { openOrFreshTab } from '@/utils/utils';

import { idValidation } from '@/routes/components/Widget/dataVerification';

import common from '@/routes/sbid/common.less';
import style from './index.less';

import { SourceNoticeDS, previewWInnerBidNoticeDataSet } from './store';

const { Panel } = Collapse;

class AcceptRfxNotice extends Component {
  constructor(props) {
    super(props);

    this.noticeType = 'BR_ACCEPTED';

    this.sourceKey = this.props.sourceKey || INQUIRY;

    this.bidFlag = this.sourceKey === BID;

    this.documentTypeName = getDocumentTypeName(this.bidFlag);

    this.organizationId = getCurrentOrganizationId();

    this.sourceNoticeDS = new DataSet(
      SourceNoticeDS({
        organizationId: this.organizationId,
        sourceKey: this.sourceKey,
        bidFlag: this.bidFlag,
        documentTypeName: this.documentTypeName,
      })
    );

    this.previewWInnerBidNoticeDS = new DataSet(
      previewWInnerBidNoticeDataSet({
        organizationId: this.organizationId,
        sourceKey: this.sourceKey,
        bidFlag: this.bidFlag,
        documentTypeName: this.documentTypeName,
      })
    );

    this.state = {
      collapseKeys: ['baseInfos', 'bidNotice'], // 折叠面板
      operationLoading: false,
      previewInfoData: {},
    };
  }

  componentDidMount() {
    this.fetchWInnerBidNotice();
  }

  componentWillUnmount() {}

  toggleOperationLoading = (loading = false) => {
    this.setState({
      operationLoading: loading,
    });
  };

  getRfxIdFromParam = () => {
    const {
      match: { params = {} },
    } = this.props;

    const { rfxId = null } = params || {};

    return rfxId;
  };

  /**
   * 查询公告
   */
  @Bind()
  async fetchWInnerBidNotice(data = {}) {
    const { history } = this.props;
    const sourceHeaderId = this.getRfxIdFromParam();

    idValidation(sourceHeaderId);

    const queryParams = {
      ...data,
      organizationId: this.organizationId,
      sourceFrom: 'RFX',
      sourceHeaderId,
      noticeType: this.noticeType,
      customizeUnitCode: `${this.getCustomizeUnitCode([
        'noticeInfoForm',
        'baseInfoForm',
        'noticeReadInfoForm',
      ])}`,
    };
    let result = await fetchWInnerBidNotice(queryParams);
    result = getResponse(result);

    if (!result) {
      return;
    }

    const { sourceStatus, noticeRuleStatus, winNoticeFlag } = result || {};

    if (this.sourceNoticeDS?.current) {
      this.sourceNoticeDS.loadData([result]);
    } else {
      this.sourceNoticeDS.create(result, 0);
    }

    if (sourceStatus && sourceStatus !== 'FINISHED') {
      history.push(`${getActiveTabKey()}/list`);
    }
    if (noticeRuleStatus === 'RELEASE' && winNoticeFlag) {
      this.queryPreviewWInnerBidNotice();
    }
  }

  /**
   * 查询预览询价公告 - 提供给移动端拖拽组件使用
   */
  /**
   * 招标公告
   * */
  queryPreviewWInnerBidNotice = async () => {
    const sourceHeaderId = this.getRfxIdFromParam();

    idValidation(sourceHeaderId);

    let result = await previewWInnerBidNotice({
      organizationId: this.organizationId,
      noticeType: this.noticeType,
      sourceFrom: 'RFX',
      sourceHeaderId,
      customizeUnitCode: `${this.getCustomizeUnitCode([
        'noticeInfoForm',
        'baseInfoForm',
        'noticeReadInfoForm',
      ])}`,
    });

    result = getResponse(result);
    if (!result) {
      return;
    }

    this.previewWInnerBidNoticeDS.loadData([result]);

    this.setState({
      previewInfoData: result,
    });
  };

  getAndValidateNoticeBaseInfo = async () => {
    const sourceHeaderId = this.getRfxIdFromParam();
    const { current } = this.sourceNoticeDS || {};

    let validationFlag = false;
    let formData = null;
    if (!current) {
      return;
    }

    this.sourceNoticeDS.current.set('status', 'update');

    validationFlag = await this.sourceNoticeDS.validate();
    formData = current?.toData() || {};

    return {
      validationFlag,
      organizationId: this.organizationId,
      data: {
        ...formData,
        noticeType: this.noticeType,
        sourceFrom: 'RFX',
        sourceHeaderId,
      },
      customizeUnitCode: `${this.getCustomizeUnitCode(['noticeInfoForm', 'baseInfoForm'])}`,
    };
  };

  /**
   * 保存
   */
  @Throttle(500)
  handleSave = async () => {
    const { validationFlag, ...others } = await this.getAndValidateNoticeBaseInfo();

    this.toggleOperationLoading(true);
    let result = await saveWInnerBidNotice(others);
    result = getResponse(result);
    this.toggleOperationLoading();
    if (!result) {
      return;
    }

    notification.success();
    this.fetchWInnerBidNotice();
  };

  /**
   * 发布
   */
  @Throttle(500)
  handlePublish = async () => {
    const { validationFlag, ...data } = await this.getAndValidateNoticeBaseInfo();
    if (!validationFlag) {
      return;
    }

    let validateResult = [];

    const publish = async (res = null) => {
      const result = getResponse(await publishWInnerBidNotice(data));
      this.toggleOperationLoading();

      if (result && !result.failed) {
        notification.success();
        this.fetchWInnerBidNotice();
      }

      if (isEmpty(res) || !isArray(res)) {
        return;
      }

      const jumpObj = res.filter((item) => item.jumpUrl);
      if (jumpObj && jumpObj.length) {
        history.push(jumpObj[0].jumpUrl);
      }
    };

    /**
     * 循环校验弹框
     */
    const confirmSubmit = (res) => {
      if (!validateResult || isEmpty(validateResult)) {
        publish(res);
        return;
      }

      const currentObj = validateResult[0];
      const { type, message = '', jumpUrl = null } = currentObj || {};
      if (type === 'ERROR') {
        Modal.error({
          content: message,
          onOk: () => {
            this.toggleOperationLoading();

            if (jumpUrl) {
              history.push(jumpUrl);
            }
          },
          onClose: () => {
            this.toggleOperationLoading();
          },
        });
      } else if (type === 'WARNING') {
        // 统一处理只提交操作的
        Modal.confirm({
          content: message,
          onOk: () => {
            validateResult.splice(0, 1);
            confirmSubmit(res);
          },
          onCancel: () => {
            this.toggleOperationLoading();
          },
        });
      }
    };

    // 发布前校验
    this.toggleOperationLoading(true);
    const result = getResponse(await BidNoticeValidateBeforePublish(data));
    if (result && result.length) {
      validateResult = JSON.parse(JSON.stringify(result));
      confirmSubmit(result);
    } else {
      publish(result);
    }
  };

  /**
   * 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * backPath 返回页判断
   */
  @Bind()
  backJudge() {
    const back = `${getActiveTabKey()}/list`;
    return back;
  }

  // 中标公告预览
  @Bind()
  previewNotice() {
    const rfxId = this.getRfxIdFromParam();
    if (!rfxId) {
      return;
    }

    const tabKey = `/ssrc/${
      this.bidFlag ? 'new-bid' : 'inquiry'
    }-hall/accept-rfx-notice-detail/${rfxId}`;

    openOrFreshTab({
      key: tabKey,
      path: tabKey,
      action: 'ssrc.inquiryHall.view.title.acceptNotice',
      // title: intl.get(`ssrc.inquiryHall.view.title.acceptNotice`).d('中标公告'),
      title: 'srm.common.tab.title.ssrc.acceptNotice',
      closable: true,
    });
  }

  // 勾选中标通知
  // @Bind()
  // handleChange(e) {
  //   const { remote } = this.props;
  //   if (remote?.event) {
  //     remote.event.fireEvent('onChange', {
  //       handleSave: this.skipValidateSave,
  //       value: e.target.checked,
  //     });
  //   }
  // }

  renderBasicInfosForm = () => {
    const { customizeForm } = this.props;

    const fields = [
      <Output name="sourceNum" />,
      <Output name="sourceTitle" />,
      <Output name="companyName" />,
      <Output name="purName" />,
      <Output
        name="purPhone"
        renderer={({ record }) => {
          const { internationalTelCodeMeaning, purPhone } = record.get([
            'internationalTelCodeMeaning',
            'purPhone',
          ]);

          return phoneRender(internationalTelCodeMeaning, purPhone);
        }}
      />,
      <Output name="purEmail" />,
      <CheckBox name="winMessageFlag" />,
      <CheckBox name="loseMessageFlag" />,
      <CheckBox name="winNoticeFlag" />,
    ].filter(Boolean);

    return customizeForm(
      {
        code: this.getCustomizeUnitCode('baseInfoForm'),
      },
      <Form
        labelLayout="vertical"
        className="c7n-pro-vertical-form-display"
        columns={3}
        useWidthPercent
        dataSet={this.sourceNoticeDS}
      >
        {fields}
      </Form>
    );
  };

  // 公告是否发布
  isBidNoticeReleased = () => {
    const { current } = this.sourceNoticeDS || {};
    if (!current) {
      return '';
    }

    const { noticeRuleStatus } = current.get(['noticeRuleStatus']) || {};

    const noticeReleased = noticeRuleStatus === 'RELEASE';

    return noticeReleased;
  };

  getNoticeFormWithReadOnly = () => {
    const { customizeForm } = this.props;
    const { current } = this.sourceNoticeDS || {};
    if (!current) {
      return '';
    }

    const { expertScoreType } = current.get(['expertScoreType']) || {};

    // 发布后预览表单字段
    const fields = [
      <Output name="noticeTitle" />,
      <Output name="noticeDays" />,
      <Output name="visibleRangeType" />,
      <Output name="nameVisibleType" />,
      <Output name="priceVisibleType" />,
      <Output name="quantityVisibleType" />,
      expertScoreType !== 'NONE' ? <Output name="expertVisibleType" /> : null,
      <Attachment name="noticeAttachmentUuid" viewMode="popup" funcType="link" />,
      <Output
        name="inquiryGroup"
        renderer={() => {
          return (
            <a onClick={this.previewNotice}>{intl.get('hzero.common.button.preview').d('预览')}</a>
          );
        }}
      />,
    ].filter(Boolean);

    return customizeForm(
      {
        code: this.getCustomizeUnitCode('noticeReadInfoForm'),
      },
      <Form
        labelLayout="vertical"
        className="c7n-pro-vertical-form-display"
        columns={3}
        useWidthPercent
        dataSet={this.sourceNoticeDS}
      >
        {fields}
      </Form>
    );
  };

  getNoticeFormWithEdit = () => {
    const { customizeForm } = this.props;
    const { current } = this.sourceNoticeDS || {};
    if (!current) {
      return '';
    }

    const { expertScoreType, noticeRuleId } =
      current.get(['expertScoreType', 'noticeRuleId']) || {};

    // 编辑表单
    const fields = [
      <TextField name="noticeTitle" />,
      <NumberField name="noticeDays" />,
      <Select name="visibleRangeType" />,
      <Select name="nameVisibleType" />,
      <Select name="priceVisibleType" />,
      <Select name="quantityVisibleType" />,
      expertScoreType !== 'NONE' ? <Select name="expertVisibleType" /> : null,
      <Attachment name="noticeAttachmentUuid" viewMode="popup" funcType="link" />,
      noticeRuleId ? (
        <Output
          name="inquiryGroup"
          renderer={() => {
            return (
              <a onClick={this.previewNotice}>
                {intl.get('hzero.common.button.preview').d('预览')}
              </a>
            );
          }}
        />
      ) : null,
    ].filter(Boolean);

    return customizeForm(
      {
        code: this.getCustomizeUnitCode('noticeInfoForm'),
      },
      <Form labelLayout="float" columns={3} useWidthPercent dataSet={this.sourceNoticeDS}>
        {fields}
      </Form>
    );
  };

  // 中标公告 表单
  renderBidNoticeForm = () => {
    const noticeReleased = this.isBidNoticeReleased();

    if (noticeReleased) {
      return this.getNoticeFormWithReadOnly();
    }

    return this.getNoticeFormWithEdit();
  };

  /**
   * 渲染title
   */
  titleRender = () => {
    const { previewInfoData } = this.state;

    const { current } = this.sourceNoticeDS || {};
    if (!current) {
      return '';
    }

    const { noticeRuleStatus, winNoticeFlag, sourceNum } =
      current.get(['noticeRuleStatus', 'winNoticeFlag', 'sourceNum']) || {};

    const { sourceHeaderId, sourceTitle, sourceCategoryMeaning, rfxLineItemList = [] } =
      previewInfoData || {};

    const title = intl
      .get('ssrc.inquiryHall.view.message.title.bidNoticeAnnounce')
      .d('中标通知/公告');
    if (noticeRuleStatus !== 'RELEASE' || !winNoticeFlag) {
      return title;
    }
    const chatProps = {
      cardCode: 'SSRC_RFX_ANNOUNCEMENT_OF_WINNING_BID',
      cardType: 'ARTICLE',
      dragText: `${sourceCategoryMeaning}${sourceNum}`,
      requestBody: () => ({
        ...(previewInfoData || {}),
        id: sourceHeaderId,
        title: sourceTitle,
        lineItemList: rfxLineItemList,
      }),
      showDetail: true,
    };
    return <IMChatDraggable {...chatProps}>{title}</IMChatDraggable>;
  };

  @Throttle(500)
  @Bind()
  async handleRecall() {
    const { current } = this.sourceNoticeDS || {};
    if (!current) {
      return '';
    }

    const {
      sourceFrom,
      noticeType,
      noticeRuleId,
      sourceHeaderId,
      noticeRuleStatus,
      objectVersionNumber,
    } =
      current.get([
        'sourceFrom',
        'noticeType',
        'noticeRuleId',
        'sourceHeaderId',
        'noticeRuleStatus',
        'objectVersionNumber',
      ]) || {};

    const params = {
      sourceFrom,
      noticeType,
      noticeRuleId,
      sourceHeaderId,
      noticeRuleStatus,
      objectVersionNumber,
    };

    const res = getResponse(await recallNotice(params));
    if (res) {
      notification.success();
      this.fetchWInnerBidNotice();
    }
  }

  pageNeedLoading = () => {
    const { operationLoading } = this.state;
    const { status } = this.sourceNoticeDS || {};

    const loading = operationLoading || status === 'loading';
    return loading;
  };

  renderHeaderButtons = () => {
    const { customizeBtnGroup = noop, remote } = this.props;
    const { current } = this.sourceNoticeDS || {};
    if (!current) {
      return '';
    }

    const loading = this.pageNeedLoading();

    const { noticeRuleStatus, noticeRuleId, winNoticeFlag } =
      current.get(['noticeRuleStatus', 'noticeRuleId', 'winNoticeFlag']) || {};
    const noticeReleased = noticeRuleStatus === 'RELEASE';

    let buttons = [
      !noticeReleased
        ? {
            name: 'publish',
            btnType: 'c7n-pro',
            btnProps: {
              onClick: () => this.handlePublish(),
              loading,
              color: 'primary',
              icon: 'publish2',
            },
            child: intl.get('hzero.common.button.release').d('发布'),
          }
        : null,
      !noticeReleased
        ? {
            name: 'save',
            btnType: 'c7n-pro',
            btnProps: {
              onClick: () => this.handleSave(),
              loading,
              icon: 'save',
              funcType: 'flat',
            },
            child: intl.get('hzero.common.button.save').d('保存'),
          }
        : null,
      noticeReleased && noticeRuleId && winNoticeFlag
        ? {
            name: 'recall',
            btnType: 'c7n-pro',
            btnProps: {
              onClick: () => this.handleRecall(),
              loading,
              icon: 'reply',
              color: 'primary',
            },
            child: intl.get('ssrc.acceptBidNotice.model.button.recallNotice').d('撤销公告'),
          }
        : null,
    ].filter(Boolean);

    const remoteProcessProps = {
      fetchWInnerBidNotice: this.fetchWInnerBidNotice,
      bidFlag: this.bidFlag,
      that: this,
    };

    buttons = remote
      ? remote.process(
          'SSRC_ACCEPT_RFX_NOTICE_NEW_PROCESS_HEADER_BUTTONS',
          buttons,
          remoteProcessProps
        )
      : buttons;

    return (
      <>
        {customizeBtnGroup(
          {
            code: '',
            pro: true,
          },
          <DynamicButtons buttons={buttons} defaultBtnType="c7n-pro" />
        )}
      </>
    );
  };

  // 获取个性化
  getCustomizeUnitCode = (type = null) => {
    if (!type || isEmpty(type)) {
      return null;
    }

    const RfxCodeMap = new Map([
      ['baseInfoForm', 'SSRC.INQUIRY_HALL_NOTICE.NOTICE_FORM_INFO'],
      ['noticeInfoForm', 'SSRC.INQUIRY_HALL_NOTICE.NOTICE_FORM'],
      ['noticeReadInfoForm', 'SSRC.INQUIRY_HALL_NOTICE.NOTICE_FORM_READ'],
    ]);

    const BidCodeMap = new Map([
      ['baseInfoForm', 'SSRC.BID_HALL_NOTICE.NOTICE_FORM_INFO'],
      ['noticeInfoForm', 'SSRC.BID_HALL_NOTICE.NOTICE_FORM'],
      ['noticeReadInfoForm', 'SSRC.BID_HALL_NOTICE.NOTICE_FORM_READ'],
    ]);

    const CodeDataMap = !this.bidFlag ? RfxCodeMap : BidCodeMap;
    let currentUnitCode = null;

    if (typeof type === 'string') {
      currentUnitCode = CodeDataMap.get(type);
    }

    if (isArray(type)) {
      const codeSet = new Set();
      type.forEach((unitCode) => {
        codeSet.add(CodeDataMap.get(unitCode));
      });

      currentUnitCode = codeSet.size ? [...codeSet].join(',') : null;
    }

    return currentUnitCode;
  };

  render() {
    const { collapseKeys } = this.state;

    const { current } = this.sourceNoticeDS || {};
    if (!current) {
      return '';
    }

    const loading = this.pageNeedLoading();

    const { winNoticeFlag } = current.get(['winNoticeFlag']) || {};

    return (
      <React.Fragment>
        <Header title={this.titleRender()} backPath={this.backJudge()}>
          {this.renderHeaderButtons()}
        </Header>
        <Content
          className={classnames(
            common['page-content-custom'],
            'ued-detail-wrapper',
            style['ssrc-accept-rfx-notice-new-content']
          )}
        >
          <Spin spinning={loading}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={['baseInfos', 'bidNotice']}
              onChange={this.onCollapseChange}
            >
              <Panel
                showArrow={false}
                header={
                  <React.Fragment>
                    <span className={style['ssrc-notice-collapse-panel-title-text']}>
                      {intl.get(`ssrc.inquiryHall.view.message.panel.baseInfos`).d('基本信息')}
                    </span>
                    <a>
                      {collapseKeys.includes('baseInfos')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('baseInfos') ? 'up' : 'down'} />
                  </React.Fragment>
                }
                key="baseInfos"
              >
                {this.renderBasicInfosForm()}
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <React.Fragment>
                    <span className={style['ssrc-notice-collapse-panel-title-text']}>
                      {intl.get(`ssrc.inquiryHall.view.panel.winnerBidNotice`).d('中标公告')}
                    </span>
                    <a>
                      {collapseKeys.includes('bidNotice')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('bidNotice') ? 'up' : 'down'} />
                  </React.Fragment>
                }
                key="bidNotice"
                hidden={!winNoticeFlag}
              >
                {this.renderBidNoticeForm()}
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}

const hocComponent = (NewComponent, options = {}) => {
  const { bidFlag = false } = options || {};
  const unitCodes = !bidFlag
    ? [
        'SSRC.INQUIRY_HALL_NOTICE.NOTICE_FORM_INFO', // 基础信息
        'SSRC.INQUIRY_HALL_NOTICE.NOTICE_FORM', // 中标公告表单
        'SSRC.INQUIRY_HALL_NOTICE.NOTICE_FORM_READ', // 中标公告表单(只读)
      ]
    : [
        'SSRC.BID_HALL_NOTICE.NOTICE_FORM_INFO', // 基础信息
        'SSRC.BID_HALL_NOTICE.NOTICE_FORM', // 中标公告表单
        'SSRC.BID_HALL_NOTICE.NOTICE_FORM_READ', // 中标公告表单(只读)
      ];

  return compose(
    formatterCollections({
      code: [
        'ssrc.inquiryHall',
        'ssrc.bidHall',
        'ssrc.common',
        'ssrc.acceptBidNotice',
        'ssrc.scux',
        'sscux.ssrc',
      ],
    }),
    withCustomize({
      unitCode: unitCodes,
    }),
    remotes(
      {
        code: 'SSRC_ACCEPT_RFX_NOTICE_NEW',
        name: 'remote',
      },
      {
        events: {},
      }
    )
  )(observer(NewComponent));
};

export default hocComponent(AcceptRfxNotice);
export { hocComponent, AcceptRfxNotice };
