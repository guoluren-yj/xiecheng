import React, { PureComponent } from 'react';
import { Drawer, Button, Form, Row, Col, Input, DatePicker } from 'hzero-ui';
import intl from 'utils/intl';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import { getDateFormat } from 'utils/utils';
import styles from '@/routes/common.less';

const promptCode = 'sqam.common';
const { TextArea } = Input;

@Form.create({ fieldNameProp: null })
export default class MoreFieldsDrawer extends PureComponent {
  renderForm() {
    const { form, customizeForm, modalType = 'cancel', approveType } = this.props;
    const { getFieldDecorator } = form;
    const label =
      modalType === 'cancel'
        ? intl.get(`${promptCode}.incomingInspectionQuery.cancelRemark`).d('取消原因')
        : intl.get(`${promptCode}.incomingInspectionQuery.auditOpinion`).d('审核意见');
    return customizeForm(
      {
        code:
          modalType === 'cancel'
            ? 'SQAM.AUDIT_8D_DETAIL.MODAL_CANCEL'
            : approveType === 'reject'
            ? 'SQAM.AUDIT_8D_DETAIL.REJECT_STAGE'
            : approveType === 'continue'
            ? 'SQAM.AUDIT_8D_DETAIL.PCA_STAGE'
            : 'SQAM.AUDIT_8D_DETAIL.APPROVE_STAGE',
        form,
      },

      <Form layout="inline" className={styles['sqam-approve-modal']}>
        {modalType === 'cancel' && (
          <Row {...SEARCH_FORM_ROW_LAYOUT}>
            <Col span>
              <Form.Item label={label}>
                {getFieldDecorator('cancelRemark', {})(<TextArea rows={5} />)}
              </Form.Item>
            </Col>
          </Row>
        )}
        {modalType !== 'cancel' && (
          <Row {...SEARCH_FORM_ROW_LAYOUT}>
            <Col span>
              <Form.Item label={label}>
                {getFieldDecorator('approvedRemark', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.incomingInspectionQuery.auditOpinion`)
                          .d('审核意见'),
                      }),
                    },
                  ],
                })(<TextArea rows={5} />)}
              </Form.Item>
            </Col>
          </Row>
        )}
        {approveType === 'completed' && modalType === 'approve' && (
          <Row {...SEARCH_FORM_ROW_LAYOUT}>
            <Col span>
              <Form.Item
                label={intl
                  .get(`${promptCode}.view.message.expectedTrackTime`)
                  .d('期望成效追踪时间')}
              >
                {getFieldDecorator(
                  'expectedTrackTime',
                  {}
                )(<DatePicker placeholder="" format={getDateFormat()} />)}
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
    );
  }

  render() {
    const { visible, onHideDrawer, onConfirm, oprLoading, form, modalType = 'cancel' } = this.props;
    const drawerProps = {
      title:
        modalType === 'cancel'
          ? intl.get(`${promptCode}.view.cancleInfo`).d('取消信息')
          : intl.get(`${promptCode}.view.approveInfo`).d('审核信息'),
      visible,
      mask: true,
      onClose: () => onHideDrawer(false, form),
      width: 450,
      style: {
        overflowX: 'hidden',
        height: 'calc(100% - 103px)',
        padding: '12px',
      },
    };
    return (
      <Drawer {...drawerProps}>
        {this.renderForm()}
        <footer
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            // right: 0,
            textAlign: 'right',
            padding: '12px 24px',
            borderTop: '1px solid #f5f5f5',
            backgroundColor: '#fff',
          }}
        >
          <Button
            type="primary"
            onClick={() => onConfirm(form)}
            style={{ marginRight: 8 }}
            loading={oprLoading}
          >
            {intl.get('hzero.common.button.sure').d('确定')}
          </Button>
          <Button onClick={() => onHideDrawer(false, form)}>
            {intl.get('hzero.common.status.cancel').d('取消')}
          </Button>
        </footer>
      </Drawer>
    );
  }
}
