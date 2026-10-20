import React, { useEffect, useRef, useMemo, useState, useContext } from 'react';
import { DataSet, Tooltip } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import { isEmpty } from 'lodash';
import { isTenantRoleLevel } from 'utils/utils';

import ImgIcon from '@/utils/ImgIcon';
import Modal from '@/components/LowcodeModal';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import { batchGenerationModelService } from '@/services/modelBaseService';
import Store, { IBaseTableList } from '@/routes/Modeler/BasicTable/stores';

import RightMenuDs from './BatchModalFrame/store/rightTableDs';
import BatchModalFrame from './BatchModalFrame';
import BatchResults from './BatchResults';
import styles from '../index.less';

// 静态数据
const batcheModalKey = Modal.key();
interface IProps {
  children?: React.ReactElement;
  footer?: (btnOk: React.ReactElement, btnClo: React.ReactElement) => React.ReactElement;
}
type IUpdate = (props: IProps) => void;
type IClose = () => void;
interface IBatchModal {
  update: IUpdate;
  close: IClose;
}
let batchModal: IBatchModal = {
  update: () => {},
  close: () => {},
};

interface INodeData {
  grade: string;
  type: string;
  name: string;
  id: string | number;
  schemaName: string;
  dataSourceType: string;
  serviceCode: string;
}
interface IIndex {
  tableObj?: INodeData;
}
interface IShowResults {
  success: boolean;
  data: model.TableToModelVO[];
}
const isTenantRole: boolean = isTenantRoleLevel();
export default ({ tableObj }: IIndex) => {
  const {
    getDataStore,
    storeData: { level },
  }: IBaseTableList = useContext<IBaseTableList>(Store as any).store;

  const [showResults, setShowResults] = useState<IShowResults>();
  const [editor, setEditor] = useState(true);
  const openTypeRef = useRef('');
  const isSubmitOkRef: any = useRef(null);
  useEffect(() => {
    upData();
  }, [showResults, openTypeRef.current]);
  const rightMenuDs: DataSet = useMemo(() => new DataSet(RightMenuDs()), []);
  const formDs = useMemo(
    () =>
      new DataSet({
        data: [
          {
            type: level === 'platform' && !isTenantRole ? 'PLATFORM_SHARED' : 'TENANT',
            assignPattern: 'BLOCK_LIST',
          },
        ],
        autoCreate: true,
        fields: [
          {
            label: '模型分类',
            name: 'type',
            required: true,
          },
          {
            name: 'assignPattern',
            label: (
              <React.Fragment>
                {/* <span>默认共享模式</span> */}
                <Tooltip
                  title="授权租户的默认共享模式，如需调整可在【模型授权租户】菜单下编辑。白名单模式选择的租户允许查看当前模型，黑名单模式仅限制选择的租户查看当前模型。"
                  placement="top"
                >
                  <span>默认共享模式</span>
                  {/* <ImgIcon
                    name="help.svg"
                    size={14}
                    style={{ margin: '0px 2px', marginBottom: 2 }}
                  /> */}
                </Tooltip>
              </React.Fragment>
            ),
            required: true,
            defaultValue: 'BLOCK_LIST',
          },
        ],
        events: {
          update: ({ value }) => {
            if (name === 'type') {
              if (value === 'PLATFORM_SHARED') {
                setEditor(true);
              } else {
                setEditor(false);
              }
            }
          },
        },
      }),
    [level, isTenantRole]
  );

  const positiveTableProps = {
    level,
    formDs,
    editor,
    tableObj,
    // setShowEmpty,
    rightMenuDs,
    modelDataObj: getDataStore('modelDataObj'),
  };
  const batchResultsProps = {
    showResults,
    tableObj,
  };

  type IFooterCom = (btnOk: React.ReactElement, btnClo: React.ReactElement) => React.ReactElement;
  const footerCom: IFooterCom = (btnOk, btnClo) => {
    return <div className={globalStyles['model-footer']}>{showResults ? btnClo : btnOk}</div>;
  };

  type IChildrenCom = () => React.ReactElement;
  const childrenCom: IChildrenCom = () => {
    if (showResults) {
      return <BatchResults {...batchResultsProps} />;
    }
    return <BatchModalFrame type={openTypeRef.current} {...positiveTableProps} />;
  };

  const upData = () => {
    if (batchModal?.update) {
      batchModal.update({
        children: childrenCom(),
        footer: footerCom,
      });
    }
  };

  const handleSave = async (): Promise<boolean> => {
    const val: boolean = await rightMenuDs.validate();
    if (val) {
      const type = formDs.current?.get('type');
      const assignPattern = formDs.current?.get('assignPattern');
      const body = rightMenuDs.toData().map((item: any) => {
        // fixme  ds的数据 后端确实没给
        const tableId = item.id; // 主键加密 所以id为字符串不能Number转化
        // eslint-disable-next-line no-param-reassign
        delete item?.id;
        return {
          ...item,
          type,
          tableId,
          assignPattern: type === 'PLATFORM_SHARED' ? assignPattern : null,
          schemaName: tableObj ? tableObj?.schemaName : item?.schemaName?.split('（')[0],
          dataSourceType: tableObj
            ? tableObj?.dataSourceType
            : item?.schemaName?.split('（')[1].slice(0, -1),
        };
      });
      if (!isEmpty(body)) {
        const res: model.TableToModelVO[] = await batchGenerationModelService({
          body,
        });
        if (res && (res as any).failed) {
          notification.error({
            message: '错误',
            description: (res as any).message,
          });
        } else {
          if (res === undefined) {
            return false;
          }
          if (((res || []) as any).length === 0) {
            notification.success({
              message: '成功',
              description: (
                <div className={styles['global-pro']}>
                  表生成逻辑模型成功！
                  {/* <a onClick={baseToManager}>可进入模型设计器内查看模型详情</a> */}
                </div>
              ),
            });
            // window.location.reload(); // 强制 刷新当前页
          } else {
            setShowResults({ success: (res || []).length === 0, data: res });
            return false;
          }
          return true;
        }
      } else {
        batchModal.close();
      }
    }
    return false;
  };

  const handleCose = () => {
    isSubmitOkRef.current = null;
    setShowResults(undefined);
    formDs.reset();
    rightMenuDs.removeAll();
  };

  /**
   * 批量创建 单模型创建入口
   * @param {*} type
   */
  type IOpenBatchModal = (type: string) => void;
  const openBatchModal: IOpenBatchModal = async (type) => {
    if (!isSubmitOkRef.current) {
      isSubmitOkRef.current = 'opening';
    } else if (isSubmitOkRef.current === 'opening') {
      return;
    }
    openTypeRef.current = type;
    batchModal = Modal.open({
      lowcodeSize: 'biggest',
      title: <div style={{ fontSize: '.18rem', fontWeight: 'bold' }}>生成逻辑模型</div>,
      key: batcheModalKey,
      destroyOnClose: true, // 关闭时是否销毁
      closable: true, // 显示右上角关闭按钮
      style: {
        zIndex: 999,
      },
      onOk: handleSave,
      okText: '完成',
      children: childrenCom(),
      footer: footerCom,
      afterClose: handleCose,
    });
  };

  useEffect(() => {
    upData();
  }, [level, editor]);

  if (tableObj) {
    return (
      <div onClick={openBatchModal.bind(null, '')}>
        <ImgIcon name="build-model.svg" size={16} style={{ width: 18, marginRight: '0.1rem' }} />
        <span>生成逻辑模型</span>
      </div>
    );
  }
  return (
    <div className={styles['batch-model-wrapper']}>
      <a onClick={openBatchModal.bind(null, 'batch')} className={`${styles['lowcode-aTag']}`}>
        {/* <Icon type="add" className={globalStyles.icon} /> */}
        <ImgIcon name="Model@v4.0.svg" size={14} style={{ marginRight: '5px' }} />
        <span style={{ color: '#29BECE' }}>批量生成逻辑模型</span>
      </a>
    </div>
  );
};
