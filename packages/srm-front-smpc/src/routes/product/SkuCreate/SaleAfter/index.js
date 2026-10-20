import React from 'react';
import { Form, CheckBox, TextArea, NumberField, Output, Radio } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';

import intl from 'utils/intl';
import OverflowTip from '@/components/OverflowTip';
import customStore from '../customStore';

import styles from './index.less';

function CustSelectBox({
  name,
  title,
  dataSet,
  required = true,
  options = [],
  customizeCode,
  customizeForm = (c, form) => form,
}) {
  return (
    <div className={styles['cust-select-box']}>
      <span className={classNames({ 'cust-select-title': true, required })}>{title}</span>
      {customizeForm(
        { code: customizeCode },
        <Form dataSet={dataSet}>
          {options.map((m) => {
            return (
              <Output
                name={m.name}
                renderer={() => {
                  const { renderer = (e) => e } = m;
                  return m.notRadio ? (
                    renderer()
                  ) : (
                    <div className={classNames(`${m.name}-output-field`, 'common-output-field')}>
                      <Radio name={name} dataSet={dataSet} value={m.value}>
                        {renderer()}
                      </Radio>
                    </div>
                  );
                }}
              />
            );
          })}
        </Form>
      )}
    </div>
  );
}

function NormalBox({ name, title, required = true, children }) {
  return (
    <div className={classNames(styles['cust-select-box'], styles[`${name}-cust-select-box`])}>
      <span className={classNames({ 'cust-select-title': true, required })}>{title}</span>
      <div className="cust-select-body">
        {Array.isArray(children) ? children.map((i) => i || '') : children}
      </div>
    </div>
  );
}

const AfsForm = observer(({ dataSet, isReceive }) => {
  const isAfs = dataSet && dataSet.current && dataSet.current.get('afterSaleSpecial');
  const { customizeForm } = customStore.getCustFuncs();
  return (
    <Form dataSet={dataSet} labelLayout="float">
      <CustSelectBox
        name="returnSpecial"
        title={intl.get('smpc.productPublish.view.refunds').d('退货')}
        dataSet={dataSet}
        customizeForm={customizeForm}
        customizeCode={customStore.getCustomCode('AFS_RETURN')}
        options={[
          {
            name: 'returnNoLimit',
            value: 2,
            renderer: () =>
              intl.get('smpc.productPublish.view.noLimitRefunds').d('该商品支持不限次数退货'),
          },
          {
            name: 'returnRefuse',
            value: 1,
            renderer: () =>
              intl.get('smpc.productPublish.view.noRefunds').d('特殊商品，一经签收不予退货'),
          },
          {
            name: 'returnDateLimit',
            value: 0,
            renderer: () => {
              return (
                <span className="wrap-field">
                  {intl.get('smpc.productPublish.view.confirmReceipt').d('确认收货后')}
                  <NumberField
                    name="returnDuration"
                    style={{ width: 80, height: 28, margin: '0 4px' }}
                    onChange={(val) => dataSet.current.set('returnDateLimit', val)}
                  />
                  {intl
                    .get('smpc.productPublish.view.applyRefunds')
                    .d('天内出现质量问题可申请退货')}
                </span>
              );
            },
          },
        ]}
      />
      {!isReceive && (
        <>
          <CustSelectBox
            name="changeSpecial"
            title={intl.get('smpc.productPublish.view.exchange').d('换货')}
            dataSet={dataSet}
            customizeForm={customizeForm}
            customizeCode={customStore.getCustomCode('AFS_EXCHANGE')}
            options={[
              {
                name: 'changeNoLimit',
                value: 2,
                renderer: () =>
                  intl.get('smpc.productPublish.view.noLimitExchange').d('该商品支持不限次数换货'),
              },
              {
                name: 'changeRefuse',
                value: 1,
                renderer: () =>
                  intl.get('smpc.productPublish.view.noExchange').d('特殊商品，一经签收不予换货'),
              },
              {
                name: 'changeDateLimit',
                value: 0,
                renderer: () => {
                  return (
                    <span className="wrap-field">
                      {intl.get('smpc.productPublish.view.confirmReceipt').d('确认收货后')}
                      <NumberField
                        name="changeDuration"
                        style={{ width: 80, height: 28, margin: '0 4px' }}
                        onChange={(val) => dataSet.current.set('changeDateLimit', val)}
                      />
                      {intl
                        .get('smpc.productPublish.view.applyExchange')
                        .d('天内出现质量问题可申请换货')}
                    </span>
                  );
                },
              },
            ]}
          />
          <NormalBox
            title={intl.get('smpc.productPublish.view.quantity').d('质保')}
            required={false}
            name="quantity"
          >
            <div className="help">
              {intl
                .get('smpc.product.view.quantityHelp')
                .d('商品对应价格的质保期优先级高于售后质保期限')}
            </div>
            <div className="quality-duration-field">
              <NumberField name="qualityDuration" className="number-filed" />
              <span className="suffix"> {intl.get('smpc.product.view.month').d('月')} </span>
            </div>
          </NormalBox>
          <NormalBox
            title={intl.get('smpc.productPublish.view.other').d('其他')}
            required={false}
            name="other"
          >
            <CheckBox name="afterSaleSpecial" />
            {isAfs && (
              <TextArea name="instruction" rows={4} style={{ marginTop: 16 }} resize="both" />
            )}
            <CheckBox name="allSkuFlag" style={{ marginTop: 32 }}>
              {intl.get('smpc.product.model.setAllSku').d('应用至全部SKU')}
            </CheckBox>
          </NormalBox>
        </>
      )}
    </Form>
  );
});

export default function SaleAfter(props) {
  return (
    <>
      <div className={styles['quick-content-help-info']}>
        <Alert
          style={{
            color: '#3095F2',
            backgroundColor: 'rgba(48,149,242,0.1)',
            border: 'none',
          }}
          message={
            <OverflowTip overflow2>
              {intl
                .get('smpc.product.view.saleSever.help')
                .d(
                  '如有任何售后问题请尽量在质保期内联系卖家协商处理，超过质保期卖家不保证受理，请知悉！'
                )}
            </OverflowTip>
          }
          type="info"
          showIcon
          iconType="info"
        />
      </div>
      <div className={styles['sale-after-container']}>
        <AfsForm {...props} />
      </div>
    </>
  );
}
