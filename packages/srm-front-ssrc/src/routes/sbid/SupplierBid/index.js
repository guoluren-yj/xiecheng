/**
 * Recommend - 供应商投标-列表
 * @date: 2019-05-15
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Table, Popover, Badge } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isUndefined } from 'lodash';
import querystring from 'querystring';
import classnames from 'classnames';
import moment from 'moment';

import { yesOrNoRender } from 'utils/renderer';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';
import ReadMatterDetail from '@/routes/components/MatterDetail/ReadMatterDetail';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import notification from 'utils/notification';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import PretrialPanelModal from '@/routes/components/PretrialPanelModal/index';
import styles from './index.less';
import FilterForm from './FilterForm';
import PretrialApplicationModal from './PretrialApplicationModal';

// const promptCode = 'ssrc.supplierBid';
@withCustomize({
  unitCode: [
    'SSRC.SUPPLIER_BID_LIST.PREQUAL_INFO', // 资格预审
  ],
})
@connect(({ supplierBid, loading }) => ({
  supplierBid,
  Loading: loading.effects['supplierBid/fetchBidList'],
  selectPreApplyLoading: loading.effects['supplierBid/fetchPretrialApplication'],
  savePreApplyLoading: loading.effects['supplierBid/savePretrialApplication'],
  submitPreApplyLoading: loading.effects['supplierBid/submitPretrialApplication'],
  fetchPretrialPanelLoading: loading.effects['supplierBid/fetchPretrialPanel'],
  saveConfirmMatterLoading: loading.effects['supplierBid/fetchSaveConfirmMatter'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['ssrc.supplierBid', 'ssrc.common'],
})
export default class Supplierquotation extends Component {
  form;

  state = {
    preApplyModalVisible: false,
    prequalOnlyRead: false,
    pretrialPanelVisible: false, // 预审小组弹框
    readMatterDetailVisible: false, // 招标事项阅读
    currentOperateRow: {}, // 当前操作行
    currentAttachmentUuid: null, // 资格预审申请文件的uuid
  };

  // 初始化查询供应商投标
  componentDidMount() {
    this.querySupplier();
  }

  /**
   * 供应商投标查询
   */
  @Bind()
  querySupplier() {
    const {
      dispatch,
      supplierBid: { bidPagination = {} },
    } = this.props;
    this.handleSearch(bidPagination);
    const lovCodes = {
      sourceCategory: 'SSRC.SOURCE_CATEGORY', // 寻源类别
      inquiryMethod: 'SSRC.SOURCE_METHOD', // 寻源方式
      biddingDirection: 'SSRC.SOURCE_AUCTION_DIRECTION', // 投标方向
      reviewMethod: 'SSRC.REVIEW_METHOD', // 审查方式
      quotationStatus: 'SSRC.BID_QUOTATION_STATUS', // 投标状态
      bidType: 'SSRC.BID_TYPE', // 招标类别
    };
    dispatch({
      type: 'supplierBid/batchCode',
      payload: { lovCodes },
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 点击PFx跳转-招投标
   */
  @Bind()
  onrfxNum(record) {
    const type = 'view';
    const { dispatch } = this.props;
    const {
      bidHeaderId,
      supplierCompanyId,
      quotationHeaderId = null,
      subjectMatterRule = '',
    } = record;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/supplier-bid-hall/detail/${bidHeaderId}/${supplierCompanyId}/${type}`,
        search: querystring.stringify({
          quotationHeaderId,
          subjectMatterRule,
        }),
      })
    );
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, organizationId } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'supplierBid/fetchBidList',
      payload: {
        page,
        ...fieldValues,
        organizationId,
      },
    });
  }

  /**
   * 预审申请数据获取
   * @param {String} bidHeaderId -询价单头id
   */
  @Bind()
  fetchPretrialApplicationData(record = {}) {
    const { dispatch } = this.props;
    const { bidHeaderId, supplierCompanyId } = this.state;
    dispatch({
      type: 'supplierBid/fetchPretrialApplication',
      payload: {
        bidHeaderId: record.bidHeaderId || bidHeaderId,
        prequalCategory: 'BID',
        supplierCompanyId: record.supplierCompanyId || supplierCompanyId,
        customizeUnitCode: 'SSRC.SUPPLIER_BID_LIST.PREQUAL_INFO',
      },
    });
  }

  /**
   * 资格预审申请保存回调
   * @param {Object} params - 保存接口所需参数
   */
  @Bind()
  savePretrialApplicationData(params) {
    const { organizationId, dispatch } = this.props;
    dispatch({
      type: 'supplierBid/savePretrialApplication',
      payload: {
        organizationId,
        supplierCompanyId: params.supplierCompanyId,
        supplierPrequalDTO: params.supplierPrequalDTO,
        customizeUnitCode: 'SSRC.SUPPLIER_BID_LIST.PREQUAL_INFO',
      },
    }).then((res) => {
      if (res) {
        this.fetchPretrialApplicationData();
      }
    });
  }

  /**
   * 资格预审申请提交回调
   * @param {Object} params - 提交接口所需参数
   */
  @Bind()
  submitPretrialApplicationData(params) {
    const { organizationId, dispatch } = this.props;
    dispatch({
      type: 'supplierBid/submitPretrialApplication',
      payload: {
        organizationId,
        supplierCompanyId: params.supplierCompanyId,
        supplierPrequalDTO: params.supplierPrequalDTO,
      },
    }).then((res) => {
      if (res) {
        this.setState({ preApplyModalVisible: false }, () => {
          this.clearPretrialApplicationData();
          this.querySupplier();
        });
      }
    });
  }

  /** 关闭模态框时清楚model中的数据 */
  @Bind()
  clearPretrialApplicationData() {
    this.props.dispatch({
      type: 'supplierBid/updateState',
      payload: {
        fetchPretrialApplicationData: {},
      },
    });
    this.setState({
      currentAttachmentUuid: null,
    });
  }

  @Bind()
  /**
   * 资格预审查看操作
   * @returns {*}
   */
  selectPreAppModal(record = {}) {
    const { prequalLineStatus } = record;
    let prequalOnlyRead = false;
    if (
      prequalLineStatus === 'REFUSED' ||
      prequalLineStatus === 'APPROVED' ||
      prequalLineStatus === 'NO_APPROVED'
    ) {
      prequalOnlyRead = true;
    }
    this.fetchPretrialApplicationData(record);
    this.setState({
      prequalOnlyRead,
      bidHeaderId: record.bidHeaderId,
      supplierCompanyId: record.supplierCompanyId,
      preApplyModalVisible: true,
      quotationStatus: record.quotationStatus,
      quotationStartDate: record.quotationStartDate,
    });
  }

  /**
   * 参与操作
   */
  @Bind()
  participateIng(record) {
    const { dispatch } = this.props;
    const quotationHeaderId = record.quotationHeaderId || null;
    const { bidHeaderId, supplierCompanyId, tenantId, subjectMatterRule = '' } = record;
    const type = 'operation';
    if (record.showMatterFlag === 1) {
      // case 1: 代表还没有阅读过   ps: !== 0 是为了防止数据库没有刷数据
      dispatch({
        type: 'supplierBid/fetchSaveConfirmMatter',
        payload: {
          tenantId,
          bidHeaderId,
          supplierCompanyId,
        },
      }).then((res) => {
        if (res) {
          dispatch(
            routerRedux.push({
              pathname: `/ssrc/supplier-bid-hall/detail/${record.bidHeaderId}/${record.supplierCompanyId}/${type}`,
              search: querystring.stringify({
                quotationHeaderId,
                subjectMatterRule,
              }),
            })
          );
        }
      });
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/supplier-bid-hall/detail/${record.bidHeaderId}/${record.supplierCompanyId}/${type}`,
          search: querystring.stringify({
            quotationHeaderId,
            subjectMatterRule,
          }),
        })
      );
    }
  }

  /**
   * 查看投标
   */
  @Bind()
  onBidView(record = {}) {
    const { dispatch } = this.props;
    const { subjectMatterRule = '' } = record;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/supplier-bid-hall/view/${record.quotationHeaderId}`,
        search: querystring.stringify({
          subjectMatterRule,
        }),
      })
    );
  }

  /**
   * 投标-操作
   */
  @Bind()
  onBidDone(record = {}) {
    const { dispatch } = this.props;
    const { subjectMatterRule = '' } = record;
    if (record.bidBondFlag) {
      notification.warning({
        message: intl
          .get('ssrc.supplierBid.view.message.notPayDeposit')
          .d('请缴纳保证金后再投标！'),
      });
      return;
    }
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/supplier-bid-hall/bidDone/${record.quotationHeaderId}`,
        search: querystring.stringify({
          subjectMatterRule,
        }),
      })
    );
  }

  /**
   * 按钮操作
   * @returns {*}
   */
  @Bind()
  operationRender(text, record) {
    let mean = '';
    switch (record.quotationStatus) {
      // 尚未参与
      case 'UNPARTICIPATED':
        mean = (
          <span>
            <a onClick={() => this.onBeforeParticipate(record)}>
              {intl.get(`ssrc.supplierBid.view.message.button.participate`).d('参与')}
            </a>
          </span>
        );
        break;
      // 待资格预审
      case 'PREQUAL':
        mean = (
          <span>
            {record.quotationEndFlag !== '1' && (
              <a onClick={() => this.selectPreAppModal(record)} style={{ marginRight: '10px' }}>
                {intl.get(`ssrc.supplierBid.view.message.button.preQualification`).d('资格预审')}
              </a>
            )}
            <Badge
              count={record.unreadClarifyCount}
              offset={[5, 12]}
              className={styles['badge-item']}
            >
              <a onClick={() => this.questionAnswer(record)}>
                {intl.get(`ssrc.supplierBid.view.message.button.clearAnswer`).d('澄清答疑')}
              </a>
            </Badge>
          </span>
        );
        break;
      // 资格预审中
      case 'IN_PREQUAL':
        mean = (
          <span>
            {record.quotationEndFlag !== '1' && (
              <a onClick={() => this.selectPreAppModal(record)} style={{ marginRight: '10px' }}>
                {intl.get(`ssrc.supplierBid.view.message.button.preQualification`).d('资格预审')}
              </a>
            )}
            <Badge
              count={record.unreadClarifyCount}
              offset={[5, 12]}
              className={styles['badge-item']}
            >
              <a onClick={() => this.questionAnswer(record)}>
                {intl.get(`ssrc.supplierBid.view.message.button.clearAnswer`).d('澄清答疑')}
              </a>
            </Badge>
          </span>
        );
        break;
      // 未入围
      case 'PRE_REFUSED':
        mean = '';
        break;
      // 已入围
      case 'BIDDING':
        mean = (
          <span>
            {record.quotationEndFlag !== '1' && (
              <a onClick={() => this.onBidDone(record)} style={{ marginRight: '10px' }}>
                {intl.get(`ssrc.supplierBid.view.message.button.tender`).d('投标')}
              </a>
            )}
            <Badge
              count={record.unreadClarifyCount}
              offset={[5, 12]}
              className={styles['badge-item']}
            >
              <a onClick={() => this.questionAnswer(record)}>
                {intl.get(`ssrc.supplierBid.view.message.button.clearAnswer`).d('澄清答疑')}
              </a>
            </Badge>
          </span>
        );
        break;
      // 已投标
      case 'QUOTED':
        mean = (
          <span>
            {record.quotationEndFlag !== '1' && (
              <a onClick={() => this.onBidView(record)} style={{ marginRight: '10px' }}>
                {intl.get(`ssrc.supplierBid.view.message.button.viewBidding`).d('查看投标')}
              </a>
            )}
            <Badge
              count={record.unreadClarifyCount}
              offset={[5, 12]}
              className={styles['badge-item']}
            >
              <a onClick={() => this.questionAnswer(record)}>
                {intl
                  .get(`ssrc.supplierBid.view.messaonBidViewge.button.clearAnswer`)
                  .d('澄清答疑')}
              </a>
            </Badge>
          </span>
        );
        break;
      case 'RETURN_PREQUAL':
        mean = (
          <span>
            <Badge
              status="error"
              text={
                <a onClick={() => this.selectPreAppModal(record)} style={{ marginRight: '10px' }}>
                  {intl.get(`ssrc.supplierBid.view.message.button.preQualification`).d('资格预审')}
                </a>
              }
            />
            <Badge
              count={record.unreadClarifyCount}
              offset={[5, 12]}
              className={styles['badge-item']}
            >
              <a onClick={() => this.questionAnswer(record)}>
                {intl.get(`ssrc.supplierBid.view.message.button.clearAnswer`).d('澄清答疑')}
              </a>
            </Badge>
          </span>
        );
        break;
      default:
        mean = '';
    }
    return mean;
  }

  /**
   * 澄清答疑
   */
  @Bind()
  questionAnswer(record) {
    const { history } = this.props;
    const { clarifyEndTime, tenantId } = record || {};

    history.push({
      pathname: `/ssrc/supplier-bid-hall/question-list/${record.bidHeaderId}`,
      search: querystring.stringify({
        quotationHeaderId: record.quotationHeaderId,
        bidNum: record.bidNum,
        supplierCompanyId: record.supplierCompanyId,
        bidHeaderId: record.bidHeaderId,
        quotationEndFlag: record.quotationEndFlag,
        tenantId,
      }),
      state: { clarifyEndTime },
    });
  }

  /**
   * 预审小组弹框显隐
   */
  @Bind()
  showPretrialPanel(visible, bidHeaderId) {
    const { dispatch, organizationId } = this.props;
    this.setState({
      pretrialPanelVisible: visible,
    });
    if (visible) {
      dispatch({
        type: 'supplierBid/fetchPretrialPanel',
        payload: {
          sourceHeaderId: bidHeaderId,
          sourceFrom: 'BID',
          organizationId,
        },
      });
    } else {
      dispatch({
        type: 'supplierBid/updateState',
        payload: {
          pretrialPanelList: [],
        },
      });
    }
  }

  /**
   * 取消
   */
  @Bind()
  handleReadMatterCancel() {
    this.setState({
      readMatterDetailVisible: false,
    });
  }

  /**
   * 报价 判断招标事项flag，0直接参与 1弹框确认
   * @param {Object} record - 当前编辑行
   */
  @Bind()
  onBeforeParticipate(record = {}) {
    const oldTemplateShowFlag = record.systemVersion === 1 ? record.matterDetail : true;
    // 如果使用老寻源模版, matterDetail有值才会弹框
    if (record.showMatterFlag === 1 && oldTemplateShowFlag) {
      // case 1: 代表还没有阅读过   ps: !== 0 是为了防止数据库没有刷数据
      this.setState({
        currentOperateRow: record,
        readMatterDetailVisible: true,
      });
    } else {
      // case 0: 代表已经阅读过
      this.participateIng(record);
    }
  }

  // 资格预审弹窗－上传附件弹窗
  @Bind
  afterOpenUploadModal(attachmentUUID) {
    if (attachmentUUID) {
      this.setState({ currentAttachmentUuid: attachmentUUID });
    }
  }

  render() {
    const {
      dispatch,
      Loading,
      organizationId,
      // supplierBid,
      selectPreApplyLoading,
      savePreApplyLoading,
      submitPreApplyLoading,
      fetchPretrialPanelLoading,
      supplierBid: {
        code = {},
        bidList = [],
        bidPagination = {},
        fetchPretrialApplicationData = {},
        pretrialPanelList = [],
      },
      customizeForm = () => {},
      saveConfirmMatterLoading = false,
    } = this.props;
    const {
      preApplyModalVisible,
      supplierCompanyId,
      prequalOnlyRead,
      pretrialPanelVisible = false,
      readMatterDetailVisible = false,
      currentOperateRow = {},
      currentAttachmentUuid = null,
      quotationStatus,
      quotationStartDate,
    } = this.state;
    const pretrialApplicationModalProps = {
      customizeForm,
      queryLoading: Loading,
      quotationStartDate,
      quotationStatus,
      supplierCompanyId,
      organizationId,
      selectPreApplyLoading,
      savePreApplyLoading,
      submitPreApplyLoading,
      visible: preApplyModalVisible,
      onlyRead: prequalOnlyRead,
      reviewMethodValues: code.reviewMethod,
      onSave: this.savePretrialApplicationData,
      onSubmit: this.submitPretrialApplicationData,
      onClear: this.clearPretrialApplicationData,
      onClose: () => this.setState({ preApplyModalVisible: false }),
      formData: fetchPretrialApplicationData,
      currentAttachmentUuid,
      afterOpenUploadModal: this.afterOpenUploadModal,
    };
    const curTime = moment(new Date()).format(DEFAULT_DATETIME_FORMAT);
    const columns = [
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.quotationStatus`).d('投标状态'),
        dataIndex: 'quotationStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.bidTitle`).d('招标事项'),
        dataIndex: 'bidTitle',
        width: 210,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.customer`).d('客户'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.company`).d('公司'),
        dataIndex: 'supplierCompanyName',
        width: 200,
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.bidType`).d('招标类别'),
        dataIndex: 'bidTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.preQualification`).d('资格预审'),
        dataIndex: 'preQualificationFlag',
        width: 100,
        render: (val) => yesOrNoRender(val),
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.tenderMethod`).d('招标方式'),
        dataIndex: 'sourceMethodMeaning',
        width: 110,
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.roundNumber`).d('轮次'),
        dataIndex: 'roundNumber',
        width: 60,
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.version`).d('版本'),
        dataIndex: 'versionNumber',
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.quotationStartDate`).d('投标开始时间'),
        dataIndex: 'quotationStartDate',
        width: 150,
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.quotationEndDate`).d('投标截止时间'),
        dataIndex: 'quotationEndDate',
        width: 150,
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.releasedDate`).d('发布时间'),
        dataIndex: 'releasedDate',
        width: 150,
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.bidNum.`).d('招标编号'),
        dataIndex: 'bidNum',
        width: 150,
        fixed: 'right',
        render: (val, record) =>
          record.urgencyFlag ? (
            record.quotationEndDate > curTime ? (
              <Popover
                placement="topLeft"
                content={intl
                  .get(`ssrc.supplierBid.view.message.title.lessWeekBidDeadline`)
                  .d('距离投标截止小于一周')}
              >
                <a type="primary" style={{ color: 'red' }} onClick={() => this.onrfxNum(record)}>
                  {val}
                </a>
              </Popover>
            ) : (
              <a type="primary" onClick={() => this.onrfxNum(record)}>
                {val}
              </a>
            )
          ) : (
            <a type="primary" onClick={() => this.onrfxNum(record)}>
              {val}
            </a>
          ),
      },
      {
        title: intl.get(`ssrc.supplierBid.model.supplierBid.operation`).d('操作'),
        width: 180,
        fixed: 'right',
        render: (text, record) => (
          <Popover placement="topLeft" content={this.operationRender(text, record)}>
            {this.operationRender(text, record)}
          </Popover>
        ),
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 100);
    const filterProps = {
      dispatch,
      code,
      onRef: this.handleRef,
      onConditional: this.handleSearch,
    };
    const pretrialPanelProps = {
      visible: pretrialPanelVisible,
      dataSource: pretrialPanelList,
      loading: fetchPretrialPanelLoading,
      onHideModal: this.showPretrialPanel,
    };
    const readMatterDetailProps = {
      modalType: 'BID',
      currentOperateRow,
      loading: saveConfirmMatterLoading,
      matterDetail: currentOperateRow.matterDetail || '',
      onNext: this.participateIng,
      handleReadMatterCancel: this.handleReadMatterCancel,
      readMatterDetailVisible,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`ssrc.supplierBid.view.message.title.supplierBid`).d('我要投标')} />
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <Table
            bordered
            rowKey="uniqueKey"
            loading={Loading}
            columns={columns}
            scroll={{ x: scrollWidth }}
            dataSource={bidList}
            pagination={bidPagination}
            onChange={(page) => this.handleSearch(page)}
            className={classnames(styles['fixed-form-row'])}
          />
          <PretrialApplicationModal {...pretrialApplicationModalProps} />
          <PretrialPanelModal {...pretrialPanelProps} />
          {readMatterDetailVisible && <ReadMatterDetail {...readMatterDetailProps} />}
        </Content>
      </React.Fragment>
    );
  }
}
