/**
 * 我的接口申请
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2021/8/24
 * @copyright HAND ® 2021
 */
import React from 'react';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { Table, DataSet, Modal } from 'choerodon-ui/pro';
import { operatorRender, TagRender } from 'hzero-front/lib/utils/renderer';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import getLang from '@/langs/myApplicationLang';
import { tableDS, expandedTableDS } from '@/stores/MyApplication/MyApplicationDS';
import {
  APPROVAL_STATUS_CONSTANTS,
  APPROVAL_STATUS_TAGS,
  APPROVAL_TYPE_CONSTANTS,
  SOURCE_TYPE_TAG,
} from '@/constants/constants';
import ApplicationDrawer from './ApplicationDrawer';

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
export default class MyApplication extends React.Component {
  constructor(props) {
    super(props);

    this.tableDS = new DataSet(tableDS());
  }

  /**
   * 打开接口权限申请滑窗
   */
  openApplicationDrawer(record) {
    let applyId;
    let prevSelectedInterface = [];
    if (record) {
      applyId = record.get('applyId');
      prevSelectedInterface = record.get('permissionApplyLineList');
    }
    const drawerProps = {
      applyId,
      prevSelectedInterface,
      onRefresh: () => this.tableDS.query(),
    };
    Modal.open({
      key: 'applicationDrawer',
      title: getLang('INTERFACE_APPLY'),
      closable: true,
      drawer: true,
      destroyOnClose: true,
      style: { width: 900 },
      okText: getLang('SUBMIT'),
      children: <ApplicationDrawer {...drawerProps} />,
    });
  }

  async handleRecall(record) {
    record.set('_requestType', 'recall');
    await this.tableDS.submit().then((res) => {
      if (res && res.failed) {
        record.init('_requestType', undefined);
      } else {
        this.tableDS.query();
      }
    });
  }

  /**
   * 子行渲染
   */
  @Bind()
  handleExpandedRowRenderer({ record }) {
    const { permissionApplyLineList = [] } = record.toData();
    const tempExpandedTableDS = new DataSet(
      expandedTableDS({
        initialData: permissionApplyLineList,
      })
    );
    return (
      <Table dataSet={tempExpandedTableDS} columns={this.expandedColumns} highLightRow={false} />
    );
  }

  get myApplicationColumns() {
    const {
      match: { path },
    } = this.props;
    const { PENDING_REVIEW, NEW, RECALLED } = APPROVAL_STATUS_CONSTANTS;
    const { WORKFLOW } = APPROVAL_TYPE_CONSTANTS;
    return [
      {
        name: 'applyCode',
        width: 220,
        lock: 'left',
      },
      {
        name: 'applyReason',
      },
      {
        name: 'submittedTime',
        width: 150,
        align: 'center',
      },
      {
        name: 'statusCode',
        width: 100,
        align: 'center',
        renderer: ({ value, record }) =>
          TagRender(value, APPROVAL_STATUS_TAGS, record?.get('statusCodeMeaning')),
      },
      {
        header: getLang('OPERATOR'),
        width: 80,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const actions = [
            [NEW, RECALLED].includes(record?.get('statusCode')) && {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.edit`,
                      type: 'button',
                      meaning: '我的权限申请列表-编辑',
                    },
                  ]}
                  onClick={() => this.openApplicationDrawer(record)}
                >
                  {getLang('EDIT')}
                </ButtonPermission>
              ),
              key: 'edit',
              len: 2,
              title: getLang('EDIT'),
            },
            record?.get('approvalType') !== WORKFLOW &&
              record?.get('statusCode') === PENDING_REVIEW && {
                ele: (
                  <ButtonPermission
                    type="text"
                    permissionList={[
                      {
                        code: `${path}.button.recall`,
                        type: 'button',
                        meaning: '我的权限申请列表-撤回',
                      },
                    ]}
                    onClick={() => this.handleRecall(record)}
                  >
                    {getLang('RECALL')}
                  </ButtonPermission>
                ),
                key: 'recall',
                len: 2,
                title: getLang('RECALL'),
              },
          ];
          return operatorRender(actions, record, { limit: 4 });
        },
      },
    ];
  }

  get expandedColumns() {
    return [
      !isTenantRoleLevel() && {
        name: 'tenantName',
        width: 120,
      },
      {
        name: 'interfaceCode',
      },
      {
        name: 'interfaceName',
      },
      {
        name: 'serverCode',
      },
      {
        name: 'serverName',
      },
      {
        name: 'namespace',
        width: 120,
      },
      isTenantRoleLevel() && {
        name: 'sourceType',
        width: 90,
        align: 'center',
        renderer: ({ value, text }) => TagRender(value, SOURCE_TYPE_TAG, text),
      },
    ];
  }

  render() {
    const {
      match: { path },
    } = this.props;
    return (
      <>
        <Header title={getLang('HEADER')}>
          <ButtonPermission
            permissionList={[
              {
                code: `${path}.button.permissionApply`,
                type: 'button',
                meaning: '我的接口申请-权限申请',
              },
            ]}
            icon="add"
            type="c7n-pro"
            color="primary"
            onClick={() => this.openApplicationDrawer()}
          >
            {getLang('PERMISSION_APPLY')}
          </ButtonPermission>
        </Header>
        <Content>
          <Table
            mode="tree"
            dataSet={this.tableDS}
            columns={this.myApplicationColumns}
            expandedRowRenderer={this.handleExpandedRowRenderer}
          />
        </Content>
      </>
    );
  }
}
