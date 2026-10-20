import React, { useRef } from 'react';
import {
  Form,
  Lov,
  DatePicker,
  Select,
  CheckBox,
  NumberField,
  TextField,
  Output,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { compose } from 'lodash';

import intl from 'utils/intl';
import moment from 'moment';
import { PrecisionField } from '@/utils/precision';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { openUnitTree, openRegionTree } from '@/utils/tree';
import { getCustDimColumns, withCustomDimension } from '@/utils/customDimension';
import { openCatalog } from '@/routes/pageTree';
import { unitPriceChange, taxPriceChange, taxChange, currencyChange } from '../fieldChange';
import { batchProtocalCode } from '../../../const/uniCode';

function BatchLine(props) {
  const {
    dataSet,
    priceRule,
    initInfo = {},
    isPriceLib,
    customizeForm,
    custDimensions,
    onShowLadderPrice = (e) => e,
  } = props;
  const record = dataSet.current;
  const isInitOrg = useRef(false);
  const isInitRegion = useRef(false);
  const priceEditable = priceRule === 'TAX_INCLUDED_PRICE';
  const changeField = priceEditable ? 'taxPrice' : 'unitPrice';
  const dimFields = getCustDimColumns(dataSet, custDimensions, {
    required: false,
    formField: true,
    valueAllFlag: false,
  });
  return (
    <>
      {customizeForm(
        {
          code: isPriceLib
            ? batchProtocalCode.BATCH_PRICE_FORM
            : batchProtocalCode.BATCH_MANUAL_FORM,
        },
        <Form labelLayout="float" dataSet={dataSet} columns={2}>
          <Lov
            name="catalogLov"
            colSpan={2}
            onClick={() => openCatalog({ record, name: 'catalogLov' })}
          />
          <DatePicker
            name="validDateFrom"
            // min={moment()}
            max={record.get('validDateTo') || undefined}
          />
          <DatePicker name="validDateTo" min={record.get('validDateFrom') || moment()} />
          <Lov name="uomLov" colSpan={2} />
          <Lov
            colSpan={2}
            name="taxLov"
            searchable={false}
            onChange={(lovRecord) => {
              const item = lovRecord || {};
              taxChange(record, item, changeField);
            }}
          />
          <Lov
            colSpan={2}
            name="currencyLov"
            onChange={(lovRecord) => currencyChange(record, lovRecord, changeField)}
          />
          <Select name="priceType" colSpan={2} />
          <PrecisionField
            name="unitPrice"
            type="currency"
            disabled={priceEditable}
            record={record}
            precision={record.get('defaultPrecision')}
            onChange={(value) => unitPriceChange(value, record, record.get('defaultPrecision'))}
          />
          <PrecisionField
            disabled={!priceEditable}
            name="taxPrice"
            type="currency"
            record={record}
            precision={record.get('defaultPrecision')}
            onChange={(value) => taxPriceChange(value, record, record.get('defaultPrecision'))}
          />
          <NumberField name="priceBatchQuantity" colSpan={2} />
          <Output
            colSpan={2}
            name="agreementLadders"
            renderer={() => (
              <a
                disabled={record.get('priceType') !== 'LADDER_PRICE'}
                onClick={() => onShowLadderPrice(record.toData(), record)}
              >
                {intl.get('small.mallProtocolManagement.model.setLadderPrice').d('设置阶梯价格')}
              </a>
            )}
          />
          <PrecisionField
            name="agreementQuantity"
            record={record}
            precision={record.get('uomPrecision')}
          />
          <PrecisionField
            name="orderQuantity"
            record={record}
            precision={record.get('uomPrecision')}
          />
          <PrecisionField
            name="minPackageQuantity"
            record={record}
            precision={record.get('uomPrecision')}
          />
          <PrecisionField
            name="purchaseQuantityLimit"
            record={record}
            precision={record.get('uomPrecision')}
          />
          <PrecisionField
            name="purchaseAmountLimit"
            type="currency"
            record={record}
            precision={record.get('financialPrecision')}
          />
          <CheckBox name="priceHiddenFlag" colSpan={2} />
          <Lov
            name="deliverRegionLov"
            colSpan={2}
            onClick={() => {
              if (!isInitRegion.current) {
                record.set('deliverRegionLov', initInfo.deliverRegionLov);
              }
              isInitRegion.current = true;
              openRegionTree({ record, name: 'deliverRegionLov' });
            }}
          />
          <Lov
            name="buyOrganizationLov"
            colSpan={2}
            onClick={() => {
              if (!isInitOrg.current) {
                record.set('buyOrganizationLov', initInfo.buyOrganizationLov);
              }
              isInitOrg.current = true;
              openUnitTree({
                record,
                name: 'buyOrganizationLov',
              });
            }}
          />
          <TextField name="priceSourceFromNum" />
          <TextField name="priceSourceFromLnNum" />
          {dimFields.map((m) => {
            const { name, FormField, fieldProps } = m;
            return <FormField name={name} colSpan={2} {...fieldProps} />;
          })}
          <NumberField name="deliveryDay" />
          <NumberField name="guaranteeDay" />
          <TextField name="remark" colSpan={2} />
          {/* <CheckBox name="isFree" /> */}
          <Lov name="postageLov" />
          <Lov name="installLov" />
        </Form>
      )}
    </>
  );
}

export default compose(
  WithCustomizeC7N({
    unitCode: [batchProtocalCode.BATCH_PRICE_FORM, batchProtocalCode.BATCH_MANUAL_FORM],
  }),
  withCustomDimension(true),
  observer
)(BatchLine);
