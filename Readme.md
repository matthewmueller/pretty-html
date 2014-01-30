
# pretty-html

  html logging that's easy on the eyes.

  **HTML View:**

  [html view](https://i.cloudup.com/6zFvalrj3D.png)

  **Text View:**

  [text view](https://i.cloudup.com/3v6N5qYaMv.png)

## Installation

  Install with [component(1)](http://component.io):

    $ component install matthewmueller/pretty-html

## Example

```js
// html format
out.innerHTML = pretty(document.body).html();

// text format
console.log(pretty(document.body).text());
```

## API

### `pretty(dom)`

Add the DOM node you want to format.

### `pretty.html()`

Return a formatted html string of the element, showing all text and element nodes. The output's style is completely customizable. Take a look at `pretty.css` to see some of the options.

### `pretty.text()`

Return a formatted text string of the element, showing all text and element nodes.

## License

  MIT
