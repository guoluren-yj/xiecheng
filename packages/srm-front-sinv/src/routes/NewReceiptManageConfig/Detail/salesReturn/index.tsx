/**
 * index.js 收货管理配置-新
 * @date: 2022-11-14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React, { FC, useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import { DataSet, Table, Modal, Button } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import intl from 'srm-front-boot/lib/utils/intl/index.js';
import notification from 'hzero-front/lib/utils/notification';
import { getResponse } from 'hzero-front/lib/utils/utils/index';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils/user';

import { useMount } from '@/utils/utils';
import { handleDelete, handleSave } from '@/services/receiptManageConfigService';

import { indexDS } from './indexDS';

const organizationId = getCurrentOrganizationId();


    interface IndexProps{
        ref?: any;
        workFlag: boolean,
    }

    interface SalesProps{
        retRef?: any,
        workFlag: boolean,
        nodeConfigId?: string | number;
        reverseConfigId?: string | number;
    }

    interface BtnProps {
        dataSet?: DataSet;
        selected?: any,
    }

const ReturnModal:FC<IndexProps>= forwardRef((props: SalesProps, ref: any)=> {
    const { reverseConfigId, workFlag } = props;
        const [loading,setBtnLoading] =useState(false)
        const ds = useMemo(() => new DataSet(indexDS()), []);

        useMount(() => {
            ds.setQueryParameter('params', {
                nodeConfigType: 0,
                reverseConfigId,
                asyncCountFlag: 'DEFAULT',
            });
            ds.query();
        });

        useImperativeHandle(ref, () => ({
            ref: ref,
            ds,
            handleSaveLine,
        }));

    const handleSaveLine = async() => {
        const flag = await ds.validate();
        if (flag) {
            try {
                const list = ds.toData();
                const res = await handleSave(list, 'return');
                if (getResponse(res)) {
                    (notification as any).success();
                     ds.query();
                }
            } catch (e) {
                throw(e)
            }
        }
        }

        const handleDeleteReturn = (dataSet) => {
            const lines = dataSet?.selected.map((item: any) => item.toData()) || [];
            const deleteFlag = lines.some((i) => i.mappingId);
            if (deleteFlag) {
                if (!isEmpty(lines)) {
                  Modal.confirm({
                    children: intl.get('sinv.receiptManage.view.message.delete').d('确认删除选中行？'),
                    onOk: async () => {
                      try {
                        setBtnLoading(true);
                        const res = getResponse(await handleDelete(lines, 'system'));
                        if (res) {
                          (notification as any).success();
                          dataSet.query();
                        }
                      } catch (e) {
                       throw(e)
                      } finally {
                        setBtnLoading(false);
                      }
                    },
                  });
                }
              } else {
                dataSet.remove(dataSet.selected);
              }
        };
        const buttons = (lineDs) => {
            const Buttons = observer((propsParam: BtnProps): any => {
                const { dataSet } = propsParam;
                const selected = dataSet?.selected.map((item: any) => item.toData());
                const btns = [
                  <>
                    <Button
                      icon="add"
                      loading={loading}
                      funcType={FuncType.flat}
                      color={ButtonColor.primary}
                      onClick={() => dataSet?.create({
                        workFlag,
                          nodeConfigType: 0,
                          tenantId: organizationId,
                          nodeConfigId: reverseConfigId,
                      }, 0)}
                    >
                      {intl.get('hzero.common.button.create').d('新建')}
                    </Button>
                    <Button
                      icon="delete"
                      loading={loading}
                      funcType={FuncType.flat}
                      color={ButtonColor.primary}
                      disabled={isEmpty(selected)}
                      onClick={() => handleDeleteReturn(dataSet)}
                    >
                      {intl.get('hzero.common.button.enter').d('删除')}
                    </Button>
                  </>,
                ];
                return btns;
            });
            return [<Buttons dataSet={lineDs} />];
        };

        const columns = [
            {
              name: 'externalSystemCode',
              width: 160,
              editor: (record) => !(record.get('trxLineCount') > 0),
            },
            {
              name: 'rcvTypeCode',
              width: 160,
              editor: (record) => !(record.get('trxLineCount') > 0),
            },
            {
              name: 'rcvTypeName',
              editor: true,
            },
            {
              name: 'attachmentUuid',
              editor: true,
            },
        ];
        return (
          <Table
            dataSet={ds}
            columns={columns}
            buttons={buttons(ds)}
          />
        );
});

export function salesReturn(props: SalesProps) {
    const { reverseConfigId, nodeConfigId, retRef, workFlag } = props;
    const modalProps = {
        reverseConfigId,
        nodeConfigId,
        workFlag,
    };
    Modal.open({
        mask: true,
        drawer: true,
        closable: true,
        style: { width: '852px' },
        children: <ReturnModal ref={retRef} {...modalProps} />,
        title: intl.get('sinv.receiptManage.model.receipt.returnTypeFix').d('退货类型维护'),
        okText: intl.get(`hzero.common.model.sure`).d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: async() => {
           await retRef?.current?.handleSaveLine();
            return false;
        }
    });
};
