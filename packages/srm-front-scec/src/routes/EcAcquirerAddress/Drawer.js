/**
 * Drawer -收单地址Modal编辑页
 * @date: 2019-1-25
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Modal, Form, Input, Cascader, Icon } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import { EMAIL, PHONE } from 'utils/regExp';
import intl from 'utils/intl';

import Lov from 'components/Lov';
import Switch from 'components/Switch';

const FormItem = Form.Item;

const modelPrompt = 'scec.ecAcquirerAddress.model';
const viewPrompt = 'scec.ecAcquirerAddress.view';
const prompt = 'scec.ecAcquirerAddress';

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 编辑模态框数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onHandleSave - 编辑确定后回调函数以保存数据
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} visible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      region: '',
      regionValue: '',
    };
  }

  /**
   * 地区区域默认值
   */
  @Bind()
  handleRegionName(tableRecord = {}) {
    const regionNameList = tableRecord.rgNameList || [];
    return regionNameList.join('');
  }

  /**
   * 选择地区拼接
   */
  @Bind()
  handleSelectRegion(value, selectedOptions = []) {
    const { form, onLoadData } = this.props;
    if (onLoadData) {
      // 判断是否选择的为最深层
      onLoadData(selectedOptions);
    }
    const regionList = selectedOptions.map(region => {
      const { regionName } = region;
      return regionName;
    });
    const region = regionList.join('');
    form.setFieldsValue({
      regionId: region,
    });
    this.setState({
      region,
      regionValue: value,
    });
  }

  /**
   * 详细地址拼接
   */
  @Bind()
  handleFullAdress() {
    const { region } = this.state;
    const {
      tableRecord = {},
      form: { getFieldValue },
    } = this.props;
    if (isEmpty(region)) {
      const regionNameList = tableRecord.rgNameList || [];
      return `${regionNameList.join('')}${getFieldValue('address')}`;
    }
    return `${region}${getFieldValue('address')}`;
  }

  @Bind()
  onOk() {
    const { regionValue } = this.state;
    const { form, onHandleSave, tableRecord = {} } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        onHandleSave({
          ...tableRecord,
          ...values,
          regionId: regionValue[regionValue.length - 1],
          objectVersionNumber: tableRecord.objectVersionNumber || null,
          fullAddress: this.handleFullAdress(),
        });
      }
      this.setState({
        region: '',
        regionValue: '',
      });
    });
  }

  @Bind()
  handleCascader() {
    const { cityData, onLoadData } = this.props;
    return (
      <Cascader
        changeOnSelect
        showSearch={false}
        style={{ width: '100%' }}
        placeholder={null}
        fieldNames={{ label: 'regionName', value: 'regionId' }}
        options={cityData || []}
        onChange={this.handleSelectRegion}
        loadData={selectedOptions => onLoadData(selectedOptions)}
      >
        <Icon type="down" />
      </Cascader>
    );
  }

  render() {
    const {
      form,
      saveLoading,
      addLoading,
      visible,
      anchor,
      tableRecord = {},
      onCancel,
      fetchLoading,
      isChooseLastFlag, // 是否选择最深层地址
    } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        destroyOnClose
        title={intl.get(`${viewPrompt}.title`).d('收单地址')}
        width={520}
        onCancel={onCancel}
        onOk={this.onOk}
        visible={visible}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        confirmLoading={saveLoading || addLoading || fetchLoading}
      >
        <FormItem label={intl.get(`${prompt}.entity.company.name`).d('公司名称')} {...formLayout}>
          {getFieldDecorator('companyId', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${prompt}.entity.company.name`).d('公司名称'),
                }),
              },
            ],
            initialValue: tableRecord.companyId,
          })(<Lov textValue={tableRecord.companyName} code="SPFM.USER_AUTHORITY_COMPANY" />)}
        </FormItem>
        <FormItem label={intl.get(`${prompt}.entity.roles.contacts`).d('联系人')} {...formLayout}>
          {getFieldDecorator('contactName', {
            rules: [
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${prompt}.entity.roles.contacts`).d('联系人'),
                }),
              },
            ],
            initialValue: tableRecord.contactName,
          })(<Input />)}
        </FormItem>
        <FormItem label={intl.get(`${prompt}.phone`).d('手机')} {...formLayout}>
          {getFieldDecorator('mobile', {
            rules: [
              {
                pattern: PHONE,
                message: intl.get(`${prompt}.validation.phone`).d('手机号码格式不正确'),
              },
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${prompt}.mobilephone`).d('电话'),
                }),
              },
            ],
            initialValue: tableRecord.mobile,
          })(<Input />)}
        </FormItem>
        <FormItem label={intl.get(`${prompt}.email`).d('邮箱')} {...formLayout}>
          {getFieldDecorator('email', {
            rules: [
              {
                pattern: EMAIL,
                message: intl.get(`${prompt}.validation.email`).d('邮箱格式不正确'),
              },
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${prompt}.email`).d('邮箱'),
                }),
              },
              {
                max: 100,
                message: intl.get('hzero.common.validation.max', {
                  max: 100,
                }),
              },
            ],
            initialValue: tableRecord.email,
          })(<Input />)}
        </FormItem>
        <FormItem label={intl.get(`${modelPrompt}.regionName`).d('地址区域')} {...formLayout}>
          {getFieldDecorator('regionId', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${modelPrompt}.regionName`).d('地址区域'),
                }),
              },
              {
                validator: (rule, value, callback) => {
                  if (!isChooseLastFlag) {
                    callback(
                      new Error(intl.get(`${modelPrompt}.detailRgionName`).d('请选择详细地址区域'))
                    );
                  } else {
                    callback();
                  }
                },
              },
            ],
            initialValue: this.handleRegionName(tableRecord),
          })(
            <Input
              style={{
                verticalAlign: 'middle',
                position: 'relative',
                top: '-1px',
              }}
              readOnly
              addonAfter={this.handleCascader()}
            />
          )}
        </FormItem>
        <FormItem label={intl.get(`${modelPrompt}.address`).d('详细地址')} {...formLayout}>
          {getFieldDecorator('address', {
            rules: [
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${modelPrompt}.address`).d('详细地址'),
                }),
              },
            ],
            initialValue: tableRecord.address,
          })(<Input />)}
        </FormItem>
        <FormItem label={intl.get('scec.common.table.column.remark').d('备注')} {...formLayout}>
          {getFieldDecorator('remark', {
            initialValue: tableRecord.remark,
          })(<Input />)}
        </FormItem>
        <Form.Item {...formLayout} label={intl.get(`hzero.common.status.enable`).d('启用')}>
          {getFieldDecorator('enabledFlag', {
            initialValue: tableRecord.enabledFlag === 0 ? 0 : 1,
          })(<Switch />)}
        </Form.Item>
        <Form.Item {...formLayout} label={intl.get(`${modelPrompt}.defaultFlag`).d('默认')}>
          {getFieldDecorator('defaultFlag', {
            initialValue: tableRecord.defaultFlag ? 1 : 0,
          })(<Switch />)}
        </Form.Item>
      </Modal>
    );
  }
}
