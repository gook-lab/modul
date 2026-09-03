import { forwardRef } from 'react';
import type {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ElementType,
  ForwardRefRenderFunction,
  PropsWithoutRef,
  ReactElement,
} from 'react';

type AsProp<C extends ElementType> = { as?: C };
type PropsToOmit<C extends ElementType, P> = keyof (AsProp<C> & P);

/** Own props + as + 해당 태그의 모든 네이티브 속성 (Own 과 충돌하는 키만 제외) */
export type PolymorphicProps<C extends ElementType, Own = object> =
  Own & AsProp<C> & Omit<ComponentPropsWithoutRef<C>, PropsToOmit<C, Own>>;

export type PolymorphicRef<C extends ElementType> = ComponentPropsWithRef<C>['ref'];

export type PolymorphicComponent<Default extends ElementType, Own = object> =
  <C extends ElementType = Default>(props: PolymorphicProps<C, Own> & { ref?: PolymorphicRef<C> }) => ReactElement | null;

/** 렌더 함수 + displayName. forwardRef 결과에 displayName 을 붙일 수 있게 교차 타입으로 돌려준다. */
export type PolymorphicComponentWithName<Default extends ElementType, Own = object> =
  PolymorphicComponent<Default, Own> & { displayName?: string };

/**
 * React.forwardRef 는 렌더 함수의 제네릭(C)을 지우고 ElementType 으로 고정합니다.
 * 그래서 다형 컴포넌트의 렌더 함수는 forwardRef 의 파라미터 타입을 통과하지 못합니다(TS 한계).
 * 캐스팅은 이 함수 한 곳에서만 하고, 컴포넌트 쪽에서는 as 캐스팅을 쓰지 않습니다.
 */
export function polyForwardRef<Default extends ElementType, Own = object>(
  render: <C extends ElementType = Default>(
    props: PolymorphicProps<C, Own>,
    ref: PolymorphicRef<C>,
  ) => ReactElement | null,
): PolymorphicComponentWithName<Default, Own> {
  const wrapped = forwardRef(
    render as unknown as ForwardRefRenderFunction<unknown, PropsWithoutRef<PolymorphicProps<ElementType, Own>>>,
  );
  return wrapped as unknown as PolymorphicComponentWithName<Default, Own>;
}

/**
 * 데이터 제네릭(<T>)을 가진 컴포넌트용. forwardRef 는 T 도 같은 이유로 지웁니다.
 * Table 처럼 행 타입을 그대로 살려야 하는 컴포넌트가 씁니다.
 */
export function genericForwardRef<C extends (...args: never[]) => unknown>(component: unknown): C {
  return component as C;
}

/**
 * 다형이 아닌 컴포넌트용 props 결합. Own 과 이름이 겹치는 네이티브 속성만 제외합니다.
 *
 * 교차(`Own & ComponentPropsWithoutRef<'div'>`)로 두면 이름이 겹칠 때 두 타입의 교집합이 되어
 * `children: (data: T) => ReactNode` 가 `ReactNode` 와 교차되며 호출할 수 없는 타입이 됩니다
 * (`title`, `onChange`, `onSelect` 도 같은 문제). Own 이 이기고 나머지 네이티브 속성은
 * 그대로 `...rest` 로 흘러가야 헤드리스 계약이 유지됩니다.
 */
export type NativeProps<E extends ElementType, Own> =
  Own & Omit<ComponentPropsWithoutRef<E>, keyof Own>;
