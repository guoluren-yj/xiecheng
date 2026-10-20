bidding_supplement_price_start_flag` tinyint(1) DEFAULT '0' COMMENT '补充单价截止即开始标识(竞价大厅专用字段)',
  `bidding_supplement_price_running_duration_flag` tinyint(1) DEFAULT '0' COMMENT '补充单价设置运行时间标识 1:设置运行时间,0:设置报价截止时间(竞价大厅专用字段)',
  `bidding_supplement_price_start_date` datetime DEFAULT NULL COMMENT '补充开始时间(竞价大厅专用字段)',
  `bidding_supplement_price_running_duration` decimal(20,2) DEFAULT NULL COMMENT '补充单价运行时间(竞价大厅专用字段)',
  `bidding_supplement_price_end_date` datetime DEFAULT NULL COMMENT '补充单价截止时间(竞价大厅专用字段)',


biddingSupplementPriceStartDate
biddingSupplementPriceEndDate
