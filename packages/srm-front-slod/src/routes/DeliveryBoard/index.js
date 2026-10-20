/*
 * @Description: 发货执行看板
 * @Date: 2022-09-05 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { Fragment, useState, useRef, memo, useCallback } from 'react';
import { DataSet, Tooltip, Spin, useModal, Button } from 'choerodon-ui/pro';
import { Popover, Badge } from 'choerodon-ui';

import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { compose, isNil, isEmpty } from 'lodash';
import withProps from 'utils/withProps';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import DynamicButtons from '_components/DynamicButtons';
import notification from 'utils/notification';
import remoteFun from 'hzero-front/lib/utils/remote';

import { useCreate, useMount } from '@/utils/utils';
import Multiple from '@/components/MultipleTextField';
import { onHandleUpdateResult } from './components/utils';
import { indexDS } from './store/indexDS';
import { indexColumns } from './columns';
import HistoryIndex from './components/History/index';
import ScheduleIndex from './components/Schedule/index';
import { onOpenLinkChange, renderStatus } from './methods';
import {
  fetchNode,
  fetchListNumber,
  fetchUpdate,
  onHandleScheduleRset,
} from '@/services/DeliveryBoardService';
import './index.less';

/**
 * 看板展示数据详细信息
 * @param {[]} cellStructure 自义定渲染
 * cellStructure 参数类型：str、 fun，参数：行数据信息
 * val：当前字段数据，
 * record：当前行信息，
 */
const CellStructure = memo((props) => {
  const { value = {}, record, nodeConfigId = null, nodeConfigName = null } = props;
  const [loading, setloading] = useState(false);
  const [nodeNum, setNum] = useState({
    receivedNum: 0,
    waitCreateNum: 0,
    waitSubmitNum: 0,
    waitConfirmNum: 0,
    confirmedNum: 0,
  });

  /**
   * popverOpen：方法
   * nodeConfig: 当前table行
   * nodeReportList：当前table列，
   */
  const popverOpen = async () => {
    const { fromPoLineLocationId = null } = record.toData();
    try {
      setloading(true);
      const res = await fetchListNumber({ nodeConfigId, poLineLocationId: fromPoLineLocationId });
      if (getResponse(res)) {
        setNum({ ...res });
      }
    } catch (e) {
      throw e;
    } finally {
      setloading(false);
    }
  };

  const content = (
    <Spin spinning={loading}>
      <div className="popver">
        <div className="popver_up">
          <div className="popver_title">{nodeConfigName}</div>
          {/* <div className="icon">
            <Tooltip placement="topRight" title={text}>
              <Icon className="icon_text" type="help" />
            </Tooltip>
          </div> */}
        </div>
        <div style={{ clear: 'both' }} />
        <div className="popver_down">
          <div className="badge">
            <Badge
              className="popver_left_badge"
              status="success"
              text={intl.get('slod.deliveryBoard.view.title.okReceive').d('已接收')}
            />
            <span className="popver_left_text">
              <Tooltip placement="topRight" title={nodeNum?.receivedNum}>
                {nodeNum?.receivedNum}
              </Tooltip>
            </span>
          </div>
          <div className="badge">
            <Badge
              className="popver_left_badge"
              status="success"
              text={intl.get('slod.deliveryBoard.view.title.okAffirm').d('已确认')}
            />
            <span className="popver_left_text">
              <Tooltip placement="topRight" title={nodeNum?.confirmedNum}>
                {nodeNum?.confirmedNum}
              </Tooltip>
            </span>
          </div>
          <div className="badge">
            <Badge
              className="popver_left_badge"
              status="warning"
              text={intl.get('slod.deliveryBoard.view.title.waitAffirm').d('待确认')}
            />
            <span className="popver_left_text">
              <Tooltip placement="topRight" title={nodeNum?.waitConfirmNum}>
                {nodeNum?.waitConfirmNum}
              </Tooltip>
            </span>
          </div>
          <div className="badge">
            <Badge
              className="popver_left_badge"
              status="warning"
              text={intl.get('slod.deliveryBoard.view.title.waitSubmit').d('待提交')}
            />
            <span className="popver_left_text">
              <Tooltip placement="topRight" title={nodeNum?.waitSubmitNum}>
                {nodeNum?.waitSubmitNum}
              </Tooltip>
            </span>
          </div>
          <div className="badge">
            <Badge
              className="popver_left_badge"
              status="default"
              text={intl.get('slod.deliveryBoard.view.title.waitCreate').d('待新建')}
            />
            <span className="popver_left_text">
              <Tooltip placement="topRight" title={nodeNum?.waitCreateNum}>
                {nodeNum?.waitCreateNum}
              </Tooltip>
            </span>
          </div>
        </div>
      </div>
    </Spin>
  );
  if (value?.processStatus !== 'NEEDLESS_PROCESS' && !isNil(value.processStatus)) {
    return (
      <>
        <Popover
          className="popver-case"
          content={content}
          placement="topLeft"
          trigger="hover"
          mouseEnterDelay={0.5} // 鼠标移入后延时0.5s显示
          onVisibleChange={() => setTimeout(() => popverOpen(), 500)} // 鼠标移入后延时0.4s查询
        >
          <div style={{ display: 'inline-block', cursor: 'pointer' }}>
            {renderStatus(value?.processStatus, value?.processStatusMeaning)}
          </div>
        </Popover>
      </>
    );
  } else {
    return (
      <span>
        {renderStatus(
          `${value?.processStatus || 'NEEDLESS_PROCESS'}`,
          `${value?.processStatusMeaning ||
            intl.get('slod.deliveryBoard.view.title.noRequired').d('无需执行')}`
        )}
      </span>
    );
  }
});

const DeliveryBoard = (props) => {
  const { tableConfigRef, customizeBtnGroup, customizeTable, remote } = props;
  const Modal = useModal();

  const [nodeColumns, setState] = useState([]);
  const [loading, setSetLoading] = useState(false);
  const inputRef = useRef();

  const text = (
    <div>
      <div className="text">
        {intl
          .get('slod.deliveryBoard.model.common.receiveStatus')
          .d('已接收：单据上的接收&无需回写单据上的初始化接收占用')}
      </div>
      <div className="text">
        {intl
          .get('slod.deliveryBoard.model.common.affirmStatus')
          .d('已确认：状态为已确认的状态行数量')}
      </div>
      <div className="text">
        {intl
          .get('slod.deliveryBoard.model.common.affirmWait')
          .d('待确认：已提交但未确认的单据行数量')}
      </div>
      <div className="text">
        {intl
          .get('slod.deliveryBoard.model.common.submitmWait')
          .d('待提交：已创建但未提交的单据行数量')}
      </div>
      <div className="text">
        {intl.get('slod.deliveryBoard.model.common.createWait').d('待新建：未创建的来源单据行数量')}
      </div>
    </div>
  );

  useCreate(() => {
    tableConfigRef.columns = indexColumns();
    tableConfigRef.dataSet = new DataSet(indexDS('fromPoLineLocationId'));
    tableConfigRef.dataSet.setQueryParameter('params', tableConfigRef.query);
    props.tableConfigRef.dataSet.setQueryParameter(
      'customizeUnitCode',
      'SLOD.DELIVERY_BOARD.SEARCH_'
    );
  });

  useMount(() => {
    fetchNode().then((res) => {
      if (getResponse(res)) {
        const newColumn = [];
        res.content.forEach((item, index) => {
          const { nodeConfigName, nodeConfigId } = item;
          tableConfigRef.dataSet.addField(nodeConfigName, {
            name: nodeConfigName,
            type: 'string',
            label: nodeConfigName,
            nodeId: nodeConfigId,
            help: text,
          });
          const _object = {
            name: nodeConfigName,
            width: 165,
            isStdDynamic: false,
            dynamicIndex: index + 9,
            renderer: ({ value, name, record }) => {
              const paramsProps = {
                name,
                value,
                record,
                nodeConfigId,
                nodeConfigName,
                nodeConfig: res?.content,
              };
              return <CellStructure {...paramsProps} />;
            },
          };
          newColumn.push(_object);
        });
        const column = tableConfigRef.columns.concat(
          newColumn,
          {
            name: 'strategyName',
            width: 180,
            renderer: ({ value, record }) => value && `${record.get('strategyCode')}-${value}`,
          },
          {
            name: 'trxStrategyName',
            width: 120,
            renderer: ({ value, record }) => value && `${record.get('trxStrategyCode')}-${value}`,
          },
          {
            name: 'syncStatusMeaning',
            width: 180,
            renderer: ({ value, record }) => onHandleUpdateResult(value, record.get('syncStatus')),
          },
          {
            name: 'syncMsg',
            width: 120,
          },
          {
            name: 'createResult',
            width: 100,
            renderer: ({ record }) => (
              <a onClick={() => onOpenLinkChange({ initLinkId: record?.get('initLinkId') })}>
                {intl.get('hzero.common.button.look').d('查看')}
              </a>
            ),
          }
        );
        setState(column);
      }
    });
  });

  const handleQuery = ({ params = {} }) => {
    const clearParams = {}; // 清理
    const { state: { _back } = {} } = location;
    // eslint-disable-next-line no-unused-expressions
    const dataObj = props.tableConfigRef.dataSet.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (!['deliveryHeaderAndLineNums'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    // eslint-disable-next-line no-unused-expressions
    props.tableConfigRef.dataSet.queryDataSet.current
      ? props.tableConfigRef.dataSet.queryDataSet.current.set({
          ...params,
          ...clearParams,
        })
      : props.tableConfigRef.dataSet.queryDataSet.loadData([
          {
            ...params,
            ...clearParams,
          },
        ]);
    if (_back === -1) {
      props.tableConfigRef.dataSet.query(props.tableConfigRef.dataSet.currentPage);
    } else {
      props.tableConfigRef.dataSet.query();
    }
  };

  const handleupdateList = async (selected) => {
    setSetLoading(true);
    const data = selected.map((item) => item.toData());
    const fromPoLineLocationIds = data.map((item) => item.fromPoLineLocationId);
    try {
      const res = await fetchUpdate(fromPoLineLocationIds);
      if (getResponse(res)) {
        setSetLoading(false);
        deleteCache();
        notification.success({
          message: intl
            .get('slod.deliveryBoard.view.button.messageUpdate')
            .d('数据已提交更新程序，更新结果请点击【策略更新记录】进行查看。'),
        });
        tableConfigRef.dataSet.query();
      }
    } catch (e) {
      throw e;
    } finally {
      setSetLoading(false);
    }
  };

  const handleHistoryList = useCallback(() => {
    const modal = Modal.open({
      drawer: true,
      closable: true,
      title: intl.get('slod.deliveryBoard.view.button.historyUpdate').d('策略更新记录'),
      style: { width: '1090px' },
      children: <HistoryIndex />,
      footer: (
        <Button color="primary" onClick={() => modal.close()}>
          {intl.get('hzero.common.status.closed').d('关闭')}
        </Button>
      ),
    });
  }, [Modal]);

  const handleScheduleOption = useCallback(() => {
    const modal = Modal.open({
      drawer: true,
      closable: true,
      title: intl.get('slod.deliveryBoard.view.button.scheduleoption').d('发货进度重置记录'),
      style: { width: '742px' },
      children: <ScheduleIndex />,
      footer: (
        <Button color="primary" onClick={() => modal.close()}>
          {intl.get('hzero.common.status.closed').d('关闭')}
        </Button>
      ),
    });
  }, [Modal]);

  const deleteCache = () => {
    const currentDs = props.tableConfigRef?.dataSet;
    currentDs.clearCachedSelected(); // 初始化时清除缓存的勾选记录
    currentDs.unSelectAll(); // 初始化时清除缓存的勾选记录
  };

  const handleScheduleRset = async (selected) => {
    try {
      setSetLoading(true);
      const data = selected?.map((item) => item.toData()) || [];
      const fromPoLineLocationIds = data.map((item) => item.fromPoLineLocationId);
      const res = await onHandleScheduleRset(fromPoLineLocationIds);
      if (getResponse(res)) {
        deleteCache();
        notification.success();
        tableConfigRef.dataSet.query();
      }
    } finally {
      setSetLoading(false);
    }
  };

  const buttons = () => {
    const Buttons = observer(({ dataSet }) => {
      const btns = [
        {
          name: 'updateBtn',
          btnType: 'c7n-pro',
          child: intl.get('slod.deliveryBoard.view.button.updateBtn').d('更新发/收货策略'),
          btnProps: {
            color: 'primary',
            icon: 'flip_camera_android',
            onClick: () => handleupdateList(dataSet?.selected),
            disabled: isEmpty(dataSet?.selected),
          },
        },
        {
          name: 'historyUpdate',
          btnType: 'c7n-pro',
          child: intl.get('slod.deliveryBoard.view.button.historyUpdate').d('策略更新记录'),
          btnProps: {
            // type: 'c7n-pro',
            funcType: 'flat',
            icon: 'history_toggle_off',
            onClick: () => handleHistoryList(),
          },
        },
        {
          name: 'scheduleRset',
          btnType: 'c7n-pro',
          child: intl.get('slod.deliveryBoard.view.button.scheduleRset').d('删除发货单'),
          btnProps: {
            funcType: 'flat',
            icon: 'autorenew',
            disabled: isEmpty(dataSet?.selected),
            onClick: () => handleScheduleRset(dataSet?.selected),
          },
        },
        {
          name: 'scheduleOption',
          btnType: 'c7n-pro',
          child: intl.get('slod.deliveryBoard.view.button.scheduleoption').d('发货单删除记录'),
          btnProps: {
            funcType: 'flat',
            icon: 'assignment',
            onClick: () => handleScheduleOption(),
          },
        },
      ];
      return customizeBtnGroup(
        { code: `SLOD.DELIVERY_BOARD.BTNS`, pro: true },
        <DynamicButtons buttons={btns.filter((i) => !i.hidden)} />
      );
    });
    return [<Buttons dataSet={tableConfigRef.dataSet} />];
  };

  return (
    <Fragment>
      <Header title={intl.get('slod.deliveryBoard.view.title.deliveryBoard').d('发货执行看板')}>
        {buttons()}
      </Header>
      <Content>
        <Spin spinning={loading || false}>
          <div style={{ height: 'calc(100vh - 200px)' }}>
            {customizeTable(
              {
                code: `SLOD.DELIVERY_BOARD.LIST`,
                __force_record_to_update__: true,
              },
              <SearchBarTable
                boxSizing="wrapper"
                style={{ maxHeight: `calc(100% - 22px)` }}
                searchCode="SLOD.DELIVERY_BOARD.SEARCH_"
                dataSet={tableConfigRef.dataSet}
                columns={
                  remote
                    ? remote.process('SLOD_DELIVERY_BOARD_PROCESS_COLUMNS', nodeColumns, { props })
                    : nodeColumns
                }
                cacheState
                searchBarConfig={{
                  fieldProps: {
                    itemCode: { lovPara: { tenantId: getCurrentOrganizationId() } },
                    tempKey: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  },
                  onReset: () => {
                    if (inputRef.current) inputRef.current.handleClear();
                  },
                  onClear: () => {
                    if (inputRef.current) inputRef.current.handleClear();
                  },
                  onQuery: handleQuery,
                  left: {
                    render: () => (
                      <Multiple
                        name="deliveryHeaderAndLineNums"
                        dataSet={tableConfigRef.dataSet}
                        onRef={(node) => {
                          inputRef.current = node;
                        }}
                        placeholder={intl
                          .get('slod.deliveryBoard.model.common.fromDisplayOrderNum')
                          .d('请输入来源订单号查询')}
                      />
                    ),
                  },
                }}
              />
            )}
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  WithCustomize({
    unitCode: ['SLOD.DELIVERY_BOARD.BTNS', 'SLOD.DELIVERY_BOARD.LIST'],
    queryMethod: 'POST',
  }),
  formatterCollections({
    code: ['hzero.common', 'slod.deliveryBoard', 'slod.common'],
  }),
  withProps(
    () => {
      return {
        tableConfigRef: { dataSet: new DataSet(), columns: {}, query: {} },
      };
    },
    { cacheState: true },
    { cacheKey: '/slod/delivery-board/list' }
  ),
  remoteFun({
    code: 'SLOD_DELIVERY_BOARD',
    name: 'remote',
  })
)(DeliveryBoard);
