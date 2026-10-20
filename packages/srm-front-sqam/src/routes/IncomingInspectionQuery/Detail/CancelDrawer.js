import React, { PureComponent } from 'react';
import { Drawer, Button, Form, Row, Col, Input } from 'hzero-ui';
import intl from 'utils/intl';
import { EDIT_FORM_ITEM_LAYOUT_COL_2, SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';

const promptCode = 'sqam.incomingInspectionQuery';
const { TextArea } = Input;

@Form.create({ fieldNameProp: null })
export default class MoreFieldsDrawer extends PureComponent {
  renderForm() {
    const { form, customizeForm } = this.props;
    const { getFieldDecorator } = form;

    return customizeForm(
      { code: 'SQAM.INCOMING_INSPECTION_QUERY_DETAIL.CANCEL', form },

      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span>
            <Form.Item
              label={intl.get(`${promptCode}.incomingInspectionQuery.cancelReason`).d('取消原因')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('cancelReason', {})(<TextArea rows={5} />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { visible, onHideDrawer, onConfirm, cancelLoading, form } = this.props;
    const drawerProps = {
      title: intl.get(`${promptCode}.view.cancleInfo`).d('取消信息'),
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
            // loading={cancelLoading}
            type="primary"
            onClick={() => onConfirm(form)}
            style={{ marginRight: 8 }}
            loading={cancelLoading}
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
