/**
 * index.js 收货管理配置-新
 * @date: 2022-11-14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React, { useMemo, useState, useEffect } from 'react';
import { DataSet, Icon, TextField, IntlField, Modal, Select, Lov, Output, Button, Spin, Form, Table, CheckBox } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
// import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import qs from 'querystring';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { TableBoxSizing, SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections.js';
import { yesOrNoRender } from 'hzero-front/lib/utils/renderer.js';

import noData from '@/assets/noAutoConfig.svg';
import {
  delInventoryLine,
  savePermissonModal,
  saveInventoryList,
  delInventoryList,
} from '@/services/inventoryManageService';
import ReturnCard from '@/routes/InventoryManageConfig/components/ReturnCard';

import { ConfigDataSet } from './store/lineFlowDS';
import { WeekDataSet } from './store/weekDataSet';
import { HeaderDetailDataSet } from './store/headerDS';
// import { AutoDataSet } from '../Add/store/configDs';
import WeekTotalConfig from '../Add/WeekTotalConfig';
import AutoOrderConfig from '../Add/AutoOrderConfig';
import PermissionComp from '../Add/PermissionComp';
import PermissionCompDs from '../Add/store/permissionCompDs';


import './index.less';

interface BtnProps {
  dataSet?: DataSet;
  selected?: any,
}

interface searchParams {
  history?: any,
  edit?: number | string;
  onback?: number | string;
  create?: number | string;
  processFactory?: number | string;
  strategyHeaderId?: number | string;
}



const Detail = (props) => {
  const { location = {}, history } = props;
  const { search } = location || {};
  const {processFactory, strategyHeaderId, create, edit, onback}:searchParams = qs.parse(search?.substr(1));

  // const operateRef = useRef(null);
  const processFactoryType = processFactory === "0" || processFactory === "2"; // 调拨或普通
  const editorFlag = useMemo(()=>String(edit) === "1", [edit]);
  const HeaderDetailDs = useMemo(() => new DataSet(HeaderDetailDataSet(create)), []);
  const configDs = useMemo(() => new DataSet(ConfigDataSet()), []);
  const WeekDs = useMemo(() => new DataSet(WeekDataSet()), []);
  const PermissionCompDS = useMemo(() => new DataSet(PermissionCompDs()), []);
  // const AutoDs = useMemo(() => new DataSet(AutoDataSet()), []); 
  configDs.setState('processFactory', Number(processFactory));
  const [isFlag, setIsFlag] = useState(false);
  const [loading, setLoading] = useState(false);

  const TextCmps = String(edit) ==="0" ? Output: TextField;
  const IntlCmps = String(edit) ==="0" ? Output: IntlField;
  const SelCmps = String(edit) ==="0" ? Output: Select;
  const LovCmps = String(edit) === "0" ? Output : Lov;


  useEffect(() => {
    if (strategyHeaderId) {
      queryDataList();
    };
  }, [strategyHeaderId]);

  const queryDataList = () => {
    try {
      setLoading(true);
        HeaderDetailDs.setQueryParameter('params', {
          strategyHeaderId
        });
        HeaderDetailDs.query().then(res => {
          setIsFlag(res.cycleAuto);
        });
      configDs.setQueryParameter('params', {
        strategyHeaderId
      });
      configDs.query();
      if (processFactory === "1") {
        WeekDs.setQueryParameter('strategyHeaderId', strategyHeaderId);
        WeekDs.query();
      }
    } finally {
      setLoading(false);
    }
  };


  const handleDel = async (dataSet) => {
    const params = dataSet.selected.map((i) => i.toJSONData()).filter((i) => i.strategyLineId);
    if (params.length > 0) {
      Modal.confirm({
        contentStyle: { width: '550px' },
        title: intl.get('sinv.inventory.model.view.help').d('提示'),
        children: (
          <div>
            <p>{intl.get('sinv.inventory.model.view.orderDelete').d(`确认删除选中行？`)}</p>
          </div>
        ),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: async () => {
          const res = await delInventoryLine(params);
          if (getResponse(res)) {
            (notification as any).success();
            configDs.setQueryParameter('strategyHeaderId', strategyHeaderId);
            configDs.query();
            configDs.remove(configDs.selected, true);
          }
        },
      });
    } else {
      configDs.remove(configDs.selected, true);
    }
  };

  const handleAdd = () => {
    configDs.create({ processFactory }, 0);
  };

  const handleChange = (value) => {
    setIsFlag(!isFlag);
    // AutoDs.map((i) => i.set('cycleAuto', value));
    HeaderDetailDs?.current?.set('cycleAuto', value);
  };


  const handleSaveInfo = async () => {
    const basicFlag = await HeaderDetailDs.validate();
    const lineflag = await configDs.validate();
    const weekflag = await WeekDs.validate();
    if (String(create) === "1" &&basicFlag) {
      const params = {
        ...HeaderDetailDs?.current?.toData(),
        tenantId: getCurrentOrganizationId(),
        enableFlag: 1,
      };
      try {
        setLoading(true);
        const result = await saveInventoryList(params);
        if (getResponse(result)) {
          (notification as any).success();
          history.push({
            pathname: '/sinv/inventoryManageConfig/detail',
            search: `strategyHeaderId=${result.strategyHeaderId}&processFactory=${result.processFactory}&edit=1&onback=1`,
          });
        };
      } finally {
        setLoading(false);
      }
    } else if (String(create) !== "1") {
      const params = {
        ...HeaderDetailDs?.current?.toData(),
        stockOutStrategyLines: configDs.map((i) => i.toJSONData()).map((x) => ({
          ...x,
          strategyHeaderId,
          tenantId: getCurrentOrganizationId(),
        })),
        stockOutStockMappingList:
          processFactory === "1"
            ? WeekDs.map((i) => i.toJSONData()).map((x) => ({
                ...x,
                strategyHeaderId,
                tenantId: getCurrentOrganizationId(),
              }))
            : [],
        // ...AutoDs.map((i) => i.toJSONData())?.[0],
      };
      if (processFactory === "1" && basicFlag && lineflag && weekflag) {
        try {
          setLoading(true);
          const result = await saveInventoryList(params);
          if (getResponse(result)) {
            (notification as any).success();
            queryDataList();
          };
        } finally {
          setLoading(false);
        }
      } else if(processFactory !== "1" && basicFlag && lineflag){
        try {
          setLoading(true);
          const result = await saveInventoryList(params);
          if (getResponse(result)) {
            (notification as any).success();
            queryDataList();
          };
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleDeleteInfo = () => {
    const params = {
      ...HeaderDetailDs?.current?.toData(),
      tenantId: getCurrentOrganizationId(),
    };
    Modal.confirm({
      contentStyle: { width: '550px' },
      title: intl.get('sinv.inventory.model.view.help').d('提示'),
      children: (
        <div>
          <p>{intl.get('sinv.inventory.model.view.detailDeleteDisposition').d(`确认删除当前配置？`)}</p>
        </div>
      ),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: async () => {
        setLoading(true);
        delInventoryList([params]).then((res) => {
            if (getResponse(res)) {
              (notification as any).success();
              history.push({
                pathname: `/sinv/inventoryManageConfig/list`,
              })
            }
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
  }

  // 公共关闭弹框function
  const closeModal = (modal) => {
    modal.close();
  };


  // 权限维护
  const openModal = () => {
    const paramsProps = { tableDs: PermissionCompDS, strategyHeaderId, editorFlag };
   const modalRef = Modal.open({
      mask: true,
      drawer: true,
      closable: true,
      resizable: true,
      style: { width: 742 },
      title: intl.get('slod.shipmentsConfiguration.model.queryOperate').d('操作/查询权限角色维护'),
      children: <PermissionComp  {...paramsProps} />,
      footer: () => {
        if (edit !=="1") {
          return (
            <Button color={ButtonColor.primary} onClick={() => closeModal(modalRef)}>
              {intl.get(`slod.shipmentsConfiguration.view.title.detail.off`).d('关闭')}
            </Button>
          );
        }
        return (
          <>
            <Button color={ButtonColor.primary} onClick={() => onSaveQueryOperateChange()}>
              {intl.get(`hzero.common.button.sure`).d('确定')}
            </Button>
            <Button onClick={() => closeModal(modalRef)}>
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </Button>
          </>
        );
      },
    });
  };

  const onSaveQueryOperateChange = async () => {
    const data = PermissionCompDS.toData();
    const params = { strategyHeaderId, data };
    const flag = await PermissionCompDS.validate();
    if (flag) {
      const res = await savePermissonModal(params);
      if (getResponse(res)) {
        (notification as any).success();
        PermissionCompDS.query();
      }
    }
  };

  // 编辑
  const onEditClick = (edit) => {
    history.push({
      pathname: `/sinv/inventoryManageConfig/detail`,
      search: `?strategyHeaderId=${strategyHeaderId}&processFactory=${processFactory}&edit=${edit}`,
    });
    setTimeout(() => queryDataList(), 200);
  }


  const getColumns = (): Array<Object> => {
    const columns = [
      {
        name: 'createCampCode',
        align: 'left',
        // width: 100,
        editor: editorFlag,
      },
      {
        name: 'sourceCode',
        // width: 120,
        editor: editorFlag,
        // editor: (record) => (
        //   <Select
        //     onOption={({ record: r }) => {
        //       const createCampCodeFlag = record.get('createCampCode') === 'SUPPLIER';
        //       const disabled = createCampCodeFlag && r.get('value') === 'EXTERNAL_SYSTEM';
        //       return { disabled };
        //     }}
        //   />
        // ),
      },
      {
        name: 'submitConfirm',
        // width: 120,
        fixed: 'left',
        editor: editorFlag,
        // editor: (record) => (
        //   <Select
        //     onOption={({ record: r }) => {
        //       const createCampCodeFlag = record.get('createCampCode') === 'SUPPLIER';
        //       const disabled = createCampCodeFlag && ['SUPPLIER_CONFIRM'].includes(r.get('value'));
        //       return { disabled };
        //     }}
        //   />
        // ),
      },

      processFactory === "0" && {
        name: 'supplierNeedConfirm',
        width: 140,
        editor: editorFlag,
        renderer: ({value}) => !editorFlag && yesOrNoRender(+value),
      },
      processFactory !== "1"&& {
        name: 'supplierShippedConfirm',
        width: 140,
        editor: editorFlag,
        header:
          processFactory === "0"
            ? intl
                .get(`sinv.inventoryBench.model.view.zeroSupplierShippedConfirms`)
                .d('调入供应商收货确认')
            : intl
                .get(`sinv.inventoryBench.model.view.supplierShippedConfirms`)
              .d('供应商收货确认'),
        renderer: ({value}) => !editorFlag && yesOrNoRender(+value),
      },
      processFactory === "0" && {
        name: 'purchaseReview',
        width: 120,
        editor: editorFlag,
        renderer: ({value}) => !editorFlag && yesOrNoRender(+value),
      },
      (processFactory === "0" || processFactory === "2") && {
        name: 'rejectExportStatus',
        width: 130,
        editor: editorFlag,
      },
      {
        name: 'exportFlag',
        width: 130,
        editor: editorFlag,
        renderer: ({value}) => !editorFlag && yesOrNoRender(+value),
      },
      processFactoryType && {
        name: 'exportUpdate',
        width: 130,
        align: 'left',
        editor: editorFlag,
      },

      processFactoryType && {
        name: 'exportUpdateStatus',
        width: 130,
        editor: editorFlag,
      },

      processFactoryType && {
        name: 'exportSubmitStatus',
        width: 170,
        editor: editorFlag,
      },

      processFactoryType && {
        name: 'exportCancel',
        width: 130,
        align: 'left',
        editor: editorFlag,
      },
      processFactoryType && {
        name: 'exportCancelStatus',
        width: 130,
        editor: editorFlag,
      },
    ];
    return columns.filter(Boolean);
    // return columns;
  };


   /**
     * 收货管理配置 - 行按钮
     * @delivery {*} params
     * return element
   */
   const buttons = (ds) => {
    const Buttons = observer((propsParam: BtnProps): any => {
      const { dataSet } = propsParam;
      const selected = dataSet?.selected.map((item: any) => item.toData());
      const btns = [
        <>
          <Button
            icon="playlist_add"
            funcType={FuncType.flat}
            color={ButtonColor.primary}
            // loading={btnLoading}
            onClick={()=>handleAdd()}
          >
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>
          <Button
            icon="delete_sweep"
            funcType={FuncType.flat}
            color={ButtonColor.primary}
            disabled={isEmpty(selected)}
            // loading={btnLoading}
            onClick={() => handleDel(dataSet)}
          >
            {intl.get('hzero.common.button.batchDelete').d('批量删除')}
          </Button>
        </>,
      ];
      return btns;
    });
    return editorFlag ? [<Buttons dataSet={ds} />] :[];
   };
  
  const FormCmp = observer(({dataSet}: any) => {
    return (
      <Content className={!create && 'content-marg-header'}>
        <div>
          <h3 className='page-title'>
            {intl.get('sinv.inventoryBench.model.view.createProcessConfiguration').d('基本信息')}
          </h3>
        </div>
        <Form className='form-title' useWidthPercent labelLayout={LabelLayout.float} columns={3} dataSet={dataSet}>
          <TextCmps name="strategyCode" />
          <IntlCmps name="strategyName" />
          <SelCmps name="processFactory" />
          <LovCmps name="cuszDocTmplCodeObj" />
          <LovCmps name="codeRuleLov" />
          <TextCmps name="creationName" disabled />
          <Output
            name="per"
            hidden={create ==="1"}
            renderer={() => (
              <>
                <Button
                  onClick={openModal}
                  // icon="assignment_ind"
                  color={ButtonColor.primary}
                  funcType={FuncType.link}
                >
                  {edit !== '1'
                    ? intl.get('hzero.common.button.look').d('查看')
                    : intl.get('hzero.common.view.button.edit').d('编辑')}
                </Button>
              </>
            )}
          />
        </Form>
      </Content>
    );
  });

  const pathUrl = '/sinv/inventoryManageConfig/list';
    return (
      <>
        <div className="header-style">
        {edit === "1" && !onback && <div>
          <div className="back-style">
            <Tooltip
              title={intl.get('hzero.common.button.back').d('返回')}
              placement="bottom"
              // getTooltipContainer={(that) => that}
            >
              <div onClick={()=>onEditClick("0")} className='back-style-dev'>
              <Icon type="arrow_back" className="back-style-icon" />
              </div>
            </Tooltip>
          </div>
        </div>}
        <Header
          className={edit === "0" && 'header-style-box'}
          title={intl.get(`sinv.common.model.common.InventoryDetail`).d('委外协同类型明细')}
          backPath={create? pathUrl : edit === "0" ? pathUrl : onback && pathUrl}
        >
          <>
            {(edit === "1" || create) && (
              <Button
                icon="save"
                color={ButtonColor.primary}
              // funcType={FuncType.flat}
                onClick={handleSaveInfo}
                loading={loading}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            )}
            {!create && edit === "1" && (
              <Button
                icon="delete"
              funcType={FuncType.flat}
                onClick={handleDeleteInfo}
                loading={loading}
              >
                {intl.get(`hzero.common.button.delete`).d('删除')}
              </Button>
            )}
            {!create && edit !== "1" && (
              <Button
                icon="mode_edit"
                color={ButtonColor.primary}
              // funcType={FuncType.flat}
                onClick={()=>onEditClick("1")}
                loading={loading}
              >
                {intl.get('hzero.common.view.button.edit').d('编辑')}
              </Button>
            )}
          </>
        </Header>
        </div>
        {create && <FormCmp dataSet={HeaderDetailDs} />}
       {!create && <div className='content-auto'>
          <Spin spinning={loading}>
          <FormCmp dataSet={HeaderDetailDs} />
          {strategyHeaderId && (
              <Content className={
                String(processFactory) === "1"
                  ? 'content-marg' : edit === '1'
                    ? 'content-marg height_sett'
                    :'content-marg height_sett_readonly'
                    }>
              <div>
                <h3 className='page-title'>
                  {intl.get('sinv.inventoryBench.model.view.automaticConfiguration').d('业务流程配置')}
                </h3>
              </div>
                    <Table
                        customizable
                        dataSet={configDs}
                        columns={getColumns()}
                        buttons={buttons(configDs)}
                        boxSizing={TableBoxSizing.wrapper}
                        style={{ maxHeight: 530 }}
                        selectionMode={editorFlag ? SelectionMode.rowbox : SelectionMode.none}
                        customizedCode="new-strategy-receiptManageConfig-workbench"
                      />
            </Content>
          )}
          {String(processFactory) === "1" &&(
          <Content className='content-marg'>
            <div>
              <h3 className='page-title'>
                {intl
          .get('sinv.inventoryBench.model.view.supplierProcessConfiguration')
          .d('发料/消耗周期类汇总类型配置')}
              </h3>
            </div>
            <Form style={{marginBottom: String(edit) ==="0"? '16px' : 0}} labelLayout={LabelLayout.float} columns={3} dataSet={HeaderDetailDs}>
                <SelCmps colSpan={2} name="cycleDimension" />
            </Form>
            <WeekTotalConfig WeekDs={WeekDs} strategyHeaderId={strategyHeaderId} editFlag={editorFlag} />
          </Content>
          )}
          {String(processFactory) === "1" &&(
            <Content className='content-marg'>
              <div className='return-tit'>
                <h3 className='page-title'>
                  {intl.get('sinv.inventoryBench.model.view.auto').d('自动生单配置')}
                </h3>
                <div className='check-box-return'>
                  {String(edit) === "1" && (
                      <CheckBox checked={isFlag} onChange={handleChange}>
                        {intl.get(`sinv.inventoryBench.model.view.cycleAuto`).d('按周期时间自动生成')}
                      </CheckBox>
                  )}
                </div>
              </div>
              {isFlag
                ? (<AutoOrderConfig AutoDs={HeaderDetailDs} editFlag={editorFlag} />)
                : (
                  <div className='noData'>
                      {/* <img src={noData} alt="img" /> */}
                      <ReturnCard />
                    <h3 className='tip'>
                      { String(edit) ==="0" ? intl.get(`sinv.inventoryBench.model.view.noOpen`).d('未启用'): intl.get(`sinv.inventoryBench.model.view.configQuery`).d('请勾选启用此配置')}
                    </h3>
                  </div>
              )}
            </Content>
          )}
          </Spin>
        </div>}
      </>
    );
};


export default formatterCollections({
  code: [
    'sinv.common',
    'hzero.common',
    'sinv.inventory',
    'sinv.inventoryBench',
    "slod.deliveryWorkbench",
    'slod.shipmentsConfiguration',
  ],
})(Detail);
