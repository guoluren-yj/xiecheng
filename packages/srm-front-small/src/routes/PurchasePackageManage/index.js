/* eslint-disable no-undef */
import React, { useMemo } from 'react';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import { compose } from 'lodash';
import request from 'utils/request';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { connect } from 'dva';
import { observer } from 'mobx-react-lite';
import { SRM_MALL } from '_utils/config';
import ComboModal from './ComboModal';
import OperationRecordModal from './OperationRecordModal';
import { tableDs } from './ds';

const tenantId = getCurrentOrganizationId(); // 租户ID

const PurchasePackageManage = (props) => {
  const tableds = useMemo(() => {
    return new DataSet(tableDs());
  }, []);

  /* 操作记录 */
  const handleRecord = (record) => {
    const shoppingBarId = record.get('shoppingBarId');
    const url = `${SRM_MALL}/v1/${tenantId}/shopping-bar-historys/${shoppingBarId}`;
    request(url, {
      method: 'GET',
    }).then((res) => {
      const recordModal = Modal.open({
        title: intl.get('small.packages.edit.handle.record').d('操作记录'),
        drawer: true,
        children: <OperationRecordModal recordList={res} />,
        okText: intl.get('small.packages.modal.text.save').d('保存'),
        footer: (
          <Button color="primary" onClick={() => recordModal.close()}>
            {intl.get('small.packages.modal.buttom.button.close').d('关闭')}
          </Button>
        ),
      });
    });
  };

  /* 表格列 */
  const columns = [
    {
      name: 'enabledFlag',
      renderer: ({ record }) => {
        return record.get('enabledFlag') ? (
          <Tag color="green">{intl.get('small.packages.table.columns.enable').d('已启用')}</Tag>
        ) : (
          <Tag color="red">{intl.get('small.packages.table.columns.disable').d('已禁用')}</Tag>
        );
      },
    },
    {
      name: 'shoppingBarName',
      renderer: ({ record }) => {
        return (
          <a onClick={() => handleCombo(record, 'readOnly')}>{record.get('shoppingBarName')}</a>
        );
      },
    },
    { name: 'description' },
    { name: 'creationDate' },
    { name: 'startDate' },
    { name: 'endDate' },
    { name: 'effectiveDay' },
    {
      name: 'edit',
      width: 180,
      lock: 'right',
      renderer: ({ record }) => (
        <span className="action-link">
          <Button color="primary" funcType="link" onClick={() => setStatus(record)}>
            {record.get('enabledFlag')
              ? intl.get('small.packages.table.edit.disable').d('禁用')
              : intl.get('small.packages.table.edit.enable').d('启用')}
          </Button>
          <Button
            color="primary"
            funcType="link"
            onClick={() => handleCombo(record, 'edit')}
            disabled={record.get('enabledFlag')}
          >
            {intl.get('small.packages.table.edit.handle').d('编辑')}
          </Button>
          <Button color="primary" funcType="link" onClick={() => handleRecord(record)}>
            {intl.get('small.packages.table.edit.handle.record').d('操作记录')}
          </Button>
        </span>
      ),
    },
  ];

  /* 启用/禁用 */
  const setStatus = (record) => {
    const { dispatch } = props;
    const line = record.toData();
    dispatch({
      type: 'mallHomePlateManage/enablePackage',
      payload: { ...line, enabledFlag: record.get('enabledFlag') ? 0 : 1 },
    }).then((res) => {
      if (res) {
        notification.success();
        tableds.query();
      };
    });
  };

  /* modal标题判断 */
  const showModalTitle = (type) => {
    switch (type) {
      case 'create':
        return intl.get('small.packages.button.create').d('新建采购套餐');
      case 'edit':
        return intl.get('small.packages.button.edit').d('编辑采购套餐');
      case 'readonly':
        return intl.get('small.packages.button.detail').d('采购套餐明细');
      default:
        return '';
    }
  };
  /* 新建/查看/编辑套餐管理modal */
  const handleCombo = (record, type) => {
    const params = {
      record,
      type,
      tableds,
      path: props.match.path,
    };

    const modal = Modal.open({
      title: showModalTitle(type),
      size: 'large',
      drawer: true,
      okText: intl.get('small.packages.modal.text.save').d('保存'),
      children: <ComboModal {...params} />,
      footer: (okBtn, cancelBtn) => (
        <>
          {type === 'readOnly' ? (
            <Button color="primary" onClick={() => modal.close()}>
              {intl.get('small.packages.modal.button.close').d('关闭')}
            </Button>
          ) : (
            <>
              {okBtn}
              {cancelBtn}
            </>
          )}
        </>
      ),
    });
  };

  /* 套餐列表-头部删除按钮 */
  const DeleteBtn = observer(({ dataSet }) => {
    const disabled = dataSet.selected.length === 0;
    return (
      <Button
        color="default"
        icon="delete"
        funcType="flat"
        onClick={() => tableds.delete(tableds.selected)}
        disabled={disabled}
      >
        {intl.get('small.packages.table.edit.delete').d('删除')}
      </Button>
    );
  });

  return (
    <>
      <Header title={intl.get('small.packages.view.header.title').d('采购套餐管理')}>
        <Button color="primary" icon="add" onClick={() => handleCombo(undefined, 'create')}>
          {intl.get('small.packages.table.edit.add').d('新建')}
        </Button>
        <DeleteBtn dataSet={tableds} />
      </Header>
      <Content>
        <div style={{ height: 'calc(100vh - 195px)' }}>
          <SearchBarTable
            columns={columns}
            dataSet={tableds}
            searchCode="SMAL_PACKAGE_CONTROL.SEARCH_BAR"
            customizedCode="SMALL.PACKAGES.LIST"
            style={{ maxHeight: `calc(100% - 22px)` }}
          />
        </div>
      </Content>
    </>
  );
};

export default compose(
  formatterCollections({ code: ['small.packages', 'small.common'] }),
  connect(({ mallHomelateManage }) => ({
    mallHomelateManage,
  }))
)(PurchasePackageManage);
