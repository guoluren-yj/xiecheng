import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Row, Col } from 'hzero-ui';
import { SEARCH_FORM_CLASSNAME } from 'utils/constants';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId } from 'utils/utils';

import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();
const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

/**
 *评分细则模态框form
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
@connect(({ score, loading }) => ({
  score,
  loading: loading.effects['score/fetchElementsDetailLine'],
  save: loading.effects['score/saveElementsDetail'],
}))
@Form.create({ fieldNameProp: null })
export default class ManualReModal extends PureComponent {
  /**
   * 弹框-保存
   */
  @Bind()
  handleSaveRemark() {
    const { form = {}, record = {}, onChangeRemarkModal } = this.props;
    const { scoreIndicDetail = {} } = record;
    // 先验证头，再验证行
    form.validateFieldsAndScroll({ force: true }, (err, values) => {
      const newData = {
        ...scoreIndicDetail,
        ...values,
        tenantId: organizationId,
      };
      const saveData = { ...record, scoreIndicDetail: newData };
      if (!err) {
        onChangeRemarkModal(saveData);
        this.props.onHideModal();
      }
    });
  }

  /**
   * 关闭modal
   */
  @Bind()
  handleModalHide() {
    this.props.onHideModal();
  }

  render() {
    const { visible, record = {}, save, form = {} } = this.props;
    const { scoreIndicDetail = {} } = record;
    return (
      <React.Fragment>
        <Modal
          destroyOnClose
          width={500}
          visible={visible}
          onOk={this.handleSaveRemark}
          onCancel={this.handleModalHide}
          confirmLoading={save}
          title={intl.get('ssrc.score.view.title.remarkDetail').d('评分细项')}
          okText={intl.get('hzero.common.button.save').d('保存')}
        >
          <Form className={SEARCH_FORM_CLASSNAME}>
            <Row>
              <Col span={16} style={{ marginLeft: '50px' }}>
                <Form.Item
                  label={intl.get(`ssrc.score.model.score.remark`).d('评分细则')}
                  {...formLayout}
                >
                  {form.getFieldDecorator('remark', {
                    initialValue: scoreIndicDetail ? scoreIndicDetail.remark : null,
                  })(<Input />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </React.Fragment>
    );
  }
}
