import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';

import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { getDocumentTypeName, getCategoryCode } from '@/utils/globalVariable';

import styles from './index.less';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class HeaderInfoForm extends PureComponent {
  render() {
    const { form, customizeForm, header = {}, sourceKey, bidFlag } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div>
        <Row>
          <Col
            {...FORM_COL_3_LAYOUT}
            style={{ fontWeight: 500, fontSize: '16px', marginBottom: '15px' }}
          >
            {intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
          </Col>
        </Row>
        {customizeForm(
          {
            code: `SSRC.${sourceKey}_HALL.BARGAIN.BASEINFO_FORM`,
            form,
            dataSource: header,
          },
          <Form className={styles['form-style']}>
            <Row>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.commonInquiryHall.RFXNo.`, {
                      categoryCode: getCategoryCode(bidFlag),
                    })
                    .d('{categoryCode}单号')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('rfxNum', {
                    initialValue: header?.rfxNum,
                  })(<span>{header.rfxNum}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.inquiryTitleRFX`, {
                      documentTypeName: getDocumentTypeName(bidFlag),
                    })
                    .d(`{documentTypeName}标题`)}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('rfxTitle', {
                    initialValue: header?.rfxTitle,
                  })(<span>{header.rfxTitle}</span>)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
      </div>
    );
  }
}
