/**
 * 会员管理 - 新建编辑弹窗
 * @Author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @Date: 2021-03-23
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { TextField, Form, Select, Lov, Spin } from 'choerodon-ui/pro';
import { fetchTagList } from '@/services/memberCentreService';

import styles from './index.less';

const { Option } = Select;

const unitCode = ['SIGL.MEMBER_MEMBERMANAGMENT.FORM'];
@withCustomize({
  unitCode,
})
class EditModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      memberTagList: [],
    };
  }

  /**
   * 因为子组件动态查询，所以将标签变更方法移到子组件里
   */
  handleSelectMember = (record) => {
    const { dataSet, tagList } = this.props;
    const { memberTagList } = this.state;
    const dataList = [];

    const tags = memberTagList.length ? memberTagList : tagList;

    if (Array.isArray(record) && record.length) {
      record.forEach((item) => {
        tags.forEach((item2) => {
          if (item === item2.labelId) {
            dataList.push({
              labelId: item,
              memberId:
                dataSet && dataSet.current && dataSet.current.get('memberId')
                  ? dataSet.current.get('memberId')
                  : '',
              tenantId: item2.tenantId,
            });
          }
        });
      });
    }

    if (dataSet.current) {
      dataSet.current.set('memberLabelRelationList', dataList); // 数据回填到后端接收的字段
    }
  };

  handleQueryTagListNormal = () => {
    fetchTagList({ page: -1, enabledFlag: 1 }).then((res) => {
      if (res && res.content && res.content.length) {
        this.setState({
          memberTagList: res.content,
        });
      }
    });
  };

  /**
   * 动态查询标签列表
   */
  handleQueryTagList = () => {
    this.handleQueryTagListNormal();
  };

  render() {
    const { dataSet, tagList = [] } = this.props;
    const { memberTagList } = this.state;
    const { customizeForm } = this.props;
    // 初次加载读取父组件列表
    const dataList = memberTagList.length ? memberTagList : tagList;
    return (
      <Spin dataSet={dataSet}>
        <div className={styles['modal-select-multiple']}>
          {customizeForm(
            {
              code: unitCode[0],
            },
            <Form labelLayout="float" dataSet={dataSet} columns={1}>
              <TextField name="memberCode" disabled={dataSet.current?.get('memberId')} />
              <TextField name="memberName" />
              <Select
                multiple
                combo
                name="labelRelationList"
                onFocus={this.handleQueryTagList}
                onChange={this.handleSelectMember}
              >
                {dataList.map((item) => {
                  return (
                    <Option key={item.labelId} value={item.labelId} disabled={!item.enabledFlag}>
                      {item.labelName && item.labelName.length > 10
                        ? `${item.labelName.substring(0, 10)}...`
                        : item.labelName}
                    </Option>
                  );
                })}
              </Select>
              <Lov name="associateAccount" />
            </Form>
          )}
        </div>
      </Spin>
    );
  }
}

export default EditModal;
