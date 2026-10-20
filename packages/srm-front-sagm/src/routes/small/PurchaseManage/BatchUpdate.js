import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Bind } from 'lodash-decorators';

import { Select, Lov, Form } from 'choerodon-ui/pro';

import intl from 'utils/intl';

const LovButton = observer(({ dataSet, name, onChange = (e) => e }) => {
  return (
    <Lov
      name={name}
      dataSet={dataSet}
      disabled={dataSet.selected.length < 1}
      style={{ width: '100%' }}
      onChange={onChange}
      placeholder={intl.get('small.purchaseManage.view.choose').d('请选择')}
    />
  );
});

export default class BatchUpdate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      batchType: 'stock',
      batchData: null,
    };
    const { modal } = props;
    modal.handleOk(this.handleBatchUpdate);
  }

  @Bind()
  handleBatchUpdate() {
    const { batchType, batchData } = this.state;
    const selectRows = this.props.tableDS.selected;
    const batchColName =
      batchType === 'stock' ? 'invLov' : batchType === 'purchase' ? 'purLov' : 'comLov';
    // const { companyId, companyName } = batchData;
    selectRows.forEach((record) => {
      if (batchColName === 'comLov') {
        this.handleCompanyChange({ value: batchData, oldValue: record.get('comLov'), record });
      } else if (batchColName === 'invLov') {
        this.handleInventoryChange({ value: batchData, record });
      } else {
        record.set(batchColName, batchData);
      }
    });
    this.props.tableDS.submit();
    // this.setState({ batchData: null });
    // this.tableDS.current.set(batchType, null);
  }

  handleCompanyChange = ({ value, oldValue, record }) => {
    if (value) {
      if (value.companyId !== (oldValue || {}).companyId) {
        record.set('invLov', null);
      }
      record.set('comLov', {
        companyId: value.companyId,
        companyName: value.companyName,
      });
    } else {
      record.set('invLov', null);
    }
  };

  handleInventoryChange = ({ value, record }) => {
    if (value) {
      record.set('invLov', {
        organizationId: value.organizationId,
        organizationName: value.organizationName,
      });
      record.set('comLov', {
        companyId: value.companyId,
        companyName: value.companyName,
      });
    }
  };

  render() {
    const { batchType } = this.state;
    const { tableDS } = this.props;
    return (
      <Form columns={1}>
        <Select
          value={batchType}
          clearButton={false}
          onChange={(val) => {
            tableDS.current.set(batchType, null);
            this.setState({ batchType: val, batchData: null });
          }}
        >
          <Select.Option value="stock">
            {intl.get('small.purchaseManage.view.stock').d('库存组织')}
          </Select.Option>
          <Select.Option value="purchase">
            {intl.get('small.purchaseManage.view.purchase').d('采购组织')}
          </Select.Option>
          <Select.Option value="company">
            {intl.get('small.purchaseManage.view.company').d('公司')}
          </Select.Option>
        </Select>
        <LovButton
          dataSet={tableDS}
          name={batchType}
          onChange={(item) => {
            this.setState({ batchData: item || null });
          }}
        />
      </Form>
    );
  }
}
