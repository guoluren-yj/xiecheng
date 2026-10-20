/*
 * @Description:
 * @Date: 2022-08-17 14:56:49
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { getDynamicLabel } from '@/utils/util';

const organizationId = getCurrentOrganizationId();

// 阶梯价格
const ladderQuoteDS = (props) => {
  const { quotationLineId, doubleUnitEnabled } = props;
  return {
    paging: true,
    selection: false,
    autoQuery: true,
    primaryKey: 'rfxLadderLineNum',
    pageSize: 20,
    // table显示的字段
    fields: [
      {
        label: intl.get('spcm.common.model.common.lineNumber').d('行号'),
        name: 'rfxLadderLineNum',
      },
      {
        label: intl.get('spcm.common.model.common.quantityFrom').d('数量从(>=)'),
        name: 'secondaryLadderFrom',
      },
      {
        label: getDynamicLabel(doubleUnitEnabled, 'ladderFrom'),
        name: 'ladderFrom',
      },
      {
        label: intl.get('spcm.common.model.common.quantityTo').d('数量至(<=)'),
        name: 'secondaryLadderTo',
      },
      {
        label: getDynamicLabel(doubleUnitEnabled, 'ladderTo'),
        name: 'ladderTo',
      },
      {
        label: intl.get('spcm.common.model.new.price').d('单价(含税)'),
        name: 'validLadderSecPrice',
      },
      {
        label: getDynamicLabel(doubleUnitEnabled, 'validLadderPrice'),
        name: 'validLadderPrice',
      },
      {
        label: intl.get('spcm.common.model.ladderNetPrice').d('单价(不含税)'),
        name: 'validNetLadderSecPrice',
      },
      {
        label: getDynamicLabel(doubleUnitEnabled, 'validNetLadderPrice'),
        name: 'validNetLadderPrice',
      },
      {
        label: intl.get(`spcm.common.model.inquiryHall.validBargainPrice`).d('有效还价单价'),
        name: 'validBargainPrice',
      },
      {
        label: intl.get('hzero.common.remark').d('备注'),
        name: 'remark',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { queryParams = {} } = data;
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rfx/supplier/${quotationLineId}/ladder-quotation`,
          method: 'GET',
          data: { ...data, ...queryParams },
        };
      },
    },
  };
};

export default ladderQuoteDS;
