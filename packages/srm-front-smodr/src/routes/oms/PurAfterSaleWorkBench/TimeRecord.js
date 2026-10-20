import React from 'react';
import { Timeline, Tooltip, Icon, Tabs } from 'choerodon-ui';
import { Modal, Spin, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import { getCurrentOrganizationId } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';
import intl from 'utils/intl';
import ApproveRecord from '_components/ApproveRecord';
import { dateTimeRender } from 'utils/renderer';

const organizationId = getCurrentOrganizationId();

const TimeRecord = observer((props) => {
  const { dataSet } = props;
  const content = dataSet.toData();

  const iconType = (item) => {
    const { newMessageCode } = item || {};
    if ([
      's2ful.new.srm.after.return.creation.success',
      's2ful.new.srm.after.return.creation.failed',
      's2ful.new.after.create',
    ].includes(newMessageCode)) {
      return 'add';
    }
    else if (newMessageCode === 's2ful.new.after.return.transaction.creation') {
      return 'publish2';
    }
    else if (
      ['s2ful.new.internal.after.apply', 's2ful.new.after.apply'].includes(newMessageCode)
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
      ].includes(newMessageCode)
    ) {
      return 'authorize';
    } else if (
      [
        's2ful.new.ec.after.receive.ok',
        's2ful.new.ec.after.receive.ok.with.child.order',
        's2ful.new.after.receive.ok',
        's2ful.new.after.finish',
      ].includes(newMessageCode)
    ) {
      return 'check_circle';
    } else if (['s2ful.new.after.sent', 's2ful.new.ec.after.waybill.submit'].includes(newMessageCode)) {
      return 'local_shipping';
    } else if (
      ['s2ful.ec.after.waybill.submit',
        's2ful.new.after.return.waybill',
      ].includes(newMessageCode)
    ) {
      return 'mode_edit';
    } else if (
      [
        's2ful.new.after.cancel',
        's2ful.new.after.receive.failed',
        's2ful.new.ec.after.receive.failed',
      ].includes(newMessageCode)
    ) {
      return 'cancel';
    }
  };

  const lineColor = (item = {}) => {
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
        's2ful.new.srm.after.return.creation.failed',
      ].includes(item?.newMessageCode)
    ) {
      return '#F56649'; // 失败
    } else {
      return '#E5E5E5';
    }
  };

  return (
    <Spin dataSet={dataSet}>
      <Timeline>
        {content?.map((item) => {
          const { description, lastUpdateDate = '', supplierCompanyName } = item;
          return (
            <Timeline.Item style={{ paddingBottom: '12px' }} color={lineColor(item)}>
              <div style={{ display: 'flex' }}>
                <div>
                  <Icon
                    type={iconType(item)}
                    style={{
                      top: '0px',
                      fontSize: '14px',
                      marginRight: '12px',
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
                  <div
                    style={{ position: 'relative', top: 1 }}
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                </Tooltip>
              </div>
              <div
                style={{
                  margin: '8px 0 0px 32px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #EBEBEB',
                  color: 'rgba(0,0,0,0.45)',
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

export default function openRecords(afterSaleId, approveRecord) {
  const ds = new DataSet({
    autoQuery: false,
    paging: false,
    transport: {
      read: { url: `${SMALL_ORDER}/v1/${organizationId}/after-sale-records`, method: 'GET' },
    },
  });
  ds.setQueryParameter('afterSaleId', afterSaleId);
  ds.setQueryParameter('operationType', 'AFTER');
  ds.query();
  Modal.open({
    title: intl.get('smodr.common.view.operateRecord').d('操作记录'),
    mask: true,
    drawer: true,
    destroyOnClose: true,
    style: { width: 750 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children:
      (
        <>
          {approveRecord.length > 0 ?
            (
              <Tabs>
                <Tabs.TabPane
                  tab={intl.get('smodr.common.view.operateRecord').d('操作记录')}
                  key={0}
                >
                  <div style={{ marginTop: '8px' }}>
                    <TimeRecord dataSet={ds} />
                  </div>
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get('smodr.common.view.approveRecord').d('审批记录')}
                  key={1}
                >
                  <ApproveRecord data={approveRecord} />
                </Tabs.TabPane>
              </Tabs>
            )
            : <TimeRecord dataSet={ds} />}
        </>
      ),
  });
}
