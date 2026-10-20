import React, { useMemo, useCallback, useRef } from 'react';
import { DataSet, Tooltip } from 'choerodon-ui/pro';
// import { Tooltip } from 'choerodon-ui'
import { noop, throttle } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { getQuotationName, BID, INQUIRY } from '@/utils/globalVariable';
import { tableDS } from './tableDS';
import TableContent from './TableContent';
import Style from './index.less';

/**
 * name IP地址属地
 *
 * @param bidFlag boolean | int 0
 * @param record object Record {}
 * @param uiType string h0
 * @param onCancel function noop
 * @param text string | ReactNode
 * @param visibleFlag boolean true 是否显示
 * @param useCuotomFlag boolean true 表格开启个性化
//  * @param purchaserFlag boolean true 采购方标识
 * @buttonProps object {}
 *
 */
const IPAddress = (props = {}) => {
  const {
    bidFlag = 0,
    record = {},
    uiType = 'h0',
    onCancel = noop,
    text = intl.get(`hzero.common.button.view`).d('查看'),
    buttonProps = {},
    visibleFlag = true,
    useCuotomFlag = true,
    customizeTable = noop,
  } = props;

  const tableRef = useRef({});

  const quotationName = getQuotationName(bidFlag);
  const organizationId = getCurrentOrganizationId();
  const categoryCode = bidFlag ? BID : INQUIRY;

  const { quotationHeaderId } = uiType === 'h0' ? record || {} : record?.get(['quotationHeaderId']);

  const tableLineDS = useMemo(
    () =>
      new DataSet(
        tableDS({
          organizationId,
          quotationName,
        })
      ),
    [organizationId, quotationName, categoryCode]
  );

  const unitCode = useMemo(() => `SSRC.${categoryCode}_COMMON.IPADDRESS_TABLE`, [categoryCode]);

  const initPage = useCallback(() => {
    if (!quotationHeaderId) {
      return;
    }

    tableLineDS.setQueryParameter('QUERY', {
      organizationId,
      quotationHeaderId,
      customizeUnitCode: unitCode,
    });

    tableLineDS.query();
  }, [organizationId, quotationHeaderId, unitCode]);

  const rankChartVisibleChange = useCallback(
    throttle(
      (visible) => {
        if (!visible) {
          initPage();
          return;
        }

        // hiddenPopoverContent();
        onCancel();
      },
      [hiddenPopoverContent, quotationHeaderId]
    ),
    1500
  );

  // 内容隐藏
  const hiddenPopoverContent = useCallback(() => {
    tableLineDS.reset();
    tableLineDS.loadData([]);
  }, [tableLineDS, record]);

  const pageContentProps = useMemo(
    () => ({
      tableLineDS,
      ...props,
      quotationHeaderId,
      onRef: tableRef,
      quotationName,
      useCuotomFlag,
      code: `SSRC.${categoryCode}_COMMON.IPADDRESS_TABLE`,
      customizeTable,
    }),
    [bidFlag, categoryCode, tableLineDS, props, quotationName, useCuotomFlag, quotationHeaderId]
  );

  if (!quotationHeaderId) {
    return text || '';
  }

  return visibleFlag ? (
    <Tooltip
      // popupStyle={{ width: '400px', maxHeight: '300px', overflow: 'auto' }}
      popupClassName={Style['ip-address-component-wrap-ssrc']}
      trigger={['hover', 'click']}
      // placement="leftBottom"
      theme="light"
      title={() => <TableContent {...pageContentProps} />}
      onHiddenChange={rankChartVisibleChange}
    >
      <a {...buttonProps}>{text}</a>
    </Tooltip>
  ) : (
    '-'
  );
};

export default observer(IPAddress);
