/**
 * CompanyBanner - 公司Banner管理新建
 * @date: 2019-2-26
 * @author: CJ <juan.chen01@hand-china.com>
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
  // InputNumber,
  Spin,
  Collapse,
  Icon,
} from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { routerRedux } from 'dva/router';
import { isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import CroperModal from '@/routes/Components/CroperModal';

const { Panel } = Collapse;
const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@connect(({ mallHomePlate, loading }) => ({
  mallHomePlate,
  organizationId: getCurrentOrganizationId(),
  saveCompanyBannerLoading: loading.effects['mallHomePlate/saveBanner'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['small.mallHomePlate', 'small.common'] })
export default class Create extends Component {
  state = {
    collapseKeys: {},
    imageType: 1,
    // initilaTime: '',
  };

  croperModal;

  componentDidMount() {
    this.props.dispatch({
      type: 'mallHomePlate/init',
    });
  }

  /**
   * 图片上传成功后的回调
   */
  @Bind()
  uploadSuccess(file = { url: '' }) {
    const { url } = file;
    const { form } = this.props;
    if (url) {
      form.setFieldsValue({
        imagePath: url,
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
   * 图片上传成功后的回调
   */
  @Bind()
  uploadMobileSuccess(file) {
    const { url } = file;
    const { form } = this.props;
    if (url) {
      form.setFieldsValue({
        mobileImageUrl: url,
      });
    }
  }

  /**
   * 图片删除成功后的回调
   */
  @Bind()
  cancelMobileSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.setFieldsValue({
        mobileImageUrl: '',
      });
    }
  }

  /**
   * 保存-banner
   * 租户级传organizationId 和companyId
   */
  @Bind()
  saveBanner() {
    const {
      dispatch,
      form,
      organizationId,
      match: { params },
    } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        const payload = {
          ...values,
          organizationId,
          startDate: values.startDate
            ? values.startDate.format(DEFAULT_DATETIME_FORMAT)
            : undefined,
          endDate: values.endDate ? values.endDate.format(DEFAULT_DATETIME_FORMAT) : undefined,
          companyId: params.companyId,
          orderSeq: 1,
        };
        dispatch({
          type: 'mallHomePlate/saveBanner',
          payload,
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/small/mall-home-plate/edit-banner/${params.companyId}/${res.bannerId}`,
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
   * 开始时间
   * @param {*} current
   */
  @Bind()
  selectDisabledDate(current) {
    const {
      form: { getFieldValue },
    } = this.props;
    if (getFieldValue('endDate')) {
      return (
        current < moment().subtract(1, 'days').endOf('day') - 1 ||
        moment(getFieldValue('endDate')).isBefore(current, 'day')
      );
    } else {
      // return current && current < moment().subtract(1, 'days').endOf('day') - 1;
      return moment(moment().format('YYYY-MM-DD HH:mm:ss')).isAfter(current, 'day');
    }
  }

  /**
   * 结束时间
   * @param {*} current
   */
  @Bind()
  selectToDisabledDate(current) {
    const {
      form: { getFieldValue },
    } = this.props;
    if (
      getFieldValue('startDate') &&
      current &&
      current <
        Math.max.apply(this, [
          moment(getFieldValue('startDate')).startOf('day'),
          moment(current).startOf('day'),
        ])
    ) {
      // return moment(getFieldValue('startDate')).isAfter(current, 'day');
      return true;
    } else {
      // return current && current < moment().subtract(1, 'days').endOf('day');
      return moment(moment().format('YYYY-MM-DD HH:mm:ss')).isAfter(current, 'day');
    }
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
      mallHomePlate: { bannerType = [] },
    } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form;
    return (
      <Form>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`small.mallHomePlate.model.bannerName`).d('Banner名称')}
              {...formLayout}
            >
              {getFieldDecorator('bannerName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.mallHomePlate.model.bannerName`).d('Banner名称'),
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
              label={intl.get(`small.mallHomePlate.model.bannerType`).d('Banner类型')}
              {...formLayout}
            >
              {getFieldDecorator('bannerType', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.mallHomePlate.model.bannerType`).d('Banner类型'),
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
          <Col span={8}>
            <FormItem
              label={intl.get(`small.common.model.startTime`).d('开始时间')}
              {...formLayout}
            >
              {getFieldDecorator('startDate', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.common.model.startTime`).d('开始时间'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder=""
                  format={DEFAULT_DATETIME_FORMAT}
                  disabledDate={this.selectDisabledDate}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem label={intl.get(`small.common.model.endTime`).d('截止时间')} {...formLayout}>
              {getFieldDecorator('endDate', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`small.common.model.endTime`).d('截止时间'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder=""
                  format={DEFAULT_DATETIME_FORMAT}
                  disabledDate={this.selectToDisabledDate}
                  disabledTime={this.disabledDateTime}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`hzero.common.title.uploadImage`).d('上传图片')}
              extra={intl
                .get(`small.mallHomePlate.model.banner.uploadSize`)
                .d('上传格式：*.png;*.jpeg，上传大小：2:1')}
              style={{ marginBottom: '0px' }}
              {...formLayout}
              required
            >
              <Button
                onClick={() => {
                  this.setState({ imageType: 1 });
                  if (this.croperModal && this.croperModal.toggle) this.croperModal.toggle();
                }}
              >
                <Icon type="upload" /> {intl.get('hzero.common.button.upload').d('上传')}
              </Button>
              {getFieldValue('imagePath') && (
                <p
                  style={{
                    padding: 8,
                    borderRadius: 2,
                    border: '1px solid #d9d9d9',
                    position: 'relative',
                    marginTop: 8,
                  }}
                >
                  <img style={{ width: 90 }} src={getFieldValue('imagePath')} alt="" />
                  <Icon
                    onClick={() => {
                      setFieldsValue({
                        imagePath: '',
                      });
                    }}
                    style={{ position: 'absolute', right: 4, top: 4, cursor: 'pointer' }}
                    type="close"
                  />
                </p>
              )}
            </FormItem>
            <FormItem wrapperCol={{ span: 15, offset: 6 }} style={{ marginBottom: '0px' }}>
              {getFieldDecorator('imagePath', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`hzero.common.title.uploadImage`).d('上传图片'),
                    }),
                  },
                ],
              })(<div />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`small.mallHomePlate.model.uploadMobileImage`).d('上传移动端图片')}
              extra={intl
                .get(`small.common.model.banner.uploadMobileSize`)
                .d('上传格式：*.png;*.jpeg，上传大小：690x328px')}
              style={{ marginBottom: '0px' }}
              {...formLayout}
            >
              <Button
                onClick={() => {
                  this.setState({ imageType: 2 });
                  if (this.croperModal && this.croperModal.toggle) this.croperModal.toggle();
                }}
              >
                <Icon type="upload" /> {intl.get('hzero.common.button.upload').d('上传')}
              </Button>
              {getFieldValue('mobileImageUrl') && (
                <p
                  style={{
                    padding: 8,
                    borderRadius: 2,
                    border: '1px solid #d9d9d9',
                    position: 'relative',
                    marginTop: 8,
                  }}
                >
                  <img style={{ width: 90 }} src={getFieldValue('mobileImageUrl')} alt="" />
                  <Icon
                    onClick={() => {
                      setFieldsValue({
                        mobileImageUrl: '',
                      });
                    }}
                    style={{ position: 'absolute', right: 4, top: 4, cursor: 'pointer' }}
                    type="close"
                  />
                </p>
              )}
            </FormItem>
            <FormItem wrapperCol={{ span: 15, offset: 6 }} style={{ marginBottom: '0px' }}>
              {getFieldDecorator('mobileImageUrl')(<div />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { saveCompanyBannerLoading } = this.props;
    const { collapseKeys } = this.state;
    return (
      <React.Fragment>
        <Header
          title={intl.get(`small.mallHomePlate.view.banner.create`).d('新建Banner')}
          backPath="/small/mall-home-plate/list"
        >
          <Button
            icon="save"
            type="primary"
            onClick={this.saveBanner}
            loading={saveCompanyBannerLoading}
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
                    <h3>{intl.get(`small.mallHomePlate.view.bannerDetail`).d('Banner明细')}</h3>
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
          <CroperModal
            fn={(ele) => {
              this.croperModal = ele;
            }}
            maxSize={5}
            width={this.state.imageType === 1 ? 2 : 690}
            height={this.state.imageType === 1 ? 1 : 328}
            canvasStyle={
              this.state.imageType === 1 ? { width: 800, height: 400 } : { width: 690, height: 328 }
            }
            callback={this.state.imageType === 1 ? this.uploadSuccess : this.uploadMobileSuccess}
          />
        </Content>
      </React.Fragment>
    );
  }
}
