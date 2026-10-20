/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-02-24 19:15:02
 */
import React, { useContext } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
// import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { renderAmount, colorRender } from '../hook';
import { Store } from '../stores';

const BaseInfo = function BaseInfo({ code, remote, control, query }) {
  const { headerDs, customizeForm, urlflagIf } = useContext(Store);
  const { handleAddField, handleCuxLov, handleCuxFormDom } = remote?.props?.process || {};

  React.useLayoutEffect(() => {
    if (handleAddField && typeof handleAddField === 'function') {
      handleAddField(headerDs);
    }
  }, [headerDs]);

  const form = customizeForm(
    {
      code,
      dataSet: headerDs,
    },
    <Form
      dataSet={headerDs}
      columns={3}
      labelLayout="vertical"
      useWidthPercent
      className="c7n-pro-vertical-form-display"
    >
      <Output name="displayPrNum" />
      <Output name="title" />
      <Output name="createByName" />
      <Output name="creationDate" />
      <Output name="prTypeLov" />
      <Output name="prSourcePlatform" />
      <Output name="originalCurrencyLov" />
      <Output name="amount" renderer={renderAmount} />
      <Output name="localCurrencyLov" />
      <Output name="localCurrencyNoTaxSum" renderer={renderAmount} />
      <Output name="localCurrencyTaxSum" renderer={renderAmount} />
      <Output name="paymentMethodName" />
      <Output name="lotNum" />
      <Output name="requestedByLov" />
      <Output name="requestDate" />
      <Output name="unitLov" />
      <Output
        name="prStatusCode"
        renderer={({ value, record }) => {
          if (value) {
            return colorRender(value, record.get('prStatusMeaning'));
          }
        }}
      />
      <Output name="remark" />
      <Output
        name="rpSourceFlag"
        renderer={({ value }) =>
          value === 1
            ? intl.get('hzero.common.button.yes').d('是')
            : intl.get('hzero.common.button.no').d('否')
        }
      />
      {typeof handleCuxLov === 'function' && control ? handleCuxLov({ headerDs, pageForm: 'contorl', urlflagIf }) : <></>}
      {typeof handleCuxFormDom === 'function' && query ? handleCuxFormDom({ headerDs }) : <></>}
      {/* <Output name="rpSourceFlag" renderer={({ value }) => yesOrNoRender(Number(value))} /> */}
    </Form>
  );

  return form;
};

export default cuxRemote(
  {
    code: 'SPRM_PURCHASE_DETAIL_CUSTOMLOV',
    name: 'remote',
  },
  {
    process: {
      handleAddField: undefined,
      handleCuxLov: undefined,
    },
  }
)(BaseInfo);
