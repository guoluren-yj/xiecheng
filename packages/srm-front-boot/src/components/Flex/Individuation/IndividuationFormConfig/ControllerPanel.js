import React, { PureComponent } from 'react';
import { Card } from 'hzero-ui';
// import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import FieldPropsList from './FieldPropsList';

export default class ControllerPanel extends PureComponent {
  render() {
    const {
      loading = false,
      children,
      dataSource,
      onDefaultFieldPropsChange = () => {},
      onFieldPropsChange = () => {},
      onLayoutChange = () => {},
    } = this.props;
    return (
      <div style={{ padding: '10px 10px 10px 0', overflow: 'scroll', maxWidth: 780 }}>
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          loading={loading}
          title={
            <h4>{intl.get('hpfm.individuationForm.view.title.preview').d('自定义效果预览')}</h4>
          }
        >
          {children}
        </Card>
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          loading={loading}
          title={
            <h4>{intl.get(`hpfm.individuationForm.view.title.fieldProps`).d('字段属性配置')}</h4>
          }
        >
          <div style={{ maxHeight: 350, overflowY: 'scroll' }}>
            <FieldPropsList
              dataSource={dataSource}
              loading={loading}
              onDefaultFieldPropsChange={onDefaultFieldPropsChange}
              onFieldPropsChange={onFieldPropsChange}
              onLayoutChange={onLayoutChange}
            />
          </div>
        </Card>
      </div>
    );
  }
}
