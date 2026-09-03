import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal, ModalActions } from './Modal';
import { Button } from '../Button/Button';

const meta: Meta<typeof Modal> = { title: 'Components/Modal', component: Modal, args: { title: '프로젝트를 삭제할까요?', danger: false } };
export default meta;
type S = StoryObj<typeof Modal>;
export const Default: S = {
  render: a => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>모달 열기</Button>
        <Modal {...a} open={open} onClose={() => setOpen(false)} aria-describedby="m-body">
          <p id="m-body">이 작업은 되돌릴 수 없습니다. 연결된 12개의 화면도 함께 삭제됩니다.</p>
          <ModalActions confirm={a.danger ? '삭제' : '확인'} onConfirm={() => setOpen(false)} onCancel={() => setOpen(false)} />
        </Modal>
      </>
    );
  },
};
export const Danger: S = { ...Default, args: { danger: true } };
