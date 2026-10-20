/* eslint-disable jsx-a11y/tabindex-no-positive */
/**
 * 模板管理
 */
import React, { useRef, useState } from 'react';
import intl from 'utils/intl';
import { connect } from 'dva';
import { Header, Content } from 'components/Page';
import { Badge } from 'choerodon-ui';
import notification from 'utils/notification';
import { DataSet, Table, Button, Modal, Dropdown, Icon, Menu } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';

import CopyModal from '@/components/CopyModal';
import StaticSearchBar from '@/components/StaticSearchBar';
import {
  fetchEnabledTemplate,
  fetchAddDefault,
  fetchUpdate,
} from '@/services/templateManageService';
import { SRM_DATA_SDAT } from '@/utils/config';

import { TemplateListDS } from './stores/templateManageDS';
import { getQueryConfig } from './queryConfig';

const TemplateManagement = (props) => {
  let allSearchBarRef = useRef(null);

  const { templateListDS } = props;

  const [showModal, setShowModal] = useState(false);
  const [localRecord, setLocalRecord] = useState('');

  /**
   * 启用禁用操作
   * @param {*} record
   */
  const handleEnabled = (record) => {
    const pageNum = templateListDS?.currentPage ?? 0;
    if (record && record.get('templateId')) {
      record.set('loading', true);
      fetchEnabledTemplate({
        ...record.toData(),
        enabledFlag: record.get('enabledFlag') === 1 ? 0 : 1,
      }).then((res) => {
        record.set('loading', false);
        if (getResponse(res)) {
          templateListDS.query(pageNum);
        }
      });
    }
  };

  const handleEdit = (record) => {
    record.setState('editing', true);
  };

  /**
   * 复制数据
   */
  const handleCopy = (record) => {
    setShowModal(true);
    setLocalRecord(record);
  };

  const handleCloseCopyModal = () => {
    setShowModal(false);
  };

  /**
   * 添加或取消默认
   * @param {*} record
   */
  const handleAddDefault = (record) => {
    const defaultFlag = record.get('defaultFlag');
    const obj = record.toData();

    if (defaultFlag === 0) {
      // 添加默认
      fetchAddDefault({
        ...obj,
      }).then((res) => {
        if (getResponse(res)) {
          templateListDS.query();
        }
      });
    } else {
      // 取消默认
      fetchUpdate({
        ...obj,
        defaultFlag: 0,
      }).then((res) => {
        if (getResponse(res)) {
          templateListDS.query();
        }
      });
    }
  };

  /**
   * 确认复制
   */
  const handleCopyOk = () => {
    notification.success();
    handleCloseCopyModal();
    templateListDS.query();
  };

  /**
   * 保存数据
   * @param {*} record
   */
  const handleSave = async (record) => {
    const isValid = await record.validate(true, true);
    if (isValid) {
      templateListDS.submit().then((res) => {
        if (getResponse(res)) {
          templateListDS.query();
        }
      });
    }
  };

  const handleCancel = (record) => {
    record.reset();
    record.setState('editing', false);
    if (!record.get('templateId')) {
      templateListDS.query();
    }
  };

  /**
   * 新增行数据
   */
  const handleCreate = async () => {
    const rowRecord = await templateListDS.create({ orderSeq: 0 }, 0);
    rowRecord.setState('editing', true);
  };

  /**
   * 配置模板
   */
  const handleConfig = (record) => {
    const templateId = record?.get('templateId') ?? '';
    if (templateId) {
      props.history.push({
        pathname: `/sdat/template-management/template-config/${templateId}/edit`,
        state: {
          localRecord: record.toData(),
        },
      });
    }
  };

  /**
   * 预览模板
   * @param {*} record
   */
  const handlePreview = (record) => {
    const templateId = record?.get('templateId') ?? '';
    if (templateId) {
      props.history.push({
        pathname: `/sdat/template-management/template-config/${templateId}/view`,
        state: {
          localRecord: record.toData(),
        },
      });
    }
  };

  const menu = (record) => {
    const status = record.get('enabledFlag');
    return (
      <Menu>
        {!record.getState('editing') && record.get('templateId') && (
          <Menu.Item key="1">
            <a loading={record.get('loading')} onClick={() => handleEnabled(record)}>
              {status
                ? intl.get('hzero.common.status.disabled').d('禁用')
                : intl.get('hzero.common.button.enabled').d('启用')}
            </a>
          </Menu.Item>
        )}
        {!record.getState('editing') && record.get('templateId') ? (
          <Menu.Item key="2">
            <a style={{ marginRight: '10px' }} onClick={() => handleCopy(record)}>
              {intl.get('sdat.templateManage.view.button.copy').d('复制')}
            </a>
          </Menu.Item>
        ) : null}
        {!record.getState('editing') &&
        record.get('templateId') &&
        record.get('level') === 'site' ? (
          <Menu.Item key="3">
            <a style={{ marginRight: '10px' }} onClick={() => handleAddDefault(record)}>
              {record.get('defaultFlag') === 0
                ? intl.get('sdat.templateManage.view.button.addDefault').d('添加默认')
                : intl.get('sdat.templateManage.view.button.cancelDefault').d('取消默认')}
            </a>
          </Menu.Item>
        ) : null}
      </Menu>
    );
  };

  const columns = () => {
    return [
      {
        name: 'enabledFlag',
        align: 'left',
        width: 120,
        renderer: ({ record }) => {
          return (
            <span>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Badge dot style={{ background: record.get('enabledFlag') > 0 ? '#52c41a' : '' }} />
              &nbsp;
              {record.get('enabledFlag') > 0
                ? intl.get('sdat.templateManage.status.hasAbled').d('已启用')
                : intl.get('sdat.templateManage.status.hasEnabled').d('已禁用')}
            </span>
          );
        },
      },
      {
        name: 'operation',
        header: intl.get('hzero.common.table.column.options').d('操作'),
        width: 200,
        renderer: ({ record }) => {
          const status = record.get('enabledFlag');
          if (!record) {
            return null;
          }
          return (
            <span>
              {record.get('templateId') && !record.getState('editing') ? (
                <a style={{ marginRight: '10px' }} onClick={() => handlePreview(record)}>
                  {intl.get('hzero.common.button.review').d('预览')}
                </a>
              ) : null}
              {!record.getState('editing') && record.get('templateId') && !status ? (
                <a style={{ marginRight: '10px' }} onClick={() => handleEdit(record)}>
                  {intl.get('sdat.templateManage.view.button.edit').d('编辑')}
                </a>
              ) : null}
              {!status && record.get('templateId') && !record.getState('editing') ? (
                <a style={{ marginRight: '10px' }} onClick={() => handleConfig(record)}>
                  {intl.get('sdat.templateManage.view.button.tempConfig').d('配置')}
                </a>
              ) : null}

              {status ? (
                <a style={{ marginRight: '10px' }} onClick={() => handleEdit(record)}>
                  {intl.get('sdat.templateManage.view.button.edit').d('编辑')}
                </a>
              ) : null}

              {!record.getState('editing') && record.get('templateId') ? (
                <Dropdown overlay={() => menu(record)}>
                  <a>
                    {intl.get('hzero.common.button.more').d('更多')}
                    <Icon type="expand_more" />
                  </a>
                </Dropdown>
              ) : null}

              {record.getState('editing') ? (
                <a style={{ marginRight: '10px' }} onClick={() => handleSave(record)}>
                  {intl.get('hzero.common.button.save').d('保存')}
                </a>
              ) : null}
              {record.getState('editing') ? (
                <a style={{ marginRight: '10px' }} onClick={() => handleCancel(record)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              ) : null}
            </span>
          );
        },
      },
      {
        name: 'code',
        width: 150,
        editor: (record) => {
          return record.getState('editing') && !record.get('templateId');
        },
      },
      {
        name: 'name',
        width: 220,
        editor: (record) => {
          return record.getState('editing');
        },
        renderer: ({ record }) => {
          return (
            <span>
              <span>{record.get('name')}</span>
              {record.get('defaultFlag') === 1 ? (
                <span
                  style={{
                    backgroundColor: '#E5E7EC',
                    borderRadius: '2px',
                    color: '#4E5769',
                    fontWeight: '500',
                    padding: '0 3px',
                    marginLeft: '12px',
                  }}
                >
                  {intl.get('sdat.templateManage.view.tag.default').d('默认')}
                </span>
              ) : null}
            </span>
          );
        },
      },
      {
        name: 'description',
        editor: (record) => {
          return record.getState('editing');
        },
      },
      {
        name: 'groupCode',
        editor: (record) => {
          return record.getState('editing');
        },
      },
      {
        name: 'level',
        editor: (record) => {
          return record.getState('editing');
        },
      },
      {
        name: 'tenantObj',
        editor: (record) => {
          return record.getState('editing') && record.get('level') === 'org';
        },
        renderer: ({ record }) => {
          return record.get('level') !== 'org' ? '-' : <span>{record.get('tenantName')}</span>;
        },
      },
      {
        name: 'previewLoginName',
        editor: (record) => {
          return record.getState('editing');
        },
      },
      {
        name: 'orderSeq',
        editor: (record) => {
          return record.getState('editing');
        },
      },
    ];
  };

  const handleFilterQueryAll = ({ params }) => {
    templateListDS.queryDataSet.data = [
      {
        ...params,
        customizeFilterComparison: '',
      },
    ];
    templateListDS.query();
  };

  const getFilters = () => {
    return { ...getQueryConfig() };
  };

  const handleClear = () => {
    allSearchBarRef.setField('name', '');
    allSearchBarRef.setField('level', '');
    allSearchBarRef.setField('groupCode', '');
  };

  const fieldProps = {};

  return (
    <>
      <Header title={intl.get('sdat.templateManage.view.header.templateManagement').d('模板管理')}>
        <Button color="primary" icon="add" onClick={handleCreate}>
          {intl.get('hzero.common.button.creation').d('新建')}
        </Button>
      </Header>
      <Content>
        <StaticSearchBar
          cacheState
          clearButton
          onRef={(ref) => {
            allSearchBarRef = ref;
          }}
          searchCode="SDAT.PLATFORM_REPORT_TEMPLATE_MANAGEMENT_LIST"
          filters={getFilters()}
          dataSet={[templateListDS]}
          onQuery={handleFilterQueryAll}
          onClear={handleClear}
          onReset={handleClear}
          showLoading={false}
          fieldProps={fieldProps}
        />
        <Table
          dataSet={templateListDS}
          columns={columns()}
          queryBar="none"
          customizable
          columnDraggable
          customizedCode="SDAT.PLATFORM_REPORT_TEMPLATE_MANAGE_LIST"
        />
      </Content>

      {showModal && (
        <Modal
          title={intl.get('sdat.templateManage.view.title.templateCopy').d('模板复制')}
          visible={showModal}
          closable
          destroyOnClose
          maskClosable={false}
          onCancel={handleCloseCopyModal}
          style={{ height: '300px' }}
          maskStyle={{ zIndex: '100' }}
          width={600}
          footer={null}
        >
          <CopyModal
            localRecord={localRecord}
            requestUrl={`${SRM_DATA_SDAT}/v1/report-cockpit-templates/copy`}
            requestField="code"
            onCreate={handleCopyOk}
            onCancel={handleCloseCopyModal}
          />
        </Modal>
      )}
    </>
  );
};

export default connect((state) => state)(
  formatterCollections({
    code: ['sdat.templateManage', 'srm.filterBar'],
  })(
    withProps(
      () => {
        const templateListDS = new DataSet(TemplateListDS());

        return { templateListDS };
      },
      { cacheState: true, keepOriginDataSet: true }
    )(TemplateManagement)
  )
);
