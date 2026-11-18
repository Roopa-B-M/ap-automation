import { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Select, Table, Tag, message } from "antd";
import api from "../api/axios";
import { useAuth } from "../AuthContext";

export default function Vendors() {
  const { user } = useAuth();
  const canWrite = ["ADMIN", "AP_CLERK"].includes(user?.role);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/vendors/");
      setVendors(data.results ?? data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openForm = (vendor = null) => {
    setEditing(vendor);
    form.resetFields();
    if (vendor) {
      form.setFieldsValue({ ...vendor, bank: vendor.bank_details?.[0] });
    }
    setOpen(true);
  };

  const onSave = async () => {
    const values = await form.validateFields();
    const { bank, ...rest } = values;
    const payload = { ...rest, bank_details: bank?.bank_name ? [{ ...bank, is_primary: true }] : [] };
    try {
      if (editing) await api.put(`/vendors/${editing.id}/`, payload);
      else await api.post("/vendors/", payload);
      message.success("Vendor saved");
      setOpen(false);
      load();
    } catch (err) {
      const data = err.response?.data;
      message.error(data ? JSON.stringify(data) : "Save failed");
    }
  };

  const colors = { ACTIVE: "green", PENDING: "orange", BLOCKED: "red" };

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "GSTIN", dataIndex: "gstin" },
    { title: "Email", dataIndex: "email" },
    { title: "Status", dataIndex: "status", render: (s) => <Tag color={colors[s]}>{s}</Tag> },
    {
      title: "Bank",
      render: (_, r) => r.bank_details?.[0] ? `${r.bank_details[0].bank_name} (${r.bank_details[0].ifsc})` : "-",
    },
    ...(canWrite
      ? [{ title: "Action", render: (_, r) => <Button size="small" onClick={() => openForm(r)}>Edit</Button> }]
      : []),
  ];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Vendors</h2>
        {canWrite && <Button type="primary" onClick={() => openForm()}>Add Vendor</Button>}
      </div>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={vendors} />

      <Modal title={editing ? "Edit Vendor" : "Add Vendor"} open={open} onOk={onSave} onCancel={() => setOpen(false)} okText="Save">
        <Form form={form} layout="vertical" initialValues={{ status: "PENDING" }}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item
            name="gstin"
            label="GSTIN"
            rules={[
              { required: true },
              { pattern: /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/, message: "Invalid GSTIN format" },
            ]}
          >
            <Input maxLength={15} style={{ textTransform: "uppercase" }} />
          </Form.Item>
          <Form.Item name="pan" label="PAN"><Input maxLength={10} /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: "email" }]}><Input /></Form.Item>
          <Form.Item name="phone" label="Phone"><Input /></Form.Item>
          <Form.Item name="status" label="Status">
            <Select options={[
              { value: "PENDING", label: "Pending" },
              { value: "ACTIVE", label: "Active" },
              { value: "BLOCKED", label: "Blocked" },
            ]} />
          </Form.Item>
          <Form.Item name={["bank", "bank_name"]} label="Bank name"><Input /></Form.Item>
          <Form.Item name={["bank", "account_number"]} label="Account number"><Input /></Form.Item>
          <Form.Item name={["bank", "ifsc"]} label="IFSC"><Input maxLength={11} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}