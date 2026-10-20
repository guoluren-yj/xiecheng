import React, { memo } from 'react';
import { Output } from 'choerodon-ui/pro';
// import { Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import CollapseForm from '_components/CollapseForm';
import intl from 'utils/intl';
import { numberSeparatorRender } from '@/utils/renderer';
// import FileGroup from '@/routes/ssrc/RFSupplierQuotation/Quotation/Modals/FileGroup';
import FileGroupAppy from '../../Apply/Modals/FileGroupAppy';

const BasicForm = observer((props) => {
  const {
    customizeCollapseForm,
    custLoading,
    basicFormDS = {},
    // organizationId,
    getCustomizeUnitCode = () => {},
    quotationRemote,
    bidFlag = 0,
  } = props;

  const cuxFormProps = {
    basicFormDS,
    bidFlag,
  };

  // 金额处理
  const renderCurrency = ({ value }) => {
    const Text = !value
      ? intl.get('ssrc.common.view.gratis').d('免费')
      : numberSeparatorRender(value) || null;
    return <span>{Text}</span>;
  };

  const fileGroupCommonProps = {};

  const fileGroupProps = quotationRemote
    ? quotationRemote.process(
        'SSRC_SUPPLIER_QUOTATION_NEW_QUERY_BASIC_FORM_FILE_GROUP_PROPS',
        fileGroupCommonProps,
        {}
      )
    : fileGroupCommonProps;

  const formFields = [
    <Output name="companyName" />,
    <Output
      name="companyNameUuid"
      renderer={() => <FileGroupAppy basicFormDS={basicFormDS} fileGroupProps={fileGroupProps} />}
    />,
    <Output name="rfxRemark" />,
    <Output name="quotationStartDate" />,
    <Output name="quotationEndDate" />,
    <Output name="bidBond" renderer={renderCurrency} />,
    <Output name="bidFileExpense" renderer={renderCurrency} />,
    <Output name="paymentTermName" />,
    <Output name="paymentTypeName" />,
    <Output name="currencyCode" />,
  ];

  const currentFields = quotationRemote
    ? quotationRemote.process(
        'SSRC_SUPPLIER_QUOTATION_NEW_QUERY_BASIC_FORM',
        formFields,
        cuxFormProps
      )
    : formFields;

  return (
    <div>
      {customizeCollapseForm(
        {
          code: getCustomizeUnitCode('baseForm'),
          dataSet: basicFormDS,
          labelLayout: 'vertical',
        },
        <CollapseForm
          dataSet={basicFormDS}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
          showLines={6}
          columns={3}
          custLoading={custLoading}
          useWidthPercent
          firstShowFields={[
            'companyName',
            'companyNameUuid',
            'rfxRemark',
            'quotationStartDate',
            'quotationEndDate',
            'bidBond',
          ]}
        >
          {currentFields}
        </CollapseForm>
      )}
    </div>
  );
});

export default memo(BasicForm);
