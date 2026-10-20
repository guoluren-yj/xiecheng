import React from 'react';
import { Modal, Form, Input, InputNumber, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import remoteHoc from 'hzero-front/lib/utils/remote';

import { EDIT_FORM_ITEM_LAYOUT_COL_2 } from 'utils/constants';

const { TextArea } = Input;
const FormItem = Form.Item;

@remoteHoc({
  code: 'SSRC_CHECK_PRICE_PACKAGE_RECOMMEND',
})
@Form.create({ fieldNameProp: null })
export default class PackageRecommendationModel extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {};
  }

  formRenderer = () => {
    const {
      basicInfoDs,
      form: { getFieldDecorator },
      item = {},
      remote,
      checkWay,
    } = this.props;

    const { current } = basicInfoDs;
    const { onlyAllowAllWinBids = 0 } = current?.get(['onlyAllowAllWinBids']) || {};

    const allottedRatioItem = (
      <FormItem
        label={intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`).d('分配比例%')}
        {...EDIT_FORM_ITEM_LAYOUT_COL_2}
      >
        {getFieldDecorator('allottedRatio', {
          rules: [
            {
              required: !!onlyAllowAllWinBids,
              message: intl.get('hzero.common.validation.notNull', {
                name: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`).d('分配比例%'),
              }),
            },
          ],
          initialValue: item?.allottedRatio,
        })(<InputNumber min={0} style={{ width: '100%' }} />)}
      </FormItem>
    );

    const allottedRatioItemRender = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_PACKAGE_RECOMMEND_PROCESS_RATIO_RENDER',
          allottedRatioItem,
          { item, checkWay, getFieldDecorator, onlyAllowAllWinBids }
        )
      : allottedRatioItem;

    return (
      <Form>
        <Row gutter={48}>
          <Col span={24}>{allottedRatioItemRender}</Col>
        </Row>

        <Row gutter={48}>
          <Col span={24}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.reason`).d('选用理由')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('suggestedRemark', {
                initialValue: item?.suggestedRemark,
              })(<TextArea rows={4} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  };

  render() {
    const {
      visible,
      hideModal,
      form,
      saveSuggestedRemark,
      confirmLoading,
      item = {},
      loadloading,
      customizeFlag = false,
      customizeUnitCode = '',
      customizeFormH0 = () => {},
      buttonLoading = false,
    } = this.props;

    return (
      <Modal
        visible={visible}
        width={700}
        onCancel={(e) => hideModal(e, item?.rfxLineSupplierId, item?.quotationHeaderId)}
        title={intl.get(`ssrc.inquiryHall.model.inquiryHall.distributionRatio`).d('分配比例')}
        onOk={saveSuggestedRemark}
        okText={intl.get('hzero.common.button.confirm').d('确认')}
        confirmLoading={loadloading || confirmLoading || buttonLoading}
        destroyOnClose
      >
        {customizeFlag
          ? customizeFormH0(
              {
                code: customizeUnitCode,
                form,
                dataSource: {},
              },
              this.formRenderer()
            )
          : this.formRenderer()}
      </Modal>
    );
  }
}
