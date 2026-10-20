import React, { useMemo, useRef } from 'react';
import { useDataSet, Modal, Select, DateTimePicker, Form, } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isEmpty, isNil } from 'lodash';
import { runInAction } from 'mobx';

import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import intl from 'utils/intl';
import FilterBarTable from '_components/FilterBarTable';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';
import {
  orgInfoChangeSubmit,
  orgInfoChangeSave,
  orgInfoChangeGetAddData,
} from '@/services/ssrc/orgInfoChangeService';

import { tableDS, batchEditDS, batchUpdateDataSet, } from './indexDS';
import BatchEdit from './BatchEdit';

const OrgInfoChange = () => {
  const tableDs = useDataSet(() => tableDS(), []);
  const batchEditDs = useDataSet(() => batchEditDS(), []);
  const searchRef = useRef();
  let modal;

  const batchUpdateDs = useDataSet(() => batchUpdateDataSet(), []);

  // 获取提交和保存数据
  const getSaveOrSubmitData = async (options = {}) => {
    const { submitFlag, saveFlag } = options || {};
    const { selected } = tableDs;

    let validateFlag = true;
    const validateList = []; // 勾选校验的list
    const queryParams = searchRef.current?.getQueryParameter() || {};

    if (saveFlag) {
      tableDs.forEach((record) => {
        if (!record) {
          return;
        }

        record.set('status', 'update');
      });

      validateFlag = await tableDs.validate();
    }

    if (submitFlag && selected.length) {
      selected.forEach((record) => {
        if (!record) {
          return;
        }
        validateList.push(record.validate());
      });

      validateFlag = await Promise.all(validateList).then((res) => res.every((item) => item));

      const selectData = selected.map((item) => item.toJSONData()) || [];
      return {
        ...queryParams,
        skgfLines: selectData,
        validateFlag,
      };
    }

    const updateData = tableDs?.toData()?.filter((item) => item.updateFlag === 1);
    return {
      ...queryParams,
      skgfLines: updateData,
      validateFlag,
    };
  };

  // 提交
  const handleSubmit = async () => {
    const params = await getSaveOrSubmitData({ submitFlag: 1, });
    const { validateFlag } = params || {};
    if (!validateFlag) {
      return;
    }

    const res = await orgInfoChangeSubmit(params);
    if (getResponse(res)) {
      notification.success();
      tableDs.reset();
      tableDs.unSelectAll();
      tableDs.query();
    }
  };

  // 保存
  const handleSave = async () => {
    const params = await getSaveOrSubmitData({ saveFlag: 1, });
    const { validateFlag } = params || {};
    if (!validateFlag) {
      return;
    }

    const res = await orgInfoChangeSave(params);
    if (getResponse(res)) {
      notification.success();
      tableDs.reset();
      tableDs.unSelectAll();
      tableDs.query();
    }
  };

  // 再次确定
  const handleOk = async () => {
    const { selected } = tableDs;
    const selectData = selected.map((item) => item.toJSONData()) || [];
    const queryParams = searchRef.current?.getQueryParameter() || {};

    const { current } = batchEditDs || {};
    if (!current) {
      return false;
    }

    current.set('status', 'update');
    const formValidate = await batchEditDs.validate();
    if (!formValidate) {
      return false;
    }

    const res = await orgInfoChangeSave({
      ...queryParams,
      batchEditDto: { ...(batchEditDs?.current?.toData() || {}) },
      skgfLines: selected?.length ? selectData : [],
    });
    if (getResponse(res)) {
      notification.success();
      tableDs.reset();
      tableDs.unSelectAll();
      tableDs.query();
      batchEditDs.reset();
      modal.close();
      return true;
    } else {
      return false;
    }
  };

  const validateBatchForm = async () => {
    const { current } = batchEditDs || {};
    if (!current) {
      return false;
    }

    current.set('status', 'update');
    const formValidate = await batchEditDs.validate();
    return formValidate;
  };

  // 获取ds字段值
  const handleFormDSFieldsValue = () => {
    const { current, fields } = batchEditDs || {};
    const data = {};
    const dsAllFields = fields.toJS(); // ds all fields

    for (const [index] of dsAllFields) {
      const dsCurrentFiels = batchEditDs.getField(index);
      if (!dsCurrentFiels) {
        return;
      }
  
      const { type, name } = dsCurrentFiels;
      const currentFieldValue = current?.get(name);
      const isValueExist = !isNil(currentFieldValue);
  
      const lovValueFlag = type === 'object' && isValueExist && !isEmpty(currentFieldValue);
      if (lovValueFlag) {
        const currentTextField = dsCurrentFiels.get('textField');
        const currentValueField = dsCurrentFiels.get('valueField');
  
        const standardFields = ['expandCompany', 'expandInvOrganization']; // 批量多选字段：暂且处理 【拓展公司】、【拓展库存组织】
        const lovValue = currentFieldValue[currentValueField];
        const lovText = currentFieldValue[currentTextField];
        const lovMultipleFieldsFlag = dsCurrentFiels.get('multiple') && standardFields && !isNil(dsCurrentFiels);
        const lovAnyValueExistFlag = !isNil(lovValue) || !isNil(lovText);
        if (lovMultipleFieldsFlag) {
          data[name] = (currentFieldValue || []).map(i => ({
            [currentValueField]: i[currentValueField],
            [currentTextField]: i[currentTextField],
          }));
        } else if (lovAnyValueExistFlag) {
          data[name] = {
            ...currentFieldValue,
            [currentValueField]: lovValue,
            [currentTextField]: lovText,
          };
        }
      }
  
      if (type !== 'object' && isValueExist) {
        data[name] = currentFieldValue;
      }
    }

    return data;
  };

  const batchUpdateLines = ({ currentData }) => {
    const { selected } = tableDs;
    if (isEmpty(currentData) || !selected?.length) {
      // 批量维护表单数据
      return;
    }

    runInAction(() => {
      selected.forEach((record = {}) => {
        if (record) {
          record.set(currentData);
        }
      });
    });
  }

  // 确认
  const handleConfirm = async () => {
    const formValidate = await validateBatchForm();
    if (!formValidate) {
      return false;
    }

    const currentData = handleFormDSFieldsValue();

    await batchUpdateLines({
      currentData,
    });

    await handleCancel();

    // Modal.confirm({
    //   title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
    //   children: intl
    //     .get(`ssrc.orgInfoChange.view.message.batchUpdate`)
    //     .d('请确认是否将已维护的字段值进行批量更新'),
    //   onOk: handleOk,
    // });
    // return false;
  };

  // 取消
  const handleCancel = () => {
    batchEditDs.reset();
  };

  // 获取批量编辑初始化数据
  const getBatchEditInitData = () => {
    const queryParams = searchRef.current?.queryDs?.toData()?.[0] || {};
    const neededKeys = [
      'companyId',
      'ouId',
      'purOrganizationId',
      'purchaserId',
      'invOrganizationId',
      'inventoryId',
      'locationId',
      'receivingContactName',
      'receivingMobile',
      'address',
      'expandCompany',
      'expandInvOrganization',
    ];
    const filteredObj = neededKeys.reduce((acc, key) => {
      if (key in queryParams) {
        acc[key] = queryParams[key]; // 将需要的属性复制到新对象
      }
      return acc;
    }, {});
    return filteredObj;
  };

  // 批量编辑
  const handleEdit = () => {
    const Props = {
      tableDs,
      dataSet: batchEditDs,
      initData: getBatchEditInitData(),
    };

    modal = Modal.open({
      drawer: true,
      destroyOnClose: true,
      key: 'spfm-org-info-change',
      title: intl.get(`ssrc.inquiryHall.view.title.batchEdit`).d('批量编辑'),
      children: <BatchEdit {...Props} />,
      style: { width: '380px' },
      closable: true,
      onOk: handleConfirm,
      onCancel: handleCancel,
    });
  };

  const handleGetAddDataOk = async () => {
    const { current } = batchUpdateDs || {};
    if (!current) {
      return false;
    }

    current.set('status', 'update');
    const validateFlag = await batchUpdateDs.validate();
    if (!validateFlag) {
      return false;
    }

    const data = current.toData();

    const res = await orgInfoChangeGetAddData(data);
    if (getResponse(res)) {
      notification.success();
      tableDs.query();
    } else {
      return false;
    }
  };

  const handleGetAddDataClose = () => {
    if (batchUpdateDs) {
      batchUpdateDs.reset();
    }
  };

  // 获取增量数据
  const handleGetAddData = async () => {
    if (!batchUpdateDs?.current) {
      batchEditDs.create({}, 0);
    }

    Modal.open({
      drawer: true,
      destroyOnClose: true,
      key: 'spfm-org-batch-update',
      title: intl.get('ssrc.orgInfoChange.model.orgInfoChange.getAddData').d('获取增量数据'),
      children: (
        <Form columns={1} labelLayout="float" dataSet={batchUpdateDs}>
          <Select name="sourceTypes" clearButton={false} />
          <DateTimePicker name="dateFrom" />
          <DateTimePicker name="dateTo" />
        </Form>
      ),
      style: { width: '380px' },
      closable: true,
      onOk: handleGetAddDataOk,
      onCancel: handleGetAddDataClose,
    });
  };

  // 按钮组
  const getButtons = () => {
    return [
      {
        name: 'submit',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.submit').d('提交'),
        btnProps: {
          onClick: handleSubmit,
          icon: 'check',
          color: 'primary',
          disabled: !tableDs?.selected?.length,
        },
      },
      // {
      //   name: 'save',
      //   btnType: 'c7n-pro',
      //   child: intl.get('hzero.common.button.save').d('保存'),
      //   btnProps: {
      //     onClick: handleSave,
      //     icon: 'save',
      //     funcType: 'flat',
      //     disabled: !tableDs?.length,
      //   },
      // },
      {
        name: 'batchEdit',
        btnType: 'c7n-pro',
        child: intl.get('ssrc.inquiryHall.model.inquiryHall.batchMaintenance').d('批量维护'),
        btnProps: {
          onClick: handleEdit,
          icon: 'mode_edit',
          funcType: 'flat',
          disabled: !tableDs?.selected?.length,
        },
      },
      {
        name: 'getAddData',
        btnType: 'c7n-pro',
        child: intl.get('ssrc.orgInfoChange.model.orgInfoChange.getAddData').d('获取增量数据'),
        btnProps: {
          onClick: handleGetAddData,
          icon: 'downloading',
          funcType: 'flat',
        },
      },
    ];
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'sourceNum',
        width: 140,
      },
      {
        name: 'sourceLineNum',
        width: 80,
      },
      {
        name: 'companyId',
        width: 200,
        editor: true,
      },
      {
        name: 'ouId',
        width: 200,
        editor: true,
      },
      {
        name: 'purOrganizationId',
        width: 200,
        editor: true,
      },
      {
        name: 'purchaserId',
        width: 220,
        editor: true,
      },
      {
        name: 'invOrganizationId',
        width: 220,
        editor: true,
      },
      {
        name: 'inventoryId',
        width: 220,
        editor: true,
      },
      {
        name: 'locationId',
        width: 220,
        editor: true,
      },
      {
        name: 'receivingContactName',
        width: 220,
        editor: true,
      },
      {
        name: 'receivingMobile',
        width: 150,
        editor: true,
      },
      {
        name: 'address',
        width: 150,
        editor: true,
      },
      {
        name: 'expandCompany',
        width: 150,
        editor: true,
      },
      {
        name: 'expandInvOrganization',
        width: 150,
        editor: true,
      },
      {
        name: 'sourceTypeMeaning',
        width: 120,
      },
      {
        name: 'changeStatusMeaning',
        width: 120,
      },
      {
        name: 'changeInfo',
      },
    ];
  }, []);

  // 筛选器宽回调事件
  const handleChange = (ds, value) => {
    const searchValue = value
      ? value.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',')
      : undefined;
    tableDs.setQueryParameter('companyNameOrOuName', searchValue);
  };

  // 左边多选框渲染
  const leftInput = (ds) => {
    return (
      <MutlTextFieldSearch
        searchBarDS={ds}
        name="companyNameOrOuName"
        placeholder={intl
          .get('ssrc.orgInfoChange.model.orgInfoChange.inputMultiRfxNumOrTitle')
          .d('改为输入公司或者业务实体查询')}
        onChange={handleChange}
      />
    );
  };

  const clearQueryParameter = () => {
    tableDs.setQueryParameter('companyNameOrOuName', '');
  };

  return (
    <React.Fragment>
      <Header
        title={intl.get('ssrc.orgInfoChange.view.message.title.orgInfoChange').d('组织信息变更')}
      >
        <DynamicButtons buttons={getButtons()} />
      </Header>
      <Content>
        <FilterBarTable
          cacheState
          filterBarRef={(ref) => {
            searchRef.current = ref;
          }}
          dataSet={tableDs}
          columns={columns}
          style={{ maxHeight: 'calc(100vh - 190px)' }}
          filterBarConfig={{
            cacheKey: 'spfm_ssrc_orginfochange_filter_cux',
            // left: {
            //   render: (_, ds) => leftInput(ds),
            // },
            onReset: clearQueryParameter,
            onClear: clearQueryParameter,
            onFieldChange: () => {
              tableDs.clearCachedRecords();
              tableDs.unSelectAll();
              tableDs.clearCachedSelected();
            },
          }}
        />
      </Content>
    </React.Fragment>
  );
};

export default formatterCollections({
  code: ['ssrc.orgInfoChange', 'ssrc.inquiryHall', 'ssrc.common', 'ssrc.filterBar'],
})(observer(OrgInfoChange));
