const mock = `{
  "user_info_list":
  [
      {
          "name":
          {
              "familyname": "苏",
              "givenname": "玛丽"
          },
          "age": 18,
          "position":
          {
              "department": "市场部",
              "post": "顾问"
          },
          "education":
          {
              "secondary": "伊顿公学",
              "post_secondary":
              {
                  "bachelor":
                  {
                      "institute": "威廉姆斯文理学院",
                      "degrees": ["marketing", "fine art"]
                  },
                  "master":
                  {
                      "institute": "哈尔滨佛学院",
                      "degrees": ["theology"]
                  },
                  "phd":
                  {
                      "institute": null,
                      "degrees": []
                  }
              }
          }
      },
      {
          "name":
          {
              "familyname": "龙",
              "givenname": "傲天"
          },
          "age": 12,
          "position":
          {
              "department": "董事会",
              "post": "董事"
          },
          "education":
          {
              "secondary": null,
              "post_secondary":
              {
                  "bachelor":
                  {
                      "institute": null,
                      "degrees": []
                  },
                  "master":
                  {
                      "institute": null,
                      "degrees": []
                  },
                  "phd":
                  {
                      "institute": null,
                      "degrees": []
                  }
              }
          }
      }
  ],
  "copy_to": ["dept_marketing", "dept_finance", "dept_information", "dept_legal"],
  "least_permission_level": 5,
  "meta":
  {
      "system": "MAGI#CASPER-3",
      "initiated_time": "2015-06-22",
      "deadline": null
  },
  "children":
  {

  }
}`;

export default mock;
