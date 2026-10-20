/**
 * 字段映射
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2020/7/8
 * @copyright HAND ® 2020
 */
import React from 'react';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { Table, DataSet, Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { operatorRender, TagRender } from 'hzero-front/lib/utils/renderer';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { routerRedux } from 'dva/router';
import { isUndefined, isNumber } from 'lodash';
import { getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import getLang from '@/langs/fieldMappingLang';
import { tableDS as TableDS } from '@/stores/FieldMapping/FieldMappingDS';
import { TRANSFORM_STATUS, FIELD_MAPPING_TAG_STATUS } from '@/constants/constants';
import withProps from 'hzero-front/lib/utils/withProps';
import HistoryModal from './HistoryModal';

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
@withProps(
  () => {
    const tableDS = new DataSet(TableDS());
    return { tableDS };
  },
  { cacheState: true, keepOriginDataSet: false }
)
export default class FieldMapping extends React.Component {
  modal;

  /**
   * 映射转化执行
   */
  @Bind()
  async handleExec(record) {
    record.set('_status', 'update');
    await this.props.tableDS.submit();
    this.handleFetchDetail();
    const confirm = await Modal.confirm({
      children: <p>{getLang('EXEC_CONFIRM')}</p>,
    });
    if (confirm === 'ok') {
      const res = await this.props.tableDS.submit();
      if (getResponse(res)) {
        await this.props.tableDS.query();
      }
    }
  }

  /**
   * 跳转到新建/明细页面
   * @param {*} id
   */
  @Bind()
  handleGotoDetail(id, version, editFlag = true) {
    const { dispatch = () => {} } = this.props;
    // eslint-disable-next-line no-nested-ternary
    const path = isUndefined(id)
      ? '/create'
      : isNumber(version)
      ? `/history/${id}/${version}`
      : `/detail/${id}`;
    dispatch(
      routerRedux.push({
        pathname: `/hitf/field-mapping${path}`,
        state: { editFlag },
      })
    );
  }

  /**
   * 打开历史版本弹窗
   */
  @Bind()
  handleOpenHistoryModal(id) {
    const {
      match: { path },
    } = this.props;
    const modalProps = {
      path,
      transformId: id,
      onGotoDetail: this.handleGotoDetail,
    };
    Modal.open({
      title: getLang('VERSION_HISTORY'),
      closable: true,
      movable: false,
      destroyOnClose: true,
      style: { width: 900 },
      children: <HistoryModal {...modalProps} />,
      footer: null,
    });
  }

  @Bind()
  async handleToggle(record, type) {
    record.set('_requestType', type);
    await this.props.tableDS.submit();
  }

  get fieldMappingColumns() {
    const {
      match: { path },
    } = this.props;
    return [
      !isTenantRoleLevel() && {
        name: 'tenantName',
        width: 150,
      },
      {
        name: 'transformCode',
        // width: 180,
        renderer: ({ value, record }) => (
          <a
            onClick={() =>
              this.handleGotoDetail(record.get('transformId'), undefined, record.get('editFlag'))
            }
          >
            {value}
          </a>
        ),
      },
      {
        name: 'transformName',
        // width: 180,
      },
      {
        name: 'transformType',
        width: 130,
      },
      {
        name: 'versionDesc',
        width: 80,
      },
      {
        name: 'fromVersionDesc',
        width: 100,
      },
      {
        name: 'statusCode',
        width: 100,
        renderer: ({ value, record }) =>
          TagRender(value, FIELD_MAPPING_TAG_STATUS, record.get('statusCodeMeaning')),
      },
      {
        header: getLang('OPERATOR'),
        width: 240,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const actions = [
            record.get('editFlag')
              ? {
                  ele: (
                    <ButtonPermission
                      type="text"
                      permissionList={[
                        {
                          code: `${path}.button.edit`,
                          type: 'button',
                          meaning: '字段映射列表-编辑',
                        },
                      ]}
                      onClick={() =>
                        this.handleGotoDetail(
                          record.get('transformId'),
                          undefined,
                          record.get('editFlag')
                        )
                      }
                    >
                      {getLang('EDIT')}
                    </ButtonPermission>
                  ),
                  key: 'edit',
                  len: 2,
                  title: getLang('EDIT'),
                }
              : {
                  ele: (
                    <ButtonPermission
                      type="text"
                      permissionList={[
                        {
                          code: `${path}.button.view`,
                          type: 'button',
                          meaning: '字段映射列表-查看',
                        },
                      ]}
                      onClick={() =>
                        this.handleGotoDetail(
                          record.get('transformId'),
                          undefined,
                          record.get('editFlag')
                        )
                      }
                    >
                      {getLang('VIEW')}
                    </ButtonPermission>
                  ),
                  key: 'view',
                  len: 2,
                  title: getLang('VIEW'),
                },
            record.get('statusCode') !== TRANSFORM_STATUS.PUBLISHED && {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.release`,
                      type: 'button',
                      meaning: '字段映射列表-发布',
                    },
                  ]}
                  onClick={() => this.handleToggle(record, 'publish')}
                >
                  {getLang('RELEASE')}
                </ButtonPermission>
              ),
              key: 'release',
              len: 2,
              title: getLang('RELEASE'),
            },
            {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.viewHistory`,
                      type: 'button',
                      meaning: '字段映射列表-查看历史版本',
                    },
                  ]}
                  onClick={() => this.handleOpenHistoryModal(record.get('transformId'))}
                >
                  {getLang('VIEW_HISTORY')}
                </ButtonPermission>
              ),
              key: 'viewHistory',
              len: 6,
              title: getLang('VIEW_HISTORY'),
            },
            {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.delete`,
                      type: 'button',
                      meaning: '字段映射列表-删除',
                    },
                  ]}
                  onClick={() => this.props.tableDS.delete(record)}
                >
                  {getLang('DELETE')}
                </ButtonPermission>
              ),
              key: 'delete',
              len: 2,
              title: getLang('DELETE'),
            },
          ];
          return operatorRender(actions, record, { limit: 4 });
        },
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
                code: `${path}.button.create`,
                type: 'button',
                meaning: '字段映射-新建',
              },
            ]}
            icon="add"
            type="c7n-pro"
            color="primary"
            onClick={() => this.handleGotoDetail()}
          >
            {getLang('CREATE')}
          </ButtonPermission>
        </Header>
        <Content>
          <Table dataSet={this.props.tableDS} columns={this.fieldMappingColumns} />
        </Content>
      </>
    );
  }
}
