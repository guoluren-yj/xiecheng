import React, { memo, useCallback } from 'react';
import { Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { noop } from 'lodash';
// import classnames from 'classnames';

import CollapseForm from '_components/CollapseForm';
import intl from 'utils/intl';
import { numberSeparatorRender } from '@/utils/renderer';

import FileGroupAppy from '../Modals/FileGroupAppy';

// import PageStyles from '../index.less';

const BasicForm = observer((props) => {
  const {
    customizeCollapseForm = noop,
    custLoading,
    basicFormDS = {},
    // organizationId,
    getCustomizeUnitCode = () => {},
    // isBidSectionData,
    quotationRemote = null,
  } = props;

  // render long text
  // const renderLongText = (value = '') => {
  //   return (
  //     <Tooltip title={value || '-'}>
  //       {value?.length > 20 ? `${value.substring(0, 20)}...` : value}
  //     </Tooltip>
  //   );
  // };

  // 金额处理
  const renderCurrency = useCallback(
    (value) => {
      const Text = !value
        ? intl.get('ssrc.common.view.gratis').d('免费')
        : numberSeparatorRender(value) || null;
      return <span>{Text}</span>;
    },
    [basicFormDS]
  );

  const fileGroupCommonProps = {};

  const fileGroupProps = quotationRemote
    ? quotationRemote.process(
        'SSRC_RFSUPPLIER_QUOTATION_APPLY_BASIC_FORM_FILE_GROUP_PROPS',
        fileGroupCommonProps,
        {}
      )
    : fileGroupCommonProps;

  const getBasicFormColumns = useCallback(() => {
    const columns = [
      <Output name="companyName" />,
      <Output
        name="companyNameUuid"
        renderer={() => <FileGroupAppy basicFormDS={basicFormDS} fileGroupProps={fileGroupProps} />}
      />,
      <Output name="rfxRemark" />,
      <Output name="quotationStartDate" />,
      <Output name="quotationEndDate" />,
      <Output name="bidBond" renderer={({ value }) => renderCurrency(value)} />,
      <Output name="bidFileExpense" renderer={({ value }) => renderCurrency(value)} />,
      <Output name="paymentTypeName" />,
      <Output name="paymentTermName" />,
      <Output name="currencyCode" />,
    ];

    const otherProps = {};
    return quotationRemote
      ? quotationRemote.process(
          'SSRC_RFSUPPLIER_QUOTATION_APPLY_BASIC_COLUMNS',
          columns,
          otherProps
        )
      : columns;
  }, [basicFormDS]);

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
          // layout="none"
          showLines={6}
          columns={3}
          custLoading={custLoading}
          useWidthPercent
        >
          {getBasicFormColumns()}
        </CollapseForm>
      )}
    </div>
  );
});

export default memo(BasicForm);
