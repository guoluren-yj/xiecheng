import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Header, Content } from 'components/Page';
import {
  DataSet,
  Table,
  Button,
  Form,
  TextField,
  Switch,
  Lov,
  Tooltip,
  Spin,
  Output,
} from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import Column from 'choerodon-ui/pro/lib/table/Column';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import Modal from '@/components/LowcodeModal';
import { publishFlow, forbiddenFlow, startUseFlow } from '@/services/processDefinition';

import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import styles from './index.less';

// TODO: 提测前删除
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

const ModalContent = (props) => {
  const { modal, record, isDetail, queryRef, isEdit = false, isCopy = false, history } = props;
  const ds = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        transport: {
          read: () => ({
            url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flows`,
            method: 'GET',
          }),
          create: ({ data }) => {
            const baseUrl = `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flows`;
            return {
              url: isCopy ? `${baseUrl}/copy/${record.get('flowId')}` : baseUrl,
              method: 'POST',
              data: isCopy
                ? {
                    ...data[0],
                    __id: undefined,
                    _status: undefined,
                    _token: undefined,
                  }
                : data[0],
            };
          },
          update: ({ data }) => {
            return {
              url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flows`,
              method: 'PUT',
              data: data[0],
            };
          },
        },
        fields: [
          {
            name: 'flowCode',
            type: FieldType.string,
            label: '流编码',
            required: true,
            // pattern: '^[a-zA-Z0-9][a-zA-Z0-9-_./]*$',
            validator: (value) => {
              const pattern = /^[a-zA-Z0-9][a-zA-Z0-9-_./]*$/;
              if (!pattern.test(value)) {
                return '支持字母及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”';
              }
            },
            maxLength: 50,
          },
          {
            name: 'flowName',
            type: FieldType.string,
            label: '流名称',
            required: true,
            maxLength: 30,
          },
          {
            name: 'enabledFlag',
            type: FieldType.boolean,
            defaultValue: 1,
            trueValue: 1,
            falseValue: 0,
            label: '启用',
            required: true,
          },
          {
            name: 'tenant',
            type: FieldType.object,
            label: '所属租户',
            lovCode: 'HPFM.TENANT',
            textField: 'tenantName',
            valueField: 'tenantId',
            required: true,
            ignore: FieldIgnore.always,
          },
          { name: 'tenantId', type: FieldType.string, bind: 'tenant.tenantId' },
          { name: 'tenantName', type: FieldType.string, bind: 'tenant.tenantName' },
          { name: 'remark', type: FieldType.string, label: '描述' },
        ],
        data: [],
        events: {},
      } as DataSetProps),
    []
  );
  useEffect(() => {
    if (record) {
      ds.removeAll();
      if (isCopy) {
        ds.create({
          flowCode: record.toData().flowCode,
          flowName: record.toData().flowName,
          remark: '',
          enabledFlag: 1,
        });
      } else {
        ds.loadData([record.toData()]);
      }
    }
  }, []);

  modal.handleOk(async () => {
    const validate = await ds.validate();
    if (!isDetail && validate) {
      const res = await ds.submit();
      if (res && res.failed) return false;
      queryRef.current = true;
      const { flowId } = ds.current?.toData() || {};
      if (!isEdit && !isCopy) {
        history.push(`/hmde/definition/designer/detail?flowId=${flowId}`);
      }
    } else {
      return false;
    }
  });
  modal.handleCancel(() => {
    modal.close();
  });

  return (
    <Spin dataSet={ds}>
      <Form disabled={isDetail} dataSet={ds} id="basic" labelWidth="auto">
        {isEdit ? (
          <Output name="flowCode" />
        ) : (
          <TextField label="流编码" name="flowCode" required />
        )}
        <TextField label="流名称" name="flowName" required />
        {isEdit ? <Output name="tenant" /> : <Lov label="所属租户" name="tenant" required />}
        <TextField label="描述" name="remark" />
        <Switch label="启用" name="enabledFlag" />
      </Form>
    </Spin>
  );
};

export default function ProcessDefinition(props) {
  const queryFlagRef = useRef(false);
  const modalFlagRef = useRef(true);
  const { history } = props;
  const [curParams, setCurParams] = useState({} as any);
  console.log('file: ProcessDefinition.tsx ~ line 86 ~ ProcessDefinition ~ history', history);
  const ds = useMemo(() => {
    return new DataSet({
      primaryKey: 'flowId',
      autoQuery: false,
      autoQueryAfterSubmit: true,
      selection: false,
      pageSize: 10,
      transport: {
        read: () => ({
          url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flows`,
          method: 'GET',
        }),
        submit: ({ data }) => ({
          url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/flows`,
          method: 'PUT',
          data: data[0],
        }),
      },
      queryFields: [
        {
          name: 'keyword',
          type: FieldType.string,
          label: '请输入事务流编码/名称进行查询',
          labelWidth: '200',
        },
      ],
      fields: [
        { name: 'flowCode', type: FieldType.string, label: '流编码' },
        { name: 'flowName', type: FieldType.string, label: '流名称' },
        { name: 'flowConfig', type: FieldType.string, label: '流详情' },
        { name: 'enabledFlag', type: FieldType.number, label: '是否启用' },
        { name: 'flowStatus', type: FieldType.string, label: '状态' },
        {
          name: 'tenantId',
          type: FieldType.string,
          label: '所属租户ID',
        },
        {
          name: 'tenantName',
          type: FieldType.string,
          label: '所属租户',
        },
        { name: 'tenantId', type: FieldType.string, label: '所属租户' },
        { name: 'remark', type: FieldType.string, label: '描述' },
        {
          name: 'version',
          type: FieldType.number,
          label: '当前版本',
        },
      ],
      events: {
        query: ({ params }) => {
          setCurParams(params);
        },
      },
    });
  }, []);

  useEffect(() => {
    const queryState = sessionStorage.getItem('queryState');
    const pageState = sessionStorage.getItem('pageState');
    // eslint-disable-next-line no-unused-expressions
    ds?.queryDataSet?.current?.set('keyword', queryState || '');
    ds.query(pageState ? Number(pageState) + 1 : 1, { keyword: queryState || '' }).then(() => {
      if (ds?.queryDataSet?.current) {
        sessionStorage.removeItem('pageState');
        sessionStorage.removeItem('queryState');
      }
    });
  }, [ds?.queryDataSet?.current]);

  // 编辑
  const edit = (commandProps) => {
    modalFlagRef.current = false;
    const { record } = commandProps;
    Modal.open({
      title: '编辑事务处理流',
      children: <ModalContent record={record} queryRef={queryFlagRef} isEdit history={history} />,
      okText: '确定',
      afterClose: async () => {
        modalFlagRef.current = true;
        if (queryFlagRef.current) {
          ds.query();
          queryFlagRef.current = false;
        }
      },
    });
  };
  // 复制
  const copy = (commandProps) => {
    modalFlagRef.current = false;
    const { record } = commandProps;
    Modal.open({
      title: '复制事务处理流',
      children: <ModalContent record={record} queryRef={queryFlagRef} isCopy history={history} />,
      okText: '确定',
      afterClose: async () => {
        modalFlagRef.current = true;
        if (queryFlagRef.current) {
          ds.query();
          queryFlagRef.current = false;
        }
      },
    });
  };
  // 打开详情
  // const openDetail = (commandProps) => {
  //   const { record } = commandProps;
  //   Modal.open({
  //     title: '新建事务处理流',
  //     children: <ModalContent record={record} isDetail />,
  //     okText: '确定',
  //   });
  // };

  // 启用禁用
  const setEnable = async (commandProps) => {
    const { record } = commandProps;
    if (record.get('enabledFlag') === 0) {
      startUseFlow(record?.get('flowId')).then((res) => {
        if (getResponse(res)) {
          ds.query();
          notification.success({ message: '启用成功' });
        }
      });
    } else {
      forbiddenFlow(record?.get('flowId')).then((res) => {
        if (getResponse(res)) {
          ds.query();
          notification.success({ message: '禁用成功' });
        }
      });
    }
  };

  // 去配置页面
  const deploy = (commandProps) => {
    console.log('file: ProcessDefinition.tsx ~ line 180 ~ deploy ~ commandProps', commandProps);
    const { record } = commandProps;
    const flowId = record.get('flowId');
    history.push({
      pathname: `/hmde/definition/designer/detail/?flowId=${flowId}`,
      state: curParams,
    });
  };

  const publish = (flowId) => {
    publishFlow(flowId).then((res) => {
      if (getResponse(res)) {
        notification.success({ message: '发布成功' });
        console.log('发布res', res);
        ds.query();
      }
    });
  };

  const commands = (commandProps) => {
    const { record } = commandProps;
    // const detail = () => (
    //   <div key="detail" onClick={() => openDetail(commandProps)}>
    //     详情
    //   </div>
    // );
    const array: any[] = [
      () => (
        <div key="edit" onClick={() => modalFlagRef.current && edit(commandProps)}>
          编辑
        </div>
      ),
      () => (
        <div key="edit" onClick={() => modalFlagRef.current && copy(commandProps)}>
          复制
        </div>
      ),
      () => (
        <div key="config" onClick={() => modalFlagRef.current && deploy(commandProps)}>
          配置
        </div>
      ),
      () => (
        <div onClick={() => modalFlagRef.current && setEnable(commandProps)}>
          {commandProps.record.get('enabledFlag') ? '禁用' : '启用'}
        </div>
      ),
    ];
    if (record.get('flowStatus') !== 'Y') {
      array.push(() => (
        <div
          onClick={() => {
            if (!modalFlagRef.current) return;
            modalFlagRef.current = false;
            Modal.confirm({
              children: <span>请确认是否发布该事务处理流</span>,
              okText: '确定',
              onOk: () => {
                modalFlagRef.current = true;
                publish(record?.get('flowId'));
              },
              onCancel: () => {
                modalFlagRef.current = true;
              },
            });
          }}
        >
          发布
        </div>
      ));
    }
    if (array.length <= 3) {
      return <div className={styles['handle-btns']}>{array.map((item) => item())}</div>;
    } else {
      const title = <div className={styles['btn-group']}>{array.map((item) => item())}</div>;
      return (
        <Tooltip title={title} theme="light" placement="bottom">
          <span className={styles['btn-ellipsis']}>...</span>
        </Tooltip>
      );
    }
  };

  // 新建
  const add = () => {
    Modal.open({
      title: '新建事务处理流',
      children: <ModalContent queryRef={queryFlagRef} history={history} />,
      okText: '确定',
      afterClose: async () => {
        if (queryFlagRef.current) {
          ds.query();
          queryFlagRef.current = false;
        }
      },
    });
  };

  const buttons = [
    <Button icon="add" funcType={FuncType.flat} onClick={() => add()} key="add">
      新建
    </Button>,
  ];

  return (
    <>
      <Header title="事务处理流" />
      <Content>
        <Table dataSet={ds} buttons={buttons}>
          <Column
            name="flowCode"
            renderer={({ value, record }) => {
              return (
                <a
                  onClick={() => {
                    // eslint-disable-next-line no-unused-expressions
                    modalFlagRef.current && deploy({ record });
                  }}
                >
                  {value}
                </a>
              );
            }}
          />
          <Column name="flowName" />
          <Column
            name="version"
            align={ColumnAlign.left}
            renderer={({ value }) => {
              return `版本 ${value}`;
            }}
          />
          <Column
            name="enabledFlag"
            align={ColumnAlign.left}
            renderer={({ value }) =>
              value === 1 ? (
                <>
                  <span className={styles['enabled-dot']} />是
                </>
              ) : (
                <>
                  <span className={styles['not-enabled-dot']} />否
                </>
              )
            }
          />
          <Column
            name="flowStatus"
            renderer={({ value }) => {
              if (value === 'Y') {
                return '已发布';
              } else if (value === 'N') {
                return '未发布';
              } else {
                return '需重新发布';
              }
            }}
          />
          <Column name="tenantName" />
          <Column name="remark" />
          <Column header="操作" width={180} renderer={commands} align={ColumnAlign.center} />
        </Table>
      </Content>
    </>
  );
}
