/*
 * index - 服务注册
 * @date: 2018/10/26 16:18:29
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Button, DataSet, Table, TextField } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { yesOrNoRender, operatorRender, TagRender } from 'hzero-front/lib/utils/renderer';
import withProps from 'hzero-front/lib/utils/withProps';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import ExcelExport from 'hzero-front/lib/components/ExcelExport';
import { openTab } from 'hzero-front/lib/utils/menuTab';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { omit } from 'lodash';
import queryString from 'querystring';
import getLang from '@/langs/serviceLang';
import {
  SERVICE_CATEGORY_TAGS,
  SERVICE_STATUS_TAGS,
  SERVICE_TYPE_TAGS,
  SERVICE_CATEGORY_CONSTANT,
} from '@/constants/constants';
import { tableDS } from '@/stores/Services/headerDS';
import InvokeAddrModal from './components/InvokeAddrModal';
import ImportServiceModal from './ImportServiceModal';
import RestfulModal from './RestfulModal';
import CloneModal from './CloneModal';
import styles from './index.less';

@connect(({ services }) => ({
  services,
  currentTenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['hzero.common', 'hitf.services'] })
@withProps(
  () => {
    const serviceTableDS = new DataSet(tableDS());
    return { serviceTableDS };
  },
  { cacheState: true, keepOriginDataSet: false }
)
export default class List extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'services/queryIdpValue',
    });
    this.fetchStatisticsPeriodCode();
    this.fetchExceedThresholdActionCode();
    this.fetchStatisticsLevelCode();
  }

  /**
   * fetchStatisticsPeriodCode - 查询授权模式<HITF.GRANT_TYPE>code
   * @return {Array}
   */
  @Bind()
  fetchStatisticsPeriodCode() {
    const { dispatch = () => {} } = this.props;
    return dispatch({
      type: 'services/queryCode',
      payload: { lovCode: 'HITF.STATISTICS_PERIOD' },
    });
  }

  /**
   * fetchStatisticsPeriodCode - 查询授权模式<HITF.GRANT_TYPE>code
   * @return {Array}
   */
  @Bind()
  fetchExceedThresholdActionCode() {
    const { dispatch = () => {} } = this.props;
    return dispatch({
      type: 'services/queryCode',
      payload: { lovCode: 'HITF.EXCEED_THRESHOLD_ACTION' },
    });
  }

  /**
   * fetchStatisticsLevelCode - 查询授权模式<HITF.GRANT_TYPE>code
   * @return {Array}
   */
  @Bind()
  fetchStatisticsLevelCode() {
    const { dispatch = () => {} } = this.props;
    return dispatch({
      type: 'services/queryCode',
      payload: { lovCode: 'HITF.STATISTICS_LEVEL' },
    });
  }

  /**
   * 删除服务
   */
  handleDelete(record) {
    return this.props.serviceTableDS.delete(record);
  }

  /**
   * 打开透传地址模态
   * @param record 当前选中行数据
   */
  @Bind()
  handleOpenInvokeAddrModal(record) {
    const { interfaceServerId, tenantId, serviceCategory } = record.toData();
    const invokeAddrModalProps = {
      interfaceServerId,
      tenantId,
      hiddenRequestPayload: serviceCategory === SERVICE_CATEGORY_CONSTANT.FILE,
      hiddenRequestMethodOption: serviceCategory !== SERVICE_CATEGORY_CONSTANT.DS,
      onFetchDocument: this.fetchDocument,
    };
    Modal.open({
      title: getLang('INVOKE_INFO'),
      style: { width: 1200 },
      footer: (_okBtn, cancelBtn) => cancelBtn,
      cancelText: getLang('CLOSE'),
      cancelProps: { color: 'primary' },
      children: <InvokeAddrModal {...invokeAddrModalProps} />,
    });
  }

  @Bind()
  handleGotoDetail(interfaceServerId) {
    let url = `/hitf/services/detail/${interfaceServerId}`;
    // 新建路由
    if (!interfaceServerId) {
      url = '/hitf/services/create';
    }
    this.props.dispatch(
      routerRedux.push({
        pathname: url,
      })
    );
  }

  /**
   * 导入服务模态框打开
   */
  @Bind()
  handleOpenImportServiceModal() {
    Modal.open({
      title: getLang('IMPORT_SERVICE'),
      closable: true,
      movable: true,
      destroyOnClose: true,
      style: { width: 700 },
      className: styles['calc-height-modal'],
      children: <ImportServiceModal onGotoDetail={this.handleGotoDetail} />,
    });
  }

  @Bind()
  handleOpenRestfulModal() {
    Modal.open({
      title: getLang('RESTFUL_SERVICE'),
      closable: true,
      movable: true,
      destroyOnClose: true,
      style: { width: 700 },
      className: styles['calc-height-modal'],
      children: <RestfulModal onGotoDetail={this.handleGotoDetail} />,
    });
  }

  /**
   * 获取导出字段查询参数
   */
  @Bind()
  getExportQueryParams() {
    const fieldsValue = omit(this.props.serviceTableDS?.queryDataSet?.records[0].toData(), [
      '__dirty',
    ]);
    return fieldsValue;
  }

  /**
   * 服务注册Excel导入
   */
  @Bind()
  handleImport() {
    openTab({
      key: `/hpfm/prompt/import-data/HITF.INTERFACE_SERVER`,
      title: 'hzero.common.button.import',
      search: queryString.stringify({
        action: 'hzero.common.button.import',
        prefixPatch: HZERO_HITF,
      }),
    });
  }

  @Bind()
  fetchDocument(interfaceId) {
    this.props.dispatch({
      type: 'services/queryDocument',
      payload: interfaceId,
    });
  }

  /**
   * 打开克隆弹窗
   */
  @Bind()
  handleOpenCloneModal(record) {
    const { currentTenantId } = this.props;
    const currentRecordTenantId = record.get('tenantId');
    const isCurrentRole = currentRecordTenantId.toString() === currentTenantId.toString();
    const modalProps = {
      isCurrentRole,
      currentRecordTenantId,
      interfaceServerId: record.get('interfaceServerId'),
      onRefresh: () => this.props.serviceTableDS.query(),
    };
    Modal.open({
      title: getLang('CLONE'),
      okText: getLang('SAVE'),
      children: <CloneModal {...modalProps} />,
    });
  }

  get serviceColumns() {
    return [
      !isTenantRoleLevel() && {
        name: 'tenantName',
        width: 150,
      },
      {
        name: 'serverCode',
        width: 400,
      },
      {
        name: 'serverName',
        width: 200,
      },
      {
        name: 'serviceType',
        width: 100,
        align: 'center',
        renderer: ({ value, record }) => {
          return TagRender(value, SERVICE_TYPE_TAGS, record.get('serviceTypeMeaning'));
        },
      },
      {
        name: 'serviceCategory',
        width: 100,
        align: 'center',
        renderer: ({ value, record }) => {
          return TagRender(value, SERVICE_CATEGORY_TAGS, record.get('serviceCategoryMeaning'));
        },
      },
      {
        name: 'namespace',
      },
      {
        name: 'domainUrl',
        width: 300,
      },
      {
        name: 'status',
        width: 100,
        align: 'center',
        renderer: ({ value, record }) => {
          return TagRender(value, SERVICE_STATUS_TAGS, record.get('statusMeaning'));
        },
      },
      {
        name: 'nameLevelPaths',
        width: 200,
      },
      {
        name: 'enabledFlag',
        width: 100,
        align: 'center',
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'formatVersion',
        width: 100,
      },
      {
        title: getLang('OPERATOR'),
        width: 180,
        align: 'center',
        lock: 'right',
        renderer: ({ record }) => {
          const operators = [
            {
              key: 'addr',
              ele: (
                <a className="addr" onClick={() => this.handleOpenInvokeAddrModal(record)}>
                  {getLang('INVOKE_INFO')}
                </a>
              ),
              len: 4,
              title: getLang('INVOKE_INFO'),
            },
            {
              key: 'edit',
              ele: (
                <a
                  className="edit"
                  onClick={() => this.handleGotoDetail(record?.get('interfaceServerId'))}
                >
                  {getLang('EDIT')}
                </a>
              ),
              len: 2,
              title: getLang('EDIT'),
            },
            {
              key: 'clone',
              ele: (
                <a className="edit" onClick={() => this.handleOpenCloneModal(record)}>
                  {getLang('CLONE')}
                </a>
              ),
              len: 2,
              title: getLang('CLONE'),
            },
            {
              key: 'delete',
              ele: (
                <a className="delete" onClick={() => this.handleDelete(record)}>
                  {getLang('DELETE')}
                </a>
              ),
              len: 2,
              title: getLang('DELETE'),
            },
          ];
          return operatorRender(operators, record);
        },
      },
    ];
  }

  render() {
    const { match, currentTenantId } = this.props;
    const { path } = match;
    return (
      <>
        <Header title={getLang('HEADER')}>
          <Button icon="build-o" color="primary" onClick={() => this.handleGotoDetail()}>
            {getLang('REGISTER')}
          </Button>
          <Button icon="build-o" onClick={this.handleOpenRestfulModal}>
            {getLang('RESTFUL')}
          </Button>
          <Button icon="build-o" onClick={this.handleOpenImportServiceModal}>
            {getLang('SOAP')}
          </Button>
          <ExcelExport
            requestUrl={`${HZERO_HITF}/v1/${
              isTenantRoleLevel()
                ? `${currentTenantId}/interface-servers/export`
                : 'interface-servers/export'
            }`}
            otherButtonProps={{ icon: 'file_upload', type: 'c7n-pro' }}
            queryParams={this.getExportQueryParams}
          />
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.Import`,
                type: 'button',
                meaning: '服务注册-导入',
              },
            ]}
            type="c7n-pro"
            icon="get_app"
            onClick={this.handleImport}
          >
            {getLang('IMPORT')}
          </ButtonPermission>
        </Header>
        <Content>
          <Table
            dataSet={this.props.serviceTableDS}
            columns={this.serviceColumns}
            queryFields={{
              serverCode: <TextField restrict="a-zA-Z0-9-_./" />,
            }}
          />
        </Content>
      </>
    );
  }
}
