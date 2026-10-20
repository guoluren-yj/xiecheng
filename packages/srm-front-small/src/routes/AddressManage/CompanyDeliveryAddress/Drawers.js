/**
 * Drawer -收货地址Modal编辑页
 * @date: 2019-1-25
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Lov, TextField, Cascader, TelField, TextArea } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

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
export default class Drawer extends PureComponent {
  // 这里面可以控制node结点的判断来实现是否展示为叶结点
  @Bind()
  nodeCover({ record }) {
    const nodeProps = {
      title: record.get('text'),
    };
    nodeProps.isLeaf = record.get('isLeaf');
    return nodeProps;
  }

  // 处理暂不选择 去除最后一位
  @Bind()
  onChoose(value, record) {
      this.props.formDs.current.set('regionIdList', []);

      if(record.get('isNAFlag')){ // N/A字段 需要将regionName处理为空不展示
        const region = value.slice(0, value.length - 1);
        region[region.length-1].regionId = value[value.length-1].regionId; // 设置提交的regionId为末级
        const regionIdList = value.reduce((pre, cur)=>{
          return pre.concat(cur.regionIdList||[]);
        }, []);
        this.props.formDs.current.set('regionIdList', regionIdList);
        this.props.formDs.current.set('region', region);
        return;
      }
      if (record.get('virtualFlag')) {
        const region = value.slice(0, value.length - 1);
        this.props.formDs.current.set('region', region);
      }
  }

  render() {
    const { formDs, optionDs, customizeForm } = this.props;
    return customizeForm(
      { code: 'SMALL.ADDRESS_MANAGE.EDITFORM' },
      <Form labelLayout="float" columns={1} dataSet={formDs}>
        <Lov noCache name="companyIdLov" />
        <Lov
          help={intl
            .get('small.common.view.ecAcquirerAddress.invOrgConfirm')
            .d(
              '若维护了库存组织，则按照地址上的库存组织带出业务实体，此优先级大于采买组织映射'
          )}
          showHelp="tooltip"
          name="invOrganizationIdLov"
        />
        <Lov name="inventoryIdLov" />
        <Lov name="userIdLov" />
        <TextField name="contactName" />
        <TelField
          name="mobile"
        />
        <TextField
          name="phone"
          help={intl
            .get('small.common.view.fixPhonHelp')
            .d('若为仓库或办公室等需要固定电话接收的情况，请维护固定电话')
          }
          showHelp="tooltip"
          onFocus={() => formDs.current.set('phone', '')}
        />
        <TextField name="email" />
        <Cascader
          async
          onOption={this.nodeCover}
          name="region"
          style={{ width: '100%' }}
          menuMode="single"
          onChoose={(value, record) => this.onChoose(value, record)}
          changeOnSelect
          onChange={(value) => {
            formDs.current.set('regionIdList', []); // 改变时，去除regionIdList，用来校验
            optionDs.setQueryParameter('countryId', value?.[0]?.countryId);
          }}
        />
        <TextField name="address" />
        <TextArea resize="vertical" name="remark" />
      </Form>
    );
  }
}
