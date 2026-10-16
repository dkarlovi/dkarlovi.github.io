---
title: A little light. A world of possibility.
summary: A draft demonstration of an article with a photographic palette, wide visuals and an
    interactive heading experiment.
publishedAt: 2026-10-16
draft: true
image:
    url: ../../assets/uploads/teambuilding.jpeg
    credit: Photograph by Dalibor Karlović
    position: 50% 45%
categories:
    - engineering
experience:
    headingExperiment: terrain
    stylesheet: terrain
---

This draft demonstrates the optional article experience. It is visible in development and excluded from the published site.

## Give the story room to breathe

The photograph sets the atmosphere. The reading column stays comfortable while images, code and other media can step outside it.

<figure>

![Sunlit golden meadow grasses with a group of people beyond](../../assets/uploads/teambuilding.jpeg)

<figcaption>A summer photograph by Dalibor Karlović.</figcaption>
</figure>

## A small vocabulary

<figure>

```typescript
const scene = {
    light: photograph.highlights,
    material: photograph.midtones,
    atmosphere: photograph.shadows,
};

function renderFrame(time: number) {
    const sunlight = Math.sin(time * 0.25) * 0.5 + 0.5;
    renderer.draw({ ...scene, light: scene.light.intensity(sunlight) });
}
```

<figcaption>A shared palette ties the scene to the story.</figcaption>
</figure>
