import React from 'react';
import uuidv4 from 'uuid/v4';
import { observer } from 'mobx-react-lite';
import { Bind } from 'lodash-decorators';
import { Tag, Alert } from 'choerodon-ui';
import { DataSet, Lov, Button, Modal, Form, TextField, CheckBox } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import HeadLine from '@/components/HeadLine';
import { saveFormData, disabledOtherData } from '@/services/ecClientService';
import c7nModal from '@/utils/c7nModal';

import { fetchInfo, updateCompanyStatus } from './api';
import { tableDs, createDs, batchDs } from './assignDs';
import './overwrite.less';

@formatterCollections({ code: ['small.ecClient', 'small.common'] })
export default class Assign extends React.Component {
  constructor(props) {
    super(props);
    const { ecClientId = '', ecTenantId = '', modal } = props;
    modal.handleOk(async () => {
       const flag = await this.handleSave();
       return !!flag;
    });
    this.state = {
      ecClientId,
      info: {},
      // selVal: 'currencyLov', // uom
      // currencyLov: null,
      // uomLov: null,
    };
    this.tableDs = new DataSet(tableDs(ecTenantId));
  }

  createDs = new DataSet(createDs);

  ds = new DataSet({
    fields: [{ name: 'ecPlatformName' }, { name: 'ecCompanyName' }],
  });

  statusRender = ({ record }) => {
    return record.status === 'add' ? (
      '-'
    ) : record.get('enabledFlag') === 0 ? (
      <Tag color="red" border={false}>
        {intl.get('hzero.common.button.disable').d('禁用')}
      </Tag>
    ) : (
      <Tag color="green" border={false}>
        {intl.get('hzero.common.button.enable').d('启用')}
      </Tag>
    );
  };

  optionRender = ({ record }) => {
    return record.status === 'add' ? (
      '-'
    ) : (
      <CheckBox defaultChecked={record.get('enabledFlag') === 1} onClick={() => this.handleUpdateStatus(record)} />
    );
  };

  componentDidMount() {
    this.fetchInfo();
    this.tableDs.setQueryParameter('ecClientId', this.state.ecClientId);
    this.tableDs.query();
  }

  @Bind()
  async fetchInfo() {
    const { ecClientId } = this.state;
    const res = await fetchInfo({ ecClientId });
    const result = getResponse(res);
    if (result) {
      this.ds.loadData([result]);
      this.setState({ info: result });
    }
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const flag = await this.tableDs.validate();
    if (flag) {
      const res = getResponse(
        await saveFormData({ ecCompanyAssignList: this.tableDs.toJSONData() })
      );
      //  this.tableDs.submit();
      if (res && res.saveFlag !== false) {
        return true;
      } else if (res && !res.failed && res.saveFlag !== true) {
        const { ecCompanyAssignList = [] } = res;
        const nameList = ecCompanyAssignList?.map(i => i.companyName);
        Modal.confirm({
          title: intl.get('small.common.model.tips').d('提示'),
          children: (
            <span>
              {nameList?.map(name => <span>【{name}】</span>)}
              {intl
                .get('small.common.model.modaltTps')
                .d('已经关联了其他账号，请确认是否更改为当前账号')}
            </span>
          ),
          onOk: async () => {
            const result = getResponse(await disabledOtherData(res));
            if (result) {
              this.tableDs.query();
            }
          },
        });
      } else if (res && res.failed) {
        notification.warning({ message: res.message });
      }
    }
    return false;
  }

  @Bind()
  async handleUpdateStatus(record) {
    const data = record.toData();
    const res = await updateCompanyStatus({
      ecCompanyAssignList: [{ ...data, enabledFlag: data.enabledFlag === 1 ? 0 : 1 }],
    });
    if (res && res.saveFlag === true) {
      this.tableDs.query();
    } else {
      const { ecCompanyAssignList = [] } = res;
      const nameList = ecCompanyAssignList?.map(i => i.companyName);
      Modal.confirm({
        title: intl.get('small.common.model.tips').d('提示'),
        children: (
          <span>
            {nameList?.map(name => <span>【{name}】</span>)}
            {intl
              .get('small.common.model.modaltTps')
              .d('已经关联了其他账号，请确认是否更改为当前账号')}
          </span>
        ),
        onOk: async () => {
          const result = getResponse(await disabledOtherData(res));
          if (result) {
            this.tableDs.query();
          }
        },
      });
    }
  }

  @Bind()
  handleCreate(records) {
    const { ecClientId } = this.state;
    this.createDs.reset();
    (records || []).map(f => {
      const staticKey = uuidv4();
      const newData = {
        ecClientId,
        staticKey,
        enabledFlag: 1,
        companyId: f.companyId,
        companyName: f.companyName,
        companyNum: f.companyNum,
      };
      this.tableDs.create(newData, 0);
      return staticKey;
    });
    // this.tableDs.forEach(record => {
    //   if (createKeys.includes(record.get('staticKey'))) {
    //     this.tableDs.select(record);
    //   }
    // });
  }

  @Bind()
  handleDelete() {
    const selectData = this.tableDs.selected;
    this.tableDs.remove(selectData.filter(f => f.status === 'add'));
  }

  @Bind()
  handleCancel() {
    this.tableDs.forEach(record => {
      record.reset();
    });
  }

  // @Bind()
  // handleChange(selVal) {
  //   this.setState({ selVal });
  // }

  @Bind()
  handleBatchUpdate() {
    const batchDS = new DataSet(batchDs());
    const sLength = this.tableDs.selected.length;
    c7nModal({
      style: { width: '380px' },
      title: intl.get('small.common.button.batchEdit').d('批量编辑'),
      children: (
        <div>
          <Alert
            message={sLength ?
              intl.get('small.ecClient.view.batchEdit.tips2', { value: sLength }).d(`已勾选${sLength}条数据进行批量编辑`)
              : intl.get('small.ecClient.view.batchEdit.tips1').d('针对全部数据进行批量编辑')}
            style={{
              position: 'relative',
              left: '-20px',
              top: '-20px',
              width: 'calc(100% + 40px)',
            }}
            type="info"
            showIcon
            closable
            banner
          />
          <Form dataSet={batchDS} labelLayout="float">
            <Lov name="currencyLov" />
            <Lov name="uomLov" />
            <Lov name="itemLov" />
          </Form>
        </div>
      ),
      onOk: () => {
        const currencyLov = batchDS.current?.get('currencyLov');
        const uomLov = batchDS.current?.get('uomLov');
        const itemLov = batchDS.current?.get('itemLov');
        const selectData = (sLength ? this.tableDs.selected : this.tableDs.data) || [];
        selectData.forEach(record => {
          if (itemLov) {
            record.set('itemLov', itemLov);
          }
          if (currencyLov) {
            record.set('currencyLov', currencyLov);
          }
          if (uomLov) {
            record.set('uomLov', uomLov);
          }
        });
      },
      okText: intl.get('small.common.button.save').d('保存'),
    });
  }

  render() {
    const { info } = this.state;
    const fields = [
      {
        name: 'ecPlatformName',
        label: intl.get('small.common.model.ecPlatformName').d('电商名称'),
      },
      {
        name: 'ecCompanyName',
        label: intl.get('small.common.model.ecCompanyName').d('电商公司名称'),
      },
    ];
    const columns = [
      {
        name: 'companyLov',
        width: 150,
        editor: true,
      },
      {
        name: 'companyName',
        minWidth: 150,
      },
      {
        name: 'emailLov',
        width: 200,
        editor: true,
        filter: info?.interfaceType !== 'PO',
      },
      {
        name: 'addressCode',
        minWidth: 150,
        editor: true,
      },
      {
        name: 'currencyLov',
        width: 150,
        editor: true,
      },
      {
        name: 'uomLov',
        width: 150,
        editor: true,
      },
      {
        name: 'itemLov',
        width: 150,
        editor: true,
      },
      {
        name: 'enabledFlag',
        width: 80,
        lock: 'right',
        renderer: this.optionRender,
      },
    ].filter(i => i.filter !== true);
    const createBtn = (
      <Lov
        dataSet={this.createDs}
        name="companyLov"
        mode="button"
        color="primary"
        funcType="flat"
        icon="playlist_add"
        onChange={this.handleCreate}
        clearButton={false}
      >
        {intl.get('small.common.view.button.newBuild').d('新增')}
      </Lov>
    );
    const DelButton = observer(({ dataSet }) => {
      const hasCreateData = dataSet.selected.some(s => s.status === 'add');
      return (
        <Button
          disabled={!hasCreateData}
          funcType="flat"
          color="primary"
          icon="delete_sweep"
          onClick={this.handleDelete}
        >
          {intl.get('small.common.model.batchDelete').d('批量删除')}
        </Button>
      );
    });
    const BatButton = observer(({ dataSet }) => {
      return (
        <Button
          onClick={this.handleBatchUpdate}
          funcType="flat"
          color="primary"
          icon="mode_edit"
          disabled={dataSet.data.length < 1}
        >
          {!dataSet.selected.length ? intl.get('small.common.button.batchEdit').d('批量编辑') : intl.get('small.common.button.selectBatchEdit').d('勾选批量编辑')}
        </Button>
      );
    });

    // const lovBtn = (
    //   <Lov
    //     dataSet={this.batchDs}
    //     name={selVal || ''}
    //     placeholder={intl.get('small.common.view.pleaseChoose').d('请选择')}
    //     onChange={(item) => {
    //       this.setState({ [selVal]: item });
    //     }}
    //   />
    // );
    const buttons = [
      createBtn,
      <BatButton dataSet={this.tableDs} />,
      <DelButton dataSet={this.tableDs} />,
      // <Button funcType="flat" color="primary" icon="undo" onClick={this.handleCancel}>
      //   {intl.get('hzero.common.button.cancel').d('取消')}
      // </Button>,
      // <Select
      //   value={selVal}
      //   onChange={this.handleChange}
      //   style={{ width: 110, marginRight: 8 }}
      //   clearButton={false}
      // >
      //   <Select.Option value="currencyLov">
      //     {intl.get('small.ecClient.view.defaultCurrency').d('默认币种')}
      //   </Select.Option>
      //   <Select.Option value="uomLov">
      //     {intl.get('small.ecClient.view.defaultUom').d('默认计量单位')}
      //   </Select.Option>
      // </Select>,
      // lovBtn,
    ];

    return (
      <React.Fragment>
        <div style={{ marginBottom: '32px' }}>
          <HeadLine title={intl.get('small.common.view.title.baseInfo').d('基础信息')} />
          <Form
            labelLayout="float"
            dataSet={this.ds}
            columns={3}
            className="c7n-pro-vertical-form-display"
          >
            {fields.map(m => {
              return <TextField {...m} disabled />;
            })}
          </Form>
        </div>
        <HeadLine title={intl.get('small.ecClient.view.ecClient.assignmentSet').d('分配设置')} />
        <SearchBarTable
          dataSet={this.tableDs}
          columns={columns}
          buttons={buttons}
          style={{ maxHeight: 'calc(100vh - 320px)' }}
          searchBarConfig={{
            closeFilterSelector: true,
          }}
          searchCode="SMAL.EC_CLIENT.COMPANY"
          customizedCode="SMAL.EC_CLIENT.COMPANY.SELECT"
        />
      </React.Fragment>
    );
  }
}
