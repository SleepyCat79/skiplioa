import { useState } from "react";
import { Modal, Input, Typography } from "antd";
import { MailOutlined } from "@ant-design/icons";
import useBoardStore from "@/stores/boardStore";
import { useMessage } from "@/hooks/useMessage";

interface Props {
  boardId: string;
  open: boolean;
  onClose: () => void;
}

export default function InviteModal({ boardId, open, onClose }: Props) {
  const message = useMessage();
  const { inviteMember } = useBoardStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await inviteMember(boardId, email.trim());
      message.success(`Invitation sent to ${email}`);
      setEmail("");
      onClose();
    } catch {
      message.error("Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Invite Member"
      open={open}
      onCancel={() => {
        setEmail("");
        onClose();
      }}
      onOk={handleInvite}
      okText="Send Invitation"
      confirmLoading={loading}
    >
      <Typography.Paragraph type="secondary" className="mb-4">
        Enter the email address of the person you want to invite to this board.
      </Typography.Paragraph>
      <Input
        prefix={<MailOutlined />}
        placeholder="colleague@example.com"
        size="large"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onPressEnter={handleInvite}
      />
    </Modal>
  );
}
