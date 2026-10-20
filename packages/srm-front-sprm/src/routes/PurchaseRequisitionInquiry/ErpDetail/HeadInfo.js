import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
// import classnames from 'classnames';
// import styles from './Header.less';
import { dateTimeRender } from 'utils/renderer'; // 日期时间格式化
import intl from 'utils/intl';
// import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, FORM_COL_2_LAYOUT } from 'utils/constants';

// import DisplayFormItem from '../../components/DisplayFormItem';

const commonPrompt = 'sprm.common.model.common';
const FormItem = Form.Item;
export default class HeadInfo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      headerInfo,
      form,
      form: { getFieldDecorator },
      customizeForm,
    } = this.props;
    const { prSourcePlatform, prSourcePlatformMeaning, sourceCode, sourceCodeMeaning } = headerInfo;
    // const dataSource = headerInfo;
    return customizeForm(
      {
        code: 'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.HEARDER_ERP',
        dataSource: headerInfo,
        form,
      },
      <Form>
        <Row className="items-row" gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`${commonPrompt}.prNum`).d('采购申请编号')}>
              {getFieldDecorator('displayPrNum', {
                initialValue: headerInfo.displayPrNum,
              })(<span>{headerInfo.displayPrNum}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`entity.roles.creator`).d('创建人')}>
              {getFieldDecorator('createByName', {
                initialValue: headerInfo.createByName,
              })(<span>{headerInfo.createByName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`${commonPrompt}.creationTime`).d('创建时间')}>
              {getFieldDecorator('creationDate', {
                initialValue: headerInfo.creationDate,
              })(<span>{dateTimeRender(headerInfo.creationDate)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row className="items-row" gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源')}>
              {getFieldDecorator('prSourcePlatform', {
                initialValue: prSourcePlatform,
              })(<span>{prSourcePlatformMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        {prSourcePlatform === 'ERP' && (
          <Row className="items-row" gutter={48}>
            <Col span={8}>
              <FormItem label={intl.get(`${commonPrompt}.externalSystemName`).d('外部系统名称')}>
                {getFieldDecorator('sourceCode', {
                  initialValue: sourceCode,
                })(<span>{sourceCodeMeaning}</span>)}
              </FormItem>
            </Col>
          </Row>
        )}
        <Row className="items-row" gutter={48}>
          <Col span={24}>
            <FormItem label={intl.get(`${commonPrompt}.applyExplain`).d('申请说明')}>
              {getFieldDecorator('remark', {
                initialValue: headerInfo.remark,
              })(<span>{headerInfo.remark}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
