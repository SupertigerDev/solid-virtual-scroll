import { createEffect, createMemo, createSignal, For, JSX } from "solid-js";

interface VirtualProps<T> {
  each: T[];
  children: (item: T, handle: (element: any, height: number) => void) => any;
}

const HEIGHT = 300;

const viewportCSS: JSX.CSSProperties = {
  position: 'relative',
  overflow: 'auto',
  background: 'black',
  height: HEIGHT + 'px',
  width: '300px',
}

interface Element {element: any, height: number, top: number}

export function VirtualScroll<T>(props: VirtualProps<T>) {
  const [scrollTop, setScrollTop] = createSignal<number>(0);
  const [totalHeight, setTotalHeight] = createSignal<number>(0);
  const [elements, setElements] = createSignal<Element[]>([]);

  createEffect(() => {
    let newTotalHeight = 0;
    const elementItems: Element[] = [];
    for (let i = 0; i < props.each.length; i++) {
      const item = props.each[i];
      props.children(item, (element, height) => {
        elementItems.push({element, height, top: newTotalHeight});
        newTotalHeight+= height;
      })
    }
    setTotalHeight(newTotalHeight);
    setElements(elementItems);
  })


  const displayElements = createMemo(() => {
    const PADDING = 5;
    const elms = elements();

    
    let topIndex = null;
    let bottomIndex = null;


    for (let i = 0; i < elms.length; i++) {
      const element = elms[i];
      const isTopOfViewport = element.top >= scrollTop();
      const isBottomOfViewport = element.top + element.height <= scrollTop() + HEIGHT;

      if (isTopOfViewport && topIndex === null) {
        topIndex = i;
      }
      
      if (isBottomOfViewport) {
        bottomIndex = i;
      }
    }

    let newStartIndex = topIndex! - PADDING;
    let newEndIndex = bottomIndex! + PADDING;
    if (newStartIndex < 0) newStartIndex = 0;
    if (newEndIndex > elms.length - 1) newEndIndex = elms.length - 1;

    const newElms = elms.slice(newStartIndex, newEndIndex + 1);

    return newElms;
  });

  const onScroll = (event: any) => {
    setScrollTop(event.target.scrollTop)
  }

  return (
    <div style={viewportCSS} onScroll={onScroll}>
      <div style={{height: totalHeight() + "px" }}>
        <For each={displayElements()}>
          {(item) => (
            <div style={{position: 'absolute', top: `${item.top}px`}}>{<item.element/>}</div>
          )}
        </For>
      </div>
    </div>
  )
}

