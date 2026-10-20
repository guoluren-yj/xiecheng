import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { IntlField, DataSet } from 'choerodon-ui/pro';
import { SRM_MDM } from '_utils/config';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { MODAL_FORM_ITEM_LAYOUT } from 'utils/constants';

/**
 * Form.Item 组件label、wrapper长度比例划分
 */

/**
 * 地区-数据修改滑窗(抽屉)
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {string} anchor - 抽屉滑动位置
 * @reactProps {string} title - 抽屉标题
 * @reactProps {boolean} visible - 抽屉是否可见
 * @reactProps {Function} onOk - 抽屉确定操作
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} itemData - 组织实体
 * @return React.element
 */
const organizationId = getCurrentOrganizationId();
@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {
  /**
   * 组件属性定义
   */
  static propTypes = {
    anchor: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
    title: PropTypes.string,
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
  };

  ds = new DataSet({
    transport: {
      tls: ({ record, name }) => {
        if (['regionName'].includes(name)) {
          return {
            url: `${SRM_MDM}/v1/${organizationId}/countrys/cusz/multi-language`,
            method: 'GET',
            data: { regionId: record?.get('regionId') },
          };
        }
      },
    },
    fields: [
      {
        name: 'regionName',
        type: 'intl',
      },
      {
        name: 'esRegionName',
        type: 'intl',
      },
    ],
  });

  /**
   * 组件属性默认值设置
   */
  static defaultProps = {
    anchor: 'left',
    title: '',
    visible: false,
    onOk: (e) => e,
    onCancel: (e) => e,
  };

  constructor(props) {
    super(props);
    this.state = {
      // detail: {}, // 查询的详情
    };
  }

  componentDidMount() {
    // this.handleQueryDetail();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.visible === false && this.props.visible === true) {
      const { itemData } = this.props;
      this.ds.loadData([itemData]);
    }
  }

  // handleQueryDetail() {
  //   const { isCreate, itemData } = this.props;
  //   if (!isCreate && itemData.regionId) {
  //     const { queryDetail } = this.props;
  //     queryDetail({ regionId: itemData.regionId }).then(detail => {
  //       if (detail) {
  //         this.setState({ detail });
  //       }
  //     });
  //   }
  // }

  /**
   * 在 模态框 关闭后 清除 detail
   */
  @Bind()
  handleAfterClose() {
    // this.setState({ detail: {} });
  }

  /**
   * 确定操作
   */
  @Bind()
  saveBtn() {
    const { form, onOk, itemData } = this.props;
    if (onOk) {
      form.validateFields((err, values) => {
        if (!err) {
          const dsData = this.ds.current.toJSONData();
          const { _tls = {} } = dsData;
          // 校验通过，进行保存操作
          onOk({ ...itemData, ...values, _tls });
        }
      });
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { anchor, title, visible, form, loading, onCancel, itemData } = this.props;
    // const {
    //   detail: { _token, regionCode, regionName, quickIndex },
    // } = this.state;
    return (
      <Modal
        destroyOnClose
        afterClose={this.handleAfterClose}
        title={title}
        zIndex={99}
        width={520}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        confirmLoading={loading}
        okButtonProps={{ disabled: !visible }}
        onOk={this.saveBtn}
        onCancel={onCancel}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      >
        <Form>
          <Form.Item
            {...MODAL_FORM_ITEM_LAYOUT}
            label={intl.get('hpfm.region.model.region.regionCode').d('区域代码')}
          >
            {form.getFieldDecorator('regionCode', {
              initialValue: itemData.regionCode,
            })(<Input disabled />)}
          </Form.Item>
          <Form.Item
            {...MODAL_FORM_ITEM_LAYOUT}
            label={intl.get('hpfm.region.model.region.regionName').d('区域名称')}
          >
            {form.getFieldDecorator('regionName', {
              initialValue: itemData.regionName,
            })(
              <IntlField dataSet={this.ds} name="regionName" disabled style={{ width: '100%' }} />
            )}
          </Form.Item>
          <Form.Item
            {...MODAL_FORM_ITEM_LAYOUT}
            label={intl.get('smdm.regionalMapping.entity.region.esRegionCode').d('映射区域代码')}
          >
            {form.getFieldDecorator('esRegionCode', {
              initialValue: itemData.esRegionCode,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('smdm.regionalMapping.entity.region.esRegionCode')
                      .d('映射区域代码'),
                  }),
                },
              ],
            })(<Input trim inputChinese={false} />)}
          </Form.Item>
          <Form.Item
            {...MODAL_FORM_ITEM_LAYOUT}
            label={intl.get('smdm.regionalMapping.entity.region.esRegionName').d('映射区域名称')}
          >
            {form.getFieldDecorator('esRegionName', {
              initialValue: itemData.esRegionName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('smdm.regionalMapping.entity.region.esRegionName')
                      .d('映射区域名称'),
                  }),
                },
              ],
            })(<IntlField dataSet={this.ds} name="esRegionName" style={{ width: '100%' }} />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
