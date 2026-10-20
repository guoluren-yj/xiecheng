### 双单位改造
##### 
1. 修改两个字段名，辅助单位和辅助数量字段名去替换原来的单位和数量字段名
2. 增加两个字段，基本单位和基本数量，用原来的单位和数量字段名，设置为不可编辑
3. 将之前所有的逻辑替换到新的字段名上也就是辅助单位和数量上
   ```
         {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'uomIdLov',
        type: 'object',
        ignore: 'always',
        textField: 'uomName',
        valueField: 'uomId',
        dynamicProps: {
          disabled({ dataSet, record }) {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            const { setting000112 = null } = dataSet.queryParameter.settings || {};
            return (setting000112 === '1' && record.get('itemCode')) || allowChangeItemsFlag;
          },
          required: ({ dataSet }) => {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return !allowChangeItemsFlag;
          },
          lovCode: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag&&record?.get('itemId') ? 'SMDM_ITEM_ORG_UOM' : 'SSRC.UOM';
          },
          lovPara: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag&&record?.get('itemId') ? {itemId: record?.get('itemId'), primaryUomId: record.get('uomId')}: {};
          },
        },
      },
   ```
4. 调是否开启双单位的接口，赋给这个标识doubleUnitFlag，并把这个标识传到ds里面方便控制update逻辑
   ```
    queryDoubleUnit = async () => {
    const res = await queryEnableDoubleUnit(this.bidFlag ? 'BID' :'RFX');
    this.setState({
      doubleUnitFlag: !!Number(res),
    });
    this.ItemLineTableDS.setState('doubleUnitFlag', !!Number(res));}
注意要判断新招标（这点后面得统一）
5. 针对基本单位，如果开启了双单位，就根据物料lov去set单位和基本单位，如果没有开启双单位，就需要根据物料lov和辅助单位lov去设置基本单位
6. 针对基本数量，如果有物料id且开启了双单位，判断是否有辅助数量和辅助单位，有才调api（calculateBasicQty方法）；否则将数量设置到基本数量上
````
  const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
        if(doubleUnitFlag&&record.get('itemId')){
          // 物料lov和单位lov任意一个变动都重新计算基本数量
          if(['itemIdLov', 'uomIdLov'].includes(name)){
            if(name==='itemIdLov'&&value){
              record.set('secondaryUomId', value.secondaryUomId || value.uomId);
              record.set('secondaryUomName', value.secondaryUomName || value.uomName);
              record.set('uomId', value.uomId);
              record.set('uomName', value.uomName);
            }
            if(name==='uomIdLov'&&value){
              record.set('secondaryUomId', value.uomId || null);
              record.set('secondaryUomName', value.uomName || null);
            }
            if(record.get('secondaryQuantity')&&record.get('secondaryUomId')){
              calculateBasicQty({
                secondaryQuantity: record.get('secondaryQuantity'),
                itemId: record.get('itemId'),
                businessKey: record.get('rfxLineItemId') || record.id,
                doublePrimaryUomId: record.get('uomId'),
                secondaryUomId: record.get('secondaryUomId'),
              }).then(res=>{
                if(res){
                  record.set('rfxQuantity', res);
                  record.setState('calculateError', false);
                }else{
                  record.set('rfxQuantity', '');
                  record.setState('calculateError', true);
                }
              });
            }
          }
        }else{
          // 没有物料或者双单位没开启直接将数量给到基本数量
          record.set('rfxQuantity', record.get('secondaryQuantity'));
          // 没有物料直接选择单位lov赋值给基本单位
          // 有物料但是未开启双单位，基本单位跟着单位走
          if(name==='itemIdLov'&&value){
            record.set('secondaryUomId', value.orderUomId || value.primaryUomId);
            record.set('secondaryUomName', value.orderUomName || value.uomName);
            record.set('uomId', value.orderUomId || value.primaryUomId);
            record.set('uomName', value.orderUomName || value.uomName);
          }
          if(name==='uomIdLov'&&value){
            record.set('secondaryUomId', (value || {}).uomId || null);
            record.set('secondaryUomName', (value || {}).uomCodeAndName || null);
            record.set('uomId', (value || {}).uomId || null);
            record.set('uomName', (value || {}).uomCodeAndName || null);
          }
        }
  ````
  在精度组件的事件里面单独去根据数量计算基本数量，因为精度组件会触发两次ds的update
  ```
    if(record.get('itemId') && doubleUnitFlag){
        if(record.get('secondaryUomId')){
          const res = await calculateBasicQty({
            secondaryQuantity: record.get('secondaryQuantity'),
            itemId: record.get('itemId'),
            businessKey: record.get('rfxLineItemId') || record.id,
            doublePrimaryUomId: record.get('uomId'),
            secondaryUomId: record.get('secondaryUomId'),
          });
          if(res){
            record.set('rfxQuantity', res);
            record.setState('calculateError', false);
          }else{
            record.set('rfxQuantity', '');
            record.setState('calculateError', true);
          }
        }
      }else{
        record.set('rfxQuantity', value);
      }
  ```
  7. 如果数量是精度组件，要把精度的字段进行修改为辅助单位
  8. 只读页面只需要增加两个字段基本单位基本数量用双单位标识控制显隐即可




  ##### 双单位新改动
  1. 原来是隐藏基本数量和单位，现在隐藏新增的secondary字段

  ```
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        dataIndex: 'secondaryQuantity',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('secondaryQuantity', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  // disabled={record.prNum}
                  type="hzero"
                  uom={record.$form.getFieldValue('secondaryUomId')}
                  min={0}
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                  onBlur={(e) => this.changeSecondaryQuantity(e, record)}
                />
              )}
              {!doubleUnitFlag
                ? record.$form.getFieldDecorator('requiredQuantity', {
                    initialValue: record.requiredQuantity,
                  })
                : null}
            </Form.Item>
          ) : (
            numberSeparatorRender(val)
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        dataIndex: 'secondaryUomId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('secondaryUomId', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
                    }),
                  },
                ],
              })(
                <Lov
                  code={
                    doubleUnitFlag && record.$form.getFieldValue('itemId')
                      ? 'SMDM_ITEM_ORG_UOM'
                      : 'SSRC.UOM'
                  }
                  textValue={
                    record.$form.getFieldValue('secondaryUomName') || record.secondaryUomName
                  }
                  disabled={record.prNum}
                  queryParams={
                    doubleUnitFlag && record.$form.getFieldValue('itemId')
                      ? {
                          itemId: record.$form.getFieldValue('itemId'),
                          primaryUomId: record.$form.getFieldValue('uomId'),
                        }
                      : {}
                  }
                  onChange={(value, dataList) => this.changeUomId(value, dataList, record)}
                />
              )}
              {record.$form.getFieldDecorator('secondaryUomName', {
                initialValue: record.secondaryUomName,
              })}
              {!doubleUnitFlag
                ? record.$form.getFieldDecorator('uomId', {
                    initialValue: record.uomId,
                  })
                : null}
              {!doubleUnitFlag
                ? record.$form.getFieldDecorator('uomName', {
                    initialValue: record.uomName,
                  })
                : null}
            </Form.Item>
          ) : (
            record.secondaryUomName
          ),
      },
            doubleUnitFlag
        ? {
            title: intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量'),
            dataIndex: 'requiredQuantity',
            width: 120,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) && !detailFlag ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('requiredQuantity', {
                    initialValue: val,
                  })(
                    <PrecisionInputNumber
                      disabled
                      type="hzero"
                      uom={record.$form.getFieldValue('uomId')}
                      min={0}
                      max="99999999999999999999"
                      style={{ width: '100%' }}
                    />
                  )}
                </Form.Item>
              ) : (
                numberSeparatorRender(val)
              ),
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
            dataIndex: 'uomId',
            width: 150,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) && !detailFlag ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('uomId', {
                    initialValue: val,
                  })(
                    <Lov
                      code="SSRC.UOM"
                      textValue={record.$form.getFieldValue('uomName') || record.uomName}
                      disabled
                    />
                  )}
                  {record.$form.getFieldDecorator('uomName', {
                    initialValue: record.uomName,
                  })}
                </Form.Item>
              ) : (
                record.uomName
              ),
          }
        : null,

  ```

 #### 改成
  ````
      doubleUnitFlag
        ? {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        dataIndex: 'secondaryQuantity',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('secondaryQuantity', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  // disabled={record.prNum}
                  type="hzero"
                  uom={record.$form.getFieldValue('secondaryUomId')}
                  min={0}
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                  onBlur={(e) => this.changeSecondaryQuantity(e, record)}
                />
              )}
            </Form.Item>
          ) : (
            numberSeparatorRender(val)
          ),
      } : null,
      doubleUnitFlag
        ? {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        dataIndex: 'secondaryUomId',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) && !detailFlag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('secondaryUomId', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
                    }),
                  },
                ],
              })(
                <Lov
                  code={
                    doubleUnitFlag && record.$form.getFieldValue('itemId')
                      ? 'SMDM_ITEM_ORG_UOM'
                      : 'SSRC.UOM'
                  }
                  textValue={
                    record.$form.getFieldValue('secondaryUomName') || record.secondaryUomName
                  }
                  disabled={record.prNum}
                  queryParams={
                    doubleUnitFlag && record.$form.getFieldValue('itemId')
                      ? {
                          itemId: record.$form.getFieldValue('itemId'),
                          primaryUomId: record.$form.getFieldValue('uomId'),
                        }
                      : {}
                  }
                  onChange={(value, dataList) => this.changeUomId(value, dataList, record)}
                />
              )}
              {record.$form.getFieldDecorator('secondaryUomName', {
                initialValue: record.secondaryUomName,
              })}
            </Form.Item>
          ) : (
            record.secondaryUomName
          ),
      } : null,
      {
            title: intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量'),
            dataIndex: 'requiredQuantity',
            width: 120,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) && !detailFlag ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('requiredQuantity', {
                    initialValue: val,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量'),
                        }),
                      },
                    ],
                  })(
                    <PrecisionInputNumber
                      disabled={doubleUnitFlag || record.prNum}
                      type="hzero"
                      uom={record.$form.getFieldValue('uomId')}
                      min={0}
                      max="99999999999999999999"
                      style={{ width: '100%' }}
                    />
                  )}
                  {!doubleUnitFlag
                ? record.$form.getFieldDecorator('secondaryQuantity', {
                    initialValue: record.secondaryQuantity,
                  })
                : null}
                </Form.Item>
              ) : (
                numberSeparatorRender(val)
              ),
        },
        {
            title: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
            dataIndex: 'uomId',
            width: 150,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) && !detailFlag ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('uomId', {
                    initialValue: val,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SSRC.UOM"
                      disabled={doubleUnitFlag || record.prNum}
                      textValue={record.$form.getFieldValue('uomName') || record.uomName}
                    />
                  )}
                  {record.$form.getFieldDecorator('uomName', {
                    initialValue: record.uomName,
                  })}
                  {!doubleUnitFlag
                ? record.$form.getFieldDecorator('secondaryUomId', {
                    initialValue: record.secondaryUomId,
                  })
                : null}
                  {!doubleUnitFlag
                ? record.$form.getFieldDecorator('secondaryUomName', {
                    initialValue: record.secondaryUomName,
                  })
                : null}
                </Form.Item>
              ) : (
                record.uomName
              ),
      },
  ````

  ##### c7n
  ```
       {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
        type: 'number',
        min: '0.000001',
        max: '99999999999999999999',
        // step: 0.000001,
        dynamicProps: {
          required: ({ dataSet }) => {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return !allowChangeItemsFlag;
          },
          disabled: ({ dataSet }) => {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return allowChangeItemsFlag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomIdLov',
        type: 'object',
        ignore: 'always',
        textField: 'uomName',
        valueField: 'uomId',
        dynamicProps: {
          disabled({ dataSet, record }) {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            const { setting000112 = null } = dataSet.queryParameter.settings || {};
            return (setting000112 === '1' && record.get('itemCode')) || allowChangeItemsFlag;
          },
          required: ({ dataSet }) => {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return !allowChangeItemsFlag;
          },
          lovCode: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag && record?.get('itemId') ? 'SMDM_ITEM_ORG_UOM' : 'SSRC.UOM';
          },
          lovPara: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag && record?.get('itemId')
              ? { itemId: record?.get('itemId'), primaryUomId: record.get('uomId') }
              : {};
          },
        },
      },
      {
        name: 'secondaryUomName',
        bind: 'secondaryUomIdLov.uomName',
      },
      {
        name: 'secondaryUomId',
        bind: 'secondaryUomIdLov.uomId',
      },
      {
        label: intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量'),
        name: 'rfxQuantity',
        type: 'number',
        max: '99999999999999999999',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
        name: 'uomIdLov',
        type: 'object',
        ignore: 'always',
        textField: 'uomName',
        valueField: 'uomId',
        disabled: true,
        lovCode: 'SSRC.UOM',
      },
      {
        name: 'uomName',
        bind: 'uomIdLov.uomName',
      },
      {
        name: 'uomId',
        bind: 'uomIdLov.uomId',
      },
  ```
      改成
  ```
                 {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
        type: 'number',
        min: '0.000001',
        max: '99999999999999999999',
        // step: 0.000001,
        dynamicProps: {
          required: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return doubleUnitFlag && !allowChangeItemsFlag;
          },
          disabled: ({ dataSet }) => {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return allowChangeItemsFlag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomIdLov',
        type: 'object',
        ignore: 'always',
        textField: 'uomName',
        valueField: 'uomId',
        dynamicProps: {
          disabled({ dataSet, record }) {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            const { setting000112 = null } = dataSet.queryParameter.settings || {};
            return (setting000112 === '1' && record.get('itemCode')) || allowChangeItemsFlag;
          },
          required: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return doubleUnitFlag && !allowChangeItemsFlag;
          },
          lovCode: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag && record?.get('itemId') ? 'SMDM_ITEM_ORG_UOM' : 'SSRC.UOM';
          },
          lovPara: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag && record?.get('itemId')
              ? { itemId: record?.get('itemId'), primaryUomId: record.get('uomId') }
              : {};
          },
        },
      },
      {
        name: 'secondaryUomName',
        bind: 'secondaryUomIdLov.uomName',
      },
      {
        name: 'secondaryUomId',
        bind: 'secondaryUomIdLov.uomId',
      },
      {
        label: intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量'),
        name: 'rfxQuantity',
        type: 'number',
        min: '0.000001',
        max: '99999999999999999999',
        dynamicProps: {
          required: ({ dataSet }) => {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return !allowChangeItemsFlag;
          },
          disabled: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return doubleUnitFlag || allowChangeItemsFlag;
          },
        },
      },
      {
        label: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
        name: 'uomIdLov',
        type: 'object',
        ignore: 'always',
        textField: 'uomName',
        valueField: 'uomId',
        lovCode: 'SSRC.UOM',
        dynamicProps: {
          disabled({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            const { setting000112 = null } = dataSet.queryParameter.settings || {};
            return doubleUnitFlag || (setting000112 === '1' && record.get('itemCode')) || allowChangeItemsFlag;
          },
          required: ({ dataSet }) => {
            const { allowChangeItemsFlag = 0 } = dataSet.queryParameter.headers || {};
            return !allowChangeItemsFlag;
          },
        },
      },
      {
        name: 'uomName',
        bind: 'uomIdLov.uomName',
      },
      {
        name: 'uomId',
        bind: 'uomIdLov.uomId',
      },
```


```
              {
          name: 'secondaryQuantity',
          width: 120,
          align: 'left',
          editor: (record) => {
            return (
              <C7nPrecisionInputNumber
                name="secondaryQuantity"
                record={record}
                // dataSet={itemLineTableDS}
                uom="secondaryUomId"
                onChange={(val) => changeRfxQuantity(val, record, 'secondaryQuantity')}
              />
            );
          },
          renderer: ({ record, value }) =>
            numberSeparatorRender(value, record.getState('uom_precision')),
        },
        {
          editor: true,
          name: 'secondaryUomIdLov',
          width: 150,
          ignore: 'always',
        },
        doubleUnitFlag
          ? {
              name: 'rfxQuantity',
              editor: (record) => {
                return <C7nPrecisionInputNumber name="rfxQuantity" record={record} uom="uomId" />;
              },
              renderer: ({ record, value }) =>
                numberSeparatorRender(value, record.getState('uom_precision')),
            }
          : null,
        doubleUnitFlag
          ? {
              editor: true,
              name: 'uomIdLov',
              width: 150,
            }
          : null,
```
      改成
```
              doubleUnitFlag
          ? {
              name: 'secondaryQuantity',
              width: 120,
              align: 'left',
              editor: record => {
                return (
                  <C7nPrecisionInputNumber
                    name="secondaryQuantity"
                    record={record}
                    // dataSet={itemLineTableDS}
                    uom="secondaryUomId"
                    onChange={val => changeRfxQuantity(val, record, 'secondaryQuantity')}
                  />
                );
              },
              renderer: ({ record, value }) =>
                numberSeparatorRender(value, record.getState('uom_precision')),
            }
          : null,
        doubleUnitFlag
          ? {
              editor: true,
              name: 'secondaryUomIdLov',
              width: 150,
              ignore: 'always',
            }
          : null,
        {
          name: 'rfxQuantity',
          editor: record => {
            return <C7nPrecisionInputNumber name="rfxQuantity" record={record} uom="uomId" />;
          },
          renderer: ({ record, value }) =>
            numberSeparatorRender(value, record.getState('uom_precision')),
        },
        {
          editor: true,
          name: 'uomIdLov',
          width: 150,
        },
  ```


  ```
             // 没有物料或者双单位没开启直接将数量给到基本数量
          record.set('rfxQuantity', secondaryQuantity);
          // 没有物料直接选择单位lov赋值给基本单位
          // 有物料但是未开启双单位，基本单位跟着单位走
          if (name === 'itemIdLov' && value) {
            record.set('secondaryUomId', value.orderUomId || value.primaryUomId);
            record.set('secondaryUomName', value.orderUomName || value.uomName);
            record.set('uomId', value.orderUomId || value.primaryUomId);
            record.set('uomName', value.orderUomName || value.uomName);
          }
          if (name === 'secondaryUomIdLov') {
            record.set('secondaryUomId', (value || {}).uomId || null);
            record.set('secondaryUomName', (value || {}).uomCodeAndName || null);
            record.set('uomId', (value || {}).uomId || null);
            record.set('uomName', (value || {}).uomCodeAndName || null);
          }
  ```
      改成
  ```
          // 没有物料或者双单位没开启直接将数量给到基本数量
          if(doubleUnitFlag && !itemId){
            record.set('rfxQuantity', secondaryQuantity);
          }
          // 没有物料直接选择单位lov赋值给基本单位
          // 有物料但是未开启双单位，基本单位跟着单位走
          if (name === 'itemIdLov' && value) {
            record.set('secondaryUomId', value.orderUomId || value.primaryUomId);
            record.set('secondaryUomName', value.orderUomName || value.uomName);
            record.set('uomId', value.orderUomId || value.primaryUomId);
            record.set('uomName', value.orderUomName || value.uomName);
          }
          if (name === 'secondaryUomIdLov') {
            record.set('secondaryUomId', (value || {}).uomId || null);
            record.set('secondaryUomName', (value || {}).uomCodeAndName || null);
            record.set('uomId', (value || {}).uomId || null);
            record.set('uomName', (value || {}).uomCodeAndName || null);
          }
  ```

  2. 单价字段类似，单价要看一下有没有change事件的一些逻辑，之前把这个都换成辅助的现在要判断字段，用utils里面的getApplicationWord工具函数
  3. 之前把基本的逻辑都移到辅助上面，改的时候要在当前文件夹搜一下辅助的字段，涉及到只有辅助的逻辑需要改一下，辅助基本都有类似清空这样的就不用动
  4. 明细页只要把控制双单位的逻辑移到辅助的字段上面就行
  5. 字段名称待定， 用getUomName/getQtyName等utils里面函数
















  ###### 明细页双单位开发
  1. ssrc/new-project-setup/detail 在routers.js 去搜这个路由找到对应的文件
  2. 定位到我们需要修改的页面具体是哪个组件
  3. 主要看表格的columns属性， 找到columns这个数据,看这个数组中doubleUnitFlag这关键字， doubleUnitFlag目前都在基本的字段上面，然后移到他对应的增加的辅助字段上面，如果有标识但不存在对应的字段记得找我确认要不要改
  columns里面如果 ['update', 'create'].includes(record._status) 这种的update,create这是维护页和我们明细页的修改没关系
  4. 还有就是基本字段的名称变化，在src/utils/utils.js里面有多语言
  5. 遇到c7n的明细页要把doubleUnitFlag标识传到ds中去改label， h0的页面直接改columns里面的title即可

  #### h0改造点
```

      doubleUnitFlag
      ? {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        dataIndex: 'secondaryQuantity',
        width: 120,
        render: numberSeparatorRender,
      }:null,
      doubleUnitFlag
      ? {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        dataIndex: 'secondaryUomName',
        width: 150,
      } : null,
 {
            title: getUomName(doubleUnitFlag),
            dataIndex: 'requiredQuantity',
            width: 120,
            render: numberSeparatorRender,
          },
     {
            title: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
            dataIndex: 'uomName',
            width: 150,
          },
```

#### c7n改造点
##### 函数式组件
```
ds初始化传参数
  const quotationLineDS = useMemo(
    () =>
      new DataSet(
        quotationLineDataSet({
          bidFlag,
          documentTypeName,
          quotationName,
          organizationId,
          doubleUnitFlag,
        })
      ),
    [pathname, search, bidFlag, documentTypeName, quotationName, organizationId, doubleUnitFlag]
  );
  找到ds函数

const quotationLineDataSet = (options = {}) => {
  const { quotationName, doubleUnitFlag = false } = options;


  改对应的label
    {
        label: getQuantityAndUomCombine(doubleUnitFlag),
        name: 'quantityAndUomCombine',
      },


  改对应的columns
        doubleUnitFlag ？ {
              name: 'secondaryQuantityAndUomCombine',
              width: 120,
              renderer: ({ record }) => {
                const { secondaryUomName, secondaryQuantity } = record?.get([
                  'secondaryUomName',
                  'secondaryQuantity',
                ]);
                return secondaryQuantity && secondaryUomName
                  ? `${numberSeparatorRender(secondaryQuantity)}-${secondaryUomName}`
                  : secondaryQuantity || secondaryUomName;
              },
            } : null,
       {
              name: 'quantityAndUomCombine',
              width: 140,
              renderer: ({ record }) => {
                const { uomName, rfxQuantity } = record?.get(['uomName', 'rfxQuantity']);
                return rfxQuantity && uomName
                  ? `${numberSeparatorRender(rfxQuantity)}-${uomName}`
                  : rfxQuantity || uomName;
              },
            } ,
    把对应的基本字段上面的三元表达式移到上面的辅助字段上面
```


#### 分支 feature-pre-124813-detail

