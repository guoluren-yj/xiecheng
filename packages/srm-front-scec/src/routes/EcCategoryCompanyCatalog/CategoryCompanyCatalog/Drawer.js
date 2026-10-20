/**
 * ecCategoryCompanyCatalog - 公司目录映射 - 编辑框
 * @date: 2019-2-2
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Modal, Form } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import Lov from 'components/Lov';

const FormItem = Form.Item;
const modelPrompt = 'scec.ecCategoryPlatformCatalog.model';
const tenantId = getCurrentOrganizationId();

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
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} visible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
export default class Drawer extends Component {
  @Bind()
  onOk() {
    const { form, companyId, onHandleSave, tableRecord = {} } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        onHandleSave([
          {
            ...tableRecord,
            ...values,
            companyId,
            objectVersionNumber: tableRecord.objectVersionNumber || null,
          },
        ]);
      }
    });
  }

  render() {
    const {
      form,
      saveLoading,
      visible,
      anchor,
      companyId,
      tableRecord = {},
      onCancel,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    return (
      <Modal
        destroyOnClose
        title={intl.get('hzero.common.button.edit').d('编辑')}
        width={520}
        onCancel={onCancel}
        onOk={this.onOk}
        visible={visible}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        confirmLoading={saveLoading}
      >
        <FormItem
          label={intl.get('scec.common.model.ecPlatformName').d('电商名称')}
          {...formLayout}
        >
          {getFieldDecorator('ecPlatformCode', {
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
                  name: intl.get('scec.common.model.ecPlatformName').d('电商名称'),
                }),
              },
            ],
            initialValue: tableRecord.ecPlatformCode,
          })(
            <Lov
              textValue={tableRecord.ecPlatformName}
              code="SCEC.EC_PLATFORM"
              queryParams={{ companyId, tenantId }}
            />
          )}
        </FormItem>
        <FormItem
          label={intl.get(`${modelPrompt}.ecCategoryName`).d('电商分类名称')}
          {...formLayout}
        >
          {getFieldDecorator('ecCategoryId', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${modelPrompt}.ecCategoryName`).d('电商分类名称'),
                }),
              },
            ],
            initialValue: tableRecord.ecCategoryId,
          })(
            <Lov
              disabled={!getFieldValue('ecPlatformCode')}
              textValue={tableRecord.ecCategoryName}
              code="SCEC.EC_CATEGORY"
              queryParams={{ ecPlatform: getFieldValue('ecPlatformCode') }}
            />
          )}
        </FormItem>
        <FormItem
          label={intl.get('scec.ecCatalog.model.ecCatalog.catalogName').d('目录名称')}
          {...formLayout}
        >
          {getFieldDecorator('catalogId', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('scec.ecCatalog.model.ecCatalog.catalogName').d('目录名称'),
                }),
              },
            ],
            initialValue: tableRecord.catalogId,
          })(
            <Lov
              textValue={tableRecord.catalogName}
              code="SCEC.COM.CATALOG"
              queryParams={{ companyId }}
            />
          )}
        </FormItem>
      </Modal>
    );
  }
}
