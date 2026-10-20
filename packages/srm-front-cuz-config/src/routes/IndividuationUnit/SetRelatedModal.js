import React, { Component } from 'react';
import { Form, DataSet, TextField, Select } from 'choerodon-ui/pro';
import { Modal, Button } from "hzero-ui";
// import { Bind } from 'lodash-decorators';
import notification from "utils/notification";
import { queryCopyRewriteUnits, queryGroupUnits, fixUnitRelation } from '@/services/individuationUnitService';
import {
  getResponse,
} from 'utils/utils';

import intl from 'utils/intl';

const {Option} = Select;
export default class UnitModal extends Component {

  ds = null;

  fields = [];

  state = {
    okLoading: false,
  }

  relatedNode = [];

  constructor(props){
    super(props);
    Promise.all([queryCopyRewriteUnits({targetUnitId: props.record.id}), queryGroupUnits({unitGroupId: props.record.unitGroupId})]).then(([r1, r2])=>{
      const res1 = getResponse(r1);
      const res2 = getResponse(r2);
      if(res1 && res2){
        this.relatedSource = res1 || [];
        this.relatedSource.forEach(({unitCode}, index)=>{
          this.fields.push({
            label: intl.get("hpfm.individuationUnit.common.oldRelatedUnit").d("旧关联单元"),
            name: `originCode${index}`,
            defaultValue: unitCode,
            disabled: true,
          });
          this.fields.push({
            label: intl.get("hpfm.individuationUnit.common.newRelatedUnit").d("新关联单元"),
            name: `targetCode${index}`,
            relatedSource: unitCode,
            // required: true,
          });
          this.relatedNode.push(<TextField name={`originCode${index}`} />);
          this.relatedNode.push(
            <Select name={`targetCode${index}`}>
              {res2.map(i=><Option value={i.unitCode}>{i.unitCode}</Option>)}
            </Select>
          );
        });
        this.ds = new DataSet({
          autoCreate: true,
          fields: this.fields,
        });
        this.forceUpdate();
      }
    });
  }

  onOk = async ()=>{
    if(!await this.ds.validate()) return;
    this.setState({okLoading: true});
    const commitData = {};
    this.fields.forEach(field=>{
      if(field.relatedSource){
        commitData[field.relatedSource] = this.ds.current.get(field.name);
      }
    });
    fixUnitRelation(commitData, this.props.record.unitCode).then(r=>{
      const res = getResponse(r);
      if(getResponse(res)){
        notification.success();
        this.props.onClose(true, this.props.record.unitGroupId);
      }else {
        this.setState({okLoading: false});
      }
    }).catch(()=>{
      this.setState({okLoading: false});
    });
  }

  render() {
    const {
      visible,
      onClose,
    } = this.props;
    return (
      <Modal
        width={1000}
        title={intl.get('hpfm.individuationUnit.view.message.title.relatedRewrite').d('关联关系重定向')}
        visible={visible}
        footer={[
          <Button onClick={()=>onClose()}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>,
          <Button loading={this.state.okLoading} onClick={this.onOk} type="primary">{intl.get('hzero.common.button.ok').d('确定')}</Button>,
        ]}
        closable={false}
        destroyOnClose
      >
        <Form dataSet={this.ds} columns={2} labelLayout="float">
          {this.relatedNode}
        </Form>
      </Modal>
    );
  }
}
