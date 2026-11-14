"use client";

import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  onError: () => void;
};

type State = { failed: boolean };

/**
 * WebGL veya model yükleme hatasında 3D katmanı sessizce kaldırır; poster ve
 * sayfa içeriği olduğu gibi kalır. Ziyaretçiye teknik ayrıntı gösterilmez.
 */
export class ModelErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError();
    if (process.env.NODE_ENV !== "production") {
      console.warn("[HeroModel] 3D model gösterilemedi; poster kullanılıyor.", error);
    }
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
