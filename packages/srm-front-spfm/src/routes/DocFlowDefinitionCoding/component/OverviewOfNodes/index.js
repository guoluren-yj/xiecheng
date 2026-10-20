/**
 * OverviewOfNodes/index.js
 * 节点概述页面
 * @date: 2021-08-30
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import React from 'react';
import intl from 'utils/intl';
import { Table, Select } from 'choerodon-ui/pro';
import { getResponse, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';
import { SRM_DATA_PROCESS } from '_utils/config';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import { referenceSrmOverviewData } from '@/services/docFlowDefinitionNodesService';
import { onLineDetailChange } from '../../utils';
import './index.less';

const { Column } = Table;
const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();
export default class OverviewOfNodes extends React.Component {
  constructor(props) {
    super(props);
    this.overviewOfNodesDs = this.props.overviewOfNodesDs;
  }

  addRecord = () => {
    const record = this.overviewOfNodesDs?.create({editorFlag: true, nodeDefinitionCode: this.props.code}, 0);
    this.overviewOfNodesDs?.current
      ?.getField('displayField')
      ?.setLovPara('nodeDefCode', this.props.code);
    record?.setState('editing', true);
  };

  editRecord = (record) => {
    this.overviewOfNodesDs?.current
      ?.getField('displayField')
      ?.setLovPara('nodeDefCode', this.props.code);
    record?.setState('editing', true);
  };

  cancelRecord = (record) => {
    if (record?.status === 'add') {
      this.overviewOfNodesDs.remove(record);
    } else {
      record?.reset();
      record?.setState('editing', false);
    }
  };

  referenceData = (props) => {
    const data = {
      nodeDefinitionCode: props?.code,
    };
    referenceSrmOverviewData(data).then((res) => {
      if (getResponse(res)) {
        notification.success();
        this.overviewOfNodesDs?.query();
      }
    });
  };

  headerFlagEditor = (record, editors) => {
    return (
      editors && (
        <Select>
          <Select.Option value={1}>
            {intl.get('spfm.overviewOfNodes.model.view.head').d('头')}
          </Select.Option>
          <Select.Option value={0}>
            {intl.get('spfm.overviewOfNodes.model.view.line').d('行')}
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
              url: 'node-details'
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
    return [<Buttons dataSet={this.overviewOfNodesDs} />];
  };

  render() {
    const { editors } = this.props;
    return (
      <>
       <div style={{ height: 'calc(100vh - 175px)' }}>
            <Table
              customizable
              buttons={editors && this.buttons()}
              boxSizing='wrapper'
              customizedCode="new-workbench"
              dataSet={this.overviewOfNodesDs}
              style={{ maxHeight: `calc(100% - 20px)` }}
              selectionMode={editors ? 'rowbox' : 'none'}
            >
              <Column name="displayField" editor={editors} />
              <Column
                name="fieldSequence"
                width={300}
                editor={editors}
              />
              <Column
                name="headerFlag"
                width={300}
                align="left"
                // editor={editors}
                editor={(record) => this.headerFlagEditor(record, editors)}
                renderer={({ value }) => (
                  <p>
                    {value === 1
                      ? intl.get('spfm.overviewOfNodes.model.view.head').d('头')
                      : value === 0
                      ? intl.get('spfm.overviewOfNodes.model.view.line').d('行')
                      : ''}
                  </p>
                )}
              />
            </Table>
        </div>
      </>
    );
  }
}
