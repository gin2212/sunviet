import React, { useState, useEffect } from "react";
import { Col, Container, Row } from "reactstrap";
import { message, Input, Button, Form, Space, Select, Checkbox } from "antd";
import {
  getAllAction,
  getAllRole,
  getPagingRoleAction,
  insertManyRoleAction,
} from "../../services/api";

const { Option } = Select;
const CheckboxGroup = Checkbox.Group;

const getAllData = async (_prams) => {
  const params = _prams
    ? _prams
    : {
        pageIndex: 1,
        pageSize: 100000,
        search: "",
      };
  const dataRes = await getPagingRoleAction(params);
  if (!dataRes.data || dataRes.data.length === 0) {
    return [];
  }
  const data =
    dataRes?.data &&
    dataRes?.data.length > 0 &&
    dataRes?.data.map((item) => {
      return {
        key: item._id,
        roleName: item.role?.roleName,
        actionName: item.action?.actionName,
      };
    });
  return dataRes?.data ? data : [];
};

const RoleActions = () => {
  document.title = "Management RoleActions";

  const [form] = Form.useForm();
  const [listRole, setListRole] = useState([]);
  const [listAction, setListAction] = useState([]);
  const [listActionRole, setListActionRole] = useState([]);

  const [checkedList, setCheckedList] = useState([]);
  const [indeterminate, setIndeterminate] = useState(true);
  const [checkAll, setCheckAll] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const dataRes = await getAllData();
      setListActionRole(dataRes);

      //get role
      const resListRole = await getAllRole();
      setListRole(resListRole);

      //get action
      const resListAction = await getAllAction();
      const listAction = resListAction
        ?.sort((a, b) => a.actionName.localeCompare(b.actionName))
        .map((item) => {
          return item;
        });
      setListAction(listAction);
    }

    fetchData();
  }, []);

  const onFinish = async (data) => {
    const reqListAction = checkedList?.map((itemChecked, i) => {
      return listAction?.filter((item) => itemChecked === item.actionName);
    });

    const dataReq = {
      role: data.role,
      actions: reqListAction
        ?.map((item) => {
          return item[0]._id;
        })
        .toString(),
    };

    const dataRes = await insertManyRoleAction(dataReq);
    dataRes.status === 1
      ? message.success(`Lưu thành công!`)
      : message.error(`Lưu thất bại!`);
  };

  const handleRefresh = async () => {
    form.resetFields();
    setCheckedList([]);
  };

  const onChange = (list) => {
    setCheckedList(list);
    setIndeterminate(!!list.length && list.length < listAction.length);
    setCheckAll(list.length === listAction.length);
  };

  const onCheckAllChange = (e) => {
    const _listAction = listAction?.map((item) => {
      return item.actionName;
    });
    setCheckedList(e.target.checked ? _listAction : []);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };

  const onChangeRole = async (value) => {
    const params = {
      pageIndex: 1,
      pageSize: 1000,
      roleId: value,
    };
    const dataRes = await getAllData(params);
    const checkedList = dataRes?.map((item) => {
      return item.actionName;
    });
    setCheckedList(checkedList);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col xs={12}>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
              >
                <Row>
                  <Col hidden={true}>
                    <Form.Item name="id" label="Id">
                      <Input name="id" />
                    </Form.Item>
                  </Col>
                  <Col sm={12}>
                    <Form.Item
                      name="role"
                      label="Quyền người dùng"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn một quyền!",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Chọn một quyền..."
                        allowClear
                        showSearch
                        name="role"
                        onChange={onChangeRole}
                      >
                        {listRole.length > 0 &&
                          listRole.map((item) => {
                            return (
                              <Option key={item._id} value={item._id}>
                                {item.roleName}
                              </Option>
                            );
                          })}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col sm={12}>
                    <Form.Item name="action" label="Action">
                      <Space
                        direction="vertical"
                        size="middle"
                        style={{ display: "flex" }}
                      >
                        <Checkbox
                          indeterminate={indeterminate}
                          onChange={onCheckAllChange}
                          checked={checkAll}
                        >
                          Chọn tất cả
                        </Checkbox>
                        <CheckboxGroup
                          options={listAction?.map((item) => ({
                            label: item.actionLabel,
                            value: item.actionName,
                          }))}
                          value={checkedList}
                          onChange={onChange}
                          className="list-role-actions"
                        />
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item className="mt-3">
                  <Space>
                    <Button type="primary" htmlType="submit">
                      Lưu
                    </Button>

                    <Button
                      type="primary"
                      htmlType="button"
                      onClick={() => handleRefresh()}
                    >
                      Làm mới trang
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default RoleActions;
