/**
 * index.js 反馈单模板定义
 * @date: 2020-09-06
 * @author: fujie <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Fragment, Component } from 'react';
import { DataSet, Button, Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Bind, Throttle } from 'lodash-decorators';
// import { SRM_SIEC } from '_utils/config';
// import { observer } from 'mobx-react-lite';
// import { isEmpty } from 'lodash';
// import uuid from 'uuid/v4';
import qs from 'querystring';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
// import { downloadFileByAxios, downloadFile } from '_services/MarmotDownloadButtonServices';
import { getResponse, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import { yesOrNoRender, enableRender } from 'utils/renderer';

import { saveFeedbackField, getExportFileUrl } from '@/services/feedbackTemplateService.js';

import {
  lineDS,
  basicDrawerLovMapDS,
  basicDrawerLovParamDS,
  basicDrawerFormDS,
  mapDS,
  specialDS,
} from './store/lineDS';
import Drawer from './Drawer';

// const { Column } = Table;
// const { TabPane } = Tabs;

@formatterCollections({
  code: ['ssrc.priceLibDimension', 'sodr.feedback', 'hzero.common', 'sodr.common'],
})
export default class FeedbackTemplate extends Component {
  constructor(props) {
    super(props);
    const {
      match: { params = {} },
      location: { search },
    } = this.props;
    const pathSearch = qs.parse(search.substr(1));
    const { splitFlag } = pathSearch;
    this.state = {
      templateId: params.id,
      splitFlag: Number(splitFlag),
      drawerVisible: false,
    };
  }

  editAble = !(
    qs.parse(this.props.location.search.substr(1)).templateType === 'PREDEFINED' &&
    isTenantRoleLevel()
  );

  lineDs = new DataSet(lineDS());

  basicDrawerFormDs = new DataSet(basicDrawerFormDS(this.editAble));

  basicDrawerLovParamDs = new DataSet(basicDrawerLovParamDS(this.editAble));

  basicDrawerLovMapDs = new DataSet(basicDrawerLovMapDS(this.editAble));

  mapDs = new DataSet(mapDS());

  specialDs = new DataSet(specialDS(this.editAble));

  componentDidMount() {
    const { templateId } = this.state;
    this.lineDs.setQueryParameter('templateId', templateId);
    this.lineDs.query();
    this.basicDrawerLovParamDs.setQueryParameter('templateId', templateId);
    this.basicDrawerLovMapDs.setQueryParameter('templateId', templateId);
  }

  @Bind()
  handleCreate() {
    this.setState({
      drawerVisible: true,
      editor: true,
    });
    this.basicDrawerFormDs.loadData([]);
    // this.basicDrawerFormDs.create({});
  }

  @Bind()
  handleEdit(record) {
    const data = record.toData();
    const { templateId, fieldId, componentType } = data;
    this.basicDrawerFormDs.loadData([data]);
    this.mapDs.setQueryParameter('params', { templateId, fieldId });
    this.specialDs.setQueryParameter('params', { templateId, fieldId });
    this.mapDs.query();
    this.specialDs.query();
    if (data.componentType === 'LOV') {
      this.basicDrawerLovMapDs.setQueryParameter('fieldId', data.fieldId);
      this.basicDrawerLovMapDs.query();
      this.basicDrawerLovParamDs.setQueryParameter('fieldId', data.fieldId);
      this.basicDrawerLovParamDs.query();
      this.basicDrawerLovMapDs
        .getField('paramValueLOV')
        .set('lovCode', data.valueSet && 'HPFM.CUST.RELATE.FIELD.LIST');
      this.basicDrawerLovMapDs
        .getField('paramValueLOV')
        .set('lovPara', { viewCode: data.valueSet, tenantId: getCurrentOrganizationId() });
    } else if (data.componentType === 'SELECT') {
      this.basicDrawerLovParamDs.setQueryParameter('fieldId', data.fieldId);
      this.basicDrawerLovParamDs.query();
    }

    this.setState({
      drawerVisible: true,
      editor: false,
    });
    // 设置组件类型的值
    this.drawerRef.setState({
      componentType,
    });
  }

  @Bind()
  getColumns() {
    // const { editAble } = this.state;
    const columns = [
      {
        name: 'fieldType',
        width: 100,
        renderer: ({ record }) =>
          record.toData().fieldType === 'CUSTOMIZE' ? (
            <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
          ) : record.toData().fieldType === 'PREDEFINED' ? (
            <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
          ) : (
            <Tag color="blue">{intl.get('hzero.common.copy').d('复制')}</Tag>
          ),
      },
      {
        name: 'fieldCode',
        width: 120,
      },
      {
        name: 'fieldName',
        width: 140,
      },
      {
        name: 'displayFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'requiredFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'editorFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'splitDisplayFlag',
        width: 140,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'splitEditorFlag',
        width: 140,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'searchFlag',
        width: 140,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      // {
      //   name: 'componentFlag',
      //   width: 120,
      // },
      {
        name: 'fieldLocation',
        width: 90,
      },
      {
        name: 'fieldWidth',
        width: 100,
      },
      {
        name: 'componentTypeName',
      },
      {
        name: 'valueSet',
        width: 240,
      },
      // {
      //   name: 'customVerify',
      //   width: 120,
      // },
      {
        name: 'enabledFlag',
        width: 100,
        renderer: ({ value }) => enableRender(value),
      },
      {
        name: 'action',
        lock: 'right',
        renderer: ({ record }) => (
          <a onClick={() => this.handleEdit(record)}>
            {!this.editAble
              ? intl.get(`hzero.common.button.view`).d('查看')
              : intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];
    return columns;
  }

  @Bind()
  onCancel() {
    this.setState({
      drawerVisible: false,
      editor: false,
    });
    this.drawerRef.setState({
      activityTabKey: 'map',
    });
    // this.basicDrawerFormDs.reset();
    this.mapDs.loadData([]);
    this.specialDs.loadData([]);
    this.basicDrawerLovParamDs.loadData([]);
    this.basicDrawerLovMapDs.loadData([]);
  }

  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  async onDrawerOk() {
    const { templateId } = this.state;
    const arr = [];
    const baseValidateFlag = await this.basicDrawerFormDs.validate();
    const mapFlag = await this.mapDs.validate();
    const specialFlag = await this.specialDs.validate();
    const lovParamFlag = await this.basicDrawerLovParamDs.validate();
    const lovMapFlag = await this.basicDrawerLovMapDs.validate();
    this.mapDs.toData().forEach((i) => arr.push(`${i.sourceFrom}${i.sourceField}`));
    const newArr = Array.from(new Set(arr));
    if (!this.editAble) {
      this.onCancel();
    } else if (baseValidateFlag && mapFlag && specialFlag && lovParamFlag && lovMapFlag) {
      if (arr.length !== newArr.length) {
        notification.warning({
          message: intl.get(`sodr.feedback.model.feedback.saveMesg`).d('字段来源不唯一'),
        });
        return;
      }
      const data = this.basicDrawerFormDs.toData()[0];
      const params = {
        ...data,
        templateId,
        feedbackMappingList: this.mapDs.toData(),
        feedbackSpecialList: this.specialDs.toData(),
        feedbackTemplateFieldLovParamList:
          data.componentType === 'LOV' || data.componentType === 'SELECT'
            ? this.basicDrawerLovParamDs.toData()
            : [],
        feedbackTemplateFieldLovMapList:
          data.componentType === 'LOV' ? this.basicDrawerLovMapDs.toData() : [],
      };
      const saveRes = getResponse(await saveFeedbackField(params));
      if (saveRes) {
        notification.success();
        this.onCancel();
        this.lineDs.query();
      }
    }
  }

  /* 通过url下载文件
   * @param {string} url - download url
   * @param {string} fileName - download fileName
   */
  downloadFile(url, async) {
    if (async === 'true') {
      setTimeout(() => {
        notification.success({
          message: intl
            .get('sodr.common.message.operation.asyncExportSuccess')
            .d('操作成功, 请至文件汇总页面查看'),
        });
      }, 1000);
    } else {
      const a = document.createElement('a');
      if (url) {
        a.href = url;
        a.click();
      } else {
        notification.success({
          message: intl.get('sodr.common.message.query.temporarilyNoData').d('暂无数据'),
        });
      }
    }
  }

  @Bind()
  async handleExport() {
    const { templateId } = this.state;
    const res = await getExportFileUrl({ templateId });
    if (getResponse(res) && res.feedBackExportUrl) {
      this.downloadFile(res.feedBackExportUrl);
    }
  }

  @Bind()
  handleImport() {
    const { templateId } = this.state;
    const {
      location: { search },
    } = this.props;
    const option = {
      pathname: `/sodr/feedback-template/data-import/FEEDBACK_FIELD_FORM_TEMPLATE`,
      search: qs.stringify({
        action: intl.get(`hzero.common.viewtitle.batchImport`).d('批量导入'),
        backPath: `/sodr/feedback-template/detail/${templateId}${search}`,
        args: JSON.stringify({
          templateId,
        }),
      }),
    };
    this.props.history.push(option);
  }

  render() {
    const { splitFlag, drawerVisible, editor } = this.state;
    const drawerProps = {
      splitFlag,
      editAble: this.editAble,
      editor,
      visible: drawerVisible,
      basicDrawerFormDs: this.basicDrawerFormDs,
      basicDrawerLovParamDs: this.basicDrawerLovParamDs,
      basicDrawerLovMapDs: this.basicDrawerLovMapDs,
      mapDs: this.mapDs,
      specialDs: this.specialDs,
      onCancel: this.onCancel,
      onOk: this.onDrawerOk,
      onRef: (ref) => {
        this.drawerRef = ref;
      },
    };
    return (
      <Fragment>
        <Header
          title={intl.get('sodr.feedback.view.title.feedback.field').d('反馈单字段定义')}
          backPath={
            isTenantRoleLevel()
              ? '/sodr/feedback-template/list'
              : '/sodr/feedback-template-platform/list'
          }
        >
          {this.editAble && (
            <Button icon="add" funcType="raised" color="primary" onClick={this.handleCreate}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          )}
          <Button icon="export" onClick={this.handleExport}>
            {intl.get('sodr.common.view.message.button.fieldConfigExport').d('导出字段配置')}
          </Button>
          <Button onClick={this.handleImport} type="c7n-pro" icon="archive">
            {intl.get('sodr.common.view.message.button.fieldConfigImport').d('导入字段配置')}
          </Button>
        </Header>
        <Content>
          <Table
            dataSet={this.lineDs}
            columns={this.getColumns()}
            queryFieldsLimit={2}
            buttons={[<div key="advanced-query-slot" />]}
          />
        </Content>
        <Drawer {...drawerProps} />
      </Fragment>
    );
  }
}
