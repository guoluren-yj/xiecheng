/**
 * ApprovalGroup
 * @date: 2022-07-13
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Form, DataSet, Select, Lov } from 'choerodon-ui/pro';
import { isEmpty, isArray } from 'lodash';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { getApproverList } from '../processConfigurationService';
import { getServiceApprovalGroupForm } from './serviceStoreDs';

let uid = Date.now();

@observer
export default class ApprovalGroup extends React.Component {
  constructor(props) {
    super(props);
    // 父组件调用保存方法
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.state = {
      // 条件列列表
      conditionColumnList: [],
      // 审批人列表
      approverLists: [],
      approverRecord: {},
    };
    this.approvalGroupFormDs = new DataSet(getServiceApprovalGroupForm());
  }

  createUid = () => {
    return `spz_${(uid++).toString(36)}`;
  };

  deleteRecord = (parameterName) => {
    const { conditionColumnList } = this.state;
    const data = conditionColumnList.filter((res) => res.parameterName !== parameterName);
    this.setState({ conditionColumnList: data });
  };

  onSave = () => {
    let resultData = [];
    const { conditionColumnList, approverRecord } = this.state;
    resultData = [...conditionColumnList, approverRecord];
    if (isEmpty(approverRecord)) {
      return false;
    }
    return resultData;
  };

  renderLovConditionColumn = () => {
    const { isSiteFlag, isPredefined, conditionColumnFormDs } = this.props;
    return (
      <>
        {!isSiteFlag && !isPredefined && (
          <Lov
            dataSet={conditionColumnFormDs}
            name="conditionColumn"
            onChange={this.addLovConditionColumn}
            maxTagCount={5}
          />
        )}
      </>
    );
  };

  addLovConditionColumn = (records) => {
    const newRecordsId = [];
    const newRecords = [];
    if (records) {
      records.forEach((r) => {
        if (!newRecordsId.includes(r.id)) {
          newRecords.push({
            ...r,
            interfaceParameterId: r.id,
            parameterName: this.createUid(),
            parameterSource: 'VARIABLE',
            parameterValue: r.fieldCode,
            parameterDescription: 'INPUT',
            columnName: r.fieldName,
          });
          newRecordsId.push(r.id);
        }
      });
    }
    if (this.props.conditionColumnFormDs.current) {
      this.props.conditionColumnFormDs.current.set('conditionColumn', newRecords);
    }
    this.setState({ conditionColumnList: newRecords });
  };

  handleApproverChange = (value) => {
    const { approverList, isCreate } = this.props;
    const { approverLists, approverRecord } = this.state;
    const approverSelectList = isCreate || approverList.length > 0 ? approverList : approverLists;
    // 新建时用props中的list 更新时用state的list
    if (value) {
      const currentApprover = approverSelectList.filter((res) => res.fieldCode === value);
      const data = {
        interfaceParameterId: currentApprover[0].id,
        parameterName: this.createUid(),
        parameterSource: 'CONSTANT',
        parameterValue: currentApprover[0].fieldCode,
        parameterDescription: 'OUTPUT',
      };
      this.setState({ approverRecord: { ...approverRecord, ...data } });
    } else {
      this.setState({ approverRecord: {} });
    }
  };

  componentDidMount() {
    this.query();
  }

  // 用于更新
  query = () => {
    const {
      parameterList,
      isCreate,
      isSiteFlag,
      currentApprovalGroup,
      serviceConfigFormDs,
      conditionColumnFormDs,
    } = this.props;
    const currentItem = parameterList.filter((item) => item.parameterSource !== 'VARIABLE');
    const approverRecord = currentItem.length > 0 ? currentItem[0] : {};
    const { conditionColumn } = conditionColumnFormDs.toData()[0] || {};
    this.setState({ conditionColumnList: conditionColumn || [], approverRecord });
    // 将审批人set到ds中
    if (!isEmpty(approverRecord) && approverRecord.parameterValue) {
      this.approvalGroupFormDs.create({ approver: approverRecord.parameterValue });
    }
    const approvalGroupDefId = serviceConfigFormDs?.current?.get('approvalGroupDefId');
    if (!isCreate && !isSiteFlag) {
      getApproverList({ defId: currentApprovalGroup.id || approvalGroupDefId }).then((res) => {
        if (isArray(res)) {
          this.setState({ approverLists: res });
        }
      });
    }
  };

  render() {
    const { approverList, isCreate, isPredefined } = this.props;
    const { approverLists } = this.state;
    const approverSelectList = isCreate || approverList.length > 0 ? approverList : approverLists;
    return (
      <>
        <div className="service-definition-title">
          <span>
            {intl.get('hwfp.serviceDefinition.view.title.approvalGroup.definition').d('审批组定义')}
          </span>
        </div>
        <Form
          dataSet={this.approvalGroupFormDs}
          style={{ width: 500 }}
          disabled={isPredefined}
          labelLayout="float"
        >
          {this.renderLovConditionColumn()}
          <Select name="approver" onChange={this.handleApproverChange}>
            {approverSelectList.map((item) => (
              <Select.Option value={item.fieldCode} key={item.id}>
                {item.fieldName}
              </Select.Option>
            ))}
          </Select>
        </Form>
      </>
    );
  }
}
