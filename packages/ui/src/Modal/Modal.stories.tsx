import { useEffect, useRef, useState } from 'react';
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

/**
 * 열린 상태. 지금까지 Modal 스토리는 트리거 버튼만 렌더해서 axe 가 모달 내용을
 * 한 번도 검사하지 않았습니다. 닫힌 <dialog> 가 보이던 버그(2026-09-04)도 그래서
 * CI 에서만 드러났습니다.
 */
export const Open: S = {
  args: { danger: true },
  render: a => {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => { ref.current?.showModal(); }, []);
    return (
      <Modal {...a} ref={ref} open onClose={() => {}} aria-describedby="m-open-body">
        <p id="m-open-body">이 작업은 되돌릴 수 없습니다. 연결된 12개의 화면도 함께 삭제됩니다.</p>
        <ModalActions confirm="삭제" onConfirm={() => {}} onCancel={() => {}} />
      </Modal>
    );
  },
};
