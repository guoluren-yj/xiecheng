/**
 * ProgressDefinition/index.js
 * 处理进度定义/跳转明细链接页面
 * @date: 2021-08-30
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import React from 'react';
import intl from 'utils/intl';
import { Table, Button, Modal, DataSet, Output, CheckBox, Form, Spin } from 'choerodon-ui/pro';
import { getResponse, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';
import { SRM_DATA_PROCESS } from '_utils/config';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import { CODE } from 'utils/regExp';
import { yesOrNoRender } from 'hzero-front/lib/utils/renderer.js';
import {
  referenceSrmProcessData,
  referenceSrmProcessDataLink,
  deleteJumpDetailLinkParams,
} from '@/services/docFlowDefinitionNodesService';
import ConditionModal from '../conditionModal/index.js';
import { onLineDetailChange } from '../../utils';
import './index.less';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();
const requestUrlPre = tenantFlag
  ? `${SRM_DATA_PROCESS}/v1/${organizationId}`
  : `${SRM_DATA_PROCESS}/v1`;
export default class ProgressDefinition extends React.Component {
  constructor(props) {
    super(props);
    this.currentComponentDs = this.props.currentComponentDs;
    this.currentComponentKey = this.props.currentComponentKey;
    if (this.props.currentComponentKey === 'jumpDetailLink') {
      const { onRef = (e) => e } = props;
      onRef(this);
    }
    this.state = {
      modalLoading: false,
    }
  }

  formDs = new DataSet({
    autoCreate: true,
    autoQuery: false,
    fields: [
      {
        name: 'code',
        type: 'string',
        label: intl.get('spfm.progressDefinition.modal.node.code').d('节点code'),
      },
      {
        name: 'name',
        type: 'string',
        label: intl.get('spfm.progressDefinition.model.view.name').d('节点描述'),
      },
      {
        name: 'linkCheckFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
        label: intl.get('spfm.statusPhaseMapping.modal.view.linkCheckFlag').d('校验权限'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { nodeId } = data;
        return {
          url: `${requestUrlPre}/node-definitions/${nodeId}`,
          method: 'GET',
        };
      },
    },
  });

  componentDidMount() {
    const { nodeId } = this.props.data;
    this.formDs.setQueryParameter('nodeId', nodeId);
    this.formDs.setQueryParameter('tenantId', organizationId);
    this.formDs.query();
  }

  addRecord = () => {
    const record = this.currentComponentDs.create({editorFlag: true, nodeDefinitionCode: this.props.code}, 0);
    record.setState('editing', true);
  };

  editRecord = (record) => {
    record.setState('editing', true);
  };

  cancelRecord = (record) => {
    if (record.status === 'add') {
      this.currentComponentDs.remove(record);
    } else {
      record.reset();
      record.setState('editing', false);
    }
  };

  referenceData = (props) => {
    const data = {
      nodeDefinitionCode: props.data.currentCode,
    };
    const importSer =
      this.currentComponentKey === 'progressDefinition'
        ? referenceSrmProcessData
        : referenceSrmProcessDataLink;
    importSer(data).then((res) => {
      if (getResponse(res)) {
        notification.success();
        this.currentComponentDs.query();
        this.formDs.query();
      }
    });
  };

  paramsDs = new DataSet({
    autoQuery: false,
    paging: false,
    primaryKey: "id",
    fields: [
      {
        name: 'field',
        type: 'object',
        lovCode: 'SDPS.DOCF.FIELD_DEFINITION',
        lovPara: { tenantId: organizationId, nodeDefCode: this.props.data.currentCode },
        label: intl.get('spfm.statusPhaseMapping.modal.view.fieldValue').d('字段值'),
        required: true,
        ignore: 'always',
      },
      {
        name: 'fieldId',
        type: 'string',
        bind: 'field.fieldId',
      },
      {
        name: 'fieldName',
        type: 'string',
        label: intl.get('spfm.statusPhaseMapping.modal.view.fieldValue').d('字段值'),
        bind: 'field.fieldName',
      },
      {
        name: 'fieldSequence',
        type: 'number',
        label: intl.get('spfm.docFlowDefinitionCoding.model.field.order').d('字段顺序'),
        placeholder: intl.get('hzero.common.validation.requireNumber').d('请输入数字'),
        required: true,
      },
      {
        name: 'fieldAlias',
        type: 'string',
        pattern: CODE,
        defaultValidationMessages: {
          patternMismatch: intl
            .get('hzero.common.validation.code')
            .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
        },
        label: intl.get('hpfm.individuationUnit.model.individuationUnit.fieldAlias').d('字段别名'),
      },
      {
        name: 'operation',
        label: intl.get('hzero.common.view.sstaHandle').d('操作'),
      },
    ],
    transport: {
      submit: ({ data = {} }) => {
        const id = this.paramsDs.getState('currentRowId');
        return {
          url: `${requestUrlPre}/node-link-field-configs`,
          method: 'POST',
          data: data.map((e) => {
            return {
              ...e,
              linkId: id,
              tenantId: organizationId,
              nodeDefinitionCode: this?.props?.data?.currentCode,
            };
          }),
        };
      },
      destroy: () => {
        return {
          url: `${requestUrlPre}/node-link-field-configs`,
          method: 'DELETE',
        };
      },
    },
  });



 onModalDetailChange = ({ dataSet }) => {
    const lineList = dataSet?.selected?.map((item) => item?.toJSONData());
    const deleteFlag = lineList.every((i) => i?.editorFlag);
    const data = lineList?.filter((item) => !item?.editorFlag);
    console.log(deleteFlag, 'deleteFlag');
    console.log(data, 'data');
    if (!deleteFlag) {
      Modal.confirm({
        contentStyle: { width: '550px' },
        title: intl.get('hzero.common.message.confirm').d('提示'),
        children: (
          <div>
            <span>
              {intl.get('hzero.c7nProUI.DataSet.delete_selected_row_confirm').d('确认删除选中行？')}
            </span>
          </div>
        ),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        // onOk: () => {
        //   console.log('111111111111');
        //   console.log('dataSet', dataSet);

        //   dataSet.destroy();
        // },
      });
    } else {
      dataSet.remove(dataSet?.selected);
    }
};


  handleParams = (currentRecord) => {
    const { editors } = this.props;
    const {modalLoading} = this.state;
    this.paramsDs.setState('currentRowId', currentRecord.get('id'));
    const paramsColums = [
      {
        name: 'field',
        width: 200,
        editor: editors,
      },
      {
        name: 'fieldSequence',
        width: 100,
        align: 'left',
        editor: editors,
      },
      {
        name: 'fieldAlias',
        width: 100,
        align: 'left',
        editor: editors,
      },
    ];
    const modalBtns = () => {
      const Buttons = observer(({ dataSet, loading }) => {
        const btns = [
          {
            name: 'add',
            btnType: 'c7n-pro',
            child: (name) => name || intl.get('hzero.common.button.create').d('新建'),
            btnProps: {
              loading,
              funcType: 'flat',
              color: 'primary',
              icon: 'playlist_add',
              onClick: () => {
                const record = this.paramsDs.create({editorFlag: true}, 0);
                record.setState('editing', true);
              }
            },
          },
          {
            name: 'delete',
            btnType: 'c7n-pro',
            child: (name) => name || intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
            btnProps: {
              funcType: 'flat',
              color: 'primary',
              icon: 'delete_sweep',
              loading,
              wait: 1000,
              onClick: () => onDeletesChange(dataSet),
              disabled: isEmpty(dataSet?.selected),
            },
          },
        ];
        return <DynamicButtons buttons={btns?.filter((i) => !i.hidden)} />;
      });
      return [<Buttons dataSet={this.paramsDs} loading={modalLoading} />];
    };
    const onDeletesChange = (dataSet) => { 
      const list = dataSet.selected.map((i) => i.toData());
      const data = list?.filter((i) => !i?.editorFlag);
      const flag = list?.some(i => i.id);
      console.log(list, 'list');
      console.log(flag, 'flag');
      if (!flag) {
        dataSet?.remove(dataSet?.selected);
        return;
      } else {
        try {
          Modal.confirm({
            title: intl.get('hzero.common.message.confirm').d('提示'),
            children: (
              <span>
                {intl.get('sdps.docFlowDefinition.view.message.deleteConfirm').d('确认删除选择行？')}
              </span>
            ),
            onOk: async () => {
              try {
                this.setState({modalLoading:true});
                const res = await deleteJumpDetailLinkParams(data);
                console.log(res, "res");
                // if (res && !res.failed) {
                  if (getResponse(res)) {
                  dataSet?.remove(dataSet?.selected, true);
                  dataSet?.query();
                };
              }finally{
                this.setState({modalLoading:false});
              }
            },
          })
        } finally {
          this.setState({modalLoading:false});
        }
      }
    };
    const saveData = async () => {
      const validateFlag = await this.paramsDs.validate();
      if (validateFlag) {
        try { 
          currentRecord.set({ linkFieldConfigList: this.paramsDs.toData() });
        this.paramsDs.submit().then(() => {
          this.formDs.query();
          this.currentComponentDs.query();
        });
        } finally {
          return true
         }
      } else {
        return false;
      }
    };
    this.paramsDs.loadData(
      currentRecord
        ?.get('linkFieldConfigList')
        ?.map((e) => ({ ...e, linkId: currentRecord?.get('id') }))
    );
    Modal.open({
      title: intl.get('spfm.statusPhaseMapping.modal.view.paramsDefine').d('参数定义'),
      border: false,
      children: <div style={{ height: 'calc(100vh - 190px)' }}>
        <Spin spinning={modalLoading}>
          <Table
            customizable
            boxSizing='wrapper'
            dataSet={this.paramsDs}
            columns={paramsColums}
            buttons={editors && modalBtns()}
            customizedCode="new-workbench"
            style={{ maxHeight: `calc(100% - 10px)` }}
            selectionMode={editors ? 'rowbox' : 'none'}
          />
        </Spin>
      </div>,
      style: { width: 742 },
      drawer: true,
      destroyOnClose: true,
      closable: true,
      okCancel: editors,
      okText: !editors ? intl.get('hzero.common.btn.close').d('关闭')
       : intl.get('hzero.common.button.ok').d('确定'),
      onOk: saveData,
      // footer: (okBtn, cancelBtn) => (
      //   <div>
      //     {okBtn}
      //     {cancelBtn}
      //   </div>
      // ),
    });
  };

  buttons = () => {
    const urls = this.currentComponentKey === 'progressDefinition' ? 'node-progress-defs' : 'node-links';
    const Buttons = observer(({ dataSet }) => {
      const btns = [
        {
          name: 'add',
          btnType: 'c7n-pro',
          child: (name) => name || intl.get('hzero.common.button.create').d('新建'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'playlist_add',
            onClick: this.addRecord,
          },
        },
        {
          name: 'delete',
          btnType: 'c7n-pro',
          child: (name) => name || intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'delete_sweep',
            onClick: () => onLineDetailChange({
              dataSet,
              url: urls,
            }),
            disabled: isEmpty(dataSet?.selected),
          },
        },
        {
          name: 'reference',
          btnType: 'c7n-pro',
          hidden: !tenantFlag,
          child: (name) =>
            name || intl.get('spfm.overviewOfNodes.model.view.reference').d('引用平台预定义字段'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'filter_none',
            onClick: () => this.referenceData(this.props),
          },
        },
      ];
      return <DynamicButtons buttons={btns?.filter((i) => !i.hidden)} />;
    });
    return [<Buttons dataSet={this.currentComponentDs} />];
  };


  render() {
    const { editors } = this.props;
    const progressColumns = [
      {
        name: 'operateField',
        width: 250,
        // editor: (record) => record.getState('editing'),
        editor: editors,
      },
      {
        name: 'field',
        // editor: (record) => record.getState('editing'),
        editor: editors,
      },
      {
        name: 'operation',
        width: 250,
        lock: 'right',
        renderer: ({ record }) => (
          <>
           <Button  funcType="link" color="primary" onClick={() => this.props.changeShowTab(record, editors)}>
                  {intl.get('spfm.statusPhaseMapping.modal.setting.stateMapping').d('状态映射设置')}
            </Button>
          </>
        ),
      },
    ];

    const jumpColumns = [
      {
        name: 'link',
        // editor: (record) => record.getState('editing'),
        editor: editors,
      },
      {
        name: 'linkTitle',
        // editor: (record) => record.getState('editing'),
        editor: editors,
      },
      {
        name: 'paramsDefine',
        type: 'object',
        renderer: ({ record }) => (
          <>
            <Button funcType="link" color="primary" onClick={() => this.handleParams(record)} disabled={!record?.get('id')}>
              {intl.get('spfm.statusPhaseMapping.modal.view.paramsDefine').d('参数定义')}
            </Button>
          </>
        ),
      },
      {
        name: 'priority',
        // editor: (record) => record.getState('editing') && <NumberField />,
        editor: editors,
      },
      {
        name: 'enabledParams',
        renderer: ({ record }) => (
          <ConditionModal
            editors={editors}
            dataSet={this.currentComponentDs}
            record={record}
            name="enabledParams"
            nodeDefCode={this?.props?.data?.currentCode}
            disabled={!record?.get('id')}
          />
        ),
      },
    ];

    // 用于存放当前组件的对应key值的columns
    const currentColumns = this.currentComponentKey === 'progressDefinition' ? progressColumns : jumpColumns;
    const hepx = this.currentComponentKey === 'progressDefinition' ? 195 : 225;
    const edpx = this.currentComponentKey === 'progressDefinition' ? 190 : 240;
    return (
      <>
        {this.currentComponentKey !== 'progressDefinition' &&
          <div className={!editors&&'form_content'}>
          <Form labelLayout={editors? 'float': "vertical"} dataSet={this.formDs} columns={3}>
            {editors && <CheckBox name="linkCheckFlag" />}
            {!editors && <Output name="linkCheckFlag" renderer={({value})=>yesOrNoRender(+value)} />}
          </Form>
        </div>
        }
        <div style={{marginTop: this.currentComponentKey !== 'progressDefinition' ? "16px" : "0px", height: editors ?`calc(100vh - ${hepx}px)` : `calc(100vh - ${edpx}px)`}}>
          <Table
            customizable
            buttons={editors && this.buttons()}
            boxSizing='wrapper'
            columns={currentColumns}
            customizedCode="new-workbench"
            dataSet={this.currentComponentDs}
            style={{ maxHeight: `calc(100% - 10px)` }}
            selectionMode={editors ? 'rowbox' : 'none'}
          />
        </div>
      </>
    );
  }
}
