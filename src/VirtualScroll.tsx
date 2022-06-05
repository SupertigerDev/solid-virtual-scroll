import {
  Accessor,
  batch,
  createComputed,
  createSignal,
  For,
  JSX,
  mapArray,
  Setter,
} from 'solid-js';

interface VirtualProps<T> {
  each: T[];
  children: (
    item: T,
    handle: (element: () => JSX.Element, height: number | Accessor<number>) => void,
  ) => any;
}

const HEIGHT = 300;

const viewportCSS: JSX.CSSProperties = {
  position: 'relative',
  overflow: 'auto',
  background: 'black',
  height: HEIGHT + 'px',
  width: '300px',
};

interface ElementData {
  readonly element: () => JSX.Element;
  readonly height: number;
  readonly top: Accessor<number>;
  readonly setTop: Setter<number>;
}

export function VirtualScroll<T>(props: VirtualProps<T>) {
  const [scrollTop, setScrollTop] = createSignal<number>(0);
  const [totalHeight, setTotalHeight] = createSignal<number>(0);
  const [displayElements, setDisplayElements] = createSignal<ElementData[]>([]);

  const allElements = mapArray<T, ElementData>(
    () => props.each,
    (item) => {
      let element!: () => JSX.Element;
      let height!: number | Accessor<number>;
      props.children(item, (_element, _height) => {
        (element = _element), (height = _height);
      });

      const [top, setTop] = createSignal(0);

      return {
        element,
        top,
        setTop,
        // set height as getter if it is reactive
        ...(typeof height === 'number'
          ? { height }
          : {
              get height() {
                return (height as Accessor<number>)();
              },
            }),
      };
    },
  );

  createComputed(() =>
    batch(() => {
      const PADDING = 5;
      const elms = allElements();

      let newTotalHeight = 0;
      let topIndex = null;
      let bottomIndex = null;

      for (let i = 0; i < elms.length; i++) {
        const element = elms[i];
        const isTopOfViewport = newTotalHeight >= scrollTop();
        const isBottomOfViewport = newTotalHeight + element.height <= scrollTop() + HEIGHT;

        if (isTopOfViewport && topIndex === null) {
          topIndex = i;
        }

        if (isBottomOfViewport) {
          bottomIndex = i;
        }

        // update signal value within element data object
        element.setTop(newTotalHeight);
        // tracks height signal if reactive
        newTotalHeight += element.height;
      }

      let newStartIndex = topIndex! - PADDING;
      let newEndIndex = bottomIndex! + PADDING;
      if (newStartIndex < 0) newStartIndex = 0;
      if (newEndIndex > elms.length - 1) newEndIndex = elms.length - 1;

      setDisplayElements(elms.slice(newStartIndex, newEndIndex));
      setTotalHeight(newTotalHeight);
    }),
  );

  const onScroll = (event: any) => {
    setScrollTop(event.target.scrollTop);
  };

  return (
    <div style={viewportCSS} onScroll={onScroll}>
      <div style={{ height: totalHeight() + 'px' }}>
        <For each={displayElements()}>
          {(item) => (
            <div style={{ position: 'absolute', top: `${item.top()}px` }}>{item.element()}</div>
          )}
        </For>
      </div>
    </div>
  );
}
