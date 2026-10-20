/**
 * CreditConfig - 平台征信配置
 * @date: 2019-07-22
 * @author LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import {isNil} from 'lodash';
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Form, InputNumber, Row, Col, Select, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { getResponse } from "utils/utils";
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { queryMapIdpValue } from 'services/api';
import formatterCollections from 'utils/intl/formatterCollections';

import SubCheckBox from '../ConfigServer/components/SubCheckBox';
import SubMessage from '../ConfigServer/components/SubMessage';

import styles from './index.less';

const formLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 },
};

@connect(({ creditConfig, loading }) => ({
  creditConfig,
  loading: loading.effects['creditConfig/saveSettings']||loading.effects['creditConfig/fetchSettings'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['spfm.CreditConfig', 'spfm.PlatformCreditsConfig'] })
export default class CreditConfig extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      code: {},
    };
  }

  componentDidMount() {
    this.handleInit();
    this.handleFetchConfig();
  }

  @Bind()
  handleInit(){
    queryMapIdpValue({
      labelMethod: "SPFM_ENTERPRISE_LABEL_GET_METHOD",
    }).then(response=>{
      const res = getResponse(response);
      if(res){
        this.setState({code: res});
      }
    });
  }

  /**
   * 查询配置
   */
  @Bind()
  handleFetchConfig() {
    const { dispatch } = this.props;
    dispatch({
      type: 'creditConfig/fetchSettings',
    });
  }

  /**
   * 保存配置
   */
  @Bind()
  handleSaveConfig() {
    const {
      dispatch,
      form: { validateFields },
    } = this.props;
    validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'creditConfig/saveSettings',
          payload: values,
        }).then((res) => {
          if (res) {
            notification.success();
            this.handleFetchConfig();
          }
        });
      }
    });
  }

  @Bind()
  handleChange(e = {}, flag = false) {
    const {
      form: { setFieldsValue, getFieldValue },
    } = this.props;
    if (!e.target.checked) {
      if (flag && !getFieldValue('000105')) {
        setFieldsValue({ '000102': 0 });
      } else if (!getFieldValue('000101')) {
        setFieldsValue({ '000102': 0 });
      }
    }
  }

  render() {
    const {
      loading,
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      creditConfig: { settings = {} },
    } = this.props;
    const {code} = this.state;
    const showThirdInterface =Boolean(!isNil(getFieldValue("000110"))?getFieldValue("000110") : settings['000110']);
    // 定义在前，解决未注册设置值问题
    const thirdInterface = (
      <div className={styles["extra-componnet"]}>
        <Form.Item
          label={intl.get('spfm.CreditConfig.view.message.thirdInterface').d('第三方接口')}
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 14 }}
        >
          {getFieldDecorator('000111', {
                      rules: [
                        {
                          required: showThirdInterface,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('spfm.CreditConfig.view.message.thirdInterface').d('第三方接口'),
                          }),
                        },
                      ],
                        initialValue: settings['000111']||'ZHIMA_LABEL',
                      })(
                        <Select allowClear={false} style={{width: 152}}>
                          {
                        (code.labelMethod||[]).map(n=>(
                          <Select.Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Select.Option>
))
                        }
                        </Select>)}
        </Form.Item>
      </div>
    );
    return (
      <Fragment>
        <Header title={intl.get('spfm.PlatformCreditsConfig.view.message.title').d('平台征信配置')}>
          <Button icon="save" type="primary" loading={loading} onClick={this.handleSaveConfig}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={loading}>
            <div className={styles['credits-config']}>
              <Row>
                <SubCheckBox
                  content={intl
                  .get(`spfm.CreditConfig.view.message.configFour`)
                  .d('配置1：企业认证时开启OCR自动识别')}
                  getFieldDecorator={getFieldDecorator}
                  initialValue={settings['000106']}
                  field="000106"
                  onChange={(e) => this.handleChange(e, false)}
                  span={6}
                />
                <Col span={18}>
                  <Form.Item
                    label={intl.get('spfm.CreditConfig.view.message.orcMaxCount').d('OCR识别限制次数')}
                    {...formLayout}
                  >
                    {getFieldDecorator('000109', {
                  initialValue: settings['000109'],
                })(<InputNumber min={1} step={1} precision={0} />)}
                  </Form.Item>
                </Col>
              </Row>
              <SubMessage
                content={intl
                .get(`spfm.CreditConfig.view.message.configFourSubMsg`)
                .d('若勾选，则在进行企业认证时，上次营业执照可以进行自动识别')}
              />
              <SubCheckBox
                content={intl
                .get(`spfm.CreditConfig.view.message.configOne`)
                .d('配置2：企业认证信息提交时调用第三方接口')}
                getFieldDecorator={getFieldDecorator}
                initialValue={settings['000105']}
                field="000105"
                onChange={(e) => this.handleChange(e, false)}
              />
              <SubMessage
                content={intl
                .get(`spfm.CreditConfig.view.message.configOneSubMsg`)
                .d('若勾选，则在提交企业认证信息时，自动调用第三方接口校验信息真实性')}
              />
              {/* <SubCheckBox
              content={intl
                .get(`spfm.CreditConfig.view.message.000101`)
                .d('配置3：企业认证信息提交时调用斯瑞德')}
              getFieldDecorator={getFieldDecorator}
              initialValue={settings['000101']}
              field="000101"
              onChange={(e) => this.handleChange(e, true)}
            />
            <SubMessage
              content={intl
                .get(`spfm.CreditConfig.view.message.000101subMsg`)
                .d('若勾选，则在提交企业认证信息时，自动调用斯瑞德接口校验信息真实性')}
            /> */}
              <SubCheckBox
                content={intl
                .get(`spfm.CreditConfig.view.message.configFive`)
                .d('配置3：个人认证信息提交时调用E签宝')}
                getFieldDecorator={getFieldDecorator}
                initialValue={settings['000107']}
                field="000107"
                onChange={(e) => this.handleChange(e, false)}
              />
              <SubMessage
                content={intl
                .get(`spfm.CreditConfig.view.message.configFiveSubMsg`)
                .d('若勾选，则在提交个人认证信息时，自动调用e签宝接口校验信息真实性')}
              />
              <SubCheckBox
                content={intl
                .get(`spfm.CreditConfig.view.message.000102`)
                .d('配置4：征信验证后根据认证结果自动审批')}
                getFieldDecorator={getFieldDecorator}
                initialValue={settings['000102']}
                field="000102"
                disabled={!getFieldValue('000105')}
              />
              <SubMessage
                content={intl
                .get(`spfm.CreditConfig.view.message.000102subMsg`)
                .d(
                  '若勾选，则当征信验证通过时，自动进行企业认证审批（需勾选配置2，方可勾选配置4）'
                )}
              />
              <SubCheckBox
                content={intl
                .get(`spfm.CreditConfig.view.message.configCompanyName`)
                .d('配置5：企业名称自动搜索')}
                getFieldDecorator={getFieldDecorator}
                initialValue={settings['000108']}
                field="000108"
              />
              <SubMessage
                content={intl
                .get(`spfm.CreditConfig.view.message.configCompanyNameSubMsg`)
                .d(
                  '若勾选，在企业认证过程中填写企业名称时，调用第三方接口，根据填写的部分字段搜索相匹配的企业全称'
                )}
              />
              <SubCheckBox
                content={intl
                  .get("spfm.CreditConfig.view.message.enterpriseLabel")
                  .d('配置6：获取企业标签')}
                getFieldDecorator={getFieldDecorator}
                initialValue={settings['000110']}
                field="000110"
                style={{display: "flex", alignItems: "center"}}
                onChange={()=>{
                  setFieldsValue({
                    "000111": 'ZHIMA_LABEL',
                  });
                }}
                otherComponnets={showThirdInterface&&thirdInterface}
              />
              <SubMessage
                content={intl
                .get(`spfm.CreditConfig.view.message.enterpriseLabelMsg`)
                .d('选择会员供应商拓展功能中，获取供应商企业标签时，调用的第三方接口')}
              />
            </div>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
