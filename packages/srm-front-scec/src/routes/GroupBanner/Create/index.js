/**
 * GroupBanner - 集团Banner管理新建
 * @date: 2019-12-30
 * @author: zz <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import {
  Button,
  Select,
  Form,
  Input,
  Row,
  Col,
  DatePicker,
  InputNumber,
  Spin,
  Collapse,
  Icon,
} from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { routerRedux } from 'dva/router';
import { isEmpty } from 'lodash';

import { PUBLIC_BUCKET } from '_utils/config';
import { Header, Content } from 'components/Page';
import Upload from 'components/Upload/UploadButton';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

const { Panel } = Collapse;
const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
// const viewPrompt = 'ssrc.inquiryHall.view.message';
const messagePrompt = 'scec.groupBanner.model.groupBanner';

@connect(({ groupBanner, loading }) => ({
  groupBanner,
  organizationId: getCurrentOrganizationId(),
  saveGroupBannerLoading: loading.effects['groupBanner/saveGroupBanner'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['scec.groupBanner'] })
export default class Create extends Component {
  state = {
    collapseKeys: {},
    // initilaTime: '',
  };

  componentDidMount() {
    this.fetchBannerTypeValue();
  }

  /**
   * 查询-Banner类型值集
   */
  @Bind()
  fetchBannerTypeValue() {
    const { dispatch } = this.props;
    dispatch({
      type: 'groupBanner/fetchBannerTypeValue',
    });
  }

  /**
   * 图片上传成功后的回调
   */
  @Bind()
  uploadSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.setFieldsValue({
        imagePath: file.response,
      });
    }
  }

  /**
   * 图片删除成功后的回调
   */
  @Bind()
  cancelSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.setFieldsValue({
        imagePath: '',
      });
    }
  }

  /**
   * 保存-banner
   * 租户级传organizationId 和companyId
   */
  @Bind()
  saveBanner() {
    const { dispatch, form, organizationId } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        let payload = {};
        payload = {
          ...values,
          organizationId,
          startDate: values.startDate
            ? values.startDate.format(DEFAULT_DATETIME_FORMAT)
            : undefined,
          endDate: values.endDate ? values.endDate.format(DEFAULT_DATETIME_FORMAT) : undefined,
          companyId: 0,
        };
        dispatch({
          type: 'groupBanner/saveGroupBanner',
          payload,
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/scec/group-banner/detail/${res.bannerId}/0`,
              })
            );
          }
        });
      }
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(arr, key) {
    const { collapseKeys } = this.state;
    this.setState({
      collapseKeys: {
        ...collapseKeys,
        [key]: arr,
      },
    });
  }

  /**
   * 禁用的时间范围
   * @param {*} start
   * @param {*} end
   */
  @Bind
  range(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  /**
   * 时间禁用
   */
  @Bind
  disabledDateTime(currentDate) {
    const startDate = this.props.form.getFieldValue('startDate');
    if (moment(currentDate).format('YYYYMMDD') === moment(startDate).format('YYYYMMDD')) {
      return {
        disabledHours: () => this.range(0, 24).splice(0, moment(startDate).hours()),
        disabledMinutes: (selectedHour) => {
          if (selectedHour === moment(startDate).hours()) {
            return this.range(0, 60).splice(0, moment(startDate).minutes());
          } else {
            return [];
          }
        },
        disabledSeconds: (selectedHour, selectedMinute) => {
          if (
            selectedHour === moment(startDate).hours() &&
            selectedMinute === moment(startDate).minutes()
          ) {
            return this.range(0, 60).splice(0, moment(startDate).seconds());
          } else {
            return [];
          }
        },
      };
    }
  }

  renderHeaderForm() {
    const {
      groupBanner: { bannerType = [] },
    } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    return (
      <Form>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem label={intl.get(`${messagePrompt}.orderSeq`).d('排序号')} {...formLayout}>
              {getFieldDecorator('orderSeq', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${messagePrompt}.orderSeq`).d('排序号'),
                    }),
                  },
                ],
              })(<InputNumber min={1} max={99999999} style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${messagePrompt}.bannerName`).d('Banner名称')}
              {...formLayout}
            >
              {getFieldDecorator('bannerName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${messagePrompt}.bannerName`).d('Banner名称'),
                    }),
                  },
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', {
                      max: 120,
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${messagePrompt}.bannerType`).d('Banner类型')}
              {...formLayout}
            >
              {getFieldDecorator('bannerType', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${messagePrompt}.bannerType`).d('Banner类型'),
                    }),
                  },
                ],
              })(
                <Select>
                  {bannerType &&
                    bannerType.map((item) => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`${messagePrompt}.uploadImage`).d('上传图片')}
              extra={intl
                .get(`${messagePrompt}.uploadSize`)
                .d('上传格式：*.png;*.jpeg，上传大小：966x460px')}
              style={{ marginBottom: '0px' }}
              {...formLayout}
              required
            >
              <Upload
                single
                accept=".jpeg,.png"
                fileType="image/jpeg;image/png"
                bucketName={PUBLIC_BUCKET}
                bucketDirectory="scec-company-banner"
                fileList={[]}
                onUploadSuccess={this.uploadSuccess}
                onRemove={this.cancelSuccess}
              />
            </FormItem>
            <FormItem wrapperCol={{ span: 15, offset: 6 }} style={{ marginBottom: '0px' }}>
              {getFieldDecorator('imagePath', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${messagePrompt}.uploadImage`).d('上传图片'),
                    }),
                  },
                ],
              })(<div />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('scec.shopBasket.model.shoppingBasket.startDate').d('开始时间')}
              {...formLayout}
            >
              {getFieldDecorator('startDate', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('scec.shopBasket.model.shoppingBasket.startDate')
                        .d('开始时间'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder=""
                  format={DEFAULT_DATETIME_FORMAT}
                  disabledDate={(currentDate) =>
                    getFieldValue('endDate') &&
                    moment(getFieldValue('endDate')).isBefore(currentDate, 'day')
                  }
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('scec.shopBasket.model.shoppingBasket.endDate').d('截止时间')}
              {...formLayout}
            >
              {getFieldDecorator('endDate', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('scec.shopBasket.model.shoppingBasket.endDate').d('截止时间'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder=""
                  format={DEFAULT_DATETIME_FORMAT}
                  disabledDate={(currentDate) =>
                    getFieldValue('startDate') &&
                    moment(getFieldValue('startDate')).isAfter(currentDate, 'day')
                  }
                  disabledTime={this.disabledDateTime}
                />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { saveGroupBannerLoading } = this.props;
    const { collapseKeys } = this.state;
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${messagePrompt}.New.banner`).d('新建Banner')}
          backPath="/scec/group-banner/list"
        >
          <Button
            icon="save"
            type="primary"
            onClick={this.saveBanner}
            loading={saveGroupBannerLoading}
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={false} wrapperClassName="ued-detail-wrapper">
            <Collapse
              defaultActiveKey={['bannerDetail']}
              onChange={(arr) => this.onCollapseChange(arr, 'bannerDetail')}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get(`${messagePrompt}.bannerDetail`).d('Banner明细')}</h3>
                    <a>
                      {collapseKeys.bannerDetail
                        ? collapseKeys.bannerDetail.some((o) => o === 'bannerDetail')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')
                        : intl.get(`hzero.common.button.up`).d('收起')}
                    </a>
                    <Icon
                      type={
                        collapseKeys.bannerDetail
                          ? collapseKeys.bannerDetail.some((o) => o === 'bannerDetail')
                            ? 'up'
                            : 'down'
                          : 'up'
                      }
                    />
                  </Fragment>
                }
                key="bannerDetail"
              >
                {this.renderHeaderForm()}
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
