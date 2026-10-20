/*
 * DeliveryScheduleWorkspace - 订单执行工作台
 * @date: 2021/11/01 20:26:14
 * @author: mjq <jiaqi.mao@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, PureComponent } from 'react';
import { Tabs, Alert } from 'choerodon-ui';
import { connect } from 'dva';
import { DataSet, Tooltip, Icon, Modal, Form, DatePicker } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Bind } from 'lodash-decorators';
import { isNumber, isEmpty, isNil, throttle } from 'lodash';
import classNames from 'classnames';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import CommonImportNew from 'hzero-front/lib/components/Import';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';

import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
// import ExcelExport from 'components/ExcelExport';
import { Button } from 'components/Permission';
import SearchBarTable from '_components/SearchBarTable';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getUserOrganizationId, getResponse } from 'utils/utils';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { onBeforeMenuTabRemove, deleteBeforeMenuTabRemove } from 'utils/menuTab';
import remotes from 'utils/remote';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import TooltipButton from '@/routes/OrderExecutionWorkbench/components/TooltipButton';
import { BUCKET_NAME } from '@/routes/OrderExecutionWorkbench/components/utils/constant';
import AssociatedDocument from '@/routes/OrderExecutionWorkbench/components/AssociatedDocument';
import Bom from '@/routes/OrderExecutionWorkbench/components/Bom';
import { MutlTextFieldSearch } from '@/routes/OrderExecutionWorkbench/components/MultipleSearch';
import { PermissionDoubleTabs } from '@/routes/components/Permission';
import remoteConfig from './remote';
import {
  toBeFedBack,
  feedbackAlready,
  all,
  detailToBeFedBack,
  detailAll,
  detailFeedbackAlready,
  batchMaintenance,
} from './store/orderDs';
import styles from './index.less';
import { useUomRender, usePrecisionRender } from '@/routes/OrderExecutionWorkbench/hooks';
import {
  queryCommonDoubleUomConfig,
  renderStatus,
} from '@/routes/OrderExecutionWorkbench/components/utils';
import {
  getFeedbackVerificationList,
  getFeedbackVerificationDetailList,
  OrderQuantity,
} from '@/services/orderExecutionWorkbenchService';
import FeedbackGetVerificationTable from './components/FeedbackGetVerificationTable';

const { TabPane, TabGroup } = Tabs;
const organizationId = getUserOrganizationId();
const tenantId = getCurrentOrganizationId();
@connect(({ loading, orderExecutionWorkbench }) => ({
  listByLineFeedbackLoading: loading.effects['orderExecutionWorkbench/listByLineFeedback'],
  handleDetailSaveLoading: loading.effects['orderExecutionWorkbench/listByLineSave'],
  detailFeedbackAgainLoading: loading.effects['orderExecutionWorkbench/listByLineFeedbackAgain'],
  confirmLoading: loading.effects['orderExecutionWorkbench/confirm'],
  orderExecutionWorkbench,
}))
@formatterCollections({
  code: ['slod.orderExecution', 'sodr.workspace', 'sodr.common'],
})
@withCustomize({
  unitCode: [
    'SINV.ORDER_EXECUTION_TOBEFEDBACK.LIST',
    'SINV.ORDER_EXECUTION_FEEDBACKALREADY.LIST',
    'SINV.ORDER_EXECUTION_ALL.LIST',
    'SINV.ORDER_EXECUTION_DETAIL_TOBEFEDBACK.LIST',
    'SINV.ORDER_EXECUTION_DETAIL_FEDBACKALREADY.LIST',
    'SINV.ORDER_EXECUTION_DETAIL_ALL.LIST',
    'SINV.ORDER_EXECUTION_LIST.TABS',
    'SINV.ORDER_EXECUTION_DETAIL_TOBEFEDBACK.BATCHEDITING',
    'SINV.ORDER_EXECUTION_DETAIL_FEDBACKALREADY.BATCHEDITING',
    'SINV.ORDER_EXECUTION_ALL.BUTTONS',
    'SINV.ORDER_EXECUTION_TOBEFEDBACK.BUTTONS',
    'SINV.ORDER_EXECUTION_FEEDBACKALREADY.BUTTONS',
    'SINV.ORDER_EXECUTION_DETAIL_TOBEFEDBACK.BUTTONS',
    'SINV.ORDER_EXECUTION_DETAIL_FEDBACKALREADY.BUTTONS',
  ],
})
@withProps(
  () => {
    const toBeFedBackDs = new DataSet(toBeFedBack());
    const feedbackAlreadyDs = new DataSet(feedbackAlready());
    const allDs = new DataSet(all());
    const detailToBeFedBackDs = new DataSet(detailToBeFedBack());
    const detailFeedbackAlreadyDs = new DataSet(detailFeedbackAlready());
    const detailAllDs = new DataSet(detailAll());
    const batchMaintenanceDs = new DataSet(batchMaintenance());
    const feedbackAlreadyBatchMaintenanceDs = new DataSet(batchMaintenance());
    return {
      toBeFedBackDs,
      feedbackAlreadyDs,
      allDs,
      detailToBeFedBackDs,
      detailFeedbackAlreadyDs,
      detailAllDs,
      batchMaintenanceDs,
      feedbackAlreadyBatchMaintenanceDs,
    };
  },
  { cacheState: true }
)
@remotes(...remoteConfig)
export default class DeliveryScheduleWorkspace extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      setting: '0',
      collByLine: 0,
      resetFlag: false,
      doubleUnitEnabled: 0,
      isOpenClearCashed: true, // 记录是否开启清理缓存记录标识
    };
    this.menuTabKey = '/sodr/order-execution-workbench';
    // 金额字段是否根据sourceCode判断处理
    this.bySourceCode = props.remote.process('bySourceCode');
    this.dsList = [
      { key: 'toBeFedBack', ds: props.toBeFedBackDs, totalCountKey: 'poHeaderForToBeFeedbackNum' },
      {
        key: 'feedbackAlready',
        ds: props.feedbackAlreadyDs,
        totalCountKey: 'poHeaderForFeedbackNum',
      },
      { key: 'all', ds: props.allDs, totalCountKey: 'poHeaderForAllNum' },
      {
        key: 'detailToBeFedBack',
        ds: props.detailToBeFedBackDs,
        totalCountKey: 'poLineLocationForToBeFeedbackNum',
      },
      {
        key: 'detailFeedbackAlready',
        ds: props.detailFeedbackAlreadyDs,
        totalCountKey: 'poLineLocationForFeedbackNum',
      },
      { key: 'detailAll', ds: props.detailAllDs, totalCountKey: 'poLineLocationForAllNum' },
    ];
  }

  componentDidMount() {
    // const {
    //   orderExecutionWorkbench: { redioKey, activeKey, detailActiveKey },
    // } = this.props;
    this.queryCollByLine();
    this.queryDoubleUomConfig();
    this.fetchSettings();
    this.fetchCount();
    // this.dsList
    //   .filter((i) => ((i.key === redioKey) === 'whole' ? activeKey : detailActiveKey))
    //   .forEach((i) => i.ds.query(i.ds.currentPage));
    onBeforeMenuTabRemove(this.menuTabKey, this.initModelState);
  }

  componentWillReceiveProps(nextProps) {
    const nextActiveKey = nextProps?.location?.state?.activeKey;
    const activeKey = this.props?.location?.state?.activeKey;
    if (nextActiveKey !== activeKey && nextActiveKey) {
      this.handleTabsChange(nextActiveKey);
    }
  }

  componentWillUnmount() {
    deleteBeforeMenuTabRemove(this.menuTabKey);
  }

  // 查询数量
  @Bind()
  async fetchCount() {
    const res = getResponse(await OrderQuantity());
    if (res) {
      this.dsList.forEach((i) => {
        if (i.ds && i.totalCountKey && res[i.totalCountKey]) {
          // eslint-disable-next-line no-param-reassign
          i.ds.totalCount = res[i.totalCountKey];
        }
      });
    }
  }

  // 查询双单位配置
  @Bind()
  async queryDoubleUomConfig() {
    const { detailToBeFedBackDs, detailFeedbackAlreadyDs, detailAllDs } = this.props;
    const result = await queryCommonDoubleUomConfig();
    [detailToBeFedBackDs, detailFeedbackAlreadyDs, detailAllDs].map((i) =>
      i.setState({ doubleUnitEnabled: result })
    );
    this.setState({
      doubleUnitEnabled: result,
    });
  }

  @Bind()
  initModelState = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderExecutionWorkbench/initState',
    });
  };

  @Bind()
  initTabs(keyList, cuzActiveKey) {
    const {
      dispatch,
      orderExecutionWorkbench: { initFlag },
    } = this.props;
    if (initFlag) return;
    dispatch({ type: 'orderExecutionWorkbench/updateState', payload: { initFlag: true } });
    this.handleTabsChange(cuzActiveKey);
  }

  @Bind()
  setResetFlag(resetFlag) {
    // 筛选器重置标记
    this.setState({ resetFlag });
  }

  /**
   * queryCollByLine - 查询按行协同配置
   */
  @Bind()
  queryCollByLine() {
    const { dispatch, location = {} } = this.props;
    const { state: { activeKey } = {} } = location;
    dispatch({ type: 'orderExecutionWorkbench/queryCollByLine' }).then((res) => {
      if (isNumber(res)) {
        const state = { collByLine: res };
        this.setState(state);
      }
      if (activeKey) {
        this.handleTabsChange(activeKey);
      } else if (res !== 2) {
        dispatch({
          type: 'orderExecutionWorkbench/updateState',
          payload: { detailActiveKey: 'detailAll' },
        });
      }
    });
  }

  /**
   * fetchSettings - 查询配置中心
   */
  @Bind()
  fetchSettings() {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderExecutionWorkbench/fetchSettings',
    }).then((res) => {
      if (res) {
        this.setState({
          setting: res['010219'],
        });
      }
    });
  }

  @Bind()
  renderAction({ record }) {
    // const poHeaderId = record.get('poHeaderId');
    const operationList = record.get('operationList') || []; // 后端返回可执行操作
    const defaultActions = [
      {
        key: 'FEEDBACK',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => this.goDetail(record, 'toBeFedBack')}
            permissionList={[
              {
                code: 'srm.logistics.delivery.order.execution.workbench.button.all.feedback',
                type: 'c7n-pro',
                meaning: '销售方订单工作台-整单-反馈',
              },
            ]}
          >
            {intl.get('slod.orderExecution.view.option.feedback').d('反馈')}
          </Button>
        ),
      },
      {
        key: 'FEEDBACK_AGAIN',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => this.goDetail(record, 'feedbackAlready')}
            permissionList={[
              {
                code: 'srm.logistics.delivery.order.execution.workbench.button.all.feedbackAgain',
                type: 'c7n-pro',
                meaning: '销售方订单工作台-整单-再次反馈',
              },
            ]}
          >
            {intl.get('slod.orderExecution.view.option.feedbackAgain').d('再次反馈')}
          </Button>
        ),
      },
      {
        key: 'SIGN',
        button: (
          <Button
            type="c7n-pro"
            funcType="link"
            color="primary"
            onClick={() => this.goDetail(record, 'toBeFedBack')}
          >
            {intl.get(`hzero.common.button.sign`).d('签章')}
          </Button>
        ),
      },
    ];
    const canActions = defaultActions.filter((i) => operationList.includes(i.key)) || [];
    return canActions.map((i) => i.button);
  }

  @Bind()
  goDetail(record, type) {
    const { history } = this.props;
    const poHeaderId = record.get('poHeaderId');
    let pathname;
    switch (type) {
      case 'toBeFedBack':
        pathname = `/sodr/order-execution-workbench/to-be-fed-back/${poHeaderId}`;
        break;
      case 'feedbackAlready':
        pathname = `/sodr/order-execution-workbench/feedback-already/${poHeaderId}`;
        break;
      case 'all':
        pathname = `/sodr/order-execution-workbench/all-orders/${poHeaderId}`;
        break;
      default:
        break;
    }
    if (!pathname) return;
    history.push({ pathname });
  }

  /**
   * 执行单据-关联订单状态
   * @param {*} record
   * @returns
   */
  @Bind()
  fetchLineDetail(record) {
    const { customizeTable, customizeTabPane } = this.props;
    const {
      poLineLocationId,
      displayPoNum,
      displayLineNum,
      displayLineLocationNum,
      quantity,
    } = record.get([
      'poLineLocationId',
      'displayPoNum',
      'displayLineNum',
      'displayLineLocationNum',
      'quantity',
    ]);
    return Modal.open({
      key: Modal.key(),
      drawer: true,
      // title: intl.get('slod.orderExecution.modal.contectDoc').d('关联单据'),
      title: `${displayPoNum}-${displayLineNum}-${displayLineLocationNum}-${intl
        .get('sodr.workspace.model.common.quantity')
        .d('数量')}:${quantity}`,
      bodyStyle: { padding: 0 },
      children: (
        <AssociatedDocument
          {...{
            customizeTable,
            poLineLocationId,
            currentRecord: record,
            record,
            customizeTabPane,
          }}
        />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
      style: { width: '1090px' },
    });
  }

  @Bind()
  openBom(record) {
    const { customizeTable } = this.props;
    Modal.open({
      footer: (okBtn, cancelBtn) => cancelBtn,
      cancelText: intl.get('hzero.common.btn.close').d('关闭'),
      cancelProps: { color: 'primary' },
      closable: true,
      drawer: true,
      style: { width: 742 },
      title: intl.get('slod.orderExecution.view.title.bom').d('外协BOM'),
      children: (
        <Bom
          readOnly
          record={record}
          customizeTable={customizeTable}
          // code="slod.orderExecution_PURCHASEREQUEST_DETAIL.BOM"
        />
      ),
    });
  }

  @Bind()
  getColumns(type) {
    const { remote } = this.props;
    const { doubleUnitEnabled } = this.state;
    const columnsFn = () => {
      switch (type) {
        case 'A':
          return [
            {
              name: 'statusCode',
              width: 150,
              renderer: ({ record }) =>
                renderStatus(record.get('statusCode'), record.get('statusCodeMeaning')),
            },
            {
              name: 'displayPoNum',
              width: 170,
              renderer: ({ value, record }) => {
                const { msgNum, urgentFlag, beyondQuantity } = record.get([
                  'msgNum',
                  'urgentFlag',
                  'beyondQuantity',
                ]);
                return (
                  <Fragment>
                    <a onClick={() => this.goDetail(record, 'toBeFedBack')}>{value}</a>
                    {urgentFlag === 1 ? (
                      <Tooltip
                        title={intl.get(`slod.orderExecution.view.tooltip.urgent`).d('订单加急')}
                      >
                        <Icon type="flash_on" className={styles['row-agent-column-icon']} />
                      </Tooltip>
                    ) : null}
                    {beyondQuantity > 0 ? (
                      <Tooltip
                        title={intl.get(`slod.orderExecution.view.tooltip.yanqiImg`).d(`订单超期`)}
                      >
                        <Icon type="hourglass_full" className={styles['row-agent-column-icon']} />
                      </Tooltip>
                    ) : null}
                    {msgNum > 0 ? (
                      <Tooltip
                        title={intl
                          .get('sodr.workspace.view.tooltip.unreadMessages', {
                            msgNum,
                          })
                          .d('{msgNum}条在线沟通消息未读')}
                      >
                        <Icon type="notifications" className={styles['row-agent-column-icon']} />
                      </Tooltip>
                    ) : null}
                  </Fragment>
                );
              },
            },
            {
              name: 'companyName',
              width: 200,
            },
            {
              name: 'orgName',
              width: 200,
            },
            {
              name: 'purOrganizationName',
              width: 130,
            },
            {
              name: 'agentName',
              width: 120,
            },
            {
              name: 'taxIncludeAmount',
              width: 110,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'amount', { bySourceCode: this.bySourceCode })({
                  record,
                  value,
                  dataSet,
                }),
            },
            {
              name: 'amount',
              width: 110,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'amount', { bySourceCode: this.bySourceCode })({
                  record,
                  value,
                  dataSet,
                }),
            },
            {
              name: 'currencyCode',
              width: 70,
            },
            {
              name: 'poTypeCode',
              width: 130,
              renderer: ({ record }) => record.get('poTypeCodeMeaning'),
            },
            {
              name: 'releasedDate',
              width: 150,
            },
            {
              name: 'erpCreationDate',
              width: 150,
            },
            {
              name: 'urgentFlag',
              width: 90,
              renderer: ({ value }) => yesOrNoRender(value),
            },
            {
              name: 'supplierSiteName',
              width: 200,
            },
            {
              name: 'releaseNum',
              width: 200,
            },
            {
              name: 'remark',
              width: 200,
            },
            {
              name: 'electricSignFlag',
              width: 90,
              renderer: ({ value }) => (isNil(value) ? null : yesOrNoRender(value)),
            },
            {
              name: 'electricSignStatus',
              width: 200,
              renderer: ({ record }) =>
                renderStatus(
                  record.get('electricSignStatus'),
                  record.get('electricSignStatusMeaning')
                ),
            },
            {
              name: 'terminateSignStatus',
              width: 200,
              renderer: ({ record }) =>
                renderStatus(
                  record.get('terminateSignStatus'),
                  record.get('terminateSignStatusMeaning')
                ),
            },
          ];
        case 'B':
          return [
            {
              name: 'statusCode',
              width: 150,
              renderer: ({ record }) =>
                renderStatus(record.get('statusCode'), record.get('statusCodeMeaning')),
            },
            {
              name: 'displayPoNum',
              width: 170,
              renderer: ({ value, record }) => {
                const { msgNum, urgentFlag, beyondQuantity } = record.get([
                  'msgNum',
                  'urgentFlag',
                  'beyondQuantity',
                ]);
                return (
                  <Fragment>
                    <a onClick={() => this.goDetail(record, 'feedbackAlready')}>{value}</a>
                    {urgentFlag === 1 ? (
                      <Tooltip
                        title={intl.get(`slod.orderExecution.view.tooltip.urgent`).d('订单加急')}
                      >
                        <Icon type="flash_on" className={styles['row-agent-column-icon']} />
                      </Tooltip>
                    ) : null}
                    {beyondQuantity > 0 ? (
                      <Tooltip
                        title={intl.get(`slod.orderExecution.view.tooltip.yanqiImg`).d(`订单超期`)}
                      >
                        <Icon type="hourglass_full" className={styles['row-agent-column-icon']} />
                      </Tooltip>
                    ) : null}
                    {msgNum > 0 ? (
                      <Tooltip
                        title={intl
                          .get('sodr.workspace.view.tooltip.unreadMessages', {
                            msgNum,
                          })
                          .d('{msgNum}条在线沟通消息未读')}
                      >
                        <Icon type="notifications" className={styles['row-agent-column-icon']} />
                      </Tooltip>
                    ) : null}
                  </Fragment>
                );
              },
            },
            {
              name: 'companyName',
              width: 200,
            },
            {
              name: 'orgName',
              width: 200,
            },
            {
              name: 'purOrganizationName',
              width: 130,
            },
            {
              name: 'agentName',
              width: 120,
            },
            {
              name: 'taxIncludeAmount',
              width: 110,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'amount', { bySourceCode: this.bySourceCode })({
                  record,
                  value,
                  dataSet,
                }),
            },
            {
              name: 'amount',
              width: 110,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'amount', { bySourceCode: this.bySourceCode })({
                  record,
                  value,
                  dataSet,
                }),
            },
            {
              name: 'currencyCode',
              width: 70,
            },
            {
              name: 'poTypeCode',
              width: 130,
              renderer: ({ record }) => record.get('poTypeCodeMeaning'),
            },
            {
              name: 'releasedDate',
              width: 150,
            },
            {
              name: 'erpCreationDate',
              width: 150,
            },
            {
              name: 'urgentFlag',
              width: 90,
              renderer: ({ value }) => yesOrNoRender(value),
            },
            {
              name: 'supplierSiteName',
              width: 200,
            },
            {
              name: 'releaseNum',
              width: 200,
            },
            {
              name: 'remark',
              width: 200,
            },
            {
              name: 'electricSignFlag',
              width: 90,
              renderer: ({ value }) => (isNil(value) ? null : yesOrNoRender(value)),
            },
            {
              name: 'electricSignStatus',
              width: 200,
              renderer: ({ record }) =>
                renderStatus(
                  record.get('electricSignStatus'),
                  record.get('electricSignStatusMeaning')
                ),
            },
            {
              name: 'terminateSignStatus',
              width: 200,
              renderer: ({ record }) =>
                renderStatus(
                  record.get('terminateSignStatus'),
                  record.get('terminateSignStatusMeaning')
                ),
            },
          ];
        case 'C':
          return [
            {
              name: 'statusCode',
              width: 150,
              renderer: ({ record }) =>
                renderStatus(record.get('statusCode'), record.get('statusCodeMeaning')),
            },
            {
              name: 'action',
              width: 155,
              renderer: this.renderAction,
              className: classNames(styles['action-columns'], styles['table-cell-height']),
            },
            {
              name: 'displayPoNum',
              width: 170,
              className: classNames(styles['table-cell-height']),
              renderer: ({ value, record }) => {
                const {
                  createSyncStatus,
                  createSyncResponseMsg,
                  deliverySyncStatus,
                  deliverySyncResponseMsg,
                  urgentFlag,
                  beyondQuantity,
                  unreadCount,
                  msgNum,
                } = record.get([
                  'createSyncStatus',
                  'createSyncResponseMsg',
                  'deliverySyncStatus',
                  'deliverySyncResponseMsg',
                  'urgentFlag',
                  'beyondQuantity',
                  'unreadCount',
                  'msgNum',
                ]);
                return (
                  <Fragment>
                    <a onClick={() => this.goDetail(record, 'all')}>{value}</a>
                    {createSyncStatus === 'FAIL' ? (
                      <Tooltip title={createSyncResponseMsg}>
                        <Icon type="archive" className={styles['row-agent-column-icon']} />
                      </Tooltip>
                    ) : null}
                    {deliverySyncStatus === 'FAIL' ? (
                      <Tooltip
                        title={
                          intl
                            .get(`slod.orderExecution.view.message.orderFeedbackMsg`)
                            .d('ERP订单承诺交货日期同步失败：失败原因') +
                          (deliverySyncResponseMsg || '')
                        }
                      >
                        <Icon type="archive" className={styles['row-agent-column-icon']} />
                      </Tooltip>
                    ) : null}
                    {urgentFlag === 1 ? (
                      <Tooltip
                        title={intl.get(`slod.orderExecution.view.tooltip.urgent`).d('订单加急')}
                      >
                        <Icon type="flash_on" className={styles['row-agent-column-icon']} />
                      </Tooltip>
                    ) : null}
                    {beyondQuantity > 0 ? (
                      <Tooltip
                        title={intl.get(`slod.orderExecution.view.tooltip.yanqiImg`).d(`订单超期`)}
                      >
                        <Icon type="hourglass_full" className={styles['row-agent-column-icon']} />
                      </Tooltip>
                    ) : null}
                    {unreadCount ? (
                      <Tooltip
                        title={intl
                          .get(`slod.orderExecution.view.tooltip.unreadCount`, {
                            num: record.get('unreadCount'),
                          })
                          .d(`{num}条留言板消息未读`)}
                      >
                        <Icon type="contact_mail" className={styles['row-agent-column-icon']} />
                      </Tooltip>
                    ) : null}
                    {msgNum > 0 ? (
                      <Tooltip
                        title={intl
                          .get('sodr.workspace.view.tooltip.unreadMessages', {
                            msgNum: msgNum > 99 ? '99+' : msgNum,
                          })
                          .d('{msgNum}条在线沟通消息未读')}
                      >
                        <Icon type="notifications" className={styles['row-agent-column-icon']} />
                      </Tooltip>
                    ) : null}
                  </Fragment>
                );
              },
            },
            {
              name: 'companyName',
              width: 200,
            },
            {
              name: 'orgName',
              width: 200,
            },
            {
              name: 'purOrganizationName',
              width: 130,
            },
            {
              name: 'agentName',
              width: 150,
            },
            {
              name: 'taxIncludeAmount',
              width: 110,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'amount', { bySourceCode: this.bySourceCode })({
                  record,
                  value,
                  dataSet,
                }),
            },
            {
              name: 'amount',
              width: 110,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'amount', { bySourceCode: this.bySourceCode })({
                  record,
                  value,
                  dataSet,
                }),
            },
            {
              name: 'currencyCode',
              width: 70,
            },
            {
              name: 'poTypeCode',
              width: 130,
              renderer: ({ record }) => record.get('poTypeCodeMeaning'),
            },
            {
              name: 'releasedDate',
              width: 150,
            },
            {
              name: 'creationDate',
              width: 150,
            },
            {
              name: 'urgentFlag',
              width: 90,
              renderer: ({ value }) => yesOrNoRender(value),
            },
            {
              name: 'supplierSiteName',
              width: 200,
            },
            {
              name: 'displayReleaseNum',
              width: 200,
            },
            {
              name: 'remark',
              width: 150,
            },
            {
              name: 'electricSignFlag',
              width: 90,
              renderer: ({ value }) => (isNil(value) ? null : yesOrNoRender(value)),
            },
            {
              name: 'electricSignStatus',
              width: 200,
              renderer: ({ record }) =>
                renderStatus(
                  record.get('electricSignStatus'),
                  record.get('electricSignStatusMeaning')
                ),
            },
            {
              name: 'terminateSignStatus',
              width: 200,
              renderer: ({ record }) =>
                renderStatus(
                  record.get('terminateSignStatus'),
                  record.get('terminateSignStatusMeaning')
                ),
            },
          ];
        case 'D':
          return [
            {
              name: 'displayStatusCode',
              width: 150,
              renderer: ({ record }) =>
                renderStatus(record.get('displayStatusCode'), record.get('displayStatusMeaning')),
            },
            {
              name: 'displayPoNum',
              width: 170,
              renderer: ({ value, record }) => (
                <Fragment>
                  <a onClick={() => this.goDetail(record, 'toBeFedBack')}>
                    {`${value}-${record.get('displayLineNum')}`}
                  </a>
                  {record.get('urgentFlag') === 1 ? (
                    <Tooltip
                      title={intl.get(`slod.orderExecution.view.tooltip.urgent`).d('订单加急')}
                    >
                      <Icon type="flash_on" className={styles['row-agent-column-icon']} />
                    </Tooltip>
                  ) : null}
                  {record.get('beyondQuantity') > 0 ? (
                    <Tooltip
                      title={intl.get(`slod.orderExecution.view.tooltip.yanqiImg`).d(`订单超期`)}
                    >
                      <Icon type="hourglass_full" className={styles['row-agent-column-icon']} />
                    </Tooltip>
                  ) : null}
                </Fragment>
              ),
            },
            {
              name: 'companyName',
              width: 150,
            },
            {
              name: 'displayLineLocationNum',
              width: 80,
            },
            {
              name: 'itemCode',
              width: 100,
            },
            {
              name: 'itemName',
              width: 150,
            },
            {
              name: 'originalQuantity',
              width: 90,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'quantity')({ record, value, dataSet }),
            },
            doubleUnitEnabled && {
              name: 'secondaryUomCodeAndName',
              width: 100,
            },
            doubleUnitEnabled && {
              name: 'secondaryQuantity',
              width: 150,
              editor: (record) => record.get('quantityEditFlag') === 1,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'secondaryUomPrecision')({ record, value, dataSet }),
            },
            {
              name: 'uomCodeAndName',
              width: 100,
            },
            {
              name: 'quantity',
              width: 150,
              editor: (record) => record.get('quantityEditFlag') === 1 && !doubleUnitEnabled,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'quantity')({ record, value, dataSet }),
            },
            {
              name: 'needByDate',
              width: 150,
            },
            {
              name: 'promiseDeliveryDate',
              width: 150,
              // editor: true,
              editor: (record) => record.get('deliveryDateEditFlag') === 1,
            },
            {
              name: 'unitPrice',
              width: 150,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'price')({ record, value, dataSet }),
            },
            {
              name: 'lineAmount',
              width: 150,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'amount', { bySourceCode: this.bySourceCode })({
                  record,
                  value,
                  dataSet,
                }),
            },
            {
              name: 'enteredTaxIncludedPrice',
              width: 150,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'price')({ record, value, dataSet }),
            },
            {
              name: 'taxIncludedLineAmount',
              width: 150,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'amount', { bySourceCode: this.bySourceCode })({
                  record,
                  value,
                  dataSet,
                }),
            },
            {
              name: 'taxRate',
              width: 90,
            },
            {
              name: 'unitPriceBatch',
              width: 80,
            },
            {
              name: 'currencyCode',
              width: 70,
            },
            {
              name: 'orderTypeName',
              width: 150,
            },
            {
              name: 'ouName',
              width: 150,
            },
            {
              name: 'purOrganizationName',
              width: 130,
            },
            {
              name: 'purchaseAgentName',
              width: 150,
            },
            {
              name: 'invOrganizationName',
              width: 150,
            },
            {
              name: 'categoryName',
              width: 150,
            },
            {
              name: 'productNum',
              width: 150,
            },
            {
              name: 'productName',
              width: 150,
            },
            {
              name: 'catalogName',
              width: 150,
            },
            {
              name: 'poSourcePlatform',
              width: 150,
              renderer: ({ record }) => record.get('poSourcePlatformMeaning'),
            },
            {
              name: 'sourceBillTypeCode',
              width: 150,
              renderer: ({ record }) => record.get('sourceBillTypeCodeMeaning'),
            },
            {
              name: 'erpCreatedName',
              width: 150,
            },
            {
              name: 'creationDate',
              width: 150,
            },
            {
              name: 'versionNum',
              width: 150,
            },
            {
              name: 'releaseNum',
              width: 150,
            },
            {
              name: 'supplierCode',
              width: 150,
            },
            {
              name: 'supplierSiteName',
              width: 150,
            },
            {
              name: 'inventoryName',
              width: 150,
            },
            {
              name: 'locationName',
              width: 150,
            },
            {
              name: 'shipToThirdPartyAddress',
              width: 150,
            },
            {
              name: 'shipToThirdPartyContact',
              width: 150,
            },
            {
              name: 'receiveTelNum',
              width: 150,
            },
            {
              name: 'costName',
              width: 150,
            },
            {
              name: 'departmentName',
              width: 150,
            },
            {
              name: 'brand',
              width: 150,
            },
            {
              name: 'specifications',
              width: 150,
            },
            {
              name: 'model',
              width: 150,
            },
            {
              name: 'projectCategory',
              width: 150,
            },
            {
              name: 'consignedFlag',
              width: 150,
              renderer: ({ value }) => yesOrNoRender(value),
            },
            {
              name: 'returnedFlag',
              width: 150,
              renderer: ({ value }) => yesOrNoRender(value),
            },
            {
              name: 'freeFlag',
              width: 150,
              renderer: ({ value }) => yesOrNoRender(value),
            },
            {
              name: 'bom',
              width: 150,
              renderer: ({ record }) => (
                <a onClick={() => this.openBom(record)}>
                  {intl.get('hzero.common.button.look').d('查看')}
                </a>
              ),
            },
            {
              name: 'delayFlag',
              width: 90,
              renderer: ({ value }) =>
                yesOrNoRender(!isNil(value) ? (value === '1' ? 1 : 0) : null),
            },
            {
              name: 'urgentFlag',
              width: 90,
              renderer: ({ value }) => yesOrNoRender(value),
            },
            {
              name: 'urgentDate',
              width: 150,
            },
            {
              name: 'releasedDate',
              width: 150,
            },
            {
              name: 'confirmedDate',
              width: 150,
            },
          ];
        case 'E':
          return [
            {
              name: 'displayStatusCode',
              width: 150,
              renderer: ({ record }) =>
                renderStatus(record.get('displayStatusCode'), record.get('displayStatusMeaning')),
            },
            {
              name: 'displayPoNum',
              width: 170,
              renderer: ({ value, record }) => (
                <Fragment>
                  <a onClick={() => this.goDetail(record, 'feedbackAlready')}>
                    {`${value}-${record.get('displayLineNum')}`}
                  </a>
                  {record.get('urgentFlag') === 1 ? (
                    <Tooltip
                      title={intl.get(`slod.orderExecution.view.tooltip.urgent`).d('订单加急')}
                    >
                      <Icon type="flash_on" className={styles['row-agent-column-icon']} />
                    </Tooltip>
                  ) : null}
                  {record.get('beyondQuantity') > 0 ? (
                    <Tooltip
                      title={intl.get(`slod.orderExecution.view.tooltip.yanqiImg`).d(`订单超期`)}
                    >
                      <Icon type="hourglass_full" className={styles['row-agent-column-icon']} />
                    </Tooltip>
                  ) : null}
                </Fragment>
              ),
            },
            {
              name: 'companyName',
              width: 150,
            },
            {
              name: 'displayLineLocationNum',
              width: 80,
            },
            {
              name: 'itemCode',
              width: 100,
            },
            {
              name: 'itemName',
              width: 150,
            },
            {
              name: 'originalQuantity',
              width: 90,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'quantity')({ record, value, dataSet }),
            },
            doubleUnitEnabled && {
              name: 'secondaryUomCodeAndName',
              width: 100,
            },
            doubleUnitEnabled && {
              name: 'secondaryQuantity',
              width: 150,
              editor: (record) => record.get('quantityEditFlagConfirm') === 1,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'secondaryQuantity')({ record, value, dataSet }),
            },
            {
              name: 'uomCodeAndName',
              width: 100,
            },
            {
              name: 'quantity',
              width: 150,
              editor: (record) => record.get('quantityEditFlagConfirm') === 1 && !doubleUnitEnabled,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'quantity')({ record, value, dataSet }),
            },
            {
              name: 'needByDate',
              width: 150,
            },
            {
              name: 'promiseDeliveryDate',
              width: 150,
              editor: (record) => record.get('deliveryDateEditFlagConfirm') === 1,
            },
            {
              name: 'unitPrice',
              width: 150,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'price')({ record, value, dataSet }),
            },
            {
              name: 'lineAmount',
              width: 150,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'amount', { bySourceCode: this.bySourceCode })({
                  record,
                  value,
                  dataSet,
                }),
            },
            {
              name: 'enteredTaxIncludedPrice',
              width: 150,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'price')({ record, value, dataSet }),
            },
            {
              name: 'taxIncludedLineAmount',
              width: 150,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'amount', { bySourceCode: this.bySourceCode })({
                  record,
                  value,
                  dataSet,
                }),
            },
            {
              name: 'taxRate',
              width: 90,
            },
            {
              name: 'unitPriceBatch',
              width: 80,
            },
            {
              name: 'currencyCode',
              width: 70,
            },
            {
              name: 'orderTypeName',
              width: 150,
            },
            {
              name: 'ouName',
              width: 150,
            },
            {
              name: 'purOrganizationName',
              width: 130,
            },
            {
              name: 'purchaseAgentName',
              width: 150,
            },
            {
              name: 'invOrganizationName',
              width: 150,
            },
            {
              name: 'categoryName',
              width: 150,
            },
            {
              name: 'productNum',
              width: 150,
            },
            {
              name: 'productName',
              width: 150,
            },
            {
              name: 'catalogName',
              width: 150,
            },
            {
              name: 'poSourcePlatform',
              width: 150,
              renderer: ({ record }) => record.get('poSourcePlatformMeaning'),
            },
            {
              name: 'sourceBillTypeCode',
              width: 150,
              renderer: ({ record }) => record.get('sourceBillTypeCodeMeaning'),
            },
            {
              name: 'erpCreatedName',
              width: 150,
            },
            {
              name: 'creationDate',
              width: 150,
            },
            {
              name: 'versionNum',
              width: 150,
            },
            {
              name: 'releaseNum',
              width: 150,
            },
            {
              name: 'supplierCode',
              width: 150,
            },
            {
              name: 'supplierSiteName',
              width: 150,
            },
            {
              name: 'inventoryName',
              width: 150,
            },
            {
              name: 'locationName',
              width: 150,
            },
            {
              name: 'shipToThirdPartyAddress',
              width: 150,
            },
            {
              name: 'shipToThirdPartyContact',
              width: 150,
            },
            {
              name: 'receiveTelNum',
              width: 150,
            },
            {
              name: 'costName',
              width: 150,
            },
            {
              name: 'departmentName',
              width: 150,
            },
            {
              name: 'brand',
              width: 150,
            },
            {
              name: 'specifications',
              width: 150,
            },
            {
              name: 'model',
              width: 150,
            },
            {
              name: 'projectCategory',
              width: 150,
            },
            {
              name: 'consignedFlag',
              width: 150,
              renderer: ({ value }) => yesOrNoRender(value),
            },
            {
              name: 'returnedFlag',
              width: 150,
              renderer: ({ value }) => yesOrNoRender(value),
            },
            {
              name: 'freeFlag',
              width: 150,
              renderer: ({ value }) => yesOrNoRender(value),
            },
            {
              name: 'bom',
              width: 150,
              renderer: ({ record }) => (
                <a onClick={() => this.openBom(record)}>
                  {intl.get('hzero.common.button.look').d('查看')}
                </a>
              ),
            },
            {
              name: 'delayFlag',
              width: 90,
              renderer: ({ value }) =>
                yesOrNoRender(!isNil(value) ? (value === '1' ? 1 : 0) : null),
            },
            {
              name: 'urgentFlag',
              width: 90,
              renderer: ({ value }) => yesOrNoRender(value),
            },
            {
              name: 'urgentDate',
              width: 150,
            },
            {
              name: 'releasedDate',
              width: 150,
            },
            {
              name: 'confirmedDate',
              width: 150,
            },
          ];
        case 'F':
          return [
            {
              name: 'displayStatusCode',
              width: 150,
              renderer: ({ record }) =>
                renderStatus(record.get('displayStatusCode'), record.get('displayStatusMeaning')),
            },
            {
              name: 'displayPoNum',
              width: 170,
              renderer: ({ value, record }) => (
                <Fragment>
                  <a onClick={() => this.goDetail(record, 'all')}>
                    {`${value}-${record.get('displayLineNum')}`}
                  </a>
                  {record.get('urgentFlag') === 1 ? (
                    <Tooltip
                      title={intl.get(`slod.orderExecution.view.tooltip.urgent`).d('订单加急')}
                    >
                      <Icon type="flash_on" className={styles['row-agent-column-icon']} />
                    </Tooltip>
                  ) : null}
                  {record.get('beyondQuantity') > 0 ? (
                    <Tooltip
                      title={intl.get(`slod.orderExecution.view.tooltip.yanqiImg`).d(`订单超期`)}
                    >
                      <Icon type="hourglass_full" className={styles['row-agent-column-icon']} />
                    </Tooltip>
                  ) : null}
                </Fragment>
              ),
            },
            {
              name: 'companyName',
              width: 150,
            },
            {
              name: 'displayLineLocationNum',
              width: 80,
            },
            {
              name: 'itemCode',
              width: 100,
            },
            {
              name: 'itemName',
              width: 150,
            },
            doubleUnitEnabled && {
              name: 'secondaryQuantity',
              width: 90,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'secondaryQuantity')({ record, value, dataSet }),
            },
            doubleUnitEnabled && {
              name: 'secondaryUomCodeAndName',
              width: 100,
            },
            {
              name: 'quantity',
              width: 90,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'quantity')({ record, value, dataSet }),
            },
            {
              name: 'uomCodeAndName',
              width: 100,
              renderer: useUomRender,
            },
            {
              name: 'unitPrice',
              width: 150,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'price')({ record, value, dataSet }),
            },
            {
              name: 'lineAmount',
              width: 150,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'amount', { bySourceCode: this.bySourceCode })({
                  record,
                  value,
                  dataSet,
                }),
            },
            {
              name: 'enteredTaxIncludedPrice',
              width: 150,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'price')({ record, value, dataSet }),
            },
            {
              name: 'taxIncludedLineAmount',
              width: 150,
              renderer: ({ record, value, dataSet }) =>
                usePrecisionRender(record, 'amount', { bySourceCode: this.bySourceCode })({
                  record,
                  value,
                  dataSet,
                }),
            },
            {
              name: 'taxRate',
              width: 90,
            },
            {
              name: 'unitPriceBatch',
              width: 80,
            },
            {
              name: 'currencyCode',
              width: 70,
            },
            {
              name: 'needByDate',
              width: 150,
            },
            {
              name: 'promiseDeliveryDate',
              width: 150,
            },
            {
              name: 'orderTypeName',
              width: 150,
            },
            {
              name: 'ouName',
              width: 150,
            },
            {
              name: 'purOrganizationName',
              width: 130,
            },
            {
              name: 'purchaseAgentName',
              width: 150,
            },
            {
              name: 'invOrganizationName',
              width: 150,
            },
            {
              name: 'categoryName',
              width: 150,
            },
            {
              name: 'productNum',
              width: 150,
            },
            {
              name: 'productName',
              width: 150,
            },
            {
              name: 'catalogName',
              width: 150,
            },
            {
              name: 'poSourcePlatform',
              width: 150,
              renderer: ({ record }) => record.get('poSourcePlatformMeaning'),
            },
            {
              name: 'sourceBillTypeCode',
              width: 150,
              renderer: ({ record }) => record.get('sourceBillTypeCodeMeaning'),
            },
            {
              name: 'erpCreatedName',
              width: 150,
            },
            {
              name: 'creationDate',
              width: 150,
            },
            {
              name: 'checkContectDoc',
              width: 130,
              className: styles['table-cell-height'],
              renderer: ({ record }) => {
                return (
                  <a onClick={() => this.fetchLineDetail(record)}>
                    {intl.get('slod.orderExecution.modal.checkContectDoc').d('查看执行单据')}
                  </a>
                );
              },
            },
            {
              name: 'versionNum',
              width: 150,
            },
            {
              name: 'releaseNum',
              width: 150,
            },
            {
              name: 'supplierCode',
              width: 150,
            },
            {
              name: 'supplierSiteName',
              width: 150,
            },
            {
              name: 'inventoryName',
              width: 150,
            },
            {
              name: 'locationName',
              width: 150,
            },
            {
              name: 'shipToThirdPartyAddress',
              width: 150,
            },
            {
              name: 'shipToThirdPartyContact',
              width: 150,
            },
            {
              name: 'receiveTelNum',
              width: 150,
            },
            {
              name: 'netReceivedQuantity',
              width: 150,
            },
            {
              name: 'netDeliverQuantity',
              width: 150,
            },
            {
              name: 'notDeliverQuantity',
              width: 150,
            },
            {
              name: 'shippedQuantity',
              width: 150,
            },
            {
              name: 'billMatchedQuantity',
              width: 150,
            },
            {
              name: 'invoicedQuantity',
              width: 150,
            },
            {
              name: 'costName',
              width: 150,
            },
            {
              name: 'departmentName',
              width: 150,
            },
            {
              name: 'brand',
              width: 150,
            },
            {
              name: 'specifications',
              width: 150,
            },
            {
              name: 'model',
              width: 150,
            },
            {
              name: 'projectCategory',
              width: 150,
            },
            {
              name: 'consignedFlag',
              width: 150,
              renderer: ({ value }) => yesOrNoRender(value),
            },
            {
              name: 'returnedFlag',
              width: 150,
              renderer: ({ value }) => yesOrNoRender(value),
            },
            {
              name: 'freeFlag',
              width: 150,
              renderer: ({ value }) => yesOrNoRender(value),
            },
            {
              name: 'bom',
              width: 150,
              renderer: ({ record }) => (
                <a onClick={() => this.openBom(record)}>
                  {intl.get('hzero.common.button.look').d('查看')}
                </a>
              ),
            },
            {
              name: 'delayFlag',
              width: 90,
              renderer: ({ value }) =>
                yesOrNoRender(!isNil(value) ? (value === '1' ? 1 : 0) : null),
            },
            {
              name: 'urgentFlag',
              width: 90,
              renderer: ({ value }) => yesOrNoRender(value),
            },
            {
              name: 'urgentDate',
              width: 150,
            },
            {
              name: 'releasedDate',
              width: 150,
            },
            {
              name: 'confirmedDate',
              width: 150,
            },
          ];
        default:
          break;
      }
    };
    const columns = columnsFn() || [];
    const remoteColumns = remote
      ? remote.process('getColumns', columns, { that: this, type })
      : columns;
    return remoteColumns;
  }

  @Bind()
  activeKeys() {
    const {
      orderExecutionWorkbench: { redioKey, activeKey, detailActiveKey },
    } = this.props;
    if (redioKey === 'detail') {
      return detailActiveKey;
    } else {
      return activeKey;
    }
  }

  @Bind()
  handleTabsChange(activeKey) {
    const { dispatch, custConfig } = this.props;
    const unitFields = custConfig['SINV.ORDER_EXECUTION_LIST.TABS']?.fields || [];
    const wholeGroup = ['toBeFedBack', 'feedbackAlready', 'all'];
    unitFields.forEach((i) => {
      const { standardField, aggregationCode, fieldCode } = i;
      if (!standardField && aggregationCode === 'whole') {
        wholeGroup.push(fieldCode);
      }
    });
    const isWhole = wholeGroup.includes(activeKey);
    const payload = {
      redioKey: isWhole ? 'whole' : 'detail',
      [isWhole ? 'activeKey' : 'detailActiveKey']: activeKey,
    };
    const currentDs = this.dsList.find((i) => i.key === activeKey)?.ds;
    if (currentDs) {
      currentDs.query(currentDs.currentPage);
    }
    dispatch({
      type: 'orderExecutionWorkbench/updateState',
      payload,
    });
  }

  @Bind()
  onQuery({ params, dataSet, currentPage }, ds) {
    const { location = {} } = this.props;
    const { resetFlag, isOpenClearCashed } = this.state;
    const otherParams = dataSet.getState('params');

    const clearParams = {}; // 清理
    // eslint-disable-next-line no-unused-expressions
    // const dataObj = ds.queryDataSet?.current?.toData();
    // if (dataObj) {
    //   for (const key in dataObj) {
    //     if (!['multiPoNum'].includes(key)) {
    //       // 排除掉自定义的查询条件
    //       if (!Object.prototype.hasOwnProperty.call(params, key)) {
    //         clearParams[key] = undefined;
    //       }
    //     }
    //   }
    // }
    const allParams = !resetFlag
      ? {
          ...params,
          ...otherParams,
          multiPoNum: params.multiPoNum?.toString(),
        }
      : params;
    // eslint-disable-next-line no-unused-expressions
    ds.queryDataSet.loadData([
      {
        ...clearParams,
        ...allParams,
      },
    ]);
    const { state: { _back } = {} } = location;
    ds.query(currentPage);
    if (_back === -1 && isOpenClearCashed) {
      this.setState({
        isOpenClearCashed: false,
      });
    }
    this.setResetFlag(false);
  }

  @Bind()
  resetQueryDs(ds, flag) {
    // eslint-disable-next-line no-unused-expressions
    ds.queryDataSet?.current.reset();
    if (flag && ds?.query) {
      ds.query();
    }
  }

  @Bind()
  editRule = (type) => {
    const alreadyMap = {
      quantity: 'quantityEditFlagConfirm',
      promiseDeliveryDate: 'deliveryDateEditFlagConfirm',
    };
    const toBeFedBackMap = {
      quantity: 'quantityEditFlag',
      promiseDeliveryDate: 'deliveryDateEditFlag',
    };
    const map = type === 'toBeFedBack' ? toBeFedBackMap : alreadyMap;
    return (record, key) => (map[key] ? record.get(map[key]) === 1 : true);
  };

  handleBatchMaintenance = (key) => {
    const {
      customizeForm,
      detailToBeFedBackDs,
      detailFeedbackAlreadyDs,
      batchMaintenanceDs,
      feedbackAlreadyBatchMaintenanceDs,
    } = this.props;

    const params =
      key === 'detailToBeFedBack'
        ? {
            ds: detailToBeFedBackDs,
            batchDs: batchMaintenanceDs,
            editorRule: this.editRule('toBeFedBack'),
            code: 'SINV.ORDER_EXECUTION_DETAIL_TOBEFEDBACK.BATCHEDITING',
          }
        : {
            ds: detailFeedbackAlreadyDs,
            editorRule: this.editRule('already'),
            batchDs: feedbackAlreadyBatchMaintenanceDs,
            code: 'SINV.ORDER_EXECUTION_DETAIL_FEDBACKALREADY.BATCHEDITING',
          };
    const { selected } = params.ds;
    Modal.open({
      drawer: true,
      style: { width: 380 },
      title: intl.get(`slod.orderExecution.view.button.batchEdit`).d('批量编辑'),
      children: (
        <Fragment>
          <Alert
            className={styles['order-top-title-alert']}
            border={false}
            message={
              <div>
                <Icon type="help" />
                {!isEmpty(selected)
                  ? intl
                      .get(`sodr.workspace.view.alert.batchAllMaintainData`, {
                        num: selected.length,
                      })
                      .d(`已勾选{num}条数据进行批量编辑`)
                  : intl
                      .get('sodr.workspace.view.alert.batchAllMaintain')
                      .d('针对全部数据进行批量编辑')}
              </div>
            }
            closable
          />
          {customizeForm(
            {
              code: params.code,
              __force_record_to_update__: true,
              lovIgnore: false,
            },
            <Form dataSet={params.batchDs} columns={1} labelLayout="float">
              <DatePicker name="promiseDeliveryDate" />
            </Form>
          )}
        </Fragment>
      ),
      onOk: () => this.handleBatchOk(params),
    });
  };

  @Bind()
  handleBatchOk = async ({ ds, batchDs, editorRule }) => {
    const dataRecord = batchDs.current;
    const fields = batchDs.fields.toJSON();
    const { selected } = ds;
    const custStandardFields = [];
    const initFields = batchDs.props.fields;
    const dataList = Object.keys(fields)
      .filter((i) => {
        const value = fields[i].getValue(dataRecord);
        const lable = fields[i].get('label');
        const isCustStandardField = !(
          initFields.find((n) => n.name === fields[i].name) || fields[i].name.includes('attribute')
        );
        if (isCustStandardField && lable && value) {
          custStandardFields.push(lable);
        }
        return !isCustStandardField && value && !['__id', '_status'].includes(i);
      })
      .map((i) => [i, fields[i].getValue(dataRecord)]);
    if (!isEmpty(custStandardFields)) {
      notification.error({
        message: intl
          .get(`sodr.workspace.view.message.hasCustStandardFields`, {
            fields: String(custStandardFields.map((i) => `【${i}】`)),
          })
          .d('{fields}为扩展的标准字段，不允许批量编辑！'),
      });
      return false;
    }
    selected.forEach((i) => {
      dataList.forEach(([key, value]) => {
        const field = i.getField(key);
        const editor = editorRule(i, key);
        if (!field.disabled && editor && !field.get('isCustomizeText')) {
          i.set({ [key]: value });
        }
      });
    });
    batchDs.reset();
  };

  @Bind()
  getRightRender() {
    const {
      customizeTable,
      customizeTabPane,
      orderExecutionWorkbench,
      toBeFedBackDs,
      feedbackAlreadyDs,
      allDs,
      detailToBeFedBackDs,
      detailFeedbackAlreadyDs,
      detailAllDs,
    } = this.props;
    const { activeKey, detailActiveKey } = orderExecutionWorkbench;
    const { collByLine } = this.state;
    return (
      <PermissionDoubleTabs onCallback={this.initTabs}>
        {customizeTabPane(
          {
            code: 'SINV.ORDER_EXECUTION_LIST.TABS',
            cascade: true,
          },
          <Tabs onChange={this.handleTabsChange} activeKey={this.activeKeys()}>
            <TabGroup
              tab={intl.get('slod.orderExecution.view.tab.whole').d('整单')}
              key="whole"
              defaultActiveKey={activeKey}
              customizable
            >
              <TabPane
                tab={intl.get('slod.orderExecution.view.tab.toBeFedBack').d('待反馈')}
                key="toBeFedBack"
                count={() => !toBeFedBackDs.counting && toBeFedBackDs.totalCount}
              >
                <div style={{ height: 'calc(100vh - 252px)' }}>
                  {customizeTable(
                    {
                      code: 'SINV.ORDER_EXECUTION_TOBEFEDBACK.LIST',
                    },
                    <SearchBarTable
                      customizable
                      cacheState
                      style={{ maxHeight: `calc(100% - 22px)` }}
                      searchCode="SINV.ORDER_EXECUTION_TOBEFEDBACK.SEARCH"
                      customizedCode="SINV.ORDER_EXECUTION_TOBEFEDBACK.LIST"
                      dataSet={toBeFedBackDs}
                      columns={this.getColumns('A')}
                      pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
                      virtual
                      virtualCell
                      searchBarConfig={{
                        onReset: () => this.setResetFlag(true),
                        onQuery: (e) => this.onQuery(e, toBeFedBackDs),
                        onClear: () => this.resetQueryDs(toBeFedBackDs, true),
                        fieldProps: {
                          companyId: {
                            lovPara: {
                              organizationId,
                            },
                          },
                          ouId: {
                            lovPara: {
                              enabledFlag: 1,
                              tenantId,
                            },
                          },
                        },
                        left: {
                          render: (_, ds) => (
                            <MutlTextFieldSearch
                              name="multiPoNum"
                              dataSet={ds}
                              placeholder={intl
                                .get('sodr.workspace.view.placeholder.poNumAndNum')
                                .d('请输入订单编号查询')}
                            />
                          ),
                        },
                      }}
                    />
                  )}
                </div>
              </TabPane>
              <TabPane
                tab={intl.get('slod.orderExecution.view.tab.feedbackAlready').d('已反馈')}
                key="feedbackAlready"
                count={() => !feedbackAlreadyDs.counting && feedbackAlreadyDs.totalCount}
              >
                <div style={{ height: 'calc(100vh - 252px)' }}>
                  {customizeTable(
                    { code: 'SINV.ORDER_EXECUTION_FEEDBACKALREADY.LIST' },
                    <SearchBarTable
                      customizable
                      cacheState
                      style={{ maxHeight: `calc(100% - 22px)` }}
                      customizedCode="SINV.ORDER_EXECUTION_FEEDBACKALREADY.LIST"
                      searchCode="SINV.ORDER_EXECUTION_FEEDBACKALREADY.SEARCH"
                      dataSet={feedbackAlreadyDs}
                      columns={this.getColumns('B')}
                      pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
                      virtual
                      virtualCell
                      searchBarConfig={{
                        onReset: () => this.setResetFlag(true),
                        onQuery: (e) => this.onQuery(e, feedbackAlreadyDs),
                        onClear: () => this.resetQueryDs(feedbackAlreadyDs, true),
                        fieldProps: {
                          companyId: {
                            lovPara: {
                              organizationId,
                            },
                          },
                          ouId: {
                            lovPara: {
                              enabledFlag: 1,
                              tenantId,
                            },
                          },
                        },
                        left: {
                          render: (_, ds) => (
                            <MutlTextFieldSearch
                              name="multiPoNum"
                              dataSet={ds}
                              placeholder={intl
                                .get('sodr.workspace.view.placeholder.poNumAndNum')
                                .d('请输入订单编号查询')}
                            />
                          ),
                        },
                      }}
                    />
                  )}
                </div>
              </TabPane>
              <TabPane
                tab={intl.get('slod.orderExecution.view.tab.all').d('全部')}
                key="all"
                count={() => !allDs.counting && allDs.totalCount}
              >
                <div style={{ height: 'calc(100vh - 252px)' }}>
                  {customizeTable(
                    { code: 'SINV.ORDER_EXECUTION_ALL.LIST' },
                    <SearchBarTable
                      customizable
                      cacheState
                      style={{ maxHeight: `calc(100% - 22px)` }}
                      customizedCode="SINV.ORDER_EXECUTION_ALL.LIST"
                      searchCode="SINV.ORDER_EXECUTION_ALL.SEARCH"
                      dataSet={allDs}
                      columns={this.getColumns('C')}
                      pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
                      virtual
                      virtualCell
                      searchBarConfig={{
                        onReset: () => this.setResetFlag(true),
                        onQuery: (e) => this.onQuery(e, allDs),
                        onClear: () => this.resetQueryDs(allDs, true),
                        fieldProps: {
                          companyId: {
                            lovPara: {
                              organizationId,
                            },
                          },
                          ouId: {
                            lovPara: {
                              enabledFlag: 1,
                              tenantId,
                            },
                          },
                        },
                        left: {
                          render: (_, ds) => (
                            <MutlTextFieldSearch
                              name="multiPoNum"
                              dataSet={ds}
                              placeholder={intl
                                .get('sodr.workspace.view.placeholder.poNumAndNum')
                                .d('请输入订单编号查询')}
                            />
                          ),
                        },
                      }}
                    />
                  )}
                </div>
              </TabPane>
            </TabGroup>
            <TabGroup
              tab={intl.get('slod.orderExecution.view.tab.detail').d('明细')}
              key="detail"
              defaultActiveKey={detailActiveKey}
            >
              {collByLine === 2 && (
                <TabPane
                  tab={intl.get('slod.orderExecution.view.tab.toBeFedBack').d('待反馈')}
                  key="detailToBeFedBack"
                  count={() => !detailToBeFedBackDs.counting && detailToBeFedBackDs.totalCount}
                >
                  <div style={{ height: 'calc(100vh - 252px)' }}>
                    {customizeTable(
                      { code: 'SINV.ORDER_EXECUTION_DETAIL_TOBEFEDBACK.LIST' },
                      <SearchBarTable
                        customizable
                        cacheState
                        style={{ maxHeight: `calc(100% - 22px)` }}
                        pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
                        virtual
                        virtualCell
                        customizedCode="SINV.ORDER_EXECUTION_DETAIL_TOBEFEDBACK.LIST"
                        searchCode="SINV.ORDER_EXECUTION_DETAIL_TOBEFEDBACK.SEARCH"
                        dataSet={detailToBeFedBackDs}
                        columns={this.getColumns('D')}
                        searchBarConfig={{
                          onReset: () => this.setResetFlag(true),
                          onQuery: (e) => this.onQuery(e, detailToBeFedBackDs),
                          onClear: () => this.resetQueryDs(detailToBeFedBackDs, true),
                          fieldProps: {
                            companyId: {
                              lovPara: {
                                organizationId,
                              },
                            },
                            ouId: {
                              lovPara: {
                                enabledFlag: 1,
                                tenantId,
                              },
                            },
                          },
                          left: {
                            render: (_, ds) => (
                              <MutlTextFieldSearch
                                name="multiPoNum"
                                dataSet={ds}
                                placeholder={intl
                                  .get('sodr.workspace.view.placeholder.poNumAndNum')
                                  .d('请输入订单编号查询')}
                              />
                            ),
                          },
                        }}
                      />
                    )}
                  </div>
                </TabPane>
              )}
              {collByLine === 2 && (
                <TabPane
                  tab={intl.get('slod.orderExecution.view.tab.feedbackAlready').d('已反馈')}
                  key="detailFeedbackAlready"
                  count={() =>
                    !detailFeedbackAlreadyDs.counting && detailFeedbackAlreadyDs.totalCount
                  }
                >
                  <div style={{ height: 'calc(100vh - 252px)' }}>
                    {customizeTable(
                      { code: 'SINV.ORDER_EXECUTION_DETAIL_FEDBACKALREADY.LIST' },
                      <SearchBarTable
                        customizable
                        cacheState
                        style={{ maxHeight: `calc(100% - 22px)` }}
                        pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
                        virtual
                        virtualCell
                        customizedCode="SINV.ORDER_EXECUTION_DETAIL_FEDBACKALREADY.LIST"
                        searchCode="SINV.ORDER_EXECUTION_DETAIL_FEDBACKALREADY.SEARCH"
                        dataSet={detailFeedbackAlreadyDs}
                        columns={this.getColumns('E')}
                        searchBarConfig={{
                          onReset: () => this.setResetFlag(true),
                          onQuery: (e) => this.onQuery(e, detailFeedbackAlreadyDs),
                          onClear: () => this.resetQueryDs(detailFeedbackAlreadyDs, true),
                          fieldProps: {
                            companyId: {
                              lovPara: {
                                organizationId,
                              },
                            },
                            itemCode: {
                              lovPara: {
                                tenantId,
                              },
                            },
                            ouId: {
                              lovPara: {
                                enabledFlag: 1,
                                tenantId,
                              },
                            },
                          },
                          left: {
                            render: (_, ds) => (
                              <MutlTextFieldSearch
                                name="multiPoNum"
                                dataSet={ds}
                                placeholder={intl
                                  .get('sodr.workspace.view.placeholder.poNumAndNum')
                                  .d('请输入订单编号查询')}
                              />
                            ),
                          },
                        }}
                      />
                    )}
                  </div>
                </TabPane>
              )}
              <TabPane
                tab={intl.get('slod.orderExecution.view.tab.all').d('全部')}
                key="detailAll"
                count={() => !detailAllDs.counting && detailAllDs.totalCount}
              >
                <div style={{ height: 'calc(100vh - 252px)' }}>
                  {customizeTable(
                    { code: 'SINV.ORDER_EXECUTION_DETAIL_ALL.LIST' },
                    <SearchBarTable
                      customizable
                      cacheState
                      style={{ maxHeight: `calc(100% - 22px)` }}
                      customizedCode="SINV.ORDER_EXECUTION_DETAIL_ALL.LIST"
                      searchCode="SINV.ORDER_EXECUTION_DETAIL_ALL.SEARCH"
                      dataSet={detailAllDs}
                      columns={this.getColumns('F')}
                      pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
                      virtual
                      virtualCell
                      searchBarConfig={{
                        onReset: () => this.setResetFlag(true),
                        onQuery: (e) => this.onQuery(e, detailAllDs),
                        onClear: () => this.resetQueryDs(detailAllDs, true),
                        fieldProps: {
                          companyId: {
                            lovPara: {
                              organizationId,
                            },
                          },
                          itemCode: {
                            lovPara: {
                              tenantId,
                            },
                          },
                          ouId: {
                            lovPara: {
                              enabledFlag: 1,
                              tenantId,
                            },
                          },
                        },
                        left: {
                          render: (_, ds) => (
                            <MutlTextFieldSearch
                              name="multiPoNum"
                              dataSet={ds}
                              placeholder={intl
                                .get('sodr.workspace.view.placeholder.poNumAndNum')
                                .d('请输入订单编号查询')}
                            />
                          ),
                        },
                      }}
                    />
                  )}
                </div>
              </TabPane>
            </TabGroup>
          </Tabs>
        )}
      </PermissionDoubleTabs>
    );
  }

  /**
   * 订单反馈校验附件必输
   * @param {Array} data 需要校验的行
   * @returns {Boolean} 校验结果
   */
  @Bind()
  async validateAttachment(data) {
    const { dispatch } = this.props;
    const { setting } = this.state;
    const noAttachmentList = [];
    const hasUuidList = data.filter((i) => i.supplierAttachmentUuid);
    const noUuidList = data.filter((i) => !i.supplierAttachmentUuid);
    if (setting !== '1') return true;
    if (!isEmpty(noUuidList)) {
      noAttachmentList.push(...data.filter((i) => !i.supplierAttachmentUuid));
    }
    if (!isEmpty(hasUuidList)) {
      const res = await dispatch({
        type: 'orderExecutionWorkbench/searchUuid',
        payload: {
          uuidList: hasUuidList.map((i) => i.supplierAttachmentUuid),
          bucketName: BUCKET_NAME,
        },
      });
      if (!res) return;
      noAttachmentList.push(
        ...Object.keys(res)
          .filter((i) => !res[i])
          .map((i) => data.find((n) => n.supplierAttachmentUuid === i))
      );
    }
    const status = isEmpty(noAttachmentList);
    if (!status) {
      notification.warning({
        message: intl
          .get('slod.orderExecution.view.message.accessoryNotNull', {
            poNum: JSON.stringify(Array.from(new Set(noAttachmentList.map((i) => i.displayPoNum)))),
          })
          .d('订单:{poNum}附件不能为空'),
      });
    }
    return status;
  }

  @Bind()
  async handleFeedback() {
    const { dispatch, toBeFedBackDs, remote } = this.props;
    const ds = toBeFedBackDs;
    const data = (ds.toJSONData() || []).map((i) => ({ ...i, poWorkbenchFlag: 1 }));
    const poHeaderList = ds.selected.map((item) => item.toJSONData());
    const getVerification = getResponse(await getFeedbackVerificationList({ poHeaderList }));
    if (!getVerification) {
      return;
    }
    const { content } = JSON.parse(getVerification);
    const queryFun = () => ({
      url: `${SRM_SPUC}/v1/${tenantId}/po-workbench/po-header/feedback/verify/sidebar`,
      method: 'POST',
      data: poHeaderList,
      responseType: 'text',
    });
    const handleFeedback = async () => {
      const res = await Promise.all(ds.selected.map((i) => i.validate()));
      if (!res.some((i) => !i)) {
        dispatch({
          type: 'orderExecutionWorkbench/confirm',
          payload: { data },
        }).then((response) => {
          if (response) {
            notification.success();
            ds.query();
            ds.unSelectAll();
            ds.clearCachedRecords();
          }
        });
      }
    };
    const handleComfirm = async () => {
      const beforFeedbackRes = await remote.event.fireEvent('beforFeedback', {
        data,
        ds,
      });
      if (!beforFeedbackRes) return;
      const validateAttachmentStatus = await this.validateAttachment(data);
      if (validateAttachmentStatus) {
        handleFeedback();
      }
    };
    if (content && !isEmpty(content)) {
      Modal.confirm({
        title: (
          <span style={{ marginLeft: '20px' }}>
            {intl.get('slod.orderExecution.view.confirm.feedback').d('是否确认反馈订单')}
          </span>
        ),
        children: (
          <FeedbackGetVerificationTable
            queryFun={queryFun}
            message={intl
              .get('sodr.common.model.common.feedbackForLists')
              .d(
                '以下订单含有【取消待确认】，或者【关闭待确认】的订单信息，确认反馈会将【取消待确认】或者【关闭待确认】的订单行同时进行确认，请确认是否继续确认反馈'
              )}
          />
        ),
        onOk: throttle(handleComfirm, THROTTLE_TIME, { trailing: false }),
        style: { width: '795px' },
        bodyStyle: { padding: '20px 0 0 0' },
        destroyOnClose: true,
        drawer: true,
        okText: intl.get('sodr.common.model.common.determineFeedback').d('确定反馈'),
      });
    } else {
      handleComfirm();
    }
  }

  @Bind()
  async handleDetailFeedback() {
    const { dispatch, detailToBeFedBackDs } = this.props;
    const ds = detailToBeFedBackDs;
    const data = ds.toJSONData();
    const getVerification = getResponse(
      await getFeedbackVerificationDetailList({
        data,
        query: {
          customizeUnitCode: 'SINV.ORDER_EXECUTION_DETAIL_TOBEFEDBACK.LIST',
        },
      })
    );
    if (!getVerification) {
      return;
    }
    const { content } = JSON.parse(getVerification);
    const queryFun = () => ({
      url: `${SRM_SPUC}/v1/${tenantId}/po-workbench/po-line/feedback/verify/sidebar`,
      method: 'POST',
      data,
      query: {
        customizeUnitCode: 'SINV.ORDER_EXECUTION_DETAIL_TOBEFEDBACK.LIST',
      },
      responseType: 'text',
    });
    const handleComfirm = async () => {
      const validateAttachmentStatus = await this.validateAttachment(data);
      if (validateAttachmentStatus) {
        Promise.all(ds.selected.map((i) => i.validate())).then((res) => {
          if (!res.some((i) => !i)) {
            dispatch({
              type: 'orderExecutionWorkbench/listByLineFeedback',
              payload: {
                data,
                query: {
                  customizeUnitCode: 'SINV.ORDER_EXECUTION_DETAIL_TOBEFEDBACK.LIST',
                },
              },
            }).then((response) => {
              if (response) {
                notification.success();
                ds.query();
                ds.unSelectAll();
                ds.clearCachedRecords();
              }
            });
          }
        });
      }
    };
    if (content && !isEmpty(content)) {
      Modal.confirm({
        title: (
          <span style={{ marginLeft: '20px' }}>
            {intl.get('slod.orderExecution.view.confirm.feedback').d('是否确认反馈订单')}
          </span>
        ),
        children: (
          <FeedbackGetVerificationTable
            queryFun={queryFun}
            message={intl
              .get('sodr.common.model.common.feedbackForLists')
              .d(
                '以下订单含有【取消待确认】，或者【关闭待确认】的订单信息，确认反馈会将【取消待确认】或者【关闭待确认】的订单行同时进行确认，请确认是否继续确认反馈'
              )}
          />
        ),
        onOk: throttle(handleComfirm, THROTTLE_TIME, { trailing: false }),
        style: { width: '795px' },
        bodyStyle: { padding: '20px 0 0 0' },
        destroyOnClose: true,
        drawer: true,
        okText: intl.get('sodr.common.model.common.determineFeedback').d('确定反馈'),
      });
    } else {
      handleComfirm();
    }
  }

  @Bind()
  handleDetailSave() {
    const { dispatch, detailToBeFedBackDs } = this.props;
    const ds = detailToBeFedBackDs;
    const data = ds.toJSONData();
    const customizeUnitCode = String(['SINV.ORDER_EXECUTION_DETAIL_TOBEFEDBACK.LIST']);
    Promise.all(ds.selected.map((i) => i.validate())).then((res) => {
      if (!res.some((i) => !i)) {
        dispatch({
          type: 'orderExecutionWorkbench/listByLineSave',
          payload: { data, query: { customizeUnitCode } },
        }).then((response) => {
          if (response) {
            notification.success();
            ds.query();
            ds.unSelectAll();
            ds.clearCachedRecords();
          }
        });
      }
    });
  }

  @Bind()
  async handleDetailFeedbackAlready() {
    const { dispatch, detailFeedbackAlreadyDs } = this.props;
    const ds = detailFeedbackAlreadyDs;
    const data = ds.toJSONData();
    const customizeUnitCode = String(['SINV.ORDER_EXECUTION_DETAIL_FEDBACKALREADY.LIST']);
    const validateAttachmentStatus = await this.validateAttachment(data);
    if (validateAttachmentStatus) {
      Promise.all(ds.selected.map((i) => i.validate())).then((res) => {
        if (!res.some((i) => !i)) {
          dispatch({
            type: 'orderExecutionWorkbench/listByLineFeedbackAgain',
            payload: {
              data,
              query: {
                customizeUnitCode,
              },
            },
          }).then((response) => {
            if (response) {
              notification.success();
              ds.query();
              ds.unSelectAll();
              ds.clearCachedRecords();
            }
          });
        }
      });
    }
  }

  @Bind()
  getHeaderBtns() {
    const {
      listByLineFeedbackLoading = false,
      handleDetailSaveLoading = false,
      detailFeedbackAgainLoading = false,
      confirmLoading = false,
      toBeFedBackDs,
      feedbackAlreadyDs,
      allDs,
      remote,
      detailToBeFedBackDs,
      detailFeedbackAlreadyDs,
      detailAllDs,
      customizeBtnGroup,
      orderExecutionWorkbench: { redioKey, activeKey, detailActiveKey },
    } = this.props;
    const key = redioKey === 'whole' ? activeKey : detailActiveKey;
    let Btns;
    // const commonParams = { poWorkbenchFlag: 1 };
    switch (key) {
      case 'toBeFedBack':
        Btns = observer(({ dataSet }) => {
          const { selected } = dataSet;
          const poHeaderIds = selected.map((i) => i.get('poHeaderId'));
          const queryParams = selected.length
            ? { poHeaderIds }
            : dataSet.queryDataSet
            ? dataSet.queryDataSet.toData()[0] || {}
            : {};
          Object.assign(queryParams, {
            poWorkbenchFlag: 1,
            customizeUnitCode:
              'SINV.ORDER_EXECUTION_TOBEFEDBACK.EXPORT,SINV.ORDER_EXECUTION_TOBEFEDBACK.LIST,SINV.ORDER_EXECUTION_TOBEFEDBACK.SEARCH',
          });
          const postParams = {
            ...queryParams,
            statusCodes: queryParams.statusCodes?.split(','),
          };
          const buttons = [
            {
              name: 'feedback',
              btnComp: Button,
              child: intl.get('slod.orderExecution.view.option.feedback').d('反馈'),
              btnProps: {
                color: 'primary',
                icon: 'forum-o',
                type: 'c7n-pro',
                wait: THROTTLE_TIME,
                loading: confirmLoading,
                disabled: !selected.length,
                onClick: this.handleFeedback,
                permissionList: [
                  {
                    code: 'srm.logistics.delivery.order.execution.workbench.button.all.feedback',
                    type: 'c7n-pro',
                    meaning: '销售方订单工作台-整单-反馈',
                  },
                ],
              },
            },
            {
              name: 'exportPro',
              btnComp: ExcelExportPro,
              childFor: 'buttonText',
              child: selected.length
                ? intl.get(`hzero.common.button.selectedExport`).d('勾选导出')
                : intl.get(`hzero.common.button.export`).d('导出'),
              btnProps: {
                templateCode: 'SRM_SODR_SUP_WORKBENCH_PO_HEADER', // 导出模板编码
                exportAsync: true, // 是否异步
                otherButtonProps: {
                  type: 'c7n-pro',
                  funcType: 'flat',
                  icon: 'unarchive',
                  permissionList: [
                    {
                      code:
                        'srm.logistics.delivery.order.execution.workbench.ps.button.tobesubmit.newexport',
                      type: 'c7n-pro',
                      meaning: '销售方订单工作台-整单待反馈-新版导出',
                    },
                  ],
                },
                requestUrl: `${SRM_SPUC}/v1/${tenantId}/po-workbench/export-confirm-po-list/new-module`,
                queryParams: postParams,
                method: 'POST',
                allBody: true,
              },
            },
            {
              name: 'importPro',
              btnComp: CommonImportNew,
              childFor: 'buttonText',
              child: intl.get(`sodr.common.model.common.newWholeImport`).d('批量导入交期'),
              btnProps: {
                businessObjectTemplateCode:
                  'SRM_C_SRM_SODR_PO_HEADER_SUP_WORKBENCH_STAY_FEEDBACK_IMPORT',
                prefixPatch: SRM_SPUC,
                refreshButton: true,
                args: {
                  customizeUnitCode: 'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.DETAILINFO',
                  poWorkbenchFlag: 1,
                },
                successCallBack: () => {
                  this.handleTabsChange('toBeFedBack');
                }, // 导入成功的回调
                buttonProps: {
                  type: 'c7n-pro',
                  funcType: 'flat',
                  icon: 'unarchive',
                  permissionList: [
                    {
                      code:
                        'srm.logistics.delivery.order.execution.workbench.ps.button.tobesubmit.newimport',
                      type: 'c7n-pro',
                      meaning: '销售方订单工作台-整单待反馈-新版导入',
                    },
                  ],
                },
                customeImportTemplate: {
                  method: 'POST',
                  allBody: true,
                  tplAsyncDownload: true,
                  templateCode: 'SRM_C_SRM_SODR_PO_HEADER_SUP_WORKBENCH_STAY_FEEDBACK',
                  requestUrl: `${SRM_SPUC}/v1/${tenantId}/po-workbench/export-stay-po-list/new-module`,
                  queryParams: {
                    ...queryParams,
                    supplierTenantId: organizationId,
                    lineStatusCodes: ['PUBLISHED', 'DELIVERY_DATE_REJECT'],
                  },
                  queryArea: {
                    fillerType: 'single-sheet',
                    async: true,
                    importTemplateCode:
                      'SRM_C_SRM_SODR_PO_HEADER_SUP_WORKBENCH_STAY_FEEDBACK_IMPORT',
                  },
                },
              },
            },
            {
              name: 'asyncBatchImport',
              btnComp: CommonImportNew,
              childFor: 'buttonText',
              child: intl
                .get(`sodr.common.model.common.asyncBatchWholeImport`)
                .d('异步批量导入交期'),
              btnProps: {
                businessObjectTemplateCode:
                  'SRM_C_SRM_SODR_PO_HEADER_SUP_WORKBENCH_STAY_FEEDBACK_IMPORT',
                prefixPatch: SRM_SPUC,
                refreshButton: true,
                args: {
                  customizeUnitCode: 'SINV.ORDER_EXECUTION_TOBEFEDBACK_DETAIL.DETAILINFO',
                  poWorkbenchFlag: 1,
                  syncImportFlag: 1,
                },
                successCallBack: () => {
                  this.handleTabsChange('toBeFedBack');
                }, // 导入成功的回调
                buttonProps: {
                  type: 'c7n-pro',
                  funcType: 'flat',
                  icon: 'unarchive',
                  permissionList: [
                    {
                      code:
                        'srm.logistics.delivery.order.execution.workbench.button.tobesubmit.asyncBatchImport',
                      meaning: '销售方订单工作台-整单待反馈-异步批量导入交期',
                    },
                  ],
                },
                customeImportTemplate: {
                  method: 'POST',
                  allBody: true,
                  tplAsyncDownload: true,
                  templateCode: 'SRM_C_SRM_SODR_PO_HEADER_SUP_WORKBENCH_STAY_FEEDBACK',
                  requestUrl: `${SRM_SPUC}/v1/${tenantId}/po-workbench/export-stay-po-list/new-module`,
                  queryParams: {
                    ...queryParams,
                    supplierTenantId: organizationId,
                    lineStatusCodes: ['PUBLISHED', 'DELIVERY_DATE_REJECT'],
                  },
                  queryArea: {
                    fillerType: 'single-sheet',
                    async: true,
                    importTemplateCode:
                      'SRM_C_SRM_SODR_PO_HEADER_SUP_WORKBENCH_STAY_FEEDBACK_IMPORT',
                  },
                },
              },
            },
          ];
          return (
            <Fragment>
              {customizeBtnGroup(
                { code: 'SINV.ORDER_EXECUTION_TOBEFEDBACK.BUTTONS', pro: true },
                <DynamicButtons buttons={buttons} />
              )}
            </Fragment>
          );
        });
        return <Btns dataSet={toBeFedBackDs} />;
      case 'feedbackAlready':
        Btns = observer(({ dataSet }) => {
          const { selected } = dataSet;
          const poHeaderIds = selected.map((i) => i.get('poHeaderId'));
          const queryParams = selected.length
            ? { poHeaderIds }
            : dataSet.queryDataSet
            ? dataSet.queryDataSet.toData()[0] || {}
            : {};
          Object.assign(queryParams, {
            poWorkbenchFlag: 1,
            customizeUnitCode:
              'SINV.ORDER_EXECUTION_FEEDBACKALREADY.LIST,SINV.ORDER_EXECUTION_FEEDBACKALREADY.SEARCH',
          });
          const buttons = [
            {
              name: 'importPro',
              btnComp: CommonImportNew,
              childFor: 'buttonText',
              child: intl.get(`sodr.common.model.common.newWholeImport`).d('批量导入交期'),
              btnProps: {
                businessObjectTemplateCode:
                  'SRM_C_SRM_SODR_PO_HEADER_SUP_WORKBENCH_ALREADY_FEEDBACK_IMPORT',
                prefixPatch: SRM_SPUC,
                args: {
                  customizeUnitCode: 'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.DETAILINFO',
                  poWorkbenchFlag: 1,
                },
                refreshButton: true,
                successCallBack: () => {
                  this.handleTabsChange('feedbackAlready');
                }, // 导入成功的回调
                buttonProps: {
                  type: 'c7n-pro',
                  funcType: 'flat',
                  icon: 'unarchive',
                  permissionList: [
                    {
                      code:
                        'srm.logistics.delivery.order.execution.workbench.ps.button.feedbackalready.newimport',
                      type: 'c7n-pro',
                      meaning: '销售方订单工作台-整单已反馈-新版导入',
                    },
                  ],
                },
                customeImportTemplate: {
                  method: 'POST',
                  allBody: true,
                  tplAsyncDownload: true,
                  templateCode: 'SRM_C_SRM_SODR_PO_HEADER_SUP_WORKBENCH_ALREADY_FEEDBACK',
                  requestUrl: `${SRM_SPUC}/v1/${tenantId}/po-workbench/export-already-po-list/new-module`,
                  queryParams: {
                    ...queryParams,
                    supplierTenantId: organizationId,
                    statusCodes: ['CONFIRMED_ALL'],
                    lineStatusCodes: ['CONFIRMED'],
                  },
                  queryArea: {
                    fillerType: 'single-sheet',
                    async: true,
                    importTemplateCode:
                      'SRM_C_SRM_SODR_PO_HEADER_SUP_WORKBENCH_ALREADY_FEEDBACK_IMPORT',
                  },
                },
              },
            },
            {
              name: 'asyncBatchImport',
              btnComp: CommonImportNew,
              childFor: 'buttonText',
              child: intl
                .get(`sodr.common.model.common.asyncBatchWholeImport`)
                .d('异步批量导入交期'),
              btnProps: {
                businessObjectTemplateCode:
                  'SRM_C_SRM_SODR_PO_HEADER_SUP_WORKBENCH_ALREADY_FEEDBACK_IMPORT',
                prefixPatch: SRM_SPUC,
                args: {
                  customizeUnitCode: 'SINV.ORDER_EXECUTION_FEDBACKALREADY_DETAIL.DETAILINFO',
                  poWorkbenchFlag: 1,
                  syncImportFlag: 1,
                },
                refreshButton: true,
                successCallBack: () => {
                  this.handleTabsChange('feedbackAlready');
                }, // 导入成功的回调
                buttonProps: {
                  type: 'c7n-pro',
                  funcType: 'flat',
                  icon: 'unarchive',
                  permissionList: [
                    {
                      code:
                        'srm.logistics.delivery.order.execution.workbench.button.feedbackalready.asyncBatchImport',
                      meaning: '销售方订单工作台-整单已反馈-异步批量导入交期',
                    },
                  ],
                },
                customeImportTemplate: {
                  method: 'POST',
                  allBody: true,
                  tplAsyncDownload: true,
                  templateCode: 'SRM_C_SRM_SODR_PO_HEADER_SUP_WORKBENCH_ALREADY_FEEDBACK',
                  requestUrl: `${SRM_SPUC}/v1/${tenantId}/po-workbench/export-already-po-list/new-module`,
                  queryParams: {
                    ...queryParams,
                    supplierTenantId: organizationId,
                    statusCodes: ['CONFIRMED_ALL'],
                    lineStatusCodes: ['CONFIRMED'],
                  },
                  queryArea: {
                    fillerType: 'single-sheet',
                    async: true,
                    importTemplateCode:
                      'SRM_C_SRM_SODR_PO_HEADER_SUP_WORKBENCH_ALREADY_FEEDBACK_IMPORT',
                  },
                },
              },
            },
          ];
          return (
            <Fragment>
              {customizeBtnGroup(
                { code: 'SINV.ORDER_EXECUTION_FEEDBACKALREADY.BUTTONS', pro: true },
                <DynamicButtons buttons={buttons} />
              )}
            </Fragment>
          );
        });
        return <Btns dataSet={feedbackAlreadyDs} />;
      case 'all':
        Btns = observer(({ dataSet }) => {
          const { selected } = dataSet;
          const poHeaderIds = selected.map((i) => i.get('poHeaderId'));
          const queryParams = selected.length
            ? {
                poHeaderIds,
              }
            : dataSet.queryDataSet
            ? dataSet.queryDataSet.toData()[0] || {}
            : {};
          Object.assign(queryParams, {
            supplierTenantId: getUserOrganizationId(),
            customizeUnitCode:
              'SINV.ORDER_EXECUTION_ALL.EXPORT,SINV.ORDER_EXECUTION_ALL.SEARCH,SINV.ORDER_EXECUTION_ALL.LIST',
            poWorkbenchFlag: 1,
          });
          const postParams = {
            ...queryParams,
            statusCodes: queryParams.statusCodes?.split(','),
          };
          const buttons = [
            {
              name: 'exportPro',
              btnComp: ExcelExportPro,
              childFor: 'buttonText',
              child: selected.length
                ? intl.get(`hzero.common.button.selectedExport`).d('勾选导出')
                : intl.get(`hzero.common.button.export`).d('导出'),
              btnProps: {
                templateCode: 'SRM_SODR_SUP_WORKBENCH_PO_HEADER', // 导出模板编码
                exportAsync: true, // 是否异步
                otherButtonProps: {
                  type: 'c7n-pro',
                  funcType: 'flat',
                  icon: 'unarchive',
                  permissionList: [
                    {
                      code:
                        'srm.logistics.delivery.order.execution.workbench.ps.button.all.newexport',
                      type: 'c7n-pro',
                      meaning: '销售方订单工作台-整单全部-新版导出',
                    },
                  ],
                },
                requestUrl: `${SRM_SPUC}/v1/${tenantId}/po-workbench/export-sup/new-module`,
                queryParams: postParams,
                method: 'POST',
                allBody: true,
              },
            },
            {
              name: 'printNew',
              childFor: 'buttonText',
              btnComp: PrintProButton,
              child: intl.get(`sodr.workspace.view.button.batch.printpro`).d('(新)批量打印'),
              btnProps: {
                buttonProps: {
                  wait: THROTTLE_TIME,
                  funcType: 'flat',
                  icon: 'print',
                  type: 'c7n-pro',
                  disabled: isEmpty(selected),
                  permissionList: [
                    {
                      code:
                        'srm.logistics.delivery.order.execution.workbench.button.all.newBatchPrint',
                      type: 'c7n-pro',
                      meaning: '销售方订单工作台-全部-(新)批量打印',
                    },
                  ],
                },
                requestUrl: `${SRM_SPUC}/v1/${tenantId}/po-header/batch-print-token`,
                method: 'POST',
                data: poHeaderIds,
              },
            },
          ];
          return (
            <Fragment>
              {customizeBtnGroup(
                { code: 'SINV.ORDER_EXECUTION_ALL.BUTTONS', pro: true },
                <DynamicButtons
                  buttons={
                    remote
                      ? remote.process(
                          'SODR.SUPPLIERWORKSPACE_LIST_PROCESS_ALL_HEADER_BUTTON',
                          buttons,
                          { that: this, dataSet }
                        )
                      : buttons
                  }
                />
              )}
            </Fragment>
          );
        });
        return <Btns dataSet={allDs} />;
      case 'detailToBeFedBack':
        Btns = observer(({ dataSet }) => {
          const { selected } = dataSet;
          const poLineLocationIds = selected.map((i) => i.get('poLineLocationId'));
          const queryParams = selected.length
            ? { poLineLocationIds }
            : dataSet.queryDataSet
            ? dataSet.queryDataSet.toData()[0] || {}
            : {};

          Object.assign(queryParams, {
            poWorkbenchFlag: 1,
            customizeUnitCode:
              'SINV.ORDER_EXECUTION_DETAIL_TOBEFEDBACK.EXPORT,SINV.ORDER_EXECUTION_DETAIL_TOBEFEDBACK.LIST,SINV.ORDER_EXECUTION_DETAIL_TOBEFEDBACK.SEARCH',
          });
          const postParams = {
            ...queryParams,
            statusCodes: queryParams.statusCodes?.split(','),
          };
          const buttons = [
            {
              name: 'feedback',
              btnType: 'c7n-pro',
              btnComp: Button,
              child: intl.get('slod.orderExecution.view.option.feedback').d('反馈'),
              btnProps: {
                color: 'primary',
                icon: 'forum-o',
                type: 'c7n-pro',
                wait: THROTTLE_TIME,
                disabled: !selected.length,
                onClick: this.handleDetailFeedback,
                loading: listByLineFeedbackLoading,
                permissionList: [
                  {
                    code:
                      'srm.logistics.delivery.order.execution.workbench.button.detailtobesubmit.feedback',
                    type: 'c7n-pro',
                    meaning: '销售方订单工作台-明细-反馈',
                  },
                ],
              },
            },
            {
              name: 'selectionBatchEdit',
              btnComp: TooltipButton,
              childFor: 'buttonText',
              btnType: 'c7n-pro',
              child: intl.get(`sodr.workspace.view.button.tickaBtchEdit`).d('勾选批量编辑'),
              btnProps: {
                btnProps: {
                  icon: 'mode_edit',
                  type: 'c7n-pro',
                  funcType: 'flat',
                  disabled: !selected.length,
                  onClick: () => this.handleBatchMaintenance(key),
                },
              },
            },
            {
              name: 'save',
              btnType: 'c7n-pro',
              child: intl.get('slod.orderExecution.view.option.save').d('保存'),
              btnProps: {
                icon: 'save',
                type: 'c7n-pro',
                funcType: 'flat',
                wait: THROTTLE_TIME,
                disabled: !selected.length,
                onClick: this.handleDetailSave,
                loading: handleDetailSaveLoading,
              },
            },
            {
              name: 'exportPro',
              btnComp: ExcelExportPro,
              childFor: 'buttonText',
              child: selected.length
                ? intl.get(`hzero.common.button.selectedExport`).d('勾选导出')
                : intl.get(`hzero.common.button.export`).d('导出'),
              btnProps: {
                templateCode: 'SRM_SODR_SUP_WORKBENCH_PO_DETAIL', // 导出模板编码
                exportAsync: true, // 是否异步
                otherButtonProps: {
                  type: 'c7n-pro',
                  funcType: 'flat',
                  icon: 'unarchive',
                  permissionList: [
                    {
                      code:
                        'srm.logistics.delivery.order.execution.workbench.ps.button.detailtobesubmit.newexport',
                      type: 'c7n-pro',
                      meaning: '销售方订单工作台-明细待反馈-新版导出',
                    },
                  ],
                },
                requestUrl: `${SRM_SPUC}/v1/${tenantId}/po-location/confirm/list/export/new-module`,
                queryParams: postParams,
                method: 'POST',
                allBody: true,
              },
            },
          ];
          return (
            <Fragment>
              {customizeBtnGroup(
                { code: 'SINV.ORDER_EXECUTION_DETAIL_TOBEFEDBACK.BUTTONS', pro: true },
                <DynamicButtons buttons={buttons} />
              )}
            </Fragment>
          );
        });
        return <Btns dataSet={detailToBeFedBackDs} />;
      case 'detailFeedbackAlready':
        Btns = observer(({ dataSet }) => {
          const { selected } = dataSet;
          const buttons = [
            {
              name: 'feedbackAgain',
              btnComp: Button,
              btnType: 'c7n-pro',
              child: intl.get('slod.orderExecution.view.option.feedbackAgain').d('再次反馈'),
              btnProps: {
                icon: 'forum-o',
                color: 'primary',
                type: 'c7n-pro',
                wait: THROTTLE_TIME,
                disabled: !selected.length,
                loading: detailFeedbackAgainLoading,
                onClick: this.handleDetailFeedbackAlready,
                permissionList: [
                  {
                    code:
                      'srm.logistics.delivery.order.execution.workbench.button.detailfeedbackalready.feedbackagain',
                    type: 'c7n-pro',
                    meaning: '销售方订单工作台-明细-再次反馈',
                  },
                ],
              },
            },
            {
              name: 'selectionBatchEdit',
              btnComp: TooltipButton,
              childFor: 'buttonText',
              btnType: 'c7n-pro',
              child: intl.get(`sodr.workspace.view.button.tickaBtchEdit`).d('勾选批量编辑'),
              btnProps: {
                btnProps: {
                  icon: 'mode_edit',
                  type: 'c7n-pro',
                  funcType: 'flat',
                  disabled: !selected.length,
                  onClick: () => this.handleBatchMaintenance(key),
                },
              },
            },
          ];
          // const poLineLocationIds = selected.map((i) => i.get('poLineLocationId')).join(',');
          // const queryParams = selected.length
          //   ? { poLineLocationIds }
          //   : dataSet.queryDataSet
          //   ? dataSet.queryDataSet.toData()[0] || {}
          //   : {};
          return (
            <Fragment>
              {customizeBtnGroup(
                { code: 'SINV.ORDER_EXECUTION_DETAIL_FEDBACKALREADY.BUTTONS', pro: true },
                <DynamicButtons buttons={buttons} />
              )}
            </Fragment>
          );
        });
        return <Btns dataSet={detailFeedbackAlreadyDs} />;
      case 'detailAll':
        Btns = observer(({ dataSet }) => {
          const { selected } = dataSet;
          const poLineLocationIds = selected.map((i) => i.get('poLineLocationId'));
          const queryParams = selected.length
            ? {
                poLineLocationIds,
              }
            : dataSet.queryDataSet
            ? dataSet.queryDataSet.toData()[0] || {}
            : {};
          Object.assign(queryParams, {
            supplierTenantId: getUserOrganizationId(),
            poWorkbenchFlag: 1,
            customizeUnitCode:
              'SINV.ORDER_EXECUTION_DETAIL_ALL.EXPORT,SINV.ORDER_EXECUTION_DETAIL_ALL.SEARCH.SINV.ORDER_EXECUTION_DETAIL_ALL.LIST',
          });
          const postParams = {
            ...queryParams,
            statusCodes: queryParams.statusCodes?.split(','),
          };
          const buttons = [
            <ExcelExportPro
              buttonText={
                selected.length
                  ? intl.get(`hzero.common.button.selectedExport`).d('勾选导出')
                  : intl.get(`hzero.common.button.export`).d('导出')
              }
              templateCode="SRM_SODR_SUP_WORKBENCH_PO_DETAIL" // 导出模板编码
              exportAsync // 是否异步
              otherButtonProps={{
                type: 'c7n-pro',
                funcType: 'flat',
                icon: 'unarchive',
                // color: 'primary',
                permissionList: [
                  {
                    code:
                      'srm.logistics.delivery.order.execution.workbench.ps.button.detailall.newexport',
                    type: 'c7n-pro',
                    meaning: '销售方订单工作台-明细全部-新版导出',
                  },
                ],
              }}
              requestUrl={`${SRM_SPUC}/v1/${tenantId}/po-location/workbench/supplier/export/new-module`}
              queryParams={postParams}
              allBody
              method="POST"
            />,
          ];
          return (
            <Fragment>
              {remote.process('getDetailAllButtons', buttons, { dataSet: detailAllDs })}
            </Fragment>
          );
        });
        return <Btns dataSet={detailAllDs} />;
      default:
        break;
    }
  }

  render() {
    return (
      <div className={styles['index-page-warp']}>
        <Header
          title={intl.get('slod.orderExecution.view.title.deliverySchedule').d('销售方订单工作台')}
        >
          {this.getHeaderBtns()}
        </Header>
        <Content>
          {/* <div className={styles['content-container']}>
            {this.getLeftRender()}
            {this.getRightRender()}
          </div> */}
          {this.getRightRender()}
        </Content>
      </div>
    );
  }
}
