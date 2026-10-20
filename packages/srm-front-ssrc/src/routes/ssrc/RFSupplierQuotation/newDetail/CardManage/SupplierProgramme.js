import React, { useContext, useEffect } from 'react';
import { TextArea, Output } from 'choerodon-ui/pro';

import CollapseForm from '_components/CollapseForm';

import { Store } from '../store/index';

export default function ProgrammeCard() {
  const {
    routerParams: { sourceCategory },
    commonDs: { supplierQuotationFormDs },
    // ref: { supplierReplyInfoRef },
    customizeCollapseForm,
    storeData: { detailFlag, noBackFlag },
  } = useContext(Store);

  useEffect(() => {
    supplierQuotationFormDs.query();
  }, []);

  return customizeCollapseForm(
    {
      code: noBackFlag
        ? `SSRC.SUPPLIER_REPLY.${sourceCategory}_HISTORY.QUOTATION_FORM`
        : detailFlag
        ? `SSRC.SUPPLIER_REPLY.RF_DETAIL.${sourceCategory}_FORM_DETAIL`
        : `SSRC.SUPPLIER_REPLY_${sourceCategory}.QUOTATION_FORM`,
      enableEmpty: true,
    },
    <CollapseForm
      dataSet={supplierQuotationFormDs}
      columns={3}
      labelLayout={detailFlag ? 'vertical' : 'float'}
      className={detailFlag ? 'c7n-pro-vertical-form-display' : ''}
      useWidthPercent
    >
      {detailFlag ? (
        <Output newLine name="quotationContent" colSpan={3} />
      ) : (
        <TextArea
          newLine
          name="quotationContent"
          colSpan={3}
          resize="both"
          autoSize={{ minRows: 3 }}
        />
      )}
    </CollapseForm>
  );
}
