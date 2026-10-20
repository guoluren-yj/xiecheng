/**
 * Recommend - 供应商生命周期配置 - 推荐申请单只读组件
 * @date: 2018-9-14
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Tabs, Form } from 'hzero-ui';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import HeaderInfo from './PreviewHeader';
import CategoryMaterialTable from '../Components/Detail/CategoryMaterialTable';
import SupplierClassificationTable from '../Components/Detail/SupplierClassificationTable';
import EnclosureTable from '../Components/Detail/EnclosureTable';
import ScoreInfoTable from '../Components/Score/ScoreInfoTable';

@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_LIFE_MANAGE.RECOMMEND_HEADER',
    'SSLM.SUPPLIER_LIFE_MANAGE.RECOMMEND_ITEM_TABLE',
    'SSLM.SUPPLIER_LIFE_MANAGE.RECOMMEND_TAB',
    'SSLM.SUPPLIER_LIFE_MANAGE.RECOMMEND_SCORE_TABLE',
  ],
})
@Form.create({ fieldNameProp: null })
export default class RecommendPreview extends PureComponent {
  render() {
    const { form, custLoading, customizeForm, customizeTable, customizeTabPane } = this.props;
    return (
      <React.Fragment>
        <div style={{ marginLeft: 16 }}>
          <HeaderInfo form={form} customizeForm={customizeForm} custLoading={custLoading} />
        </div>
        {customizeTabPane(
          {
            code: 'SSLM.SUPPLIER_LIFE_MANAGE.RECOMMEND_TAB',
          },
          <Tabs animated={false}>
            <Tabs.TabPane
              tab={intl.get('sslm.commonApplication.view.message.gradInformation').d('评分信息')}
              key="scoreInfo"
            >
              <ScoreInfoTable
                customizeTable={customizeTable}
                code="SSLM.SUPPLIER_LIFE_MANAGE.RECOMMEND_SCORE_TABLE"
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl
                .get(`sslm.commonApplication.view.message.categoryMaterial`)
                .d('推荐物料/品类')}
              key="categoryMaterial"
            >
              <CategoryMaterialTable tableProps={{ customizeTable }} />
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
