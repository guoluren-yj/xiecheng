import React from 'react';
import { Card, Select, Form } from 'hzero-ui';
import { Lov } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isFunction, isArray } from 'lodash';
import intl from 'utils/intl';
import { DETAIL_CARD_TABLE_CLASSNAME } from 'utils/constants';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 },
};

let uid = Date.now();
@Form.create({ fieldNameProp: null })
export default class ApprovalGroup extends React.Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      approverRecord: {},
      conditionColumnList: [],
      approverLists: [],
    };
  }

  createUid = () => {
    return `spz_${(uid++).toString(36)}`;
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

  @Bind()
  deleteRecord(parameterName) {
    const { conditionColumnList } = this.state;
    const data = conditionColumnList.filter((res) => res.parameterName !== parameterName);
    this.setState({ conditionColumnList: data });
  }

  @Bind()
  allClear() {
    this.setState({ approverRecord: {}, conditionColumnList: [] });
  }

  @Bind()
  handleApproverChange(val, record) {
    const { approverList, isCreate } = this.props;
    const { approverLists, approverRecord } = this.state;
    // 新建时用props中的list 更新时用state的list
    const approverSelectList = isCreate || approverList.length > 0 ? approverList : approverLists;
    if (val && record.key) {
      // 对id和key进行String转换，解决Number和String对比问题
      const currentApprover = approverSelectList.filter(
        (res) => String(res.id) === String(record.key)
      );
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
  }

  @Bind()
  onSave() {
    const { form } = this.props;
    const { conditionColumnList, approverRecord } = this.state;
    let resultData = [];
    form.validateFields((error) => {
      if (!error) {
        resultData = [...conditionColumnList, approverRecord];
      } else {
        resultData = false;
      }
    });
    return resultData;
  }

  @Bind()
  renderLovConditionColumn() {
    const { isSiteFlag, conditionColumnFormDs } = this.props;
    return (
      <>
        {!isSiteFlag && (
          <Lov
            dataSet={conditionColumnFormDs}
            name="conditionColumn"
            onChange={this.addLovConditionColumn}
            maxTagCount={5}
            style={{ width: '100%' }}
          />
        )}
      </>
    );
  }

  componentDidMount() {
    this.query();
  }

  // 用于手动更新值
  @Bind()
  query() {
    const {
      parameterList,
      currentApprovalGroup,
      approvalGroupDefId,
      isCreate,
      isSiteFlag,
      conditionColumnFormDs,
    } = this.props;
    const currentItem = parameterList.filter((item) => item.parameterSource !== 'VARIABLE');
    const approverRecord = currentItem.length > 0 ? currentItem[0] : {};
    const conditionColumnList =
      parameterList.filter((item) => item.parameterSource !== 'CONSTANT') || [];
    this.setState({ conditionColumnList, approverRecord });
    const field = conditionColumnFormDs.getField('conditionColumn');
    if (field) {
      field.setLovPara('defId', currentApprovalGroup.id || approvalGroupDefId);
    }
    conditionColumnFormDs.loadData([
      {
        conditionColumn: conditionColumnList.map((item) => ({
          ...item,
          id: item.interfaceParameterId,
          fieldCode: item.parameterValue,
          fieldName: item.columnName,
        })),
      },
    ]);
    const { dispatch } = this.props;
    if (!isCreate && !isSiteFlag) {
      dispatch({
        type: 'serviceDefinition/getApproverList',
        payload: { defId: currentApprovalGroup.id || approvalGroupDefId },
      }).then((res) => {
        if (isArray(res)) {
          this.setState({ approverLists: res });
        }
      });
    }
  }

  render() {
    const { form, approverList = [], isCreate, isSiteFlag } = this.props;
    const { approverRecord, approverLists } = this.state;
    const { getFieldDecorator } = form;
    // 新建时用props中的list 更新时用state的list
    const approverSelectList = isCreate || approverList.length > 0 ? approverList : approverLists;
    const { columnName } = approverRecord;
    return (
      <>
        <Card
          bordered={false}
          className={DETAIL_CARD_TABLE_CLASSNAME}
          title={
            <h3>
              {intl
                .get('hwfp.serviceDefinition.view.title.approvalGroup.definition')
                .d('审批组定义')}
            </h3>
          }
        >
          <Form style={{ width: 500 }}>
            <FormItem
              {...formLayout}
              label={intl
                .get('hwfp.serviceDefinition.model.serviceDefinition.conditionColumn')
                .d('条件列选择')}
              style={{ marginBottom: '8px' }}
            >
              {getFieldDecorator('conditionColumn', {
                initialValue: '',
                rules: [
                  {
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hwfp.serviceDefinition.model.serviceDefinition.conditionColumn')
                        .d('条件列选择'),
                    }),
                  },
                ],
              })(this.renderLovConditionColumn())}
            </FormItem>
            <FormItem
              {...formLayout}
              label={intl
                .get('hwfp.serviceDefinition.model.serviceDefinition.approver')
                .d('审批人选择')}
            >
              {getFieldDecorator('approver', {
                initialValue: columnName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hwfp.serviceDefinition.model.serviceDefinition.approver')
                        .d('审批人选择'),
                    }),
                  },
                ],
              })(
                isSiteFlag ? (
                  <>{columnName}</>
                ) : (
                  <Select
                    allowClear
                    onChange={this.handleApproverChange}
                    disabled={approverSelectList.length === 0 || isSiteFlag}
                  >
                    {approverSelectList.map((item) => (
                      <Select.Option value={item.fieldCode} key={String(item.id)}>
                        {item.fieldName}
                      </Select.Option>
                    ))}
                  </Select>
                )
              )}
            </FormItem>
          </Form>
        </Card>
      </>
    );
  }
}
