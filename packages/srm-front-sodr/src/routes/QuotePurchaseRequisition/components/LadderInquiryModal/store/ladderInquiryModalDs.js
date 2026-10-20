import React from 'react';

import intl from 'utils/intl';

const header = () => ({
  fields: [
    {
      name: 'itemCode',
      lable: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      lable: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsName`).d('物料名称'),
    },
  ],
});

const line = () => ({
  fields: [
    {
      name: 'rfxLadderLineNum',
      lable: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
    },
    {
      name: 'ladderFrom',
      type: 'number',
      lable: <span>{intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderFrom`).d('数量从')}</span>,
    },
    {
      name: 'ladderTo',
      type: 'number',
      lable: (
        <span>
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderTo`).d('数量至')}
          {`(<)`}
        </span>
      ),
    },
    {
      name: 'remark',
      lable: intl.get('hzero.common.remark').d('备注'),
    },
  ],
});

export { header, line };
