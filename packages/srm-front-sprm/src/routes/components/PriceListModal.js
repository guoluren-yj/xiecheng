import React, { PureComponent, Fragment } from 'react';
import { Drawer } from 'hzero-ui';
import { Table, DataSet, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import styles from './PriceListModal.less';

const commonPrompt = 'sprm.common.model.common';
const priceDs = () => {
  return {
    selection: false,
    pageSize: 20,
    fields: [
      {
        label: intl.get(`${commonPrompt}.imagePath`).d('商品图片'),
        name: 'imagePath',
        width: 120,
      },
      {
        label: intl.get(`${commonPrompt}.productCode`).d('商品编码'),
        name: 'productCode',
        width: 200,
      },
      {
        label: intl.get(`${commonPrompt}.productName`).d('商品名称'),
        name: 'productName',
        width: 100,
      },
      {
        label: intl.get(`${commonPrompt}.deliveryCycle`).d('供货周期'),
        name: 'deliveryCycle',
        width: 100,
      },
      {
        label: intl.get(`${commonPrompt}.brand`).d('品牌'),
        name: 'brand',
        width: 100,
      },
      {
        label: intl.get(`${commonPrompt}.supplierCompanyNum`).d('供应商编码'),
        name: 'supplierCompanyNum',
        width: 120,
      },
      {
        label: intl.get(`${commonPrompt}.supplierCompanyName`).d('供应商名称'),
        name: 'supplierCompanyName',
        width: 120,
      },
      {
        label: intl.get(`${commonPrompt}.price`).d('单价'),
        type: 'number',
        name: 'price',
        width: 100,
      },
      {
        label: intl.get(`${commonPrompt}.source`).d('来源'),
        name: 'type',
        width: 120,
      },
    ],
  };
};

export default class CustomSpecModal extends PureComponent {
  constructor(props) {
    super(props);
    this.pricetableDs = new DataSet({
      ...priceDs(),
    });
  }

  render() {
    const { visible, onClose, data } = this.props;
    this.pricetableDs.loadData(data);
    const priceColumns = [
      {
        name: 'imagePath',
        className: styles.imagePathColumns,
        renderer: ({ value }) => <img src={value} alt="" style={{ width: '100%' }} />,
      },
      {
        name: 'productCode',
        renderer: ({ record }) =>
          record.get('productName')
            ? `${record.get('productCode')} - ${record.get('productName')}`
            : record.get('productCode'),
      },
      {
        name: 'supplierCompanyNum',
        renderer: ({ record }) =>
          record.get('supplierCompanyName')
            ? `${record.get('supplierCompanyNum')} - ${record.get('supplierCompanyName')}`
            : record.get('supplierCompanyNum'),
      },
      { name: 'price' },
      { name: 'deliveryCycle' },
      { name: 'brand' },
      {
        name: 'type', // 来源
        renderer: ({ value }) =>
          Number(value) === 2
            ? intl.get(`${commonPrompt}.sameParagraphRecommendation`).d('同款推荐')
            : intl.get(`${commonPrompt}.manuallyAdd`).d('手工添加'),
      },
    ];
    return (
      <Fragment>
        <Drawer
          width={720}
          title={intl.get(`${commonPrompt}.priceListTitle`).d('商品比价单')}
          placement="right"
          destroyOnClose
          visible={visible}
          closable
          onClose={() => onClose()}
        >
          <Table dataSet={this.pricetableDs} columns={priceColumns} />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              textAlign: 'left',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
            }}
          >
            <Button
              color="primary"
              style={{
                marginRight: 8,
              }}
              onClick={() => onClose()}
            >
              {intl.get('hzero.common.status.closed').d('关闭')}
            </Button>
          </div>
        </Drawer>
      </Fragment>
    );
  }
}
