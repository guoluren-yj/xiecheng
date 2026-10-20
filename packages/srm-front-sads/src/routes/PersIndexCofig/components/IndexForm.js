import React, { Component, useMemo, useCallback, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Observer } from 'mobx-react';
import { toJS } from 'mobx';
import { isPlainObject } from 'lodash';

import {
  Form,
  TextField,
  Lov,
  TextArea,
  Select,
  Table,
  DataSet,
  Button,
  Spin,
} from 'choerodon-ui/pro';
import { Popconfirm } from 'choerodon-ui';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { fetchSave, fetchCodes, fetchDeleteSubLine, fetchDetails } from '../api';

import { subObjectDS, IndexDS } from '../stores/IndexDS';

const SubObjectTable = observer(({ readOnly, ds, headerDs }) => {
  const [refreshLoading, setRefreshLoading] = useState(false);
  const columns = useMemo(() => {
    return [
      {
        name: 'objName',
        width: 120,
        editor: !readOnly,
      },
      {
        name: 'objCode',
        width: 100,
        editor: !readOnly,
      },
      {
        name: 'nestedFlag',
        width: 120,
        editor: !readOnly,
      },
      {
        name: 'nestedOverrideFlag',
        width: 120,
        editor: !readOnly,
      },
      {
        name: 'nestedFieldName',
        width: 150,
        editor: (record, name) => {
          if (readOnly) return false;
          const usedOptions = ds.reduce((data, r) => {
            const v = r.get(name);
            if (r.index !== record.index) {
              data.push(isPlainObject(v) ? v.value : v);
            }
            return data;
          }, []);
          return (
            <Select
              optionsFilter={(r) => {
                return (
                  !usedOptions.find((o) => String(o) === String(r.get('value'))) &&
                  r.get('type') === 'nested'
                );
              }}
            />
          );
        },
      },
      {
        name: 'ovnField',
        width: 150,
        editor: (record, name) => editorRender(record, name),
      },
      {
        name: 'subObjLineList',
        width: 150,
        editor: (record, name) => editorRender(record, name),
      },
    ];
  }, [readOnly, ds]);

  useEffect(() => {
    initFieldsDataSource();
  }, [headerDs.length]);

  const handleRefresh = (loading) => {
    if (loading) setRefreshLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        ds.remove(ds.filter((f) => f.status === 'add'));
        initFieldsDataSource();
        if (loading) setRefreshLoading(false);
        resolve();
      }, 1000);
    });
  };

  const initFieldsDataSource = async () => {
    const { mapping } = headerDs?.current?.toData() || {};
    if (mapping) {
      const res = await fetchCodes(headerDs?.current?.toData());
      if (getResponse(res)) {
        const { objFieldNames = [], nestedFieldNames = {} } = res || {};
        const nestedSource = Object.keys(nestedFieldNames);
        const nestedVandSSource = [];
        Object.keys(nestedFieldNames).forEach((key) => {
          const _values = nestedFieldNames[key].reduce((pre, i) => {
            pre.push({ name: i, type: key });
            return pre;
          }, []);
          nestedVandSSource.push(..._values);
        });
        const [_standardSource, _nestedSource, _nestedVandSSource] = getOptionsData(
          objFieldNames,
          nestedSource,
          nestedVandSSource
        );
        const options = _standardSource.concat(_nestedVandSSource);
        const notNestedNeedInitFields = ['ovnField', 'subObjLineList'];
        notNestedNeedInitFields.forEach((name) => {
          ds.getField(name).get('options').loadData(options);
        });
        ds.getField('nestedFieldName').get('options').loadData(_nestedSource);
      }
    }
  };

  const getOptionsData = (standardSource = [], nestedSource = [], nestedVandSSource = []) => {
    const mapData = (d, type) => (d || []).map((n) => ({ meaning: n, value: n, type }));
    const mapObjData = (d) => d.map((n) => ({ ...n, meaning: n.name, value: n.name }));
    const _standardSource = mapData(standardSource, 'standard');
    const _nestedSource = mapData(nestedSource, 'nested');
    const _nestedVandSSource = mapObjData(nestedVandSSource);
    return [_standardSource, _nestedSource, _nestedVandSSource];
  };

  const getData = (r, fields, data) => {
    fields.forEach((f) => {
      const v = toJS(r.get(f));
      // 多选情况
      if (ds.getField(f).get('multiple')) {
        data.push(...v.map((m) => (isPlainObject(m) ? toJS(m).value : m)));
      }
      // 单选
      else {
        data.push(isPlainObject(v) ? v.value : v);
      }
    });
    return data;
  };

  const editorRender = (record, name) => {
    if (readOnly) return false;
    const { nestedFlag, nestedFieldName, nestedOverrideFlag } = record.get([
      'nestedFlag',
      'nestedFieldName',
      'nestedOverrideFlag',
    ]);
    let type = nestedFlag
      ? isPlainObject(nestedFieldName)
        ? nestedFieldName.value
        : nestedFieldName
      : 'standard';
    // 覆盖nested结构时， 版本号取标注值集
    if (nestedOverrideFlag && name === 'ovnField') {
      type = 'standard';
    }
    const fields = ['ovnField', 'subObjLineList'];
    let usedOptions = [];

    // nested数据行， 版本号字段、子对象表字段取 nested结构数据源， 下拉数据单行 值唯一
    if (nestedFlag && !nestedOverrideFlag) {
      usedOptions = getData(
        record,
        fields.filter((n) => n !== name),
        []
      );
    }
    if (nestedFlag && nestedOverrideFlag) {
      if (name === 'ovnField') {
        usedOptions = ds.reduce((data, r) => {
          const _fields =
            r.get('nestedFlag') && r.get('nestedOverrideFlag')
              ? ['ovnField']
              : !r.get('nestedFlag')
              ? ['ovnField', 'subObjLineList']
              : [];
          if (r.index !== record.index) {
            getData(r, _fields, data);
          }
          return data;
        }, []);
      }
    }
    if (!nestedFlag) {
      usedOptions = ds.reduce((data, r) => {
        const _fields =
          r.get('nestedFlag') && r.get('nestedOverrideFlag')
            ? ['ovnField']
            : !r.get('nestedFlag')
            ? ['ovnField', 'subObjLineList']
            : [];
        if (!r.get('nestedFlag') || (r.get('nestedFlag') && r.get('nestedOverrideFlag'))) {
          // 非当前行数据
          if (r.index !== record.index) {
            getData(r, _fields, data);
          } else if (r.index === record.index) {
            // 当前行非当前列的其他下拉框字段
            getData(
              r,
              _fields.filter((n) => n !== name),
              data
            );
          }
        }
        return data;
      }, []);
    }

    // 非 nested数据行， 版本号字段、子对象表字段 取标准数据源， 下拉数据多行 该字段值唯一
    return (
      <Select
        optionsFilter={(r) => {
          return (
            !usedOptions.find((o) => String(o) === String(r.get('value'))) && r.get('type') === type
          );
        }}
      />
    );
  };

  const handleAdd = () => {
    ds.create({}, 0);
  };

  const handleDelete = useCallback(async () => {
    const savedRecords = ds.selected.filter((f) => f.get('headerId'));
    const notSaveRecords = ds.selected.filter((f) => f.status === 'add');
    ds.remove(notSaveRecords);
    if (savedRecords.length > 0) {
      const params = savedRecords.map((m) => ({
        ...m.toData(),
        nestedFieldName: m.get('nestedFieldName')?.value,
        ovnField: m.get('ovnField')?.value,
      }));
      const res = await fetchDeleteSubLine(params);
      if (getResponse(res)) {
        ds.remove(savedRecords.map((m) => Object.assign(m, { status: 'add' })));
        notification.success();
      }
    }
  }, []);

  const buttons = useMemo(
    () =>
      readOnly
        ? []
        : [
            <Observer>
              {() => (
                <Button
                  funcType="flat"
                  icon="delete"
                  color="primary"
                  disabled={ds.selected.length === 0}
                  onClick={handleDelete}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>
              )}
            </Observer>,
            <Observer>
              {() =>
                ds.dirty ? (
                  <Popconfirm
                    title={
                      ds.dirty
                        ? intl
                            .get('sads.indexcongig.view.confirm.refreshINfo')
                            .d('存在未保存数据，确认刷新吗？')
                        : ''
                    }
                    onConfirm={() => handleRefresh(true)}
                  >
                    <Button funcType="flat" color="primary" icon="refresh" loading={refreshLoading}>
                      {intl.get('sads.indexcongig.view.btn.refreshSubObject').d('刷新子对象')}
                    </Button>
                  </Popconfirm>
                ) : (
                  <Button
                    funcType="flat"
                    color="primary"
                    icon="refresh"
                    onClick={() => handleRefresh(false)}
                  >
                    {intl.get('sads.indexcongig.view.btn.refreshSubObject').d('刷新子对象')}
                  </Button>
                )
              }
            </Observer>,
            <Button funcType="flat" color="primary" icon="playlist_add" onClick={handleAdd}>
              {intl.get('hzero.common.button.add').d('新增')}
            </Button>,
          ],
    [readOnly, refreshLoading]
  );
  return (
    <Table
      dataSet={ds}
      columns={columns}
      buttons={buttons}
      style={{ marginTop: 16, maxHeight: 450 }}
    />
  );
});

export default class IndexForm extends Component {
  constructor(props) {
    super(props);
    const { modal, record } = props;
    this.headerDs = new DataSet(IndexDS());
    this.subObjectDs = new DataSet(subObjectDS(record.getState('isView'), record));
    modal.handleOk(this.handleSave);
  }

  state = {
    loading: false,
  };

  componentDidMount() {
    const { record } = this.props;
    if (record.get('indexId')) {
      this.setState({ loading: true });
      fetchDetails(record.get('indexId')).then((res) => {
        this.setState({ loading: false });
        if (getResponse(res)) {
          const { subObjectHeaderList, ...header } = res;
          this.headerDs.loadData([header]);
          // this.subObjectDs.loadData(this.handleData2Options(subObjectHeaderList));
          this.subObjectDs.loadData(subObjectHeaderList);
        }
      });
    } else this.headerDs.create({});
  }

  handleSave = async () => {
    const { dataSet, record } = this.props;
    const baseInfoFlag = await this.headerDs.validate();
    const subObjectFlag = await this.subObjectDs.validate();
    if (!baseInfoFlag || !subObjectFlag) {
      return false;
    }
    const subObjectData = this.subObjectDs.toData();
    const params = {
      ...this.headerDs.current.toJSONData(),
      subObjectHeaderList: subObjectData.map((m) => ({
        ...m,
        ovnField: isPlainObject(m.ovnField) ? m.ovnField.value : m.ovnField,
        nestedFieldName: isPlainObject(m.nestedFieldName)
          ? m.nestedFieldName.value
          : m.nestedFieldName,
        tenantId: this.isNumberNull(m.tenantId) ? record.get('tenantId') : m.tenantId,
        subObjLineList: m.subObjLineList.map((i) => {
          if (i.lineId) return i;
          return {
            tenantId: this.isNumberNull(i.tenantId) ? record.get('tenantId') : i.tenantId,
            objFieldName: i,
            headerId: m.headerId,
          };
        }),
      })),
    };
    const res = await fetchSave(params);
    if (getResponse(res)) {
      notification.success();
      dataSet.query(dataSet.currentPage);
      return true;
    }
  };

  isNumberNull = (value) => {
    // null || undefined
    return value === undefined || typeof value === 'object';
  };

  handleData2Options = (data = []) => {
    const getField = (filed, type) => ({ meaning: filed, value: filed, type });
    const singleField = ['ovnField'];
    const multipleField = ['subObjLineList'];
    return [...data].map((m) => {
      const _d = { ...m };
      const type = m.nestedFlag ? m.nestedFieldName : 'standard';
      singleField.forEach((f) => {
        if (f in m) {
          _d[f] = getField(m[f], type);
        }
      });
      multipleField.forEach((f) => {
        if (f in m) {
          _d[f] = (m[f] || []).map((i) => ({ ...i, ...getField(i.objFieldName, type) }));
        }
      });
      if ('nestedFieldName' in m) {
        _d.nestedFieldName = getField(m.nestedFieldName, 'nested');
      }
      return _d;
    });
  };

  render() {
    const { record } = this.props;
    const { loading } = this.state;
    const disabled = record.getState('isView');
    return (
      <Spin spinning={loading}>
        <Form labelLayout="float" columns={3} dataSet={this.headerDs} style={{ width: '75%' }}>
          <TextField name="indexNamePrefix" disabled={disabled} />
          <TextField name="indexNameSuffix" disabled={disabled} />
          <TextField name="indexName" disabled />
          <Lov
            name="tenantObject"
            disabled={disabled}
            onChange={() => {
              this.headerDs.current.set('companyObject', undefined);
            }}
          />
          <Lov name="companyObject" disabled={disabled} />
          <Select name="enabledFlag" disabled={disabled} />
          <Lov name="parentIndex" disabled={disabled || record.get('indexId')} />
          <TextArea name="remark" disabled={disabled} resize="vertical" rows={1} colSpan={2} />
        </Form>
        <Form
          labelLayout="float"
          columns={1}
          dataSet={this.headerDs}
          style={{ marginTop: 16, width: '75%' }}
        >
          <TextArea name="setting" disabled={disabled} resize="vertical" rows={5} />
          <TextArea name="mapping" disabled={disabled} resize="vertical" rows={5} />
        </Form>
        <SubObjectTable
          readOnly={record.getState('isView')}
          ds={this.subObjectDs}
          headerDs={this.headerDs}
        />
      </Spin>
    );
  }
}
