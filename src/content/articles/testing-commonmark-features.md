---
title: Testing Commonmark features
slug: testing-commonmark-features
summary: We are testing the Commonmark features
image:
    url: ../../assets/uploads/testing-commonmark-features-ar-sofa.webp
publishedAt: 2023-12-12
draft: false
categories:
    - programming
series:
    - a-specific-series
---

<div id="content-headings"></div>

# Headings

<div id="content-h1-heading-8-"></div>

# h1 Heading 8-)

<div id="content-h2-heading"></div>

## h2 Heading

<div id="content-h3-heading"></div>

### h3 Heading

<div id="content-h4-heading"></div>

#### h4 Heading

<div id="content-h5-heading"></div>

##### h5 Heading

<div id="content-h6-heading"></div>

###### h6 Heading

<div id="content-emphasis"></div>

# Emphasis

Emphasis, aka italics, with _asterisks_ or _underscores_.

Strong emphasis, aka bold, with **asterisks** or **underscores**.

Combined emphasis with **asterisks and _underscores_**.

Strikethrough uses two tildes. ~~Scratch this.~~

**This is bold text**

**This is bold text**

_This is italic text_

_This is italic text_

~~Strikethrough~~

<div id="content-lists"></div>

# Lists

1. First ordered list item
2. Another item
    - Unordered sub-list.
3. Actual numbers don't matter, just that it's a number
    1. Ordered sub-list
4. And another item.

    You can have properly indented paragraphs within list items. Notice the blank line above, and the leading spaces (at least one, but we'll use three here to also align the raw Markdown).

    To have a line break without a paragraph, you will need to use two trailing spaces.  
    Note that this line is separate, but within the same paragraph.  
    (This is contrary to the typical GFM line break behaviour, where trailing spaces are not required.)

- Unordered list can use asterisks

* Or minuses

- Or pluses
- But must use the same symbol to be considered the same list

1. Make my changes
    1. Fix bug
    2. Improve formatting
        - Make the headings bigger
2. Push my commits to GitHub
3. Open a pull request
    - Describe my changes
    - Mention all the members of my team
        - Ask for feedback

- Create a list by starting a line with `+`, `-`, or `*`
- Sub-lists are made by indenting 2 spaces:
    - Marker character change forces new list start:
    * Ac tristique libero volutpat at
        - Facilisis in pretium nisl aliquet
            - Nulla volutpat aliquam velit
- Very easy!

<div id="content-code--syntax-highlighting"></div>

# Code & Syntax Highlighting

Inline `code` has `back-ticks around` it.

```csharp
using System.IO.Compression;

#pragma warning disable 414, 3021

namespace MyApplication
{
    [Obsolete("...")]
    class Program : IInterface
    {
        public static List<int> JustDoIt(int count)
        {
            Console.WriteLine($"Hello {Name}!");
            return new List<int>(new int[] { 1, 2, 3 })
        }
    }
}
```

<figure>

```css
@font-face {
    font-family: Chunkfive;
    src: url("Chunkfive.otf");
}

body,
.usertext {
    color: #f0f0f0;
    background: #600;
    font-family: Chunkfive, sans;
}

@import url(print.css);
@media print {
    a[href^="http"]::after {
        content: attr(href);
    }
}
```

<figcaption>A bit of CSS never hurt anyone</figcaption>
</figure>

```javascript
function $initHighlight(block, cls) {
  try {
    if (cls.search(/\bno\-highlight\b/) != -1)
      return process(block, true, 0x0F) +
             ` class="${cls}"`;
  } catch (e) {
    /* handle exception */
  }
  for (var i = 0 / 2; i < classes.length; i++) {
    if (checkCondition(classes[i]) === undefined)
      console.log('undefined');
  }
}

export  $initHighlight;
```

```php
require_once 'Zend/Uri/Http.php';

namespace Location\Web;

interface Factory
{
    static function _factory();
}

abstract class URI extends BaseURI implements Factory
{
    abstract function test();

    public static $st1 = 1;
    const ME = "Yo";
    var $list = NULL;
    private $var;

    /**
     * Returns a URI
     *
     * @return URI
     */
    static public function _factory($stats = array(), $uri = 'http')
    {
        echo __METHOD__;
        $uri = explode(':', $uri, 0b10);
        $schemeSpecific = isset($uri[1]) ? $uri[1] : '';
        $desc = 'Multi
line description';

        // Security check
        if (!ctype_alnum($scheme)) {
            throw new Zend_Uri_Exception('Illegal scheme');
        }

        $this->var = 0 - self::$st;
        $this->list = list(Array("1"=> 2, 2=>self::ME, 3 => \Location\Web\URI::class));

        return [
            'uri'   => $uri,
            'value' => null,
        ];
    }
}

echo URI::ME . URI::$st1;

__halt_compiler () ; datahere
datahere
datahere */
datahere
```

<div id="content-links"></div>

# Links

[I'm an inline-style link](https://www.google.com)

[I'm an inline-style link with title](https://www.google.com "Google's Homepage")

[I'm a reference-style link][Arbitrary case-insensitive reference text]

[I'm a relative reference to a repository file](../blob/master/LICENSE)

[You can use numbers for reference-style link definitions][1]

Or leave it empty and use the [link text itself].

URLs and URLs in angle brackets will automatically get turned into links.
http://www.example.com or <http://www.example.com> and sometimes
example.com (but not on Github, for example).

Some text to show that the reference links can follow later.

[arbitrary case-insensitive reference text]: https://www.mozilla.org
[1]: http://slashdot.org
[link text itself]: http://www.reddit.com

<div id="content-images"></div>

# Images

Here's our logo (hover to see the title text):

Inline-style:
![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 1")

Reference-style:
![alt text][logo]

[logo]: https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 2"

![Minion](https://octodex.github.com/images/minion.png)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")

Like links, Images also have a footnote style syntax

![Alt text][id]

With a reference later in the document defining the URL location:

[id]: https://octodex.github.com/images/dojocat.jpg "The Dojocat"

<div id="content-thumbnails"></div>

# Thumbnails

Original image:

![A person wearing a headset while seated on a virtual sofa](../../assets/uploads/testing-commonmark-features-ar-sofa.webp)

Another standard Markdown image:

![A person wearing a headset while seated on a virtual sofa](../../assets/uploads/testing-commonmark-features-ar-sofa.webp)

Images adapt to the available content width:

![A person wearing a headset while seated on a virtual sofa](../../assets/uploads/testing-commonmark-features-ar-sofa.webp)

<div id="content-footnotes"></div>

# Footnotes

Footnote 1 link[^first].

Footnote 2 link[^second].

Inline footnote[^inline] definition.

[^inline]: Text of inline footnote

Duplicated footnote reference[^second].

[^first]: Footnote **can have markup**

    and `multiple` paragraphs.

[^second]: Footnote text.

<div id="content-tables"></div>

# Tables

Colons can be used to align columns.

| Tables        |      Are      |  Cool |
| ------------- | :-----------: | ----: |
| col 3 is      | right-aligned | $1600 |
| col 2 is      |   centered    |   $12 |
| zebra stripes |   are neat    |    $1 |

There must be at least 3 dashes separating each header cell.
The outer pipes (|) are optional, and you don't need to make the
raw Markdown line up prettily. You can also use inline Markdown.

| Markdown | Less      | Pretty     |
| -------- | --------- | ---------- |
| _Still_  | `renders` | **nicely** |
| 1        | 2         | 3          |

| First Header | Second Header |
| ------------ | ------------- |
| Content Cell | Content Cell  |
| Content Cell | Content Cell  |

| Command    | Description                                    |
| ---------- | ---------------------------------------------- |
| git status | List all new or modified files                 |
| git diff   | Show file differences that haven't been staged |

| Command      | Description                                        |
| ------------ | -------------------------------------------------- |
| `git status` | List all _new or modified_ files                   |
| `git diff`   | Show file differences that **haven't been** staged |

| Left-aligned | Center-aligned | Right-aligned |
| :----------- | :------------: | ------------: |
| git status   |   git status   |    git status |
| git diff     |    git diff    |      git diff |

| Name     | Character |
| -------- | --------- |
| Backtick | `         |
| Pipe     | \|        |

<div id="content-blockquotes"></div>

# Blockquotes

> Blockquotes are very handy in email to emulate reply text.
> This line is part of the same quote.

Quote break.

> This is a very long line that will still be quoted properly when it wraps. Oh boy let's keep writing to make sure this is long enough to actually wrap for everyone. Oh, you can _put_ **Markdown** into a blockquote.

> Blockquotes can also be nested...
>
> > ...by using additional greater-than signs right next to each other...
> >
> > > ...or with spaces between arrows.

<div id="content-collapsible-asides"></div>

# Collapsible Asides

You can create collapsible asides by using standard HTML `<details>` and `<summary>` elements:

<details class="collapsible-aside">
<summary>Click to expand this aside</summary>

This is the content inside the aside. It starts collapsed and expands when you click the title.

You can include **any markdown** or HTML content here:

- Lists
- Code blocks
- Images
- Whatever you need!

</details>

<details class="collapsible-aside">
<summary>Another example aside</summary>

Multiple asides work independently. Each one can be expanded or collapsed separately.

```javascript
console.log("Code works too!");
```

</details>
