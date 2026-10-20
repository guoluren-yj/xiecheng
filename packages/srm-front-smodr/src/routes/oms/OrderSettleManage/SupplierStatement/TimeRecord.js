import React from 'react';
import { Timeline, Tooltip, Icon } from 'choerodon-ui';
import { Modal, Spin, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import { getCurrentOrganizationId } from 'utils/utils';
import { SMALL_ORDER } from '_utils/config';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const TimeRecord = observer((props) => {
  const { dataSet } = props;
  const content = dataSet.toData();

  const iconType = (item) => {
    if (
      ['s2ful.new.internal.after.apply', 's2ful.new.after.apply'].includes(item?.newMessageCode)
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
        's2ful.new.ec.after.receive.ok.with.child.order',
        's2ful.new.after.receive.ok',
        's2ful.new.after.finish',
      ].includes(item?.newMessageCode)
    ) {
      return 'check_circle';
    } else if (['s2ful.new.after.sent'].includes(item?.newMessageCode)) {
      return 'local_shipping';
    } else if (
      ['s2ful.ec.after.waybill.submit', 's2ful.new.after.return.waybill'].includes(
        item?.newMessageCode
      )
    ) {
      return 'mode_edit';
    } else if (
      [
        's2ful.new.after.cancel',
        's2ful.new.after.receive.failed',
        's2ful.new.ec.after.receive.failed',
      ].includes(item?.newMessageCode)
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
      ].includes(item?.newMessageCode)
    ) {
      return '#F56649';
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
                {lastUpdateDate}
              </div>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </Spin>
  );
});

export default function openRecords(afterSaleId) {
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
    resizable: true,
    customizable: true,
    destroyOnClose: true,
    style: { width: 750 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: <TimeRecord dataSet={ds} />,
  });
}
