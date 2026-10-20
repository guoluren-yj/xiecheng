/**
 * index - 接口平台-应用配置
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { DataSet, Modal, Table } from 'choerodon-ui/pro';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import queryString from 'query-string';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import withProps from 'hzero-front/lib/utils/withProps';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import notification from 'hzero-front/lib/utils/notification';
import getServiceLang from '@/langs/serviceLang';
import getLang from '@/langs/interfacesLang';
import { tableDS as TableDS } from '@/stores/Interfaces/interfaceDS';
import { yesOrNoRender, TagRender, operatorRender } from 'hzero-front/lib/utils/renderer';
import {
  SERVICE_TYPE_TAGS,
  SERVICE_CATEGORY_CONSTANT,
  SOURCE_TYPE_TAG,
} from '@/constants/constants';
import InvokeAddrModal from '@/routes/Services/components/InvokeAddrModal';
import { batchAddAuth } from '@/services/interfacesService';
import styles from './index.less';
import AuthModal from './AuthModal';

@formatterCollections({
  code: ['hzero.common', 'hitf.interfaces', 'hitf.services'],
})
@withProps(
  () => {
    const tableDS = new DataSet(TableDS());
    return { tableDS };
  },
  { cacheState: true }
)
export default class Interfaces extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  @Bind()
  fetchDocument(interfaceId) {
    this.props.dispatch({
      type: 'services/queryDocument',
      payload: interfaceId,
    });
  }

  /**
   * 打开透传地址模态
   * @param item 当前选中行数据
   */
  handleOpenInvokeAddrModal(item = {}) {
    const { interfaceServerId, tenantId, interfaceCode, serviceCategory } = item;
    const invokeAddrModalProps = {
      interfaceServerId,
      tenantId,
      interfaceCode,
      hiddenRequestPayload: serviceCategory === SERVICE_CATEGORY_CONSTANT.FILE,
      hiddenRequestMethodOption: serviceCategory !== SERVICE_CATEGORY_CONSTANT.DS,
      onFetchDocument: this.fetchDocument,
    };
    Modal.open({
      title: getServiceLang('INVOKE_INFO'),
      style: { width: 1200 },
      footer: (_okBtn, cancelBtn) => cancelBtn,
      cancelText: getLang('CLOSE'),
      cancelProps: { color: 'primary' },
      children: <InvokeAddrModal {...invokeAddrModalProps} />,
    });
  }

  /**
   * 新开文档预览窗口
   * @param {object} record - 表格行数据
   */
  @Bind()
  openDocument(record = {}) {
    const { namespace, serverCode, interfaceCode, tenantId } = record;
    window.open(
      `${
        window.$$env.BASE_PATH || '/'
      }pub/hitf/document-view?namespace=${namespace}&serverCode=${serverCode}&interfaceCode=${interfaceCode}&tenantId=${tenantId}`
    );
  }

  @Bind()
  openAuthConfig(record = {}) {
    const { interfaceId } = record;
    const {
      dispatch,
      location: { search, pathname },
    } = this.props;
    const { access_token: accessToken } = queryString.parse(search.substring(1));
    dispatch(
      routerRedux.push({
        pathname:
          pathname.indexOf('/private') === 0
            ? `/private/hitf/interfaces/auth-config/${interfaceId}`
            : `/hitf/interfaces/auth-config/${interfaceId}`,
        search: pathname.indexOf('/private') === 0 ? `?access_token=${accessToken}` : '',
      })
    );
  }

  /**
   * 开启批量新建弹窗
   */
  @Bind()
  handleOpenModal() {
    const { tableDS } = this.props;
    const selectedRows = tableDS.selected;
    if (isEmpty(selectedRows)) {
      notification.error({
        message: getLang('EMPTY_INTERFACE_VALIDATE'),
      });
      return false;
    }
    const modalProps = {
      isNew: true,
      onSave: this.handleBatchAddAuth,
    };

    this.authModal = Modal.open({
      title: getLang('BATCH_ADD'),
      destroyOnClose: true,
      closable: true,
      style: { width: '60%' },
      okText: getLang('SAVE'),
      className: styles['calc-height-modal'],
      children: <AuthModal {...modalProps} />,
    });
  }

  /**
   * 批量添加授权
   * @param {object} values - 表单值
   */
  @Bind()
  async handleBatchAddAuth(data) {
    const { tableDS } = this.props;
    const selectedRows = tableDS.selected;
    const nextSelectedRows = selectedRows.map((item) => {
      const { interfaceId, tenantId } = item;
      const nextItem = {
        interfaceId,
        tenantId,
        ...data,
      };
      return nextItem;
    });

    return batchAddAuth(nextSelectedRows).then((res) => {
      if (res && !res.failed) {
        notification.success();
      } else {
        notification.error({ description: res.message });
        return false;
      }
      return res;
    });
  }

  get tableColumns() {
    const {
      match: { path },
    } = this.props;
    return [
      !isTenantRoleLevel() && {
        name: 'tenantName',
        width: 150,
      },
      {
        name: 'namespace',
        width: 120,
      },
      {
        name: 'interfaceCode',
        width: 200,
      },
      {
        name: 'interfaceName',
        width: 150,
      },
      {
        name: 'serverCode',
        width: 400,
      },
      {
        name: 'serverName',
        width: 400,
      },
      {
        name: 'serverType',
        width: 120,
        align: 'center',
        renderer: ({ value, text }) => TagRender(value, SERVICE_TYPE_TAGS, text),
      },
      isTenantRoleLevel() && {
        name: 'sourceType',
        width: 100,
        align: 'center',
        renderer: ({ value, text }) => TagRender(value, SOURCE_TYPE_TAG, text),
      },
      {
        name: 'isPublicFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      isTenantRoleLevel() && {
        name: 'tenantAuthFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      isTenantRoleLevel() && {
        name: 'authFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        title: getLang('OPERATOR'),
        width: 240,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const operators = [
            {
              key: 'addr',
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.invokeInfo`,
                      type: 'button',
                      meaning: getLang('INVOKE_INFO'),
                    },
                  ]}
                  onClick={() => this.handleOpenInvokeAddrModal(record.toData())}
                >
                  {getServiceLang('INVOKE_INFO')}
                </ButtonPermission>
              ),
              len: 4,
              title: getServiceLang('INVOKE_INFO'),
            },
            {
              key: 'viewDocument',
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.viewDocument`,
                      type: 'button',
                      meaning: getLang('VIEW_DOCUMENT'),
                    },
                  ]}
                  onClick={() => this.openDocument(record.toData())}
                >
                  {getLang('VIEW_DOCUMENT')}
                </ButtonPermission>
              ),
              len: 4,
              title: getLang('VIEW_DOCUMENT'),
            },
            {
              key: 'auth',
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.auth`,
                      type: 'button',
                      meaning: getLang('AUTH'),
                    },
                  ]}
                  onClick={() => this.openAuthConfig(record.toData())}
                >
                  {getLang('AUTH')}
                </ButtonPermission>
              ),
              len: 4,
              title: getLang('AUTH'),
            },
          ];
          return operatorRender(operators, record, { limit: 3 });
        },
      },
    ];
  }

  render() {
    const { path, tableDS } = this.props;
    return (
      <>
        <Header title={getLang('INTERFACE_HEADER')}>
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.batchAuth`,
                type: 'button',
                meaning: '批量添加认证',
              },
            ]}
            type="primary"
            icon="plus"
            onClick={this.handleOpenModal}
          >
            {getLang('BATCH_ADD')}
          </ButtonPermission>
        </Header>
        <Content>
          <Table
            dataSet={tableDS}
            columns={this.tableColumns}
            autoHeight={{ type: 'maxHeight', diff: 90 }}
          />
        </Content>
      </>
    );
  }
}
