import React from 'react';
import { Bind } from 'lodash-decorators';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { enabledRenderer } from '@/routes/product/utilsApi/renderer';

import AttrValForm from './AttrValForm';

import { attrValTableDs, attrValFormDs } from './ds';
import { saveAttrValInfo } from './api';

const modalProps = {
  movable: false,
  closable: true,
  mask: true,
  maskClosable: true,
  destroyOnClose: true,
  drawer: true,
};
export default class AttrList extends React.Component {
  formDs;

  createModal;

  constructor(props) {
    super(props);
    props.onRef(this);
    const { categoryId, attrId, attributeCode } = props.attr || {};
    this.ds = new DataSet(attrValTableDs(categoryId, attrId, attributeCode === '000000000001'));
  }

  @Bind()
  getColumns() {
    const { attr = {}, renderText } = this.props;
    const { attributeCode } = attr || {};
    const columns = [
      {
        name: 'attrValueCode',
        width: 140,
        hidden: attributeCode === '000000000001',
      },
      {
        name: 'brandCode',
        width: 140,
        hidden: attributeCode !== '000000000001',
      },
      {
        name: 'brandName',
        hidden: attributeCode !== '000000000001',
        renderer: ({ record }) => {
          const brandNameZh = record.get('brandNameZh');
          const brandNameEn = record.get('brandNameEn');
          return renderText({
            value:
              brandNameZh && brandNameEn
                ? `${brandNameZh}（${brandNameEn}）`
                : brandNameZh || brandNameEn || '',
          });
        },
      },
      {
        name: 'attrValueName',
        hidden: attributeCode === '000000000001',
      },
      {
        name: 'enabledFlag',
        width: 90,
        renderer: enabledRenderer,
      },
      {
        name: 'operation',
        width: 110,
        hidden: attributeCode === '000000000001',
        renderer: ({ record }) => {
          const line = record.toData();
          const { enabledFlag } = line;
          return (
            <span className="action-link">
              <a onClick={() => this.attrValModal(line)}>
                {intl.get('smpc.product.button.edit').d('编辑')}
              </a>
              <a onClick={() => this.handleEnable(line, enabledFlag === 1 ? 0 : 1)}>
                {enabledFlag === 1
                  ? intl.get('smpc.product.button.disable').d('禁用')
                  : intl.get('smpc.product.button.enable').d('启用')}
              </a>
            </span>
          );
        },
      },
    ];
    return columns;
  }

  /**
   * 启用、禁用
   */
  @Bind()
  async handleEnable(line, enabledFlag) {
    const result = getResponse(await saveAttrValInfo({ ...line, enabledFlag }));
    if (result) {
      notification.success();
      this.ds.query(this.ds.currentPage);
    }
  }

  @Bind()
  attrValModal(line) {
    const { categoryId, attrId } = this.props.attr || {};
    this.formDs = new DataSet(attrValFormDs());
    this.formDs.create(line || { categoryId, attrId, enabledFlag: 1 });
    this.createModal = Modal.open({
      ...modalProps,
      key: 'attrValModal',
      style: { width: 380 },
      title: line
        ? intl.get('smpc.categoryManage.view.editAttrVal').d('编辑属性值')
        : intl.get('smpc.categoryManage.view.bindNewAttrVal').d('绑定新属性值'),
      onOk: () => this.save(),
      okText: intl.get('hzero.common.button.save').d('保存'),
      children: <AttrValForm dataSet={this.formDs} />,
    });
  }

  @Bind()
  async save() {
    const flag = await this.formDs.validate();
    if (flag) {
      const params = this.formDs.toJSONData()[0];
      const result = getResponse(await saveAttrValInfo({ ...params }));
      if (result) {
        notification.success();
        this.createModal.close();
        this.ds.query(this.ds.currentPage);
      }
    }
    return false;
  }

  render() {
    const columns = this.getColumns();
    return <Table dataSet={this.ds} columns={columns} columnResizable />;
  }
}
