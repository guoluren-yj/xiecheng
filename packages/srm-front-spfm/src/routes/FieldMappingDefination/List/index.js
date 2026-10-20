import React, { Fragment, useEffect, useState } from 'react';
import { DataSet, Modal, Button, Upload, message } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { getResponse, getAccessToken, getCurrentOrganizationId } from 'utils/utils';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { API_HOST } from 'utils/config';
import MarmotDownloadButton from 'srm-front-boot/lib/components/MarmotDownloadButton';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { Button as PermissionButton } from 'components/Permission';
import { enableTagRender } from 'utils/renderer';

import {
  deleteTemplateHeader,
  setTemplateHeaderEnabled,
} from '@/services/fieldMappingDefinationService';

import { getTableDs, getFormDs } from '../stores';
import { useSelect } from '../util';
import Drawer from './Drawer';
import styles from './index.less';

const tenantId = getCurrentOrganizationId();
function FieldMappingDefination(props) {
  const { tableDs: originTableDs, formDs } = props;
  const [removeLoading, setRemoveLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const { selected, dataSet: tableDs } = useSelect({ dataSet: originTableDs });

  useEffect(() => {
    tableDs.query();
    return () => {
      // 卸载时清除选中状态
      if (!isEmpty(tableDs.selected)) {
        //  eslint-disable-next-line
        tableDs.selected.forEach(item => (item.isSelected = false));
      }
    };
  }, []);

  const columns = [
    {
      name: 'isEnable',
      title: intl.get('hzero.common.status').d('状态'),
      width: 100,
      align: 'left',
      renderer: ({ value }) => enableTagRender(value),
    },
    {
      name: 'templateCode',
      renderer: ({ value, record }) => <a onClick={() => edit(record)}>{value}</a>,
    },
    { name: 'templateName' },
    { name: 'sceneName', width: 150 },
    { name: 'sourceName', width: 150 },
    { name: 'targetName', width: 150 },
    {
      header: intl.get('hzero.common.button.action').d('操作'),
      width: 100,
      align: 'center',
      lock: 'right',
      renderer: ({ record }) => (
        <a style={{ marginRight: '16px' }} onClick={() => changeEnabledFlag(record)}>
          {record.get('isEnable') === 1
            ? intl.get('hzero.common.status.disable').d('禁用')
            : intl.get('hzero.common.status.enable').d('启用')}
        </a>
      ),
    },
  ];

  const changeEnabledFlag = record => {
    const { templateCode, isEnable } = record.get(['templateCode', 'isEnable']);
    setTemplateHeaderEnabled({
      templateCode,
      enabled: isEnable === 1 ? 0 : 1,
    }).then(res => {
      if (getResponse(res)) {
        notification.success();
        tableDs.query(tableDs.currentPage);
      }
    });
  };

  const edit = record => {
    props.history.push({
      pathname: `/spfm/field-mapping-defination/detail/${record.get('id')}`,
    });
  };

  const create = () => {
    formDs.create({});
    Modal.open({
      title: intl.get('spfm.fieldMapDefine.modal.header.title').d('新建自动填单模板'),
      drawer: true,
      style: { width: 380 },
      children: <Drawer formDs={formDs} />,
      onOk: handleCreate,
      onClose: () => formDs.reset(),
      onCancle: () => formDs.reset(),
    });
  };

  const handleCreate = async () => {
    const result = await formDs.submit();
    if (!result) {
      return false;
    }
    tableDs.query(tableDs.currentPage);
  };

  // 删除字段
  const remove = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get(`hzero.common.message.confirm.remove`).d('确定删除选中数据?'),
      onOk: () => {
        setRemoveLoading(true);
        deleteTemplateHeader(selected).then(res => {
          setRemoveLoading(false);
          if (getResponse(res)) {
            notification.success();
            tableDs.query(tableDs.currentPage);
          }
        });
      },
    });
  };

  // 导出获取id参数
  const exportData = () => {
    const idsList = tableDs ? tableDs.selected.map(record => record.get('id')) : [];
    return { ids: idsList };
  };

  // 响应式模板导出按钮
  const MarmotDownloadButtonResponse = () => {
    return (
      <MarmotDownloadButton
        api={`/sada/v1/${tenantId}/marmot-organization-api/ADAPTOR_CNF_TEMPLATE_EXPORT?blankTemplateFlag=1`}
        method="post"
        tooltip="none"
        funcType="flat"
        style={{ letterSpacing: 0, marginRight: 0 }}
        icon="unarchive"
        displayName={intl.get('spfm.fieldMapDefine.button.title.template.export').d('模版导出')}
        defaultFileName={intl
          .get('spfm.fieldMapDefine.button.title.template.export.fileName')
          .d('自动填单模板文件导出')}
      />
    );
  };

  return (
    <Fragment>
      <Header title={intl.get('spfm.fieldMapDefine.view.title.header').d('自动填单模板定义')}>
        <Button icon="add" color="primary" onClick={create}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
        <Button
          icon="delete"
          funcType="flat"
          onClick={remove}
          disabled={selected.length === 0}
          loading={removeLoading}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
        <PermissionButton
          style={{ border: 'none', paddingLeft: 0, paddingRight: 0 }}
          loading={false}
          permissionList={[
            {
              code: `srm.bg.business-rule.field-mapping-defination.button.export`,
              type: 'button',
            },
          ]}
        >
          <MarmotDownloadButton
            api={`/sada/v1/${tenantId}/marmot-organization-api/ADAPTOR_CNF_TEMPLATE_EXPORT`}
            method="post"
            tooltip="none"
            funcType="flat"
            queryData={exportData()}
            style={{ letterSpacing: 0, marginRight: 0 }}
            icon="unarchive"
            displayName={
              tableDs.selected.length
                ? intl.get('spfm.fieldMapDefine.view.title.exportSelected').d('勾选导出')
                : intl.get('spfm.fieldMapDefine.view.title.exportAll').d('全量导出')
            }
          />
        </PermissionButton>
        <PermissionButton
          style={{ border: 'none', paddingLeft: 0, paddingRight: 0 }}
          permissionList={[
            {
              code: `srm.bg.business-rule.field-mapping-defination.button.import`,
              type: 'button',
            },
          ]}
        >
          <Button
            className={styles['action-button-import-noIcon']}
            tooltip="none"
            loading={importLoading}
            funcType="flat"
            icon="archive"
          >
            <Upload
              headers={{ Authorization: `bearer ${getAccessToken()}` }}
              beforeUpload={() => {
                setImportLoading(true);
              }}
              name="excel"
              action={`${API_HOST}/sada/v1/${tenantId}/adaptor-cnf-template-headers/import`}
              accept={['.xls', '.xlsx']}
              showPreviewImage={false}
              showUploadBtn={false}
              showUploadList={false}
              onUploadSuccess={res => {
                // 上传成功之后返回OK! 不成功返回的是JSON
                if (res === 'OK!') {
                  message.success(intl.get('hzero.common.upload.status.success').d('上传成功'));
                } else {
                  try {
                    const data = JSON.parse(res);
                    if (data.failed) {
                      notification.warning({
                        message: data.message,
                        duration: null,
                      });
                    }
                  } catch (error) {
                    throw error;
                  }
                }
                setImportLoading(false);
              }}
              onUploadError={() => {
                notification.warning({
                  message: intl.get('hzero.common.upload.status.error').d('上传失败'),
                });
                setImportLoading(false);
              }}
            />
            {intl.get('hzero.common.button.importdata').d('导入')}
          </Button>
        </PermissionButton>
        <PermissionButton
          style={{ border: 'none', paddingLeft: 0, paddingRight: 0 }}
          loading={false}
          permissionList={[
            {
              code: `srm.bg.business-rule.field-mapping-defination.button.template.export`,
              type: 'button',
            },
          ]}
        >
          <MarmotDownloadButtonResponse />
        </PermissionButton>
      </Header>
      <Content style={{ padding: '8px' }}>
        <FilterBarTable
          cacheState
          dataSet={tableDs}
          columns={columns}
          style={{ maxHeight: `calc(100vh - 230px)` }}
          filterBarConfig={{
            autoQuery: false,
            cacheKey: 'SPFM.FIELD_MAPPING_DEFINATION.LIST',
          }}
          customizable
          customizedCode="SPFM.FIELD_MAPPING_DEFINATION.LIST"
        />
      </Content>
    </Fragment>
  );
}

export default formatterCollections({
  code: ['spfm.fieldMapDefine', 'hzero.common'],
})(
  withProps(
    () => {
      const tableDs = new DataSet(getTableDs()); // 服务规则 ds
      const formDs = new DataSet(getFormDs());
      return { tableDs, formDs };
    },
    { cacheState: true }
  )(observer(FieldMappingDefination))
);
