/**
 * PortalLayout - 门户模板管理
 * @date: 2021-06-07
 * @author: Danica <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import {compose} from "lodash";
import querystring from 'querystring';
import React, { useCallback, useMemo } from 'react';
import { Button, DataSet, Form, Lov, Modal, Table, TextField, message } from 'choerodon-ui/pro';
import { Upload } from 'choerodon-ui';

import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { TopSection, SecondSection } from '_components/Section';
// import withProps from 'utils/withProps';
import { downloadFile } from 'hzero-front/lib/services/api';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getResponse,
  getAccessToken,
  filterNullValueObject,
  getPlatformVersionApi,
  isTenantRoleLevel,
  getCurrentOrganizationId,
} from 'utils/utils';
import { API_HOST } from 'utils/config';
import intl from 'utils/intl';

import MoreButton from '@/routes/components/MoreButton';
import { updateEnabledFlag } from '@/services/portalService';
import layoutDs from './store/layoutDs';
import layoutLineDs from './store/layoutLineDs';
import '../PortalManage/index.less';

const isTenant = isTenantRoleLevel();
const tenantId = getCurrentOrganizationId();

function PortalLayout(props) {
  const {layoutDsObject} = props;

  /**
   * 启动或禁用
   * @param {Boolean} value
   */
  const renderStatus = useCallback(({ value }) => {
    return (
      <div className={value === 1 ? 'tag tag-enable' : 'tag tag-disable'}>
        {value === 1
          ? intl.get(`hzero.common.status.enable`).d('启用')
          : intl.get('hzero.common.status.disable').d('禁用')}
      </div>
    );
  }, []);

  const handleSetting = (record, type) => {
    const id = record.get('id');
    props.history.push({
      pathname: `/spfm/portal-layout/edit/${id}`,
      search: querystring.stringify(
        filterNullValueObject({
          type,
        })
      ),
    });
  };

  // 启用、禁用
  const handleEnable = (record) => {
    const recordData = record?.toData() || {};
    const params = {
      ...recordData,
      enabledFlag: recordData.enabledFlag ? 0 : 1,
    };
    updateEnabledFlag(params).then((response) => {
      const res = getResponse(response);
      if (res) {
        notification.success();
        layoutDsObject.query(layoutDsObject.currentPage);
      }
    });
  };

  /**
   * 操作按钮-列表
   * @param {record} 行信息
   */
  const renderOpr = useCallback(({ record }) => {
    const id = record.get('id');
    const recordTenantId = record.get('tenantId');
    const { enabledFlag } = record?.get(['enabledFlag']) || {};
    const token = getAccessToken();
    const importapi = getPlatformVersionApi(`portal-layouts/import-layout/${id}`);
    const exportapi = getPlatformVersionApi(`portal-layouts/export-layout/${id}`);
    const status = tenantId === recordTenantId;
    const buttons = [
      {
        name: 'enable',
        hidden: !status,
        child: enabledFlag
          ? intl.get('hzero.common.status.disable').d('禁用')
          : intl.get('hzero.common.status.enable').d('启用'),
        onClick: () => handleEnable(record),
      },
      {
        name: 'setting',
        hidden: !status,
        child: intl.get('hzero.common.button.edit').d('编辑'),
        onClick: () => handleSetting(record),
      },
      {
        name: 'allocation',
        hidden: !enabledFlag,
        child: intl.get('hptl.portalAssign.view.option.webUrl').d('分配域名'),
        onClick: () => openLayoutModal(record),
      },
      {
        name: 'import',
        hidden: !status,
        child: (
          <Upload
            headers={{ Authorization: `bearer ${token}` }}
            action={`${API_HOST}/spfm/v1/${importapi}`}
            accept=".json"
            showUploadList={false}
            uploadShowFlag={false}
            onSuccess={(res) => {
              if (res.failed) {
                message.error(res.message);
              } else {
                message.success(intl.get('hzero.common.upload.status.success').d('上传成功'));
              }
            }}
          >
            {intl.get('hzero.common.import').d('导入')}
          </Upload>
        ),
      },
      {
        name: 'export',
        child: intl.get('hzero.common.export').d('导出'),
        onClick: () => {
          downloadFile({ requestUrl: `/spfm/v1/${exportapi}?access_token=${token}` });
        },
      },
    ].filter((btn) => !btn.hidden);
    return <MoreButton buttons={buttons} />;
  }, []);

  /**
   * 编号
   * @param {Boolean} value
   */
  const renderIndex = useCallback(({ record }) => {
    return record.index + 1;
  }, []);

  /**
   * 行信息-新增
   * @param {record} 行信息
   */
  const handleAdd = (id, dataSet) => {
    const record = dataSet.create({}, 0);
    record.set('id', id);
    record.setState('editing', true);
  };

  /**
   * @function openLayoutModal - 分配弹窗
   * @param {object} record - 行数据
   */
  const openLayoutModal = (record) => {
    const layoutLineDsObject = new DataSet(layoutLineDs());
    const id = record.get('id');
    const enabledFlag = record.get('enabledFlag');
    const btns =
      enabledFlag === 1
        ? [
          <Button
            icon="playlist_add"
            onClick={() => {
                handleAdd(id, layoutLineDsObject);
              }}
            key="add"
          >
            {intl.get('hzero.common.button.increase').d('新增')}
          </Button>,
            'delete',
          ]
        : [];
    layoutLineDsObject.setQueryParameter('id', id);
    layoutLineDsObject.query();
    layoutLineDsObject.getField('webUrlObject').setLovPara('id', id);

    Modal.open({
      title: intl.get('hptl.portalAssign.view.option.webUrl').d('分配域名'),
      key: Modal.key(),
      drawer: true,
      style: {
        width: 742,
      },
      children: (
        <TopSection className="no-top-section">
          <SecondSection title={intl.get('hptl.portalAssign.model.portalAssign.layout').d('模板')}>
            <Form record={record} useColon={false} labelLayout="float" style={{ marginBottom: 32 }}>
              <TextField name="layoutCode" disabled />
              <Lov name="layoutObject" disabled />
            </Form>
          </SecondSection>
          <SecondSection title={intl.get('hptl.portalAssign.model.title.webUrl').d('域名')}>
            <Table
              autoFocus
              editMode="cell"
              buttons={btns}
              dataSet={layoutLineDsObject}
              style={{ maxHeight: 'calc(100vh - 430px)' }}
            >
              <Table.Column name="index" renderer={renderIndex} width={70} />
              <Table.Column name="webUrlObject" editor />
            </Table>
          </SecondSection>
        </TopSection>
      ),
      onOk: async () => {
        layoutLineDsObject.submit();
      },
    });
  };

  /**
   * 新增模板
   */
  const openAddLayoutModal = () => {
    props.history.push('/spfm/portal-layout/create');
  };

  // 列表信息
  const columns = useMemo(() => {
    return [
      { name: 'enabledFlag', width: 100, renderer: renderStatus },
      { name: 'action', width: 200, renderer: renderOpr },
      {
        name: 'layoutCode',
        width: 150,
        renderer: ({ value, record }) => (
          <a onClick={() => handleSetting(record, 'view')}>{value}</a>
        ),
      },
      { name: 'layoutName' },
      { name: 'description' },
      { name: 'tenantName', width: 200 },
    ];
  }, []);

  return (
    <>
      <Header title={intl.get('hptl.portalAssign.view.title.templatelist').d('门户模板管理')}>
        <Button icon="add" color="primary" onClick={openAddLayoutModal}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      </Header>
      <Content>
        <SearchBarTable
          searchCode={
            isTenant ? 'SPFM.PORTAL.LAYOUT.MANAGE.TENANT.SEARCH_BAR' : 'PORTAL_LAYOUT.SEARCH'
          } // 筛选器个性化单元编码
          selectionMode="none"
          columns={columns}
          dataSet={layoutDsObject}
          cacheState
          style={{ maxHeight: 'calc(100vh - 220px)' }}
          customizedCode="SSLM.PORTAL_LAYOUT.LIST"
          searchBarConfig={
            isTenant
              ? {
                  fieldProps: {
                    tenantId: {
                      lovPara: {
                        tenantId,
                      },
                    },
                  },
                }
              : {}
          }
        />
      </Content>
    </>
  );
}

export default compose(
  formatterCollections({
    code: ['hzero.common', 'hptl.portalAssign'],
  }),
  withProps(
    () => {
      const layoutDsObject = new DataSet(layoutDs());
      return {
        layoutDsObject,
      };
    },
    { cacheState: true }
  )
)(PortalLayout);
