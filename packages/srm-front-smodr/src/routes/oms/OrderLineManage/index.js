import React from 'react';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { DataSet, Button, TextField, Table, Modal, Tooltip, Form, TextArea } from 'choerodon-ui/pro';
import { Tag, Tabs, Icon } from 'choerodon-ui';
import qs from 'qs';
import moment from 'moment';

import { math } from 'choerodon-ui/dataset';
import withProps from 'utils/withProps';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from '_components/SearchBarTable';
import { openApproveModal } from '_components/ApproveModal';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import ExcelExport from '@/components/ExcelExport';
import ViewFilter from '@/components/ViewFilter';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';
import intl from 'utils/intl';
import {
  handlePrint,
  addBills,
  submitReceive,
  queryReceive,
  orderDetailCancelService,
} from '@/services/oms/orderDetailService';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import getHelpText from '@/routes/oms/OrderLineManage/HelpText';
import c7nModal from '@/utils/c7nModal';
import { Button as PermissionButton } from 'components/Permission';

import remote from 'hzero-front/lib/utils/remote';
import OrderLineDetail from './detail';
import { initDs, wholeDs, receiveDs } from './tableDs';
import { initDs as billDs } from './CreateBillsModal/tableDs';
import CreateBills from './CreateBillsModal';
import { tabList as tabs } from './tabConfig';

import styles from './index.less';

const { TabGroup, TabPane } = Tabs;
const permissionText = 'srm.mall.tenant.order-management.order-entry.button';

const organizationId = getCurrentOrganizationId();

const initState = {
  group: 'whole',
  tabKey: { whole: 'wholeAll', detail: 'detailAll' },
};

@remote({
  code: 'SMODR_ORDERLINE_MANAGE', // 对应二开模块暴露的Expose的编码
  name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
})
@withCustomize({
  unitCode: [
    'SMODR.ORDER.ENTRY.HEADER.QUERY',
    'SMODR.ORDER.ENTRY.BTNS',
    'SMODR.ORDER.ENTRY.DETAIL',
    'SMODR.ORDER.ENTRY.WORKBENCH.TABS',
  ],
})
@formatterCollections({
  code: ['smodr.orderLine', 'smodr.common', 'smodr.payment', 'smodr.orderDetail'],
})
@withProps(
  () => ({
    // ds 暂时没移动到tabConfigs 里， 待后续优化
    billDs: new DataSet(billDs()),
    initDs: new DataSet(initDs()),
    wholeDs: new DataSet(wholeDs()),
    receiveDs: new DataSet(receiveDs()),
    tabList: tabs(),
  }),
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
)
export default class OmsOrder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      key: initState.tabKey[initState.group], // 当前激活tab
      // 详情页返回保留搜索框筛选条件
      wholeValue: this.getWholeInitQueryParam(),
      tabsCount: {}, // 不同tab组下tab总数
      aggregation: false, // 是否聚合
    };
  }

  detail;

  // initDs = new DataSet(initDs());

  wholeDs = new DataSet(wholeDs());

  // 返回内容
  res = {};

  componentDidMount() {
    queryMapIdpValue({
      showOrderStatusMeaning: 'SMODR.SHOW_ORDER_STATUS', // 头
    }).then(res => {
      this.res = res;
    });
    this.queryTabsCount();
  }

  getWholeInitQueryParam = () => {
    const ds = this.props.wholeDs;
    const param = ds.getQueryParameter('mergeQuery') || ds.getQueryParameter('mergeQueryList');
    if (param) {
      const splitVal = param?.split(/[,\s+]/).filter((v) => !!v);
      return splitVal;
    }
    return [];
  }

  queryTabsCount = async () => {
    const { tabList } = this.props;
    const { key } = this.state;
    const sonList = tabList.filter((f) => f.parentKey === initState.group);
    // 已全部查询过，只查当前tab数量
    if (this[`${initState.group}Loaded`]) {
      const find = sonList.find((f) => f.key === key);
      if (find) {
        const { queryCount } = find;
        const res = await queryCount();
        if (getResponse(res)) {
          this.setState(({ tabsCount: pre }) => ({
            tabsCount: { ...pre, [key]: res.totalElements || 0 },
          }));
        }
      }
      return;
    }
    const apis = [];
    sonList.forEach((f) => {
      const { queryCount = (e) => e } = f;
      apis.push(queryCount);
    });
    // 数量查询完毕统一更新数量
    Promise.all(apis.map((api) => api())).then((res) => {
      const tabsCount = {};
      // 当前tab组下
      sonList.forEach((s, idx) => {
        tabsCount[s.key] = res[idx]?.totalElements || 0;
      });
      this.setState({
        tabsCount: {
          ...this.state.tabsCount,
          ...tabsCount,
        },
      });
    });
    this[`${initState.group}Loaded`] = true;
  };

  @Bind()
  query(ds) {
    this.queryTabsCount();
    ds.query(ds.currentPage);
  }

  @Bind()
  handleTabChange(key = 'wholeAll', {
    firstRenderHiddenKeys: hiddenKeys = [], // 被隐藏的标签维度
    firstRenderHiddenGroupKeys: groupHiddenKeys = [], // 被隐藏的聚合标签维度
  } = {}) {
    const { tabList } = this.props;
    const list = tabList.filter(f => !hiddenKeys.includes(f.key) && !groupHiddenKeys.includes(f.parentKey));
    const { parentKey, key: tabKey } = list.find(f => f.key === key) || list[0];
    initState.group = parentKey;
    initState.tabKey[parentKey] = tabKey;
    this.setState({ key: tabKey }, () => {
      this.queryTabsCount();
    });
    switch (tabKey) {
      case 'wholeAll':
        if (this.props.wholeDs.getState('queryStatus') === 'ready') {
          this.props.wholeDs.query(this.props.wholeDs.currentPage);
        }
        break;
      case 'detailAll':
        if (this.props.initDs.getState('queryStatus') === 'ready') {
          this.props.initDs.query(this.props.initDs.currentPage);
        }
        break;
      default:
        break;
    }
  }

  @Bind()
  handleRef(ref = {}) {
    this.detail = ref;
  }

  @Bind()
  handleBillRef(ref = {}) {
    this.billDs = ref;
  }

  @Bind()
  handleToDetail(record = {}, editFlag) {
    const { history: { push } } = this.props;
    const { orderId, wflApproveFlag, taskId, processInstanceId } = record.get([
      'orderId',
      'wflApproveFlag',
      'taskId',
      'processInstanceId',
    ]);
    push({
      pathname: '/s2-mall/oms/order-line/order-detail',
      search: qs.stringify({
        orderId,
        backPath: '/s2-mall/oms/order-line/list',
        editFlag,
        wflApproveFlag,
        taskId,
        processInstanceId,
      }),
    });
  }

  @Bind()
  renderColor(record) {
    const showOrderStatus = record.get('showOrderStatus');
    if (
      [
        'CANCELLING',
        'PREEMPTING',
        'APPROVING',
        'DELIVERYING',
        'PROPER_VATE_ING',
        'RECEIVING',
        'STATEMENTING',
        'INVOICETING',
      ].includes(showOrderStatus)
    ) {
      return 'yellow';
    } else if (showOrderStatus === 'APPROVE_REJECT') {
      return 'red';
    } else if (showOrderStatus === 'CANCELED') {
      return 'gray';
    } else {
      return 'green';
    }
  }

  @Bind()
  async handlePrint(ds) {
    const selectData = ds?.selected?.map((record) => record.toData());
    const ids = selectData?.map((i) => i.orderId);
    const res = await handlePrint(ids);
    if (res) {
      const file = new Blob([res], { type: 'application/pdf' });
      const fileUrl = URL.createObjectURL(file);
      const printWindow = window.open(fileUrl);
      if (printWindow) {
        printWindow.print();
      }
    }
  }

  @Bind()
  handleCheckDetail(record = {}) {
    const oldCode = this.state.orderCode;
    if (oldCode === record.get('orderCode')) { // 明细选同订单号浅比较不会更新
      this.setState({ key: 'detailAll', orderCode: null }); // 先清空orderCode异步触发重新设值
      setTimeout(() => {
        this.setState({ orderCode: record.get('orderCode') });
      }, 100);
    } else {
      this.setState({ key: 'detailAll', orderCode: record.get('orderCode') });
    }
  }

  @Bind()
  handleQueryChange(val) {
    if (val) {
      let newVal = [];
      val.forEach((f) => {
        const splitVal = f?.split(/[,\s+]/).filter((v) => !!v);
        newVal = newVal.concat(splitVal);
      });
      this.setState({ wholeValue: newVal }, () => {
        if (newVal.length === 1) {
          this.props.wholeDs.setQueryParameter('mergeQuery', newVal[0]);
          this.props.wholeDs.setQueryParameter('mergeQueryList', null);
        } else {
          this.props.wholeDs.setQueryParameter('mergeQuery', null);
          this.props.wholeDs.setQueryParameter('mergeQueryList', newVal.join(','));
        }
      });
    } else {
      this.setState({ wholeValue: val });
      this.props.wholeDs.setQueryParameter('mergeQuery', null);
      this.props.wholeDs.setQueryParameter('mergeQueryList', null);
    }
    this.props.wholeDs.query();
  }

  @Bind()
  async handleToPage() {
    const selectSku = this.props.billDs?.selected?.map((i) => i.toData());
    const res = getResponse(await addBills(selectSku));
    if (res && !res.failed) {
      this.props.history.push({
        pathname: '/s2-mall/oms/order-line/create-detail',
        state: { initData: res },
      });
    } else {
      return false;
    }
  }

  // 新建引用单据
  @Bind()
  handleCreateBills() {
    const ObserButton = observer(({ ds }) => (
      <Button color='primary' disabled={ds?.selected?.length <= 0} onClick={() => this.handleToPage()}>{intl.get('smodr.orderLine.view.confirm').d('确定')}</Button>
    ));
    const modal = c7nModal({
      title: intl.get('smodr.orderLine.view.newBill').d('引用单据创建'),
      children: <CreateBills tableDS={this.props.billDs} />,
      style: { width: '1090px' },
      footer: () => (
        <>
          <ObserButton ds={this.props.billDs} />
          <Button onClick={() => modal?.close()}>{intl.get('smodr.orderLine.view.cancel').d('取消')}</Button>
        </>
      ),
    });
  }

  @Bind()
  async handleSubmitReceive(ds) {
    const selectIds = ds.selected.map((item) => item.toData()).map((i) => i.orderEntryId);
    const res = getResponse(await queryReceive(selectIds));
    if (res && !res.failed) {
      res.forEach((i) => {
        this.props.receiveDs.create(i);
      });
    }
    c7nModal({
      title: intl.get('smodr.orderLine.view.submitReceive').d('领用确认'),
      style: { width: '742px' },
      children: (
        <>
          <Table
            dataSet={this.props.receiveDs}
            customizedCode='ORDER_LINE.RECEIVE.CONFIRM'
            style={{ maxHeight: 'calc(100vh - 160px)' }}
            columns={[
              { name: 'skuName' },
              { name: 'quantity', align: 'right' },
              { name: 'deliveryQuantity', align: 'right' },
              { name: 'remainUseQuantity', align: 'right' },
              { name: 'thisUseQuantity', editor: true, align: 'right' },
            ]}
          />
        </>
      ),
      afterClose: () => {
        this.props.receiveDs.loadData([]);
      },
      onOk: async () => {
        let flag = false;
        flag = await this.props.receiveDs.validate();
        if (flag) {
          const result = getResponse(await submitReceive(this.props.receiveDs.toJSONData()));
          if (result && !result.failed) {
            this.props.initDs.query();
          }
        } else {
          return false;
        }
      },
    });
  }

  @Bind
  handleSumCount(ds) {
    const countList = ds.toData().map(i => i.originalQuantity);
    const total = countList.length > 0 ? countList.reduce((p, c) => math.plus(p, c)) : 0;
    const modal = Modal.open({
      title: intl.get('smodr.orderLine.view.skuCount').d('商品计数'),
      border: false,
      children: (
        <div style={{ fontSize: '14px', color: '#4E5769' }}>
          {intl.get('smodr.orderLine.view.skuCountTip').d('当前页面商品数量总和为')}:{total}
        </div>
      ),
      footer: <Button color='primary' onClick={() => modal?.close()}>{intl.get('smodr.orderDetail.model.close').d('关闭')}</Button>,
    });
  }

  // 取消
  handleCancel(record) {
    const cancelDs = new DataSet({
      autoCreate: true,
      forceValidate: true,
      fields: [
        {
          name: 'cancelReason',
          label: intl.get('smodr.orderDetail.view.cancel.title').d('取消原因'),
          required: true,
        },
      ],
    });
    c7nModal({
      title: intl.get('smodr.orderDetail.view.cancel.title').d('取消原因'),
      style: { width: 380 },
      children: (
        <Form columns={1} dataSet={cancelDs} labelLayout="float">
          <TextArea name="cancelReason" rows={3} resize="vertical" />
        </Form>
      ),
      onOk: async () => {
        const flag = await cancelDs.validate();
        if (!flag) return false;
        const cancelReason = cancelDs.current.get('cancelReason');
        const params = {
          orderCode: record.get('orderCode'),
          cancelReason,
        };
        const res = getResponse(await orderDetailCancelService(params));
        if (res) {
          this.props.wholeDs.query(this.props.wholeDs.currentPage);
        } else {
          return false;
        }
      },
    });
  }

  render() {
    const {
      customizeBtnGroup,
      customizeTabPane,
      match: { path = '' },
      remote: remoteRender,
      tabList,
      customizeTable,
    } = this.props;
    const { key, orderCode, wholeValue, tabsCount, aggregation } = this.state;
    const fieldValuesFn = (currentDs, type) => {
      if (currentDs?.selected?.length > 0) {
        if (type === 'whole') {
          const fieldValues = currentDs?.queryDataSet?.current?.toJSONData();
          delete fieldValues.__dirty;
          delete fieldValues.__id;
          delete fieldValues._status;
          const exports = currentDs?.selected.map((i) => i.toData()).map((item) => item.orderId);
          fieldValues.orderIdList = exports;
          return filterNullValueObject(fieldValues);
        } else {
          const fieldValues = currentDs?.queryDataSet?.current?.toJSONData();
          delete fieldValues.__dirty;
          delete fieldValues.__id;
          delete fieldValues._status;
          const exports = currentDs?.selected
            .map((i) => i.toData())
            .map((item) => item.orderEntryId);
          fieldValues.orderEntryIdList = exports;
          return filterNullValueObject(fieldValues);
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (type === 'whole') {
          const fieldValues = currentDs?.queryDataSet?.current?.toJSONData();
          delete fieldValues.__dirty;
          delete fieldValues.__id;
          delete fieldValues._status;
          if (wholeValue?.length > 1) {
            fieldValues.mergeQueryList = wholeValue;
          } else {
            fieldValues.mergeQuery = wholeValue?.[0];
          }
          return filterNullValueObject(fieldValues);
        } else {
          const fieldValues = currentDs?.queryDataSet?.current?.toJSONData();
          delete fieldValues.__dirty;
          delete fieldValues.__id;
          delete fieldValues._status;
          if (this.detail?.state?.detailValue?.length > 1) {
            fieldValues.mergeQueryList = this.detail?.state?.detailValue;
          } else {
            fieldValues.mergeQuery = this.detail?.state?.detailValue?.[0];
          }
          return filterNullValueObject(fieldValues);
        }
      }
    };
    const TooltipPrintBtn = ({ tooltipTitle, ...others }) => (
      <Tooltip title={tooltipTitle} placement="bottomLeft">
        {/* span: 支持hover */}
        <span> <PrintProButton {...others} /></span>
      </Tooltip>
    );
    const HeaderWholeBtn = observer(({ currentDs }) => {
      const url = `${SMALL_ORDER}/v1/${organizationId}/orders/order-export`;
      const orderIdsStr = currentDs.selected.map(m => m.get('orderId')).join(',');
      // 同时存在领用协议和非领用协议
      // const hasReceive = currentDs.selected.some(s => s.get('agreementBusinessType') === 'RECEIVE');
      // const printDisabled = hasReceive && currentDs.selected.some(s => s.get('agreementBusinessType') !== 'RECEIVE');
      const headerBtns = [
        {
          name: 'exportProWhole',
          btnComp: ExcelExportPro,
          btnType: 'c7n-pro',
          btnProps: {
            requestUrl: url,
            method: 'POST',
            allBody: true,
            queryParams: () => {
              const query = fieldValuesFn(currentDs, 'whole');
              query.customizeUnitCode = 'SMODR.ORDER.ENTRY.HEADER.QUERY,SMODR.ORDER.ENTRY.DETAIL';
              return filterNullValueObject(query);
            },
            templateCode: 'SRM_C_SRM_S2FUL_ORDER_HEADER',
            buttonText:
              currentDs?.selected?.length > 0
                ? intl.get('smodr.orderLine.view.checkExportNew').d('(新)勾选导出')
                : intl.get('smodr.orderLine.view.exportNew').d('(新)导出'),
            otherButtonProps: {
              type: 'c7n-pro',
              funcType: 'flat',
              icon: 'unarchive',
              permissionList: [
                {
                  code: `${path}.button.export.whole`,
                  type: 'button',
                  meaning: '订单中心工作台',
                },
              ],
            },
          },
        },
        {
          name: 'wholeNewPrint',
          btnType: 'c7n-pro',
          btnComp: TooltipPrintBtn,
          btnProps: {
            buttonText: intl.get('hzero.common.button.print').d('打印'),
            // tooltipTitle: printDisabled ? intl.get('smodr.common.view.tooltip.printUnable').d('暂不支持同时打印领用订单和其他订单，请重新选择') : '',
            buttonProps: {
              icon: 'print',
              type: 'c7n-pro',
              funcType: 'flat',
              className: styles['new-version-btn'],
              disabled: currentDs.selected.length === 0,
              permissionList: [
                {
                  code: `srm.mall.tenant.order-management.order-entry.button.whole.new-print`,
                  type: 'button',
                  meaning: '商城订单工作台-整单打印按钮（新）',
                },
              ],
            },
            // requestUrl: hasReceive ?
            //   `${SMALL_ORDER}/v1/${organizationId}/orders/print-receive-order-token?orderIds=${orderIdsStr}`
            //   : `${SMALL_ORDER}/v1/${organizationId}/orders/print-order-token?orderIds=${orderIdsStr}`,
            requestUrl: `${SMALL_ORDER}/v1/${organizationId}/orders/print-order-token?orderIds=${orderIdsStr}`,
            method: 'POST',
          },
        },
      ];
      const newHeaderBtns = remoteRender.process('SMODR_ORDER_MANAGE_BTNS', headerBtns, { dataSet: currentDs });
      return (
        <>
          {customizeBtnGroup(
            {
              code: 'SMODR.ORDER.ENTRY.BTNS',
              pro: true,
            },
            <DynamicButtons buttons={newHeaderBtns} />
          )}
        </>
      );
    });
    const HeaderBtn = observer(({ currentDs }) => {
      const url = `${SMALL_ORDER}/v1/${organizationId}/order-entrys/list-export`;
      const oldUrl = `${SMALL_ORDER}/v1/${organizationId}/order-entrys/old-list-export`;
      const headerBtns = [
        {
          name: 'exportProWhole',
          btnComp: ExcelExportPro,
          btnType: 'c7n-pro',
          btnProps: {
            requestUrl: url,
            method: 'POST',
            allBody: true,
            queryParams: () => {
              const query = fieldValuesFn(currentDs, 'detail');
              query.customizeUnitCode = 'SMODR.ORDER.ENTRY.QUERY,SMODR.ORDER.ENTRY.SELECT';
              return filterNullValueObject(query);
            },
            templateCode: 'SMODR_ORDER_EXPORT',
            buttonText:
              currentDs?.selected?.length > 0
                ? intl.get('smodr.orderLine.view.checkExportNew').d('(新)勾选导出')
                : intl.get('smodr.orderLine.view.exportNew').d('(新)导出'),
            otherButtonProps: {
              type: 'c7n-pro',
              funcType: 'flat',
              icon: 'unarchive',
              permissionList: [
                {
                  code: `${path}.button.export`,
                  type: 'button',
                  meaning: '订单中心工作台',
                },
              ],
            },
          },
        },
        {
          name: 'export',
          btnComp: ExcelExport,
          btnType: 'c7n-pro',
          btnProps: {
            requestUrl: oldUrl,
            queryParams: () => {
              const query = fieldValuesFn(currentDs, 'detail');
              return filterNullValueObject(query);
            },
            // templateCode: 'SMODR_ORDER_EXPORT',
            buttonText:
              currentDs?.selected?.length > 0
                ? intl.get('smodr.orderLine.view.checkExport').d('勾选导出')
                : intl.get('smodr.orderLine.view.export').d('导出'),
            otherButtonProps: {
              type: 'c7n-pro',
              funcType: 'flat',
              icon: 'unarchive',
              // permissionList: [
              //   {
              //     code: `hzero.srm.requirement.prm.pr-platform.ps.export`,
              //     type: 'button',
              //   },
              // ],
            },
          },
        },
        {
          name: 'submitReceive',
          btnType: 'c7n-pro',
          child: intl.get('smodr.orderLine.view.submitReceive').d('领用确认'),
          btnComp: PermissionButton,
          btnProps: {
            onClick: () => this.handleSubmitReceive(currentDs),
            type: 'c7n-pro',
            disabled:
              currentDs.selected.length === 0 ||
              currentDs.selected
                ?.map((i) => i.toData())
                ?.filter((l) => l.agreementBusinessType !== 'RECEIVE').length > 0 ||
              currentDs.selected
                ?.map((i) => i.toData())
                ?.filter(
                  (l) =>
                    l.shipmentStatus !== 'NOT_DELIVERY' &&
                    l.shipmentStatus !== 'PART_DISTRIBUTE' &&
                    l.shipmentStatus !== 'PART_DELIVERY'
                ).length > 0,
            funcType: 'flat',
            icon: 'check',
            permissionList: [
              {
                code: `${permissionText}.list.receive.confirm`,
                type: 'button',
                meaning: intl.get('smodr.orderLine.view.newTitleWork').d('商城订单工作台') -
                  intl.get('smodr.apply.view.permissionSubmitReceive').d('明细领用确认按钮'),
              },
            ],
          },
        },
        {
          name: 'totalCount',
          btnType: 'c7n-pro',
          child: intl.get('smodr.orderLine.view.sumCount').d('合计数量'),
          btnProps: {
            onClick: () => this.handleSumCount(currentDs),
            funcType: 'flat',
            icon: 'calculate',
            loading: currentDs.status === 'loading',
          },
        },
      ];
      return (
        <>
          {customizeBtnGroup(
            {
              code: 'SMODR.ORDER.ENTRY.BTNS',
              pro: true,
            },
            <DynamicButtons buttons={headerBtns} />
          )}
        </>
      );
    });
    const tabRenderMap = {
      wholeAll: {
        render: () => {
          let columns = [
            {
              name: 'showOrderStatusMeaning',
              width: 100,
              renderer: ({ value, record }) => {
                return (
                  <Tag color={this.renderColor(record)} style={{ border: 'none' }}>
                    {value}
                  </Tag>
                );
              },
              help: () => getHelpText('showOrderStatusMeaning', this.res),
            },
            {
              name: 'operation',
              width: 180,
              align: 'left',
              command: ({ record }) => [
                <Button
                  color="primary"
                  funcType="link"
                  onClick={() => this.handleCheckDetail(record)}
                >
                  {intl.get('smodr.orderLine.model.lookDetail').d('查看明细行')}
                </Button>,
                record.get('wflApproveFlag') && (
                  <Button
                    color="primary"
                    funcType="link"
                    style={{ marginLeft: 16 }}
                    onClick={() => {
                      openApproveModal({
                        modalProps: {
                          closable: true,
                        },
                        taskId: record.get('taskId'),
                        processInstanceId: record.get('processInstanceId'),
                        onSuccess: () => {
                          this.props.wholeDs.query(this.props.wholeDs.currentPage);
                        },
                      });
                    }}
                  >
                    {intl.get('hzero.common.button.approval').d('审批')}
                  </Button>
                ),
                // 电商PUNCHOUT,已预占或者(审批拒绝且审批方式不为SRM审批)时
                (record.get('showOrderStatus') === 'PREEMPT' ||
                  (record.get('showOrderStatus') === 'APPROVE_REJECT' &&
                    record.get('approveType') !== 'EXTERNAL_APPROVAL')) &&
                record.get('orderSourceFrom') === 'EC_PUNCHOUT' && (
                  <Button
                    color="primary"
                    funcType="link"
                    onClick={() => this.handleToDetail(record, true)}
                    style={{ marginLeft: 16 }}
                  >
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </Button>
                ),
                ['PREEMPTING', 'APPROVED', 'APPROVE_REJECT', 'APPROVING', 'PREEMPT'].includes(
                  record.get('showOrderStatus')
                ) &&
                record.get('orderSourceFrom') === 'EC_PUNCHOUT' && (
                  <Button
                    color="primary"
                    funcType="link"
                    onClick={() => this.handleCancel(record)}
                    style={{ marginLeft: 16 }}
                  >
                    {intl.get('hzero.common.button.cance').d('取消')}
                  </Button>
                ),
                remoteRender.render('LOGISICS_INFO_BUTTON', '', {
                  record: record.toData(),
                  wholeDs: this.props.wholeDs,
                }),
              ],
            },
            {
              name: 'orderInfoGroup',
              title: intl.get('smodr.orderLine.view.orderInfo').d('订单信息'),
              minWidth: 230,
              children: [
                {
                  width: 200,
                  name: 'orderCode',
                  renderer: ({ value, record }) => (
                    <a onClick={() => this.handleToDetail(record)}>{value}</a>
                  ),
                },
                {
                  width: 100,
                  name: 'orderTypeMeaning',
                },
                {
                  width: 80,
                  name: 'agreementBusinessTypeMeaning',
                },
                {
                  width: 100,
                  name: 'paymentTypeMeaning',
                  renderer: ({ value, record }) => (
                    <span>
                      {record.get('agreementType') === 'SALE'
                        ? record.get('proxyPaymentTypeMeaning') || '-'
                        : value || '-'}
                    </span>
                  ),
                },
              ],
            },
            {
              name: 'priceInfoGroup',
              title: intl.get('smodr.orderLine.view.priceInfo').d('金额信息'),
              minWidth: 200,
              children: [
                {
                  width: 100,
                  name: 'currencyName',
                },
                {
                  width: 120,
                  name: 'productAmountMeaning',
                  align: 'right',
                },
                {
                  width: 100,
                  name: 'extraCostAmountMeaning',
                  align: 'right',
                },
                {
                  width: 150,
                  name: 'orderAmountMeaning',
                  align: 'right',
                },
              ],
            },
            {
              width: 100,
              name: 'unitCode',
              hidden: true,
            },
            {
              width: 100,
              name: 'unitName',
              hidden: true,
            },
            {
              name: 'personInfoGroup',
              title: intl.get('smodr.orderLine.view.personInfo').d('交易双方信息'),
              minWidth: 200,
              children: [
                {
                  width: 200,
                  name: 'purchaseCompanyName',
                  renderer: ({ value, record }) => (
                    <span>
                      {record.get('agreementType') === 'SALE'
                        ? record.get('proxySupplierCompanyName')
                        : value}
                    </span>
                  ),
                },
                {
                  width: 200,
                  name: 'supplierCompanyName',
                },
              ],
            },
            {
              name: 'orderDetailInfo',
              title: intl.get('smodr.orderLine.view.orderDetailInfo').d('下单信息'),
              minWidth: 200,
              children: [
                {
                  width: 100,
                  name: 'buyerName',
                },
                {
                  width: 150,
                  name: 'cecCreatedTime',
                },
              ],
            },
            {
              name: 'ouName',
              width: 120,
              title: intl.get('smodr.orderDetail.model.ouName').d('业务实体'),
            },
            {
              name: 'purOrganizationName',
              width: 120,
              title: intl.get('smodr.orderDetail.model.purchaseOrg').d('采购组织'),
            },
          ];
          columns = remoteRender.process('SMODR_ORDER_MANAGE_WHOLE_COLUMN', columns, {
            wholeDs: this.props.wholeDs,
          });
          const resetQueryDs = () => {
            this.props.wholeDs.reset();
            this.props.wholeDs.setQueryParameter('mergeQuery', null);
            this.props.wholeDs.setQueryParameter('mergeQueryList', null);
            this.setState({ wholeValue: undefined });
          };
          return (
            <div style={{ height: 'calc(100vh - 260px)' }}>
              {
                customizeTable(
                  {
                    code: 'SMODR.ORDER.ENTRY.DETAIL',
                  },
                  <SearchBarTable
                    style={{ maxHeight: `calc(100% - 22px)` }}
                    dataSet={this.props.wholeDs}
                    columns={columns}
                    cacheState
                    aggregation={aggregation}
                    onAggregationChange={(_aggregation) => {
                      this.setState({ aggregation: _aggregation });
                    }}
                    searchCode="SMODR.ORDER.ENTRY.HEADER.QUERY"
                    customizedCode="SMODR.ORDER.ENTRY.SELECT.WHOLE"
                    searchBarConfig={{
                      onClear: resetQueryDs,
                      onReset: resetQueryDs,
                      fieldProps: {
                        cecCreatedTime: {
                          required: true,
                          defaultValue: () =>
                            [moment().subtract(6, 'month').startOf('day').format('YYYY-MM-DD HH:mm:ss'), moment(new Date()).endOf('day').format('YYYY-MM-DD HH:mm:ss')],
                        },
                      },
                      left: {
                        render: () => (
                          <TextField
                            multiple
                            valueChangeAction="blur"
                            value={wholeValue}
                            style={{ width: '300px' }}
                            prefix={<Icon type="search" />}
                            placeholder={intl
                              .get('smodr.orderLine.view.searchTipNew')
                              .d('请输入商城订单编码查询')}
                            onChange={(val) => this.handleQueryChange(val)}
                          />
                        ),
                      },
                      right: {
                        render: () => (
                          <ViewFilter
                            aggregation={aggregation}
                            onAggregationChange={(_aggregation) => {
                              this.setState({ aggregation: _aggregation });
                            }}
                          />
                        ),
                      },
                    }}
                  />
                )
              }
            </div>
          );
        },
      },
      detailAll: {
        render: () => (
          <OrderLineDetail
            push={this.props.history.push}
            onRef={this.handleRef}
            initDs={this.props.initDs}
            orderCode={orderCode}
            remoteRender={remoteRender}
          />
        ),
      },
    };
    const sonList = tabList.map(tab => ({
      ...tab,
      ...(tabRenderMap[tab.key] || {}),
    }));

    const ObserverOldPrintBtn = observer(({ ds }) => (
      <PermissionButton
        type='c7n-pro'
        icon="print"
        funcType="flat"
        onClick={() => this.handlePrint(ds)}
        disabled={ds?.selected?.length === 0}
        permissionList={[
          {
            code: `${permissionText}.print.whole`,
            type: 'button',
            meaning:
              intl.get('smodr.orderLine.view.newTitleWork').d('商城订单工作台') -
              intl.get('smodr.apply.view.permissionPrint').d('整单打印按钮'),
          },
        ]}
      >
        {intl.get('smodr.orderLine.view.print').d('打印')}
      </PermissionButton>
    ));

    const parentList = [
      {
        node: intl.get('smodr.orderLine.view.wholeTab').d('整单'),
        key: 'whole',
      },
      {
        node: intl.get('smodr.orderLine.view.detailTab').d('明细'),
        key: 'detail',
      },
    ];
    // 二开需要传递DS
    const cuxProps = {
      currentDs: this.props.initDs,
    };
    return (
      <>
        <Header title={intl.get('smodr.orderLine.view.newTitleWork').d('商城订单工作台')}>
          {key === 'wholeAll' ? (
            <>
              <ObserverOldPrintBtn ds={this.props.wholeDs} />
              <HeaderWholeBtn currentDs={this.props.wholeDs} />
            </>
          ) : (
            <>
              <HeaderBtn currentDs={this.props.initDs} />
              {/* 金风二开展示批量编辑按钮 */}
              {remoteRender.render('BATCH_EDIT_BUTTON', '', cuxProps)}
            </>
          )}
        </Header>
        <Content>
          {customizeTabPane({
            code: 'SMODR.ORDER.ENTRY.WORKBENCH.TABS',
            cascade: true,
            custDefaultActive: this.handleTabChange,
          },
          <Tabs
            onChange={(k) => this.handleTabChange(k)}
            activeKey={key}
          >
            {parentList.map((m) => {
              const son = sonList.filter((f) => f.parentKey === m.key);
              return (
                <TabGroup
                  tab={m.node}
                  key={m.key}
                  defaultActiveKey={initState.tabKey[m.key]}
                >
                  {son.map((i) => {
                    return (
                      <TabPane key={i.key} tab={i.node} count={tabsCount[i.key]}>
                        {i.render()}
                      </TabPane>
                    );
                  })}
                </TabGroup>
              );
            })}
          </Tabs>
          )}
        </Content>
      </>
    );
  }
}
