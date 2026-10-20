/**
 * 议价规则弹窗 --- 迁移原本代码
 * @date: 2021-07-07
 * @author: Goku<xu.pan01@going-link.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, ZhenYun
 */
import React, { PureComponent } from 'react';
import { Modal, Row, Col, Form, Select } from 'hzero-ui';
import { map, isFunction } from 'lodash';

import intl from 'utils/intl';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class BargainRuleModal extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    // eslint-disable-next-line no-unused-expressions
    isFunction(onRef) && onRef(this, 'bargainRuleModalRef');
  }

  render() {
    const {
      visible,
      sourceType = [],
      hideBargainModal,
      openBargainModal,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Modal
        visible={visible}
        onCancel={hideBargainModal}
        width={430}
        onOk={openBargainModal}
        title={intl.get('ssrc.bidHall.model.bidHall.selectSourceType').d('选择议价方式')}
      >
        <Row gutter={48}>
          <Col span={24} style={{ marginLeft: '20%' }}>
            <FormItem
              label={intl.get('ssrc.bidHall.model.bidHall.sourceType').d('议价方式')}
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 19 }}
            >
              {getFieldDecorator('sourceType', {
                initialValue: 'ONLINE',
              })(
                <Select style={{ width: '100px' }}>
                  {map(sourceType, (item) => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
      </Modal>
    );
  }
}
