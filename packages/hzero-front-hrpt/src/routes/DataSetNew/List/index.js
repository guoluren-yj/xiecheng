/* eslint-disable react/display-name */
import React, { Fragment, useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { DataSet, Lov, Button, Dropdown, Menu, Modal, Form, TextField, IntlField } from 'choerodon-ui/pro';
import { Popconfirm, Icon } from 'choerodon-ui';
import { isNil } from 'lodash';

import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { Header, Content } from 'components/Page';
import { isTenantRoleLevel, getCurrentUser, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import { deletePrintDataset } from '@/services/dataSetService';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { getHeaderFormDs, getTableDs } from './store';
import CopyModal from './CopyModal';
import styles from './index.less';
import { copyDataSet } from '../../../services/dataSetService';

const List = ({ history, headerFormDs, tableDs }) => {
  const copyModalRef = useRef();
  const { loginName } = getCurrentUser() || {};
  const isAdmin = loginName === 'admin';  
  const [isTenant, setIsTenant] = useState(isTenantRoleLevel());
  const tableColumns = useMemo(
    () => [
      {
        name: 'datasetName',
        width: 300,
        renderer: ({ record }) => {
          if (!record) {
            return;
          }
          return (
            <div className={styles['dataset-info']}>
              <div onClick={() => handleEdit(record)}>{record.get('datasetName')}</div>
              <div>{record.get('datasetCode')}</div>
            </div>
          );
        },
      },
      { name: 'tenantName', width: 300 },
      // { name: 'businessObjectName' },
      {
        name: 'datasetType',
        width: 120,
        renderer: ({ value }) => {
          const typeMeaningObj = {
            SCRIPT_SQL: intl
              .get('hrpt.reportDataSet.modal.reportDataSet.type.scriptSql')
              .d('脚本SQL'),
            URL: 'URL',
          };
          return typeMeaningObj[value] || '';
        },
      },
      { name: 'remark' },
      {
        name: 'enabledFlag',
        width: 100,
        renderer: ({ value }) => enableRender(value),
      },
      {
        header: intl.get('hzero.common.button.action').d('操作'),
        key: 'action',
        lock: 'right',
        width: 100,
        renderer: ({ record }) => {
          const canBeDeleted = record.get('canBeDeleted');
          const btns = [];
          if (isAdmin || (window.$$env || {}).HRPT_ADD_FIELD === "true" || record.get('tenantId') !== 0) {
            btns.push(<a style={{ marginRight: "8px" }} onClick={() => handleTenantCopy(record)}>{intl.get('hzero.common.button.copy').d("复制")}</a>);
          }
          if (canBeDeleted) {
            btns.push(
              <Popconfirm
                placement="topRight"
                title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
                onConfirm={() => handleDelete(record)}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            );
          }
          return btns;
        },
      },
    ],
    []
  );

  useEffect(() => {
    headerFormDs.addEventListener('update', handleHeaderFromDsUpdate);
    return () => {
      headerFormDs.removeEventListener('update', handleHeaderFromDsUpdate);
    };
  }, [handleHeaderFromDsUpdate]);

  const handleHeaderFromDsUpdate = useCallback(
    ({ name, value }) => {
      if (name === 'tenant') {
        const tenantId = isNil(value) || isNil(value.tenantId) ? '' : value.tenantId;
        // 平台菜单，当前tenantId是平台级租户，不一致则为租户级
        setIsTenant(Number(tenantId) !== Number(getCurrentOrganizationId()));
        tableDs.setQueryParameter('tenantId', tenantId);
        tableDs.query();
      }
    },
    [tableDs]
  );

  const handleClickMenuItem = useCallback(
    ({ key }) => {
      if (key === 'copy') {
        handleCopy();
      } else if (key === 'create') {
        handleCreate();
      }
    },
    [handleCopy, handleCreate]
  );
  // 刷新表格
  const handleRefresh = useCallback(() => {
    tableDs.query();
  }, [tableDs]);
  // 编辑表格行
  const handleEdit = useCallback((record) => {
    const datasetId = record.get('datasetId');
    history.push({
      pathname: `/hrpt/print-dataset/detail/${datasetId}`,
    });
  }, []);
  // 删除表格行
  const handleDelete = useCallback(
    (record) => {
      const datasetId = record.get('datasetId');
      tableDs.status = DataSetStatus.loading;
      deletePrintDataset(datasetId)
        .then((res) => {
          if (getResponse(res)) {
            notification.success();
            handleRefresh();
          }
        })
        .finally(() => {
          tableDs.status = DataSetStatus.ready;
        });
    },
    [tableDs, handleRefresh]
  );
  // 从平台复制
  const handleCopy = useCallback(() => {
    if (!headerFormDs.current) {
      return;
    }
    const tenantId = headerFormDs.current.get('tenantId');
    Modal.open({
      title: intl
        .get('hrpt.reportDataSet.view.button.copyAsPlatformDataSet')
        .d('选择数据集进行复制'),
      style: {
        width: '600px',
      },
      children: <CopyModal copyModalRef={copyModalRef} tenantId={tenantId} />,
      onOk: handleCopySubmit,
    });
  }, [headerFormDs]);
    // 当前租户复制
  const handleTenantCopy = useCallback((record) => {
    if (!headerFormDs.current) {
      return;
    }
    const ds = new DataSet({
      fields: [
        { name: 'datasetCode', label: intl.get('hrpt.reportDataSet.model.reportDataSet.dataSetCode').d('数据集编码'), type: 'string', required: true },
        { name: 'datasetName', label: intl.get('hrpt.reportDataSet.model.reportDataSet.datasetName').d('数据集名称'), type: 'intl', required: true },
        { name: 'remark', label: intl.get('hzero.common.remark').d('备注'), type: 'intl' },
      ],
    });
    ds.create({
      tenantId: headerFormDs.current.get('tenantId'),
      datasetId: record && record.get("datasetId"),
    });
    Modal.open({
      title: intl
        .get('hrpt.reportDataSet.view.button.copyDataSet')
        .d('数据集复制'),
      style: {
        width: '324px',
      },
      drawer: true,
      children: (
        <Form dataSet={ds} labelLayout="float">
          <TextField name="datasetCode" restrict="0-9A-Za-z-._" />
          <IntlField name="datasetName" />
          <IntlField name="remark" />
        </Form>
      ),
      onOk: async () => {
        if (await ds.validate()) {
          const res = await copyDataSet({ data: ds.current.toJSONData() });
          if (getResponse(res)) {
            notification.success();
            return true;
          }
          return false;
        }
        return false;
      },
    });
  }, [headerFormDs]);
  // 新建
  const handleCreate = useCallback(() => {
    history.push({
      pathname: '/hrpt/print-dataset/create',
    });
  }, []);
  // 提交复制的数据集
  const handleCopySubmit = useCallback(async () => {
    if (copyModalRef && copyModalRef.current && copyModalRef.current.submit) {
      const flag = await copyModalRef.current.submit();
      if (flag) {
        handleRefresh();
      }
      return flag;
    } else {
      return false;
    }
  }, [handleRefresh]);
  const HeaderButton = useMemo(() => {
    if (
      isTenantRoleLevel() ||
      (headerFormDs.current &&
        !isNil(headerFormDs.current.get('tenant')) &&
        Number(headerFormDs.current.get('tenant').tenantId) !== Number(getCurrentOrganizationId()))
    ) {
      const menu = (
        <Menu onClick={handleClickMenuItem}>
          <Menu.Item key="copy">
            {intl.get('hrpt.reportDataSet.view.button.copyAsPlatform').d('复制自平台')}
          </Menu.Item>
          <Menu.Item key="create">{intl.get('hzero.common.button.create').d('新建')}</Menu.Item>
        </Menu>
      );
      return (
        <Dropdown trigger={['hover']} overlay={menu}>
          <Button icon="add" color="primary">
            {intl.get('hzero.common.button.create').d('新建')}
            <Icon type="keyboard_arrow_down" />
          </Button>
        </Dropdown>
      );
    } else {
      return (
        <Button icon="add" color="primary" onClick={handleCreate}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      );
    }
  }, [headerFormDs, isTenant, handleCreate, handleClickMenuItem]);

  const HeaderTitle = useMemo(
    () => (
      <>
        <span>{intl.get('hrpt.reportDataSet.view.message.title').d('数据集')}</span>
        <Lov dataSet={headerFormDs} name="tenant" className={styles['header-form-lov']} />
      </>
    ),
    [headerFormDs]
  );

  const handleQuery = useCallback(
    ({ params }) => {
      const tenantId = headerFormDs.current && headerFormDs.current.get('tenantId');
      if (tableDs.queryDataSet) {
        tableDs.queryDataSet.loadData([
          {
            ...params,
            tenantId,
          },
        ]);
        tableDs.query();
      }
    },
    [headerFormDs, tableDs]
  );

  return (
    <Fragment>
      <Header title={HeaderTitle}>{HeaderButton}</Header>
      <Content>
        <SearchBarTable
          searchCode="PRINT_DATASET.SEARCHBAR"
          dataSet={tableDs}
          columns={tableColumns}
          rowHeight={40}
          cacheState
          searchBarConfig={{
            closeFilterSelector: true,
            expandable: false,
            onQuery: handleQuery,
          }}
          autoHeight={{ type: 'maxHeight', diff: 40 }}
        />
      </Content>
    </Fragment>
  );
};

export default formatterCollections({
  code: ['hrpt.reportDataSet', 'entity.tenant', 'hrpt.common'],
})(
  withProps(
    () => {
      const headerFormDs = new DataSet(getHeaderFormDs());
      const tableDs = new DataSet(getTableDs());
      return {
        headerFormDs,
        tableDs,
      };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(List)
);
