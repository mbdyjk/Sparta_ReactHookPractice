let currentHook = 0; // 현재 hook 인덱스
let hooks = []; // 모든 hooks를 배열 형태로 관리

const useState = (initialValue) => {
  // 기존 상태 값을 갖거나, undefined일 경우 초기값을 가지게 한다.
  hooks[currentHook] = hooks[currentHook] || initialValue;
  // 현재 훅 index를 고정하여 조건문 등에 의해 실행 순서가 바뀌는 경우 방지
  const hookIndex = currentHook;
  const setState = (newState) => {
    if (typeof newState === "function") {
      hooks[hookIndex] = newState(hooks[hookIndex]);
    } else {
      hooks[hookIndex] = newState;
    }
  };
  // 현재 상태 값 및 상태 업데이트 함수 반환
  // 다음 index의 hook에 대해 시행
  return [hooks[currentHook++], setState];
};

const useEffect = (callback, depArray) => {
  const hasNoDeps = !depArray; // 의존성 배열이 없으면 true
  const prevDeps = hooks[currentHook] ? hooks[currentHook].deps : undefined; // 이전 의존성 배열
  const prevCleanUp = hooks[currentHook]
    ? hooks[currentHook].cleanUp
    : undefined; // 이전 클린업 함수

  // 의존성 배열이 변경되었는지 확인
  const hasChangedDeps = prevDeps
    ? !depArray.every((el, i) => el === prevDeps[i])
    : true;

  // 의존성 배열이 없거나 변경된 경우,
  if (hasNoDeps || hasChangedDeps) {
    if (prevCleanUp) prevCleanUp(); // 이전 클린업 함수 실행
    const cleanUp = callback(); // 현재 콜백 함수 실행 후 클린업 함수에 저장
    hooks[currentHook] = { deps: depArray, cleanUp }; // 현재 훅에 의존성 배열과 클린업 함수 저장
  }
  currentHook++; // 다음 훅으로
};

const MyReact = {
  render(Component) {
    // 컴포넌트 인스턴스 생성 후 render 메서드 실행
    const instance = Component();
    instance.render();
    currentHook = 0; // hook 인덱스 0으로 초기화
    return instance;
  },
};

MyReact.useState = useState;
MyReact.useEffect = useEffect;

export { useState, useEffect };
export default MyReact;
