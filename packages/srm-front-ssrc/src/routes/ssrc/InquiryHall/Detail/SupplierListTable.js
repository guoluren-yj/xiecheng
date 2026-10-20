import React, { PureComponent } from 'react';
import { Popover } from 'hzero-ui';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { phoneRender } from '@/utils/renderer';

export default class ItemDetailsTable extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      dataSource = [],
      pagination,
      onSearch,
      customizeTable = () => {},
      rfx = {},
    } = this.props;
    const { unitCodeSymbol } = rfx;
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数'),
        dataIndex: 'priceCoefficient',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lifeCycle`).d('生命周期阶段'),
        dataIndex: 'stageDescription',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人'),
        dataIndex: 'contactName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话'),
        dataIndex: 'contactMobilephone',
        width: 200,
        render: (val, record) => phoneRender(record.internationalTelCodeMeaning, val),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件'),
        dataIndex: 'contactMail',
        width: 120,
      },
    ];

    return (
      <React.Fragment>
        {customizeTable(
          { code: `SSRC.${unitCodeSymbol}_DETAIL.SUPPLIER.LINE`, readOnly: true },
          <EditTable
            disabled
            bordered
            rowKey="rfxLineSupplierId"
            loading={loading}
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            onChange={(page) => onSearch(page)}
          />
        )}
      </React.Fragment>
    );
  }
}
