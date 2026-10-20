import React from 'react';
import { Bind } from 'lodash-decorators';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { enabledRenderer } from '@/routes/product/utilsApi/renderer';

import CategoryForm from './CategoryForm';

import { categoryFormDs } from './ds';
import { saveCategoryInfo } from './api';

const modalProps = {
  movable: false,
  closable: true,
  mask: true,
  maskClosable: true,
  destroyOnClose: true,
  drawer: true,
};

export default class CategoryList extends React.Component {
  formDs;

  createModal;

  constructor(props) {
    super(props);
    props.onRef(this);
  }

  @Bind()
  getColumns() {
    const { onNext = (e) => e } = this.props;
    return [
      {
        name: 'categoryCode',
        width: 140,
      },
      {
        name: 'categoryName',
      },
      {
        name: 'enabledFlag',
        align: 'left',
        width: 90,
        renderer: enabledRenderer,
      },
      {
        name: 'operation',
        width: 180,
        renderer: ({ record }) => {
          const line = record.toData();
          const { enabledFlag, level } = line;
          return (
            <span className="action-link">
              {
                <a onClick={() => onNext(line, level + 1)}>
                  {line.level === 3
                    ? intl.get('smpc.categoryManage.button.manageProperty').d('管理属性')
                    : intl.get('smpc.categoryManage.button.checkNext').d('查看下级')}
                </a>
              }
              <a onClick={() => this.categoryModal(line)}>
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
  }

  /**
   * 启用、禁用
   */
  @Bind()
  async handleEnable(line, enabledFlag) {
    const { dataSet } = this.props;
    const result = getResponse(await saveCategoryInfo({ ...line, enabledFlag }));
    if (result) {
      notification.success();
      dataSet.query(dataSet.currentPage);
    }
  }

  @Bind()
  categoryModal(line) {
    this.formDs = new DataSet(categoryFormDs());
    const { level, parent, grandParent } = this.props;
    const parentParams =
      level === 1
        ? { parentId: 0, parentCategoryName: '' }
        : level === 2
        ? { parentId: grandParent.categoryId, parentCategoryName: grandParent.categoryName }
        : level === 3
        ? { parentId: parent.categoryId, parentCategoryName: parent.categoryName }
        : {};
    if (line) {
      this.formDs.loadData([line]);
    } else {
      this.formDs.create({ ...parentParams, level, enabledFlag: 1 });
    }
    this.createModal = Modal.open({
      ...modalProps,
      key: 'categoryModal',
      style: { width: 380 },
      title:
        level === 1
          ? line
            ? intl.get('smpc.categoryManage.view.editCategory').d('编辑主分类')
            : intl.get('smpc.categoryManage.view.createCategory').d('创建主分类')
          : line
          ? intl.get('smpc.categoryManage.view.editSubCategory').d('编辑子分类')
          : intl.get('smpc.categoryManage.view.createSubCategory').d('创建子分类'),
      onOk: () => this.save(),
      okText: intl.get('hzero.common.button.save').d('保存'),
      children: <CategoryForm dataSet={this.formDs} level={level} />,
    });
  }

  @Bind()
  async save() {
    const flag = await this.formDs.validate();
    if (flag) {
      const params = this.formDs.toData()[0];
      const result = getResponse(await saveCategoryInfo({ ...params }));
      if (result) {
        const { treeDs, dataSet } = this.props;
        notification.success();
        if (treeDs) {
          const treeData = treeDs.toData();
          let isCreate = true;
          const newTree = treeData.map((m) => {
            if (result.categoryId === m.categoryId) {
              isCreate = false;
              return result;
            } else {
              return m;
            }
          });
          if (isCreate) newTree.push(result);
          treeDs.loadData(newTree);
        }
        dataSet.query();
        this.createModal.close();
      }
    }
    return false;
  }

  render() {
    const { dataSet } = this.props;
    const columns = this.getColumns();

    return dataSet ? (
      <Table dataSet={dataSet} columns={columns} queryFieldsLimit={3} columnResizable />
    ) : (
      <></>
    );
  }
}
