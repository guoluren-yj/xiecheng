/**
 * Recommend - 供应商生命周期配置 - 淘汰申请单只读组件
 * @date: 2018-9-14
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Tabs, Form } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
import HeaderInfo from './PreviewHeader';
import SupplierClassificationTable from '../Components/Detail/SupplierClassificationTable';
import EnclosureTable from '../Components/Detail/EnclosureTable';

@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_HEADER', 'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_TAB'],
})
export default class EliminatePreview extends PureComponent {
  state = {
    isEdit: false,
  };

  render() {
    const { isEdit } = this.state;
    const {
      supplierClassificationTableProps = {},
      enclosureTableProps = {},
      form,
      customizeForm,
      customizeTabPane,
      custLoading,
    } = this.props;
    return (
      <React.Fragment>
        <div className="table-list-search" style={{ marginLeft: 16 }}>
          <HeaderInfo form={form} customizeForm={customizeForm} custLoading={custLoading} />
        </div>
        {customizeTabPane(
          {
            code: 'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_TAB',
          },
          <Tabs animated={false}>
            <Tabs.TabPane
              tab={intl.get('sslm.common.view.supplier.class').d('供应商分类')}
              key="supplierClassification"
            >
              <SupplierClassificationTable tableProps={supplierClassificationTableProps} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('hzero.common.upload.modal.title').d('附件')}
              key="enclosure"
            >
              <EnclosureTable isEdit={isEdit} tableProps={enclosureTableProps} />
            </Tabs.TabPane>
          </Tabs>
        )}
      </React.Fragment>
    );
  }
}
