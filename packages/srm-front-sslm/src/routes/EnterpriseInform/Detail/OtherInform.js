/*
 * Detail - 其他信息
 * @date: 2019-10-29
 * @author: CDJ<dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { Row, Form, Spin } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import intl from 'utils/intl';

@connect(({ enterpriseInform, loading }) => ({
  enterpriseInform,
  queryLoading: loading.effects['enterpriseInform/querySupChangeOther'],
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
    const { dispatch, changeReqId, customizeUnitCode, customizeTenantId } = this.props;
    dispatch({
      type: 'enterpriseInform/querySupChangeOther',
      payload: {
        changeReqId,
        customizeUnitCode,
        customizeTenantId,
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
  async checkData() {
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
          reject(
            intl.get(`sslm.enterpriseInform.view.message.warn.otherInfomWarn`).d('其他信息填写有误')
          );
        } else {
          // 取个性化字段的值
          otherInfoDTO = {
            ...otherInform,
            ...fieldsValue,
          };
          resolve(otherInfoDTO);
        }
      });
    });
  }

  render() {
    const { form, pubEdit, changFlag, customizeForm, queryLoading, customizeUnitCode } = this.props;
    const { otherInform } = this.state;
    const dataSourceLoading = isEmpty(otherInform);

    return (
      <Spin spinning={queryLoading}>
        {customizeForm(
          {
            code: customizeUnitCode,
            form,
            dataSource: otherInform,
            dataSourceLoading,
            readOnly: pubEdit ? !pubEdit : changFlag,
          },
          <Form>
            <Row gutter={48} className="writable-row" />
          </Form>
        )}
      </Spin>
    );
  }
}
