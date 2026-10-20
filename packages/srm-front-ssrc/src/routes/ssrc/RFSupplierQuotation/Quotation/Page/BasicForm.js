import React, { memo } from 'react';
import { Lov, TextField, TextArea } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { noop } from 'lodash';
// import classnames from 'classnames';

import CollapseForm from '_components/CollapseForm';
// import intl from 'utils/intl';
import FileGroup from '../Modals/FileGroup';

// import PageStyles from '../index.less';

const BasicForm = observer((props) => {
  const {
    customizeCollapseForm = noop,
    custLoading,
    basicFormDS = {},
    // organizationId,
    getCustomizeUnitCode = () => {},
    // isBidSectionData = false,
    changeCurrency = noop,
    quotationRemote,
    // bidFlag = 0,
  } = props || {};

  const cuxFormProps = {
    ...(props || {}),
  };

  const fileGroupCommonProps = {};

  const fileGroupProps = quotationRemote
    ? quotationRemote.process(
        'SSRC_SUPPLIER_QUOTATION_NEW_BASIC_FORM_FILE_GROUP_PROPS',
        fileGroupCommonProps,
        {}
      )
    : fileGroupCommonProps;

  const formFields = [
    <TextField name="companyName" />,
    <FileGroup name="companyNameUuid" basicFormDS={basicFormDS} fileGroupProps={fileGroupProps} />,
    <Lov name="paymentTypeId" />,
    <Lov name="paymentTermId" />,
    <Lov name="currencyCode" onChange={(data) => changeCurrency(data)} />,
    <TextArea name="rfxRemark" resize="both" colSpan={2} />,
  ];

  const currentFields = quotationRemote
    ? quotationRemote.process('SSRC_SUPPLIER_QUOTATION_NEW_BASIC_FORM', formFields, cuxFormProps)
    : formFields;

  return (
    <div>
      {customizeCollapseForm(
        {
          code: getCustomizeUnitCode('baseForm'),
          dataSet: basicFormDS,
          enableEmpty: true,
        },
        <CollapseForm
          dataSet={basicFormDS}
          labelLayout="float"
          // layout="none"
          showLines={6}
          columns={3}
          custLoading={custLoading}
          useWidthPercent
          firstShowFields={[
            'companyName',
            'companyNameUuid',
            'paymentTermId',
            'paymentTypeId',
            'currencyCode',
          ]}
        >
          {currentFields}
        </CollapseForm>
      )}
    </div>
  );
});

export default memo(BasicForm);
