---
title: Hello World
slug: hello-world
summary: This is a summary
image: ./hello-world.webp
publishedAt: "2023-12-12"
draft: true
categories:
    - "@=yassg_get('categories', '/devops.md')"
series:
    - "@=yassg_get('series', '/a_specific_series.md')"
---

![Image]({{ yassg_thumbnail(item.image, {width: 800}) }})

Ahoy hoy!
