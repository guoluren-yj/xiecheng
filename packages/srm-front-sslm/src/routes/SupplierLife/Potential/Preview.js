/**
 * Potential - 供应商生命周期配置 - 潜在申请单只读组件
 * @date: 2018-9-14
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Tabs, Form } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import HeaderInfo from './PreviewHeader';
import SupplyAbilityTable from '../Components/Detail/SupplyAbilityTable';
import SupplierClassificationTable from '../Components/Detail/SupplierClassificationTable';
import EnclosureTable from '../Components/Detail/EnclosureTable';
import ScoreInfoTable from '../Components/Score/ScoreInfoTable';

@formatterCollections({ code: ['sslm.commonApplication', 'sslm.common'] })
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_HEADER',
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ITEM_TABLE',
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_TAB',
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_SCORE_TABLE',
  ],
})
export default class PotentialPreview extends PureComponent {
  render() {
    const { form, custLoading, customizeForm, customizeTable, customizeTabPane } = this.props;

    return (
      <React.Fragment>
        <div style={{ marginLeft: 16 }}>
          <HeaderInfo form={form} customizeForm={customizeForm} custLoading={custLoading} />
        </div>
        {customizeTabPane(
          {
            code: 'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_TAB',
          },
          <Tabs animated={false}>
            <Tabs.TabPane
              tab={intl.get('sslm.commonApplication.view.message.gradInformation').d('评分信息')}
              key="scoreInfo"
            >
              <ScoreInfoTable
                customizeTable={customizeTable}
                code="SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_SCORE_TABLE"
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl
                .get('sslm.commonApplication.view.message.tab.supplyAbility')
                .d('供货能力清单')}
              key="supplyAbility"
            >
              <SupplyAbilityTable
                customizeTable={customizeTable}
                tableCode="SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ITEM_TABLE"
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('sslm.common.view.supplier.class').d('供应商分类')}
              key="supplierClassification"
            >
              <SupplierClassificationTable />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('hzero.common.upload.modal.title').d('附件')}
              key="enclosure"
            >
              <EnclosureTable />
            </Tabs.TabPane>
          </Tabs>
        )}
      </React.Fragment>
    );
  }
}
