/**
 * StatusPhaseMapping/index.js
 * 状态映射设置页面
 * @date: 2021-08-30
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import React from 'react';
import {
  Table,
  Select,
  DataSet,
  Form,
  Output,
  TextField,
  IconPicker,
  ColorPicker,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import DynamicButtons from '_components/DynamicButtons';
import { onLineDetailChange } from '../../utils';
import './index.less';

export default class StatusPhaseMapping extends React.Component {
  constructor(props) {
    super(props);
    if (props.onRef) props.onRef(this);
    this.statusPhaseMappingDs = this.props.statusPhaseMappingDs;
  }

  addRecord = () => {
    const record = this.statusPhaseMappingDs.create({editorFlag: true}, 0);
    record.setState('editing', true);
  };

  editRecord = (record) => {
    record.setState('editing', true);
  };

  cancelRecord = (record) => {
    if (record.status === 'add') {
      this.statusPhaseMappingDs.remove(record);
    } else {
      record.reset();
      record.setState('editing', false);
    }
  };

  formDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'operateFieldName',
        defaultValue: this.props.thisStatusPhaseMapping.operateFieldName,
        type: 'string',
        label: intl.get('spfm.statusPhaseMapping.modal.view.operateFieldName').d('操作字段名称'),
      },
      {
        name: 'fieldName',
        defaultValue: this.props.thisStatusPhaseMapping.fieldName,
        type: 'string',
        label: intl.get('spfm.statusPhaseMapping.modal.view.fieldName').d('变更展示字段名称'),
      },
    ],
  });

  stageEditor = (record, editors) => {
    return (
      editors && (
        <Select>
          <Select.Option value="BEGIN">
            {intl.get('spfm.statusPhaseMapping.modal.view.begin').d('开始处理')}
          </Select.Option>
          <Select.Option value="PROCESS">
            {intl.get('spfm.statusPhaseMapping.modal.view.process').d('处理中')}
          </Select.Option>
          <Select.Option value="FINISH">
            {intl.get('spfm.statusPhaseMapping.modal.view.finish').d('处理完成')}
          </Select.Option>
          <Select.Option value="CANCEL">
            {intl.get('spfm.statusPhaseMapping.modal.view.cancel').d('已取消')}
          </Select.Option>
        </Select>
      )
    );
  };

  buttons = () => {
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
              url: 'node-prog-def-maps'
            }),
            disabled: isEmpty(dataSet?.selected),
          },
        },
      ];
      return <DynamicButtons buttons={btns?.filter((i) => !i.hidden)} />;
    });
    return [<Buttons dataSet={this.statusPhaseMappingDs} />];
  };

  render() {
    const { editors } = this.props;
    const TextCmp = editors ? TextField  : Output;

    const columns = [
      {
        name: 'fieldValue',
        width: 240,
        editor: editors,
      },
      {
        name: 'actionDescription',
        width: 240,
        editor: editors,
      },
      {
        name: 'icon',
        width: 180,
        editor: editors && <IconPicker name="icon" />,
      },
      {
        name: 'iconColor',
        width: 180,
        editor: editors && <ColorPicker name="iconColor" />,
      },
      {
        name: 'actionSummary',
        width: 260,
        editor: editors,
      },
      {
        name: 'documentName',
        minWidth: 240,
        editor: editors,
      },
      {
        name: 'stage',
        width: 200,
        editor: (record) => this.stageEditor(record, editors),
        renderer: ({ value }) => (
          <p>
            {value === 'BEGIN'
              ? intl.get('spfm.statusPhaseMapping.modal.view.begin').d('开始处理')
              : value === 'PROCESS'
              ? intl.get('spfm.statusPhaseMapping.modal.view.process').d('处理中')
              : value === 'FINISH'
              ? intl.get('spfm.statusPhaseMapping.modal.view.finish').d('处理完成')
              : value === 'CANCEL'
               ? intl.get('spfm.statusPhaseMapping.modal.view.cancel').d('已取消')
               : ''}
          </p>
        ),
      },
    ];
    const edpx = editors ? 210 : 220;
    return (
      <>
        {/* <Header
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <a style={{ color: 'black' }} onClick={() => this.props.changeShowTab()}>
                <Icon type="arrow_back" style={{ fontSize: '0.22rem', marginRight: '0.16rem' }} />
              </a>
              <span>
                {intl.get('spfm.statusPhaseMapping.modal.setting.stateMapping').d('状态映射设置')}
              </span>
            </div>
          }
        /> */}
        <div className='form_content'>
          <Form labelLayout={editors? 'float': "vertical"} dataSet={this.formDs} columns={3}>
            <TextCmp name="operateFieldName" disabled />
            <TextCmp name="fieldName" disabled />
          </Form>
        </div>
        <div style={{ height: `calc(100vh - ${edpx}px)`, marginTop: '16px'}}>
          <Table
            customizable
            boxSizing='wrapper'
            columns={columns}
            buttons={editors && this.buttons()}
            customizedCode="new-workbench"
            dataSet={this.statusPhaseMappingDs}
            style={{ maxHeight: `calc(100% - 20px)` }}
            selectionMode={editors ? 'rowbox' : 'none'}
          />
        </div>
      </>
    );
  }
}
