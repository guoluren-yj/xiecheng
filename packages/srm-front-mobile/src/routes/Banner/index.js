import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isNil, omit } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Button, DataSet, Table, Modal } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { Icon } from 'hzero-ui';
import { observer } from 'mobx-react';
import { Content, Header } from 'components/Page';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableTagRender } from 'utils/renderer';
import notification from 'utils/notification';

import { buildFileUrl } from '@/utils/utils.js';
import bannerDemo from '@/assets/bannerDemo.png';
import startImage from '@/assets/startImage.png';
import { saveBanner } from '@/services/bannerService';
import './index.less';
import { tableDS } from './stores/BannerDS';
import EditForm from './Form';

const { TabPane } = Tabs;

const TYPE = {
  BANNER: 'BANNER',
  START_IMAGE: 'START_IMAGE',
};

@connect(() => ({
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['smbl.banner', 'smbl.common'] })
@observer
export default class BannerList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      type: 'BANNER',
    };
    this.bannerListDs = new DataSet(tableDS(TYPE.BANNER));
    this.startImageListDs = new DataSet(tableDS(TYPE.START_IMAGE));
  }

  componentDidMount() {
    this.bannerListDs.query();
  }

  @Bind
  openDemo() {
    const { type } = this.state;
    Modal.open({
      autoCenter: true,
      closable: true,
      style: { width: type === TYPE.BANNER ? '600px' : '1000px' },
      bodyStyle: {
        maxHeight: type === TYPE.BANNER ? '400px' : '600px',
        height: type === TYPE.BANNER ? '400px' : '600px',
        padding: 0,
      },
      title:
        type === TYPE.BANNER
          ? intl.get('smbl.banner.view.banner.demo').d('轮播图示例')
          : intl.get('smbl.banner.view.startImage.demo').d('启动图示例'),
      footer: okBtn => okBtn,
      children: (
        <div
          style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          {type === TYPE.BANNER ? (
            <>
              <img height="50%" width="60%" src={bannerDemo} alt="img" />
              <div style={{ width: '50%' }}>
                {intl.get('smbl.banner.view.banner.size').d('推荐尺寸：345*148 或其倍数')}
              </div>
            </>
          ) : (
            <>
              <img height="80%" width="100%" src={startImage} alt="img" />
              <div style={{ width: '65%' }}>
                {intl.get('smbl.banner.view.startImage.demo.tip').d('请将重要的内容放入绿色区域')}
              </div>
            </>
          )}
        </div>
      ),
    });
  }

  @Bind
  async handleDelete() {
    const { type } = this.state;
    const ds = type === TYPE.BANNER ? this.bannerListDs : this.startImageListDs;
    await ds.delete(ds.selected, {
      title: intl.get('smbl.common.message.tip').d('提示'),
      children: intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？	'),
    });
  }

  @Bind
  handleModeChange(type) {
    this.setState({ type });
    if (type === TYPE.BANNER) {
      this.bannerListDs.query();
    } else {
      this.startImageListDs.query();
    }
  }

  @Bind()
  openEditModal({ record, type }) {
    const isCreate = isNil(record);
    let formRecord;
    const dataSet = new DataSet(tableDS(type));
    if (isCreate) {
      formRecord = dataSet.create(
        {
          tenantId: getCurrentOrganizationId(),
          type,
        },
        0
      );
    } else {
      const { picUrl, validDateFrom, validDateTo } = record.get([
        'picUrl',
        'validDateFrom',
        'validDateTo',
      ]);
      formRecord = dataSet.create({
        ...record.toData(),
        picUrl: picUrl ? [picUrl] : undefined,
        validDate: [validDateFrom, validDateTo],
      });
    }
    const help = (
      <>
        <div>
          {type === TYPE.BANNER
            ? intl.get('smbl.banner.view.message.bannerSize').d('图片建议大小 345*148 或其倍数')
            : intl
                .get('smbl.banner.view.message.startImageSize')
                .d('图片建议大小 375*667 或其倍数')}
        </div>
        <div>
          {intl
            .get('smbl.banner.view.message.bannerFormat')
            .d('图片支持PNG、JPG、JPEG格式，且不能大于5M')}
        </div>
      </>
    );
    Modal.open({
      style: { width: '380px' },
      title: !isCreate
        ? intl.get('hzero.common.edit').d('编辑')
        : type === TYPE.BANNER
        ? intl.get('hzero.common.button.createBanner').d('新建轮播图')
        : intl.get('hzero.common.button.createStartImage').d('新建启动图'),
      drawer: true,
      okText: intl.get('hzero.common.save').d('保存'),
      children: <EditForm record={formRecord} help={help} />,
      onOk: () => this.handleSave(formRecord, type),
    });
  }

  handleSave = async (formRecord, type) => {
    const flag = await formRecord.validate();
    if (!flag) {
      if (!formRecord.getField('picUrl').isValid(formRecord)) {
        notification.warning({
          message: intl.get('smbl.banner.view.message.uploadBanner').d('请上传图片'),
        });
      }
      return false;
    }
    const data = omit(formRecord.toData(), ['validDate']);
    const res = await saveBanner([data]);
    if (getResponse(res)) {
      if (type === TYPE.BANNER) {
        this.bannerListDs.query(this.bannerListDs.currentPage);
      } else {
        this.startImageListDs.query(this.startImageListDs.currentPage);
      }
      return true;
    }
    return false;
  };

  handleEnable = async ({ record, dataSet }) => {
    record.set('enableFlag', record.get('enableFlag') === 1 ? 0 : 1);
    await dataSet.submit();
  };

  getColumns = type => {
    return [
      {
        name: 'picUrl',
        renderer: ({ value }) => {
          const picUrl = value && buildFileUrl(value);
          if (!picUrl) {
            return <Icon type="broken_image-o" />;
          }
          return (
            <img
              style={{ maxWidth: '112px', maxHeight: '56px' }}
              alt={
                type === TYPE.BANNER
                  ? intl.get('smbl.banner.view.banner.banner').d('轮播图')
                  : intl.get('smbl.banner.view.banner.startImage').d('启动图')
              }
              src={picUrl}
            />
          );
        },
      },
      {
        header: intl.get('smbl.banner.model.banner.validDate').d('有效期'),
        key: 'effectiveDate',
        renderer: ({ record }) => {
          const { validDateFrom, validDateTo } = record.get(['validDateFrom', 'validDateTo']);
          return (
            <>
              {validDateFrom}
              <span>~</span>
              {validDateTo}
            </>
          );
        },
      },
      {
        name: 'sequence',
        width: 100,
        align: 'right',
      },
      {
        name: 'showTime',
        width: 100,
        align: 'right',
        renderer: ({ value }) => (value ? `${value}s` : '-'),
      },
      {
        name: 'enableFlag',
        width: 200,
        align: 'left',
        renderer: ({ value }) => enableTagRender(value),
      },
      {
        name: 'action',
        header: intl.get('hzero.common.button.action').d('操作'),
        width: 150,
        renderer: ({ record, dataSet }) => {
          return [
            <Button funcType="link" onClick={() => this.openEditModal({ record, type })}>
              {intl.get('hzero.common.edit').d('编辑')}
            </Button>,
            <Button
              funcType="link"
              onClick={() => this.handleEnable({ record, dataSet })}
              style={{ marginLeft: '16px' }}
            >
              {record.get('enableFlag') === 1
                ? intl.get('hzero.common.button.disable').d('禁用')
                : intl.get('hzero.common.button.enable').d('启用')}
            </Button>,
          ];
        },
      },
    ];
  };

  render() {
    const { type } = this.state;
    return (
      <>
        <Header title={intl.get('smbl.banner.view.banner.title').d('Banner管理')}>
          <Button icon="add" color="primary" onClick={() => this.openEditModal({ type })}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="panorama-o" funcType="flat" onClick={this.openDemo}>
            {type === TYPE.BANNER
              ? intl.get('smbl.banner.view.banner.demo').d('轮播图示例')
              : intl.get('smbl.banner.view.startImage.demo').d('启动图示例')}
          </Button>
          <Button
            icon="delete_sweep"
            funcType="flat"
            onClick={this.handleDelete}
            disabled={
              type === TYPE.BANNER
                ? this.bannerListDs.selected.length === 0
                : this.startImageListDs.selected.length === 0
            }
          >
            {intl.get('hzero.common.button.enter').d('删除')}
          </Button>
        </Header>
        <Content>
          <Tabs activeKey={type} flex onChange={this.handleModeChange}>
            <TabPane key={TYPE.BANNER} tab={intl.get('smbl.banner.view.banner.banner').d('轮播图')}>
              <Table
                dataSet={this.bannerListDs}
                columns={this.getColumns(TYPE.BANNER)}
                rowHeight={56}
              />
            </TabPane>
            <TabPane
              key={TYPE.START_IMAGE}
              tab={intl.get('smbl.banner.view.banner.startImage').d('启动图')}
            >
              <Table
                dataSet={this.startImageListDs}
                columns={this.getColumns(TYPE.START_IMAGE)}
                rowHeight={56}
              />
            </TabPane>
          </Tabs>
        </Content>
      </>
    );
  }
}
