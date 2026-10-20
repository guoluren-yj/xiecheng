/**
 * BasicInfoList - 我发送的订单 - 明细页面基本信息表格
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Form } from 'hzero-ui';
import { isFunction } from 'lodash';
import moment from 'moment';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

import BasicInfoListEditableCell from './BasicInfoListEditableCell';
import { formatAumont } from '../components/utils';

const EditableContext = React.createContext();
const EditableRow = ({ form, index, ...props }) => {
  return (
    <EditableContext.Provider value={form}>
      <tr {...props} />
    </EditableContext.Provider>
  );
};

const EditableFormRow = Form.create({ fieldNameProp: null })(EditableRow);

const modelPrompt = 'sodr.deliveryDateReview.model.common';
const commonModelPrompt = 'sodr.deliveryDateReview.model.common';

export default class BasicInfoList extends PureComponent {
  state = {
    selectedRows: [],
  };

  defaultTableRowKey = 'key';

  componentDidUpdate() {
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this.state);
    }
  }

  saveRowData(rowData) {
    const { dataSource = [], assignDataSource = (e) => e } = this.props;
    assignDataSource(dataSource.map((n) => (n.key === rowData.key ? rowData : n)));
  }

  onRowSelectedChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  render() {
    const { dataSource = [], pagination, processing, onChange = (e) => e } = this.props;
    const { selectedRows } = this.state;
    const components = {
      body: {
        row: EditableFormRow,
      },
    };
    const tableProps = {
      rowKey: this.defaultTableRowKey,
      components,
      columns: [
        {
          title: intl.get(`${modelPrompt}.lineNum`).d('行号'),
          dataIndex: 'lineNum',
          width: 50,
          fixed: 'left',
        },
        {
          title: intl.get(`${modelPrompt}.shipmentNum`).d('发运号'),
          dataIndex: 'shipmentNum',
          width: 90,
          fixed: 'left',
        },
        {
          title: intl.get(`${modelPrompt}.itemCode`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 70,
          fixed: 'left',
        },
        {
          title: intl.get(`${modelPrompt}.itemDescription`).d('物料名称'),
          dataIndex: 'itemDescription',
          width: 150,
          fixed: 'left',
        },
        {
          title: intl.get(`${modelPrompt}.quantity`).d('数量'),
          dataIndex: 'quantity',
          width: 80,
          render: (text) => formatAumont(text),
        },
        {
          title: intl.get(`${modelPrompt}.uomName`).d('单位'),
          dataIndex: 'uomName',
          width: 80,
          render: (_, { uomCodeAndName }) => uomCodeAndName,
        },
        {
          title: intl.get(`${commonModelPrompt}.unitPrice`).d('不含税单价'),
          dataIndex: 'unitPrice',
          align: 'right',
          width: 140,
          render: (text, record) => {
            const value = `${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return record.priceShieldFlag === 1 ? '******' : value;
          },
        },
        {
          title: intl.get(`${commonModelPrompt}.taxedEnteredUnitPrice`).d('原币含税单价'),
          dataIndex: 'taxedEnteredUnitPrice',
          align: 'right',
          width: 140,
        },
        {
          title: intl.get(`${modelPrompt}.unitPriceBatch`).d('每'),
          dataIndex: 'unitPriceBatch',
          width: 60,
          render: (val) => formatAumont(val),
        },
        {
          title: intl.get(`${modelPrompt}.lineAmount`).d('不含税行金额'),
          dataIndex: 'lineAmount',
          align: 'right',
          width: 140,
          render: (text, record) => {
            const value = `${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return record.priceShieldFlag === 1 ? '******' : value;
          },
        },
        {
          title: intl.get(`${modelPrompt}.taxedLineAmount`).d('含税行金额'),
          dataIndex: 'taxedLineAmount',
          width: 140,
          render: (text, record) => {
            const value = `${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return record.priceShieldFlag === 1 ? '******' : value;
          },
        },
        {
          title: intl.get(`${modelPrompt}.taxRate`).d('税率'),
          dataIndex: 'taxRate',
          width: 90,
        },
        {
          title: intl.get(`${modelPrompt}.currencyCode`).d('币种'),
          dataIndex: 'currencyCode',
          width: 80,
        },
        {
          title: intl.get(`${modelPrompt}.needByDate`).d('需求日期'),
          dataIndex: 'needByDate',
          width: 90,
          render: (text) => (text ? moment(text).format(DEFAULT_DATE_FORMAT) : text),
        },
        {
          title: intl.get(`${modelPrompt}.committedDeliveryDate`).d('承诺交货日期'),
          dataIndex: 'committedDeliveryDate',
          render: (text, record) => {
            const basicInfoListEditableCellProps = {
              record,
              text,
              dataIndex: 'committedDeliveryDate',
              saveRowData: this.saveRowData.bind(this),
            };
            return (
              <EditableContext.Consumer>
                {(form) => (
                  <BasicInfoListEditableCell form={form} {...basicInfoListEditableCellProps} />
                )}
              </EditableContext.Consumer>
            );
          },
        },
        {
          title: intl.get(`${modelPrompt}.rcvOrganizationName`).d('收货组织'),
          dataIndex: 'rcvOrganizationName',
          width: 90,
        },
        {
          title: intl.get(`${modelPrompt}.rcvWarehouseName`).d('收货库房'),
          dataIndex: 'rcvWarehouseName',
          width: 90,
        },
        {
          title: intl.get(`${modelPrompt}.rcvLocatorName`).d('收货库位'),
          dataIndex: 'rcvLocatorName',
          width: 90,
        },
        {
          title: intl.get(`${modelPrompt}.specifications`).d('规格'),
          dataIndex: 'specifications',
          width: 60,
        },
        {
          title: intl.get(`${modelPrompt}.model`).d('型号'),
          dataIndex: 'model',
          width: 90,
        },
        {
          title: intl.get(`${modelPrompt}.manufacturerName`).d('制造商'),
          dataIndex: 'manufacturerName',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.brand`).d('品牌'),
          dataIndex: 'brand',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.purchaserComments`).d('采购方行备注'),
          dataIndex: 'comments',
          render: (text, record) => {
            const basicInfoListEditableCellProps = {
              record,
              text,
              dataIndex: 'comments',
              saveRowData: this.saveRowData.bind(this),
            };
            return (
              <EditableContext.Consumer>
                {(form) => (
                  <BasicInfoListEditableCell form={form} {...basicInfoListEditableCellProps} />
                )}
              </EditableContext.Consumer>
            );
          },
        },
        {
          title: intl.get(`${modelPrompt}.feedbacks`).d('反馈信息'),
          dataIndex: 'feedbacks',
          width: 180,
        },
      ],
      dataSource,
      pagination,
      loading: processing,
      bordered: true,
      rowSelection: {
        selectedRowKeys: selectedRows.map((n) => n.key),
        onChange: this.onRowSelectedChange.bind(this),
      },
      onChange,
      scroll: { x: 2600 },
    };
    return <Table {...tableProps} />;
  }
}
