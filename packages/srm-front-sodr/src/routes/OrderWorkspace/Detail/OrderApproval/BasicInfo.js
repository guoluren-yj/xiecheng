/*
 * BasicInfo - 订单明细页-基础信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React from 'react';
import intl from 'utils/intl';
import { Form, Output, Tooltip } from 'choerodon-ui/pro';

import { openTermsModal } from '@/routes/components/utils';
import { useAmountRender, useLocalAmountRender } from '@/routes/OrderWorkspace/hooks';
import styles from '../index.less';

const SHIED_FIELDS = [
  'amount',
  'taxIncludeAmount',
  'unitPrice',
  'enteredTaxIncludedPrice',
  'lineAmount',
  'taxIncludedLineAmount',
  'domesticTaxIncludedPrice',
  'domesticUnitPrice',
  'domesticTaxIncludedLineAmount',
  'domesticLineAmount',
];

const BasicInfo = (props) => {
  const { ds, customizeForm, bySourceCode } = props;
  const dsCurrent = ds?.current;
  const { paymentPlanNum, oldTermHideFlag } = dsCurrent?.get(['paymentPlanNum', 'oldTermHideFlag']);
  const renderChangeTip = (data, content) => {
    const { record, name, text } = data;
    const { changeMap = {}, priceShieldFlag } = record.get(['changeMap', 'priceShieldFlag']);
    const shieldFlag = priceShieldFlag === 1 && SHIED_FIELDS.includes(name);
    const dom = content || text;
    if (name in changeMap) {
      const tipValue = changeMap[name] || '【】';
      const tipContent = `${intl
        .get('sodr.common.model.common.beforeUpdate')
        .d('变更前')} : ${tipValue}`;
      if (!shieldFlag) {
        return (
          <Tooltip title={tipContent} popupClassName={styles['change-tip-tooltip']} theme="light">
            {<span style={{ color: 'red' }}>{dom}</span>}
          </Tooltip>
        );
      } else {
        return <span style={{ color: 'red' }}>{dom}</span>;
      }
    }
    return dom;
  };

  return customizeForm(
    {
      code: 'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.BASICINFO',
      extTextRenderIntercept: (_props, dom) => {
        const { record, name } = _props;
        const { changeMap = {} } = record.get(['changeMap']);
        if (name in changeMap) {
          const tipValue = changeMap[name] || '【】';
          const tipContent = `${intl
            .get('sodr.common.model.common.beforeUpdate')
            .d('变更前')} : ${tipValue}`;
          return (
            <Tooltip title={tipContent} popupClassName={styles['change-tip-tooltip']} theme="light">
              {<span style={{ color: 'red' }}>{dom}</span>}
            </Tooltip>
          );
        }
        return dom;
      },
    },
    <Form
      dataSet={ds}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      <Output name="displayPoNum" />
      <Output name="releaseNum" renderer={renderChangeTip} />
      <Output name="versionNum" renderer={renderChangeTip} />
      <Output name="poTypeDesc" renderer={renderChangeTip} />
      <Output
        name="amount"
        renderer={(_props) =>
          renderChangeTip(_props, useAmountRender(dsCurrent, { bySourceCode })(_props))
        }
      />
      <Output
        name="taxIncludeAmount"
        renderer={(_props) =>
          renderChangeTip(_props, useAmountRender(dsCurrent, { bySourceCode })(_props))
        }
      />
      {paymentPlanNum && (
        <Output
          name="paymentPlanNum"
          renderer={({ value }) => (
            <a onClick={() => openTermsModal({ record: dsCurrent })}>{value}</a>
          )}
        />
      )}
      <Output name="quantityTotal" renderer={renderChangeTip} />
      <Output name="currencyCode" renderer={renderChangeTip} />
      <Output name="creationDate" renderer={renderChangeTip} />
      <Output
        name="poSourcePlatform"
        renderer={(_props) => {
          const { record } = _props;
          return renderChangeTip(_props, record.get('poSourcePlatformMeaning'));
        }}
      />
      {!oldTermHideFlag && <Output name="termsName" renderer={renderChangeTip} />}
      <Output name="remark" newLine colSpan={2} renderer={renderChangeTip} />
      {/* 默认隐藏字段 */}
      <Output newLine name="domesticCurrencyCode" renderer={renderChangeTip} />
      <Output
        name="domesticTaxIncludeAmount"
        renderer={(_props) => {
          return renderChangeTip(
            _props,
            useLocalAmountRender(ds?.current, { bySourceCode })(_props)
          );
        }}
      />
      <Output
        name="domesticAmount"
        renderer={(_props) => {
          return renderChangeTip(
            _props,
            useLocalAmountRender(ds?.current, { bySourceCode })(_props)
          );
        }}
      />
      <Output name="originalPoNum" renderer={renderChangeTip} />
      <Output
        name="sourceOfTransferOrder"
        renderer={(_props) => {
          const { record } = _props;
          return renderChangeTip(_props, record.get('sourceOfTransferOrderMeaning'));
        }}
      />
      <Output
        name="sourceBillTypeCode"
        renderer={(_props) => {
          const { record } = _props;
          return renderChangeTip(_props, record.get('sourceBillTypeCodeMeaning'));
        }}
      />
      <Output name="supplierOrderTypeCode" renderer={renderChangeTip} />
      <Output name="createdUnitName" />
      <Output name="pcHeaderIdLov" renderer={({ record }) => record.get('pcNumLov')} />
    </Form>
  );
};

export default BasicInfo;
