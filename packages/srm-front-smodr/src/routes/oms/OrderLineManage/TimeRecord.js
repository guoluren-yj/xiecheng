import React from 'react';
import { observable } from 'mobx';
import { Timeline, Tooltip, Icon } from 'choerodon-ui';
import { Modal, Spin, DataSet, Tabs } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Observer } from 'mobx-react';

import intl from 'utils/intl';
import ApproveRecord from '_components/ApproveRecord';
import EmotionFill from '@/routes/components/EmotionFill';
import { dateTimeRender } from 'utils/renderer';

// const organizationId = getCurrentOrganizationId();

const TimeRecord = observer((props) => {
  const { dataSet, operationType = '', activeKey } = props;
  const content = dataSet.toData();

  const iconType = (item = {}) => {
    if (operationType === 'APPROVE') {
      if (item?.messageCode === 's2ful.approving') {
        return 'check';
      } else if (item?.messageCode === 's2ful.approve.withdraw') {
        return 'reply';
      } else {
        return 'authorize';
      }
    } else if (operationType === 'PREEMPT') {
      if (
        [
          's2ful.preempt.failed',
          's2ful.preempt.success.not.confirmed',
          's2ful.preempt.success.to.be.confirmed',
        ].includes(item?.messageCode)
      ) {
        return 'relation';
      } else if (
        ['s2ful.srm.order.cancel', 's2ful.preempt.failed.confirmed'].includes(item?.messageCode)
      ) {
        return 'cancel';
      } else {
        return 'check_circle';
      }
    } else if (operationType === 'CONSIGNMENT') {
      if (
        [
          's2ful.ec.consignment.completed',
          's2ful.consignment.completed',
          's2ful.delivery.send.to.srm',
          's2ful.consignment.send.to.srm',
        ].includes(item?.messageCode)
      ) {
        return 'publish2';
      } else if (
        ['s2ful.consignment.delivery.success', 's2ful.consignment.delivery.failed'].includes(
          item?.messageCode
        )
      ) {
        return 'how_to_vote-o';
      } else if (['s2ful.consignment.cancel', 's2ful.consignment.cancel.by.srm.order.cancel'].includes(item?.messageCode)) {
        return 'cancel';
      } else if (
        ['s2ful.ec.consignment.creation.success', 's2ful.ec.consignment.creation.error'].includes(
          item?.messageCode
        )
      ) {
        return 'add';
      } else if (
        ['s2ful.ec.consignment.delivery.error', 's2ful.ec.consignment.delivery.success'].includes(
          item?.messageCode
        )
      ) {
        return 'move_to_inbox';
      } else if(['s2ful.consignment.update'].includes(item?.messageCode)){
        return "autorenew";
      } else {
        return 'not_interested';
      }
    } else if (operationType === 'RECEIPT') {
      if (
        ['s2ful.receipt.creation.success', 's2ful.receipt.creation.error'].includes(
          item?.messageCode
        )
      ) {
        return 'add';
      } else if(["s2ful.receipt.workflow.approve.mall", "s2ful.receipt.workflow.reject.mall"].includes(item?.messageCode)){
        return 'authorize';
      } else if(["s2ful.receipt.submit.mall"].includes(item?.messageCode)){
        return 'done';
      } else if(["s2ful.receipt.send.to.srm"].includes(item?.messageCode)){
        return 'publish2';
      } else if(["s2ful.receipt.workflow.withdraw.mall"].includes(item?.messageCode)){
        return 'reply';
      } else if(["s2ful.receipt.cancel.mall"].includes(item?.messageCode)){
        return 'cancel';
      } else {
        return 'move_to_inbox';
      }
    } else if (operationType === 'STATEMENT') {
      if (item?.messageCode === 's2ful.statement.different') {
        return 'record_test';
      } else if (item?.messageCode === 's2ful.statement.completed') {
        return 'check_circle';
      } else if (item?.messageCode === 's2ful.statement.close') {
        return 'cancel';
      } else if(item?.messageCode === 's2ful.statement.different.close'){
        return 'not_interested';
      } else {
        return 'publish2';
      }
    } else if (operationType === 'AFTER') {
      if ([
        's2ful.new.srm.after.return.creation.success',
        's2ful.new.srm.after.return.creation.failed',
        's2ful.new.after.create',
      ].includes(item?.newMessageCode)) {
        return 'add';
      }else if (
        ['s2ful.new.internal.after.apply', 's2ful.new.after.apply', ''].includes(
          item?.newMessageCode
        )
      ) {
        return 'check';
      } else if (
        [
          's2ful.new.internal.after.approve.ok',
          's2ful.new.internal.after.approve.failed',
          's2ful.new.ec.after.approve.ok',
          's2ful.new.after.approve.ok',
          's2ful.new.ec.after.approve.failed',
          's2ful.new.after.approve.failed',
        ].includes(item?.newMessageCode)
      ) {
        return 'authorize';
      } else if (
        [
          's2ful.new.ec.after.receive.ok',
          's2ful.new.after.receive.ok',
          's2ful.new.after.finish',
        ].includes(item?.newMessageCode)
      ) {
        return 'check_circle';
      } else if (['s2ful.new.after.sent', 's2ful.new.ec.after.waybill.submit'].includes(item?.newMessageCode)) {
        return 'local_shipping';
      } else if (
        ['s2ful.ec.after.waybill.submit', 's2ful.new.after.return.waybill'].includes(
          item?.newMessageCode
        )
      ) {
        return 'mode_edit';
      } else if (
        ['s2ful.return.send.to.srm', 's2ful.receipt.send.to.srm', 's2ful.new.ec.after.receive.ok.with.child.order', 's2ful.new.after.return.transaction.creation'].includes(item?.newMessageCode)
      ) {
        return 'publish2';
      } else {
        return 'cancel';
      }
    } else if (operationType === 'CANCEL') {
      if (['s2ful.preempt.cancel', 's2ful.preempt.cancel.reject'].includes(item?.messageCode)) {
        return 'authorize';
      } else {
        return 'cancel';
      }
    } else if (operationType === 'PAYMENT') {
      return 'account_balance_wallet-o';
    } else if (operationType === 'REFUND') {
      return 'reply';
    } else if (operationType === 'INVOICE') { // 开票
      if(['s2ful.invoice.cancel', 's2ful.invoice.cancel.cata', 's2ful.invoice.exception.to.mall'].includes(item.messageCode)) {
        return 'cancel';
      } else if(['s2ful.invoice.pass', 's2ful.invoice.reject', 's2ful.invoice.pass.cata'].includes(item.messageCode)) {
        return 'authorize';
      } else if(['s2ful.invoice.pass.to.srm', 's2ful.invoice.reject.to.srm'].includes(item.messageCode)) {
        return 'publish2';
      } else if(item.messageCode === 's2ful.invoice.success.to.mall') {
        return 'check_circle';
      } else return 'check';
    }
  };

  const lineColor = (item = {}) => {
    if (operationType === 'APPROVE') {
      if (item?.messageCode === 's2ful.approve.pass') {
        return '#47B881'; // 绿
      } else if (item?.messageCode === 's2ful.approve.reject') {
        return '#F56649';
      } else {
        return '#E5E5E5';
      }
    } else if (operationType === 'PREEMPT') {
      if (
        [
          's2ful.preempt.success.not.confirmed',
          's2ful.ec.preempt.success.confirmed',
          's2ful.preempt.success.confirmed',
        ].includes(item?.messageCode)
      ) {
        return '#47B881'; // 绿
      } else if (
        ['s2ful.preempt.failed', 's2ful.preempt.failed.confirmed'].includes(item?.messageCode)
      ) {
        return '#F56649';
      } else {
        return '#E5E5E5';
      }
    } else if (operationType === 'CONSIGNMENT') {
      if (
        [
          's2ful.consignment.delivery.success',
          's2ful.ec.consignment.creation.success',
          's2ful.ec.consignment.delivery.success',
        ].includes(item?.messageCode)
      ) {
        return '#47B881'; // 绿
      } else if (
        [
          's2ful.consignment.delivery.failed',
          's2ful.ec.consignment.creation.error',
          's2ful.ec.consignment.delivery.error',
        ].includes(item?.messageCode)
      ) {
        return '#F56649';
      } else {
        return '#E5E5E5';
      }
    } else if (operationType === 'RECEIPT') {
      if (['s2ful.receipt.workflow.approve.mall', 's2ful.receipt.creation.success'].includes(item?.messageCode)) {
        return '#47B881'; // 绿
      } else if (['s2ful.receipt.workflow.reject.mall', 's2ful.receipt.creation.error'].includes(item?.messageCode)) {
        return '#F56649';
      }
      return '#E5E5E5';
    } else if (operationType === 'STATEMENT') {
      if (item?.messageCode === 's2ful.statement.completed') {
        return '#47B881'; // 绿
      } else if (item?.messageCode === 's2ful.statement.close') {
        return '#F56649';
      } else {
        return '#E5E5E5';
      }
    } else if (operationType === 'AFTER') {
      if (
        [
          's2ful.new.internal.after.approve.ok',
          's2ful.new.ec.after.approve.ok',
          's2ful.new.after.approve.ok',
        ].includes(item?.newMessageCode)
      ) {
        return '#47B881'; // 绿
      } else if (
        [
          's2ful.new.internal.after.approve.failed',
          's2ful.new.ec.after.approve.failed',
          's2ful.new.after.approve.failed',
          's2ful.new.ec.after.receive.failed',
          's2ful.new.after.receive.failed',
        ].includes(item?.newMessageCode)
      ) {
        return '#F56649';
      } else {
        return '#E5E5E5';
      }
    } else if (operationType === 'CANCEL') {
      if (item?.messageCode === 's2ful.preempt.cancel') {
        return '#47B881'; // 绿
      } else if (
        [
          's2ful.preempt.cancel.failed.ec',
          's2ful.preempt.cancel.failed',
          's2ful.preempt.cancel.reject',
        ].includes(item?.messageCode)
      ) {
        return '#F56649';
      } else {
        return '#E5E5E5';
      }
    } else if (operationType === 'PAYMENT') {
      if (item?.messageCode === 's2ful.payment.success') {
        return '#47B881';
      } else {
        return '#F56649';
      }
    } else if (operationType === 'REFUND') {
      if (item?.messageCode === 's2ful.refund.success') {
        return '#47B881';
      } else {
        return '#F56649';
      }
    }
    else if (operationType === 'INVOICE') { // 开票
      if(['s2ful.invoice.pass', 's2ful.invoice.pass.cata', 's2ful.invoice.success.to.mall'].includes(item?.messageCode)) {
        return '#47B881'; // 绿
      }
      else if(['s2ful.invoice.reject', 's2ful.invoice.exception.to.mall'].includes(item?.messageCode)) return '#F56649'; // 红
      else return '#E5E5E5';
    }
  };
  return (
    <Spin dataSet={dataSet}>
      <Timeline>
        {content?.map((item) => {
          const { description, supplierCompanyName, lastUpdateDate = '' } = item;
          return (
            <Timeline.Item style={{ paddingBottom: '12px' }} color={lineColor(item)}>
              <div style={{ display: 'flex', position: 'relative', top: '1px' }}>
                <div>
                  <Icon
                    type={iconType(item)}
                    style={{
                      top: '-1px',
                      fontSize: '14px',
                      marginRight: '16px',
                      marginLeft: '6px',
                      position: 'relative',
                    }}
                  />
                </div>
                <Tooltip
                  theme="dark"
                  title={
                    supplierCompanyName
                      ? `${intl
                        .get('smodr.common.view.supplier')
                        .d('供应商')}：${supplierCompanyName}`
                      : undefined
                  }
                  placement="bottomLeft"
                >
                  {['s2ful.workflow.approve.pass', 's2ful.workflow.approve.reject', 's2ful.receipt.workflow.approve.mall', 's2ful.receipt.workflow.reject.mall'].includes(item.messageCode) ? (
                    <div style={{ cursor: 'pointer' }} onClick={() => activeKey.set('1')} dangerouslySetInnerHTML={{ __html: description }} />
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: description}} />
                  )}
                </Tooltip>
              </div>
              <div
                style={{
                  margin: '8px 0 0px 36px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #E5E7EC',
                  color: '#868D9C',
                }}
              >
                {dateTimeRender(lastUpdateDate)}
              </div>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </Spin>
  );
});

export default function openRecords(props) {
  const activeKey = observable.box('0');
  const handleChangeTab = (tabkey) => activeKey.set(tabkey);
  const { params, url, recordData, approveRecord = [] } = props;
  const ds = new DataSet({
    autoQuery: false,
    paging: false,
    transport: {
      read() {
        return { url, method: 'GET', data: { ...params } };
      },
    },
  });
  ds.query();
  return (
    Modal.open({
      title: intl.get('smodr.common.view.operateRecord').d('操作记录'),
      mask: true,
      drawer: true,
      destroyOnClose: true,
      style: { width: 742 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      okCancel: false,
      children:
        (
          <EmotionFill type='approve' ds={ds}>
            {recordData && approveRecord.length > 0
              ?
              (
                <Observer>
                  {() => (
                    <Tabs defaultActiveKey={activeKey.get()} activeKey={activeKey.get()} onChange={handleChangeTab}>
                      <Tabs.TabPane
                        tab={intl.get('smodr.common.view.operateRecord').d('操作记录')}
                        key='0'
                      >
                        <div style={{ marginTop: '8px' }}>
                          <TimeRecord dataSet={ds} operationType={params?.operationType} activeKey={activeKey} />
                        </div>
                      </Tabs.TabPane>
                      <Tabs.TabPane
                        tab={intl.get('smodr.common.view.approveRecord').d('审批记录')}
                        key='1'
                      >
                        <ApproveRecord data={approveRecord} />
                      </Tabs.TabPane>
                    </Tabs>
                  )}
                </Observer>

              )
              : <TimeRecord dataSet={ds} operationType={params?.operationType} />
            }
          </EmotionFill>

        ),
    })
  );
}
