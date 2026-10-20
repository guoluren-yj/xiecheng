import React, { useImperativeHandle, useMemo } from 'react';
import { Form, TextArea, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { compose, noop } from 'lodash';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import { INQUIRY, BID } from '@/utils/globalVariable';
import { abandonFormDS } from './store/abandonFormDS';

const Abandon = observer((props = {}) => {
  const { onRef = noop, customizeForm = noop, bidFlag = false } = props;

  const formDS = useMemo(() => new DataSet(abandonFormDS()), []);

  useImperativeHandle(onRef, () => ({
    formDS,
  }));

  return customizeForm(
    {
      code: !bidFlag
        ? 'SSRC.SUPPLIER_REPLY_NEW.ABANDON_QUOTATION'
        : 'SSRC.SUPPLIER_REPLY_BID.ABANDON_BID',
    },
    <Form dataSet={formDS} labelLayout="float">
      <TextArea name="abandonRemark" resize="vertical" />
    </Form>
  );
});

const HOCComponent = (Comp, type = INQUIRY) =>
  compose(
    formatterCollections({
      code: ['ssrc.supplierQuotation'],
    }),
    WithCustomizeC7N({
      unitCode: [
        type === INQUIRY
          ? 'SSRC.SUPPLIER_REPLY_NEW.ABANDON_QUOTATION'
          : 'SSRC.SUPPLIER_REPLY_BID.ABANDON_BID',
      ],
    })
  )(Comp);

const InquiryAbandon = HOCComponent(Abandon); // 询价
const BidAbandon = HOCComponent(Abandon, BID); // 投标
export { Abandon, InquiryAbandon, BidAbandon };
