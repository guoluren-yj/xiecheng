/**
 * SupplierRecord - 开标弹框
 * @date: 2019 1/2
 * @author: zili.hou@hand-china
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Input, Table, Form, Row, Col, Button } from 'hzero-ui';
import intl from 'utils/intl';
import style from './OpeningBid.less';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
@Form.create({ fieldNameProp: null })
export default class SupplierRecord extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form: { getFieldDecorator },
      visible,
      hideModal,
      dataSource,
      confirmOpeningBid,
      resendPassword,
      bidOpenDataLoading,
      resendPasswordLoading,
      tableRecord = {},
    } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.kaibiaoren`).d('开标人'),
        dataIndex: 'userName',
        width: 200,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.kaibiaozhuangtai`).d('开标状态'),
        dataIndex: 'openedFlagMeaning',
        width: 80,
      },
    ];
    const modalProps = {
      visible,
      width: 500,
      footer: null,
      onCancel: hideModal,
      bodyStyle: { maxHeight: '650px', overflow: 'auto' },
      title: intl.get(`ssrc.bidHall.view.title.openingBid`).d('开标'),
    };
    return (
      <React.Fragment>
        <Modal {...modalProps}>
          {tableRecord.openPasswordFlag ? (
            <Form>
              <Row>
                <Col span={22}>
                  <FormItem
                    label={intl
                      .get(`ssrc.bidHall.model.bidHall.inputBidPassword`)
                      .d('输入开标密码')}
                    {...formLayout}
                  >
                    {getFieldDecorator('openPassword', {
                      rules: [
                        {
                          max: 10,
                          message: intl.get('hzero.common.validation.max', {
                            max: 10,
                          }),
                        },
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`ssrc.bidHall.model.bidHall.bidPassword`).d('开标密码'),
                          }),
                        },
                      ],
                    })(<Input trim inputChinese={false} style={{ marginLeft: 5 }} />)}
                  </FormItem>
                </Col>
              </Row>
            </Form>
          ) : null}
          <Table
            bordered
            rowKey="bidMemberId"
            loading={bidOpenDataLoading}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
          />
          <div className={style['open-bid']} style={{ marginTop: '24px' }}>
            <Form layout="inline">
              <Button type="primary" style={{ marginRight: 24 }} onClick={confirmOpeningBid}>
                {intl.get(`ssrc.bidHall.view.button.confirmOpeningBid`).d('确认开标')}
              </Button>
              {tableRecord.openPasswordFlag ? (
                <Button
                  loading={resendPasswordLoading}
                  style={{ marginLeft: 8 }}
                  onClick={resendPassword}
                >
                  {intl.get(`ssrc.bidHall.view.button.resendPassword`).d('重发密码')}
                </Button>
              ) : null}
            </Form>
          </div>
        </Modal>
      </React.Fragment>
    );
  }
}
