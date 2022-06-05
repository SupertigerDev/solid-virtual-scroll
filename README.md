# Solid Virtual Scroll
Note: This library is not production ready yet!

## Usage
```tsx
handle(Item, height)
```

```tsx
import { createSignal } from "solid-js";
import { VirtualScroll } from "./VirtualScroll";

export default function App() {
  const [items, setItems] = createSignal<number[]>([]);

  for (let i = 0; i < 10000; i++) {
    setItems([...items(), i])    
  }

  return (
    <VirtualScroll each={items()}>
      {(item, handle) => {
        if (item % 4 === 0) handle(() => <Header/>, 23);
        else handle(() => <Item i={item}/>, 15);
      }}
    </VirtualScroll>
  );
};

function Item(props: {i: number}) {
  return <div>Item {props.i}</div>
}

function Header() {
  return <div style={{"font-size": "20px"}}>Header</div>
}
```
