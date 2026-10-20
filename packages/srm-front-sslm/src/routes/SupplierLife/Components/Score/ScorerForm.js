import React, { PureComponent } from 'react';
import { Form, Input, Button, InputNumber } from 'hzero-ui';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import Checkbox from 'components/Checkbox';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

const organizationId = getCurrentOrganizationId();
@formatterCollections({
  code: 'sslm.commonApplication',
})
@Form.create({ fieldNameProp: null })
export default class ScoreForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loginName: null,
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    onRef(this);
  }

  @Bind()
  userOnChange(record) {
    const { form } = this.props;
    const { realName, loginName } = record;
    this.setState({
      loginName,
    });
    form.setFieldsValue({
      respUserName: realName,
    });
  }

  @Bind()
  addScorer(params) {
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        this.props.addScorer({
          ...params,
          ...fieldsValue,
        });
      }
    });
  }

  render() {
    const { form, currentScorer = {} } = this.props;
    const { loginName } = this.state;
    const {
      respUserId,
      respLoginName: initialLoginName,
      respUserName,
      respWeight,
      processStatusMeaning,
      score,
      isStandard,
      isVeto,
      remark,
    } = currentScorer;
    return (
      <React.Fragment>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get('sslm.commonApplication.model.score.userId').d('评分用户名')}
        >
          {form.getFieldDecorator('respUserId', {
            initialValue: respUserId,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('sslm.commonApplication.model.score.scoreId').d('评分和用户名'),
                }),
              },
            ],
          })(
            <Lov
              code="SSLM.HIAM.TENANT.USER"
              textValue={initialLoginName}
              onOk={this.userOnChange}
              disabled={respUserId || respUserId === 0}
              queryParams={{ organizationId }}
            />
          )}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get('sslm.commonApplication.model.score.realNameDes').d('评分用户描述')}
        >
          {form.getFieldDecorator('respUserName', {
            initialValue: respUserName,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl
                    .get('sslm.commonApplication.model.score.realNameDes')
                    .d('评分用户描述'),
                }),
              },
            ],
          })(<Input disabled />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get('sslm.commonApplication.model.score.weightPercentage').d('权重（%）')}
        >
          {form.getFieldDecorator('respWeight', {
            initialValue: respWeight,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl
                    .get('sslm.commonApplication.model.score.weightPercentage')
                    .d('权重（%）'),
                }),
              },
            ],
          })(<InputNumber min={1} max={100} style={{ width: '100%' }} />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get('sslm.commonApplication.model.score.procStatus').d('评分状态')}
        >
          {form.getFieldDecorator('processStatusMeaning', {
            initialValue: processStatusMeaning,
          })(<Input disabled />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get('sslm.commonApplication.model.score.grade').d('评分')}
        >
          {form.getFieldDecorator('score', {
            initialValue: score,
          })(<Input disabled />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl
            .get(`sslm.commonApplication.model.commonApplication.isStandard`)
            .d('符合评分标准')}
        >
          {form.getFieldDecorator('isStandard', {
            initialValue: isStandard,
          })(<Checkbox disabled />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get(`sslm.commonApplication.model.commonApplication.isVeto`).d('否决该项')}
        >
          {form.getFieldDecorator('isVeto', {
            initialValue: isVeto,
          })(<Checkbox disabled />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl
            .get('sslm.commonApplication.model.commonApplication.scoreRemark')
            .d('评分说明')}
        >
          {form.getFieldDecorator('remark', {
            initialValue: remark,
          })(<Input disabled />)}
        </Form.Item>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'right',
            left: 0,
          }}
        >
          <Button
            style={{
              marginRight: 8,
            }}
            onClick={this.props.onClose}
          >
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              this.addScorer({
                ...currentScorer,
                respLoginName: loginName || currentScorer.respLoginName,
              });
            }}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        </div>
      </React.Fragment>
    );
  }
}
