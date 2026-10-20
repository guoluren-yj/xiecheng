/**
 * PerformDocuments/index.js
 * 执行单据配置页面
 * @date: 2021-12-8
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import React from 'react';
import intl from 'utils/intl';
import { Table, Select} from 'choerodon-ui/pro';
import { getResponse, isTenantRoleLevel } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';
import { SRM_DATA_PROCESS } from '_utils/config';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import { referenceSrmPerformData } from '@/services/docFlowDefinitionNodesService';
import { onLineDetailChange } from '../../utils';
import './index.less';

const { Column } = Table;
const tenantFlag = isTenantRoleLevel();
export default class PerformDocuments extends React.Component {
  constructor(props) {
    super(props);
    this.performDocumentsDs = this.props.performDocumentsDs;
  }

  addRecord = () => {
    this.performDocumentsDs?.current
      ?.getField('displayField')
      ?.setLovPara('nodeDefCode', this.props?.data?.currentCode);
    const record = this.performDocumentsDs?.create({editorFlag: true}, 0);
    record?.setState('editing', true);
  };

  editRecord = (record) => {
    this.performDocumentsDs?.current
      ?.getField('displayField')
      ?.setLovPara('nodeDefCode', this.props?.data?.currentCode);
    record.setState('editing', true);
  };

  cancelRecord = (record) => {
    if (record?.status === 'add') {
      this.performDocumentsDs.remove(record);
    } else {
      record?.reset();
      record?.setState('editing', false);
    }
  };

  referenceData = (props) => {
    const data = {
      nodeDefinitionCode: props?.data?.currentCode,
    };
    referenceSrmPerformData(data).then((res) => {
      if (getResponse(res)) {
        notification?.success();
        this.performDocumentsDs?.query();
      }
    });
  };

  headerFlagEditor = (record) => {
    return (
      record.getState('editing') && (
        <Select>
          <Select.Option value={1}>{intl.get('hzero.common.button.yes').d('是')}</Select.Option>
          <Select.Option value={0}>{intl.get('hzero.common.button.no').d('否')}</Select.Option>
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
              url: 'node-rel-doc-configs'
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
    return [<Buttons dataSet={this.performDocumentsDs} />];
  };


  render() {
    const { editors } = this.props;
    return (
      <>
        <div style={{ height: 'calc(100vh - 180px)' }}>
          <Table
            customizable
            buttons={editors && this.buttons()}
            boxSizing='wrapper'
            customizedCode="new-workbench"
            dataSet={this.performDocumentsDs}
            style={{ maxHeight: `calc(100% - 10px)` }}
            selectionMode={editors ? 'rowbox' : 'none'}
          >
            <Column name="displayField" editor={editors} />
            <Column
              name="fieldSequence"
              // width={300}
              align="left"
              editor={editors}
            />
            {/* <Column
              name="statusFlag"
              width={300}
              align="left"
              editor={(record) => this.headerFlagEditor(record)}
              renderer={({ value }) => (
                <p>
                  {value === 1
                    ? intl.get('hzero.common.button.yes').d('是')
                    : value === 0
                    ? intl.get('hzero.common.button.no').d('否')
                    : ''}
                </p>
              )}
            /> */}
            {/* <Column
              name="operation"
              width={150}
              lock="right"
              renderer={({ record }) => (
                <>
                  {record.getState('editing') ? (
                    <span className="action-link">
                      <a onClick={() => this.cancelRecord(record)}>
                        {intl.get('hzero.common.btn.cancel').d('取消')}
                      </a>
                    </span>
                  ) : (
                    <span className="action-link">
                      <a onClick={() => this.editRecord(record)}>
                        {intl.get('hzero.common.status.editor').d('编辑')}
                      </a>
                    </span>
                  )}
                </>
              )}
            /> */}
        </Table>
        </div>
      </>
    );
  }
}
