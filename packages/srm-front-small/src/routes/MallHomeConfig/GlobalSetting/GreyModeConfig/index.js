import React, { useEffect } from 'react';
import { compose } from 'lodash';
import { connect } from 'dva';

import intl from 'hzero-front/lib/utils/intl';
import { Form, SelectBox, DatePicker, Row, Col, CheckBox } from 'choerodon-ui/pro';
import { Observer } from 'mobx-react-lite';
import styles from './index.less';

const { Option } = SelectBox;
function GreyModeConfig(props) {
  const { mallHomeConfig, dataSet} = props;
  useEffect(() => {
    dataSet.loadData([ {
      greyMode: 0, // 默认不启用
      greyModeRange: 'HOMEPAGE', // 默认全局
      ...mallHomeConfig,
    },
     ]);
  }, [mallHomeConfig]);
  return (
    <div className={styles['grey-mode-config']}>
      {/* 灰色主题配置 */}
      <p className="desc">
        {intl
          .get(`small.mallHomeConfig.view.greyThemeConfigTips`)
          .d('一旦启用，商城主题色将变为灰色，全局范围影响较大，请谨慎操作')}
      </p>
      <Observer>
        {() => {
          const greyMode = dataSet.current.get('greyMode');
          return (
            <Form labelLayout="float" columns={1} dataSet={dataSet}>
              <CheckBox name="greyMode" />
              {greyMode && (
                <>
                  <SelectBox name="greyModeRange" className="float-item">
                    <Option value="HOMEPAGE" key="HOMEPAGE">
                      {intl.get('small.mallHomeConfig.productConfig.card.home').d('首页')}
                    </Option>
                    <Option value="ALL" key="ALL">
                      {intl.get(`small.mallHomeConfig.productConfig.card.all`).d('全局')}
                    </Option>
                  </SelectBox>
                  <Row gutter={18}>
                    <Col span={12}>
                      <DatePicker name="validityDate" />
                    </Col>
                  </Row>
                </>
              )}
            </Form>
          );
        }}
      </Observer>
    </div>
  );
}

export default compose(
  connect(({ mallHomeConfig }) => ({
    mallHomeConfig,
  }))
)(GreyModeConfig);
