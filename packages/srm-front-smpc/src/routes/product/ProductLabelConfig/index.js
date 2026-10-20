/**
 * 标签定义
 * @date: 2020-11-24
 * @author: hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import { Tag } from 'choerodon-ui';
import { DataSet, Button, Modal, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { toJS } from 'mobx';

import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import FilterBarTable from '_components/FilterBarTable';
import DynamicButtons from '_components/DynamicButtons';

import { DropdownBtn } from '@/components/CommonButtons';

import { tableDs, formDs } from './ds';
import { setEnable, addLabel } from './api';
import LabelForm from './LabelForm';
import LabelColor from './LabelColor';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();
const isPlatform = organizationId === 0; // 是否为平台级

const modalProps = {
  movable: false,
  closable: true,
  mask: true,
  maskClosable: true,
  destroyOnClose: true,
  drawer: true,
};

const TooltipButtons = observer(({ text, tipText, disabled, ...others }) => {
  return (
    <Tooltip title={disabled ? tipText : ''}>
      <div className={styles['drop-down-link-btn-wrapper']}>
        <Button disabled={disabled} {...others}>
          {text}
        </Button>
      </div>
    </Tooltip>
  );
});

@formatterCollections({
  code: ['smpc.labelConfig', 'smpc.product'],
})
export default class ProductLabelConfig extends React.Component {
  createModal;

  ds = new DataSet(tableDs());

  @Bind()
  async handleBatch(list = [], enabledFlag = 1) {
    const saveList = list.map((r) => ({ ...r.toData(), enabledFlag }));
    const result = getResponse(await setEnable(saveList));
    if (result) {
      notification.success();
      this.ds.query(this.ds.currentPage);
    }
  }

  @Bind()
  labelModal(line) {
    const defaultLine = { labelCode: null, labelName: null, enabledFlag: 1, labelColorCode: 'A' };
    this.formDs = new DataSet(formDs());
    if (line) {
      this.formDs.loadData([line]);
    } else {
      this.formDs.create(defaultLine);
    }
    this.createModal = Modal.open({
      ...modalProps,
      key: 'labelModal',
      style: { width: 380 },
      title: line
        ? intl.get('smpc.product.button.editLabel').d('编辑标签')
        : intl.get('smpc.product.button.createLabel').d('新建标签'),
      onOk: () => this.save(),
      okText: intl.get('hzero.common.button.save').d('保存'),
      children: <LabelForm dataSet={this.formDs} />,
    });
  }

  @Bind()
  async save() {
    const flag = await this.formDs.validate();
    if (flag) {
      const params = this.formDs.toJSONData()[0];
      if (!this.formDs.dirty) return true;
      const result = getResponse(await addLabel(params));
      if (result) {
        notification.success();
        this.createModal.close();
        this.ds.query(this.ds.currentPage);
      }
    }
    return false;
  }

  @Bind()
  handleDisabled(list) {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('smpc.product.button.disabledLabelMsg')
        .d('禁用标签会删除标签与所有商品的关联关系'),
      onOk: () => this.handleBatch(list, 0),
    });
  }

  @Bind()
  getColumns() {
    return [
      {
        name: 'enabledFlag',
        width: 110,
        renderer: ({ value }) => {
          return (
            <Tag color={value === 1 ? 'green' : 'red'} border={false}>
              {value === 1
                ? intl.get('hzero.common.status.enable').d('启用')
                : intl.get('hzero.common.status.disable').d('禁用')}
            </Tag>
          );
        },
      },
      {
        name: 'operation',
        width: isPlatform ? 70 : 110,
        lock: 'right',
        renderer: ({ record }) => {
          const { enabledFlag, customFlag } = record.get(['enabledFlag', 'customFlag']);
          const disabled = !isPlatform && customFlag === 0;
          if (customFlag === 0) {
            return '-';
          }
          return (
            <div className="action-link-btns">
              {isPlatform ? null : enabledFlag === 1 ? (
                <Button
                  funcType="link"
                  disabled={disabled}
                  onClick={() => this.handleDisabled([record])}
                >
                  {intl.get('hzero.common.status.disable').d('禁用')}
                </Button>
              ) : (
                <Button
                  funcType="link"
                  disabled={disabled}
                  onClick={() => this.handleBatch([record], 1)}
                >
                  {intl.get('hzero.common.status.enable').d('启用')}
                </Button>
              )}
            </div>
          );
        },
      },
      {
        name: 'labelCode',
        width: 150,
        renderer: ({ record, value }) => {
          const line = record.toData();
          const { customFlag } = line;
          const disabled = !isPlatform && customFlag === 0;
          return disabled ? (
            <span>{value}</span>
          ) : (
            <a onClick={() => this.labelModal(line)}>{value}</a>
          );
        },
      },
      {
        name: 'labelName',
        minWidth: 180,
      },
      {
        name: 'customFlagMeaning',
        width: 120,
        renderer: ({ value, record }) => {
          return (
            <Tag color={record.get('customFlag') === 1 ? 'blue' : 'gray'} border={false}>
              {value}
            </Tag>
          );
        },
      },
      {
        name: 'labelColorCode',
        width: 110,
        renderer: ({ value }) => <LabelColor singleFlag colorCode={value} />,
      },
      {
        name: 'labelSuppliers',
        minWidth: 160,
        hidden: isPlatform,
        renderer: ({ value }) => (toJS(value) || []).map((m) => m.supplierCompanyName).join(', '),
      },
    ];
  }

  @Bind()
  getButtons() {
    const btns = [
      {
        child: intl.get('smpc.product.button.createLabel').d('新建标签'),
        name: 'newCreate',
        btnProps: {
          icon: 'add',
          color: 'primary',
          onClick: () => this.labelModal(null),
        },
      },
      {
        name: 'batchOperate',
        group: true,
        show: !isPlatform,
        child: (
          <DropdownBtn
            icon="settings"
            funcType="flat"
            text={intl.get('smpc.product.button.batchOperate').d('批量操作')}
          />
        ),
        children: [
          {
            name: 'batchEnabled',
            btnComp: TooltipButtons,
            observerBtnProps: () => ({
              funcType: 'link',
              text: intl.get('smpc.product.button.batchEnable').d('批量启用'),
              tipText: intl
                .get('smpc.product.button.disabledForNoDisData')
                .d('请至少选择一行禁用的数据'),
              wait: 1000,
              disabled: this.ds.selected.filter((i) => i.get('enabledFlag') === 0) < 1,
              onClick: () =>
                this.handleBatch(
                  this.ds.selected.filter((i) => i.get('enabledFlag') === 0),
                  1
                ),
            }),
          },
          {
            name: 'batchDisabled',
            btnComp: TooltipButtons,
            observerBtnProps: () => ({
              text: intl.get('smpc.product.button.batchUnEnable').d('批量禁用'),
              tipText: intl
                .get('smpc.product.button.disabledForNoEnaData')
                .d('请至少选择一行启用的数据'),
              wait: 1000,
              funcType: 'link',
              disabled: this.ds.selected.filter((i) => i.get('enabledFlag') === 1) < 1,
              onClick: () =>
                this.handleDisabled(this.ds.selected.filter((i) => i.get('enabledFlag') === 1)),
            }),
          },
        ],
      },
    ];

    const _btns = this.filterBtns(btns).map((m) => {
      const { children, ...other } = m;
      if (children) {
        const filterChildren = this.filterBtns(children);
        return { ...other, children: filterChildren };
      }
      return m;
    });
    return _btns;
  }

  @Bind()
  filterBtns(btns) {
    return btns.filter((b) => b.show !== false);
  }

  render() {
    const columns = this.getColumns();
    return (
      <React.Fragment>
        <Header title={intl.get('smpc.labelConfig.view.title').d('商品标签定义')}>
          <DynamicButtons buttons={this.getButtons()} defaultBtnType="c7n-pro" />
        </Header>
        <Content className={styles['label-config-container']}>
          <FilterBarTable
            customizedCode="SMPC.PRODUCT_LABEL_CONFIG.TABLE"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
            dataSet={this.ds}
            columns={columns}
            filterBarConfig={{
              expandable: false,
              defaultSortedField: 'lastUpdateDate',
              defaultSortedOrder: 'desc',
            }}
          />
        </Content>
      </React.Fragment>
    );
  }
}
