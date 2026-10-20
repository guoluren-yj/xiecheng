import React, { useEffect, useState, useMemo } from 'react';
import { DataSet, Form, Spin, Select } from 'choerodon-ui/pro';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

const { Option } = Select;

export default function Edge(props) {
  const {
    selectedEdge,
    sourceNode,
    selectedConditions = [],
    nodeArr,
    versionDisabled,
    setChangeDisabled,
  } = props;
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const ds = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'branchCode',
            type: FieldType.string,
            label: '分支code',
            required: true,
          },
          {
            name: 'branchName',
            label: '分支名称',
            type: FieldType.string,
          },
        ],
        events: {},
      }),
    []
  );

  useEffect(() => {
    setLoading(true);
    const { labels } = selectedEdge;
    if (labels[0] && labels[0].attrs) {
      ds.loadData([
        {
          branchCode: labels[0]?.attrs?.branchCode,
          branchName: labels[0]?.attrs?.branchName,
        },
      ]);
    }

    const nodeConfig = JSON.parse(nodeArr.current.get(sourceNode?.id)?.nodeConfig || '{}');
    const array: any = [];
    if (nodeConfig?.branches) {
      if (!selectedConditions.find((item) => item?.branchCode === 'default_code')) {
        nodeConfig.branches.unshift(nodeConfig?.defalutBranch);
      }
      nodeConfig.branches.forEach((item) => {
        if (!selectedConditions.find((i) => i === item.branchCode)) {
          array.push(item);
        }
      });
    }
    setBranches(array || []);
    setLoading(false);
  }, []);

  // 选择分支
  const selectBranch = (item) => {
    console.log('选中', item);
    if (ds.current) {
      setChangeDisabled(true);
      ds.current.set('branchCode', item ? item?.branchCode : '');
      ds.current.set('branchName', item ? item?.branchName : '');
      selectedEdge.setLabels({
        attrs: {
          label: { text: item ? item?.branchName : '' },
          branchCode: item ? item?.branchCode : '',
          branchName: item ? item?.branchName : '',
        },
      });
    }
  };

  return (
    <Spin spinning={loading}>
      <Form dataSet={ds} disabled={versionDisabled}>
        <Select
          name="branchName"
          onChange={(value) => {
            selectBranch(value);
          }}
        >
          {branches.map((item) => (
            <Option value={item}>{item?.branchName}</Option>
          ))}
        </Select>
      </Form>
    </Spin>
  );
}
