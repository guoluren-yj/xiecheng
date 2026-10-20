import React, { useMemo, Fragment, useEffect } from 'react';
import { DataSet, Output, Spin } from 'choerodon-ui/pro';
import { Tabs, Icon, Popover, Steps } from 'choerodon-ui';
import { TabsPosition } from 'choerodon-ui/lib/tabs/enum';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import { observer } from 'mobx-react';
import { isObject, isEmpty, isNil } from 'lodash';

import intl from 'utils/intl';

import { depositRefundProgressDS } from './storeDS';
import StatusTag from '../../../Components/StatusTag';
import styles from './index.less';

// 场景：保证金A—>保证金B，列表查询保证金A的退款状态

// 1.未退款：保证金转服务费金额、保证金转服务费金额、保证金已转出金额均为0时展示
// 2.退回供应商{保证金已退回金额}：「保证金已退回金额！=0」时展示，查询对应保证金编号A的《支付记录表》，其中「支付方式=退回供应商（外部系统）、退回供应商（手工缴纳确认）」的记录
// 序号展示表中序号，即列表展示的序号可能非连号
//   2.1 已提交
//   2.2 审批中：根据审批方式=工作流时展示
//   2.3 外部系统退款中：根据是「退回供应商是否同步外部系统=是」展示
//   2.4 已失效（审批拒绝、外部系统退款失败）
//   2.5 已完成
//   其中2.4、2.5均为最后节点，未到时默认展示已完成，进行节点通过表中存的数据判断

// 3.转保证金{保证金已转出金额}：「保证金已转出金额！=0」时展示，查询对应保证金编号A的《转出记录表》，其中「转出单据类型=保证金」且无对应退回记录的「转出类型=缴纳」的净值记录（100、-100、200，仅展示200这一条记录）
// 序号展示「转出类型=缴纳」的序号，即列表展示的序号可能非连号
//   3.1 已提交
//   3.2 审批中：根据审批方式=工作流时展示
//   3.3 已失效（审批拒绝）
//   3.4 已完成
//   其中2.3、2.4均为最后节点，未到时默认展示已完成，进行节点通过表中存的数据判断

// 4.转服务费{保证金转服务费金额}：「保证金转服务费金额！=0」时展示，查询对应保证金编号A的《转出记录表》，其中「转出单据类型=服务费」且无对应退回记录的「转出类型=缴纳」的净值记录（100、-100、200，仅展示200这一条记录）
// 序号展示「转出类型=缴纳」的序号，即列表的序号可能非连号
//   4.1 已提交
//   4.2 审批中：根据审批方式=工作流时展示
//   4.3 已失效（审批拒绝）
//   4.4 已完成
//   其中2.3、2.4均为最后节点，未到时默认展示已完成，进行节点通过表中存的数据判断

export type RefundAction = 'NO_REFUND' | 'TRANSFER_DEPOSIT' | 'TRANSFER_SERVER_FEES' | 'RETURN_SUPPLIER';

type ColorType = 'GREY' | 'YELLOW' | 'GREEN';

const colorMap: Record<ColorType, string> = {
  GREY: "info",
  YELLOW: "warn",
  GREEN: "success",
};

const { Step } = Steps;
const { TabPane } = Tabs;

interface DepositRefundProgressProps {
  text: string,
  depositId: string | number,
  refundAction: RefundAction,
  amountFieldName: string,
  depositVersionNumber: number,
};

interface TabPaneContentProps extends DepositRefundProgressProps {
  record: DSRecord | undefined,
};

const iconList = [
  'check_circle',
  'wait_two_b',
  'wait_three_b',
  'wait_four_b',
];

const TabPaneContent = (props: TabPaneContentProps) => {

  const { record, text, refundAction } = props;

  const recordStatusField = refundAction === 'RETURN_SUPPLIER' ? 'depositPayRecordStatus' : 'depositTransferRecordStatus';
  const {
    syncMode,
    approveMode,
    [recordStatusField]: recordStatus,
  } = record?.get(['syncMode', 'approveMode', recordStatusField]) || {};

  const finishFlag = ['EFFECTIVE', 'APPROVE_INVALID', 'EXTERNAL_SYSTEM_INVALID'].includes(recordStatus);

  const stepList = useMemo<Record<string, any>[]>(() => {
    return [
      {
        statusCode: 'SUBMITED',
        statusName: intl.get('ssta.common.view.message.submited').d('已提交'),
        showFlag: true,
        currentFlag: recordStatus === 'SUBMITED',
      },
      {
        statusCode: 'APPROVING',
        statusName: intl.get('ssta.common.view.message.approving').d('审批中'),
        showFlag: approveMode === 'WORKFLOW',
        currentFlag: recordStatus === 'APPROVING',
      },
      {
        statusCode: 'EXTERNAL_SYSTEM_REFUNDING',
        statusName: intl.get('ssta.common.view.message.externalSystemRefunding').d('外部系统退款中'),
        showFlag: syncMode === 'EXTERNAL_SYSTEM' && refundAction === 'RETURN_SUPPLIER',
        currentFlag: recordStatus === 'EXTERNAL_SYSTEM_REFUNDING',
      },
      {
        statusCode: 'EFFECTIVE',
        statusName: intl.get('ssta.common.view.message.completed').d('已完成'),
        // 退回供应商已完成状态包含转出已完成状态，不做区分
        showFlag: recordStatus === 'EFFECTIVE' || !['EFFECTIVE', 'APPROVE_INVALID', 'EXTERNAL_SYSTEM_INVALID'].includes(recordStatus),
        currentFlag: recordStatus === 'EFFECTIVE',
      },
      {
        statusCode: 'INVALID',
        statusName: intl.get('ssta.common.view.message.expired').d('已失效'),
        // 退回供应商已失效状态包含转出已失效状态，不做区分
        showFlag: ['APPROVE_INVALID', 'EXTERNAL_SYSTEM_INVALID'].includes(recordStatus),
        currentFlag: ['APPROVE_INVALID', 'EXTERNAL_SYSTEM_INVALID'].includes(recordStatus),
      },
    ].filter(({ showFlag }) => Boolean(showFlag));
  }, [syncMode, approveMode, refundAction, recordStatus]);

  const currentStep = useMemo(() => {
    const currentIndex = stepList.findIndex(({ currentFlag }) => Boolean(currentFlag));
    return finishFlag ? currentIndex + 1 : currentIndex;
  }, [stepList, finishFlag]);

  if (!record) return <Spin />;

  return (
    <Fragment>
      <div className='refund-progress-bar'>
        <div className="refund-progress-bar-left">
          <Icon type="alt_route-o" className={`refund-progress-bar-icon refund-progress-bar-icon-${finishFlag ? 'finish' : 'progress'}`} />
          <span className="refund-progress-bar-title">
            {text + intl.get('ssta.sourcingCost.view.message.amount').d('金额')}
          </span>
        </div>
        <div className="refund-progress-bar-right">
          <Output name="amount" record={record} />
        </div>
      </div>
      <div className='refund-progress-panel-wrapper'>
        <Steps size="small" direction="vertical" current={currentStep}>
          {stepList.map((item, index) => {
            const { statusCode, statusName } = item;
            return (
              <Step key={statusCode} icon={iconList[index]} title={statusName} />
            );
          })}
        </Steps>
      </div>
    </Fragment>
  );
};

const DepositRefundProgress = observer((props: DepositRefundProgressProps) => {
  const { refundAction, depositId, depositVersionNumber } = props;

  const depositRefundProgressDs = useMemo(() => new DataSet(depositRefundProgressDS({ refundAction, depositId })), [refundAction, depositId]);

  useEffect(() => {
    if (isNil(depositVersionNumber)) return;
    depositRefundProgressDs.query();
  }, [depositVersionNumber, depositRefundProgressDs]);

  return (
    <div className={styles['refund-progress-warpper']}>
      {depositRefundProgressDs.length > 1 ? (
        <Tabs tabPosition={TabsPosition.left}>
          {depositRefundProgressDs.map((record) => {
            const lineNum = record?.get('lineNum');
            return (
              <TabPane tab={`#${lineNum}`} key={lineNum}>
                <TabPaneContent record={record} {...props} />
              </TabPane>
            );
          })}
        </Tabs>
      ) : (
        <TabPaneContent key={depositRefundProgressDs.current?.get('lineNum')} record={depositRefundProgressDs.current} {...props} />
      )}
    </div>
  );
});

export const depositRefundProgressRender = (depositRecord: DSRecord | null | undefined) => {
  // 1、未退款：保证金转服务费金额、保证金转服务费金额、保证金已转出金额均为0时展示
  // 2、退回供应商{保证金已退回金额}：「保证金已退回金额！=0」时展示
  // 3、转保证金{保证金已转出金额}：「保证金已转出金额！=0」时展示
  // 4、转服务费{保证金转服务费金额}：「保证金转服务费金额！=0」时展示
  const {
    depositId,
    refundStatus: refundActionMap,
    objectVersionNumber: depositVersionNumber,
  } = depositRecord?.get(['depositId', 'refundStatus', 'objectVersionNumber']) || {};
  if (!isObject(refundActionMap)) return null;
  const tagList = [
    {
      refundAction: 'NO_REFUND',
      text: intl.get('ssta.sourcingCost.view.message.noRefund').d('未退款'),
    },
    {
      refundAction: 'RETURN_SUPPLIER',
      text: intl.get('ssta.sourcingCost.view.message.returnSupplier').d('退回供应商'),
    },
    {
      refundAction: 'TRANSFER_DEPOSIT',
      text: intl.get('ssta.sourcingCost.view.message.transferDeposit').d('转保证金'),
    },
    {
      refundAction: 'TRANSFER_SERVER_FEES',
      text: intl.get('ssta.sourcingCost.view.message.transferServiceFee').d('转服务费'),
    },
  ].reduce((previousValue: any[], currentValue: any) => {
    const { refundAction } = currentValue;
    const colorType = refundActionMap[refundAction];
    // refundActionMap 如果存在对应的操作类型，就展示tag
    if (colorType) {
      return [
        ...previousValue,
        {
          ...currentValue,
          color: colorMap[colorType],
          popoverContent: colorType === 'GREY'
            ? null
            : <DepositRefundProgress depositId={depositId} depositVersionNumber={depositVersionNumber} {...currentValue} />,
        },
      ];
    } else return previousValue;
  }, []);
  return (
    <Fragment>
      {tagList.map(item => {
        const { color, text, popoverContent } = item as any;
        return popoverContent ? (
          <Popover
            key={text}
            content={popoverContent}
            overlayClassName={styles['ssta-refund-popover-sourcingCost']}
          >
            <StatusTag icon="alt_route-o" color={color} text={text} />
          </Popover>
        ) : (
          <StatusTag key={text} color={color} text={text} />
        );
      })}
      {isEmpty(tagList) && '-'}
    </Fragment>
  );
};

export default DepositRefundProgress;