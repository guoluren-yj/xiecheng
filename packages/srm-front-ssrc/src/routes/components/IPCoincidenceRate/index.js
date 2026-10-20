/**
 * IPCoincidenceRate - Ip重合率
 * @date: 2019 11/19
 * @author: CJ <juan.chen01@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Modal, Form, Button } from 'hzero-ui';
import { compose, noop } from 'lodash';
import { observer } from 'mobx-react';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import { INQUIRY, BID, getQuotationName } from '@/utils/globalVariable';
import CPopover from '@/routes/components/CPopover';

/**
 * TODO 后边需要重构改组件
 */
class IPCoincidenceRate extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getColumns = () => {
    const { sourceKey = INQUIRY } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.common.company`).d('公司'),
        dataIndex: 'supplierCompanyName',
        width: '',
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonSupplierCompanyIp`, {
            quotationName: getQuotationName(sourceKey === BID),
          })
          .d('{quotationName}IP'),
        dataIndex: 'supplierCompanyIp',
        width: 120,
      },
      {
        title: `${intl.get(`ssrc.inquiryHall.model.inquiryHall.companyIpRate`).d('最高重合率')}(%)`,
        dataIndex: 'companyIpRate',
        width: 120,
        // render: (val) => `${val}%`,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.coincidenceCompanyName`).d('重合公司'),
        dataIndex: 'coincidenceCompanyName',
        width: 150,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.coincidenceSupplierIp`).d('重合IP'),
        dataIndex: 'coincidenceSupplierIp',
        width: 120,
      },
    ];

    return columns.filter(Boolean);
  };

  getCurrentCustomizeUnitCode = () => {
    const {
      // pageName = null, // 多页面共用组件，个性化编码可能需要判定
      customizeUnitCode = null, // 个性化单元
    } = this.props;

    if (customizeUnitCode) {
      return customizeUnitCode;
    }
  };

  render() {
    const {
      visible,
      onConfirmIpCoincidenceRate,
      dataSource,
      loading,
      customizeTable = noop,
      useCustomFlag = false, // 启用使用个性化标识
    } = this.props;

    const columns = this.getColumns();
    const unitCode = this.getCurrentCustomizeUnitCode();

    const modalProps = {
      visible,
      width: 720,
      // onOk: onConfirmIpCoincidenceRate,
      onCancel: onConfirmIpCoincidenceRate,
      title: intl.get(`ssrc.inquiryHall.view.message.title.IPCoincidenceRate`).d('IP重合率'),
      footer: (
        <Button type="primary" onClick={onConfirmIpCoincidenceRate}>
          {intl.get('hzero.common.button.ok').d('确定')}
        </Button>
      ),
    };

    const tableProps = {
      columns,
      dataSource,
      loading,
      // scroll: { y: 350 },
      pagination: false,
      rowKey: (record, index) => index,
      bordered: true,
    };

    return (
      <Modal {...modalProps}>
        <div style={{ marginBottom: '16px' }}>
          {intl
            .get('ssrc.common.view.ipOnlyReferenceWarning')
            .d('供应商报价/投标时，IP可通过使用代理服务等操作进行包装，此结果仅用于参考')}
        </div>
        {useCustomFlag && unitCode ? (
          customizeTable({ code: unitCode, dataSource }, <Table {...tableProps} />)
        ) : (
          <Table {...tableProps} />
        )}
      </Modal>
    );
  }
}

/**
 * 承载弹窗的主页面框架不同，所以customizeTable组件内部生成
 */
const hocUpdate = (Com) => {
  return compose(
    withCustomize({
      unitCode: [
        'SSRC.INQUIRY_HALL_CHECK_PRICE.IPCOINCIDENCE_TABLE',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.IPCOINCIDENCE_TABLE',
        'SSRC.INQUIRY_HALL_CHECK_PRICE.IPCOINCIDENCE_TABLE_APPROVAL',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.IPCOINCIDENCE_TABLE_APPROVAL',
      ],
    }),
    formatterCollections({
      code: ['ssrc.inquiryHall', 'ssrc.common', 'ssrc.scux'],
    }),
    Form.create({ fieldNameProp: null })
  )(observer(Com));
};

export default hocUpdate(IPCoincidenceRate);
