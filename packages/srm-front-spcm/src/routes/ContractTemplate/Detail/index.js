import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Button, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, differenceBy } from 'lodash';
import uuidv4 from 'uuid/v4';
import { stringify } from 'querystring';

import EditTable from 'components/EditTable';
import Switch from 'components/Switch';
import { Header, Content } from 'components/Page';
import { getEditTableData } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import FlexLinkModal from '@/routes/components/FlexLinkModal';

import Upload from '../../components/Upload';

const FormItem = Form.Item;

@connect(({ loading = {}, contractTemplate = {} }) => ({
  loading: loading.effects['contractTemplate/fetchTemplateConfig'],
  saving: loading.effects['contractTemplate/saveTemplateConfig'],
  updateContractTemplateUrlLoading: loading.effects['contractCommon/updateContractTemplateUrl'],
  deleting: loading.effects['contractTemplate/deleteTemplateConfig'],
  contractTemplate,
}))
@formatterCollections({
  code: ['entity.lang', 'spcm.contractTemplate', 'entity.company', 'spcm.common', 'hzero.common'],
})
export default class TemplateConfigModal extends Component {
  constructor(props) {
    const isPub = props.location.pathname.includes('/pub'); // 判断是否为pub页面
    super(props);
    const {
      match: {
        params: { pcTemplateId },
        state = {},
      },
      onLoad,
    } = this.props;
    this.state = {
      isPub,
      onLoad: onLoad || state?.onLoad,
      pcTemplateId,
      selectedRowKeys: [],
      selectedRows: [],
      rowKey: 'pcTemplateFileId',
      dataListName: 'templateConfigList',
    };
  }

  componentDidMount() {
    this.handleFetchTemplateConfig();
    this.fetchEnum();
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractTemplate/init',
    });
  }

  @Bind()
  handleFetchTemplateConfig() {
    const { dispatch } = this.props;
    const { pcTemplateId } = this.state;
    dispatch({
      type: 'contractTemplate/fetchTemplateConfig',
      payload: { pcTemplateId },
    });
  }

  @Bind()
  handleChangeSelection(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  /**
   * 更新附件
   * @param {*} params
   */
  @Bind()
  handleUpdateAttachment(params) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractCommon/updateContractTemplateUrl',
      payload: params,
    });
  }

  /**
   * upTemplate - 上传文件render方法
   * @param {object} record - 行数据
   */
  @Bind()
  upTemplate(_, record) {
    const { isPub } = this.state;
    const {
      contractTemplate: { templateStatus, templateEditable },
    } = this.props;
    const isEditable =
      !isPub &&
      templateEditable &&
      ['PENDING', 'BEEN_UPDATED', 'REJECTED'].includes(templateStatus);

    const attachmentProps = {
      width: 610,
      btnProps: {
        isBtn: false,
        btnText: intl.get(`spcm.contractTemplate.model.templateFileUrl`).d('模板文件'),
      },
      accept: '.docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // fileType: '.docx',
      bucketName: PRIVATE_BUCKET,
      contractTypeFlag: true,
      headerInfo: record,
      onUpdateHeader: this.handleUpdateAttachment,
      onRefresh: this.handleFetchTemplateConfig,
      showRemoveIcon: isEditable,
      showAddTemplateIcon: isEditable,
      templateFileUrlFlag: true,
    };
    return record._status !== 'create' && <Upload {...attachmentProps} />;
  }

  @Bind()
  handleAddRow() {
    const { dispatch, contractTemplate = {} } = this.props;
    const { rowKey, dataListName, pcTemplateId } = this.state;
    dispatch({
      type: 'contractTemplate/updateState',
      payload: {
        [dataListName]: [
          {
            [rowKey]: uuidv4(),
            pcTemplateId,
            templateFileUrl: 'NULL_TEMPLATE',
            _status: 'create', // 新建标记位
          },
          ...contractTemplate[dataListName],
        ],
      },
    });
  }

  @Bind()
  handleDeleteRow() {
    const { dispatch, contractTemplate = {} } = this.props;
    const { selectedRows, rowKey, dataListName } = this.state;
    const hasSavedData = selectedRows.filter((s) => s._status !== 'create');
    const localData = selectedRows.filter((s) => s._status === 'create');
    if (!isEmpty(hasSavedData)) {
      dispatch({
        type: 'contractTemplate/deleteTemplateConfig',
        payload: hasSavedData,
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleFetchTemplateConfig();
        }
      });
    }

    dispatch({
      type: 'contractTemplate/updateState',
      payload: {
        [dataListName]: differenceBy(contractTemplate[dataListName], localData, rowKey),
      },
    });
    this.setState({ selectedRowKeys: [], selectedRows: [] });
  }

  @Bind()
  handleSave() {
    const {
      dispatch,
      contractTemplate: { templateConfigList = [] },
    } = this.props;
    const dataList = getEditTableData(templateConfigList, ['pcTemplateFileId']);
    if (!isEmpty(dataList)) {
      dispatch({
        type: 'contractTemplate/saveTemplateConfig',
        payload: dataList,
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleFetchTemplateConfig();
        }
      });
    }
  }

  @Bind()
  redirectDetail(record) {
    const { isPub } = this.state;
    const { pcTemplateId, pcTemplateFileId, templateStatus, lang } = record;
    const editable = ['PENDING', 'BEEN_UPDATED', 'REJECTED'].includes(templateStatus);
    this.props.history.push({
      pathname: isPub ? `/pub/spcm/contract-template/detail` : `/spcm/contract-template/detail`,
      search: pcTemplateId
        ? stringify({ pcTemplateId, pcTemplateFileId, editable, lang })
        : stringify({}),
    });
  }

  getBackPath = () => {
    const { isPub, pcTemplateId, onLoad } = this.state;
    if (onLoad) {
      return null;
    }
    return isPub
      ? `/pub/spcm/contract-template/list/${pcTemplateId}`
      : '/spcm/contract-template/list';
  };

  linkElement = (record = {}) => {
    const { onLoad } = this.state;
    if (onLoad) {
      const path = `/spcm/contract-template/detail`;
      const { pcTemplateId, pcTemplateFileId, templateStatus } = record;
      const editable = ['PENDING', 'BEEN_UPDATED', 'REJECTED'].includes(templateStatus);
      const search = stringify({ pcTemplateId, pcTemplateFileId, editable });
      const _location = {
        hash: '',
        pathname: path,
        search: `?${search}`,
      };
      const flexLinkProps = {
        path,
        type: 'c7n',
        text: intl.get(`spcm.common.editorPreview`).d('模版明细'),
        location: _location,
        match: {
          path,
          state: { onLoad },
        },
        history: {
          ...window.dvaApp._history,
          location: _location,
        },
        modalProps: {
          closable: false,
          footer: (okBtn, cancelBtn) => cancelBtn,
          cancelText: intl.get('hzero.common.btn.close').d('关闭'),
          cancelProps: {
            color: 'primary',
          },
        },
      };
      return <FlexLinkModal {...flexLinkProps} />;
    } else {
      return (
        <a onClick={() => this.redirectDetail(record)}>
          {intl.get(`spcm.common.editorPreview`).d('模版明细')}
        </a>
      );
    }
  };

  render() {
    const {
      loading,
      saving,
      deleting,
      updateContractTemplateUrlLoading,
      contractTemplate: {
        templateConfigList = [],
        enumMap: { langList = [] },
        templateStatus,
        templateEditable,
      },
    } = this.props;
    const { rowKey, isPub } = this.state;
    const { selectedRowKeys } = this.state;
    // 是否可以操作按钮
    const operatenable =
      !isPub &&
      templateEditable &&
      ['PENDING', 'BEEN_UPDATED', 'REJECTED'].includes(templateStatus);

    const columns = [
      {
        title: intl.get('entity.lang.tag').d('语言'),
        // width: 200,
        dataIndex: 'lang',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('lang', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.lang.tag').d('语言'),
                    }),
                  },
                ],
              })(
                <Select allowClear style={{ width: 200 }} disabled={record._status !== 'create'}>
                  {langList.map((n) => (
                    <Select.Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`spcm.contractTemplate.model.templateFileUrl`).d('模板文件'),
        dataIndex: 'templateFileUrl',
        width: 200,
        render: this.upTemplate,
      },
      {
        title: intl.get('entity.company.enabledFlag').d('启用'),
        width: 200,
        dataIndex: 'enabledFlag',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) && operatenable ? (
            <FormItem>
              {record.$form.getFieldDecorator('enabledFlag', {
                initialValue: val === 0 ? 0 : val || 1,
              })(<Switch />)}
            </FormItem>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get(`spcm.common.editorPreview`).d('模版明细'),
        dataIndex: 'editorPreview',
        width: 200,
        render: (_, record) =>
          record.templateFileUrl &&
          record.templateFileUrl !== 'NULL_TEMPLATE' &&
          this.linkElement(record),
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleChangeSelection,
      getCheckboxProps: () => ({
        disabled: !operatenable,
      }),
    };
    return (
      <React.Fragment>
        <Header
          backPath={this.getBackPath()}
          title={intl.get('spcm.contractTemplate.model.templateConfig').d('模板配置')}
        >
          {operatenable && (
            <Fragment>
              <Button type="primary" onClick={this.handleAddRow}>
                {intl.get(`hzero.common.button.create`).d('新建')}
              </Button>
              <Button
                loading={saving || updateContractTemplateUrlLoading}
                onClick={this.handleSave}
              >
                {intl.get(`hzero.common.button.save`).d('保存')}
              </Button>
              <Button
                loading={deleting || updateContractTemplateUrlLoading}
                disabled={isEmpty(selectedRowKeys)}
                onClick={this.handleDeleteRow}
              >
                {intl.get(`hzero.common.button.delete`).d('删除')}
              </Button>
            </Fragment>
          )}
        </Header>
        <Content>
          <EditTable
            bordered
            rowKey={rowKey}
            loading={loading}
            columns={columns}
            dataSource={templateConfigList}
            rowSelection={rowSelection}
            pagination={false}
          />
        </Content>
      </React.Fragment>
    );
  }
}
