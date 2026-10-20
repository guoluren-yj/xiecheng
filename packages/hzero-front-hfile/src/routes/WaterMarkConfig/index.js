/*
 * WaterMarkConfig 水印配置
 * @date: 2020-02-13
 * @author: LiLin <lin.li03@hand-china.com>
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { Bind, Debounce } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import { Button as ButtonPermission } from 'components/Permission';
import { Modal, ModalContainer, DataSet, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { isTenantRoleLevel, getResponse } from 'utils/utils';
import { enableTagRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { checkPermission } from 'services/api';
import FilterbarTable from 'srm-front-boot/lib/components/FilterBarTable';

import Drawer from './Drawer';
import {
  queryWaterConfigDetail,
  updateWaterConfigDetail,
} from '../../services/waterMarkConfigService';
import { tableDS, drawerDS } from '../../stores/WaterMarkConfigDS';

const isTenant = isTenantRoleLevel();
const EDIT_PERMISSION_CODE = 'hfile.water-mark-config.edit';
@formatterCollections({ code: ['hfile.waterMark'] })
export default class WaterMarkConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editFlag: false,
    };
    this.tableDs = new DataSet(tableDS());
    this.drawerDs = null;
  }

  componentDidMount() {
    this.queryPermisison();
  }

  @Bind()
  queryPermisison() {
    checkPermission([EDIT_PERMISSION_CODE]).then((res) => {
      if (getResponse(res) && Array.isArray(res) && res[0]) {
        this.setState({
          editFlag: res[0].approve === true,
        });
      }
    });
  }

  get columns() {
    const { editFlag } = this.state;
    return [
      {
        name: 'enabledFlag',
        width: 100,
        align: 'left',
        renderer: ({ value }) => enableTagRender(value),
      },
      !isTenant && {
        header: intl.get('hzero.common.model.common.tenantId').d('租户'),
        name: 'tenantName',
      },
      {
        name: 'watermarkCode',
        renderer: ({ record, value }) => {
          const { data = {} } = record;
          return editFlag ? (
            <Button
              funcType="link"
              onClick={() => {
                this.handleEdit(false, data);
              }}
            >
              {value}
            </Button>
          ) : (
            value
          );
        },
      },
      {
        name: 'description',
      },
      {
        name: 'watermarkTypeMeaning',
        width: 150,
      },
      editFlag && {
        header: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        renderer: ({ record }) => {
          const enabledFlag = record.get('enabledFlag');
          return (
            <Button funcType="link" onClick={() => this.handleEnable(record)}>
              {enabledFlag === 1
                ? intl.get('hzero.common.status.disable').d('禁用')
                : intl.get('hzero.common.status.enable').d('启用')}
            </Button>
          );
        },
      },
    ].filter(Boolean);
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const validate = await this.drawerDs.submit();
    if (!validate) {
      const { current } = this.drawerDs;
      const watermarkType = current.get('watermarkType');
      if ((watermarkType === 'IMAGE' || watermarkType === 'TILE_IMAGE') && !current.get('detail')) {
        notification.warning({
          message: intl
            .get('hfile.waterMark.view.message.alert.contentRequired')
            .d('请上传水印内容'),
        });
      }
      return false;
    }
    await this.tableDs.query();
  }

  @Bind()
  @Debounce(500)
  async handleEnable(record) {
    const watermarkId = record.get('watermarkId');
    const res = await queryWaterConfigDetail(watermarkId);
    if (getResponse(res) && res) {
      const response = await updateWaterConfigDetail({
        ...res,
        enabledFlag: res.enabledFlag === 1 ? 0 : 1,
      });
      if (getResponse(response)) {
        notification.success();
        this.tableDs.query();
      }
    }
  }

  /**
   * 新建/编辑
   * @param { boolean } isCreate
   * @param { object } [record={}]
   */
  @Bind()
  handleEdit(isCreate, record = {}) {
    const { watermarkId } = record;
    this.drawerDs = new DataSet(drawerDS());
    this.drawerDs.create({});
    const drawerProps = {
      isTenant,
      isCreate,
      watermarkId,
      ds: this.drawerDs,
    };
    Modal.open({
      closable: true,
      key: 'water-mark-config',
      title: isCreate
        ? intl.get('hfile.waterMark.view.message.crete').d('新建水印配置')
        : intl.get('hfile.waterMark.view.message.edit').d('编辑水印配置'),
      drawer: true,
      style: {
        width: 742,
      },
      children: <Drawer {...drawerProps} />,
      onOk: this.handleSave,
      okText: intl.get('hzero.common.button.save').d('保存'),
    });
  }

  render() {
    const { match, location } = this.props;
    return (
      <>
        <Header title={intl.get('hfile.waterMark.view.message.waterMarkConfig').d('文件水印配置')}>
          <ButtonPermission
            type="c7n-pro"
            permissionList={[
              {
                code: `${match.path}.button.manage-create`,
                type: 'button',
                meaning: '水印配置-新建',
              },
            ]}
            color="primary"
            icon="add"
            onClick={() => this.handleEdit(true)}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </ButtonPermission>
        </Header>
        <Content>
          <FilterbarTable
            dataSet={this.tableDs}
            columns={this.columns}
            queryFieldsLimit={3}
            customizable
            customizedCode="HFILE.WATER_MARK_CONFIG.TABLE"
          />
          <ModalContainer location={location} />
        </Content>
      </>
    );
  }
}
