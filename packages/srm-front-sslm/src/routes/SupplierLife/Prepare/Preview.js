/**
 * Recommend - 供应商生命周期配置 - 合格申请只读组件
 * @date: 2018-10-15
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Tabs, Form } from 'hzero-ui';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import PreviewHeader from './PreviewHeader';
import SupplierClassificationTable from '../Components/Detail/SupplierClassificationTable';
import EnclosureTable from '../Components/Detail/EnclosureTable';
import ScoreInfoTable from '../Components/Score/ScoreInfoTable';
import SupplyAbilityTable from '../Components/Detail/SupplyAbilityTable';

@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_HEADER',
    'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_TAB',
    'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_SCORE_TABLE',
    'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_ITEM_TABLE',
  ],
})
export default class PreparePreview extends PureComponent {
  render() {
    const { form, custLoading, customizeForm, customizeTabPane, customizeTable } = this.props;

    return (
      <React.Fragment>
        <div style={{ marginLeft: 16 }}>
          <PreviewHeader form={form} customizeForm={customizeForm} custLoading={custLoading} />
        </div>
        {customizeTabPane(
          {
            code: 'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_TAB',
          },
          <Tabs animated={false}>
            <Tabs.TabPane
              tab={intl.get('sslm.commonApplication.view.message.gradInformation').d('评分信息')}
              key="scoreInfo"
            >
              <ScoreInfoTable
                customizeTable={customizeTable}
                code="SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_SCORE_TABLE"
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl
                .get('sslm.commonApplication.view.message.tab.supplyAbility')
                .d('供货能力清单')}
              key="supplierCapacity"
            >
              <SupplyAbilityTable
                customizeTable={customizeTable}
                tableCode="SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_ITEM_TABLE"
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl
                .get('sslm.commonApplication.view.message.tab.supplierAssort')
                .d('供应商分类')}
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
