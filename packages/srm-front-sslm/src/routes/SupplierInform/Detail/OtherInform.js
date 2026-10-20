/**
 * PurchaseInform - 其他信息
 * @date: 2020-05-21
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import moment from 'moment';
import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { Row, Col, Form, Spin, DatePicker } from 'hzero-ui';
import { yesOrNoRender, dateRender } from 'utils/renderer';

import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@connect(({ supplierInform, loading }) => ({
  supplierInform,
  queryLoading: loading.effects[`supplierInform/querySupChangeOther`],
}))
@formatterCollections({ code: ['sslm.commonApplication', 'sslm.common'] })
@Form.create({ fieldNameProp: null })
export default class EliminateCreate extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      otherInform: {},
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.handleSupChangeOther();
  }

  componentDidUpdate(_, prevState) {
    if (isEmpty(prevState.otherInform) && !isEmpty(this.state.otherInform)) {
      this.forceUpdate();
    }
  }

  /**
   * 查询其他信息
   */
  @Bind()
  handleSupChangeOther() {
    const { dispatch, changeReqId } = this.props;
    dispatch({
      type: 'supplierInform/querySupChangeOther',
      payload: {
        changeReqId,
        customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.OTHER_INFO_FORM',
      },
    }).then(res => {
      if (res) {
        this.setState({ otherInform: res });
      }
    });
  }

  /**
   * 校验数据
   */
  @Bind()
  checkData() {
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    const { otherInform } = this.state;
    let otherInfoDTO = null;
    return new Promise((resolve, reject) => {
      validateFieldsAndScroll({ force: true }, (err, fieldsValue) => {
        if (err) {
          otherInfoDTO = null; // 校验不通过置为null
          notification.warning({
            message: intl
              .get(`sslm.enterpriseInform.view.message.warn.otherInfomWarn`)
              .d('其他信息填写有误'),
          });
          reject();
        } else {
          const { blacklistExpiryDate, ...values } = fieldsValue;
          // 取个性化字段的值
          otherInfoDTO = {
            ...otherInform,
            ...values,
            blacklistExpiryDate:
              blacklistExpiryDate && moment(blacklistExpiryDate).format(DEFAULT_DATETIME_FORMAT),
          };
          resolve(otherInfoDTO);
        }
      });
    });
  }

  render() {
    const {
      form,
      pubEdit,
      customizeForm,
      queryLoading,
      custLoading,
      changFlag,
      savePermissionFlag,
      form: { getFieldDecorator, getFieldValue = e => e },
    } = this.props;
    const { otherInform } = this.state;
    const dataSourceLoading = isEmpty(otherInform);
    const readOnly = changFlag || !savePermissionFlag;

    return (
      <Spin spinning={queryLoading}>
        {customizeForm(
          {
            code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.OTHER_INFO_FORM',
            form,
            dataSource: otherInform,
            dataSourceLoading,
            readOnly: pubEdit ? !pubEdit : readOnly,
          },
          <Form custLoading={custLoading}>
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.commonApplication.model.coApp.foreverBlacklistFlag')
                    .d('永久黑名单')}
                >
                  {getFieldDecorator('foreverBlacklistFlag', {
                    initialValue: otherInform.foreverBlacklistFlag,
                  })(yesOrNoRender(Number(otherInform.foreverBlacklistFlag)))}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.commonApplication.model.coApp.blacklistFlag')
                    .d('加入黑名单')}
                >
                  {getFieldDecorator('blacklistFlag', {
                    initialValue: otherInform.blacklistFlag,
                  })(yesOrNoRender(Number(otherInform.blacklistFlag)))}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.commonApplication.model.coApp.blacklistExpiryDate')
                    .d('黑名单失效时间')}
                >
                  {getFieldDecorator('blacklistExpiryDate', {
                    initialValue: otherInform.blacklistExpiryDate
                      ? moment(otherInform.blacklistExpiryDate, DEFAULT_DATE_FORMAT)
                      : null,
                    rules: [
                      {
                        required:
                          Number(getFieldValue('foreverBlacklistFlag')) === 0 &&
                          Number(getFieldValue('blacklistFlag')) === 1,
                      },
                    ],
                  })(
                    readOnly ? (
                      <span>{dateRender(otherInform.blacklistExpiryDate)}</span>
                    ) : (
                      <DatePicker
                        placeholder=""
                        style={{ width: '100%' }}
                        format={DEFAULT_DATE_FORMAT}
                        disabled={
                          Number(getFieldValue('foreverBlacklistFlag')) === 1 ||
                          Number(getFieldValue('blacklistFlag')) === 0
                        }
                      />
                    )
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
      </Spin>
    );
  }
}
