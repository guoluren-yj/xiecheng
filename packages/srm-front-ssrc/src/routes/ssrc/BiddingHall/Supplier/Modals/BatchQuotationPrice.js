import React, { Component } from 'react';
import { Form, Select, NumberField, Icon, CheckBox, Lov } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isEmpty, noop } from 'lodash';
import { Throttle } from 'lodash-decorators';

import { getRatioText, getRangeText } from '@/routes/ssrc/BiddingHall/utils/renders';

import intl from 'utils/intl';

const { Option } = Select;

@observer
class BatchQuotationPrice extends Component {
  @Throttle(1200)
  changeFloatType = (value, record) => {
    if (!record) {
      return;
    }

    record.set({
      floatType: value,
      quotationRange: null,
    });
  };

  handleChangeTaxFlag = (val) => {
    const { batchQuotaitonModalDS } = this.props;
    const { current } = batchQuotaitonModalDS || {};
    if (!val) {
      current.set('taxId', undefined);
      current.set('taxRate', undefined);
    }
  };

  render() {
    const { ds, batchQuotaitonModalDS, headerInfo, customizeForm = noop, code, remote } = this.props;
    const { biddingQuotationMethod, defaultPrecision } = headerInfo || {};
    const { current } = batchQuotaitonModalDS || {};

    const { floatType } = current ? current.get(['floatType']) : {};

    const ratioText = getRatioText({ biddingQuotationMethod });
    const moneyText = getRangeText({ biddingQuotationMethod });

    let floatTypeOptions = [
      <Option value="ratio" key="ratio">{ratioText}</Option>,
      <Option value="money" key="money">{moneyText}</Option>,
    ];
    floatTypeOptions = remote ? remote.process('SSRC_SUPPLIER_BIDDINGHALL_PROCESS_BATCH_QUOTATION_PRICE_FLOAT_TYPE_OPTIONS', floatTypeOptions, {
      that: this,
      ratioText,
      moneyText,
    }) : floatTypeOptions;

    return (
      <div>
        <div
          style={{
            margin: '-20px -20px 20px',
            background: 'rgb(230, 242, 253)',
            padding: '10px 24px',
            fontSize: '13px',
            color: 'rgb(48, 145, 242)',
          }}
        >
          <Icon type="icon icon-help" />
          &nbsp;&nbsp;
          {isEmpty(ds.selected)
            ? intl
                .get('ssrc.inquiryHall.model.inquiryHall.batchAllDataToEdit')
                .d('针对全部数据进行批量编辑')
            : intl
                .get('ssrc.inquiryHall.model.inquiryHall.batchCheckDataToEdit', {
                  length: ds.selected.length,
                })
                .d(`已勾选${ds.selected.length}条数据进行批量编辑`)}
        </div>
        {customizeForm(
          {
            code,
            dataSet: batchQuotaitonModalDS,
          },
          <Form dataSet={batchQuotaitonModalDS} columns={1} labelLayout="float">
            {/* <Select
                clearButton={false}
                name="floatType"
                onChange={(value) => this.changeFloatType(value, current)}
              >
                <Option value="ratio">{ratioText}</Option>
                <Option value="money">{moneyText}</Option>
              </Select>
              <NumberField
                name="quotationRange"
                suffix={floatType === 'ratio' ? '%' : ''}
                precision={floatType === 'money' ? defaultPrecision : 2}
              /> */}
            <div name="floatTypeValue" style={{ display: 'flex', width: '340px' }}>
              <div
                style={{
                  width: '50%',
                }}
              >
                <Select
                  style={{ width: '100%' }}
                  clearButton={false}
                  name="floatType"
                  onChange={(value) => this.changeFloatType(value, current)}
                >
                  {floatTypeOptions}
                </Select>
              </div>
              <div
                style={{
                  width: '50%',
                  marginLeft: '-1px',
                }}
              >
                <NumberField
                  style={{ width: '100%' }}
                  name="quotationRange"
                  suffix={floatType === 'ratio' ? '%' : ''}
                  precision={floatType === 'money' ? defaultPrecision : 2}
                />
              </div>
            </div>

            <CheckBox name="taxIncludedFlag" onChange={this.handleChangeTaxFlag} />
            <Lov name="taxId" />
          </Form>
        )}
      </div>
    );
  }
}

export default BatchQuotationPrice;
