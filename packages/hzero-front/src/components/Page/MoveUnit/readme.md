

              ## MoveUnit组件

### 调用方式
```

  const [leftListL, , leftListMoveUnitProps] = useMoveUnitData({
    leftMax: 500,
    leftMin: 200,
  });


  useEffect(() => {
    let width = leftListL - 8; // 可以不-8
    width = Math.max(216, Math.min(width, 500)); // 可以不判断
    setW(width);
  }, [leftListL]);


<MoveUnit
                {...leftListMoveUnitProps}
                pageRef={pageRef}
                style={{
                  right: 0,
                }}
              />
```

### 参数说明

